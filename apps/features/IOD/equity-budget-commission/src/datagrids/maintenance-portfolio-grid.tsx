import React, { useState, useCallback } from 'react';
import DataGrid, {Column,Editing,Popup,Selection,Button,Form,Item, Toolbar,LoadPanel,Lookup,FilterRow,Scrolling,DataGridTypes,
        StringLengthRule, RequiredRule } from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { MaintenancePortfolio, MaintenancePortfolioGroupXref } from '../datatypes/budget-maintenance-types';
import { useUserInfo } from '@platform/utils';
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType } from '../components/toast-config';
import { usePortfolios } from '../hooks/usePortfolioData';
import TabPanel, { Item as TabItem} from 'devextreme-react/tab-panel';
import { ValidationMessage } from '../components/validations-message';
import { Item as FormItem } from 'devextreme-react/form';
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

const handleRowInserted = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {
  showToast('New Portfolio added successfully!', 'success');
};

const handleRowUpdated = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {
  showToast('Portfolio data updated successfully!', 'success');
};

const handleRowDeleted = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {
  showToast('Portfolio deleted successfully!', 'success');
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

const MaintenancePortfolioGrid: React.FC = () => {
  const userData = useUserInfo();
  const {  
    portfolios,
    departments,
    divisions,  
    portfolioGroups,
    portfolioGroupXrefs,
    reload,
    addPortfolio,  
    modifyPortfolio,  
    removePortfolio,
    reloadGroupXref,
    addPortfolioGroupXref,
    modifyPortfolioGroupXref,
    removePortfolioGroupXref,
    isAdmin
  } = usePortfolios({ userInfo: userData });  

  const [popupTitle, setPopupTitle] = useState('');  
  const [portfolioGroupFilterXrefs,setPortfolioGroupFilterXrefs] = useState<MaintenancePortfolioGroupXref[]>([])
  const [selectedPortfolioId,setSelectedPortfolioId] = useState<number>()

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
    setPopupTitle('Edit Portfolio');  
  };  
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenancePortfolio>) => {  
    setPopupTitle('New Portfolio');  
    e.data.active = true;
  };

  //Check duplicate name validations
  function checkDuplicateName(data: MaintenancePortfolio){
    const isExist = portfolios.find(x=> x.portfolioName == data.portfolioName && x.portfolioId != data.portfolioId);
    return isExist;
  }

  // --- Portfolio: onSaving ---
  const onPortfolioSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenancePortfolio, number>) => {
      if (!e.changes?.length) return;

      // prevent DataGrid from mutating the in-memory array (prevents dupes)
      e.cancel = true;

      e.promise = (async () => {
        try {
          for (const change of e.changes) {
            const { type, key, data } = change;

            if (type === 'insert') {
              const newData = data as MaintenancePortfolio;

              if (checkDuplicateName(newData)) {
                throw new Error(ValidationMessage.Portfolio.DuplicateNameExists);
              }

              await addPortfolio(newData);
              handleRowInserted(showToast)();
            }

            if (type === 'update') {
              // change.data is partial; merge with existing row for validation
              const oldRow = (portfolios.find(p => p.portfolioId === (key as number)) ??
                {}) as MaintenancePortfolio;

              const merged: MaintenancePortfolio = {
                ...oldRow,
                ...(data as Partial<MaintenancePortfolio>),
                portfolioId: key as number,
              };

              if (checkDuplicateName(merged)) {
                throw new Error(ValidationMessage.Portfolio.DuplicateNameExists);
              }

              await modifyPortfolio(key as number, data ?? {});
              handleRowUpdated(showToast)();
            }

            if (type === 'remove') {
              await removePortfolio(key as number);
              handleRowDeleted(showToast)();
            }
          }

          // close popup, clear edit state
          e.component.cancelEditData();

          // refresh from server/state source
          await reload();

          // if portfolio list changed, refresh xref filter (optional)
          if (selectedPortfolioId) {
            const filterGrpXref = portfolioGroupXrefs.filter(x => x.portfolioId === selectedPortfolioId);
            setPortfolioGroupFilterXrefs(filterGrpXref);
          }
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          throw err;
        }
      })();
    },
    [
      addPortfolio,
      modifyPortfolio,
      removePortfolio,
      reload,
      showToast,
      portfolios,
      portfolioGroupXrefs,
      selectedPortfolioId,
      isAdmin
    ]
  );

  // --- Portfolio Group XRef: onSaving ---
  const onXRefSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenancePortfolioGroupXref, number>) => {
      if (!e.changes?.length) return;

      e.cancel = true;

      e.promise = (async () => {
        try {
          for (const change of e.changes) {
            const { type, key, data } = change;

            if (type === 'insert') {
              const newData = data as MaintenancePortfolioGroupXref;

              // Ensure portfolioId is set when inserting from the xref tab
              if (selectedPortfolioId && !newData.portfolioId) {
                newData.portfolioId = selectedPortfolioId;
              }

              await addPortfolioGroupXref(newData);
              handleRowInserted(showToast)();
            }

            if (type === 'update') {
              await modifyPortfolioGroupXref(key as number, data ?? {});
              handleRowUpdated(showToast)();
            }

            if (type === 'remove') {
              await removePortfolioGroupXref(key as number);
              handleRowDeleted(showToast)();
            }
          }

          e.component.cancelEditData();

          await reloadGroupXref();

          // re-apply filter after reload (so the tab stays in sync)
          if (selectedPortfolioId) {
            const filterGrpXref = portfolioGroupXrefs.filter(x => x.portfolioId === selectedPortfolioId);
            setPortfolioGroupFilterXrefs(filterGrpXref);
          }
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          throw err;
        }
      })();
    },
    [
      addPortfolioGroupXref,
      modifyPortfolioGroupXref,
      removePortfolioGroupXref,
      reloadGroupXref,
      showToast,
      selectedPortfolioId,
      portfolioGroupXrefs,
      isAdmin
    ]
  );

  
  // selection  
  const onSelectionChanged = async (selectedKeys: number[]) => {
      const key: number = selectedKeys[0];
      setSelectedPortfolioId(key);

      const filterGrpXref: MaintenancePortfolioGroupXref[] = portfolioGroupXrefs.filter(x=> x.portfolioId == key);
      setPortfolioGroupFilterXrefs(filterGrpXref);
  }; 

  /** Portfolio Group XRef */
  const handleXRefEditingStart = () => {  
    setPopupTitle('Edit Portfolio Group XRef');  
  };

  const handleXRefInitNewRow = (e:DataGridTypes.InitNewRowEvent<MaintenancePortfolioGroupXref>) => {  
    setPopupTitle('New Portfolio Group XRef');  
    if(selectedPortfolioId)
      e.data.portfolioId = selectedPortfolioId;
  };

  

