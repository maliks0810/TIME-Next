import DataGrid, { Column, FilterRow, LoadPanel, Grouping, Summary, GroupItem, DataGridTypes } from 'devextreme-react/data-grid';
import { Button, DateBox, } from 'devextreme-react';
import { useCommissionTradeRecon } from '../hooks/useCommissionTradeReconData'; // <-- our new hook
import LoadIndicator from 'devextreme-react/load-indicator';
import { useUserInfo } from '@platform/utils';
import Popup from 'devextreme-react/popup';
import Form, { Item } from 'devextreme-react/form';
import { Toast } from 'devextreme-react/toast';
import { ToastConfig, ToastType} from '../components/toast-config';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';
import { useState } from 'react';

export type BrokerDetailData = {
    execBroker: string,
    creditBroker: string,
    creditBrokerName: string,
}

export const CommissionReconGrid = () => {
// Derive an initial “year” range
const startDate = new Date();// start date - 14 Days back from of current day
const endDate = new Date();  // end date - Current Day
startDate.setDate(endDate.getDate() - 14);
const userInfo = useUserInfo();

    // Use hook calls
const {  
  selectedBeginDate,  
  selectedEndDate,  
  reconData,  
  isLoading,
  handleRefresh,  
  handleFromDateChanged,  
  handleToDateChanged,  
  isAdmin,
  popupVisible,
  reconDetailData,
  reasonsData,
  brokersData,
  onRowDblClick,
  handleClosePopup,
  isSaveError,
  reloadReconData,
  saveCommissionReconChange
} = useCommissionTradeRecon({userInfo, startDate: startDate, endDate:endDate});  

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

  const groupCellRender = (cellInfo:DataGridTypes.ColumnGroupCellTemplateData) => {
    // Access the first summary item (which is our count)
    const count = cellInfo.summaryItems[0].value;
    const countText = `(${count} Trades)`
    // Format the display string manually
    const displayText = `${cellInfo.value}`;

    return <div><strong>{displayText}</strong> {countText}</div>; 
  }; 

  const onPopupSave = async () => {    
      try {  
          if(reconDetailData?.orderId == undefined)
              throw Error("Update failed due to Invalid key.");
          
          // Update existing  
          saveCommissionReconChange(reconDetailData.orderId, reconDetailData.crBroker, reconDetailData.reason);             
          if(isSaveError)
              showToast('Update failed: Unknown error', 'error');  
          else {
              showToast('Saved successfully', 'success');  
              reloadReconData();
          }
      } catch (error) {  
          if (error instanceof Error) {  
              showToast('Save failed: ' + error.message, 'error');  
          }  
      }  
  }; 

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
            <Button text='Refresh' onClick={handleRefresh} hint="Refresh" type="default" icon="refresh" stylingMode="contained" width={120} className='popup-button'/>
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
        dataSource={reconData}  
        keyExpr='order_ID'
        width='100%'  
        allowColumnResizing={false}  
        allowColumnReordering={false}  
        onRowDblClick={(e:DataGridTypes.RowDblClickEvent) => {
            if(!isAdmin) return;

            if (e.rowType === 'data' && e.data) {  
                e.component.clearSelection();
                e.component.selectRows([e.key], false);
                onRowDblClick(e.data);  
            }
        }}
        showBorders={true}  
        paging={{ enabled: false }}  
        hoverStateEnabled={true}
        focusedRowEnabled={true}
        rowAlternationEnabled={true}
        scrolling={{mode:'virtual'}}             
      >  
        <Grouping allowCollapsing={true}  expandMode='rowClick'/>
        <Summary>
          <GroupItem
            column="issue" // Column to which the summary belongs (can be any column)
            summaryType="count" // The type of summary (count)
            displayFormat="{0} Trades" 
          />
        </Summary>
        <FilterRow visible={false} applyFilter='auto' />  
        <LoadPanel enabled={true} shading={true} />
        <Column dataField='order_ID' visible={false} />
        <Column dataField='issue' caption='Issue' showWhenGrouped={true} groupCellRender={groupCellRender} allowGrouping={true} groupIndex={0} allowSorting={true} width='15%' />  
        <Column dataField='account' caption='Account' allowSorting={true} width='10%' />  
        <Column dataField='exec_Broker' caption='Exec Broker' allowSorting={true} width='15%' />  
        <Column dataField='credit_Broker' caption='Broker' allowSorting={true} width='15%' />  
        <Column dataField='reason' caption='Reason' allowSorting={true} width='5%' />  
        <Column dataField='ticker' caption='Ticker' allowSorting={true} width='5%' />  
        <Column dataField='shares' caption='Share' allowSorting={true} width='10%' alignment='left' />  
        <Column dataField='price' caption='Price' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />  
        <Column dataField='total_Comm' caption='Comm' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />  
        <Column dataField='trade_Date' caption='Trade Date' allowSorting={true} width='10%' dataType='number' alignment='left' format={{ precision: 2 }} />  
      </DataGrid>  
      }
    </div>  
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
          width="min(700px, 96vw)"
          height="auto"
          className="modern-trade-popup"
          >
          <Form
              formData={reconDetailData}
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
                  FIRST SECTION GROUP
              ========================= */}
              <Item
              itemType="group"
              cssClass="form-section"
              colSpan={2}
              colCount={3}
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
                  SECOND SECTION GROUP
              ========================= */}
              <Item
              itemType="group"
              cssClass="form-section"
              colSpan={2}
              colCount={2}
              >
              <Item
                  dataField="crBroker"
                  label={{ text: "Credit Broker" }}
                  editorType="dxSelectBox"
                  editorOptions={{
                      searchEnabled: true,
                      dataSource: brokersData.filter(
                          (broker) => broker.execBroker === reconDetailData?.exBroker
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
                  THIRD SECTION 
              ========================= */}
              <Item
              itemType="group"
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
                    items: reasonsData,
                    displayExpr: "name",
                    valueExpr: "code",
                    searchEnabled: false
                  }}
                  cssClass='dx-common-selectbox-short60'
              />
              </Item>
          </Form>

          <div className="popup-footer" style={{textAlign:'center'}}>
              <Button text="Cancel" stylingMode="text" onClick={handleClosePopup} />
              <Button text="Save" type="default" onClick={onPopupSave} />
          </div>
      </Popup>    
    </div>
  </div>
  );  
};

export default CommissionReconGrid;