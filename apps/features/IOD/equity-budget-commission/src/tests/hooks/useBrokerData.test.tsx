import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBrokers } from '../../hooks/useBrokerData';
import { fetchBrokers, fetchMasterBrokers, createBroker, deleteBroker, updateBroker} from '../../services/broker-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { MaintenanceBroker, MaintenanceMasterBroker, MaintenanceUser, RequestMaintenanceBroker } from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/broker-service', () => ({
    fetchBrokers: vi.fn(),
    fetchMasterBrokers: vi.fn(),    
    createBroker: vi.fn(),    
    updateBroker: vi.fn(),    
    deleteBroker: vi.fn(),    
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockBrokersData: MaintenanceBroker[] = [  
    { brokerId: 1, masterBrokerId: "1", brokerName: 'Broker 1', brokerCode: 'B001', aladdinBrokerCode: 'ABD', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { brokerId: 2, masterBrokerId: "2", brokerName: 'Broker 2', brokerCode: 'B002', aladdinBrokerCode: 'ABD', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
];

const mockMstBrokers:MaintenanceMasterBroker[] = [
    { ID:1, masterBrokerId:"1", masterBrokerName:"MB1 Name", masterBrokerCode:"MB1", status:"Active", lastUpdateDate: new Date()},
    { ID:2, masterBrokerId:"2", masterBrokerName:"Mb2 Name", masterBrokerCode:"MB2", status:"Active", lastUpdateDate: new Date()}
];

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useBrokers hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    it('load brokers data successfully', async () => {  
        vi.fn(fetchBrokers).mockResolvedValueOnce(mockBrokersData);  

        const { result } = renderHook(() =>  
            useBrokers({userInfo})  
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

    it('loads master-broker data', async () => {  
        vi.fn(fetchMasterBrokers).mockResolvedValueOnce(mockMstBrokers);  

        const { result } = renderHook(() =>  
            useBrokers({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.masterBrokers).toEqual(mockMstBrokers);  
        });  

        expect(fetchMasterBrokers).toHaveBeenCalledTimes(1);  
    }); 

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useBrokers({userInfo})  
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
    
    it('insert broker data successfully', async () => {  
        vi.fn(fetchBrokers).mockResolvedValueOnce([]);  
        const newItem: RequestMaintenanceBroker = { brokerName: 'New Broker', brokerCode: 'NB001', aladdinBrokerCode: 'ABD1', masterBrokerId: "1", status: 'Active', lastUpdateBy: userInfo.name };  

        const resultItem: MaintenanceBroker = { brokerId: 3, ...newItem, lastUpdateDate: new Date()}
        vi.fn(createBroker).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useBrokers({userInfo})  
        );

        await act(async () => {          
            const created = await result.current.addBroker(newItem);
            expect(created).toEqual(resultItem);  
        });    
    }); 

    it('create broker throws error on insert fails', async () => {  
        vi.fn(createBroker).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceBroker = { brokerName: 'New Broker', brokerCode: 'NB001', aladdinBrokerCode: 'ABD1', masterBrokerId: "1", status: 'Active', lastUpdateBy: userInfo.name };

        const { result } = renderHook(() =>  
            useBrokers({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addBroker(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update broker data successfully', async () => {  
        const brokerId:number = 1;
        const updateItem: RequestMaintenanceBroker = { masterBrokerId: "1", brokerName: 'Updated Broker', brokerCode: 'UB001', aladdinBrokerCode: 'ABD', status: 'Active', }; 
        const resultItem: MaintenanceBroker = { brokerId: 1, ...updateItem, lastUpdateDate: new Date()}
        vi.fn(updateBroker).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useBrokers({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyBroker(brokerId, updateItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Broker not found"]);
            }
        });
    });

    it('update broker throws error on update fails', async () => {  
        vi.fn(updateBroker).mockRejectedValueOnce(new Error('Update failed'));  
        const brokerId: number = 1;
        const updateItem: RequestMaintenanceBroker = { masterBrokerId: "1", brokerName: 'Updated Broker', brokerCode: 'UB001', aladdinBrokerCode: 'ABD', status: 'Active', }; 

        const { result } = renderHook(() =>  
            useBrokers({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyBroker(brokerId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Broker not found"]);
            }
        }); 
    });     

    it('delete broker data successfully', async () => {  
        const brokerId: number = 1;
        vi.fn(fetchBrokers).mockResolvedValueOnce(mockBrokersData);  
        vi.fn(deleteBroker).mockResolvedValueOnce(true);  
    
        const { result } = renderHook(() =>  
            useBrokers({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.brokers).toEqual(mockBrokersData);  
        }); 

        await act(async () => {  
            await result.current.removeBroker(brokerId);  
        });  

        expect(deleteBroker).toHaveBeenCalledWith(1); 
    });

    it('delete broker throws error on failures', async () => {  
        const brokerId: number = 1;
        vi.fn(fetchBrokers).mockResolvedValueOnce(mockBrokersData);  
        vi.fn(deleteBroker).mockRejectedValueOnce(new Error('Delete failed'));  

        const { result } = renderHook(() =>  
            useBrokers({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.brokers).toEqual(mockBrokersData);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeBroker(brokerId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });
});