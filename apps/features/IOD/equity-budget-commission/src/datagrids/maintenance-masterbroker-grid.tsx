import { useState, useCallback } from 'react';  
import DataGrid, { Column, Editing, Popup, Selection, Button, Form, Item, Toolbar, LoadPanel, Lookup, FilterRow, Scrolling, DataGridTypes,
  RequiredRule, StringLengthRule } from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { useUserInfo } from '@platform/utils';
import { MaintenanceMasterBroker } from '../datatypes/budget-maintenance-types';
import { useMasterBrokers } from '../hooks/useMasterBrokerData';
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType} from '../components/toast-config'
import { ValidationMessage } from '../components/validations-message';
import { Item as FormItem } from 'devextreme-react/form';
import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

// Exported handlers for isolated testing  
const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {  
  e.component.editRow(e.rowIndex);  
};  

const handleDataError = (
  showToast: (message: string, type: ToastType) => void
  ) => (e: DataGridTypes.DataErrorOccurredEvent) => {  
  showToast(`Failed: An API error occurred. ${e.error?.message}`, 'error');  
};  
  
const handleRowInserted = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {  
  showToast('New Master Broker added successfully!', 'success');  
};  
  
const handleRowUpdated = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {  
  showToast('Master Broker data updated successfully!', 'success');  
};  
  
const handleRowDeleted = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {  
  showToast('Master Broker deleted successfully!', 'success');  
};  

const renderStatusCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {  
  const isActive = cellData.value === "Active" || cellData.value === "A";  
  const statusText = isActive ? 'Active' : 'Inactive';  
  
  return (  
    <div className='grid-container-flex'>  
      <CheckBox value={isActive} disabled={true} />  
      <span>{statusText}</span>  
    </div>  
  );  
};  

