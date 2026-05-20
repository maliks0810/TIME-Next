import React, { useState, useCallback } from 'react';
import DataGrid, {
  Column,
  Editing,
  Popup,
  Selection,
  Button,
  Toolbar,
  Item as ToolbarItem,
  LoadPanel,
  FilterRow,
  Scrolling,
  DataGridTypes,
  StringLengthRule,
  RequiredRule,
  Lookup,
  Form,
  NumericRule
} from 'devextreme-react/data-grid';

import CheckBox from 'devextreme-react/check-box';
import TabPanel, { Item as TabItem } from 'devextreme-react/tab-panel';
import { Toast } from 'devextreme-react/toast';

import { Item as FormItem } from 'devextreme-react/form';

import { useUserInfo } from '@platform/utils';
import { ToastConfig, ToastType } from '../components/toast-config';
import { useDirectedRules  } from '../hooks/useDirectedRules';
import { ValidationMessage } from '../components/validations-message';
import './styles.scss';

import { MaintenanceBroker, MaintenanceDirectedRules, MaintenanceDirectedRulesXref } from '../datatypes/budget-maintenance-types';
import { LoadIndicator } from 'devextreme-react';

export const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {
  e.component.editRow(e.rowIndex);
};

export const handleDataError =
  (showToast: (message: string, type: ToastType) => void) =>
  (e: DataGridTypes.DataErrorOccurredEvent) => {
    showToast(`Failed: An API error occurred. ${e.error?.message ?? ''}`, 'error');
  };
export const handleRowInserted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('New DirectedRule added successfully!', 'success');  
};  

export const handleRowUpdated = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('DirectedRule data updated successfully!', 'success');  
};  

export const handleXrefRowInserted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('New DirectedRuleXref added successfully!', 'success');  
};  

export const handleXrefRowUpdated = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('DirectedRuleXref data updated successfully!', 'success');  
};
  

export const renderStatusCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {
  // If your "active" field is boolean, switch to: const isActive = !!cellData.value;
  const isActive = cellData.value === 'Active';
  const statusText = isActive ? 'Active' : 'Inactive';

  return (
    <div className="grid-container-flex">
      <CheckBox value={isActive} disabled={true} />
      <span>{statusText}</span>
    </div>
  );
};

