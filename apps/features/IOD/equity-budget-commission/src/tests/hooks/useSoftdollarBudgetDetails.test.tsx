import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSoftDollarBudgetDetails } from '../../hooks/useSoftDollarBudgetWithDetails';
import type { SoftDollarBudgetDetail,
    SoftDollarBudgetAccount, RequestSoftDollarBudgetAccount,
    SoftDollarBudgetAccountUser, RequestSoftDollarBudgetAccountUser} from '../../datatypes/research-budget-types';
import { fetchSoftDollarBudgetDetails } from '../../services/softdollar-service'
import { fetchSoftdollarBudgetAccounts, 
    updateSoftdollarBudgetAccount, 
    insertSoftdollarBudgetAccount,
    deleteSoftdollarBudgetAccount } from '../../services/softdollar-account-service';
import { fetchUsers } from '../../services/user-service';
import { MaintenanceUser } from '../../datatypes/budget-maintenance-types';
import { fetchAccountUserAllocations, 
    insertAccountUserAllocation, 
    updateAccountUserAllocation, 
    deleteAccountUserAllocation } from '../../services/softdollar-account-user-service';

import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/user-service', () => ({
    fetchUsers: vi.fn()
}));

vi.mock('../../services/softdollar-service', () => ({
    fetchSoftDollarBudgetDetails: vi.fn()
}));

vi.mock('../../services/softdollar-account-service', () => ({
    fetchSoftdollarBudgetAccounts: vi.fn(),
    insertSoftdollarBudgetAccount: vi.fn(),
    updateSoftdollarBudgetAccount: vi.fn(),
    deleteSoftdollarBudgetAccount: vi.fn()
}));

vi.mock('../../services/softdollar-account-user-service', () => ({
    fetchAccountUserAllocations: vi.fn(),
    insertAccountUserAllocation: vi.fn(),
    updateAccountUserAllocation: vi.fn(),
    deleteAccountUserAllocation: vi.fn()
}));

const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockUserData: MaintenanceUser[] = [  
    { userId: 1, userName: 'lname,fname', firstName: 'fname', lastName:'lname', locationCode: 'US', status: 'Active', lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:''  }  
];
const mockSoftBudgetDetailData: SoftDollarBudgetDetail = { 
    softDollarBudgetId:1, brokerId:9, brokerName:'Broker Name1', hardDollar:10.0,softDollar:10.0, accounts:[], changeLog:[],
    divisionId: 1, divisionName:'Div Name1', ratio:1, serviceName:'Service 1', serviceDescription:'Service Description', year:2026 
    };

const mockSoftBudgetAccountsData: SoftDollarBudgetAccount[] = [
    {   
        softDollarBudgetAccountId:1, softDollarBudgetId:1, cost:10.0,softDollar:14.0,
        departmentId:1, departmentName:'Dept Name1', status:'A',account:'Account 1',
        startDate:new Date(), endDate: new Date(), serviceId:1, year:2026, serviceName:'Service A',
        userAllocations:[], budgetState:0  
    },
    {   
        softDollarBudgetAccountId:2, softDollarBudgetId:1, cost:10.0,softDollar:14.0,
        departmentId:2, departmentName:'Dept Name2', status:'A',account:'Account 1',
        startDate:new Date(), endDate: new Date(), serviceId:1, year:2026, serviceName:'Service A',
        userAllocations:[], budgetState:0 
    }
];

const mockUserAllocationData: SoftDollarBudgetAccountUser[] = [
    { userAllocationId:1, softDollarBudgetId:1, totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,
        departmentId:1, departmentName:'Dept Name1', userName:'User 1', userId:1,userStatus:'A',
        startDate:new Date(), endDate: new Date(), ratio:1.4, serviceId:1, budgetYear:2026 
    },
    { userAllocationId:2, softDollarBudgetId:1, totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,
        departmentId:2, departmentName:'Dept Name2', userName:'User 2', userId:2,userStatus:'A',
        startDate:new Date(), endDate: new Date(), ratio:1.4, serviceId:1, budgetYear:2026 
    }
];
const softdollarBudgetId = 1;
const softdollarBudgetAccountId = 1;

