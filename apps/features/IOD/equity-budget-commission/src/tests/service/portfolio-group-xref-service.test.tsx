import { fetchPortfolioGroupXrefs, createPortfolioGroupXref, updatePortfolioGroupXref, deletePortfolioGroupXref } from '../../services/portfolio-group-xref-service';  
import type { MaintenancePortfolioGroupXref, RequestMaintenancePortfolioGroupXref } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('fetchPortfolioGroupXrefs', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('load method', () => {  
    it('fetches portfolio group xref data', async () => {  
          const mockData: MaintenancePortfolioGroupXref[] = [  
            { portfolioGroupId:99, portfolioGroupXrefId:1, portfolioId:999, lastUpdateDate: new Date(), lastUpdateBy: mockUserInfo.name ?? 'User1' },  
            { portfolioGroupId:98, portfolioGroupXrefId:2, portfolioId:998, lastUpdateDate: new Date(), lastUpdateBy: mockUserInfo.name ?? 'User1' },  
          ];
      
          vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => mockData,  
          } as Response);  
      
          const data = await fetchPortfolioGroupXrefs();        
      
          expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio-group-xrefs'), expect.any(Object));  
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
            await fetchPortfolioGroupXrefs();
              throw new Error('Load data failed');  
            } catch (err) {  
              expect(err).toBeInstanceOf(Error);  
              expect(String(err)).toMatch('Error: No Data Found');  
            }
        });
      });

    describe('insert method', () => {  
      const newItem: RequestMaintenancePortfolioGroupXref = { portfolioGroupId: 1, portfolioId:5, lastUpdateBy: mockUserInfo.name??"User1" };  

      it('post data and returns inserted item', async () => {  
        const returnedItem: MaintenancePortfolioGroupXref = { portfolioGroupXrefId: 2, ...newItem, lastUpdateDate: new Date()  };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await createPortfolioGroupXref(newItem);

        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio-group-xref'), expect.objectContaining({  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            portfolioGroupId: newItem.portfolioGroupId,  
            portfolioId: newItem.portfolioId,  
            lastUpdateBy: mockUserInfo.name,  
          }),  
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
          await createPortfolioGroupXref(newItem); 
            throw new Error('Insert failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Internal Server Error');  
          }  
      });
      
      it('throws error on network failure', async () => {  
        vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
        try {  
          await createPortfolioGroupXref(newItem);  
            throw new Error('Network fail');  
          } catch (err) {  
            //console.log('Caught errors again:'+ String(err));
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Network failure');  
          }
      }); 
    }); 

    describe('update method', () => {        
      const updateItem: RequestMaintenancePortfolioGroupXref = {  
          portfolioGroupId: 3,  
          portfolioId: 2,  
          lastUpdateBy: mockUserInfo.name??""
        };  

      it('updates data and returns updated item successfully', async () => {  
        const key = 1; 
        
        const returnedItem = {  
          portfolioGroupId: 3,  
          portfolioId: 2,   
          lastUpdateBy: mockUserInfo.name,  
        };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await updatePortfolioGroupXref(key, updateItem);  
    
        // Check fetch called with correct URL and options  
        expect(window.fetch).toHaveBeenCalledWith(  
          expect.stringContaining(`/portfolio-group-xrefs/${key}`),  
          expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({  
              portfolioGroupId: updateItem.portfolioGroupId,  
              portfolioId: updateItem.portfolioId,  
              lastUpdateBy: mockUserInfo.name,  
            }),  
          })  
        );
        
        // Check returned data matches mocked response  
        expect(result).toEqual(returnedItem);  
    });  
    
    it('throws error on update failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  

      try {  
        await updatePortfolioGroupXref(1, updateItem);  
          throw new Error('Update failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Update failed');  
        }   
      }); 
    }); 

    describe('remove method', () => {  
      const key = 1
      it('delete data successfully', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,
          json: async() => true
        } as Response);  

        const result = await deletePortfolioGroupXref(key);
      
        expect(result).toBeTruthy();
      });  

      it('throws error on delete failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          statusText: 'Key Not Found',  
        } as Response);  

        try {  
        await deletePortfolioGroupXref(key);  
          throw new Error('Delete failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Key Not Found');  
        } 
      });  
    }); 
  });