import { handleErrors, NoTrailingForwardSlash } from '../utils/url-utils';  
import {RequestSoftDollarBudgetAccount, SoftDollarBudgetAccount} from '../datatypes/research-budget-types'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndpoint = `${apiBaseUrl}/soft-dollar-budget/`;
 
  
export async function fetchSoftdollarBudgetAccounts(softDollarBudgetId: number | string):Promise<SoftDollarBudgetAccount[]> {  
    let resultData: SoftDollarBudgetAccount[] = [];
    const response = await fetch(`${apiEndpoint}accounts/${softDollarBudgetId}`, { 
        cache: 'no-store' 
    });  
    
    handleErrors(response);    
    resultData = await response.json();
    return resultData;
}  
  
export async function insertSoftdollarBudgetAccount(accountData: RequestSoftDollarBudgetAccount):Promise<SoftDollarBudgetAccount> {  
  const response = await fetch(`${apiEndpoint}account/`, {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(accountData),  
  });  
  if (!response.ok) {  
    throw new Error('Failed to insert account');  
  }  
  return response.json();  
}  
  
export async function updateSoftdollarBudgetAccount(softDollarBudgetAccountId: number | string, accountData: RequestSoftDollarBudgetAccount):Promise<SoftDollarBudgetAccount> {  
  const response = await fetch(`${apiEndpoint}account/${softDollarBudgetAccountId}`, {  
    method: 'PUT',  
    cache: 'no-store',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(accountData),  
  });  
  if (!response.ok) {  
    throw new Error('Failed to update account');  
  }  
  return response.json();
}  
  
export async function deleteSoftdollarBudgetAccount(softDollarBudgetAccountId: number | string) {  
  const response = await fetch(`${apiEndpoint}account/${softDollarBudgetAccountId}`, {  
    method: 'DELETE',  
  });  
  if (!response.ok) {  
    throw new Error('Failed to delete account');  
  }  
  return true;  
}  