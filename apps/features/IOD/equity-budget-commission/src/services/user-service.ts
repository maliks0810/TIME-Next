import { MaintenanceDepartment, MaintenanceDivision, MaintenanceLocation, MaintenanceUser, RequestMaintenanceUser } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

function handleErrors(response: Response): Response {
    if (!response.ok) {
        throw Error(response.statusText || `HTTP error! status: ${response.status}`);
    }
    return response;
}

// masters - Fetch divisions
export async function fetchDivisions(): Promise<MaintenanceDivision[]> {
    const response = await fetch(`${apiEndPoint}/divisions`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// masters - Fetch departments
export async function fetchDepartments(): Promise<MaintenanceDepartment[]> {
    const response = await fetch(`${apiEndPoint}/department`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// masters - Fetch locations
export async function fetchLocations(): Promise<MaintenanceLocation[]> {
    const response = await fetch(`${apiEndPoint}/locations`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Fetch all users
export async function fetchUsers(): Promise<MaintenanceUser[]> {
    const response = await fetch(`${apiEndPoint}/users`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new user
export async function createUser(userData: RequestMaintenanceUser): Promise<MaintenanceUser> {
    const response = await fetch(`${apiEndPoint}/user`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing user
export async function updateUser(
userId: number,
userData: RequestMaintenanceUser
): Promise<MaintenanceUser> {
    const response = await fetch(`${apiEndPoint}/users/${userId}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a user
export async function deleteUser(userId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/user/${userId}`, {
    method: 'DELETE',
    cache: 'no-store',
    });
    handleErrors(response);
    return true;
}