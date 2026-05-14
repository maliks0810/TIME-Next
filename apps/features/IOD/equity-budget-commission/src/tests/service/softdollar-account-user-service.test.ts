import { fetchAccountUserAllocations, 
    deleteAccountUserAllocation, 
    insertAccountUserAllocation, 
    updateAccountUserAllocation } 
    from '../../services/softdollar-account-user-service';  
import type { RequestSoftDollarBudgetAccountUser, SoftDollarBudgetAccountUser } from '../../datatypes/research-budget-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('fetchAccountUserAllocations',() => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); // resets usage data  
    });

    describe('load method', async () => {    
        it('fetches softdollar budget account user-allocations data', async () => {
            const softbudgetAccountId = 123;
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

            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockUserAllocationData,  
            } as Response);  
        
            const data = await fetchAccountUserAllocations(softbudgetAccountId);        
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/soft-dollar-budget/account/'+softbudgetAccountId+'/user-allocations'), expect.any(Object));  
            expect(data).toEqual(mockUserAllocationData);
        });

        it('return empty or undefined data on load failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            try {  
                await fetchAccountUserAllocations(1);
                throw new Error('Load data failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: No Data Found');  
            }
        });        
    });

    describe('insert method', () => {
        const newItem: RequestSoftDollarBudgetAccountUser =  {   
            totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,budgetState:"",
            departmentId:1, userId:1,userStatus:'A',coopStaffCode:"", startDate:new Date(),
            endDate: new Date(), serviceId:1, budgetYear:2026, lastUpdateBy: mockUserInfo.name??""
        }
        it('new data and returns inserted data successfully', async () => {  
            const returnedItem: SoftDollarBudgetAccountUser = { 
                userAllocationId:1, softDollarBudgetId:1, totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,
                departmentId:1, departmentName:'Dept Name1', userName:'User 1', userId:1,userStatus:'A',
                startDate:new Date(), endDate: new Date(), ratio:1.4, serviceId:1, budgetYear:2026 
            };  
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => returnedItem,  
            } as Response);  
        
            const result = await insertAccountUserAllocation(newItem);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/account/user-allocation/'), expect.objectContaining({  
                method: 'POST',  
                headers: { 'Content-Type': 'application/json' },  
                body: JSON.stringify(newItem),  
            }));  
            expect(result).toEqual(returnedItem);  
        });  
        
        it('throws error on insert failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: false,  
                status: 500,  
                statusText: 'Internal Server Error',  
            json: async () => ({ message: 'Server error' }),  
            } as Response);       
        
            try {  
            await insertAccountUserAllocation(newItem);  
                throw new Error('Insert failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Failed to insert account user');  
            }  
        });
        
        it('throws error on network failure', async () => {  
            vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));       
        
            try {  
            await insertAccountUserAllocation(newItem);  
                throw new Error('Network fail');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Network failure');  
            }
        });
    });

    describe('update method', () => {
        const userAllocationId = 1;
        const updateItem: RequestSoftDollarBudgetAccountUser =  {   
            totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,budgetState:"",
            departmentId:1, userId:1,userStatus:'A',coopStaffCode:"", startDate:new Date(),
            endDate: new Date(), serviceId:1, budgetYear:2026, lastUpdateBy: mockUserInfo.name??""
        }

        it('update data and returns updated data successfully', async () => {       
            const originalData: SoftDollarBudgetAccountUser = { 
                userAllocationId:1, softDollarBudgetId:1, totalCost:10.0,commission:14.0,softDollarBudgetAccountId:1,
                departmentId:1, departmentName:'Dept Name1', userName:'User 1', userId:1,userStatus:'A',
                startDate:new Date(), endDate: new Date(), ratio:1.4, serviceId:1, budgetYear:2026 
            };            
            
            const returnedItem: SoftDollarBudgetAccountUser = { ...originalData  };  
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => returnedItem,  
            } as Response);  
        
            const result = await updateAccountUserAllocation(userAllocationId, updateItem);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/account/user-allocation/${userAllocationId}`),expect.objectContaining({  
                method: 'PUT',  
                cache: 'no-store',  
                headers: { 'Content-Type': 'application/json' },  
                body: JSON.stringify(updateItem),  
            })  
            );  
              
            expect(result).toEqual(returnedItem);  
        });

        it('throws error on update failure', async () => {  
            vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));        
        
            try {  
              await updateAccountUserAllocation(1, updateItem);  
                throw new Error('Update failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error); 
                expect(String(err)).toMatch('Error: Update failed');  
            }   
        });
    });    

    describe('delete method', () => {
        const userAllocationId = 1
        it('delete data successfully', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,
            json: async() => true
            } as Response);  
    
            const result = await deleteAccountUserAllocation(userAllocationId);
            
            expect(result).toBeTruthy();
        });  
    
        it('throws error on delete failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            statusText: 'Key Not Found',  
            } as Response);  
    
            try {  
            await deleteAccountUserAllocation;  
            throw new Error('Delete failed');  
            } catch (err) {  
            expect(err).toBeInstanceOf(Error); 
            expect(String(err)).toMatch('Error: Delete failed');  
            } 
        }); 
    });
});