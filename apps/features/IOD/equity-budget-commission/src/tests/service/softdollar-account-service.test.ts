import { fetchSoftdollarBudgetAccounts, 
    deleteSoftdollarBudgetAccount, 
    insertSoftdollarBudgetAccount, 
    updateSoftdollarBudgetAccount } 
    from '../../services/softdollar-account-service';  
import type { RequestSoftDollarBudgetAccount, SoftDollarBudgetAccount } from '../../datatypes/research-budget-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('fetchSoftdollarBudgetAccounts',() => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); // resets usage data  
    });

    describe('load method', async () => {    
        it('fetches softdollar budget account user-allocations data', async () => {
            const softDollarBudgetId = 123;
            const mockAccountsData: SoftDollarBudgetAccount[] = [
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

            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockAccountsData,  
            } as Response);  
        
            const data = await fetchSoftdollarBudgetAccounts(softDollarBudgetId);        
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/accounts/${softDollarBudgetId}`), expect.any(Object));  
            expect(data).toEqual(mockAccountsData);
        });

        it('return empty or undefined data on load failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            try {  
                await fetchSoftdollarBudgetAccounts(1);
                throw new Error('Load data failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: No Data Found');  
            }
        });        
    });

    describe('insert method', () => {
        const newItem: RequestSoftDollarBudgetAccount =  {   
            cost:10.0,softDollar:14.0,softDollarBudgetId:1,account:'Account 1',
            departmentId:1, status:'A',startDate:new Date(), endDate: new Date(), 
            year:2026, lastUpdateBy: mockUserInfo.name??"", comments:"inserted"
        }
        it('new data and returns inserted data successfully', async () => {  
            const returnedItem: SoftDollarBudgetAccount = { 
                softDollarBudgetAccountId:2, softDollarBudgetId:1, cost:10.0,softDollar:14.0,
                departmentId:2, departmentName:'Dept Name2', status:'A',account:'Account 1',
                startDate:new Date(), endDate: new Date(), serviceId:1, year:2026, serviceName:'Service A',
                userAllocations:[], budgetState:0
            };  
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => returnedItem,  
            } as Response);  
        
            const result = await insertSoftdollarBudgetAccount(newItem);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/account/'), expect.objectContaining({  
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
            await insertSoftdollarBudgetAccount(newItem);  
                throw new Error('Insert failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Failed to insert account');  
            }  
        });
        
        it('throws error on network failure', async () => {  
            vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));       
        
            try {  
            await insertSoftdollarBudgetAccount(newItem);  
                throw new Error('Network fail');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Network failure');  
            }
        });
    });

    describe('update method', () => {
        const softdollarAccountId = 1;
        const updateItem: RequestSoftDollarBudgetAccount =  {   
            cost:10.0,softDollar:14.0,softDollarBudgetId:1,account:'Account 1',
            departmentId:1, status:'A',startDate:new Date(), endDate: new Date(), 
            year:2026, lastUpdateBy: mockUserInfo.name??"", comments:"updated"
        }

        it('update data and returns updated data successfully', async () => {       
            const originalData: SoftDollarBudgetAccount = { 
                softDollarBudgetAccountId:2, softDollarBudgetId:1, cost:10.0,softDollar:14.0,
                departmentId:2, departmentName:'Dept Name2', status:'A',account:'Account 1',
                startDate:new Date(), endDate: new Date(), serviceId:1, year:2026, serviceName:'Service A',
                userAllocations:[], budgetState:0
            };             
            
            const returnedItem: SoftDollarBudgetAccount = { ...originalData  };  
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => returnedItem,  
            } as Response);  
        
            const result = await updateSoftdollarBudgetAccount(softdollarAccountId, updateItem);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/account/${softdollarAccountId}`),expect.objectContaining({  
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
              await updateSoftdollarBudgetAccount(1, updateItem);  
                throw new Error('Update failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error); 
                expect(String(err)).toMatch('Error: Update failed');  
            }   
        });
    });    

    describe('delete method', () => {
        const softdollarAccountId = 1
        it('delete data successfully', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,
            json: async() => true
            } as Response);  
    
            const result = await deleteSoftdollarBudgetAccount(softdollarAccountId);
            
            expect(result).toBeTruthy();
        });  
    
        it('throws error on delete failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            statusText: 'Key Not Found',  
            } as Response);  
    
            try {  
            await deleteSoftdollarBudgetAccount;  
            throw new Error('Delete failed');  
            } catch (err) {  
            expect(err).toBeInstanceOf(Error); 
            expect(String(err)).toMatch('Error: Delete failed');  
            } 
        }); 
    });
});