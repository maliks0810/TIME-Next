import { fetchCSAMonthlyComm } from '../../services/csa-monthly-service';  
import type { CSAMonthlyCommission
} from '../../datatypes/tcw-commission-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 

describe('adminUserDataService', () => {  
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });

  const mockData: CSAMonthlyCommission[] = [  
      { rowNum: 1, division: 'User,Test', creditBroker: 'Test', creditMBrokerName:'User', execMBroker: 'US', execMbrokerName: 'Active', 
        commission: 100, month:1,reason:'A' }];

  describe('load method', () => {    
    const month = 1;
    it('fetches CSA Monthly commissions data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchCSAMonthlyComm(month);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/csa-monthly/${month}`), expect.any(Object));  
      expect(data).toEqual(mockData);
    });  
  
    it('return empty or undefined csa monthly commission data on load failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        status: 204,  
        statusText: 'No Data Found',  
        json: async () => ({ message: 'No Data found' }),  
      } as Response);   

      try {  
        await fetchCSAMonthlyComm(month);  
          throw new Error('Load failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: No Data Found');  
        }
    });
  });
});