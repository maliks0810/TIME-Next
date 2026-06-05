import { CSAMonthlyCommission } from '../datatypes/tcw-commission-types';
import { NoTrailingForwardSlash } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 

function handleErrors(response: Response): Response {
    if (!response.ok) {
        throw Error(response.statusText || `HTTP error! status: ${response.status}`);
    }
    return response;
}

export async function fetchCSAMonthlyComm(month: number): Promise<CSAMonthlyCommission[]> {
    const response = await fetch(`${apiBaseUrl}/csa-monthly/${month}`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}