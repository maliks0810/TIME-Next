import { useState } from 'react';
import DataGrid, { Column, FilterRow, DataGridTypes} from 'devextreme-react/data-grid';
import Popup from 'devextreme-react/popup';
import Form, { Item } from 'devextreme-react/form';
import Button from 'devextreme-react/button';
import { DateBox } from 'devextreme-react';
import { Toast } from 'devextreme-react/toast';
import { useCommissionTrade } from '../hooks/useCommissionTradeData';
import LoadIndicator from 'devextreme-react/load-indicator';
import { useUserInfo } from '@platform/utils';
import { ToastConfig, ToastType} from '../components/toast-config';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export type BrokerDetailData = {
    execBroker: string,
    creditBroker: string,
    creditBrokerName: string,
}

export const CommissionTradeGrid = () => {
    const startDate = new Date();// start date - 14 Days back from of current day
    const endDate = new Date();  // end date - Current Day
    startDate.setDate(endDate.getDate() - 14);
    const userInfo = useUserInfo();

    const { isLoading, isSaveError, isBatchSaveError,
            selectedBeginDate,
            selectedEndDate,
            commissionTradesData,  
            reasonData,  
            brokersData,
            formData,
            uniqueCRBrokers,
            handleRefresh,
            handleFromDateChanged,
            handleToDateChanged,
            handleBatchUpdate,
            closeBatchUpdatePopup,
            onSelectionChanged,
            onRowDblClick,
            handleClosePopup,
            saveCommissionTradeChange,
            selectedRowKeys,
            batchPopupVisible,
            popupVisible,
            batchFormData,
            setBatchFormData,
            saveBatchUpdateChange,
            reloadCommissionTrades,
            isAdmin
        } = useCommissionTrade({userInfo, startDate, endDate});
    
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

    const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {  
        if (e.rowType === 'header') {  
            if (['shares', 'price', 'totalComm'].includes(e.column.dataField ?? '')) {  
                e.cellElement.style.textAlign = 'left';  
            }  
        } else if (e.rowType === 'data') {  
            if (['shares', 'price'].includes(e.column.dataField ?? '')) {  
                e.cellElement.style.textAlign = 'right';  
            } else if (['reason', 'ticker'].includes(e.column.dataField ?? '')) {  
                e.cellElement.style.textAlign = 'center';  
            }  
        }  
    };

    const onPopupSave = async () => {    
        try {  
            if(formData?.orderId == undefined)
                throw Error("Update failed due to Invalid key.");
            
            // Update existing  
            saveCommissionTradeChange(formData.orderId, formData.crBroker, formData.reason);             
            if(isSaveError)
                showToast('Update failed: Unknown error', 'error');  
            else {
                showToast('Saved successfully', 'success');  
                reloadCommissionTrades();
            }
        } catch (error) {  
            if (error instanceof Error) {  
                showToast('Save failed: ' + error.message, 'error');  
            }  
        }  
    }; 

    const onBatchPopupSave = async () => {
       try {            
            // Batch Update existing  
            saveBatchUpdateChange();             
            if(isBatchSaveError)
                showToast('Batch Update failed: Unknown error', 'error');  
            else {    
                showToast('Batch Saved successfully', 'success');            
                reloadCommissionTrades();
            }
        } catch (error) {  
            if (error instanceof Error) {  
                showToast('Save failed: ' + error.message, 'error');  
            }  
        } 
    };

    return (
    <div>  
        <div className="div-container-left">
            <DateBox labelMode="outside" label="From Date:" width={150} placeholder="From Date" onValueChanged={handleFromDateChanged} value={selectedBeginDate}
                displayFormat="MM/dd/yyyy" elementAttr={{ class: "dx-common-selectbox" }}/>
            <DateBox labelMode="outside" label="To Date:" width={150} placeholder="To Date" onValueChanged={handleToDateChanged} value={selectedEndDate}
                displayFormat="MM/dd/yyyy"  elementAttr={{ class: "dx-common-selectbox" }}/> 
            <Button type="default" text="Refresh" width={120} className='popup-button' icon="refresh" stylingMode='contained' onClick={handleRefresh}></Button>  
            <Button type="default" text="Batch Update" width={120} visible={selectedRowKeys.length > 1 ? true : false} 
                className='popup-button' stylingMode='contained' onClick={handleBatchUpdate}></Button>  
        </div>
        { isLoading ?
        <div className='div-loader'>  
            <LoadIndicator id="largeIndicator" height={40} width={40} />  
            <p>Loading...</p>  
        </div> 
        :        
        <div className='div-form-container'>
            <DataGrid 
                dataSource={commissionTradesData}
                keyExpr="orderId" // Unique key for each item
                allowColumnResizing={false}
                allowColumnReordering={false}
                showBorders={true}
                paging={{enabled:false}}
                onCellPrepared={onCellPrepared}
                onRowDblClick={(e:DataGridTypes.RowDblClickEvent) => {
                    if(!isAdmin) return;

                    if (e.rowType === 'data' && e.data) {  
                        e.component.clearSelection();
                        e.component.selectRows([e.key], false);
                        onRowDblClick(e.data);  
                    }
                }}
                hoverStateEnabled={true}
                selection={{mode: isAdmin? "multiple":"none", showCheckBoxesMode:"always"}}
                focusedRowEnabled={true}
                rowAlternationEnabled={true}
                onSelectionChanged={(e) => {
                    if(!isAdmin) return; 
                    onSelectionChanged(e.selectedRowKeys as string[])
                }}  
                scrolling={{mode:"virtual"}}
                width="98%%"
                >        
                <FilterRow visible={true} applyFilter="auto" />
                
                <Column dataField="side" caption="Side" width="5%" allowSorting={true} />
                <Column dataField="account" caption="Account" width="10%" allowSorting={true}/>
                <Column dataField="execBroker" caption="Exec Broker" width="15%" allowSorting={true}/>
                <Column dataField="creditBroker" caption="Credit Broker" width="15%" allowSorting={true}/>
                <Column dataField="reason" caption="Reason" width="5%" allowSorting={true}/>
                <Column dataField="ticker" caption="Ticker" width="5%" allowSorting={true}/>
                <Column dataField="trader" caption="Trader" width="8%" allowSorting={true}/>
                <Column dataField="cusip" caption="CUSIP" width="8%" allowSorting={true}/>
                <Column dataField="shares" caption="Shares" width="7%" allowSorting={true} dataType="number" alignment="right"/>%
                <Column dataField="price" caption="Price" width="7%" allowSorting={true} dataType="number" alignment="right" format={{ precision: 2, type:"fixedPoint" }}/>
                <Column dataField="totalComm" caption="Comm" width="7%" allowSorting={true} dataType="number" alignment="right" format={{ precision: 2, type:"fixedPoint" }} />
                <Column dataField="tradeDate" caption="TradeDate" width="8%" allowSorting={true} dataType="date" />
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
        {/* Popup form details */}
        <div>

            <Popup
                visible={popupVisible}
                onHiding={handleClosePopup}
                dragEnabled={false}
                showTitle={true}
                showCloseButton={true}
                title="Trade Ticket"
                width="min(650px, 96vw)"
                height="auto"
                className="modern-trade-popup"
                >
                <Form
                    formData={formData}
                    className="modern-popup-form"
                    labelMode="outside"
                    colCountByScreen={{
                    xs: 1,  // phones
                    sm: 1,  // small tablets
                    md: 2,  // tablets / small desktop
                    lg: 2   // desktop
                    // xl: 2 // optional
                    }}
                >
                    {/* =========================
                        LEFT COLUMN GROUP
                    ========================= */}
                    <Item
                    itemType="group"
                    caption="Order"
                    cssClass="form-section"
                    colSpan={1}
                    colCount={1}
                    >
                    <Item
                        dataField="orderId"
                        label={{ text: "Order ID" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    <Item
                        dataField="trader"
                        label={{ text: "Trader" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    <Item
                        dataField="side"
                        label={{ text: "Side" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />

                    <Item
                        dataField="cusip"
                        label={{ text: "Cusip" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    <Item
                        dataField="ticker"
                        label={{ text: "Ticker" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    <Item
                        dataField="currency"
                        label={{ text: "Currency" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    </Item>

                    {/* =========================
                        RIGHT COLUMN GROUP
                    ========================= */}
                    <Item
                    itemType="group"
                    caption="Execution"
                    cssClass="form-section"
                    colSpan={1}
                    colCount={1}
                    >
                    <Item
                        dataField="crBroker"
                        label={{ text: "Credit Broker" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            searchEnabled: true,
                            dataSource: brokersData.filter(
                                (broker) => broker.execBroker === formData?.exBroker
                            ),
                            displayExpr: "creditBrokerName",
                            valueExpr: "creditBroker"
                        }}
                        cssClass='dx-common-selectbox'
                    />

                    <Item
                        dataField="strategy"
                        label={{ text: "Strategy" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    <Item
                        dataField="exBroker"
                        label={{ text: "Exec Broker" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    <Item
                        dataField="division"
                        label={{ text: "Division" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />
                    </Item>

                    {/* =========================
                        FULL-WIDTH SECTION (spans both columns)
                    ========================= */}
                    <Item
                    itemType="group"
                    caption="Financials"
                    cssClass="form-section"
                    colSpan={2}        // 👈 spans both columns on md/lg
                    colCountByScreen={{ xs: 1, sm: 2, md: 3, lg: 3 }}
                    >
                    <Item
                        dataField="shares"
                        label={{ text: "Shares" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />

                    <Item
                        dataField="price"
                        label={{ text: "Price" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />

                    <Item
                        dataField="commission"
                        label={{ text: "Commission" }}
                        editorType="dxTextBox"
                        editorOptions={{ disabled: true }}
                    />

                    <Item
                        dataField="reason"
                        label={{ text: "Reason" }}
                        editorType="dxSelectBox"
                        colSpan={2} 
                        editorOptions={{
                            items: reasonData,
                            displayExpr: "name",
                            valueExpr: "code",
                            searchEnabled: false
                        }}
                        cssClass='dx-common-selectbox'
                    />
                    </Item>
                </Form>

                <div className="popup-footer" style={{textAlign:'center'}}>
                    <Button text="Cancel" stylingMode="text" onClick={handleClosePopup} />
                    <Button text="Save" type="default" onClick={onPopupSave} />
                </div>
            </Popup>

            </div>
            {/* Batch update popup */}  
            <Popup  
                visible={batchPopupVisible}  
                onHiding={closeBatchUpdatePopup}  
                dragEnabled={false}  
                showTitle={true}  
                title="Batch Update Trades"  
                className="custom-popup-class dx-popup-title"  
                width={400}  
                height={300}  
            >  
                {/* Example batch update form or content */}  
                <div style={{ padding: 20 }}>  
                    <Form colCount={1} formData={batchFormData} onFieldDataChanged={(e) => {     
                            if(e.dataField === "reason")                      
                                batchFormData.reason = e.value;
                            if(e.dataField === "creditBroker")                      
                                batchFormData.creditBroker = e.value;

                            setBatchFormData(batchFormData);
                        }}>
                        <Item dataField ="creditBroker" colSpan={1} label={{text:"Cr Broker"}} 
                          editorType="dxSelectBox" 
                          cssClass="dx-common-selectbox" 
                          editorOptions={{ 
                            searchEnabled: true,  
                            dataSource: uniqueCRBrokers,
                            displayExpr: "creditBrokerName",   // field to display
                            valueExpr: "creditBroker",     // field to use as the value                              
                          }} />
                        <Item colSpan={1}></Item>
                        <Item dataField ="reason" colSpan={1} label={{text:"Reason"}} 
                          editorType="dxSelectBox" 
                          cssClass="dx-common-selectbox" 
                          editorOptions = {{
                            items: reasonData,    // data source for the dropdown
                            displayExpr: "name",  // field to display
                            valueExpr: "code",    // field to use as the value                              
                            searchEnabled: false,  
                          }} />
                        <Item colSpan={1}></Item>
                        <Item colSpan={1}></Item>
                        <Item colSpan={1}></Item>
                        <Item colSpan={1} horizontalAlignment="right">
                            <div className="div-container-center">
                                <Button text="Save" width={150} height={32} className="dxButton" onClick={() => { onBatchPopupSave(); }}></Button>
                                <Button text="Cancel" width={150} height={32} className="dxButton" onClick={() => { closeBatchUpdatePopup(); }}></Button>
                            </div>
                        </Item> 
                    </Form>  
                </div>  
            </Popup>  
    </div>
    )
};

export default CommissionTradeGrid;