describe('useSoftDollarBudgets', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    describe('load method', ()=>{
        /** Softdollar Budget Details */
        it('load softdollar budget details data successfully', async () => {  
            vi.fn(fetchSoftDollarBudgetDetails).mockResolvedValueOnce(mockSoftBudgetDetailData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.loadSoftDollarBudgetDetails(softdollarBudgetId));  
            });  

            expect(fetchSoftDollarBudgetDetails).toHaveBeenCalledTimes(1);
        });
        it('handle error when load softdollar budget detail data failed', async () => {  
            vi.fn(fetchSoftDollarBudgetDetails).mockRejectedValueOnce(  
                new Error('Failed to fetch softdollar budget detail')
            );  
            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchSoftDollarBudgetDetails).mockReturnThis();
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);
                    expect(String(err)).toBe('Failed to fetch softdollar budget detail');
                }
            });
        });        
        /** Users */
        it('load users data successfully', async () => {  
            vi.fn(fetchUsers).mockResolvedValueOnce(mockUserData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.users).toEqual(mockUserData);  
            });  

            expect(fetchUsers).toHaveBeenCalledTimes(1);
        });
        it('handle error when load users data failed', async () => {  
            vi.fn(fetchUsers).mockRejectedValueOnce(  
                new Error('Failed to fetch users')
            );  
            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchUsers).mockReturnThis();
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);
                    expect(String(err)).toBe('Failed to fetch users');
                }
            });
        }); 
        /** Softdollar Budget Accounts */
        it('load softdollar budget accounts data successfully', async () => {  
            vi.fn(fetchSoftdollarBudgetAccounts).mockResolvedValueOnce(mockSoftBudgetAccountsData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.loadSoftdollarBudgetAccounts(softdollarBudgetId));  
            });  

            expect(fetchSoftdollarBudgetAccounts).toHaveBeenCalledTimes(1);
        });
        it('handle error when load softdollar budget accounts data failed', async () => {  
            vi.fn(fetchSoftdollarBudgetAccounts).mockRejectedValueOnce(  
                new Error('Failed to fetch softdollar budget account')
            );  
            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchSoftdollarBudgetAccounts).mockReturnThis();
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);
                    expect(String(err)).toBe('Failed to fetch softdollar budget account');
                }
            });
        });
        /** Softdollar Budget Account User allocations */
        it('load softdollar budget account userallocations data successfully', async () => {  
            vi.fn(fetchAccountUserAllocations).mockResolvedValueOnce(mockUserAllocationData);  

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.loadSoftAccountUserAllocations(softdollarBudgetAccountId));  
            });  

            expect(fetchAccountUserAllocations).toHaveBeenCalledTimes(1);
        });
        it('handle error when load softdollar budget account userallocations data failed', async () => {  
            vi.fn(fetchAccountUserAllocations).mockRejectedValueOnce(  
                new Error('Failed to fetch softdollar budget account')
            );  
            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchAccountUserAllocations).mockReturnThis();
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);
                    expect(String(err)).toBe('Failed to fetch softdollar budget account');
                }
            });
        });
    });

    describe('insert method',() => {
        /** Softdollar Budget Account */
        const newAccountItem: RequestSoftDollarBudgetAccount =  {   
            cost:10.0,softDollar:14.0,softDollarBudgetId:1,account:'Account 1', departmentId:1, status:'Active',
            startDate:new Date(), endDate: new Date(), year:2026, lastUpdateBy: mockUserInfo.name??"", comments:"inserted"
        };
        it('insert softdollar budget account data successfully', async () => {  
            vi.fn(fetchSoftdollarBudgetAccounts).mockResolvedValueOnce([]); 
            const returnedItem: SoftDollarBudgetAccount = { 
                softDollarBudgetAccountId:2, softDollarBudgetId:1, cost:10.0,softDollar:14.0, departmentId:2, 
                departmentName:'Dept Name2', status:'A',account:'Account 1', startDate:new Date(), endDate: new Date(), 
                serviceId:1, year:2026, serviceName:'Service A', userAllocations:[], budgetState:0
            }; 
            vi.fn(insertSoftdollarBudgetAccount).mockResolvedValueOnce(returnedItem);     

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );

            await waitFor(async () => {  
                await result.current.loadSoftdollarBudgetAccounts(softdollarBudgetId);  
            });

            await act(async () => {          
                const created = await result.current.createSoftdollarBudgetAccount(newAccountItem);  
                expect(created).toEqual(returnedItem);  
            });    
        }); 

        it('create softdollar budget account throws error on insert fails', async () => {  
            vi.fn(insertSoftdollarBudgetAccount).mockRejectedValueOnce(new Error('Insert failed'));

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await act(async () => { 
                try { 
                    await result.current.createSoftdollarBudgetAccount(newAccountItem);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Insert failed"]);
                }
            }); 
        });    
        /** Softdollar Budget Account User Allocations*/
        const newUserItem: RequestSoftDollarBudgetAccountUser =  {   
            totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,budgetState:"", departmentId:1, userId:1,
            userStatus:'A',coopStaffCode:"", startDate:new Date(), endDate: new Date(), serviceId:1, budgetYear:2026, 
            lastUpdateBy: mockUserInfo.name??""
        };
        it('insert softdollar budget account user allocation data successfully', async () => {  
            vi.fn(fetchAccountUserAllocations).mockResolvedValueOnce([]); 
            const returnedItem: SoftDollarBudgetAccountUser = { 
                userAllocationId:1, softDollarBudgetId:1, totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,
                departmentId:1, departmentName:'Dept Name1', userName:'User 1', userId:1,userStatus:'A',
                startDate:new Date(), endDate: new Date(), ratio:1.4, serviceId:1, budgetYear:2026 
            }; 

            vi.fn(insertAccountUserAllocation).mockResolvedValueOnce(returnedItem);     

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );

            await waitFor(async () => {  
                await result.current.loadSoftAccountUserAllocations(softdollarBudgetAccountId);  
            });

            await act(async () => {          
                const created = await result.current.createSoftAccountUserAllocation(newUserItem);  
                expect(created).toEqual(returnedItem);  
            });    
        }); 

        it('create softdollar budget account user allocation throws error on insert fails', async () => {  
            vi.fn(insertAccountUserAllocation).mockRejectedValueOnce(new Error('Insert failed'));

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await act(async () => { 
                try { 
                    await result.current.createSoftAccountUserAllocation(newUserItem);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Insert failed"]);
                }
            }); 
        });
    });
    describe('update method',() => {
        /** Softdollar Budget Account */
        const updateAccountItem: RequestSoftDollarBudgetAccount =  {   
            cost:10.0,softDollar:14.0,softDollarBudgetId:1,account:"Account 1", departmentId:1, status:"Active",
            startDate:new Date(), endDate: new Date(),year:2026, lastUpdateBy: mockUserInfo.name??"", comments:"updated"
        };
        it('Update softdollar budget account data successfully', async () => {  
            const softdollarAccountId = 1;
            vi.fn(fetchSoftdollarBudgetAccounts).mockResolvedValueOnce([]); 
            const returnedItem:SoftDollarBudgetAccount = { 
                softDollarBudgetAccountId:2, softDollarBudgetId:1, cost:10.0,softDollar:14.0,
                departmentId:2, departmentName:'Dept Name2', status:'A',account:'Account 1',
                startDate:new Date(), endDate: new Date(), serviceId:1, year:2026, serviceName:'Service A',
                userAllocations:[], budgetState:0
            };
            vi.fn(updateSoftdollarBudgetAccount).mockResolvedValueOnce(returnedItem);     

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId}) 
            );

            await waitFor(async () => {  
                await result.current.loadSoftdollarBudgetAccounts(softdollarBudgetId);  
            });

            await act(async () => {  
                try{        
                    const updated = await result.current.modifySoftdollarBudgetAccount(softdollarAccountId, updateAccountItem);  
                    expect(updated).toEqual(returnedItem);  
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Softdollar Budget Account not found"]);
                }
            });    
        }); 

        it('update softdollar budget account throws error on update fails', async () => {  
            const softdollarAccountId = 1;
            vi.fn(updateSoftdollarBudgetAccount).mockRejectedValueOnce(new Error('Update failed'));  
            
            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await act(async () => { 
                try { 
                    await result.current.modifySoftdollarBudgetAccount(softdollarAccountId, updateAccountItem);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Softdollar Budget Account not found"]);
                }
            }); 
        });

        /** Softdollar Budget Account User Allocations */
        const updateAccountUserItem: RequestSoftDollarBudgetAccountUser =  {   
            totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,budgetState:"",
            departmentId:1, userId:1,userStatus:'A',coopStaffCode:"", startDate:new Date(),
            endDate: new Date(), serviceId:1, budgetYear:2026, lastUpdateBy: mockUserInfo.name??""
        }

        it('Update softdollar budget account user allocation data successfully', async () => {  
            const userAllocationId = 1;
            vi.fn(fetchAccountUserAllocations).mockResolvedValueOnce([]); 
            const returnedItem:SoftDollarBudgetAccountUser = { 
                userAllocationId:1, softDollarBudgetId:1, totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,
                departmentId:1, departmentName:'Dept Name1', userName:'User 1', userId:1,userStatus:'A',
                startDate:new Date(), endDate: new Date(), ratio:1.4, serviceId:1, budgetYear:2026 
            };
            vi.fn(updateAccountUserAllocation).mockResolvedValueOnce(returnedItem);     

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId}) 
            );

            await waitFor(async () => {  
                await result.current.loadSoftAccountUserAllocations(softdollarBudgetAccountId);  
            });

            await act(async () => {  
                try{        
                    const updated = await result.current.modifySoftAccountUserAllocation(userAllocationId, updateAccountUserItem);  
                    expect(updated).toEqual(returnedItem);  
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Softdollar Budget Account User not found"]);
                }
            });    
        }); 

        it('update softdollar budget account user allocation throws error on update fails', async () => {  
            const userAllocationId = 1;
            vi.fn(updateAccountUserAllocation).mockRejectedValueOnce(new Error('Update failed'));  
            
            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await act(async () => { 
                try { 
                    await result.current.modifySoftAccountUserAllocation(userAllocationId, updateAccountUserItem);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Softdollar Budget Account User not found"]);
                }
            }); 
        });
    });

    describe('delete method', () => {
        /** Softdollar Budget Account */
        it('delete softdollar budget account data successfully', async () => {  
            const softdollarAccountId: number = 1;
            vi.fn(fetchSoftdollarBudgetAccounts).mockResolvedValueOnce(mockSoftBudgetAccountsData);  
            vi.fn(deleteSoftdollarBudgetAccount).mockResolvedValueOnce(true);  
        
            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})   
            );

            await waitFor(async () => {  
                expect(await result.current.loadSoftdollarBudgetAccounts(softdollarBudgetId));  
            }); 

            await act(() => {  
                result.current.removeSoftdollarBudgetAccount(softdollarAccountId);  
            });  

            expect(deleteSoftdollarBudgetAccount).toBeTruthy(); 
        });

        it('delete softdollar budget account throws error on failures', async () => {  
            const softdollarAccountId: number = 1;
            vi.fn(fetchSoftdollarBudgetAccounts).mockResolvedValueOnce(mockSoftBudgetAccountsData);  
            vi.fn(deleteSoftdollarBudgetAccount).mockRejectedValueOnce(new Error('Delete failed'));  

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.loadSoftdollarBudgetAccounts(softdollarBudgetId));  
            });  

            await act(async () => { 
                try { 
                    await result.current.removeSoftdollarBudgetAccount(softdollarAccountId);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error: Delete failed');
                }
            });  
        });   
        /** Softdollar Budget Account user Allocation */
        it('delete softdollar budget account user allcoation data successfully', async () => {  
            const userAllocationId: number = 1;
            vi.fn(fetchAccountUserAllocations).mockResolvedValueOnce(mockUserAllocationData);  
            vi.fn(deleteAccountUserAllocation).mockResolvedValueOnce(true);  
        
            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})   
            );

            await waitFor(() => {  
                expect(result.current.loadSoftAccountUserAllocations(softdollarBudgetAccountId));  
            }); 

            await act(async () => {  
                await result.current.removeSoftAccountUserAllocation(userAllocationId);  
            });  

            expect(deleteAccountUserAllocation).toBeTruthy(); 
        });

        it('delete softdollar budget account user allocation throws error on failures', async () => {  
            const userAllocationId: number = 1;
            vi.fn(fetchAccountUserAllocations).mockResolvedValueOnce(mockUserAllocationData);  
            vi.fn(deleteAccountUserAllocation).mockRejectedValueOnce(new Error('Delete failed'));  

            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.loadSoftAccountUserAllocations(softdollarBudgetAccountId));  
            });  

            await act(async () => { 
                try { 
                    await result.current.removeSoftAccountUserAllocation(userAllocationId);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error: Delete failed');
                }
            });  
        });

        it('clear softdollar budget account user allocation data', async () => {
            vi.fn(fetchAccountUserAllocations).mockResolvedValueOnce([]);  
            const { result } = renderHook(() =>  
                useSoftDollarBudgetDetails({userData: mockUserInfo, softdollarBudgetId, softdollarBudgetAccountId})  
            );  

            await waitFor(() => {  
                expect(result.current.clearSoftAccountUserAllocationData());  
            });

            expect(result.current.softAccountUserAllocations).toEqual([]);
        });
    });
});