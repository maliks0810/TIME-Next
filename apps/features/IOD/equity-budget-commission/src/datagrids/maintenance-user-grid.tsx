import { useState, useCallback } from 'react';
import DataGrid, {
  Column,
  DataGridTypes,
  Editing,
  Popup,
  Button,
  Item,
  Form,
  Toolbar,
  LoadPanel,
  Lookup,
  FilterRow,
  Scrolling,
  RequiredRule,
} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import { MaintenanceUser } from '../datatypes/budget-maintenance-types';
import { useUserInfo } from '@platform/utils';
import { Toast } from 'devextreme-react/toast';
import { useUsers } from '../hooks/useUserData';
import TabPanel, { Item as TabItem } from 'devextreme-react/tab-panel';
import { ToastConfig, ToastType } from '../components/toast-config';
import { Item as FormItem } from 'devextreme-react/form';
import { ValidationMessage } from '../components/validations-message';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

type DataErrorOccurredEvent = DataGridTypes.DataErrorOccurredEvent;

// Exported handlers for isolated testing
export const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {
  e.component.editRow(e.rowIndex);
};

export const handleDataError =
  (showToast: (message: string, type: ToastType) => void) =>
  (e: DataErrorOccurredEvent) => {
    showToast(`Failed: An API error occurred. ${e.error?.message}`, 'error');
  };

export const handleRowInserted =
  (showToast: (message: string, type: ToastType) => void) =>
  () => {
    showToast('New User added successfully!', 'success');
  };

export const handleRowUpdated =
  (showToast: (message: string, type: ToastType) => void) =>
  () => {
    showToast('User data updated successfully!', 'success');
  };

export const handleRowDeleted =
  (showToast: (message: string, type: ToastType) => void) =>
  () => {
    showToast('User deleted successfully!', 'success');
  };

export const renderStatusCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {
  const isActive = cellData.value === 'Active';
  const statusText = isActive ? 'Active' : 'Inactive';

  return (
    <div className="grid-container-flex">
      <CheckBox value={isActive} disabled={true} />
      <span>{statusText}</span>
    </div>
  );
};

