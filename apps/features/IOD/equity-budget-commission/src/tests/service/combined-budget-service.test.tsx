import { fetchCombinedBudgetData } from '../../services/combined-budget-service';  
import type { CombinedBudget } from '../../datatypes/tcw-commission-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  
describe('fetchCombinedBudgetData', () => {
  // Mock fetch
  beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });

    const mockStartDate = new Date(2026,0,1);
    const mockEndDate = new Date(2026,0,31);

    const mockData: CombinedBudget[] = [  
    { 
        uniqueId: 'unique123',
        year: 2025,
        division: 'Test Div',
        masterBrokerName: 'Test Broker Name',
        intMstBkr: 'Test Broker Code',
        execComm: 0,
        researchComm: 0,
        totalBudget: 10,
        sumOfTotalComm: 10,
        remaining: 0,
        pctDone: 0,
        }  
    ];    

    describe('load method', () => {  
        it('fetches budgets data', async () => {              
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockData,  
            } as Response);  
        
          // Act  
          const result = await fetchCombinedBudgetData(mockStartDate, mockEndDate);  
        
           //Assert 
          expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/combined-budget'), expect.any(Object));  
          expect(result).toEqual(mockData);
        });  
        
        it('return empty or null data on fetch failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            // Act  
            try {  
             await fetchCombinedBudgetData(mockStartDate, mockEndDate);  
                throw new Error('Load failed');  
            } catch (err) {  
                //console.log('Caught Load errors:'+ String(err));
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Load error: Error: Load Data error');  
            }
        });
    });
  
});