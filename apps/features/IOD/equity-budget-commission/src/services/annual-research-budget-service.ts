import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils';
import type { BudgetYear, RequestResearchBudget, ResearchBudget} from '../datatypes/research-budget-types';

// Construct the endpoint URL  
const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);  
const apiEndPoint = `${apiBaseUrl}/research-budget`; 

// Generate budget years  
export async function  generateYears (start: number): Promise<BudgetYear[]> {  
    const results: BudgetYear[] = [];  
    const end = new Date().getFullYear();
    for (let i = start; i <= end; i += 1) {  
        results.push({ text: i.toString(), value: i });  
    }  
    // Sort descending by value  
    results.sort((a, b) => b.value - a.value);  
    return results;
};

//Fetch all research budget years
export async function fetchAllBudgetYears(): Promise<number[]>{
    const response = await fetch(`${apiEndPoint}/all-budget-years`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}
    
// Fetch annual research budgets
export async function fetchResearchBudgets(budgetYear: number): Promise<ResearchBudget[]> {
    const response = await fetch(`${apiEndPoint}/${budgetYear}`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}

// Create annual research budgets
export async function createResearchBudgets(requestData: RequestResearchBudget[]): Promise<ResearchBudget[]> {
    const bodyParam = JSON.stringify(requestData);
    const response = await fetch(`${apiEndPoint}/annual-budgets`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: bodyParam,
    });
    handleErrors(response);
    return response.json();
}