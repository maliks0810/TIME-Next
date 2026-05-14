import { fetchResearchBudgets, createResearchBudgets, generateYears,fetchAllBudgetYears } 
    from '../../services/annual-research-budget-service';  
import type { BudgetYear, RequestResearchBudget, ResearchBudget } from '../../datatypes/research-budget-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  describe('fetchResearchBudgets',() => {
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
                { text:"2025", value:2025 },
                { text:"2026", value:2026 }
            ];
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => mockYears,
            } as Response);

            const data = await generateYears(2025);

            expect(data.length).toBeGreaterThan(0);
        });

        it('fetches research budget data', async () => {
            const mockData: ResearchBudget[] = [  
                        { composite_Id: '1', masterBrokerId: "1", divisionId:1, budgetYear:2025, masterBroker: 'Broker 1', mBkrCode: 'B001', division: 'ABD', total: 100, 
                            quarter_Four_Id:4, quarter_One_Id:1, quarter_Three_Id:3, quarter_Two_Id:2, 
                            quarterFour:0, quarterOne:0, quarterThree:0, quarterTwo:0 }  
                        ];

            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockData,  
            } as Response);  
        
            const data = await fetchResearchBudgets(budgetYear);        
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/research-budget'), expect.any(Object));  
            expect(data).toEqual(mockData);
        });

        it('return empty or undefined data on load failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            try {  
                await fetchResearchBudgets(budgetYear);
                throw new Error('Load data failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: No Data Found');  
            }
        });
        it('fetch all budget years', async ()=> {
            const mockYears = [2021,2022,2023,2024,2025,2026];
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockYears,  
            } as Response);  
        
            const data = await fetchAllBudgetYears();
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/all-budget-years'), expect.any(Object));  
            expect(data).toEqual(mockYears);
        });
    });
    describe('insert method', () => {
        const newItems: RequestResearchBudget[]=[
            { masterBrokerId: "123", divisionId:1, budgetYear:2025, quarterFour:100, quarterOne:0, quarterThree:0, quarterTwo:0 },
            { masterBrokerId: "234", divisionId:1, budgetYear:2025, quarterFour:110, quarterOne:0, quarterThree:0, quarterTwo:0 },
        ];

        it('new data and returns inserted data successfully', async () => {        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => true,  
            } as Response);
        
            const result = await createResearchBudgets(newItems);  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/annual-budgets'), expect.objectContaining({  
                method: 'POST',  
                headers: { 'Content-Type': 'application/json' },  
                body: JSON.stringify(newItems),  
            }));  
            expect(result).toBeTruthy();  
        });  
        
        it('throws error on insert failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: false,  
                status: 500,  
                statusText: 'Internal Server Error',  
                json: async () => ({ message: 'Server error' }),  
            } as Response);       
        
            try {  
            await createResearchBudgets(newItems);  
                throw new Error('Insert failed');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Internal Server Error');  
            }  
        });
        
        it('throws error on network failure', async () => {  
            vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));       
        
            try {  
            await createResearchBudgets(newItems);  
                throw new Error('Network fail');  
            } catch (err) {  
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Network failure');  
            }
        });
    });
  });