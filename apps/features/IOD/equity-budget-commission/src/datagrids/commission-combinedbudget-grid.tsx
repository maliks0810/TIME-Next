import { useRef } from "react";
import DataGrid, { Column, FilterRow, LoadPanel, DataGridRef } from 'devextreme-react/data-grid';
import { Button, DateBox, } from 'devextreme-react';
import { exportDataGrid } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import { useCommissionCombinedBudget } from '../hooks/useCombinedBudgetData'; // <-- our new hook
import LoadIndicator from 'devextreme-react/load-indicator';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export const CommissionCombinedBudgetGrid = () => {
// Derive an initial “year” range
const defaultYear = new Date().getFullYear();
const firstDayOfYear = new Date(defaultYear, 0, 1);
const lastDayOfYear = new Date(defaultYear, 11, 31);
const dataGridRef = useRef<DataGridRef|null>(null);
// Use hook calls
const {  
  selectedBeginDate,  
  selectedEndDate,  
  budgetData,  
  isLoading,
  handleRefresh,  
  handleFromDateChanged,
  handleToDateChanged,  
} = useCommissionCombinedBudget(firstDayOfYear, lastDayOfYear);  

  const handleExportClick = async () => 
  {
    if (!dataGridRef.current) {  
      alert("DataGrid is not ready, please try again later.");  
      return;  
    }
    try {  
      const workbook = new ExcelJS.Workbook();  
      const worksheet = workbook.addWorksheet("Securities");  

      await exportDataGrid({
        component: dataGridRef.current.instance(),
        worksheet,
        autoFilterEnabled: false
      })
      // column headers --  
      worksheet.insertRow(1,["From Date: "+selectedBeginDate.toLocaleDateString(),"","End Date: "+selectedEndDate.toLocaleDateString(),""]);
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).alignment = { horizontal: "center" };
      worksheet.insertRow(2,[]);

      // Generate a buffer  
      const buffer = await workbook.xlsx.writeBuffer(); 

      const fileName = `CombinedBudgets.xlsx`;  
      saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);  

      console.log("File exported:", fileName);  
    } catch (err) {  
      console.error("Export error:", err);  
      alert("Failed to export data. Check console for details.");  
    } 
  }

return (  
  <div>
    <div className='div-form-container'>
          <div className="div-container-left">  
            <DateBox  
              labelMode='outside'  
              label='From Date:'  
              placeholder='From Date'  
              onValueChanged={handleFromDateChanged}  
              value={selectedBeginDate}  
              displayFormat='MM/dd/yyyy'  
              elementAttr={{ class: 'dx-common-selectbox' }}  
              width={150}
            />  
            <DateBox  
              labelMode='outside'  
              label='To Date:'  
              placeholder='To Date'  
              onValueChanged={handleToDateChanged}  
              value={selectedEndDate}  
              displayFormat='MM/dd/yyyy'   
              elementAttr={{ class: 'dx-common-selectbox' }}  
              width={150}
            />        
            <Button text='Refresh' onClick={handleRefresh} hint="Refresh" type="default" stylingMode="contained" width={100} className='popup-button'/>
            <Button text='Export' onClick={handleExportClick} hint="Export to Excel" type="default" icon="exportxlsx" stylingMode="contained" width={100} className='popup-button'/>
          </div>
    </div>
    <div className='div-form-container'>       
      { isLoading ?
      <div className='div-loader'>  
        <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />  
        <p>Loading...</p>  
      </div> 
      :
      <DataGrid  
        dataSource={budgetData}  
        ref={dataGridRef}
        key='uniqueId' // Unique key for each item  
        width='100%'  
        allowColumnResizing={false}  
        allowColumnReordering={false}  
        showBorders={true}  
        paging={{ enabled: false }}  
        scrolling={{mode:'virtual'}}
        export={{
          enabled:false,
          formats:['xlsx'],
          texts: {exportAll:'Export to Excel'}
        }}
      >  
        <FilterRow visible={false} applyFilter='auto' />  
        <LoadPanel enabled={true} shading={true} />

        <Column dataField='division' caption='Division' allowSorting={true} width='15%' />  
        <Column dataField='intMstBkr' caption='IntMstBkr' allowSorting={true} width='10%' />  
        <Column dataField='masterBrokerName' caption='Master Broker Name' allowSorting={true} width='25%' />  
        <Column dataField='year' caption='Budget Year' allowSorting={true} width='10%' alignment='left' />  
        <Column dataField='totalBudget' caption='Total Budget' allowSorting={true} width='10%' dataType='number' alignment='left'  format={{ precision: 2 }}/>  
        <Column dataField='sumOfTotalComm' caption='Sum Of Total Comm' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />  
        <Column dataField='remaining' caption='Remaining' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />  
        <Column dataField='pctDone' caption='PCT Done' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />  
      </DataGrid>  
      }
    </div>  
  </div>
);  
};

export default CommissionCombinedBudgetGrid;