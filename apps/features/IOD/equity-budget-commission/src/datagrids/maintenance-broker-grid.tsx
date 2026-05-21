import { useState, useCallback} from 'react';
import DataGrid, { Column, DataGridTypes, Editing, Popup, Selection, Button, Form, Item, Toolbar,LoadPanel, Lookup, FilterRow, Scrolling, RequiredRule } from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { MaintenanceBroker } from '../datatypes/budget-maintenance-types';
import { useUserInfo } from '@platform/utils';
import { Toast } from 'devextreme-react/toast';
import { useBrokers} from '../hooks/useBrokerData';
import { ToastConfig, ToastType} from '../components/toast-config'
import { Item as FormItem } from 'devextreme-react/form';
import { ValidationMessage } from '../components/validations-message';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

type DataErrorOccurredEvent  = DataGridTypes.DataErrorOccurredEvent;

// Exported handlers for isolated testing  
export const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {  
  e.component.editRow(e.rowIndex);  
};  

export const handleDataError = (showToast: (message: string, type: ToastType) => void) => (e: DataErrorOccurredEvent) => {  
  showToast(`Failed: An API error occurred. ${e.error?.message}`, 'error');  
};  
  
export const handleRowInserted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('New Broker added successfully!', 'success');  
};  
  
export const handleRowUpdated = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('Broker data updated successfully!', 'success');  
};  
  
export const handleRowDeleted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('Broker deleted successfully!', 'success');  
};  

export const renderStatusCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {  
  const isActive = cellData.value === 'Active';  
  const statusText = isActive ? 'Active' : 'Inactive';  
  
  return (  
    <div className='grid-container-flex'>  
      <CheckBox value={isActive} disabled={true} />  
      <span>{statusText}</span>  
    </div>  
  );  
}; 

const MaintenanceBrokerGrid: React.FC = () => {
  const [popupTitle, setPopupTitle] = useState('');
  const userInfo = useUserInfo();
  const {
    brokers,
    masterBrokers,
    reload,
    addBroker,
    modifyBroker,
    removeBroker,
    isAdmin
  } = useBrokers({userInfo})

  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'info', 
  });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToastConfig({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  }, []);
  
  const onRowDblClick = useCallback((e: DataGridTypes.RowDblClickEvent) => {
    if (!isAdmin) return;

    onRowDblClickHandler(e);  
  }, [isAdmin]); 
  
  const renderStatusCellCallback = useCallback(renderStatusCell, []); 

  const handleEditingStart = () => {
        setPopupTitle('Edit Broker');
        // You can also access e.data to get the row data being edited
  };
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceBroker>) => {
        setPopupTitle('New Broker');
        e.data.active = true;
  };

  // This event is triggered when the CustomStore's promise rejects
  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);  
  
  const onSaving = useCallback(
  (e: DataGridTypes.SavingEvent<MaintenanceBroker, number>) => {
    if (!e.changes?.length) return;

    // CRITICAL: prevents the DataGrid from applying changes to the array dataSource
    e.cancel = true; // SavingEvent supports cancel/promise [1](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxDataGrid/Types/SavingEvent/)[3](https://github.com/DevExpress/DevExtreme/issues/13636)

    // Let DataGrid await our async work (keeps popup busy correctly)
    e.promise = (async () => {
      try {
        for (const change of e.changes) {
          if (change.type === 'insert') {
            await addBroker(change.data as Partial<MaintenanceBroker>);
            showToast('New Broker added successfully!', 'success');
          } else if (change.type === 'update') {
            await modifyBroker(change.key as number, change.data as Partial<MaintenanceBroker>);
            showToast('Broker data updated successfully!', 'success');
          } else if (change.type === 'remove') {
            await removeBroker(change.key as number);
            showToast('Broker deleted successfully!', 'success');
          }
        }

        // Single refresh = single source of truth
        await reload();

        // Close popup / clear edit state
        e.component.cancelEditData();
      } catch (err) {
        showToast(`Save error: ${(err as Error).message}`, 'error');
      }
    })();
  },
  [addBroker, modifyBroker, removeBroker, reload, showToast]
);

  return (
    <div>      
      <div className='grid-container-small'> 
        <DataGrid
          dataSource={brokers}
          keyExpr="brokerId"// Unique key for each item
          allowColumnResizing={true}
          allowColumnReordering={true}
          showBorders={true}
          rowAlternationEnabled={true}
          paging={{enabled:false}}
          onRowDblClick={onRowDblClick}
          onSaving={onSaving}
          onEditingStart={handleEditingStart}
          onInitNewRow={handleInitNewRow}
          //height={700}
          width="90%"
          remoteOperations={false}
          repaintChangesOnly={true}
          onDataErrorOccurred={onDataErrorOccurred} // Bind the error handler
          hoverStateEnabled={true}
          focusedRowEnabled={true}
        >        
        <Scrolling mode="infinite" columnRenderingMode="virtual" />
        <LoadPanel enabled={true}  />
        <FilterRow visible={true} applyFilter="auto"/>
        <Editing
          mode="popup"
          allowUpdating={isAdmin? true: false} 
          allowAdding={isAdmin? true: false} 
          allowDeleting={isAdmin? true: false} 
          useIcons={true}          
        >
          <Popup showTitle={true} title={popupTitle} width="30%" height="30%" wrapperAttr= {{ className:'custom-popup-class' }} />
            <Form width="90%" colCount={1}>
              <FormItem dataField="active" label={{ text: "Active" }} editorType="dxCheckBox" />
              <FormItem name="brokerName" editorType="dxTextBox" />
              <FormItem name="brokerCode"  editorType="dxTextBox" />
              <FormItem name="masterBrokerId" editorType="dxSelectBox" cssClass='dx-common-selectbox'/>
            </Form>
            
        </Editing>

        <Selection mode="single" selectByClick={true} />

        <Column  dataField="brokerId" caption= "Id" allowEditing={false} visible={false} allowSorting={true} alignment="left" dataType="number"/> 
        <Column  dataField="brokerName" caption= "Broker Name"  width= "25%" allowFiltering={true} allowSorting={true} dataType="string">
            <RequiredRule message={ValidationMessage.RequiredField} />
        </Column>   
        <Column  dataField="brokerCode" caption= "Broker Code" allowFiltering={true}  width= "10%" allowSorting={true} dataType="string"/>   
        <Column  dataField="masterBrokerId" caption= "Master Broker Name" allowFiltering={true} width= "25%" allowSorting={true} dataType="string">
            <Lookup dataSource={masterBrokers} valueExpr="masterBrokerId" displayExpr="masterBrokerName" />
            <RequiredRule message={ValidationMessage.RequiredField} />
        </Column>   
        <Column  dataField="status" caption= "Status" width= "10%" allowFiltering={true} allowSorting={true} dataType="string" filterOperations={["startswith","="]} cellRender={renderStatusCellCallback}/>   
        <Column  dataField="lastUpdateDate" caption= "Last Update Dt" allowEditing={false} allowFiltering={false} width= "15%" allowSorting={true} dataType="date" format="MM/dd/yyyy hh:mm a"/>   
        <Column  dataField="lastUpdateBy" caption= "Last Update By" allowEditing={false} allowFiltering={true} width= "10%" allowSorting={true} dataType="string"/>    
        <Column dataField="active" visible={false} />
        <Column type="buttons" width="5%" visible={isAdmin? true: false} >
              <Button name="edit" visible={false} />
              <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Broker" visible={true} />
        </Column>
        <Toolbar visible={isAdmin? true: false} >
          <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
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

export default MaintenanceBrokerGrid;