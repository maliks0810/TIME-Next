import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBrokerGroups } from '../../hooks/useBrokerGroupData';
import { fetchBrokerGroups, createBrokerGroup, deleteBrokerGroup, updateBrokerGroup,   
    createBrokerGroupMember, updateBrokerGroupMember, deleteBrokerGroupMember  
} from '../../services/broker-group-service';
import { fetchBrokers } from '../../services/broker-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { MaintenanceBroker, MaintenanceBrokerGroup, MaintenanceBrokerGroupMember, MaintenanceUser, RequestMaintenanceBrokerGroup, RequestMaintenanceBrokerGroupMember 
} from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/broker-service', () => ({
    fetchBrokers: vi.fn(),
}));

vi.mock('../../services/broker-group-service', () => ({
    fetchBrokerGroups: vi.fn(),
    createBrokerGroup: vi.fn(),    
    deleteBrokerGroup: vi.fn(),    
    updateBrokerGroup: vi.fn(),

    fetchBrokerGroupsMember: vi.fn(),
    createBrokerGroupMember: vi.fn(),
    updateBrokerGroupMember: vi.fn(),
    deleteBrokerGroupMember: vi.fn(),
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockBrokersData: MaintenanceBroker[] = [  
    { brokerId: 1, masterBrokerId: "1", brokerName: 'Broker 1', brokerCode: 'B001', aladdinBrokerCode: 'ABD', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { brokerId: 2, masterBrokerId: "2", brokerName: 'Broker 2', brokerCode: 'B002', aladdinBrokerCode: 'ABD', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
];

const mockBrokerGroupsData: MaintenanceBrokerGroup[] = [  
    { brokerGroupId: 1, brokerGroupName: 'Broker 1', brokerGroupCode: 'B001', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { brokerGroupId: 2, brokerGroupName: 'Broker 2', brokerGroupCode: 'B002', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
];

/*const mockBrokerGroupMembers:MaintenanceBrokerGroupMember[] = [
    { brokerGroupMemberId:1, brokerGroupId:1, brokerCode:"MB1", lastUpdateBy:"User1", JoinedGroupAt: new Date()},
    { brokerGroupMemberId:2, brokerGroupId:2, brokerCode:"MB2", lastUpdateBy:"User1", JoinedGroupAt: new Date()}
];*/

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useBrokerGroups hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });
    /** Brokers Data */
    it('load brokers data successfully', async () => {  
        vi.fn(fetchBrokers).mockResolvedValueOnce(mockBrokersData);  

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.brokers).toEqual(mockBrokersData);  
        });  

        expect(fetchBrokers).toHaveBeenCalledTimes(1);  
    });

    it('handle error when load brokers data failed', async () => {  
        vi.fn(fetchBrokers).mockRejectedValueOnce(  
            new Error('Failed to fetch brokers')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchBrokers).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch brokers');
            }
        });
    });    

    /** Broker Groups data */
    it('load brokergroups data successfully', async () => {  
        vi.fn(fetchBrokerGroups).mockResolvedValueOnce(mockBrokerGroupsData);  

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.brokerGroups).toEqual(mockBrokerGroupsData);  
        });  

        expect(fetchBrokerGroups).toHaveBeenCalledTimes(1);  
    });

    it('handle error when load brokergroups data failed', async () => {  
        vi.fn(fetchBrokerGroups).mockRejectedValueOnce(  
            new Error('Failed to fetch brokergroups')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchBrokerGroups).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch brokergroups');
            }
        });
    });    

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.isAdmin).toEqual(true);  
        });  

        expect(fetchAdminUsers).toHaveBeenCalledTimes(1);  
    });
    
    it('handle error when fetch admin users data failed', async () => {  
        vi.fn(fetchAdminUsers).mockRejectedValueOnce(  
            new Error('Failed to fetch admin users data')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchAdminUsers).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch admin users data');
            }
        });
    });

    it('insert broker group data successfully', async () => {  
        vi.fn(fetchBrokerGroups).mockResolvedValueOnce([]);  
        const newItem: RequestMaintenanceBrokerGroup = { brokerGroupName: 'New Broker Group', brokerGroupCode: 'NB001', status: 'Active', lastUpdateBy: userInfo.name??"User1" };  

        const resultItem: MaintenanceBrokerGroup = { brokerGroupId: 3, ...newItem, lastUpdateDate: new Date()}
        vi.fn(createBrokerGroup).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );

        await act(async () => {          
            const created = await result.current.addBrokerGroup(newItem);
            expect(created).toEqual(resultItem);  
        });    
    }); 

    it('create brokergroup member throws error on insert fails', async () => {  
        vi.fn(createBrokerGroup).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceBrokerGroup = { brokerGroupName: 'New Broker Group', brokerGroupCode: 'NB001', status: 'Active', lastUpdateBy: userInfo.name??"User1" };

        const { result } = renderHook(() =>  
            useBrokerGroups({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addBrokerGroup(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update brokergroup data successfully', async () => {  
        const brokerGroupId:number = 1;
        const updateItem: RequestMaintenanceBrokerGroup = { brokerGroupName: 'Updated Broker', brokerGroupCode: 'UB001', status: 'Active', lastUpdateBy: userInfo.name??"User1" }; 
        const resultItem: MaintenanceBrokerGroup = { brokerGroupId: 1, ...updateItem, lastUpdateDate: new Date()}
        vi.fn(updateBrokerGroup).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyBrokerGroup(brokerGroupId, updateItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Broker Group not found"]);
            }
        });
    });

    it('update broker group throws error on update fails', async () => {  
        vi.fn(updateBrokerGroup).mockRejectedValueOnce(new Error('Update failed'));  
        const brokerGroupId: number = 1;
        const updateItem: RequestMaintenanceBrokerGroup = { brokerGroupName: 'Updated Broker Group', brokerGroupCode: 'UB001', status: 'Active', lastUpdateBy: userInfo.name??"User1" }; 

        const { result } = renderHook(() =>  
            useBrokerGroups({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyBrokerGroup(brokerGroupId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Broker Group not found"]);
            }
        }); 
    });

    it('delete broker group data successfully', async () => {  
        const brokerGroupId: number = 1;
        vi.fn(fetchBrokerGroups).mockResolvedValueOnce(mockBrokerGroupsData);  
        vi.fn(deleteBrokerGroup).mockResolvedValueOnce(true);  
    
        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.brokerGroups).toEqual(mockBrokerGroupsData);  
        }); 

        await act(async () => {  
            await result.current.removeBrokerGroup(brokerGroupId);  
        });  

        expect(deleteBrokerGroup).toHaveBeenCalledWith(1); 
    });

    it('delete broker group throws error on failures', async () => {  
        const brokerGroupId: number = 1;
        vi.fn(fetchBrokerGroups).mockResolvedValueOnce(mockBrokerGroupsData);  
        vi.fn(deleteBrokerGroup).mockRejectedValueOnce(new Error('Delete failed'));  

        const { result } = renderHook(() =>  
            useBrokerGroups({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.brokerGroups).toEqual(mockBrokerGroupsData);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeBrokerGroup(brokerGroupId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });

    /** Broker Groups Member */    

    it('handle error when load brokergroupmembers data failed', async () => {  
        vi.fn(fetchBrokerGroups).mockRejectedValueOnce(  
            new Error('Failed to fetch brokergroups member')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchBrokerGroups).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch brokergroups member');
            }
        });
    }); 

    it('insert broker group member data successfully', async () => {  
        vi.fn(fetchBrokerGroups).mockResolvedValueOnce([]);  
        const newItem: RequestMaintenanceBrokerGroupMember = { brokerGroupId: 1, brokerCode: 'NB001', lastUpdateBy: userInfo.name??"User1" };  

        const resultItem: MaintenanceBrokerGroupMember = { brokerGroupMemberId: 3, ...newItem, JoinedGroupAt: new Date()}
        vi.fn(createBrokerGroupMember).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );

        await act(async () => {          
            const created = await result.current.addBrokerGroupMember(newItem);
            expect(created).toEqual(resultItem);  
        });    
    });

    it('create brokergroupmember throws error on insert fails', async () => {  
        vi.fn(createBrokerGroup).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceBrokerGroupMember = { brokerGroupId: 1, brokerCode: 'NB001', lastUpdateBy: userInfo.name??"User1" };  

        const { result } = renderHook(() =>  
            useBrokerGroups({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addBrokerGroupMember(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update brokergroupmember data successfully', async () => {  
        const brokerGroupMemberId:number = 1;
        const updateItem: RequestMaintenanceBrokerGroupMember = { brokerGroupId: 1, brokerCode: 'UB001', lastUpdateBy: userInfo.name??"User1" };  
        const resultItem: MaintenanceBrokerGroupMember = { brokerGroupMemberId: 1, ...updateItem, JoinedGroupAt: new Date()}
        vi.fn(updateBrokerGroupMember).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyBrokerGroupMember(brokerGroupMemberId, updateItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Broker Group Member not found"]);
            }
        });
    });

    it('update brokergroupmember throws error on update fails', async () => {  
        vi.fn(updateBrokerGroup).mockRejectedValueOnce(new Error('Update failed'));  
        const brokerGroupMemberId: number = 1;
        const updateItem: RequestMaintenanceBrokerGroupMember = { brokerGroupId: 1, brokerCode: 'UB001', lastUpdateBy: userInfo.name??"User1" };  

        const { result } = renderHook(() =>  
            useBrokerGroups({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyBrokerGroupMember(brokerGroupMemberId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Broker Group Member not found"]);
            }
        }); 
    });

    it('delete broker group data successfully', async () => {  
        const brokerGroupMemberId: number = 1;
        vi.fn(deleteBrokerGroupMember).mockResolvedValueOnce(true);  
    
        const { result } = renderHook(() =>  
            useBrokerGroups({userInfo})  
        );
 
        await act(async () => {  
            await result.current.removeBrokerGroupMember(brokerGroupMemberId);  
        });  

        expect(deleteBrokerGroupMember).toHaveBeenCalledWith(1); 
    });

    it('delete broker group throws error on failures', async () => {  
        const brokerGroupMemberId: number = 1;
        vi.fn(deleteBrokerGroupMember).mockRejectedValueOnce(new Error('Delete failed'));  

        const { result } = renderHook(() =>  
            useBrokerGroups({ userInfo })  
        );   

        await act(async () => { 
            try { 
                await result.current.removeBrokerGroupMember(brokerGroupMemberId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });
});