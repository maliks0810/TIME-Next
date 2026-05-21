import { MaintenanceUser } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

function handleErrors(response: Response): Response {
    if (!response.ok) {
        throw Error(response.statusText || `HTTP error! status: ${response.status}`);
    }
    return response;
}

// Admin users
export async function fetchAdminUsers(): Promise<MaintenanceUser[]> {
    const response = await fetch(`${apiEndPoint}/users/admin`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}