import { fetchServices } from '../../services/services-service';  
import type { BudgetService } from '../../datatypes/research-budget-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('fetchServices', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('load method', () => {  
    it('fetches services data', async () => {  
          const mockData: BudgetService[] = [  
            { serviceId:1, serviceName:'Service 1', accountId: 1, brokerId:99, categoryCode:'Test Code1', categoryId:1, categoryName:'Test Category1', cancelDescription:'test',
                documentation:'', renewalDescription:'',status:'Active',vendorId:1, vendorName:'Test Vendor1', startDate: new Date(), 
                lastUpdateDate: new Date(), lastUpdateBy: mockUserInfo.name ?? 'User1' },  
            { serviceId:2, serviceName:'Service 2', accountId: 2, brokerId:98, categoryCode:'Test Code2', categoryId:2, categoryName:'Test Category2', cancelDescription:'test',
                documentation:'', renewalDescription:'',status:'Active',vendorId:2, vendorName:'Test Vendor2', startDate: new Date(), 
                lastUpdateDate: new Date(), lastUpdateBy: mockUserInfo.name ?? 'User1' },  
          ];
      
          vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => mockData,  
          } as Response);  
      
          const data = await fetchServices();        
      
          expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/services'), expect.any(Object));  
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
            await fetchServices();
              throw new Error('Load data failed');  
            } catch (err) {  
              expect(err).toBeInstanceOf(Error);  
              expect(String(err)).toMatch('Error: No Data Found');  
            }
        });
      });
  });