const MaintenanceDirectedRulesGrid: React.FC = () => {
  const userData = useUserInfo();
  const [filteredDirectedRulesXref, setFilteredDirectedRulesXref] = useState<MaintenanceDirectedRulesXref[]>([]);
  const [selectedDirectedRuleId, setSelectedDirectedRuleId] = useState<number>();

  const { 
    directedRules,      
    directedRulesXref,
    portfolios,
    brokers,
    reloadDirectRules,
    removeDirectedRule , 
    addDirectedRule, 
    modifyDirectedRule,
    reloadDirectRulesXref,
    addDirectedRuleXref,
    modifyDirectedRuleXref,
    removeDirectedRuleXref
  } = useDirectedRules({
    userInfo: userData,
  });

  const [popupTitle, setPopupTitle] = useState('');
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToastConfig({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const onRowDblClick = useCallback(onRowDblClickHandler, []);
  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);

  const handleEditingStart = useCallback(() => {
    setPopupTitle('Edit Directed Rule');
  }, []);

  const handleInitNewRow = useCallback(() => {
    setPopupTitle('New Directed Rule');
  }, []);

  const handleRowDeleted = useCallback(() => {
    showToast('Directed Rule deleted successfully!', 'success');
  }, [showToast]);

  const onDirectedRulesSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenanceDirectedRules, number>) => {
      if (!e.changes?.length) return;

      // Prevent default grid mutation (no dupes)
      e.cancel = true;

      e.promise = (async () => {
        try {
          for (const change of e.changes) {
            const { type, key, data } = change;

            if (type === 'insert') {
              await addDirectedRule(data as MaintenanceDirectedRules);
              handleRowInserted(showToast)();
            }

            if (type === 'update') {
              await modifyDirectedRule(key as number, data ?? {});
              handleRowUpdated(showToast)();
            }

            if (type === 'remove') {
              await removeDirectedRule(key as number);
              handleRowDeleted();
            }
          }

          // Close popup / clear edit state
          e.component.cancelEditData();

          // Refresh main rules list
          await reloadDirectRules();

          // Optional: if rules list changes affects selection/filter, re-apply filter from latest xrefs
          if (selectedDirectedRuleId) {
            setFilteredDirectedRulesXref(
              directedRulesXref.filter(x => x.directedRulesId === selectedDirectedRuleId)
            );
          }
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          throw err;
        }
      })();
    },
    [
      addDirectedRule,
      modifyDirectedRule,
      removeDirectedRule,
      reloadDirectRules,
      showToast,
      handleRowDeleted,
      selectedDirectedRuleId,
      directedRulesXref,
    ]
  );
  const onSelectionChanged = async (selectedKeys: number[]) => {
      const key: number = selectedKeys[0];
      setSelectedDirectedRuleId(key);

      const filterDirectedXref: MaintenanceDirectedRulesXref[] = directedRulesXref.filter(x=> x.directedRulesId == key); 
      setFilteredDirectedRulesXref(filterDirectedXref);
  };

  /** Directed Rules Xref */
  const handleXrefEditingStart = useCallback(() => {
    setPopupTitle('Edit Directed Rule XRef');
  }, [selectedDirectedRuleId]);

  const handleXrefInitNewRow = useCallback((e: DataGridTypes.InitNewRowEvent<MaintenanceDirectedRulesXref>) => {
    setPopupTitle('New Directed Rule XRef');
    if(selectedDirectedRuleId)
      e.data.directedRulesId = selectedDirectedRuleId
  }, [selectedDirectedRuleId]);

  const handleXrefRowDeleted = useCallback(() => {
    showToast('Directed Rule Xref deleted successfully!', 'success');
  }, [showToast,selectedDirectedRuleId]);

  const onDirectedRulesXrefSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenanceDirectedRulesXref, number>) => {
      if (!e.changes?.length) return;

      e.cancel = true;

      e.promise = (async () => {
        try {
          for (const change of e.changes) {
            const { type, key, data } = change;

            if (type === 'insert') {
              const newData = { ...(data as MaintenanceDirectedRulesXref) };

              // Ensure the selected Directed Rule is used when inserting from xref tab
              if (selectedDirectedRuleId && !newData.directedRulesId) {
                newData.directedRulesId = selectedDirectedRuleId;
              }

              await addDirectedRuleXref(newData);
              handleXrefRowInserted(showToast)();
            }

            if (type === 'update') {
              await modifyDirectedRuleXref(key as number, data ?? {});
              handleXrefRowUpdated(showToast)();
            }

            if (type === 'remove') {
              await removeDirectedRuleXref(key as number);
              handleXrefRowDeleted();
            }
          }

          e.component.cancelEditData();

          // Reload Xref dataset and re-apply filter for selected rule
          const refreshed = await reloadDirectRulesXref();

          const ruleId = selectedDirectedRuleId;
          if (ruleId) {
            setFilteredDirectedRulesXref(
              (refreshed ?? []).filter(x => x.directedRulesId === ruleId)
            );
          } else {
            // If nothing selected, show empty (or all; your call)
            setFilteredDirectedRulesXref([]);
          }
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          throw err;
        }
      })();
    },
    [
      addDirectedRuleXref,
      modifyDirectedRuleXref,
      removeDirectedRuleXref,
      reloadDirectRulesXref,
      selectedDirectedRuleId,
      showToast,
      handleXrefRowDeleted,
    ]
  );

  return (
    <div>
      <div className="nested-tab-container">
        <TabPanel deferRendering={true}>
          <TabItem title="Directed Rules">
            { !directedRules ?
            <div className='div-loader'>  
              <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />  
              <p>Loading...</p>  
            </div>
             : (<div>
              <DataGrid
                id="maintenance-directedrules-grid"
                dataSource={directedRules}
                keyExpr="directedRulesId"
                allowColumnResizing={true}
                allowColumnReordering={true}
                showBorders={true}
                rowAlternationEnabled={true}
                paging={{ enabled: false }}
                onRowDblClick={onRowDblClick}
                onSelectionChanged={(e) => onSelectionChanged(e.selectedRowKeys as number[])}
                onDataErrorOccurred={onDataErrorOccurred}
                onSaving={onDirectedRulesSaving}
                onEditingStart={handleEditingStart}
                onInitNewRow={handleInitNewRow}
                hoverStateEnabled={true}
                focusedRowEnabled={true}
                width="80%"
                height="90%"
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
                    width="40%"
                    height="30%"
                    wrapperAttr={{ className: 'custom-popup-class' }}
                  />
                  <div className="div-container-center">
                    <Form colCount={2} width="90%">
                      <FormItem colSpan={1} dataField="active" label={{ text: 'Active' }} editorType="dxCheckBox"/>
                      <FormItem colSpan={1} dataField="directedRulesCode" editorType="dxTextBox"  cssClass="textInput-popup-short"/>
                      <FormItem colSpan={1} dataField="budgetPercent" editorType="dxNumberBox" cssClass="textInput-popup-num"/>
                      <FormItem colSpan={2} dataField="directedRulesName" editorType="dxTextBox" horizontalAlignment='center' cssClass="textInput-popup-long"/>                      
                      <FormItem colSpan={1} dataField="comment" editorType="dxTextBox" cssClass="textInput-popup-long"/>                      
                    </Form>
                  </div>
                </Editing>

                <Selection mode="single" selectByClick={true} />

                <Column dataField="directedRulesId" caption="Rules Id" visible={false} allowEditing={false} allowFiltering={false} allowSorting={true} alignment="left" dataType="number" />
                <Column dataField="directedRulesCode" caption="Code" width="20%" allowFiltering={true} allowEditing={true} allowSorting={true} dataType="string">
                  <StringLengthRule
                    max={200}
                    message={ValidationMessage.NameMaxLength.replace('ZZZZ', '200')}
                  />
                  <RequiredRule message={ValidationMessage.RequiredField} />
                </Column>

                <Column dataField="directedRulesName" caption="Name" formItem={{ visible: true }} allowEditing={true} allowFiltering={true} width="40%" allowSorting={true} dataType="string" >
                  <RequiredRule message={ValidationMessage.RequiredField} />                  
                </Column>                
                <Column dataField="comment" caption="Comments" formItem={{ visible: true }} allowEditing={true} allowFiltering={true} width="20%" allowSorting={true} dataType="string" />
                <Column dataField="budgetPercent" caption="Budget (%)" formItem={{ visible: true }} allowEditing={true} allowFiltering={true} width="15%" allowSorting={true} dataType="number" alignment='left'>
                  <NumericRule ignoreEmptyValue={true} type="numeric" />
                </Column>
                <Column dataField="lastUpdateDt" caption="Last Update Dt" formItem={{ visible: false }} allowEditing={false} allowFiltering={false} width="25%" allowSorting={true} dataType="date" format="MM/dd/yyyy hh:mm a" />     
                <Column dataField="lastUpdateBy"caption="Last Update By" formItem={{ visible: false }} allowEditing={false} allowFiltering={true} width="20%" allowSorting={true} dataType="string"/>

                <Column type="buttons" width="5%">
                  <Button name="edit" visible={false} />
                  <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Directed Rule" visible={true}/>
                </Column>

                <Toolbar>
                  <ToolbarItem name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
                </Toolbar>
              </DataGrid>
            </div>)}
          </TabItem>
          <TabItem title="Directed Rules Xref">
            { 
            !(filteredDirectedRulesXref && directedRules) ?
            <div className='div-loader'>  
              <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />  
              <p>Loading...</p>  
            </div>
            :(
            <div>
              <DataGrid
                id="maintenance-directedrulesxref-grid"
                dataSource={filteredDirectedRulesXref}
                keyExpr="directedRulesXRefId"
                allowColumnResizing={true}
                allowColumnReordering={true}
                showBorders={true}
                rowAlternationEnabled={true}
                paging={{ enabled: false }}
                onRowDblClick={onRowDblClick}
                onDataErrorOccurred={onDataErrorOccurred}
                onSaving={onDirectedRulesXrefSaving}
                onEditingStart={handleXrefEditingStart}
                onInitNewRow={handleXrefInitNewRow}
                hoverStateEnabled={true}
                focusedRowEnabled={true}
                width="70%"
                height="90%"
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
                      width="30%"
                      height="30%"
                      wrapperAttr={{ className: 'custom-popup-class' }}
                    />
                    <div className="div-container-center">
                    <Form colCount={1} width="95%">                      
                      <FormItem
                        dataField="year" editorType="dxNumberBox" label={{text:"Year"}}
                        cssClass="textInput-popup-num-wt-margin"
                      />
                      <FormItem
                        dataField="accountCode" editorType="dxSelectBox" label={{text:"Portfolio"}}  
                        editorOptions={{
                          searchEnabled: true, searchMode: "contains" 
                        }}                      
                        cssClass="dx-common-selectbox-short60"
                      />
                      <FormItem
                        dataField="brokerCode" editorType="dxSelectBox" label={{text:"Broker"}} 
                        editorOptions={{
                          dataSource:brokers, valueExpr:"brokerCode", 
                          displayExpr:(b:MaintenanceBroker)=> {
                            if(!b) return '';
                            return `${b.brokerCode} - ${b.brokerName}`;
                          },
                          searchEnabled: true, searchMode: "contains"  
                        }}                      
                        cssClass="dx-common-selectbox-short80"
                      />                      
                      <FormItem
                        dataField="directedRulesId" editorType="dxSelectBox" 
                        editorOptions={{
                          dataSource:directedRules, valueExpr:"directedRulesId", displayExpr:"directedRulesName",
                          searchEnabled: true, searchMode: "contains"
                        }}
                        cssClass="dx-common-selectbox-short80"
                      />                      
                    </Form>
                  </div>
                  </Editing>
                  <Column dataField="directedRulesXRefId" caption="Directed Rules Xref" visible={false} formItem={{visible:false}}/>
                  <Column dataField="directedRulesId" caption="Directed Rules" width="30%" dataType="number" >
                    <Lookup dataSource={directedRules} valueExpr="directedRulesId" displayExpr="directedRulesName"/>
                    <RequiredRule message={ValidationMessage.RequiredField} />                  
                  </Column>                    
                  <Column dataField="year" caption="Year" width="8%" alignment="left" >
                    <RequiredRule message={ValidationMessage.RequiredField} />                  
                  </Column>
                  <Column dataField="accountCode" caption="Portfolio" width="15%">
                    <Lookup dataSource={portfolios} valueExpr="portfolioCode" displayExpr="portfolioCode"/>
                    <RequiredRule message={ValidationMessage.RequiredField} />                  
                  </Column>
                  <Column dataField="brokerCode" caption="Broker" width="15%" dataType="string" >
                    <Lookup dataSource={brokers} valueExpr="brokerCode" displayExpr="brokerCode"/>
                    <RequiredRule message={ValidationMessage.RequiredField} />                  
                  </Column>
                  <Column dataField="lastUpdateDt" caption="Last Update Dt" width="15%" allowFiltering={false} allowEditing={false} 
                    dataType="date" format="MM/dd/yyyy hh:mm a" formItem={{visible:false}} />
                  <Column dataField="lastUpdateBy" caption="Last Update By" width="12%" allowFiltering={true}
                    formItem={{visible:false}} />
                  
                  <Column type="buttons" width="5%">
                    <Button name="edit" visible={false} />
                    <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Directed Rules Xref" visible={true}/>
                  </Column>

                <Toolbar>
                  <ToolbarItem name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
                </Toolbar>
              </DataGrid>
            </div>)}
          </TabItem>
        </TabPanel>
      </div>

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

export default MaintenanceDirectedRulesGrid;