import { MaintenanceAladBroker, MaintenanceMasterBroker, RequestMaintenanceMasterBroker } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all master-brokers
export async function fetchMasterBrokers(): Promise<MaintenanceMasterBroker[]> {
    const response = await fetch(`${apiEndPoint}/master-brokers`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}

export async function fetchAladMasterBrokers(): Promise<MaintenanceAladBroker[]> {
    const response = await fetch(`${apiEndPoint}/aladdin-master-brokers`, { 
        cache: 'no-store' 
    });
    handleErrors(response);
    return response.json();
}

// Create a new master-broker
export async function createMasterBroker(mBrkData: RequestMaintenanceMasterBroker): Promise<MaintenanceMasterBroker> {
    const response = await fetch(`${apiEndPoint}/master-broker`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mBrkData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing master-broker
export async function updateMasterBroker(
Id: number,
mBrkData: RequestMaintenanceMasterBroker
): Promise<MaintenanceMasterBroker> {
    const response = await fetch(`${apiEndPoint}/master-broker/${Id}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mBrkData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a master-broker
export async function deleteMasterBroker(Id: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/master-broker/${Id}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}