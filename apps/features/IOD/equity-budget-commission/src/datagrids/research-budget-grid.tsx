import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import DataGrid, { Column, Editing, FilterRow, Button, Popup, Lookup, Form as GridForm, type DataGridRef, DataGridTypes, } from 'devextreme-react/data-grid';
import SelectBox from 'devextreme-react/select-box';
import { Item as FormItem } from 'devextreme-react/form';
import { Button as FormButton } from 'devextreme-react/button';
import { useUserInfo } from '@platform/utils';
import { MaintenanceDivision, MaintenanceMasterBroker } from '../datatypes/budget-maintenance-types';
import { ResearchBudget } from '../datatypes/research-budget-types';
import { NoTrailingForwardSlash } from '../utils/url-utils'
import { researchBudgetDataService } from '../services/research-budget-service'
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType} from '../components/toast-config'
import LoadIndicator from 'devextreme-react/load-indicator';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);
const apiMainEndpoint = apiBaseUrl+'/maintenance';

type DataErrorOccurredEvent  = DataGridTypes.DataErrorOccurredEvent;

// Exported handlers for isolated testing  
export const onRowDblClickHandler = (e: DataGridTypes.RowDblClickEvent) => {  
  e.component.editRow(e.rowIndex);  
};  

export const handleDataError = (showToast: (message: string, type: ToastType) => void) => (e: DataErrorOccurredEvent) => {  
  showToast(`Failed: An API error occurred. ${e.error?.message}`, 'error');  
};  
  
export const handleRowInserted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('New Budget added successfully!', 'success');  
};  
  
export const handleRowUpdated = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('Budget data updated successfully!', 'success');  
};  
  
export const handleRowDeleted = (showToast: (message: string, type: ToastType) => void) => () => {  
  showToast('Budget deleted successfully!', 'success');  
}; 

export const handleEditorPreparing = (e:DataGridTypes.EditorPreparingEvent) => {
    // Check if the editor is in the data row (which includes the popup form) 
    if (e.parentType === "dataRow" ){
      if (e.dataField === "divisionId" || e.dataField === "masterBrokerId" || e.dataField === "budgetYear") {
        if (!e.row?.isNewRow) {
          // Disable the editor when editing an existing row
          e.editorOptions.disabled = true;
        } else {
          // Enable the editor when adding a new row (default, but good to be explicit)
          e.editorOptions.disabled = false;         
        }    
      }
      if((e.dataField === "mBkrCode" || e.dataField === "total")){
        e.editorOptions.visible = false;
      }
    }
  };