const MaintenanceUserGrid: React.FC = () => {
  const [popupTitle, setPopupTitle] = useState('');
  const userInfo = useUserInfo();

  const { users, divisions, departments, locations, addUser, modifyUser, removeUser, reload, isAdmin } =
    useUsers({ userInfo });

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

  const onRowDblClick = useCallback((e: DataGridTypes.RowDblClickEvent) => {
      if (!isAdmin) return;
  
      onRowDblClickHandler(e);  
    }, [isAdmin]);

  const renderStatusCellCallback = useCallback(renderStatusCell, []);

  const handleEditingStart = () => {
    setPopupTitle('Edit User');
  };

  const handleInitNewRow = (e: DataGridTypes.InitNewRowEvent<MaintenanceUser>) => {
    setPopupTitle('New User');
    e.data.active = true;
  };

  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);

  /**
   * ✅ Single CRUD pipeline (insert/update/remove)
   * - cancel default grid data mutation (prevents dupes with array dataSource)
   * - run async API calls in e.promise
   */
  const onSaving = useCallback(
    (e: DataGridTypes.SavingEvent<MaintenanceUser, number>) => {
      if (!e.changes?.length) return;

      // Prevent DataGrid from applying changes to `users` array itself
      e.cancel = true;

      // Let DataGrid wait for async save logic
      e.promise = (async () => {
        try {
          for (const change of e.changes) {
            const { type, key, data } = change;

            if (type === 'insert') {
              await addUser(data as MaintenanceUser);
              handleRowInserted(showToast)();
            } else if (type === 'update') {
              // change.data contains only changed fields; hook should merge
              await modifyUser(key as number, data ?? {});
              handleRowUpdated(showToast)();
            } else if (type === 'remove') {
              await removeUser(key as number);
              handleRowDeleted(showToast)();
            }
          }

          // Close popup and clear edit state
          e.component.cancelEditData();

          // Refresh list from server/state source
          await reload();
        } catch (err) {
          showToast(`Save error: ${(err as Error).message}`, 'error');
          // Throw so DevExtreme knows the save failed (keeps edit state)
          throw err;
        }
      })();
    },
    [addUser, modifyUser, removeUser, reload, showToast]
  );

  return (
    <div className="nested-tab-container">
      <TabPanel>
        <TabItem title="User">
          <div>
            <DataGrid
              dataSource={users}
              id="user_grid"
              keyExpr="userId"
              allowColumnResizing={true}
              allowColumnReordering={true}
              showBorders={true}
              rowAlternationEnabled={true}
              paging={{ enabled: false }}
              onRowDblClick={onRowDblClick}
              onSaving={onSaving}
              onEditingStart={handleEditingStart}
              onInitNewRow={handleInitNewRow}
              className="grid-full-block"
              remoteOperations={false}
              repaintChangesOnly={true}
              onDataErrorOccurred={onDataErrorOccurred}
              hoverStateEnabled={true}
              focusedRowEnabled={true}
            >
              <Scrolling mode="infinite" columnRenderingMode="virtual" />
              <LoadPanel enabled={true} />
              <FilterRow visible={true} applyFilter="auto" />

              <Editing 
                mode="popup" 
                allowUpdating={isAdmin ?true:false}  
                allowAdding={isAdmin ?true:false}  
                allowDeleting={isAdmin ?true:false} 
                useIcons={true}>
                <Popup
                  showTitle={true}
                  title={popupTitle}
                  width="50%"
                  height="30%"
                  minHeight='300px' 
                  minWidth='450px' 
                  wrapperAttr={{ className: 'custom-popup-class' }}
                />
                <Form width="95%">
                  {/* Tip: FormItem works best with dataField vs name */}
                  <FormItem dataField="firstName" editorType="dxTextBox" cssClass="textInput-popup" />
                  <FormItem dataField="lastName" editorType="dxTextBox" cssClass="textInput-popup" />
                  <FormItem dataField="active" label={{ text: 'Active' }} editorType="dxCheckBox" />
                  <FormItem dataField="departmentId" editorType="dxSelectBox" cssClass="dx-common-selectbox" 
                    editorOptions={{
                      items: departments, displayExpr: "departmentName", valueExpr: "departmentId",
                      searchEnabled: true, searchMode: "contains", searchExpr: "departmentName"
                    }}/>
                  <FormItem dataField="divisionId" editorType="dxSelectBox" cssClass="dx-common-selectbox" 
                    editorOptions={{
                      items: divisions, displayExpr: "divisionName", valueExpr: "divisionId",
                      searchEnabled: true, searchMode: "contains", searchExpr: "divisionName"
                    }}/>
                  <FormItem dataField="locationCode" editorType="dxSelectBox" cssClass="dx-common-selectbox" 
                    editorOptions={{
                      items: locations, displayExpr: "locationDescription", valueExpr: "locationCode",
                      searchEnabled: true, searchMode: "contains", searchExpr: "locationDescription"
                    }}/>
                  <FormItem dataField="startDate" editorType="dxDateBox" cssClass="textInput-popup-date" />
                  <FormItem dataField="endDate" editorType="dxDateBox" cssClass="textInput-popup-date" />
                </Form>
              </Editing>

              <Column dataField="userId" caption="Id" formItem={{ visible: false }} allowEditing={false} visible={false} dataType="number" />
              <Column dataField="userName" caption="User Name" formItem={{ visible: false }} width="15%" dataType="string" />
              <Column dataField="firstName" caption="First Name" width="10%" dataType="string" >
                  <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>
              <Column dataField="lastName" caption="Last Name" width="10%" dataType="string" >
                  <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>
              <Column
                dataField="status"
                caption="Status"
                width="5%"
                dataType="string"
                filterOperations={['startswith', '=']}
                cellRender={renderStatusCellCallback}
              />

              <Column dataField="departmentId" caption="Department" width="15%" dataType="string">
                <Lookup dataSource={departments} valueExpr="departmentId" displayExpr="departmentName" />
                <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>

              <Column dataField="divisionId" caption="Division" width="15%" dataType="string">
                <Lookup dataSource={divisions} valueExpr="divisionId" displayExpr="divisionName" />
                <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>

              <Column dataField="locationCode" caption="Location" width="10%" dataType="string">
                <Lookup dataSource={locations} valueExpr="locationCode" displayExpr="locationDescription" />
                <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>

              <Column
                dataField="lastUpdateDate"
                formItem={{ visible: false }}
                caption="Last Update Dt"
                allowEditing={false}
                allowFiltering={false}
                width="8%"
                dataType="date"
                format="MM/dd/yyyy hh:mm a"
              />
              <Column dataField="startDate" caption="Start Date" visible={false} allowFiltering={false} dataType="date" format="MM/dd/yyyy" >
                  <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>
              <Column dataField="endDate" caption="End Date" visible={false} allowFiltering={false} dataType="date" format="MM/dd/yyyy" >
                  <RequiredRule message={ValidationMessage.RequiredField} />          
              </Column>
              <Column dataField="lastUpdateBy" formItem={{ visible: false }} caption="Last Update By" allowEditing={false} width="8%" dataType="string" />
              <Column dataField="active" visible={false} />

              <Column type="buttons" width="4%" visible={isAdmin ?true:false} >
                <Button name="edit" visible={false} />
                <Button name="delete" cssClass="dx-datagrid-delete-button" text="Delete Broker" visible={true} />
              </Column>

              <Toolbar visible={isAdmin ?true:false} >
                <Item name="addRowButton" location="before" showText="always" options={{icon:'plus', text:'Add'}}/>
              </Toolbar>
            </DataGrid>
          </div>
        </TabItem>

        <TabItem title="Comments">
          <div>
            <DataGrid dataSource={''} id="comment_grid" width={400}>
              <Column dataField="lastUpdateDate" caption="Last Update Dt" dataType="date" format="MM/dd/yyyy hh:mm a" />
              <Column dataField="lastUpdateBy" caption="Last Update By" dataType="string" />
              <Column dataField="comments" caption="Comments" dataType="string" />
            </DataGrid>
          </div>
        </TabItem>

        <TabItem title="Changelog"></TabItem>
      </TabPanel>

      <Toast
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

export default MaintenanceUserGrid;