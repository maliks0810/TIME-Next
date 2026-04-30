import { MaintenanceBrokerGroup,  MaintenanceBrokerGroupMember, RequestMaintenanceBrokerGroup, RequestMaintenanceBrokerGroupMember } from '../datatypes/budget-maintenance-types';
import { NoTrailingForwardSlash, handleErrors } from '../utils/url-utils'

const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL); 
const apiEndPoint = apiBaseUrl+'/maintenance';

// Fetch all broker groups
export async function fetchBrokerGroups(): Promise<MaintenanceBrokerGroup[]> {
    const response = await fetch(`${apiEndPoint}/brokergroup`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Fetch all broker groups xref
// export async function fetchBrokerGroupsXref(): Promise<MaintenanceBrokerGroupXref[]> {
//     const response = await fetch(`${apiEndPoint}/brokergroupmember`, { cache: 'no-store' });
//     handleErrors(response);
//     return response.json();
// }

// Create a new broker group
export async function createBrokerGroup(deptData: RequestMaintenanceBrokerGroup): Promise<MaintenanceBrokerGroup> {
    const response = await fetch(`${apiEndPoint}/brokergroup`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deptData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing broker group
export async function updateBrokerGroup(
    brokerGroupId: number,
    brkGroupData: RequestMaintenanceBrokerGroup
    ): Promise<MaintenanceBrokerGroup> {
        const response = await fetch(`${apiEndPoint}/brokergroup/${brokerGroupId}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brkGroupData),
        });
        handleErrors(response);
        return response.json();
}

// Delete a broker group
export async function deleteBrokerGroup(brokerGroupId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/brokergroup/${brokerGroupId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}

// Fetch all broker groups members
export async function fetchBrokerGroupsMember(): Promise<MaintenanceBrokerGroupMember[]> {
    const response = await fetch(`${apiEndPoint}/brokergroupmember`, { cache: 'no-store' });
    handleErrors(response);
    return response.json();
}

// Create a new broker group member
export async function createBrokerGroupMember(brkGrpMData: RequestMaintenanceBrokerGroupMember): Promise<MaintenanceBrokerGroupMember> {
    const response = await fetch(`${apiEndPoint}/brokerGroupMember`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brkGrpMData),
    });
    handleErrors(response);
    return response.json();
}

// Update an existing broker group member
export async function updateBrokerGroupMember(
    brokerGroupMemberId: number,
    brkGroupMemberData: RequestMaintenanceBrokerGroupMember
    ): Promise<MaintenanceBrokerGroupMember> {
        const response = await fetch(`${apiEndPoint}/brokerGroupMember/${brokerGroupMemberId}`, {
            method: 'PUT',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brkGroupMemberData),
        });
    handleErrors(response);
    return response.json();
}

// Delete a broker group member
export async function deleteBrokerGroupMember(brokerGroupMemberId: number): Promise<boolean> {
    const response = await fetch(`${apiEndPoint}/brokerGroupMember/${brokerGroupMemberId}`, {
        method: 'DELETE',
        cache: 'no-store',
    });
    handleErrors(response);
    return true;
}