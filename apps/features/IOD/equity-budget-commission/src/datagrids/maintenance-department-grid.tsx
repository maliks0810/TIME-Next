import React, { useState, useCallback } from 'react';
import DataGrid, {Column,Editing,Popup,Selection,Button,Form,Item,Toolbar,LoadPanel,Lookup,FilterRow,Scrolling,DataGridTypes, RequiredRule
      } from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { MaintenanceDepartment } from '../datatypes/budget-maintenance-types';
import { useUserInfo } from '@platform/utils';
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType } from '../components/toast-config';
import { useDepartments } from '../hooks/useDepartmentData';
import { Item as FormItem } from 'devextreme-react/form';
import { ValidationMessage } from '../components/validations-message';
import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

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
    <div className="grid-container-flex">  
      <CheckBox value={isActive} disabled={true} />  
      <span>{statusText}</span>  
    </div>  
  );  
};

const MaintenanceDepartmentGrid: React.FC = () => {
  const userData = useUserInfo();
  const {  
    departments,  
    divisions,  
    reload,
    addDepartment,  
    modifyDepartment,  
    removeDepartment,  
    isAdmin
  } = useDepartments({ userInfo: userData });  

  const [popupTitle, setPopupTitle] = useState('');  

  const [toastConfig, setToastConfig] = useState<ToastConfig>({  
    visible: false,  
    message: '',  
    type: 'info',  
  });  

  const showToast = (message: string, type: ToastType) => {  
    setToastConfig({ visible: true, message, type });  
  };  
  const hideToast = () => {  
    setToastConfig((prev) => ({ ...prev, visible: false }));  
  };  

  const onRowDblClick = useCallback((e: DataGridTypes.RowDblClickEvent) => {
    if (!isAdmin) return;

    onRowDblClickHandler(e);  
  }, [isAdmin]);

  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);  
  const renderStatusCellCallback = useCallback(renderStatusCell, []);  

  const handleEditingStart = () => {  
    setPopupTitle('Edit Department');  
  };  
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceDepartment>) => {  
    setPopupTitle('New Department');  
    e.data.active = true;
  };  

  const onSaving = useCallback(
  (e: DataGridTypes.SavingEvent<MaintenanceDepartment, number>) => {
    if (!e.changes?.length) return;

    // IMPORTANT: stop the grid from applying changes to your array dataSource
    e.cancel = true;                 // supported by SavingEvent [1](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxDataGrid/Types/SavingEvent/)

    // Let the grid await your async work
    e.promise = (async () => {
      try {
        for (const change of e.changes) {
          if (change.type === 'insert') {
            await addDepartment(change.data as Partial<MaintenanceDepartment>);
            showToast('New Department added successfully!', 'success');
          } else if (change.type === 'update') {
            await modifyDepartment(change.key as number, change.data as Partial<MaintenanceDepartment>);
            showToast('Department data updated successfully!', 'success');
          } else if (change.type === 'remove') {
            await removeDepartment(change.key as number);
            showToast('Department deleted successfully!', 'success');
          }
        }

        // Refresh once (single source of truth)
        await reload();

        // Close popup + clear edit state
        e.component.cancelEditData();
      } catch (err) {
        showToast(`Save error: ${(err as Error).message}`, 'error');
        // Keep edit state so user can correct and retry
      }
    })();
  },
  [addDepartment, modifyDepartment, removeDepartment, reload, showToast]
  );
  
return (  
  <div>  
    <div className="grid-container-smaller">  
      <DataGrid  
        id="maintenance-department-grid"  
        dataSource={departments}  
        keyExpr="departmentId"  
        allowColumnResizing={true}  
        allowColumnReordering={true}  
        showBorders={true}  
        rowAlternationEnabled={true}  
        paging={{ enabled: false }}  
        onRowDblClick={onRowDblClick}  
        onDataErrorOccurred={onDataErrorOccurred}  
        onSaving={onSaving}       
        onEditingStart={handleEditingStart}  
        onInitNewRow={handleInitNewRow}  
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
          <Popup  
            data-testid="popup"  
            showTitle={true}  
            title={popupTitle}  
            width="30%"  
            height="25%"
            minHeight='200px' 
            minWidth='350px' 
            wrapperAttr={{ className: 'custom-popup-class' }}  
          />  
          <Form width="90%" colCount={1}>  
            <FormItem dataField="active" label={{text:"Active"}} editorType="dxCheckBox" />
            <FormItem name="departmentName" editorType="dxTextBox" />  
            <FormItem name="divisionId" cssClass="dx-common-selectbox" editorType="dxSelectBox" />  
          </Form>  
        </Editing>  

        <Selection mode="single" selectByClick={true} />  

        <Column  
          dataField="departmentId"  
          caption="Department Id"  
          allowEditing={false}  
          allowFiltering={false}  
          width="10%"  
          allowSorting={true}  
          alignment="left"  
          dataType="number"  
        />  
        <Column  
          dataField="departmentName"  
          caption="Department Name"  
          width="25%"  
          allowFiltering={true}  
          allowSorting={true}  
          dataType="string"  
        >
          <RequiredRule message={ValidationMessage.RequiredField} />
        </Column>
        <Column  
          dataField="divisionId"  
          caption="Division"  
          allowFiltering={true}  
          width="20%"  
          allowSorting={true}  
          dataType="string"  
        >  
          <Lookup dataSource={divisions} valueExpr="divisionId" displayExpr="divisionName" />
          <RequiredRule message={ValidationMessage.RequiredField} />
        </Column>  
        <Column  
          dataField="status"  
          caption="Status"  
          width="10%"  
          allowFiltering={true}  
          allowSorting={true}  
          dataType="string"  
          cellRender={renderStatusCellCallback}
          filterOperations={["startswith","="]}
        />  
        <Column dataField="active" visible={false} />
        <Column  
          dataField="lastUpdateDate"  
          caption="Last Update Dt"  
          allowEditing={false}  
          allowFiltering={false}  
          width="15%"  
          allowSorting={true}  
          dataType="date"  
          format="MM/dd/yyyy hh:mm a"  
        />  
        <Column  
          dataField="lastUpdateBy"  
          caption="Last Update By"  
          allowEditing={false}  
          allowFiltering={true}  
          width="15%"  
          allowSorting={true}  
          dataType="string"  
        />  

        <Column type="buttons" width="5%" visible={isAdmin? true: false}>  
          <Button name="edit" visible={false} />  
          <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Department" visible={true} />  
        </Column>  
        <Toolbar visible={isAdmin? true: false}>  
          <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>  
          {/* ... other toolbar items */}  
        </Toolbar>  
      </DataGrid>  
    </div>  

    {/* Toast */}  
    <Toast  
      data-testid="toast"  
      visible={toastConfig.visible}  
      message={toastConfig.message}  
      width={400}  
      type={toastConfig.type}  
      position="bottom center"  
      onHidden={hideToast}  
      displayTime={3000}  
    />  
  </div>  
);  
};

export default MaintenanceDepartmentGrid;