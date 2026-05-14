import { MaintenanceBroker, RequestMaintenanceBroker, MaintenanceMasterBroker } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all brokers
export async function fetchBrokers(): Promise<MaintenanceBroker[]> {
    const response = await fetch(`${apiEndPoint}/brokers`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new broker
export async function createBroker(deptData: RequestMaintenanceBroker): Promise<MaintenanceBroker> {
    const response = await fetch(`${apiEndPoint}/broker`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deptData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing broker
export async function updateBroker(
    brokerId: number,
    brkData: RequestMaintenanceBroker
    ): Promise<MaintenanceBroker> {
        const response = await fetch(`${apiEndPoint}/brokers/${brokerId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brkData),
        });
        handleErrors(response);
        return response.json();
}

// Delete a broker
export async function deleteBroker(brokerId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/broker/${brokerId}`, {
    method: 'DELETE',
    cache: 'no-store',
    });
    handleErrors(response);
    return true;
}

// Fetch master brokers
export async function fetchMasterBrokers(): Promise<MaintenanceMasterBroker[]> {
    const response = await fetch(`${apiEndPoint}/master-brokers`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}