return (  
  <div>  
    <div className='nested-tab-container'>      
      <TabPanel>
        <TabItem title="Portfolio">
          <div>  
            <DataGrid  
              id="maintenance-portfolio-grid"  
              dataSource={portfolios}  
              keyExpr="portfolioId"  
              allowColumnResizing={true}  
              allowColumnReordering={true}  
              showBorders={true}  
              rowAlternationEnabled={true}  
              paging={{ enabled: false }}  
              onRowDblClick={onRowDblClick}  
              onSelectionChanged={(e) => onSelectionChanged(e.selectedRowKeys as number[])}
              onDataErrorOccurred={onDataErrorOccurred}  
              onSaving={onPortfolioSaving}
              onEditingStart={handleEditingStart}  
              onInitNewRow={handleInitNewRow}  
              hoverStateEnabled={true}
              focusedRowEnabled={true}
              width="90%"
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
                  height="35%" 
                  wrapperAttr={{ className: 'custom-popup-class' }}  
                />  
                <div className='div-container-center'>
                  <Form colCount={1} width="90%">
                    <FormItem dataField="active" label={{text:"Active"}} editorType="dxCheckBox" />                    
                    <FormItem dataField="portfolioCode" editorType="dxTextBox" cssClass='textInput-popup'/>
                    <FormItem dataField="portfolioName" editorType="dxTextBox" />
                    <FormItem dataField="departmentId" editorType="dxSelectBox" cssClass="dx-common-selectbox" />
                  </Form>  
                </div>
              </Editing>  

              <Selection mode="single" selectByClick={true} />  

              <Column dataField="portfolioId" caption="Portfolio Id" visible={false} allowEditing={true} allowFiltering={false} allowSorting={true} alignment="left" dataType="number" />
              <Column dataField="portfolioCode" caption="Portfolio Code" allowEditing={true} allowFiltering={true} width="10%" allowSorting={true} alignment="left" dataType="string" >
                <StringLengthRule max={50} message={ValidationMessage.NameMaxLength.replace('ZZZZ','50')} />
                <RequiredRule message={ValidationMessage.RequiredField} />
              </Column>
              <Column dataField="portfolioName" caption="Portfolio Name" width="20%" allowFiltering={true} allowEditing={true} allowSorting={true} dataType="string" >
                <StringLengthRule max={200} message={ValidationMessage.NameMaxLength.replace('ZZZZ','200')} />
                <RequiredRule message={ValidationMessage.RequiredField} />
              </Column>
              <Column dataField="departmentId" caption="Department" allowFiltering={true} width="20%" allowSorting={true} dataType="string" >  
                <Lookup dataSource={departments} valueExpr="departmentId" displayExpr="departmentName" /> 
                <RequiredRule message={ValidationMessage.RequiredField} /> 
              </Column>
              <Column dataField="divisionId" caption="Division" formItem={{visible:false}} allowFiltering={true} width="15%" allowSorting={true} dataType="string" >  
                <Lookup dataSource={divisions} valueExpr="divisionId" displayExpr="divisionName" />  
              </Column>  
              <Column dataField="status" caption="Status" width="10%" allowFiltering={true} alignment="left" allowSorting={true} dataType="string" filterOperations={["startswith","="]} cellRender={renderStatusCellCallback} />  
              <Column dataField="lastUpdateDate" caption="Last Update Dt" formItem={{visible:false}} allowEditing={false} allowFiltering={false} width="10%" allowSorting={true} dataType="date" format="MM/dd/yyyy hh:mm a" />  
              <Column dataField="lastUpdateBy" caption="Last Update By" formItem={{visible:false}} allowEditing={false} allowFiltering={true} width="10%" allowSorting={true} dataType="string" />  
              <Column dataField="active" visible={false} />
              <Column type="buttons" width="5%" visible={isAdmin? true: false}>  
                <Button name="edit" visible={false} />  
                <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Portfolio" visible={true} />  
              </Column>  
              <Toolbar visible={isAdmin? true: false}>  
                <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/> 
              </Toolbar>  
            </DataGrid>  
          </div>  
        </TabItem>
        <TabItem title="Portfolio Group xRef">
          <div className="grid-container-small">
            <DataGrid 
              dataSource={portfolioGroupFilterXrefs}
              keyExpr="portfolioGroupXrefId"  
              allowColumnResizing={true}  
              allowColumnReordering={true}  
              showBorders={true}  
              rowAlternationEnabled={true}  
              onRowDblClick={onRowDblClick}  
              onDataErrorOccurred={onDataErrorOccurred}  
              onSaving={onXRefSaving}
              onEditingStart={handleXRefEditingStart}  
              onInitNewRow={handleXRefInitNewRow} 
              paging={{ enabled: false }}
              width="80%"
            >
              <Scrolling mode="infinite" columnRenderingMode="virtual" />  
              <LoadPanel enabled={true} />  
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
                  width="35%"  
                  height="30%" 
                  wrapperAttr={{ className: 'custom-popup-class' }}  
                />  
                <div className='div-container-center'>
                  <Form colCount={1} width="90%">
                    <FormItem dataField="portfolioId" label={{text:"Portfolio"}} editorType="dxSelectBox" 
                      editorOptions={{
                        dataSource: portfolios, displayExpr:"portfolioName", valueExpr:"portfolioId",
                        searchEnabled:true, searchMode: "contains"
                      }}
                      cssClass="dx-common-selectbox-short80" />
                    <FormItem dataField="portfolioGroupId" label={{text:"Portfolio Group"}} editorType="dxSelectBox"
                      editorOptions={{
                        dataSource: portfolioGroups, displayExpr:"portfolioGroupName", valueExpr:"portfolioGroupId",
                        searchEnabled:true, searchMode: "contains"
                      }} 
                      cssClass="dx-common-selectbox-short80" />   
                  </Form>  
                </div>
              </Editing>  
              <Column dataField="portfolioGroupXrefId" visible={false} />
              <Column dataField="portfolioGroupId" caption="Portfolio Group Name" width="30%" allowFiltering={false} allowSorting={true} dataType="string" >                  
                <Lookup dataSource={portfolioGroups} valueExpr="portfolioGroupId" displayExpr="portfolioGroupName" />
                <RequiredRule message={ValidationMessage.RequiredField} />
              </Column>
              <Column caption="Portfolio Group Code" width="20%" allowFiltering={false} allowSorting={true} dataType="string"
                  calculateCellValue={(rowData) => {
                    const pg = portfolioGroups.find(pg => pg.portfolioGroupId === rowData.portfolioGroupId);
                    return pg?.portfolioGroupCode ?? null;
                  }}>
              </Column>              
              <Column dataField="portfolioId" caption="Portfolio Code" width="15%" allowFiltering={false} allowSorting={true} alignment="left" dataType="string" >
                <Lookup dataSource={portfolios} valueExpr="portfolioId" displayExpr="portfolioCode" />
                <RequiredRule message={ValidationMessage.RequiredField} />
              </Column>  
              <Column caption="Portfolio Name" width="30%" allowFiltering={false} allowSorting={true} dataType="string" 
                  calculateCellValue={(rowData) => {
                    const p = portfolios.find(p => p.portfolioId === rowData.portfolioId);
                    return p?.portfolioName ?? null;
                  }}>
              </Column>
              <Column type="buttons" width="5%" visible={isAdmin? true: false}>  
                <Button name="edit" visible={false} />  
                <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Portfolio" visible={true} />  
              </Column>  
              <Toolbar visible={isAdmin? true: false}>  
                <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>  
              </Toolbar>
            </DataGrid>
          </div>
        </TabItem>
        <TabItem title="Change Log"></TabItem>
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

export default MaintenancePortfolioGrid;