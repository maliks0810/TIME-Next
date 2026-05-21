import { useState, useCallback } from "react";
import DataGrid, { Column, FilterRow } from 'devextreme-react/data-grid';
import { useCSAMonthlyCommission } from '../hooks/useCSAMonthlyCommissionData';
import LoadIndicator from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export const CSAMonthlyCommissionGrid = () => {
    const currentMonth = new Date().getMonth();
    const[selectedMonth, setSelecetdMonth] = useState<number>(currentMonth + 1);
    const months = [
        { value:1, text: "Jan" },
        { value:2, text: "Feb" },
        { value:3, text: "Mar" },
        { value:4, text: "Apr" },
        { value:5, text: "May" },
        { value:6, text: "Jun" },
        { value:7, text: "Jul" },
        { value:8, text: "Aug" },
        { value:9, text: "Sep" },
        { value:10, text: "Oct" },
        { value:11, text: "Nov" },
        { value:12, text: "Dec" },
    ];
    const {
        isLoading,
        csaMonthlyComms,
        reload
    }  = useCSAMonthlyCommission({month: selectedMonth});

    const handleRefresh = useCallback(() => {  
        reload();  
    }, [reload]); 

    return(
      <div>
        <div className="div-container-left"> 
            <SelectBox  
                label="Month"  
                labelMode="outside"  
                dataSource={months}  
                value={selectedMonth}  
                valueExpr="value"  
                displayExpr="text"  
                displayValue="value"  
                onValueChanged={(e) => setSelecetdMonth(e.value)}  
                placeholder="Select Month"  
                showClearButton={true}  
                width={120}
            />
            <Button text="Refresh" id="btnRefresh" stylingMode="contained" className='popup-button' type="default" icon="refresh" onClick={handleRefresh} />  
      </div>  
        { isLoading ? 
        <div className='div-loader'>  
            <LoadIndicator id="largeIndicator" className='dxLoader' height={40} width={40} />  
            <p>Loading...</p>  
        </div>  
        :
        <div className='div-form-container'>
            <DataGrid  
                dataSource={csaMonthlyComms}
                keyExpr="rowNum"  
                allowColumnResizing={false}  
                hoverStateEnabled={true}  
                focusedRowEnabled={true}  
                showBorders={true}  
                width="60%"
            >  
                <FilterRow visible={true} applyFilter="auto" />

                <Column dataField="rowNum" visible={false} />  
                <Column dataField="division" caption="Division" width="25%" allowFiltering allowSorting />  
                <Column dataField="execMbrokerName" caption="Execution" width="30%" allowFiltering allowSorting />  
                <Column dataField="creditMBrokerName" caption="Credit" width="30%" allowFiltering allowSorting />           
                <Column dataField="commission" caption="Commission" width="15%" alignment="left" allowFiltering allowSorting
                    format={{ type: 'currency', precision: 2 }} />  
            </DataGrid>  
        </div>  
        }
    </div>
  );
}

export default CSAMonthlyCommissionGrid;