import { NoTrailingForwardSlash } from '../utils/url-utils';
import { CombinedBudget } from '../datatypes/tcw-commission-types';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);

const formatDateForApi = (dateObject: Date) => {
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');
  const year = dateObject.getFullYear();
  return `${year}-${month}-${day}`;
};

// A simpler function that just fetches and returns array data
export async function fetchCombinedBudgetData(beginDate: Date, endDate: Date): Promise<CombinedBudget[]> {
  const startDt = formatDateForApi(beginDate);
  const endDt = formatDateForApi(endDate);
  const url = `${apiBaseUrl}/combined-budget/${startDt}/${endDt}`;

  try {  
      const response = await fetch(url, { cache: 'no-store' });  
      if (!response.ok) {  
        throw new Error(`Load Data error ${response.status}`);  
      }  
      const data: CombinedBudget[] = await response.json();  
      return data;  
  } catch (error) {  
      throw new Error('Load error: ' + error);  
  }  
}