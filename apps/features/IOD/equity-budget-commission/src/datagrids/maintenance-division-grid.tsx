import { useState, useCallback } from 'react';
import DataGrid, { Column, Editing, Popup, Selection, Button, Form, Item, Toolbar,LoadPanel, FilterRow, Scrolling, DataGridTypes, RequiredRule} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { MaintenanceDivision } from '../datatypes/budget-maintenance-types';
import { useDivisions} from '../hooks/useDivisionData';
import { useUserInfo } from '@platform/utils';
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType} from '../components/toast-config'
import { Item as FormItem } from 'devextreme-react/form';
import { ValidationMessage } from '../components/validations-message';
import './styles.scss';

// Exported handlers for isolated testing  
const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {  
  e.component.editRow(e.rowIndex);
};  

const handleDataError = (
  showToast: (message: string, type: ToastType) => void
  ) => (e: DataGridTypes.DataErrorOccurredEvent) => {
  showToast(`Failed: An API error occurred. ${e.error?.message}`, 'error');
};

const renderStatusCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {  
  const isActive = cellData.value === 'Active';  
  const statusText = isActive ? 'Active' : 'Inactive';  
  
  return (  
    <div className='grid-container-flex'>  
      <CheckBox value={isActive} disabled={true} />  
      <span>{statusText}</span>  
    </div>  
  );  
};  

const MaintenanceDivisionGrid: React.FC = () => {
  const [popupTitle, setPopupTitle] = useState('');
  const userInfo = useUserInfo();
  const {
    divisions,
    reload,
    addDivision,
    modifyDivision,
    removeDivision
  } = useDivisions({userInfo: userInfo})

  const [toastConfig, setToastConfig] = useState<ToastConfig>({
      visible: false,
      message: '',
      type: 'info', 
    });
  
  const showToast = useCallback((message: string, type: ToastType) => {
    setToastConfig({
      visible: true,
      message,
      type,
    });
  }, []);
  
  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };
    
  const onRowDblClick = useCallback(onRowDblClickHandler, []);     
  const renderStatusCellCallback = useCallback(renderStatusCell, []); 

  const handleEditingStart = () => {
        setPopupTitle('Edit Divison');
    };
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceDivision>) => {
      setPopupTitle('New Division');
      e.data.active = true;
    };

  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);  
  

  const onSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenanceDivision, number>) => {
      if (!e.changes?.length) return;

      // Prevent the DataGrid from applying changes to your array datasource.
      e.cancel = true;

      e.promise = (async () => {
        try {
          // In popup mode, usually one change at a time; handle all to be safe.
          for (const change of e.changes) {
            if (change.type === 'insert') {
              await addDivision(change.data as MaintenanceDivision);
              showToast('New Division added successfully!', 'success');
            }

            if (change.type === 'update') {
              await modifyDivision(change.key as number, change.data as Partial<MaintenanceDivision>);
              showToast('Division data updated successfully!', 'success');
            }

            if (change.type === 'remove') {
              await removeDivision(change.key as number);
              showToast('Division deleted successfully!', 'success');
            }
          }

          // Single refresh after processing changes
          await reload();

          // Close popup + clear edit state
          e.component.cancelEditData();
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          // Keep edit state so user can correct and retry
        }
      })();
    },
    [addDivision, modifyDivision, removeDivision, reload, showToast]
  );
 
  return (
    <div className="nested-tab-container">
      <div className='grid-container-smallest'> 
        <DataGrid
          dataSource={divisions}
          keyExpr="divisionId" // Unique key for each item
          allowColumnResizing={true}
          allowColumnReordering={true}
          showBorders={true}
          rowAlternationEnabled={true}
          paging={{enabled:false}}
          onRowDblClick={onRowDblClick}
          onSaving={onSaving}
          onEditingStart={handleEditingStart}
          onInitNewRow={handleInitNewRow}
          remoteOperations={false}
          repaintChangesOnly={true}
          onDataErrorOccurred={onDataErrorOccurred} // Bind the error handler
          hoverStateEnabled={true}
          focusedRowEnabled={true}
        >        
        <Scrolling mode="infinite" columnRenderingMode='virtual' />
        <LoadPanel enabled={true} />
        <FilterRow visible={true} applyFilter="auto" />
        <Editing
          mode="popup"
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={true}
          useIcons={true}
        >
          <Popup showTitle={true} title={popupTitle} width="30%" height="25%" wrapperAttr= {{ className:'custom-popup-class' }} />
          <Form colCount={1} width="90%">
              <FormItem dataField="active" label={{text:"Active"}} editorType="dxCheckBox" />
              <FormItem name="divisionName" />
            </Form>
        </Editing>

        <Selection mode="single" selectByClick={true} />

        <Column dataField="divisionId" caption= "Division Id" allowFiltering={false} allowEditing={false} width= "10%" allowSorting={true} alignment="left" dataType="number"/>   /
        <Column dataField="divisionName" caption= "Division Name" allowFiltering={true}  width= "35%" allowSorting={true} dataType="string">
            <RequiredRule message={ValidationMessage.RequiredField} />          
        </Column>
        <Column dataField="status" caption= "Status" width= "10%" allowFiltering={true} allowSorting={true} dataType="string" filterOperations={["startswith","="]} cellRender={renderStatusCellCallback}/>   
        <Column dataField="lastUpdateDate" caption= "Last Update Dt" allowFiltering={false} allowEditing={false} width= "20%" allowSorting={true} dataType="date" format="MM/dd/yyyy hh:mm a"/>   
        <Column dataField="lastUpdateBy" caption= "Last Update By" allowFiltering={true} allowEditing={false} width= "20%" allowSorting={true} dataType="string"/>    
        <Column dataField="active" visible={false} />
        <Column type="buttons" width="5%">
              <Button name="edit" visible={false} />
              <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Division" visible={true} />
        </Column>
        <Toolbar>
          <Item name="addRowButton" location="before" showText="always" options={{ icon: 'plus', text:'Add'}} />
          {/* ... other toolbar items */}
        </Toolbar>
        </DataGrid>
      </div>
      {/* Render the Toast component */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        width={400}
        type={toastConfig.type}
        position="bottom center"
        onHidden={hideToast} // Hide the toast when its display time is over
        displayTime={3000} // Display duration in milliseconds (3 seconds)                
      />
      </div>
  );
};

export default MaintenanceDivisionGrid;