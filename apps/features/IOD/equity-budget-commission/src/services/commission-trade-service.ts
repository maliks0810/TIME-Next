import { NoTrailingForwardSlash } from '../utils/url-utils';
import { CommissionTrade, Reason, CRBrokerMapping, CommissionTradeBatchRequestDto } from '../datatypes/tcw-commission-types';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);

const formatDateForApi = (dateObject: Date) => {
const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
const day = dateObject.getDate().toString().padStart(2, '0');
const year = dateObject.getFullYear();
return `${year}-${month}-${day}`;
};

//Fetches commission trades for the given date range.
export async function fetchCommissionTrades(beginDate: Date | null, endDate: Date | null): Promise<CommissionTrade[]> {
    let url = `${apiBaseUrl}/commission-trades/`;
    if (beginDate && endDate) {  
        const startDt = formatDateForApi(beginDate);  
        const endDt = formatDateForApi(endDate);  
        url += `${startDt}/${endDt}`;  
    }  

    const response = await fetch(url, { cache: 'no-store' }); 
    if (!response.ok) {  
        throw new Error(`Load Data error ${response.status}`);  
    }  
    return await response.json();  
}

//Fetches reason codes
export async function fetchReasonCodes():Promise<Reason[]> {
    const reasonUrl = `${apiBaseUrl}/reason-codes`; // from your code
    const response = await fetch(reasonUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Load Reason Data error ${response.status}`);
    }
    return await response.json();
}

//Fetches or defines broker data.
export async function fetchBrokerData():Promise<CRBrokerMapping[]> {    
    const reasonUrl = `${apiBaseUrl}/credit-exec-brokers`; // from your code
    const response = await fetch(reasonUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Load Reason Data error ${response.status}`);
    }
    return await response.json();
}

//Save Batch update changes
export async function saveBatchUpdateChanges(updateDto: CommissionTradeBatchRequestDto){
    try {
        const response = await fetch(`${apiBaseUrl}/commission-trades/batch-update`, {
            method: 'PUT',
            cache: 'no-store',  
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateDto)
        });
        if (!response.ok) {
            throw new Error(`Update failed: ${response.statusText}`);
        }
        return response.ok;
    } 
    catch (error) {
        throw error;
    }
}