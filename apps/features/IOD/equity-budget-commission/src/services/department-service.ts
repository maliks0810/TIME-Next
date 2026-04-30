import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils';
import { MaintenanceDepartment, RequestMaintenanceDepartment, MaintenanceDivision } from '../datatypes/budget-maintenance-types';

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);
const apiEndPoint = apiBaseUrl + '/maintenance';

// Fetch all departments
export async function fetchDepartments(): Promise<MaintenanceDepartment[]> {
    const response = await fetch(`${apiEndPoint}/department`, { cache: 'no-store' });
    await handleErrors(response);
    return response.json();
}

// Create a new department
export async function createDepartment(deptData: RequestMaintenanceDepartment): Promise<MaintenanceDepartment> {
    const response = await fetch(`${apiEndPoint}/department`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deptData),
    });
    await handleErrors(response);
    return response.json();
}

// Update an existing department
export async function updateDepartment(
departmentId: number,
deptData: RequestMaintenanceDepartment
): Promise<MaintenanceDepartment> {
    const response = await fetch(`${apiEndPoint}/department/${departmentId}`, {
    method: 'PUT',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deptData),
    });
    await handleErrors(response);
    return response.json();
}

// Delete a department
export async function deleteDepartment(departmentId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/department/${departmentId}`, {
    method: 'DELETE',
    cache: 'no-store',
    });
    await handleErrors(response);
    return true;
}

// Fetch divisions
export async function fetchDivisions(): Promise<MaintenanceDivision[]> {
    const response = await fetch(`${apiEndPoint}/divisions`, { cache: 'no-store' });
    await handleErrors(response);
    return response.json();
}