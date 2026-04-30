import { useState, useCallback, useEffect } from 'react';
import { fetchCommissionTrades, fetchReasonCodes, fetchBrokerData, saveBatchUpdateChanges } from '../services/commission-trade-service';
import { CommissionTrade, CommissionTradeDetails, Reason, CRBrokerMapping, CRBrokers, CommissionTradeBatchRequestDto } from '../datatypes/tcw-commission-types';
import { DateBoxTypes } from 'devextreme-react/date-box';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info'; 

interface UseDepartmentsProps {
    userInfo: UserInfo;
    startDate: Date;
    endDate: Date
}

export function useCommissionTrade({ userInfo, startDate, endDate}: UseDepartmentsProps ) {
  const [selectedBeginDate, setSelectedBeginDate] = useState<Date | null>(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(endDate);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  const [isBatchSaveError, setIsBatchSaveError] = useState(false);

  const [commissionTradesData, setCommissionTradesData] = useState<CommissionTrade[]>([]);  
  const [reasonData, setReasonData] = useState<Reason[]>([]);  
  const [brokersData, setBrokersData] = useState<CRBrokerMapping[]>([]);  
  const [uniqueCRBrokers, setUniqueCRBrokers] = useState<CRBrokers[]>([]);  

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);  
  const [popupVisible, setPopupVisible] = useState(false);  
  const [batchPopupVisible, setBatchPopupVisible] = useState(false);  
  const [formData, setFormData] = useState<CommissionTradeDetails | undefined>(undefined);  

  const [batchFormData, setBatchFormData] = useState({  
    reason: '',        
    creditBroker: '', 
  });  

  useEffect(() => {  
    const fetchMasterData = async () => {
      try {  
        const [reasonCodes, brokerList] = await Promise.all([fetchReasonCodes(), fetchBrokerData()]);  
        setReasonData(reasonCodes);  
        setBrokersData(brokerList);
        const brkData = getUniqueCreditBrokers(brokerList);
        setUniqueCRBrokers(brkData);

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

  const loadTrades = useCallback(async () => {  
    try {  
      setIsLoading(true);
      const data = await fetchCommissionTrades(selectedBeginDate, selectedEndDate);  
      setCommissionTradesData(data);  
    } catch (error) {  
      console.error('Error fetching trades:', error);  
    }
    finally{
      setIsLoading(false);
    }
  }, [selectedBeginDate, selectedEndDate]);  

  // initial load once on mount, uncomment this:  
  useEffect(() => {  
    loadTrades();  
  }, []);  

  // Called by the Refresh button  
  const handleRefresh = useCallback(() => {  
    loadTrades();  
  }, [loadTrades]);  

  const handleFromDateChanged = useCallback((e: DateBoxTypes.ValueChangedEvent) => {  
    setSelectedBeginDate(e.value);  
  }, []);  

  const handleToDateChanged = useCallback((e: DateBoxTypes.ValueChangedEvent) => {  
    setSelectedEndDate(e.value);  
  }, []);  

  // selection  
  const onSelectionChanged = useCallback((selectedKeys: string[]) => {  
    setSelectedRowKeys(selectedKeys);  
  }, []);  

  // row double-click → open popup
  const onRowDblClick = useCallback((rowData:CommissionTrade) => {
        setPopupVisible(true);        
        const d =  fetchChildData(rowData);
          setFormData(d);
      },[]);

  function fetchChildData (rowData: CommissionTrade) {  
      // create CommissionTradeDetails from CommissionTrade 
      const childData: CommissionTradeDetails =  {
        orderId: rowData.orderId,  
        trader: rowData.trader,  
        ticker: rowData.ticker,  
        side: rowData.side,  
        cusip: rowData.cusip,  
        currency: rowData.currency,  
        crBroker: rowData.creditBroker,  
        exBroker: rowData.execBroker,  
        strategy: '',  
        division: rowData.divisionName,  
        shares: rowData.shares,  
        commission: rowData.totalComm,  
        price: rowData.price,  
        reason: rowData.reason,  
      }; 
      return childData;
  }

  // batch update popup  
  const handleBatchUpdate = useCallback(() => {  
    if (selectedRowKeys.length > 1) {  
      setBatchPopupVisible(true);  
    }  
  }, [selectedRowKeys]);  

  const closeBatchUpdatePopup = () => {  
    setBatchPopupVisible(false);  
  };  

  // single trade popup  
  const handleClosePopup = useCallback(() => {  
    setPopupVisible(false);  
    setFormData(undefined);  
  }, []);  

  const saveBatchUpdateChange  = useCallback(async () => {
    try{   
      const tradeIds: string[] = selectedRowKeys.map(s=> s);
      const updateDto: CommissionTradeBatchRequestDto = {
        orderId: tradeIds,
        creditBroker: batchFormData.creditBroker,
        reason: batchFormData.reason,
        lastUpdateBy: userInfo.name
      }
      const result = await saveBatchUpdateChanges(updateDto);
      setBatchPopupVisible(false);  
      return result;
    }
    catch(error){
      setIsBatchSaveError(true);
      throw error;
    }
  },[selectedRowKeys, isBatchSaveError]);

  const saveCommissionTradeChange  = useCallback(async (key:string, creditBroker:string, reason:string) => {    
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
    isLoading,
    isSaveError,
    isBatchSaveError,
    // data  
    commissionTradesData,  
    reasonData,  
    brokersData,  
    uniqueCRBrokers,
    // dates  
    selectedBeginDate,  
    selectedEndDate,  
    // popups and form  
    popupVisible,  
    formData,  
    batchPopupVisible,  
    selectedRowKeys,  
    batchFormData,
    setBatchFormData,
    // handlers  
    handleRefresh,  
    handleFromDateChanged,  
    handleToDateChanged,  
    onSelectionChanged,  
    onRowDblClick,  
    handleClosePopup,  
    handleBatchUpdate,  
    closeBatchUpdatePopup,  
    saveBatchUpdateChange,
    saveCommissionTradeChange,
    reloadCommissionTrades: loadTrades
  };  
}