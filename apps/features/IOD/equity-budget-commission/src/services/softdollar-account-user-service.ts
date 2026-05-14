import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils';
import type { RequestSoftDollarBudgetAccountUser, SoftDollarBudgetAccountUser } from '../datatypes/research-budget-types';

// Construct the endpoint URL  
const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);  
const apiEndPoint = `${apiBaseUrl}/soft-dollar-budget`;  

// Fetch soft-dollar budget => details => account => user allocations
export async function fetchAccountUserAllocations(softBudgetAccountId: number): Promise<SoftDollarBudgetAccountUser[]> {
    const response = await fetch(`${apiEndPoint}/account/${softBudgetAccountId}/user-allocations`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}

export async function insertAccountUserAllocation(userAllocData: RequestSoftDollarBudgetAccountUser):Promise<SoftDollarBudgetAccountUser> {  
  const response = await fetch(`${apiEndPoint}/account/user-allocation/`, {  
    method: 'POST',  
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(userAllocData),  
  });  
  if (!response.ok) {  
    throw new Error('Failed to insert account user');  
  }  
  return response.json();  
}  
  
export async function updateAccountUserAllocation(userAllocationId: number, userAllocData: RequestSoftDollarBudgetAccountUser):Promise<SoftDollarBudgetAccountUser> {  
  const response = await fetch(`${apiEndPoint}/account/user-allocation/${userAllocationId}`, {  
    method: 'PUT',  
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(userAllocData),  
  });  
  if (!response.ok) {  
    throw new Error('Failed to update account user');  
  }  
  return response.json();  
}  

export async function deleteAccountUserAllocation(userAllocationId: number) {  
  const response = await fetch(`${apiEndPoint}/account/user-allocation/${userAllocationId}`, {  
    method: 'DELETE',  
    cache: 'no-store',
  });  
  if (!response.ok) {  
    throw new Error('Failed to delete account user');  
  }  
  return true;  
} 