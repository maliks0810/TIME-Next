import React, { useState, useCallback } from 'react';
import DataGrid, {Column,Editing,Popup,Selection,Button,Form,Item, Toolbar,LoadPanel,Lookup,FilterRow,Scrolling,DataGridTypes,
      StringLengthRule, 
      RequiredRule} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { MaintenancePortfolioGroup, MaintenancePortfolioGroupXref } from '../datatypes/budget-maintenance-types';
import { useUserInfo } from '@platform/utils';
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType } from '../components/toast-config';
import { usePortfolioGroups } from '../hooks/usePortfolioGroupData';
import TabPanel, { Item as TabItem} from 'devextreme-react/tab-panel';
import { ValidationMessage } from '../components/validations-message';
import { Item as FormItem } from 'devextreme-react/form';
import './styles.scss';

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
  showToast('New Portfolio Group added successfully!', 'success');
};

const handleRowUpdated = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {
  showToast('Portfolio Group data updated successfully!', 'success');
};

const handleRowDeleted = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {
  showToast('Portfolio Group deleted successfully!', 'success');
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

const MaintenancePortfolioGroupGrid: React.FC = () => {
  const userData = useUserInfo();
  const {  
    portfolios,
    portfolioGroups,
    portfolioGroupXrefs,
    reload,
    addPortfolioGroup,  
    modifyPortfolioGroup,  
    removePortfolioGroup
  } = usePortfolioGroups({ userInfo: userData });

  const [popupTitle, setPopupTitle] = useState('');  
  const [portfolioGroupFilterXrefs,setPortfolioGroupFilterXrefs] = useState<MaintenancePortfolioGroupXref[]>([])
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

  const onRowDblClick = useCallback(onRowDblClickHandler, []);  
  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);  
  const renderStatusCellCallback = useCallback(renderStatusCell, []);  
  
  const handleEditingStart = () => {  
    setPopupTitle('Edit Portfolio Group');  
  };  
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenancePortfolioGroup>) => {  
    setPopupTitle('New Portfolio Group');  
    e.data.active = true;
  };

  //Check duplicate name validations
  function checkDuplicateName(data: MaintenancePortfolioGroup){
    const isExist = portfolioGroups.find(x=> x.portfolioGroupName == data.portfolioGroupName && x.portfolioGroupId != data.portfolioGroupId);
    return isExist;
  }

  const onSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenancePortfolioGroup, number>) => {
      if (!e.changes?.length) return;

      // Prevent DataGrid from mutating the in-memory array (prevents dupes)
      e.cancel = true;

      e.promise = (async () => {
        try {
          for (const change of e.changes) {
            const { type, key, data } = change;

            if (type === 'insert') {
              const newData = data as MaintenancePortfolioGroup;

              if (checkDuplicateName(newData)) {
                throw new Error(ValidationMessage.PortfolioGroup.DuplicateNameExists);
              }

              await addPortfolioGroup(newData);
              handleRowInserted(showToast)();
            }

            if (type === 'update') {
              // data is partial on update; merge with existing row for validation
              const oldRow =
                portfolioGroups.find(pg => pg.portfolioGroupId === (key as number)) ??
                ({} as MaintenancePortfolioGroup);

              const merged: MaintenancePortfolioGroup = {
                ...oldRow,
                ...(data as Partial<MaintenancePortfolioGroup>),
                portfolioGroupId: key as number,
              };

              if (checkDuplicateName(merged)) {
                throw new Error(ValidationMessage.PortfolioGroup.DuplicateNameExists);
              }

              // send only changes to API (your hook can merge server-side if needed)
              await modifyPortfolioGroup(key as number, data ?? {});
              handleRowUpdated(showToast)();
            }

            if (type === 'remove') {
              await removePortfolioGroup(key as number);
              handleRowDeleted(showToast)();
            }
          }

          // Close popup and clear pending changes
          e.component.cancelEditData();

          // Reload list (IMPORTANT: reload must set state in hook)
          await reload();

          // Re-apply selection filter xrefs (optional but keeps tab in sync)
          const selectedKey = (e.component.option('selectedRowKeys') as number[] | undefined)?.[0];
          if (selectedKey) {
            setPortfolioGroupFilterXrefs(
              portfolioGroupXrefs.filter(x => x.portfolioGroupId === selectedKey)
            );
          }
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          throw err; // keeps edit state if save fails
        }
      })();
    },
    [
      addPortfolioGroup,
      modifyPortfolioGroup,
      removePortfolioGroup,
      reload,
      showToast,
      portfolioGroups,
      portfolioGroupXrefs,
    ]
  );
  
  // selection  
  const onSelectionChanged = async (selectedKeys: number[]) => {
      const filterGrpXref: MaintenancePortfolioGroupXref[] = portfolioGroupXrefs.filter(x=> x.portfolioGroupId == selectedKeys[0]) 
      setPortfolioGroupFilterXrefs(filterGrpXref);
  }; 

