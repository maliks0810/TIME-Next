import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils';
import type { BudgetService } from '../datatypes/research-budget-types';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);  
const apiMainEndPoint = `${apiBaseUrl}/maintenance`;  

// Fetch services
export async function fetchServices(): Promise<BudgetService[]> {
    const response = await fetch(`${apiMainEndPoint}/services`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}