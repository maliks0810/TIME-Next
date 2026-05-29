import { useRef } from "react";
import DataGrid, { Column, FilterRow, LoadPanel, DataGridRef } from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react';
import { exportDataGrid } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import { useCommissionCombinedBudget } from '../hooks/useCombinedBudgetData';
import LoadIndicator from 'devextreme-react/load-indicator';
import NumberBox from 'devextreme-react/number-box';
import { ValueChangedEvent } from 'devextreme/ui/date_box';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export const CommissionCombinedBudgetGrid = () => {
  // Derive initial default year range
  const defaultYear = new Date().getFullYear();
  const firstDayOfYear = new Date(defaultYear, 0, 1);
  const lastDayOfYear = new Date(defaultYear, 11, 31);

  const dataGridRef = useRef<DataGridRef | null>(null);

  const {
    selectedBeginDate,
    selectedEndDate,
    budgetData,
    isLoading,
    handleRefresh,
    handleFromDateChanged,
    handleToDateChanged,
  } = useCommissionCombinedBudget(firstDayOfYear, lastDayOfYear);

  
  const createDateBoxEvent = (value: Date): ValueChangedEvent => {
    return {
      value
    } as ValueChangedEvent;
  };


  // Derive NumberBox value from selected begin date
  const selectedYear = selectedBeginDate
    ? new Date(selectedBeginDate).getFullYear()
    : defaultYear;

  // Convert year input into begin/end dates

  const handleYearChanged = (year: number | null) => {
    if (!year) return;

    const beginDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    handleFromDateChanged(createDateBoxEvent(beginDate));
    handleToDateChanged(createDateBoxEvent(endDate));
  };


  const handleExportClick = async () => {
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
      });

      worksheet.insertRow(1, [
        "From Date: " + selectedBeginDate.toLocaleDateString(),
        "",
        "End Date: " + selectedEndDate.toLocaleDateString(),
        ""
      ]);
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).alignment = { horizontal: "center" };
      worksheet.insertRow(2, []);

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `CombinedBudgets.xlsx`;

      saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
      console.log("File exported:", fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data. Check console for details.");
    }
  };

  return (
    <div>
      <div className='div-form-container'>
        <div className="div-container-left">
          <NumberBox
            labelMode="outside"
            label="Year:"
            placeholder="Enter Year"
            value={selectedYear}
            onValueChanged={(e) => handleYearChanged(e.value)}
            min={1900}
            max={2100}
            showSpinButtons={true}
            elementAttr={{ class: 'dx-common-selectbox' }}
            width={150}
          />

          <Button
            text='Refresh'
            onClick={handleRefresh}
            hint="Refresh"
            type="default"
            icon="refresh"
            stylingMode="contained"
            width={100}
            className='popup-button'
          />

          <Button
            text='Export'
            onClick={handleExportClick}
            hint="Export to Excel"
            type="default"
            icon="exportxlsx"
            stylingMode="contained"
            width={100}
            className='popup-button'
          />
        </div>
      </div>

      <div className='div-form-container'>
        {isLoading ? (
          <div className='div-loader'>
            <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />
            <p>Loading...</p>
          </div>
        ) : (
          <DataGrid
            dataSource={budgetData}
            ref={dataGridRef}
            keyExpr='uniqueId'
            width='100%'
            allowColumnResizing={false}
            allowColumnReordering={false}
            showBorders={true}
            paging={{ enabled: false }}
            scrolling={{ mode: 'virtual' }}
            export={{
              enabled: false,
              formats: ['xlsx'],
              texts: { exportAll: 'Export to Excel' }
            }}
          >
            <FilterRow visible={false} applyFilter='auto' />
            <LoadPanel enabled={true} shading={true} />

            <Column dataField='division' caption='Division' allowSorting={true} width='15%' />
            <Column dataField='intMstBkr' caption='IntMstBkr' allowSorting={true} width='10%' />
            <Column dataField='masterBrokerName' caption='Master Broker Name' allowSorting={true} width='25%' />
            <Column dataField='year' caption='Budget Year' allowSorting={true} width='10%' alignment='left' />
            <Column dataField='totalBudget' caption='Total Budget' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />
            <Column dataField='sumOfTotalComm' caption='Sum Of Total Comm' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />
            <Column dataField='remaining' caption='Remaining' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />
            <Column dataField='pctDone' caption='PCT Done' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />
          </DataGrid>
        )}
      </div>
    </div>
  );
};

export default CommissionCombinedBudgetGrid;