const MaintenanceMasterBrokerGrid: React.FC = () => {
  const [popupTitle, setPopupTitle] = useState('');
  const userInfo = useUserInfo();
  const {
    masterBrokers,
    aladMasterBrokers,
    reload,
    addMasterBroker,
    modifyMasterBroker,
    removeMasterBroker,
    isAdmin
  } = useMasterBrokers({userInfo: userInfo})
  
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
      visible: false,
      message: '',
      type: 'info', 
    });
  
  const showToast = (message: string, type: ToastType) => {
    setToastConfig({
      visible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  //Check duplicate name validations
  function checkDuplicateName(data: MaintenanceMasterBroker){
    const isExist = masterBrokers.find(x=> x.masterBrokerName == data.masterBrokerName && x.ID != data.ID);
    return isExist;
  }

  const onRowDblClick = useCallback((e: DataGridTypes.RowDblClickEvent) => {
     if (!isAdmin) return;
 
     onRowDblClickHandler(e);  
   }, [isAdmin]); 
  
  const renderStatusCellCallback = useCallback(renderStatusCell, []);  

  const handleEditingStart = () => {
        setPopupTitle('Edit Master Broker');
        // You can also access e.data to get the row data being edited
    };
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceMasterBroker>) => {
        setPopupTitle('New Master Broker');
        e.data.active = true;
    };

  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);  

  const onSaving = useCallback(async (e: DataGridTypes.SavingEvent<MaintenanceMasterBroker, number>) => {
      // If no changes, do nothing
      if (!e.changes || e.changes.length === 0) return;

      // Prevent grid from mutating the array
      e.cancel = true;

      try {      
        for (const change of e.changes) {
          const { type, key, data } = change;

          if (type === 'insert') {
            const newData = data as MaintenanceMasterBroker;

            if (!newData.masterBrokerId) {
              throw new Error('You must select Aladdin Master Broker.');
            }

            if (checkDuplicateName(newData)) {
              throw new Error(ValidationMessage.MasterBroker.DuplicateNameExists);
            }

            await addMasterBroker(newData);
            handleRowInserted(showToast)();
          }

          if (type === 'update') {
            // change.data only contains changed fields; merge with old data for validation checks
            const oldRow = e.component.byKey(key) as unknown as MaintenanceMasterBroker | undefined;

            const merged: MaintenanceMasterBroker = {
              ...(oldRow ?? ({} as MaintenanceMasterBroker)),
              ...(data as Partial<MaintenanceMasterBroker>),
              ID: key as number,
            };

            // Validate masterBrokerId: either exists in merged or oldRow
            if (!merged.masterBrokerId) {
              throw new Error('You must select Aladdin Master Broker.');
            }

            if (checkDuplicateName(merged)) {
              throw new Error(ValidationMessage.MasterBroker.DuplicateNameExists);
            }

            await modifyMasterBroker(key as number, data);
            handleRowUpdated(showToast)();
          }

          if (type === 'remove') {
            await removeMasterBroker(key as number);
            handleRowDeleted(showToast)();
          }
        }

        // Close edit mode + clear pending changes in the grid
        e.component.cancelEditData();

        // Refresh from server
        await reload();
      } catch (err) {
        showToast(`Save error: ${(err as Error).message}`, 'error');
        // keep editor open; since we canceled default, nothing is applied
      }
    }, [
      addMasterBroker,
      modifyMasterBroker,
      removeMasterBroker,
      reload,
      showToast,
      checkDuplicateName,
      isAdmin
    ]);

  return (
    <div>      
      <div className='grid-container-smallest'> 
        <DataGrid
          id="maintenance-master-broker-grid"
          dataSource={masterBrokers}
          keyExpr="ID" // Unique key for each item
          allowColumnResizing={true}
          allowColumnReordering={true}
          showBorders={true}
          rowAlternationEnabled={true}
          paging={{enabled:false}}
          onRowDblClick={onRowDblClick}
          onEditingStart={handleEditingStart}
          onInitNewRow={handleInitNewRow}
          onSaving={onSaving}
          remoteOperations={false}
          repaintChangesOnly={true}
          onDataErrorOccurred={onDataErrorOccurred} // Bind the error handler
          hoverStateEnabled={true}
          focusedRowEnabled={true}
        >        
          <Scrolling mode="infinite" columnRenderingMode="virtual" />
          <LoadPanel enabled={true} />
          <FilterRow visible={true} applyFilter="auto" />
          <Editing
            mode="popup"
            allowUpdating={isAdmin? true: false}
            allowAdding={isAdmin? true: false}
            allowDeleting={isAdmin? true: false}
            useIcons={true}
          >
            <Popup showTitle={true} title={popupTitle} width="30%" height="35%" wrapperAttr= {{ className:'custom-popup-class' }} />
              <div className='div-container-center'>
                <Form colCount={1} width="90%">
                  <FormItem dataField="active" label={{text:"Active"}} editorType="dxCheckBox"  />
                  <FormItem name="masterBrokerName" editorType="dxTextBox" />
                  <FormItem name="masterBrokerCode" editorType="dxTextBox" />
                  <FormItem name="masterBrokerId" editorType="dxSelectBox" cssClass="dx-common-selectbox" />
                </Form>
              </div>
          </Editing>

          <Selection mode="single" selectByClick={true} />

          <Column  dataField="ID" caption="Id" allowEditing={false} allowFiltering={false} visible={false} allowSorting={true} alignment="left" dataType="number"/>
          <Column  dataField="masterBrokerId" caption= "Aladdin Master Broker Id" allowEditing={true} allowFiltering={false} visible={false} allowSorting={true} alignment="left" dataType="string">
            <Lookup dataSource={aladMasterBrokers} displayExpr={(m)=> {return m.masterBrokerCode +" - " + m.masterBrokerName}} valueExpr="masterBrokerId" />
              <RequiredRule message={ValidationMessage.RequiredField} />          
              <StringLengthRule max={50} message={ValidationMessage.NameMaxLength.replace('ZZZZ','50')} />
          </Column>
          <Column  dataField="masterBrokerCode" caption= "Master Broker Code" allowFiltering={true}  width= "20%" allowSorting={true} dataType="string"/>   
          <Column  dataField="masterBrokerName" caption= "Master Broker Name" allowFiltering={true} width= "35%" allowSorting={true} dataType="string">
              <RequiredRule message={ValidationMessage.RequiredField} />          
              <StringLengthRule max={100} message={ValidationMessage.NameMaxLength.replace('ZZZZ','100')} />
          </Column>  
          <Column  dataField="status" caption= "Status" width= "10%" allowFiltering={true} allowSorting={true} dataType="string" filterOperations={["startswith","="]} cellRender={renderStatusCellCallback}/>   
          <Column  dataField="lastUpdateDate" caption= 'Last Update Dt' allowFiltering={false} allowEditing={false} width="15%" allowSorting={true} dataType="date" format='MM/dd/yyyy hh:mm a'/>   
          <Column  dataField="lastUpdateBy" caption= "Last Update By" allowFiltering={true} allowEditing={false} width= "15%" allowSorting={true} dataType="string"/>    
          <Column dataField="active" visible={false} />
          <Column type="buttons" width="5%" visible={isAdmin? true: false}>
                <Button name="edit" visible={false} />
                <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Master Broker" visible={true} />
          </Column>
          <Toolbar visible={isAdmin? true: false}>
            <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
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

export default MaintenanceMasterBrokerGrid;