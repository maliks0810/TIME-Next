import { useState, useCallback, useEffect } from 'react';
import { fetchCombinedBudgetData } from '../services/combined-budget-service';
import { DateBoxTypes } from 'devextreme-react/date-box';
import { CombinedBudget } from '../datatypes/tcw-commission-types';

export function useCommissionCombinedBudget(initialBeginDate: Date, initialEndDate: Date) {
// State for selected dates
const [selectedBeginDate, setSelectedBeginDate] = useState(initialBeginDate);
const [selectedEndDate, setSelectedEndDate] = useState(initialEndDate);
const [isLoading, setIsLoading] = useState(false);
// Store the fetched array data (no DataSource needed)  
const [budgetData, setBudgetData] = useState<CombinedBudget[]>([]);  

// Fetch data from API whenever selected dates change  
const loadData = useCallback(async () => {  
  try {  
    setIsLoading(true);  
    const data = await fetchCombinedBudgetData(selectedBeginDate, selectedEndDate);  
    setBudgetData(data);  
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
  loadData();  
}, []);

// On Refresh, just re-trigger the load  
const handleRefresh = useCallback(() => {  
  loadData();  
}, [loadData]);  

// DateBox event handlers  
const handleFromDateChanged = useCallback((e: DateBoxTypes.ValueChangedEvent) => {  
  setSelectedBeginDate(e.value);  
}, []);  

const handleToDateChanged = useCallback((e: DateBoxTypes.ValueChangedEvent) => {  
  setSelectedEndDate(e.value);  
}, []);  

return {  
  selectedBeginDate,  
  selectedEndDate,  
  budgetData,  
  isLoading,
  handleRefresh,  
  handleFromDateChanged,  
  handleToDateChanged,  
};  
}