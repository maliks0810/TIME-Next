import { useState, useCallback } from 'react';
import DataGrid, {
  Column,
  Editing,
  Popup,
  Selection,
  Button,
  Form,
  Item,
  Toolbar,
  LoadPanel,
  Lookup,
  FilterRow,
  Scrolling,
  StringLengthRule,
  RequiredRule,
  DataGridTypes,
} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import TabPanel, { Item as TabItem } from 'devextreme-react/tab-panel';
import { Toast } from 'devextreme-react/toast';

import { useUserInfo } from '@platform/utils';
import { useBrokerGroups } from '../hooks/useBrokerGroupData';
import { ValidationMessage } from '../components/validations-message';
import { ToastConfig, ToastType } from '../components/toast-config';
import { MaintenanceBrokerGroup, MaintenanceBrokerGroupMember } from '../datatypes/budget-maintenance-types';

import { Item as FormItem } from 'devextreme-react/form';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

/* -------------------- Component ------------------------- */

const MaintenanceBrokerGroupGrid = () => {
  const userInfo = useUserInfo();
  const {
    brokerGroups,
    brokerGroupMembers,
    brokers,
    addBrokerGroup,
    removeBrokerGroup,
    modifyBrokerGroup,
    reloadGroup,
    onSelectionChanged,
    selectedBrokerGroupId,
    //Broker group Members
    //reloadGroupMemberGroup,
    addBrokerGroupMember,
    modifyBrokerGroupMember,
    removeBrokerGroupMember,
    isAdmin
  } = useBrokerGroups({ userInfo });

  const [popupTitle, setPopupTitle] = useState('');
  const [toast, setToast] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: ToastType) =>
      setToast({ visible: true, message, type }),
    []
  );

  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );

  /* ----------------Broker Group Grid CRUD ---------------- */

  const onRowDblClick = (e: DataGridTypes.RowDblClickEvent) =>{
    if(!isAdmin) return;

    e.component.editRow(e.rowIndex);
  }

  const renderStatusCell = (
    cell: DataGridTypes.ColumnCellTemplateData
  ) => {
    const isActive = cell.value === 'Active';

    return (
      <div className="grid-container-flex">
        <CheckBox value={isActive} disabled />
        <span>{isActive ? 'Active' : 'Inactive'}</span>
      </div>
    );
  };

  const onSaving = useCallback(
  (e: DataGridTypes.SavingEvent<MaintenanceBrokerGroup, number>) => {
    if (!e.changes?.length) return;

    // CRITICAL: prevent DevExtreme from mutating the array
    e.cancel = true;

    e.promise = (async () => {
      try {
        for (const change of e.changes) {
          if (change.type === 'insert') {
            await addBrokerGroup(change.data);
            showToast('New Broker Group added successfully!', 'success');
          } else if (change.type === 'update') {
            await modifyBrokerGroup(change.key as number, change.data);
            showToast('Broker Group updated successfully!', 'success');
          } else if (change.type === 'remove') {
            await removeBrokerGroup(change.key as number);
            showToast('Broker Group deleted successfully!', 'success');
          }
        }

        // Single source of truth
        await reloadGroup();

        // Clear edit state
        e.component.cancelEditData();
      } catch (err) {
        showToast(`Save error: ${(err as Error).message}`, 'error');
      }
    })();
  },
  [addBrokerGroup, modifyBrokerGroup, removeBrokerGroup, reloadGroup, showToast]
  );

