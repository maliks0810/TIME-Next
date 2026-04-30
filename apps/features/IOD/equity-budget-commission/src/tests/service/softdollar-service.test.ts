import { fetchSoftDollarBudgets, fetchSoftDollarBudgetDetails, generateYears,
    createSoftBudget, deleteSoftBudget, updateSoftBudget } 
    from '../../services/softdollar-service';  
import { fetchAccountUserAllocations } from '../../services/softdollar-account-user-service';  
import type { BudgetYear, RequestSoftDollarBudget, SoftDollarBudget, SoftDollarBudgetAccountUser, SoftDollarBudgetDetail } from '../../datatypes/research-budget-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('fetchSoftDollarBudgets',() => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); // resets usage data  
    });

    describe('load method', async () => {
        const budgetYear: number = 2026;
        it('generate years', async () => {
            const mockYears: BudgetYear[] = [
                { text:"1001 - Actual", value:1001 },
                { text:"1002 - Actual", value:1002 }
            ];
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => mockYears,
            } as Response);

            const data = await generateYears(1000, 1005);

            expect(data.length).toBeGreaterThan(0);
        });

        it('fetches softdollar budget data', async () => {
            const mockSoftData: SoftDollarBudget[] = [
                { softDollarBudgetId:1, brokerId:9, brokerCode:'Brk Code1', brokerName:'Broker Name1', budgetState:1, budgetTypeId:2, calculatedHardDollar:10.0,calculatedSoftDollar:10.0,
                    departmentId:1, departmentName:'Dept Name', divisionId: 1, divisionName:'Div Name1', masterBrokerName:'M Broker Name', masterBrokerCode:'M Code1', masterBrokerId:1,  
                    startDate:new Date(), endDate: new Date(), ratio:1, serviceId:1, serviceName:'Service 1', status:true, totalCommissionBudget:0, totalCost:10, totalNonResearchCost:0,
                    year:2026, lastUpdateBy: mockUserInfo.name ??'User1' },
                { softDollarBudgetId:2, brokerId:9, brokerCode:'Brk Code1', brokerName:'Broker Name1', budgetState:1, budgetTypeId:2, calculatedHardDollar:10.0,calculatedSoftDollar:10.0,
                    departmentId:1, departmentName:'Dept Name', divisionId: 1, divisionName:'Div Name1', masterBrokerName:'M Broker Name', masterBrokerCode:'M Code1', masterBrokerId:1,  
                    startDate:new Date(), endDate: new Date(), ratio:1, serviceId:1, serviceName:'Service 1', status:true, totalCommissionBudget:0, totalCost:10, totalNonResearchCost:0,
                    year:2026, lastUpdateBy: mockUserInfo.name ??'User1' }
            ];

            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockSoftData,  
            } as Response);  
        
            const data = await fetchSoftDollarBudgets(budgetYear);        
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/soft-dollar-budget'), expect.any(Object));  
            expect(data).toEqual(mockSoftData);
        });

        it('return empty or undefined data on load failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            try {  
                await fetchSoftDollarBudgets(budgetYear);
                throw new Error('Load data failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: No Data Found');  
            }
        }); 
        const softbudgetId: number = 1;
        it('fetches softdollar budget details data', async () => {
            const mockSoftDetailData: SoftDollarBudgetDetail[] = [
                { softDollarBudgetId:1, brokerId:9, brokerName:'Broker Name1', hardDollar:10.0,softDollar:10.0, accounts:[], changeLog:[],
                    divisionId: 1, divisionName:'Div Name1', ratio:1, serviceName:'Service 1', serviceDescription:'Service Description', year:2026 },
                { softDollarBudgetId:2, brokerId:19, brokerName:'Broker Name2', hardDollar:10.0,softDollar:10.0, accounts:[], changeLog:[],
                    divisionId: 1, divisionName:'Div Name1', ratio:1, serviceName:'Service 2', serviceDescription:'Service Description', year:2026 },
            ];

            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockSoftDetailData,  
            } as Response);  
        
            const data = await fetchSoftDollarBudgetDetails(1);        
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/soft-dollar-budget/detail/'+softbudgetId), expect.any(Object));  
            expect(data).toEqual(mockSoftDetailData);
        });

        it('return empty or undefined data on load failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            try {  
                await fetchSoftDollarBudgetDetails(1);
                throw new Error('Load data failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: No Data Found');  
            }
        }); 

        it('fetches softdollar budget account user-allocations data', async () => {
            const softbudgetAccountId = 123;
            const mockUserAllocationData: SoftDollarBudgetAccountUser[] = [
                { userAllocationId: 1, softDollarBudgetAccountId:123, softDollarBudgetId:1, budgetYear: 2026, departmentId: 1, departmentName: 'Dept 1',  
                    totalCost:0, commission:0, ratio:1.4, serviceId:1,  userId:12, userName:'Test User1', userStatus:'Active' , 
                    startDate: new Date(), endDate: new Date()  }
            ];

            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockUserAllocationData,  
            } as Response);  
        
            const data = await fetchAccountUserAllocations(softbudgetAccountId);        
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/soft-dollar-budget/account/'+softbudgetAccountId+'/user-allocations'), expect.any(Object));  
            expect(data).toEqual(mockUserAllocationData);
        });
    });

    describe('insert method', () => {
        const newItem: RequestSoftDollarBudget={
            budgetTypeId:1, brokerId:99,  departmentId:99, serviceId:99, year:2026, ratio:1, lastUpdateBy: 'User1'  };

        it('new data and returns inserted data successfully', async () => {  
            const returnedItem:SoftDollarBudget = { softDollarBudgetId: 2, ...newItem, budgetState:1, calculatedHardDollar:0,calculatedSoftDollar:0,totalCommissionBudget:0,
                totalCost:0,totalNonResearchCost:0,status:true,endDate:new Date(), startDate:new Date(), divisionId:9, divisionName:'Div Name', masterBrokerId:9, masterBrokerCode:'M Code',
                masterBrokerName:'Master Broker', serviceName:'Service 1', departmentName:'Dept 1',brokerCode:'New Code', brokerName:'New Broker',
             };  
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => returnedItem,  
            } as Response);  
        
            const result = await createSoftBudget(newItem);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/'), expect.objectContaining({  
                method: 'POST',  
                headers: { 'Content-Type': 'application/json' },  
                body: JSON.stringify(newItem),  
            }));  
            expect(result.softDollarBudgetId).toEqual(returnedItem.softDollarBudgetId);  
        });  
        
        it('throws error on insert failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: false,  
                status: 500,  
                statusText: 'Internal Server Error',  
            json: async () => ({ message: 'Server error' }),  
            } as Response);       
        
            try {  
            await createSoftBudget(newItem);  
                throw new Error('Insert failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Failed to insert record: 500');  
            }  
        });
        
        it('throws error on network failure', async () => {  
            vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));       
        
            try {  
            await createSoftBudget(newItem);  
                throw new Error('Network fail');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Network failure');  
            }
        });
    });

    describe('update method', () => {
        const updateItem: RequestSoftDollarBudget =  {   
            softDollarBudgetId:1, budgetTypeId:1, brokerId:99,  departmentId:99, serviceId:99, year:2026, ratio:1, lastUpdateBy: 'User1'  
        };

        it('update data and returns updated data successfully', async () => {       
            const originalData: SoftDollarBudget = { 
                softDollarBudgetId:1, brokerId:9, brokerCode:'Brk Code1', brokerName:'Broker Name1', budgetState:1, budgetTypeId:2, calculatedHardDollar:10.0,calculatedSoftDollar:10.0,
                departmentId:1, departmentName:'Dept Name', divisionId: 1, divisionName:'Div Name1', masterBrokerName:'M Broker Name', masterBrokerCode:'M Code1', masterBrokerId:1,  
                startDate:new Date(), endDate: new Date(), ratio:1, serviceId:1, serviceName:'Service 1', status:true, totalCommissionBudget:0, totalCost:10, totalNonResearchCost:0,
                year:2026, lastUpdateBy: mockUserInfo.name ??'User1' 
            };            
            
            const returnedItem: SoftDollarBudget = { ...originalData  };  
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => returnedItem,  
            } as Response);  
        
            const result = await updateSoftBudget(updateItem);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/`),expect.objectContaining({  
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
                await updateSoftBudget(updateItem);  
                throw new Error('Update failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error); 
                expect(String(err)).toMatch('Error: Update failed');  
            }   
        });
    });

    describe('delete method', () => {
        const softdollarBudgetId = 1;
        it('delete softdollar budget data successfully', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,
                json: async() => true
            } as Response);  
    
            const result = await deleteSoftBudget(softdollarBudgetId);
            
            expect(result).toBeTruthy();
        });  
    
        it('throws error on delete failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: false,  
                statusText: 'Key Not Found',
            } as Response);  
    
            try {  
                await deleteSoftBudget;
                throw new Error('Delete failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error); 
                expect(String(err)).toMatch('Error: Delete failed');  
            } 
        }); 
    });
  });