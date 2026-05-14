import { MaintenancePortfolioGroup, RequestMaintenancePortfolioGroup } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all portfolio groups
export async function fetchPortfolioGroups(): Promise<MaintenancePortfolioGroup[]> {
    const response = await fetch(`${apiEndPoint}/portfolio-groups`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new portfolio
export async function createPortfolioGroup(portGrpData: RequestMaintenancePortfolioGroup): Promise<MaintenancePortfolioGroup> {
    const response = await fetch(`${apiEndPoint}/portfolio-group`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portGrpData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing portfolio
export async function updatePortfolioGroup(
portfolioId: number,
portGrpData: RequestMaintenancePortfolioGroup
): Promise<MaintenancePortfolioGroup> {
    const response = await fetch(`${apiEndPoint}/portfolio-groups/${portfolioId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portGrpData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a portfolio
export async function deletePortfolioGroup(portfolioId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/portfolio-group/${portfolioId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}