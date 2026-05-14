import { MaintenancePortfolioGroupXref, RequestMaintenancePortfolioGroupXref } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all portfolio group xrefs
export async function fetchPortfolioGroupXrefs(): Promise<MaintenancePortfolioGroupXref[]> {
    const response = await fetch(`${apiEndPoint}/portfolio-group-xrefs`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new portfolio group xref
export async function createPortfolioGroupXref(portGrpXrefData: RequestMaintenancePortfolioGroupXref): Promise<MaintenancePortfolioGroupXref> {
    const response = await fetch(`${apiEndPoint}/portfolio-group-xref`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portGrpXrefData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing portfolio group xref
export async function updatePortfolioGroupXref(
portfolioGrpXrefId: number,
portGrpXrefData: RequestMaintenancePortfolioGroupXref
): Promise<MaintenancePortfolioGroupXref> {
    const response = await fetch(`${apiEndPoint}/portfolio-group-xrefs/${portfolioGrpXrefId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portGrpXrefData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a portfolio group Xref
export async function deletePortfolioGroupXref(portfolioGrpXrefId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/portfolio-group-xref/${portfolioGrpXrefId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}