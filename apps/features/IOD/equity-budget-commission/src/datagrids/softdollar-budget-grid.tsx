import { useState, useRef, useCallback } from 'react';
import DataGrid, {
Column,
FilterRow,
Button as GridButton,
Lookup,
type DataGridRef,
DataGridTypes,
} from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import CheckBox from 'devextreme-react/check-box';
import { Toast } from 'devextreme-react/toast';
import Popup from 'devextreme-react/popup';
import Form, { Item as FormItem } from 'devextreme-react/form';
import TabPanel, { Item as TabItem } from 'devextreme-react/tab-panel';
import { LoadIndicator, TextArea } from 'devextreme-react';

import { useUserInfo } from '@platform/utils';
import { RequestSoftDollarBudget, SoftDollarBudget, SoftDollarBudgetAccount, SoftDollarBudgetAccountUser, SoftDollarBudgetChangeLog, SoftDollarBudgetComment, SoftDollarBudgetDetail } from '../datatypes/research-budget-types';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

import { ToastConfig, ToastType} from '../components/toast-config';
import { BlockContainer, BlockFormContainer } from '../components/block-container';

// import the custom hook
import { useSoftDollarBudgets } from '../hooks/useSoftDollarBudget';
import { useSoftDollarBudgetDetails } from '../hooks/useSoftDollarBudgetWithDetails';

export type BudgetYear = {
value: number;
text: string;
};

const handleRowDeleted = (
  showToast: (message: string, type: ToastType) => void
  ) => () => {
  showToast('Softdollar Budget deleted successfully!', 'success');
};

