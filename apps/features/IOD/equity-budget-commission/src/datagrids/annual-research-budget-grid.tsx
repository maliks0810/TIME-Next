import { useCallback, useState, useRef } from 'react';
import DataGrid, { Column, FilterRow, Lookup, RequiredRule, 
    type DataGridRef, DataGridTypes,
    RangeRule, } from 'devextreme-react/data-grid';
import SelectBox from 'devextreme-react/select-box';
import { useUserInfo } from '@platform/utils';
import { useResearchBudgets } from '../hooks/useResearchBudget'
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType} from '../components/toast-config'
import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';
import { Button as InputButton } from 'devextreme-react/button';
import { TextBox } from 'devextreme-react';
import { useMasterBrokers } from '../hooks/useMasterBrokerData';
import { useDepartments } from '../hooks/useDepartmentData';
import { useDivisions } from '../hooks/useDivisionData';
import { RequestResearchBudget } from '../datatypes/research-budget-types';
import { LoadIndicator } from 'devextreme-react';
import { ValidationMessage } from '../components/validations-message';

// Exported handlers for isolated testing  
export const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {  
  e.component.editRow(e.rowIndex);  
};  

export const handleDataError = (showToast: (message: string, type: ToastType) => void) => (e: DataGridTypes.DataErrorOccurredEvent) => {  
  showToast(`Failed: An API error occurred. ${e.error?.message}`, 'error');  
};
  
export const handleRowInserted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('New Budget added successfully!', 'success');  
};  

const AnnualResearchBudgetGrid: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [selectedForYear, setSelectedForYear] = useState<number>(currentYear);
    const [selectedFromYear, setSelectedFromYear] = useState<number>(0);
    const dataGridRef = useRef<DataGridRef>(null)
    const [selectedDivision, setSelectedDivision] = useState<number>(0);
    const [selectedMasterBroker, setSelectedMasterBroker] = useState<string>("");
    const userInfo = useUserInfo();

    const { masterBrokers } =useMasterBrokers({userInfo});
    const { departments } =useDepartments({userInfo});
    const { divisions } =useDivisions({userInfo});

    const {
        loading, researchBudgets, budgetYears,selectedRowKeys,uniqueYears,
        loadResearchBudgetData,
        insertResearchBudgets,
        onClearBudgetsClick,
        onSelectionChanged,
        onAddNewRecord,
        onBudgetQuarterValueChange,
        isAdmin
    } = useResearchBudgets({
        userInfo: userInfo,  
        budgetYear: selectedFromYear,  
        forYear: selectedForYear
    }); 

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

  const onGenerateClick = useCallback(async ()=> {
    if(selectedFromYear === 0) {    
        showToast(ValidationMessage.ResearchBudget.Mandatory,"error");
        return;
    }
    if(selectedForYear < 1900 || selectedForYear > 3000){
        showToast("Please enter valid Budget year.","error");
        return;
    }
    if(uniqueYears.find(x=> x === selectedForYear)){
        showToast("Research Budget data already present for requested year "+selectedForYear+".","error");
        return;
    }

    await loadResearchBudgetData();
    //clear masterbroker & division selection 
    setSelectedDivision(0);
    setSelectedMasterBroker("");
  }, [loadResearchBudgetData]);

  function SelectionHeaderCell() {
    return <span className='header-wrap'>Include/Exclude</span>;
  }

  const onAddNewClick = useCallback(async ()=> {
    if(!(selectedDivision || selectedMasterBroker)) {
        showToast("You must select Division and Master Broker for adding new row.","error");
        return;
    }
    const newItem: RequestResearchBudget = {
        budgetYear: selectedForYear,
        divisionId: selectedDivision,
        masterBrokerId: selectedMasterBroker,
        quarterFour: 0,
        quarterOne: 0,
        quarterTwo: 0,
        quarterThree: 0,
        lastUpdateBy: userInfo.name
    }
    onAddNewRecord(newItem);
    //clear masterbroker & division selection 
    setSelectedDivision(0);
    setSelectedMasterBroker("");
  }, [onAddNewRecord]);

const onCellSaving = useCallback((e:DataGridTypes.SavingEvent) => {  
    e.changes.forEach(cell => {  
        if (cell.type === 'update') {  
            onBudgetQuarterValueChange(cell.key, cell.data);  
        }  
    });  
    e.cancel = true;   
}, [onBudgetQuarterValueChange,researchBudgets]);

