import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils';
import type { SoftDollarBudget, SoftDollarBudgetDetail, RequestSoftDollarBudget, BudgetYear} from '../datatypes/research-budget-types';

// Construct the endpoint URL  
const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);  
const apiEndPoint = `${apiBaseUrl}/soft-dollar-budget`;  

// Generate budget years  
export async function  generateYears (start: number, end: number, step = 1): Promise<BudgetYear[]> {  
        const results: BudgetYear[] = [];  
        for (let i = start; i <= end; i += step) {  
            results.push({ text: i + ' - Actual', value: i });  
        }  
        // Sort descending by value  
        results.sort((a, b) => b.value - a.value);  
        return results;
    }; 

// Fetch soft-dollar budgets
export async function fetchSoftDollarBudgets(budgetYear: number): Promise<SoftDollarBudget[]> {
    const response = await fetch(`${apiEndPoint}?year=${budgetYear}`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}

// Fetch soft-dollar budget details
export async function fetchSoftDollarBudgetDetails(softBudgetId: number): Promise<SoftDollarBudgetDetail> {
    const response = await fetch(`${apiEndPoint}/detail/${softBudgetId}`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}

export async function createSoftBudget(softBudget: RequestSoftDollarBudget): Promise<SoftDollarBudget> {
    const response = await fetch(apiEndPoint, {  
      method: 'POST',  
      cache: 'no-store',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify(softBudget),  
    });  
    if (!response.ok) {  
      throw new Error(`Failed to insert record: ${response.status}`);
    }  
    handleErrors(response);
    return response.json(); 
}

export async function updateSoftBudget(softdollarBudget: RequestSoftDollarBudget): Promise<SoftDollarBudget> { 
    
    const response = await fetch(`${apiEndPoint}/`, {  
      method: 'PUT',  
      cache: 'no-store',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify(softdollarBudget),  
    });  
    handleErrors(response);
    return response.json(); 
}

export async function deleteSoftBudget(softBudgetId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/${softBudgetId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}