return (  
  <div>  
    <div className='nested-tab-container'>      
      <TabPanel>
        <TabItem title="Portfolio Group">
          <div>  
            <DataGrid  
              id="maintenance-portfoliogroup-grid"  
              dataSource={portfolioGroups}  
              keyExpr="portfolioGroupId"  
              allowColumnResizing={true}  
              allowColumnReordering={true}  
              showBorders={true}  
              rowAlternationEnabled={true}  
              paging={{ enabled: false }}  
              onRowDblClick={onRowDblClick}  
              onSelectionChanged={(e) => onSelectionChanged(e.selectedRowKeys as number[])}
              onDataErrorOccurred={onDataErrorOccurred}  
              onSaving={onSaving}
              onEditingStart={handleEditingStart}  
              onInitNewRow={handleInitNewRow}  
              hoverStateEnabled={true}
              focusedRowEnabled={true}
              width="70%"
            >  
              <Scrolling mode="infinite" columnRenderingMode="virtual" />  
              <LoadPanel enabled={true} />  
              <FilterRow visible={true} applyFilter="auto" />  
              <Editing  
                mode="popup"  
                allowUpdating={true}  
                allowAdding={true}  
                allowDeleting={true}  
                useIcons={true}  
              >  
                <Popup  
                  data-testid="popup"  
                  showTitle={true}  
                  title={popupTitle}  
                  width="35%" 
                  height="30%"  
                  wrapperAttr={{ className: 'custom-popup-class' }}  
                />  
                <div className='div-container-center'>
                  <Form colCount={1} width="90%">
                    <FormItem dataField="active" label={{text:"Active"}} editorType="dxCheckBox" />
                    <FormItem dataField="portfolioGroupCode" editorType="dxTextBox" />
                    <FormItem dataField="portfolioGroupName" editorType="dxTextBox" />
                  </Form>  
                </div>
              </Editing>  

              <Selection mode="single" selectByClick={true} />  

              <Column dataField="portfolioGroupId" caption="Portfolio Id" visible={false} allowEditing={true} allowFiltering={false} allowSorting={true} alignment="left" dataType="number" />
              <Column dataField="portfolioGroupCode" caption="Portfolio Group Code" allowEditing={true} allowFiltering={true} width="20%" allowSorting={true} alignment="left" dataType="string" >
                <StringLengthRule max={30} message={ValidationMessage.NameMaxLength.replace('ZZZZ','30')} />
                <RequiredRule message={ValidationMessage.RequiredField} />
              </Column>
              <Column dataField="portfolioGroupName" caption="Portfolio Group Name" width="30%" allowFiltering={true} allowEditing={true} allowSorting={true} dataType="string" >
                <StringLengthRule max={100} message={ValidationMessage.NameMaxLength.replace('ZZZZ','100')} />
                <RequiredRule message={ValidationMessage.RequiredField} />
              </Column>
              <Column dataField="status" caption="Status" width="15%" allowFiltering={true} allowSorting={true} alignment="left" dataType="string" filterOperations={["startswith","="]} cellRender={renderStatusCellCallback} />  
              <Column dataField="lastUpdateDate" caption="Last Update Dt" formItem={{visible:false}} allowEditing={false} allowFiltering={false} width="15%" allowSorting={true} dataType="date" format="MM/dd/yyyy hh:mm a" />  
              <Column dataField="lastUpdateBy" caption="Last Update By" formItem={{visible:false}} allowEditing={false} allowFiltering={true} width="15%" allowSorting={true} dataType="string" />  
              <Column dataField="active" visible={false} />
              <Column type="buttons" width="5%">  
                <Button name="edit" visible={false} />  
                <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Portfolio Group" visible={true} />  
              </Column>  
              <Toolbar>  
                <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>  
                {/* ... other toolbar items */}  
              </Toolbar>  
            </DataGrid>  
          </div>  
        </TabItem>
        <TabItem title="Portfolio xRef">
          <div className="grid-container-small">
            <DataGrid 
              dataSource={portfolioGroupFilterXrefs}
              keyExpr="portfolioGroupXrefId"  
              allowColumnResizing={true}  
              allowColumnReordering={true}  
              showBorders={true}  
              rowAlternationEnabled={true}  
              paging={{ enabled: false }}
              width="80%"
            >
              <Column dataField="portfolioGroupId" caption="Portfolio Group Name" width="30%" allowFiltering={false} allowSorting={true} dataType="string" >  
                <Lookup dataSource={portfolioGroups} valueExpr="portfolioGroupId" displayExpr="portfolioGroupName" />  
              </Column>
              <Column dataField="portfolioGroupId" caption="Portfolio Group Code" width="15%" allowFiltering={false} allowSorting={true} dataType="string" >  
                <Lookup dataSource={portfolioGroups} valueExpr="portfolioGroupId" displayExpr="portfolioGroupCode" />  
              </Column>              
              <Column dataField="portfolioId" caption="Portfolio Code" width="15%" allowEditing={false} allowFiltering={false} allowSorting={true} alignment="left" dataType="string" >
                <Lookup dataSource={portfolios} valueExpr="portfolioId" displayExpr="portfolioCode" />
              </Column>  
              <Column dataField="portfolioId" caption="Portfolio Name" width="40%" allowFiltering={false} allowEditing={false} allowSorting={true} dataType="string" >
                <Lookup dataSource={portfolios} valueExpr="portfolioId" displayExpr="portfolioName" />
              </Column>
            </DataGrid>
          </div>
        </TabItem>
      </TabPanel>
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

export default MaintenancePortfolioGroupGrid;