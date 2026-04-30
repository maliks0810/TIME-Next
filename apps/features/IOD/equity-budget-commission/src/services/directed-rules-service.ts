import { MaintenanceDirectedRules, MaintenanceDirectedRulesXref, 
    RequestMaintenanceDirectedRules, RequestMaintenanceDirectedRulesXref 
} from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all DirectedRules
export async function fetchDirectedRules(): Promise<MaintenanceDirectedRules[]> {
    const response = await fetch(`${apiEndPoint}/directedrules`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new DirectedRules
export async function createDirectedRule(directedRulesData: RequestMaintenanceDirectedRules): Promise<MaintenanceDirectedRules> {
    const response = await fetch(`${apiEndPoint}/directedrules`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directedRulesData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing DirectedRules
export async function updateDirectedRule(
    directedRulesId: number,
    directedRuleData: RequestMaintenanceDirectedRules
    ): Promise<MaintenanceDirectedRules> {
    const response = await fetch(`${apiEndPoint}/directedrule/${directedRulesId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directedRuleData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a DirectedRule
export async function deleteDirectedRule(directedRuleId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/directedrules/${directedRuleId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}

// Fetch all DirectedRulesXref
export async function fetchDirectedRulesXref(): Promise<MaintenanceDirectedRulesXref[]> {
    const response = await fetch(`${apiEndPoint}/directedrulesxref`, { cache: 'no-store' });
    handleErrors(response);                                     
    return response.json();
}

// Create a new DirectedRulesXref
export async function createDirectedRuleXref(directedRulesXrefData: RequestMaintenanceDirectedRulesXref): Promise<MaintenanceDirectedRulesXref> {
    const response = await fetch(`${apiEndPoint}/directedrulesxref`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directedRulesXrefData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing DirectedRulesXref
export async function updateDirectedRuleXref(
    directedRulesXrefId: number,
    directedRuleXrefData: RequestMaintenanceDirectedRulesXref
    ): Promise<MaintenanceDirectedRulesXref> {
    const response = await fetch(`${apiEndPoint}/directedrulexref/${directedRulesXrefId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directedRuleXrefData),
    });
    handleErrors(response);
    return response.json();
}

// Delete a DirectedRulesXref
export async function deleteDirectedRuleXref(directedRuleXrefId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/directedrulesxref/${directedRuleXrefId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}