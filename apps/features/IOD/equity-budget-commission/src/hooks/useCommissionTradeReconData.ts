import { useState, useCallback, useEffect } from 'react';
import { fetchReconData } from '../services/recon-service';
import { fetchReasonCodes, fetchBrokerData, saveBatchUpdateChanges } from '../services/commission-trade-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import { DateBoxTypes } from 'devextreme-react/date-box';
import { CommissionRecon, CRBrokerMapping, CRBrokers, Reason, CommissionReconDetail, CommissionTradeBatchRequestDto } from '../datatypes/tcw-commission-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info'; 

interface UseCommissionTradeReconProps {
    userInfo: UserInfo;
    startDate: Date;
    endDate: Date
}

export function useCommissionTradeRecon({ userInfo, startDate, endDate}: UseCommissionTradeReconProps ) {
// State for selected dates
const [selectedBeginDate, setSelectedBeginDate] = useState(startDate);
const [selectedEndDate, setSelectedEndDate] = useState(endDate);
const [isLoading, setIsLoading] = useState(false);
// Store the fetched array data (no DataSource needed)  
const [reconData, setReconData] = useState<CommissionRecon[]>([]);  
const [reasonsData, setReasonsData] = useState<Reason[]>([]);  
const [brokersData, setBrokersData] = useState<CRBrokerMapping[]>([]);  
const [uniqueCRBrokers, setUniqueCRBrokers] = useState<CRBrokers[]>([]);  
const [isAdmin, setIsAdmin] = useState(false);
const [popupVisible, setPopupVisible] = useState(false);  
const [reconDetailData, setReconDetailData] = useState<CommissionReconDetail | undefined>(undefined);  
const [isSaveError, setIsSaveError] = useState(false);

useEffect(() => {  
  const fetchMasterData = async () => {
    try {  
      const [reasonCodes, brokerList, adminData] = await Promise.all([
          fetchReasonCodes(), 
          fetchBrokerData(),
          fetchAdminUsers(),
        ]);  
      setReasonsData(reasonCodes);  
      setBrokersData(brokerList);
      const brkData = getUniqueCreditBrokers(brokerList);
      setUniqueCRBrokers(brkData);

      const u = adminData?.find(a=> a.firstName+ " "+ a.lastName === userInfo.name);
      if(u){
          setIsAdmin(true);
      } 

    } catch (error) {  
      console.error('Failed to load reason/broker data:', error);  
    }  
  };  
  fetchMasterData();
}, []);  

  function getUniqueCreditBrokers(data: CRBrokerMapping[]): CRBrokers[] {
    if (!data) return [];
    return Array.from(
      new Map(
      data.map((item) => [
        item.creditBroker,
        {
          creditBroker: item.creditBroker,
          creditBrokerName: item.creditBrokerName,
        }
        ])
      ).values()
    );
  }
  // Fetch data from API whenever selected dates change  
  const loadReconsData = useCallback(async () => {  
    try {  
      setIsLoading(true);  
      const data = await fetchReconData(selectedBeginDate, selectedEndDate);  
      setReconData(data);  
    } catch (error) {  
      console.error(error);  
      // handle error if needed  
    }
    finally{
      setIsLoading(false);  
    }
  }, [selectedBeginDate, selectedEndDate]); 

  // Load data once on mount 
  useEffect(() => {  
    loadReconsData();  
  }, []);

  // On Refresh, just re-trigger the load  
  const handleRefresh = useCallback(() => {  
    loadReconsData();  
  }, [loadReconsData]);  

  const handleFromDateChanged = useCallback((e: DateBoxTypes.ValueChangedEvent) => {  
    setSelectedBeginDate(e.value);  
  }, []); 

const handleToDateChanged = useCallback((e: DateBoxTypes.ValueChangedEvent) => {  
    setSelectedEndDate(e.value);  
  }, []);  

  // row double-click → open popup
  const onRowDblClick = useCallback((rowData:CommissionRecon) => {
    setPopupVisible(true);        
    const d =  fetchChildData(rowData);
      setReconDetailData(d);
  },[]);

  function fetchChildData (rowData: CommissionRecon) {  
      // create CommissionTradeDetails from CommissionTrade 
      const childData: CommissionReconDetail =  {
        orderId: rowData.order_ID,  
        trader: rowData.trader,  
        ticker: rowData.ticker,  
        side: rowData.side,  
        cusip: rowData.cusip,  
        currency: rowData.currency,  
        crBroker: rowData.credit_Broker,  
        exBroker: rowData.exec_Broker,  
        strategy: '',  
        division: rowData.division_Name,  
        shares: rowData.shares,  
        commission: rowData.total_Comm,  
        price: rowData.price,  
        reason: rowData.reason,  
      }; 
      return childData;
  }

  const handleClosePopup = useCallback(() => {  
    setPopupVisible(false);  
    setReconDetailData(undefined);  
  }, []);  

  const saveCommissionReconChange  = useCallback(async (key:string, creditBroker:string, reason:string) => {    
    try{  
      const updateDto: CommissionTradeBatchRequestDto = {
        orderId: [key],
        creditBroker: creditBroker,
        reason: reason,
        lastUpdateBy: userInfo.name
      }
      const result = await saveBatchUpdateChanges(updateDto);
      setPopupVisible(false);
      return result;
    }
    catch(error){
      setIsSaveError(true);
      throw error;
    }
  },[isSaveError]);

  return {  
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
    uniqueCRBrokers,
    onRowDblClick,
    handleClosePopup,
    isSaveError,
    reloadReconData: loadReconsData,
    saveCommissionReconChange
  };   
}