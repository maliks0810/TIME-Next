import { MaintenanceDivision, RequestMaintenanceDivision } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all divisions
export async function fetchDivisions(): Promise<MaintenanceDivision[]> {
    const response = await fetch(`${apiEndPoint}/divisions`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new division
export async function createDivision(divData: RequestMaintenanceDivision): Promise<MaintenanceDivision> {
    const response = await fetch(`${apiEndPoint}/division`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(divData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing division
export async function updateDivision(
divisionId: number,
divData: RequestMaintenanceDivision
): Promise<MaintenanceDivision> {
    const response = await fetch(`${apiEndPoint}/divisions/${divisionId}`, {
    method: 'PUT',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(divData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a division
export async function deleteDivision(divisionId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/division/${divisionId}`, {
    method: 'DELETE',
    cache: 'no-store',
    });
    handleErrors(response);
    return true;
}