const SoftDollarBudgetGrid: React.FC = () => {
// States
const defaultYear = new Date().getFullYear();
const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
const dataGridRef = useRef<DataGridRef>(null);
const userInfo = useUserInfo();

// Parent popup state  
const [popupVisible, setPopupVisible] = useState(false);  
const [isAddMode, setIsAddMode] = useState(false);  
const [editingData, setEditingData] = useState<SoftDollarBudget>();  
const [editingDetailData, setEditingDetailData] = useState<Partial<SoftDollarBudgetDetail>>({});  
const [loadingEditData, setLoadingEditData] = useState(false);  

// Child popup (Accounts)  
const [childAccountPopupVisible, setChildAccountPopupVisible] = useState(false);  
const [childAccountIsAddMode, setChildAccountIsAddMode] = useState(false);  
const [childAccountEditingData, setChildAccountEditingData] = useState<Partial<SoftDollarBudgetAccount>>();  
const [childAccountPopupLoading, setChildAccountPopupLoading] = useState(false);  
//const [accountsData, setAccountsData] = useState<SoftDollarBudgetAccount[]>([]);  
const [isAccountDataLoading, setIsAccountDataLoading] = useState(false);  
// Child popup - Changelog grid
const [changeLogsData, setChangeLogsData] = useState<SoftDollarBudgetChangeLog[]>([]);  
const [isChangeLogLoading, setIsChangeLogLoading] = useState(false);  
//Child popup - Comments grid
const [commentsData, setCommentsData] = useState<SoftDollarBudgetComment[]>([]);  
const [isCommentsLoading, setIsCommentsLoading] = useState(false);

const [selectedSoftBudgetAcct,setSelectedSoftBudgetAcct] = useState<number>(0);
const [selectedSoftBudgetId,setSelectedSoftBudgetId] = useState<number>(0);
//Child popup - user allocations
const [childUserAllocationPopupVisible,setChildUserAllocationPopupVisible] = useState(false);
const [childUserAllocationIsAddMode, setChildUserAllocationIsAddMode] = useState(false);  
const [childAccountUserPopupLoading, setChildAccountUserPopupLoading] = useState(false);  
const [childAccountUserEditingData, setChildAccountUserEditingData] = useState<Partial<SoftDollarBudgetAccountUser>>();  
const [budgetDataSaving, setBudgetDataSaving] = useState(false);
const [userDataSaving, setUserDataSaving] = useState(false);

// Toast handling  
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

// Hook that returns a DevExtreme store + data array  
const { departments, brokers, mstBrokers, services, softBudgetData, budgetYears, 
  loading,
  //loadSoftDollarBudgetData, 
  insertSoftDollarBudget, 
  updateSoftDollarBudget, 
  removeSoftDollarBudget,
  isAdmin
  } = useSoftDollarBudgets({  
    userInfo: userInfo,  
    budgetYear: selectedYear,  
  });  

  const {
     isUserLoading,
     softBudgetAccounts,
     softBudgetDetails,
     users,
     softAccountUserAllocations,
     loadSoftDollarBudgetDetails,
     reloadSoftBudgetDetails,
     loadSoftdollarBudgetAccounts,
     createSoftdollarBudgetAccount,
     modifySoftdollarBudgetAccount,
     removeSoftdollarBudgetAccount,
     loadSoftAccountUserAllocations,
     createSoftAccountUserAllocation,
     modifySoftAccountUserAllocation,
     removeSoftAccountUserAllocation,
     clearSoftAccountUserAllocationData,
     reloadUserAllocations
  } = useSoftDollarBudgetDetails({
    userData: userInfo, 
    softdollarBudgetId: selectedSoftBudgetId, 
    softdollarBudgetAccountId: selectedSoftBudgetAcct
  });

// Hard/Soft mapping  
const budgetTypeMap = [  
  { id: 1, text: 'Hard Dollar' },  
  { id: 2, text: 'Soft Dollar' },  
];  
 
// Double-click row → open parent popup  
const openParentPopup = (e: DataGridTypes.RowDblClickEvent) => {  
  if(!isAdmin) return;

  setSelectedSoftBudgetId(e.key);
  openEditBudgetPopup(e.key, e.data);  
};

const renderStatusCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {  
  const isActive = cellData.value === 'A';  
  const statusText = isActive ? 'Active' : 'Inactive';  
  return (  
    <div className="grid-container-flex">  
      <CheckBox value={isActive} disabled={true} />  
      <span>{statusText}</span>  
    </div>  
  );  
};  

const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {  
  if (e.rowType === 'header') {  
    if (e.column.dataField === 'budgetTypeId') {  
      e.cellElement.style.textAlign = 'left';  
    }  
  } else if (e.rowType === 'data') {  
    if (e.column.dataField === 'budgetTypeId') {  
      e.cellElement.style.textAlign = 'left';  
    }  
  }  
};  

  const onRowRemoving = async (e: DataGridTypes.RowRemovingEvent<SoftDollarBudget, number>) => {  
    try {  
      const sdbId = e.key;
      const softDetailData = await reloadSoftBudgetDetails(sdbId);
      if(Array.isArray(softDetailData)){
        if(softDetailData[0]?.accounts?.length??0 > 0){
          showToast('This Softdollar Budget can not be deleted as it has Accounts associated.', 'error');  
          return;
        }
      }
      else
      {
        if(softDetailData?.accounts?.length??0 > 0){
          showToast('This Softdollar Budget can not be deleted as it has Accounts associated.', 'error');  
          return;
        }
      }

      await removeSoftDollarBudget(sdbId);  
      handleRowDeleted(showToast)();
    } catch (err) {  
      showToast(`Delete error: ${(err as Error).message}`, 'error');  
      e.cancel = true;  
    }  
  };  

// ─────────────────────────────────────────────────────────────────  
// Parent Popup logic  
// ─────────────────────────────────────────────────────────────────  

const openAddBudgetPopup = () => {  
  setEditingDetailData({ year: selectedYear });  
  setIsAddMode(true);  
  setPopupVisible(true);  
};  

const openEditBudgetPopup = async (key: number, data: SoftDollarBudget) => {  
  setIsAddMode(false);  
  setLoadingEditData(true);  
  setPopupVisible(true);  
  setSelectedSoftBudgetAcct(0);
  setEditingData(data);
  setSelectedSoftBudgetId(key);
  try {  
    // In a real app, you might re-fetch a "detail" endpoint.
    await loadSoftdollarBudgetAccounts(key);

    const detail = await loadSoftDollarBudgetDetails(key);
    const detailData: SoftDollarBudgetDetail = detail; // as SoftDollarBudgetDetail; 
    detailData.softDollarBudgetId = data.softDollarBudgetId;
    detailData.year = data.year;
    detailData.serviceName = data.serviceName;
    detailData.departmentId = data.departmentId;
    
    if (Array.isArray(detailData)) {  
      setEditingDetailData(detailData[0] || {});  // pick the first item, or empty  
    } else {  
      setEditingDetailData(detailData);   
    }

    //Load the child changelog data
    if(detailData.changeLog){
      const changelogs = detailData.changeLog ?? [];
      setIsChangeLogLoading(true);
      setChangeLogsData(changelogs);
    }

    //Load the child comments data
    if(detailData.comments){
      const comments = detailData.comments ?? [];
      setIsCommentsLoading(true);
      setCommentsData(comments);
    }

  } catch (error) {  
    if (error instanceof Error) {  
      showToast(error.message || 'Failed to load details', 'error');  
    }  
    setPopupVisible(false);  
  } finally {  
    setLoadingEditData(false);  
    setIsAccountDataLoading(false);
    setIsChangeLogLoading(false);
    setIsCommentsLoading(false);
  }  
};  

const onAddBudgetDetailPopupSave = async () => {    
  try {      
    setBudgetDataSaving(true);
    // Insert new  
    await insertSoftDollarBudget(editingDetailData);  
      
    setPopupVisible(false);  
    showToast('Saved successfully', 'success');  
  } catch (error) {  
    if (error instanceof Error) {  
      showToast('Save failed while Adding: ' + error.message, 'error');  
    }  
  }
  finally{
    setBudgetDataSaving(false);
  }  
};
const onBudgetDetailPopupSave = async () => {    
  try {     

    if (isAddMode) {  
      // Insert new  
      await insertSoftDollarBudget(editingDetailData);  
    } else {  
      if(editingDetailData.softDollarBudgetId == undefined)
        throw Error("Update failed due to Invalid key.");

      // Update existing  
      const editDetailReq: RequestSoftDollarBudget = 
      { ...editingDetailData, 
        serviceId: editingData?.serviceId ?? 0,
        budgetTypeId: editingData?.budgetTypeId ?? 0,
        lastUpdateBy: userInfo.name ?? "",
        brokerId: editingData?.brokerId ?? 0,
        departmentId: editingData?.departmentId ?? 0,
        year: selectedYear,
        ratio: editingDetailData.ratio ?? 0
      }
      await updateSoftDollarBudget(selectedSoftBudgetId, editDetailReq);  
    }  
    setPopupVisible(false);  
    showToast('Saved successfully', 'success');  
  } catch (error) {  
    if (error instanceof Error) {  
      showToast('Save failed while Adding: ' + error.message, 'error');  
    }  
  }  
}; 

const onBudgetDetailPopupCancel = () => {  
  setPopupVisible(false);  
  clearSoftAccountUserAllocationData();
};  

const onBudgetRowClick = useCallback(async(acctKey: number) => {
  const accountId = acctKey;
  setSelectedSoftBudgetAcct(accountId);
  //const accoundEditData = accountsData.find(x=> x.softDollarBudgetAccountId == accountId);
  //setChildAccountEditingData(accoundEditData);
  await loadSoftAccountUserAllocations(accountId);
},[loadSoftAccountUserAllocations])

// ─────────────────────────────────────────────────────────────────  
// Child Popup (Accounts) logic  
// ─────────────────────────────────────────────────────────────────  

const openAddAccountChildPopup = () => {  
  setChildAccountIsAddMode(true);  
  setChildAccountEditingData({ 
    serviceName: editingDetailData?.serviceName ?? "",
    startDate: new Date(selectedYear,0,1),
    endDate: new Date(selectedYear,11,31)
  });  
  setChildAccountPopupVisible(true);  
};  

const openEditChildAccountPopup = async (accountData: SoftDollarBudgetAccount) => {  
  setChildAccountIsAddMode(false);  
  setChildAccountPopupLoading(true);  
  setChildAccountPopupVisible(true);  
  try {  
    // If needed, re-fetch the full account detail here. For now, we use the in-memory data:  
    setChildAccountEditingData(accountData);  
  } catch (error) {  
    if (error instanceof Error) {  
      showToast(error.message || 'Failed to load account details', 'error');  
    }  
    setChildAccountPopupVisible(false);  
  } finally {  
    setChildAccountPopupLoading(false);  
  }  
};  

const onChildAccountPopupSave = async () => { 
  try {  
    if (childAccountIsAddMode) {  
      if (!childAccountEditingData) return;  

      childAccountEditingData.year = selectedYear;
      childAccountEditingData.departmentId = editingDetailData.departmentId;
      childAccountEditingData.softDollarBudgetId = editingDetailData.softDollarBudgetId;
      childAccountEditingData.divisionId = editingDetailData.divisionId;

      await createSoftdollarBudgetAccount(childAccountEditingData);
      //setAccountsData((prev) => [...prev, inserted]);
    } else {  
      if (!childAccountEditingData) return;

      childAccountEditingData.year = selectedYear;
      childAccountEditingData.departmentId = editingDetailData.departmentId;
      childAccountEditingData.softDollarBudgetId = editingDetailData.softDollarBudgetId;
      childAccountEditingData.divisionId = editingDetailData.divisionId;

      await modifySoftdollarBudgetAccount(selectedSoftBudgetAcct, childAccountEditingData);  
      //setAccountsData((prev) =>     prev.map((item) => (item.softDollarBudgetAccountId === updated.softDollarBudgetAccountId ? updated : item)));  
    }    

    setChildAccountPopupVisible(false);  
    showToast('Sofdollar Budget Account saved successfully', 'success');    
  } catch (error) {  
    if (error instanceof Error) {  
      showToast('Save failed: ' + error.message, 'error');  
    }
  }
  finally{
      setIsCommentsLoading(false);
      setIsChangeLogLoading(false);
      setIsAccountDataLoading(false);
  }
};  

const onChildAccountPopupCancel = () => setChildAccountPopupVisible(false);  

const onChildAccountDelete = async (softDollarBudgetAccountId: number) => { 
  setSelectedSoftBudgetAcct(softDollarBudgetAccountId);
  const allocationData = await reloadUserAllocations(softDollarBudgetAccountId);
  if(allocationData.length > 0){  
    showToast('This Account can not be deleted as it has User Allocations associated.', 'error');  
    return;
  }

  if (!window.confirm('Are you sure you want to delete this account?')) return;  
  try {  
    await removeSoftdollarBudgetAccount(softDollarBudgetAccountId);  
    //setAccountsData((prev) => prev.filter((item) => item.softDollarBudgetAccountId !== softDollarBudgetAccountId));  
    showToast('Account deleted successfully', 'success');  
  } catch (error) {  
    if (error instanceof Error) {  
      showToast('Delete failed: ' + error.message, 'error');  
    }  
  }  
};  
// Child Popup - User Allocations Logic
//===============================================
const openAddPopupChildAccountUser = () => {  
  const acctData = softBudgetAccounts.find(s=> s.softDollarBudgetAccountId === selectedSoftBudgetAcct);
  setChildUserAllocationIsAddMode(true);  
  setChildUserAllocationPopupVisible(true);  
  setChildAccountUserEditingData({ 
    account: acctData?.account,
    startDate: new Date(selectedYear,0,1),
    endDate: new Date(selectedYear,11,31),
    serviceId: acctData?.serviceId
  });  
  setChildUserAllocationPopupVisible(true);  
};  

const onChildPopupUserAllocationCancel = () => setChildUserAllocationPopupVisible(false); 

const openEditPopupChildAccountUser = async (accountUserData: SoftDollarBudgetAccountUser) => {  
  const acctData = softBudgetAccounts.find(s=> s.softDollarBudgetAccountId === selectedSoftBudgetAcct);
  setChildUserAllocationIsAddMode(false);  
  setChildAccountUserPopupLoading(true);  
  setChildUserAllocationPopupVisible(true);  
  try {  
    // If needed, re-fetch the full account detail here. For now, we use the in-memory data:
    accountUserData.account = acctData?.account;  
    accountUserData.serviceId= acctData?.serviceId ?? 0;
    setChildAccountUserEditingData(accountUserData);  
  } catch (error) {  
    if (error instanceof Error) {  
      showToast(error.message || 'Failed to load user details', 'error');  
    }  
    setChildUserAllocationPopupVisible(false);  
  } finally {  
    setChildAccountUserPopupLoading(false);  
  }  
};  

const onChildAccountUserDelete = async (userAllocationId: number) => { 
  if (!window.confirm('Are you sure you want to delete this User?')) return;  
  try {  
    await removeSoftAccountUserAllocation(userAllocationId);  
    showToast('User deleted successfully', 'success');  
  } catch (error) {  
    if (error instanceof Error) {  
      showToast('Delete failed: ' + error.message, 'error');  
    }  
  }
};  

const onChildPopupUserAllocationSave = async () => {  
  try {  
    setUserDataSaving(true);
    if (childUserAllocationIsAddMode) {  
      if (!childAccountUserEditingData) return;    

      const acctData = softBudgetAccounts.find(s=> s.softDollarBudgetAccountId === selectedSoftBudgetAcct);
      
      childAccountUserEditingData.softDollarBudgetAccountId = selectedSoftBudgetAcct;
      childAccountUserEditingData.budgetYear = selectedYear;
      childAccountUserEditingData.serviceId = acctData?.serviceId
      childAccountUserEditingData.commission = (childAccountUserEditingData.totalCost??0) * (editingDetailData.ratio??0);
      
      await createSoftAccountUserAllocation(childAccountUserEditingData);
    } else {  
      if (!childAccountUserEditingData) return;  

      childAccountUserEditingData.softDollarBudgetAccountId = selectedSoftBudgetAcct;
      childAccountUserEditingData.budgetYear = selectedYear;
      childAccountUserEditingData.commission = (childAccountUserEditingData.totalCost??0) * (editingDetailData.ratio??0);

      await modifySoftAccountUserAllocation(childAccountUserEditingData.userAllocationId??0, childAccountUserEditingData);  
    }    

    showToast('Softdollar Budget Account User saved successfully', 'success');
    setChildUserAllocationPopupVisible(false);  

    await loadSoftdollarBudgetAccounts(selectedSoftBudgetId);

    const detail = await loadSoftDollarBudgetDetails(selectedSoftBudgetId);
    const detailData = (softBudgetDetails? softBudgetDetails : detail) as SoftDollarBudgetDetail; 
    if(editingData){
      detailData.softDollarBudgetId = editingData.softDollarBudgetId;
      detailData.year = editingData.year;
      detailData.serviceName = editingData.serviceName;
      detailData.departmentId = editingData.departmentId;
    }   
    
    setEditingDetailData(detailData);

    //Load the child changelog data
    if(detailData.changeLog){
      const changelogs = detailData.changeLog ?? [];
      setIsChangeLogLoading(true);
      setChangeLogsData(changelogs);
    }

    //Load the child comments data
    if(detailData.comments){
      const comments = detailData.comments ?? [];
      setIsCommentsLoading(true);
      setCommentsData(comments);
    }
    setUserDataSaving(false);
  } catch (error) {  
    if (error instanceof Error) {  
      showToast('Save failed: ' + error.message, 'error');  
    }  
  } 
  finally{
    setIsCommentsLoading(false);
    setIsChangeLogLoading(false);
    setIsAccountDataLoading(false);
    setUserDataSaving(false);
  }
};

return (  
  <div>  
    <div className="div-container-left"> 
      <SelectBox  
        label="Budget Year"  
        labelMode="outside"  
        dataSource={budgetYears}  
        value={selectedYear}  
        valueExpr="value"  
        displayExpr="text"  
        displayValue="value"  
        onValueChanged={(e) => setSelectedYear(e.value)}  
        placeholder="Budget Year"  
        showClearButton={true}  
        width="10%"  
        className='dx-common-selectbox'
      />  
      <Button text="Add" id="btnNewService" visible={isAdmin?true:false} stylingMode="contained" className='popup-button' type="default" icon="plus" onClick={openAddBudgetPopup} />  
    </div>  
    { loading ? 
    <div className='div-loader'>  
      <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />  
      <p>Loading...</p>  
    </div>  
    :
    <div className='div-form-container'>  
      <DataGrid  
        ref={dataGridRef}  
        dataSource={softBudgetData}  
        keyExpr="softDollarBudgetId"  
        allowColumnResizing={false}  
        hoverStateEnabled={true}  
        selection={{ mode: 'single' }}  
        focusedRowEnabled={true}  
        allowColumnReordering={false}  
        showBorders={true}  
        onRowDblClick={openParentPopup}  
        onRowRemoving={onRowRemoving}
        paging={{ enabled: false }}  
        onCellPrepared={onCellPrepared}  
        editing={{  
          allowAdding: false,  
          allowUpdating: false,  
          allowDeleting: isAdmin,  
          useIcons: true,
        }}  
        width="100%"
      >  
        <FilterRow visible={false} applyFilter="auto" />  
        <Column dataField="year" caption="Year" visible={false} allowSorting={true} />  
        <Column dataField="serviceId" caption="Service" width="15%" allowSorting={true}>  
          <Lookup dataSource={services} valueExpr="serviceId" displayExpr="ServiceName" />  
        </Column>  
        <Column dataField="departmentId" caption="Department"  width="15%" allowSorting={true}>  
          <Lookup dataSource={departments}  valueExpr="departmentId" displayExpr="departmentName" />  
        </Column>  
        <Column dataField="status" caption="Status" allowSorting={true} width="5%" cellRender={renderStatusCell} />  
        <Column dataField="masterBrokerId" caption="Master Broker" allowSorting={true} width="20%" >  
          <Lookup dataSource={mstBrokers} valueExpr="masterBrokerId" displayExpr="masterBrokerName" />  
        </Column>  
        <Column dataField="budgetTypeId" caption="Budget Type" allowSorting={true} width="10%" >  
          <Lookup dataSource={budgetTypeMap} valueExpr="id" displayExpr="text" />  
        </Column>  
        <Column dataField="calculatedHardDollar" caption="Hard Dollar" dataType="number" alignment="left" format={{ type: 'currency', precision: 2 }}  />  
        <Column dataField="ratio" caption="Ratio" dataType="number" alignment="left" format={{ maximumFractionDigits: 5, minimumFractionDigits: 5, precision: 5 }}  />  
        <Column dataField="calculatedSoftDollar" caption="Soft Dollar"  dataType="number" alignment="left" format={{ type: 'currency', precision: 2 }}  />  
        <Column type="buttons" width="5%" visible={isAdmin}>  
          <GridButton name="edit" visible={false} />  
          <GridButton name="delete" cssClass="dx-datagrid-delete-button" text="Delete Budget" visible={true} />  
        </Column>  
      </DataGrid>  
    </div>  
    }
    {/* Toast for messages */}  
    <Toast  
      visible={toastConfig.visible}  
      message={toastConfig.message}  
      width={400}  
      type={toastConfig.type}  
      position="bottom center"  
      onHidden={hideToast}  
      displayTime={3000}  
    />  

    {/* Parent Popup */}  
    <Popup  
      visible={popupVisible}  
      onHiding={onBudgetDetailPopupCancel}  
      showTitle={true}  
      title={isAddMode ? 'New Service' : 'Soft Dollar Budget Details'}  
      width={isAddMode ? "30%" : "80%"}  
      minWidth={400}
      height={isAddMode ? "45%" : "90%"}
      minHeight={400}
      dragEnabled={false}  
      hideOnOutsideClick={true}  
      wrapperAttr={{ class: 'custom-popup-class' }}  
    >  
      {isAddMode ? (  
        <div>  
          <Form  
            width="95%" 
            height="100%" 
            formData={editingDetailData}  
            colCount={1}  
            onFieldDataChanged={(e) =>  
              setEditingDetailData((prev) => ({ ...prev, [e.dataField as string]: e.value }))  
            }  
          >  
            <FormItem dataField="year" label={{ text: 'Year' }} editorOptions={{ readOnly: true, width: '40%' }} cssClass='textInput-popup-num'/>  
            <FormItem dataField="budgetTypeId" label={{ text: 'Soft/Hard Dollar' }} editorType="dxSelectBox"  cssClass='dx-common-selectbox-short60'
              editorOptions={{  
                dataSource: budgetTypeMap, valueExpr: 'id', displayExpr: 'text' }} />  
            <FormItem dataField="departmentId" label={{ text: 'Department' }} editorType="dxSelectBox" cssClass='dx-common-selectbox-short80'
              editorOptions={{
                  dataSource: departments, valueExpr: 'departmentId', displayExpr: 'departmentName',
                  searchEnabled: true, searchMode: "contains", placeholder: "Select a department..." }} />  
            <FormItem dataField="brokerId" label={{ text: 'Broker' }} editorType="dxSelectBox" cssClass='dx-common-selectbox-short80'
              editorOptions={{  
                dataSource: brokers, valueExpr: 'brokerId', displayExpr: 'brokerName',
                searchEnabled: true, searchMode: "contains", placeholder: "Select a broker..." }} />  
            <FormItem dataField="serviceId" label={{ text: 'Service' }} editorType="dxSelectBox" cssClass='dx-common-selectbox-short80'
              editorOptions={{  
                dataSource: services, valueExpr: 'serviceId',  displayExpr: 'ServiceName',
                searchEnabled: true, searchMode: "contains", placeholder: "Select a service..."  }}  />  
            <FormItem dataField="ratio" label={{ text: 'Ratio' }} editorType="dxNumberBox" editorOptions={{width: '40%'}} cssClass='textInput-popup-num'/>  
            <FormItem colSpan={1} itemType='empty'/>             
          </Form>
          <div className="popup-footer" style={{textAlign:'center', margin:10}}>
            <Button text="Cancel" onClick={onBudgetDetailPopupCancel} className="dxButton" width={100} height={35} style={{margin:10}}/>
            <Button text={budgetDataSaving?"Saving..":"Save"} disabled={budgetDataSaving} onClick={onAddBudgetDetailPopupSave} width={100} height={35} className="dxButton" style={{margin:10}}/>
        </div>
        </div>  
        ) : loadingEditData && softBudgetDetails? (  
          <div className='div-loader'>  
            <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={60} />  
            <p>Loading details data...</p>  
          </div>   
        ) : (  
        <div>  
          <BlockFormContainer  
            title={`${editingDetailData?.serviceName ?? ''} - ${editingDetailData?.year ?? ''}`}  
            className="form-title-bg"  
          >  
            <div className="div-form-container">  
              <Form 
                colCount={3} 
                formData={editingDetailData} 
                width='98%'>  
                <FormItem dataField="broker" label={{ text: 'Broker' }} editorOptions={{ readOnly: true }} />  
                <FormItem dataField="hardDollar" label={{ text: 'Hard Dollar' }} editorType="dxNumberBox" editorOptions={{  
                    readOnly: true, format: { type: 'currency', precision: 2 } }} />  
                <FormItem dataField="softDollar" label={{ text: 'Soft Dollar' }} editorType="dxNumberBox" editorOptions={{  
                    readOnly: true, format: { type: 'currency', precision: 2 } }} />  
                <FormItem dataField="division" label={{ text: 'Division' }} editorOptions={{ readOnly: true }} />  
                <FormItem dataField="ratio" label={{ text: 'Ratio' }} editorOptions={{ readOnly: false }} />  
                <FormItem colSpan={1} horizontalAlignment="right">
                  <div className="div-container-center">
                      <Button text="Save" id="btnEditBudget" width={100} height={32} className="dxButton" onClick={onBudgetDetailPopupSave} />
                  </div>
                </FormItem>
                <FormItem colSpan={3}>  
                  <TextArea value={editingDetailData.serviceDescription} labelMode="outside" label="Service Description" readOnly={true} 
                    style={{ width: '100%', height: 'auto', resize: 'vertical' }}/>  
                </FormItem>  
              </Form>  
            </div>  
          </BlockFormContainer>  

          <BlockFormContainer title="Accounts" className="form-title">  
            { isAccountDataLoading ? (
              <div className='div-loader'>  
                <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={60} />  
                <p>Loading accounts data...</p>  
              </div> ) : (
            <div>  
              <Button text="Add" id="btnNewAccount" visible={isAdmin} icon="plus" onClick={openAddAccountChildPopup} />  
              <DataGrid  
                dataSource={softBudgetAccounts}  
                keyExpr="softDollarBudgetAccountId"  
                hoverStateEnabled={true}  
                selection={{ mode: 'single' }}  
                focusedRowEnabled={true}  
                allowColumnReordering={false}  
                showBorders={true}  
                onRowDblClick={(e) => openEditChildAccountPopup(e.data)} 
                onRowClick={(e)=> onBudgetRowClick(e.key)}
                paging={{ enabled: false }}
                editing={{  
                  allowAdding: false,  
                  allowUpdating: false,  
                  allowDeleting: isAdmin,  
                  useIcons: true,  
                }}
              >  
                <Column dataField="account" caption="Account Name"  width="25%"/>  
                <Column dataField="status" caption="Status"  width="10%"/>  
                <Column dataField="cost" caption="Hard Dollar"  width="15%" format= {{ type: 'currency', precision: 2 }}/>  
                <Column dataField="softDollar" caption="Soft Dollar"  width="15%" format= {{ type: 'currency', precision: 2 }}/>  
                <Column dataField="startDate" caption="Start Date" dataType='date' format="yyyy-MM-dd"  width="15%"/>  
                <Column dataField="endDate" caption="End Date" dataType='date' format="yyyy-MM-dd"  width="15%"/>                  
          
                <Column type="buttons" width="5%" visible={isAdmin}>  
                  <GridButton name="edit" visible={false}
                    onClick={(e) => {  
                      e.event?.stopPropagation();  
                      if (e.row?.data) {  
                        openEditChildAccountPopup(e.row.data);  
                      }  
                    }}  
                  />  
                  <GridButton name="delete" visible={true}
                    onClick={async (e) => {  
                      e.event?.stopPropagation();  
                      if (e.row?.data?.softDollarBudgetAccountId != null) {  
                        await onChildAccountDelete(e.row.data.softDollarBudgetAccountId);  
                      }  
                    }}  
                  />  
                </Column>  
              </DataGrid>  
            </div>  
            )}
          </BlockFormContainer>  

          <BlockContainer title="">  
            <div className="custom-tab-panel">  
              <TabPanel>  
                <TabItem title="User Allocations" >
                  {isUserLoading ? (  
                    <div className="div-loader">  
                      <LoadIndicator height={40} width={60} />  
                      <p>Loading user allocations data...</p>  
                    </div>  
                  ) : (  
                    <div>
                      <Button text="Add" id="btnNewUserAllocation" visible={ isAdmin && selectedSoftBudgetAcct > 0} icon="plus" onClick={openAddPopupChildAccountUser} />
                      <DataGrid  
                        dataSource={softAccountUserAllocations}  
                        keyExpr="userAllocationId"  
                        showBorders={true}  
                        paging={{ enabled: false }}  
                        onRowDblClick={(e) => openEditPopupChildAccountUser(e.data)}                                               
                        width='100%'
                        editing={{  
                          allowAdding: false,  
                          allowUpdating: false,  
                          allowDeleting: true,  
                          useIcons: true,  
                        }}
                      >  
                        <Column dataField="userId" caption="User" width="20%" >
                          <Lookup dataSource={users} displayExpr="userName" valueExpr="userId" />
                        </Column>
                        <Column dataField="userStatus" caption="User Status" width="10%" />  
                        <Column dataField="departmentId" caption="Department" dataType="string"  width="25%">
                          <Lookup dataSource={departments} valueExpr="departmentId" displayExpr="departmentName" />
                        </Column> 
                        <Column dataField="totalCost" caption="Hard Dollar" dataType="number"  width="10%" format= {{ type: "currency", precision: 2 }}/>  
                        <Column calculateCellValue={(row) => row.totalCost * row.ratio} caption="Soft Dollar" dataType="number"  width="10%" format= {{ type: 'currency', precision: 2 }}/>  
                        <Column dataField="startDate" caption="Start Date" dataType='date' format="yyyy-MM-dd"  width="10%"/>  
                        <Column dataField="endDate" caption="End Date" dataType='date' format="yyyy-MM-dd"  width="10%"/>  
                        <Column type="buttons" width="5%" visible={isAdmin}>  
                          <GridButton name="edit" visible={false}
                            onClick={(e) => {  
                              e.event?.stopPropagation();  
                              if (e.row?.data) {  
                                openEditPopupChildAccountUser(e.row.data);  
                              }  
                            }}  
                          />  
                          <GridButton name="delete" visible={true}
                            onClick={async (e) => {  
                              e.event?.stopPropagation();  
                              if (e.row?.data?.userAllocationId != null) {  
                                await onChildAccountUserDelete(e.row.data.userAllocationId);  
                              }  
                            }}  
                          />  
                        </Column> 
                      </DataGrid>  
                    </div>
                  )}
                </TabItem>  
                <TabItem title="Invoices" />  
                <TabItem title="Comments" >
                  { isCommentsLoading && commentsData.length > 0 ? (
                    <div className="div-loader">  
                      <LoadIndicator height={40} width={60} />  
                      <p>Loading comments data...</p>  
                    </div> 
                  ) : (
                    <DataGrid 
                      dataSource={commentsData}  
                      keyExpr="commentId"  
                      showBorders={true}  
                      paging={{ enabled: false }}  
                      width='100%'
                    >
                      <Column dataField="commentId" caption="Id" dataType="number" visible={false}/>
                      <Column dataField="timestamp" caption="TimeStamp" dataType="datetime" visible={true} width="20%"/>
                      <Column dataField="comment" caption="Comment" dataType="string" visible={true} width="80%"/>
                    </DataGrid>
                  )}
                </TabItem>
                <TabItem title="Change Log" >
                  {isChangeLogLoading && changeLogsData.length > 0 ? (  
                    <div className="div-loader">  
                      <LoadIndicator height={40} width={60} />  
                      <p>Loading changelogs data...</p>  
                    </div>  
                  ) : (
                    <DataGrid 
                      dataSource={changeLogsData}  
                      keyExpr="changeLogId"  
                      showBorders={true}  
                      paging={{ enabled: false }}  
                      width='100%'
                    >
                      <Column dataField="changeLogId" caption="Id" dataType="number" visible={false}/>
                      <Column dataField="actionType" caption="Action Type" dataType="string" visible={true} width="10%"/>
                      <Column dataField="logDescription" caption="Log Description" dataType="string" visible={true} width="60%"/>
                      <Column dataField="timestamp" caption="TimeStamp" dataType="datetime" visible={true} width="20%"/>
                      <Column dataField="user" caption="User" dataType="string" visible={true} width="10%"/>
                    </DataGrid>
                  )
                  }
                </TabItem>
              </TabPanel>  
            </div>  
          </BlockContainer>  
        </div>  
      )}  
    </Popup>  

    {/* Child Popup for Accounts */}  
    <Popup  
      visible={childAccountPopupVisible}  
      onHiding={onChildAccountPopupCancel}  
      showTitle={true}  
      title={childAccountIsAddMode ? 'Create New Account' : 'Edit Account'}  
      width="35%"  
      minWidth={400}
      height="30%"  
      minHeight={250}
      dragEnabled={false}  
      hideOnOutsideClick={true}  
      wrapperAttr={{ class: 'custom-popup-class' }}
    >  
      {childAccountPopupLoading ? ( 
        <div className='div-loader'>  
         <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={60} />  
         <p>Loading account details...</p>  
        </div>  
      ) : (  
        <Form colCount={2} width="95%" formData={childAccountEditingData}>  
          <FormItem dataField="serviceName" label={{ text: 'Service' }} editorOptions={{ readOnly: true }} />  
          <FormItem dataField="startDate" label={{ text: 'Start Date' }} editorType="dxDateBox" />  
          <FormItem dataField="account" label={{ text: 'Name' }} />  
          <FormItem dataField="endDate" label={{ text: 'End Date' }} editorType="dxDateBox" /> 
          <FormItem colSpan={2} itemType='empty'/>  
          <FormItem colSpan={2} itemType='empty'/>  
          <FormItem colSpan={2} horizontalAlignment="center">  
            <div className="div-container-center">  
              <Button text="Save" onClick={onChildAccountPopupSave} width={100} className="dxButton" />  
              <Button text="Cancel" onClick={onChildAccountPopupCancel} width={100} className="dxButton" />  
            </div>  
          </FormItem>
        </Form>  
      )}  
    </Popup>

    {/* Child Popup for User Allocations */}  
    <Popup
      visible={childUserAllocationPopupVisible}
      onHiding={onChildPopupUserAllocationCancel}  
      showTitle={true}  
      title={childUserAllocationIsAddMode ? 'Create New User' : 'Edit User'}  
      width='35%'
      minWidth={400}
      height='30%'  
      minHeight={280}
      dragEnabled={false}
      hideOnOutsideClick={true}  
      wrapperAttr={{ class: 'custom-popup-class' }} 
    >
      {childAccountUserPopupLoading || userDataSaving? ( 
        <div className='div-loader'>  
         <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={60} />  
         <p>Loading User details...</p>  
        </div>  
      ) : (
        <Form colCount={2} formData={childAccountUserEditingData}>
          <FormItem dataField="account" label={{ text: 'Account' }} editorOptions={{ readOnly: true }} />  
          <FormItem dataField="totalCost" label={{ text: 'Hard Dollar' }} editorType="dxNumberBox" />  
          <FormItem dataField="userId" label={{text: 'User'}} visible={childUserAllocationIsAddMode}
            editorType="dxSelectBox"
            editorOptions={{
              dataSource: users, valueExpr: 'userId', displayExpr: 'userName',
              searchEnabled: true, searchMode: "contains", placeholder: "Select a user..."
            }}/>
          <FormItem dataField="startDate" label={{ text: 'Start Date' }} editorType="dxDateBox" />  
          <FormItem dataField="departmentId" label={{text: 'Department'}} visible={childUserAllocationIsAddMode} editorType="dxSelectBox" 
            editorOptions={{
              dataSource: departments, valueExpr: 'departmentId', displayExpr: 'departmentName',
              searchEnabled: true, searchMode: "contains", placeholder: "Select a department..."
            }} />
          <FormItem dataField="endDate" label={{ text: 'End Date' }} editorType="dxDateBox" /> 
          <FormItem colSpan={2} itemType='empty'/>  
          <FormItem colSpan={2} itemType='empty'/>  
          <FormItem colSpan={2} horizontalAlignment="center">  
            <div className="div-container-center">  
              <Button text="Save" onClick={onChildPopupUserAllocationSave} width={100} className="dxButton" />  
              <Button text="Cancel" onClick={onChildPopupUserAllocationCancel} width={100} className="dxButton" />  
            </div>  
          </FormItem>  
        </Form> 
      )}
    </Popup>
  </div>  
);  
};

export default SoftDollarBudgetGrid;