const onBudgetSaveClick = useCallback(async ()=> {
    try{
        const newData:RequestResearchBudget[] = researchBudgets;
        newData.map(x=> x.lastUpdateBy = userInfo.name);
        await insertResearchBudgets(newData);
        showToast("Data saved successfully","success");
    }
    catch(err){
        if (err instanceof Error) {  
            showToast(err.message,"error");  
        } else {  
            showToast("Error occurred while saving annual research budgets.","error");  
        }
    }
},[researchBudgets]);
    
  return (
    <div>
      <div className="div-container-left">
        <TextBox label="Create Budget for Year" labelMode="outside" width={130}          
          text={selectedForYear.toString()} value={selectedForYear.toString()} 
          mask="0000" placeholder="YYYY" maskInvalidMessage="Enter valid 4-digit year."
          onValueChanged={(e)=> setSelectedForYear(parseInt(e.value))}
          className='inputText-page' 
        >
            <RequiredRule message={ValidationMessage.RequiredField} />
            <RangeRule min={1900} max={2099} />       
        </TextBox>
        <SelectBox  
            label="Start From"  
            labelMode="outside"  
            dataSource={budgetYears}  
            value={selectedFromYear}  
            valueExpr="value"  
            displayExpr="text"  
            displayValue="value"  
            onValueChanged={(e) => setSelectedFromYear(e.value)}  
            placeholder="Start From"  
            showClearButton={true}  
            width={120}
            className='dx-common-selectbox'
        >
            <RequiredRule message={ValidationMessage.RequiredField} />
        </SelectBox>              
        <InputButton type='default' disabled={!isAdmin} stylingMode='contained' hint='Generate' text='Generate' className='popup-button' onClick={onGenerateClick} />
        <InputButton type='default' disabled={!isAdmin} stylingMode='contained' hint='Clear Budget Amounts' text='Clear' className='popup-button' onClick={onClearBudgetsClick} />
        <InputButton type='default' disabled={!isAdmin} stylingMode='contained' hint='Save Changes' text='Save' className='popup-button' onClick={onBudgetSaveClick} />
        <SelectBox
            label="Division" labelMode="outside" 
            dataSource={divisions}
            selectedItem={selectedDivision}
            value={selectedDivision}
            valueExpr="divisionId"
            displayExpr="divisionName"
            onValueChanged={(e) => setSelectedDivision(e.value)}
            placeholder="Division"
            showClearButton={true}
            width={200}
            className='dx-common-selectbox'
        />
        <SelectBox
            label="Master Broker" labelMode="outside" 
            dataSource={masterBrokers}
            selectedItem={selectedMasterBroker}
            value={selectedMasterBroker}
            valueExpr="masterBrokerId"
            displayExpr="masterBrokerName"
            onValueChanged={(e) => setSelectedMasterBroker(e.value)}
            placeholder="Master Broker"
            showClearButton={true}
            width={300}
            className='dx-common-selectbox'
        />
        <InputButton text="Add" id="bthAddNew" hint="Add New Broker" disabled={!isAdmin} className='popup-button' type='default' stylingMode='contained' icon="plus" onClick={onAddNewClick} />
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
          dataSource={researchBudgets}
          keyExpr="composite_Id" // Unique key for each item
          allowColumnResizing={false}
          allowColumnReordering={false}
          showBorders={true}
          selectedRowKeys={selectedRowKeys}
          paging={{enabled:false}}
          width="100%"
          remoteOperations={false}
          focusedRowEnabled={true}
          wordWrapEnabled={true}
          selection={{
            mode:"multiple", 
            selectAllMode:"allPages", 
            showCheckBoxesMode:"always", 
            allowSelectAll:false,            
          }}
          onSelectionChanged={(e) => onSelectionChanged(e.selectedRowKeys as string[])}  
          scrolling={{mode:"virtual"}}
          editing={{
            mode:"cell",
            allowUpdating:isAdmin,
            useIcons:true,
          }}
          onSaving={onCellSaving}          
        >        
          <FilterRow visible={false} applyFilter="auto" />
                      
          <Column type="selection" width="10%" headerCellRender={SelectionHeaderCell} />        
          <Column dataField="divisionId" caption="Division" width="10%" allowSorting={true} allowEditing={false}>
            <Lookup dataSource={divisions} valueExpr="divisionId" displayExpr="divisionName" />
          </Column>
          <Column dataField="departmentId" caption="Department" width="12%" allowSorting={true} allowEditing={false}>
            <Lookup dataSource={departments} valueExpr="departmentId" displayExpr="departmentName" />
          </Column>
          <Column dataField="masterBrokerId" caption="Master Broker" allowSorting={true} width="26%" allowEditing={false}>
            <Lookup dataSource={masterBrokers} valueExpr="masterBrokerId" displayExpr="masterBrokerName" />
          </Column>
          <Column dataField="mBkrCode" caption="Broker Code" allowSorting={true} width="10%" allowEditing={false} />
          <Column dataField="budgetYear" caption="Budget Year" dataType="number" visible={false} />
          <Column dataField="quarterOne" caption="Q1 Budget" dataType="number" width="8%" alignment="left" format={{ type: "currency", precision: 2 }} />
          <Column dataField="quarterTwo" caption="Q2 Budget" dataType="number" width="8%" alignment="left" format={{ type: "currency", precision: 2 }} />
          <Column dataField="quarterThree" caption="Q3 Budget" dataType="number" width="8%" alignment="left"format={{ type: "currency", precision: 2 }} />
          <Column dataField="quarterFour" caption="Q4 Budget" dataType="number" width="8%" alignment="left" format={{ type: "currency", precision: 2 }} />       
        </DataGrid>
      </div>
      }
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

export default AnnualResearchBudgetGrid;