/* ---------------------- Utilities ---------------------- */

  /* -------------------- Render ------------------ */
  /** Broker Group Member - Section*/
  const onMemberRowDblClick = (e: DataGridTypes.RowDblClickEvent) => {
    if(!isAdmin) return;

    e.component.editRow(e.rowIndex);
  }
  const onMemberRowInserting = async (
    e: DataGridTypes.RowInsertingEvent<MaintenanceBrokerGroupMember>
  ) => {
    try {
      await addBrokerGroupMember(e.data);
      showToast('New Broker Group Member added successfully!', 'success');
    } catch (err) {
      showToast(`Insert error: ${(err as Error).message}`, 'error');
      e.cancel = true;
    }
  };
  const onMemberRowUpdating = async (
    e: DataGridTypes.RowUpdatingEvent<MaintenanceBrokerGroupMember, number>
  ) => {
    try {
      await modifyBrokerGroupMember(e.key, e.newData);
      showToast('Broker Group Member updated successfully!', 'success');
    } catch (err) {
      showToast(`Update error: ${(err as Error).message}`, 'error');
      e.cancel = true;
    }
  };

  const onMemberRowRemoving = async (
    e: DataGridTypes.RowRemovingEvent<MaintenanceBrokerGroupMember, number>
  ) => {
    try {
      await removeBrokerGroupMember(e.key);
      //e.cancel = true; // prevent grid-side mutation
      showToast('Broker Group Member deleted successfully!', 'success');      
    } catch (err) {
      showToast(`Delete error: ${(err as Error).message}`, 'error');
      e.cancel = true;
    }
  };

  const onMemberRowRemoved = (e: DataGridTypes.RowRemovedEvent) => {
    e.component.clearSelection();
    e.component.option('focusedRowKey', null); 
  };

  const handleEditingStart = () => {
        setPopupTitle('Edit Broker Group');
        // You can also access e.data to get the row data being edited
  };
  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceBrokerGroup>) => {
        setPopupTitle('New Broker Group');
        e.data.active = true;        
  };

  const handleMemberEditingStart = () => {
        setPopupTitle('Edit Broker Group Member');
        // You can also access e.data to get the row data being edited
  };
  const handleMemberInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceBrokerGroupMember>) => {
        setPopupTitle('New Broker Group Member');

        if(selectedBrokerGroupId)
          e.data.brokerGroupId = selectedBrokerGroupId;        
  };

  /** */
  return (
    <div>
      <div className="nested-tab-container">
        <TabPanel>
          <TabItem title="Broker Group">
            <div>
              <DataGrid
                dataSource={brokerGroups}
                keyExpr="brokerGroupId"
                showBorders
                rowAlternationEnabled
                hoverStateEnabled
                focusedRowEnabled
                paging={{ enabled: false }}
                width="60%"
                onSelectionChanged={(e) => onSelectionChanged(e.selectedRowKeys as number[])}
                onRowDblClick={onRowDblClick}
                onSaving={onSaving}
                onEditingStart={handleEditingStart}
                onInitNewRow={handleInitNewRow}
              >
                <Scrolling mode="infinite" columnRenderingMode="virtual" />
                <LoadPanel enabled />
                <FilterRow visible applyFilter="auto" />

                <Editing
                  mode="popup"
                  allowAdding={isAdmin?true:false}
                  allowUpdating={isAdmin?true:false}
                  allowDeleting={isAdmin?true:false}
                  useIcons
                >
                  <Popup
                    title={popupTitle}
                    width="30%"
                    height="20%"
                    showTitle
                    minHeight='200px' 
                    minWidth='350px' 
                  />
                  <Form colCount={1} width="95%">
                    <FormItem dataField="active" label={{ text: 'Active' }} editorType="dxCheckBox" />
                    <FormItem dataField="brokerGroupName" editorType="dxTextBox" />
                  </Form>
                </Editing>

                <Selection mode="single" />

                <Column dataField="brokerGroupName" width="40%" allowFiltering>
                  <StringLengthRule
                    max={200}
                    message={ValidationMessage.NameMaxLength.replace('ZZZZ', '200')}
                  />
                  <RequiredRule message={ValidationMessage.RequiredField} />
                </Column>

                <Column dataField="status" caption="Status" width="15%" allowFiltering 
                  cellRender={renderStatusCell} />

                <Column dataField="lastUpdateDate" visible={true} allowFiltering={false} />
                <Column dataField="lastUpdateBy" visible={true} allowFiltering/>
                <Column dataField="active" visible={false} />

                <Column type="buttons" width="5%" visible={isAdmin?true:false}>
                  <Button name="delete" />
                </Column>

                <Toolbar visible={isAdmin?true:false}>
                  <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
                </Toolbar>
              </DataGrid>
            </div>
          </TabItem>
          <TabItem title="Broker Group Member">
            <div className="grid-container-small">
              <DataGrid
                dataSource={brokerGroupMembers}
                keyExpr="brokerGroupMemberId"
                showBorders
                paging={{ enabled: false }}
                width="50%"
                onRowDblClick={onMemberRowDblClick}
                onRowInserting={onMemberRowInserting}
                onRowUpdating={onMemberRowUpdating}
                onRowRemoving={onMemberRowRemoving}
                onRowRemoved={onMemberRowRemoved}
                onEditingStart={handleMemberEditingStart}
                onInitNewRow={handleMemberInitNewRow}
                rowAlternationEnabled
                hoverStateEnabled
                focusedRowEnabled
              >
                <FilterRow visible />
                <Editing 
                  mode="popup"
                  allowAdding={isAdmin?true:false}
                  allowUpdating={isAdmin?true:false}
                  allowDeleting={isAdmin?true:false}
                  useIcons
                >
                  <Popup
                    title={popupTitle}
                    width="30%"
                    height="30%"
                    showTitle
                  />
                  <Form colCount={1} width="95%">
                    <FormItem dataField="brokerGroupId" editorType="dxSelectBox" cssClass="dx-common-selectbox-short80"
                    editorOptions={{
                      items: brokerGroups, displayExpr: "brokerGroupName", valueExpr: "brokerGroupId",
                      searchEnabled: true, searchMode: "startswith"
                    }} />
                    <FormItem dataField="brokerCode" label={{text:"Broker"}} editorType="dxSelectBox" cssClass="dx-common-selectbox-short80"
                      editorOptions={{
                        items: brokers, displayExpr: "brokerName", valueExpr: "brokerCode",
                        searchEnabled: true, searchMode: "startswith", searchExpr: "brokerName",
                      }} />
                  </Form>
                </Editing>

                <Column dataField="brokerGroupId" caption="Broker Group" width="30%">
                  <Lookup dataSource={brokerGroups} valueExpr="brokerGroupId" displayExpr="brokerGroupName"/>
                  <RequiredRule message={ValidationMessage.RequiredField} />                  
                </Column>

                <Column dataField="brokerCode" caption="Broker Code" width="20%">
                  <Lookup dataSource={brokers} valueExpr="brokerCode" displayExpr="brokerCode"/>
                  <RequiredRule message={ValidationMessage.RequiredField} />                  
                </Column>

                <Column caption="Broker Name" width="40%" 
                  calculateCellValue={(rowData) => {
                    const p = brokers.find(p => p.brokerCode === rowData.brokerCode);
                    return p?.brokerName ?? null;
                  }}>
                </Column>
                <Column type="buttons" width="10%" visible={isAdmin?true:false}>
                  <Button name="delete" />
                </Column>
                <Toolbar visible={isAdmin} disabled={selectedBrokerGroupId?false:true}>
                  <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
                </Toolbar>
              </DataGrid>
            </div>
          </TabItem>
        </TabPanel>
      </div>
      {/** Toast */} 
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        width={400}
        position="bottom center"
        displayTime={3000}
        onHidden={hideToast}
      />
    </div>
  );
};

export default MaintenanceBrokerGroupGrid;