const ResearchBudgetGrid: React.FC = () => {
  const defaultYear = new Date().getFullYear();
  const [, setBudgetData] = useState<ResearchBudget[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [budgetYears, setBudgetYears] = useState<number[]>()
  const [masterBrokers, setMarketBrokers] = useState<MaintenanceMasterBroker[]>([]);  
  const [masterDivisions, setMasterDivisions] = useState<MaintenanceDivision[]>([])
  const [popupTitle, setPopupTitle] = useState('');
  const dataGridRef = useRef<DataGridRef>(null)
  const userInfo = useUserInfo();

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
  const generateYears = (start:number, end:number, step = 1) => {
    const result = [];
        for (let i = start; i <= end; i += step) {
            result.push(i);
        }
        return result.sort(x=> x).reverse();
    };
    const dataSource = useMemo(() => {        
        return researchBudgetDataService(setBudgetData, userInfo, selectedYear, selectedDivision);
    }, [selectedYear, selectedDivision]);

  useEffect(() => {    
      fetch(apiMainEndpoint+'/master-brokers',{cache: "no-store"})
      .then(async response => {
        let mstBrkData :MaintenanceMasterBroker[] = await response.json();
        setMarketBrokers(mstBrkData);
      })
      .catch(error => console.error('Error fetching data:', error));
      
      fetch(apiMainEndpoint+'/divisions',{cache: "no-store"})
      .then(async response => {
        let divData :MaintenanceDivision[] = await response.json();
        const defValue: MaintenanceDivision = {divisionId:0, divisionName:"ALL", status:"Active", lastUpdateBy:userInfo.name, lastUpdateDate: new Date(defaultYear,12,31)}
        divData.unshift(defValue)
        setMasterDivisions(divData);
      })
      .catch(error => console.error('Error fetching data:', error));

      setBudgetYears(generateYears(2000, defaultYear));
  }, []);  

  const onEditingStart = () => {
        setPopupTitle('Edit Budget');
        // You can also access e.data to get the row data being edited
    };

  const onInitNewRow = () => {
        setPopupTitle('New Budget');
    };

  const onEditorPreparing = useCallback(handleEditorPreparing, []);

  const onRowDblClick = useCallback(onRowDblClickHandler, []);  

  const onDataErrorOccurred = useCallback(handleDataError(showToast), [showToast]);  
  
  const onRowInserted = useCallback(handleRowInserted(showToast), [showToast]);  
  
  const onRowUpdated = useCallback(handleRowUpdated(showToast), [showToast]);  
  
  const onRowDeleted = useCallback(handleRowDeleted(showToast), [showToast]); 

  const handleAddNewBudget = () => {
    dataGridRef.current?.instance().addRow();
  };

  return (
    <div>
      <div className="div-container-left">
        <SelectBox
            label="Division" labelMode="outside" 
            dataSource={masterDivisions}
            selectedItem={selectedDivision}
            value={selectedDivision}
            valueExpr="divisionId"
            displayExpr="divisionName"
            onValueChanged={(e) => setSelectedDivision(e.value)}
            placeholder="Division"
            showClearButton={true}
            elementAttr={{ className: 'dx-common-selectbox' }}
        />
        <SelectBox
            label="Year" labelMode="outside" 
            dataSource={budgetYears}
            value={selectedYear}
            onValueChanged={(e) => setSelectedYear(e.value)}
            placeholder="Budget Year"
            showClearButton={true}
            elementAttr={{ className: 'dx-common-selectbox' }}
        />
        <FormButton text="Add" type="default" icon="plus" onClick={handleAddNewBudget} stylingMode="contained" className='popup-button'/>
      </div>
      {!dataSource ?
      <div className='div-loader'>  
        <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />  
        <p>Loading...</p>  
      </div>
      :
       
      <div className='div-form-container'>
        <DataGrid 
          ref={dataGridRef}
          dataSource={dataSource}
          key="composite_Id" // Unique key for each item
          allowColumnResizing={false}
          allowColumnReordering={false}
          showBorders={true}
          onRowDblClick={onRowDblClick}
          onEditingStart={onEditingStart}
          onRowInserted={onRowInserted}
          onRowUpdated={onRowUpdated}
          onRowRemoved={onRowDeleted}
          onInitNewRow={onInitNewRow}
          paging={{enabled:false}}
          onEditorPreparing={onEditorPreparing}
          onDataErrorOccurred={onDataErrorOccurred}
          width='100%'
          remoteOperations={false}
          repaintChangesOnly={true}
          focusedRowEnabled={true}
          selection={{mode:"single"}}
          hoverStateEnabled={true}
        >        
          <FilterRow visible={false} applyFilter="auto" />
        
          <Editing
            mode="popup"
            allowAdding={false}
            allowUpdating={true}
            allowDeleting={true}
            useIcons={true}
          >
            <Popup
              showTitle={true}
              title={popupTitle}
              width="30%"
              height="auto"
              showCloseButton={true}
              dragEnabled={false}
              wrapperAttr={{ className: "modern-budget-popup" }}
            />

            <GridForm
              colCount={1}
              labelMode="outside"       
            >
              {/* Budget year */}
              <FormItem
                dataField="budgetYear"                
                label={{ text: "Budget Year" }} cssClass='textInput-popup-num'
              />

              {/* Organization */}
              <FormItem
                itemType="group"
                caption="Organization"
                cssClass="popup-section"
                colCount={1}
              >
                <FormItem
                  dataField="masterBrokerId"
                  cssClass="custom-popup-selectbox"
                  label={{ text: "Master Broker" }}
                />
                <FormItem
                  dataField="divisionId"
                  cssClass="custom-popup-selectbox"
                  label={{ text: "Division" }}
                />
              </FormItem>

              {/* Budget amounts */}
              <FormItem
                itemType="group"
                caption="Budget Amounts"
                cssClass="popup-section"
                colCount={2}
              >
                <FormItem
                  dataField="quarterOne"
                  cssClass="textInput-popup-num"
                  label={{ text: "Quarter 1" }}
                />
                <FormItem
                  dataField="quarterTwo"
                  cssClass="textInput-popup-num"
                  label={{ text: "Quarter 2" }}
                />
                <FormItem
                  dataField="quarterThree"
                  cssClass="textInput-popup-num"
                  label={{ text: "Quarter 3" }}
                />
                <FormItem
                  dataField="quarterFour"
                  cssClass="textInput-popup-num"
                  label={{ text: "Quarter 4" }}
                />
              </FormItem>
            </GridForm>
          </Editing>

          
          <Column dataField="divisionId" caption="Division" width="15%" allowSorting={true}>
            <Lookup dataSource={masterDivisions} valueExpr="divisionId" displayExpr="divisionName" />
          </Column>
          <Column dataField="masterBrokerId" caption="Master Broker" allowSorting={true} width="25%">
            <Lookup dataSource={masterBrokers} valueExpr="masterBrokerId" displayExpr="masterBrokerName" />
          </Column>
          <Column dataField="mBkrCode" caption="Master Broker Code" allowSorting={true} width="10%" formItem={{ visible: false }} />
          <Column dataField="budgetYear" caption="Budget Year" dataType="number" visible={false} />
          <Column dataField="quarterOne" caption="Q1 Budget" dataType="number" width="10%" alignment="left" format={{ type: "currency", precision: 2 }} />
          <Column dataField="quarterTwo" caption="Q2 Budget" dataType="number" width="10%" alignment="left" format={{ type: "currency", precision: 2 }} />
          <Column dataField="quarterThree" caption="Q3 Budget" dataType="number" width="10%" alignment="left"format={{ type: "currency", precision: 2 }} />
          <Column dataField="quarterFour" caption="Q4 Budget" dataType="number" width="10%" alignment="left" format={{ type: "currency", precision: 2 }} />
          <Column dataField="total" caption="Total" allowSorting={true}dataType="number" width="10%" alignment="left"  formItem={{ visible: false }} 
              format={{ type: "currency", precision: 2 }} />
          <Column type="buttons" width="5%">
                <Button name="edit" visible={false} />
                <Button name="delete" cssClass='dx-datagrid-delete-button' text="Delete Budget" visible={true} />
          </Column>
          
          {/*<Toolbar>            
            <ToolItem
              name="addRowButton"
              location="before"
              showText="always"
              options={{
                icon: "plus",
                text: "Add"                
              }}
            />
             ... other toolbar items 
          </Toolbar>*/}
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

export default ResearchBudgetGrid;
