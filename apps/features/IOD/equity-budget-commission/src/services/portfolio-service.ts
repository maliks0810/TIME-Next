import { MaintenancePortfolio, RequestMaintenancePortfolio } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all portfolios
export async function fetchPortfolios(): Promise<MaintenancePortfolio[]> {
    const response = await fetch(`${apiEndPoint}/portfolios`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new portfolio
export async function createPortfolio(portData: RequestMaintenancePortfolio): Promise<MaintenancePortfolio> {
    const response = await fetch(`${apiEndPoint}/portfolio`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing portfolio
export async function updatePortfolio(
portfolioId: number,
portData: RequestMaintenancePortfolio
): Promise<MaintenancePortfolio> {
    const response = await fetch(`${apiEndPoint}/portfolios/${portfolioId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a portfolio
export async function deletePortfolio(portfolioId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/portfolio/${portfolioId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}