import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSoftDollarBudgets } from '../../hooks/useSoftDollarBudget';
import { fetchServices } from '../../services/services-service';
import { fetchDepartments } from '../../services/department-service';
import { fetchBrokers } from '../../services/broker-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { fetchMasterBrokers } from '../../services/master-broker-service';
import { MaintenanceDepartment, MaintenanceMasterBroker, MaintenanceBroker, MaintenanceUser } 
from '../../datatypes/budget-maintenance-types';
import { fetchSoftDollarBudgets, createSoftBudget, updateSoftBudget, deleteSoftBudget } from '../../services/softdollar-service';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';
import { BudgetService, RequestSoftDollarBudget, SoftDollarBudget } from '@/datatypes/research-budget-types';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/services-service', () => ({
    fetchServices: vi.fn(),
}));
vi.mock('../../services/broker-service', () => ({
    fetchBrokers: vi.fn(),
}));
vi.mock('../../services/master-broker-service', () => ({
    fetchMasterBrokers: vi.fn(),
}));
vi.mock('../../services/department-service', () => ({
    fetchDepartments: vi.fn(),
}));
vi.mock('../../services/softdollar-service', () => ({
    generateYears: vi.fn(),
    fetchSoftDollarBudgets: vi.fn(),
    createSoftBudget: vi.fn(),
    updateSoftBudget: vi.fn(),
    deleteSoftBudget: vi.fn(),
    fetchAccountUserAllocations: vi.fn(),
}));
vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockBrokerData:MaintenanceBroker[] = [
    { brokerId:1, masterBrokerId:"1", brokerName:"MB1 Name", aladdinBrokerCode:"MB1", status:"Active", lastUpdateDate: new Date()},
    { brokerId:2, masterBrokerId:"2", brokerName:"Mb2 Name", aladdinBrokerCode:"MB2", status:"Active", lastUpdateDate: new Date()}
];
const mockMstBrokerData:MaintenanceMasterBroker[] = [
    { ID:1, masterBrokerId:"1", masterBrokerName:"MB1 Name", masterBrokerCode:"MB1", status:"Active", lastUpdateDate: new Date()},
    { ID:2, masterBrokerId:"2", masterBrokerName:"Mb2 Name", masterBrokerCode:"MB2", status:"Active", lastUpdateDate: new Date()}
];
const mockDepartmentData:MaintenanceDepartment[] = [
    { departmentId:1, departmentName:"Dept1 Name", status:"Active", divisionId:1, lastUpdateDate: new Date()},
    { departmentId:2, departmentName:"Dept2 Name", status:"Active", divisionId:2, lastUpdateDate: new Date()}
];
const mockServiceData: BudgetService[] = [  
    { serviceId:1, serviceName:'Service 1', accountId: 1, brokerId:99, categoryCode:'Test Code1', categoryId:1, categoryName:'Test Category1', cancelDescription:'test',
        documentation:'', renewalDescription:'',status:'Active',vendorId:1, vendorName:'Test Vendor1', startDate: new Date(), 
        lastUpdateDate: new Date(), lastUpdateBy: mockUserInfo.name ?? 'User1' },  
    { serviceId:2, serviceName:'Service 2', accountId: 2, brokerId:98, categoryCode:'Test Code2', categoryId:2, categoryName:'Test Category2', cancelDescription:'test',
        documentation:'', renewalDescription:'',status:'Active',vendorId:2, vendorName:'Test Vendor2', startDate: new Date(), 
        lastUpdateDate: new Date(), lastUpdateBy: mockUserInfo.name ?? 'User1' },  
];
const mockSoftdollarData: SoftDollarBudget[] = [
    { softDollarBudgetId:1, brokerId:9, brokerCode:'Brk Code1', brokerName:'Broker Name1', budgetState:1, budgetTypeId:2, calculatedHardDollar:10.0,calculatedSoftDollar:10.0,
        departmentId:1, departmentName:'Dept Name', divisionId: 1, divisionName:'Div Name1', masterBrokerName:'M Broker Name', masterBrokerCode:'M Code1', masterBrokerId:1,  
        startDate:new Date(), endDate: new Date(), ratio:1, serviceId:1, serviceName:'Service 1', status:true, totalCommissionBudget:0, totalCost:10, totalNonResearchCost:0,
        year:2026, lastUpdateBy: mockUserInfo.name ??'User1' },
    { softDollarBudgetId:2, brokerId:9, brokerCode:'Brk Code1', brokerName:'Broker Name1', budgetState:1, budgetTypeId:2, calculatedHardDollar:10.0,calculatedSoftDollar:10.0,
        departmentId:1, departmentName:'Dept Name', divisionId: 1, divisionName:'Div Name1', masterBrokerName:'M Broker Name', masterBrokerCode:'M Code1', masterBrokerId:1,  
        startDate:new Date(), endDate: new Date(), ratio:1, serviceId:1, serviceName:'Service 1', status:true, totalCommissionBudget:0, totalCost:10, totalNonResearchCost:0,
        year:2026, lastUpdateBy: mockUserInfo.name ??'User1' }
];
const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useSoftDollarBudgets', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    describe('load method', () =>  {
        it('load softdollar budget data successfully', async () => {  
            vi.fn(fetchSoftDollarBudgets).mockResolvedValueOnce(mockSoftdollarData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await waitFor(() => {  
                expect(result.current.softBudgetData).toEqual(mockSoftdollarData);  
            });  

            expect(fetchSoftDollarBudgets).toHaveBeenCalledTimes(1);
        }); 
        
        it('handle error when load softdollar budget data failed', async () => {  
            vi.fn(fetchSoftDollarBudgets).mockRejectedValueOnce(  
                new Error('Failed to fetch softdollar budgets')
            );  

            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchSoftDollarBudgets).mockResolvedValueOnce([]);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);
                    expect(String(err)).toBe('Failed to fetch softdollar budgets');
                }
            });
        });

        it('load master-broker data successfully', async () => {  
            vi.fn(fetchMasterBrokers).mockResolvedValueOnce(mockMstBrokerData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await waitFor(() => {  
                expect(result.current.mstBrokers).toEqual(mockMstBrokerData);  
            });  

            expect(fetchMasterBrokers).toHaveBeenCalledTimes(1);
        });

        it('load broker data successfully', async () => {  
            vi.fn(fetchBrokers).mockResolvedValueOnce(mockBrokerData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await waitFor(() => {  
                expect(result.current.brokers).toEqual(mockBrokerData);  
            });  

            expect(fetchBrokers).toHaveBeenCalledTimes(1);
        });

        it('load departments data successfully', async () => {  
            vi.fn(fetchDepartments).mockResolvedValueOnce(mockDepartmentData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await waitFor(() => {  
                expect(result.current.departments).toEqual(mockDepartmentData);  
            });  

            expect(fetchDepartments).toHaveBeenCalledTimes(1);
        });

        it('load services data successfully', async () => {  
            vi.fn(fetchServices).mockResolvedValueOnce(mockServiceData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await waitFor(() => {  
                expect(result.current.services).toEqual(mockServiceData);  
            });  

            expect(fetchServices).toHaveBeenCalledTimes(1);
        });
        it('loads admin users data', async () => {  
            vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
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
    });

    describe('insert method', ()=> {
        const newItem: RequestSoftDollarBudget={
            budgetTypeId:1, brokerId:99,  departmentId:99, serviceId:99, year:2026, ratio:1, lastUpdateBy: 'User1'  };
        
        it('insert softdollar budget data successfully', async () => {  
            vi.fn(fetchSoftDollarBudgets).mockResolvedValueOnce([]); 
            const returnedItem:SoftDollarBudget = { softDollarBudgetId: 2, ...newItem, budgetState:1, calculatedHardDollar:0,calculatedSoftDollar:0,totalCommissionBudget:0,
                totalCost:0,totalNonResearchCost:0,status:true,endDate:new Date(), startDate:new Date(), divisionId:9, divisionName:'Div Name', masterBrokerId:9, masterBrokerCode:'M Code',
                masterBrokerName:'Master Broker', serviceName:'Service 1', departmentName:'Dept 1',brokerCode:'New Code', brokerName:'New Broker',
             }; 
            vi.fn(createSoftBudget).mockResolvedValueOnce(returnedItem);     

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026}) 
            );

            await waitFor(async () => {  
                await result.current.loadSoftDollarBudgetData();  
            });

            await act(async () => {          
                const created = await result.current.insertSoftDollarBudget(newItem);  
                expect(created).toEqual(returnedItem);  
            });    
        }); 

        it('add softdollar budget throws error on insert fails', async () => {  
            vi.fn(createSoftBudget).mockRejectedValueOnce(new Error('Insert failed'));  
            const newItem: RequestSoftDollarBudget={
                budgetTypeId:1, brokerId:99,  departmentId:99, serviceId:99, year:2026, ratio:1, lastUpdateBy: 'User1'  };
        
            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await act(async () => { 
                try { 
                    await result.current.insertSoftDollarBudget(newItem);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Insert failed"]);
                }
            }); 
        }); 
    });

    describe('update method', ()=> {
        const softDollarBudgetId: number = 2;
        const updateItem: RequestSoftDollarBudget={
            budgetTypeId:1, brokerId:99,  departmentId:99, serviceId:99, year:2026, ratio:1, lastUpdateBy: 'User1'  };
        
        it('Update softdollar budget data successfully', async () => {  
            vi.fn(fetchSoftDollarBudgets).mockResolvedValueOnce([]); 
            const returnedItem:SoftDollarBudget = { softDollarBudgetId: 2, ...updateItem, budgetState:1, calculatedHardDollar:0,calculatedSoftDollar:0,totalCommissionBudget:0,
                totalCost:0,totalNonResearchCost:0,status:true,endDate:new Date(), startDate:new Date(), divisionId:9, divisionName:'Div Name', masterBrokerId:9, masterBrokerCode:'M Code',
                masterBrokerName:'Master Broker', serviceName:'Service 1', departmentName:'Dept 1',brokerCode:'New Code', brokerName:'New Broker',
             }; 
            vi.fn(updateSoftBudget).mockResolvedValueOnce(returnedItem);     

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026}) 
            );

            await waitFor(async () => {  
                await result.current.loadSoftDollarBudgetData();  
            });

            await act(async () => {          
                const created = await result.current.updateSoftDollarBudget(softDollarBudgetId, updateItem);  
                expect(created).toEqual(returnedItem);  
            });    
        }); 

        it('update softdollar budget throws error on update fails', async () => {  
            vi.fn(updateSoftBudget).mockRejectedValueOnce(new Error('Update failed'));  
            const softDollarBudgetId: number = 2;
            const updateItem: RequestSoftDollarBudget={
                budgetTypeId:1, brokerId:99,  departmentId:99, serviceId:99, year:2026, ratio:1, lastUpdateBy: 'User1'  };
        
            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await act(async () => { 
                try { 
                    await result.current.updateSoftDollarBudget(softDollarBudgetId, updateItem);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Update failed"]);
                }
            }); 
        }); 
    });

    describe('delete method', () => {
        it('delete softdollar budget data successfully', async () => {  
            const softDollarBudgetId: number = 1;
            vi.fn(fetchSoftDollarBudgets).mockResolvedValueOnce(mockSoftdollarData);  
            vi.fn(deleteSoftBudget).mockResolvedValueOnce(true);  
        
            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );

            await waitFor(() => {  
                expect(result.current.softBudgetData).toEqual(mockSoftdollarData);  
            }); 

            await act(async () => {  
                await result.current.removeSoftDollarBudget(softDollarBudgetId);  
            });  

            expect(deleteSoftBudget).toBeTruthy(); 
        });

        it('delete softdollarbudget throws error on failures', async () => {  
            const softDollarBudgetId: number = 1;
            vi.fn(fetchSoftDollarBudgets).mockResolvedValueOnce(mockSoftdollarData);  
            vi.fn(deleteSoftBudget).mockRejectedValueOnce(new Error('Delete failed'));  

            const { result } = renderHook(() =>  
                useSoftDollarBudgets({userInfo:mockUserInfo, budgetYear:2026})  
            );  

            await waitFor(() => {  
                expect(result.current.softBudgetData).toEqual(mockSoftdollarData);  
            });  

            await act(async () => { 
                try { 
                    await result.current.removeSoftDollarBudget(softDollarBudgetId);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error: Delete failed');
                }
            });  
        });
    });    
});