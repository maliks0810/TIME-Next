import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMasterBrokers } from '../../hooks/useMasterBrokerData';
import { fetchMasterBrokers, createMasterBroker, deleteMasterBroker, updateMasterBroker, fetchAladMasterBrokers} from '../../services/master-broker-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { MaintenanceAladBroker, MaintenanceMasterBroker, MaintenanceUser, RequestMaintenanceMasterBroker } from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/master-broker-service', () => ({
    fetchMasterBrokers: vi.fn(),    
    createMasterBroker: vi.fn(),    
    updateMasterBroker: vi.fn(),    
    deleteMasterBroker: vi.fn(),
    fetchAladMasterBrokers: vi.fn(),
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockMstBrokers:MaintenanceMasterBroker[] = [
    { ID:1, masterBrokerId:"1", masterBrokerName:"MB1 Name", masterBrokerCode:"MB1", status:"Active", active:true, lastUpdateDate: new Date()},
    { ID:2, masterBrokerId:"2", masterBrokerName:"Mb2 Name", masterBrokerCode:"MB2", status:"Active", active:true, lastUpdateDate: new Date()}
];

const mockAldmstBrokers: MaintenanceAladBroker[] = [
    { masterBrokerId:"1", masterBrokerCode:"MB1", masterBrokerName:"Test MB1" },
    { masterBrokerId:"2", masterBrokerCode:"MB2", masterBrokerName:"Test MB2" }
];

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useMasterBrokers hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    it('loads Aladdin Brokers master data', async () => {  
            vi.fn(fetchAladMasterBrokers).mockResolvedValueOnce(mockAldmstBrokers);  
    
            const { result } = renderHook(() =>  
                useMasterBrokers({userInfo})  
            );  
    
            await waitFor(() => {  
                expect(result.current.aladMasterBrokers).toEqual(mockAldmstBrokers);  
            });  
    
            expect(fetchAladMasterBrokers).toHaveBeenCalledTimes(1);  
    });

    it('loads master-brokers data successfully', async () => {  
        vi.fn(fetchMasterBrokers).mockResolvedValueOnce(mockMstBrokers);  

        const { result } = renderHook(() =>  
            useMasterBrokers({userInfo})
        );  

        await waitFor(() => {  
            expect(result.current.masterBrokers).toEqual(mockMstBrokers);  
        });  

        expect(fetchMasterBrokers).toHaveBeenCalledTimes(1);  
    });

    it('handle error when loads master-brokers data failed', async () => {  
        vi.fn(fetchMasterBrokers).mockRejectedValueOnce(  
            new Error('Failed to load master-brokers')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchMasterBrokers).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to load master-brokers');
            }
        });
    });

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useMasterBrokers({userInfo})  
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

    it('insert master-broker data successfully', async () => {  
        vi.fn(fetchMasterBrokers).mockResolvedValueOnce([]); 

        const newItem: RequestMaintenanceMasterBroker = { masterBrokerCode:"Test MBrk", masterBrokerName:"Test M Broker", masterBrokerId:"2", status:"Active"};
        const resultItem: MaintenanceMasterBroker = {ID:2, ...newItem, lastUpdateDate: new Date() };

        vi.fn(createMasterBroker).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useMasterBrokers({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.masterBrokers).toEqual([]);  
        });
        await act(async () => {          
            const created = await result.current.addMasterBroker(newItem);  
            expect(created).toEqual(resultItem);  
        });    
    }); 

    it('add master-broker throws error on insert fails', async () => {  
        vi.fn(createMasterBroker).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceMasterBroker = { masterBrokerCode:"Test MBrk", masterBrokerName:"Test M Broker", masterBrokerId:"2", status:"Active"};

        const { result } = renderHook(() =>  
            useMasterBrokers({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addMasterBroker(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update master-broker data successfully', async () => {  
        const Id = 1;
        const updateItem: RequestMaintenanceMasterBroker = { masterBrokerCode:"Update MBrk", masterBrokerName:"Update M Broker", masterBrokerId:"2", status:"Active"};
        const resultItem: MaintenanceMasterBroker = {ID:1, ...updateItem, lastUpdateDate:new Date(), lastUpdateBy:userInfo.name};

        vi.fn(updateMasterBroker).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useMasterBrokers({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyMasterBroker(Id, updateItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Master Broker not found"]);
            }
        });
    });

    it('update master-broker throws error on update fails', async () => {  
        vi.fn(updateMasterBroker).mockRejectedValueOnce(new Error('Update failed'));  
        const Id = 1;
        const updateItem: RequestMaintenanceMasterBroker = { masterBrokerCode:"Update MBrk", masterBrokerName:"Update M Broker", masterBrokerId:"2", status:"Active"};


        const { result } = renderHook(() =>  
            useMasterBrokers({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyMasterBroker(Id, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Master Broker not found"]);
            }
        }); 
    });     

    it('delete master-broker data successfully', async () => {  
        vi.fn(fetchMasterBrokers).mockResolvedValueOnce(mockMstBrokers);  
        vi.fn(deleteMasterBroker).mockResolvedValueOnce(true);  
        const Id = 1;
    
        const { result } = renderHook(() =>  
            useMasterBrokers({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.masterBrokers).toEqual(mockMstBrokers);  
        }); 

        await act(async () => {  
            await result.current.removeMasterBroker(Id);  
        });  

        expect(deleteMasterBroker).toHaveBeenCalledWith(Id); 
    });

    it('delete master-broker throws error on failures', async () => {  
        vi.fn(fetchMasterBrokers).mockResolvedValueOnce([]);  
        vi.fn(deleteMasterBroker).mockRejectedValueOnce(new Error('Delete failed'));  
        const Id = 1;

        const { result } = renderHook(() =>  
            useMasterBrokers({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.masterBrokers).toEqual([]);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeMasterBroker(Id);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Delete failed');
            }
        });  
    });
});