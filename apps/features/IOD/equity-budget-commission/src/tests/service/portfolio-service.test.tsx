import { fetchPortfolios, createPortfolio, deletePortfolio, updatePortfolio } from '../../services/portfolio-service';  
import type { MaintenancePortfolio, RequestMaintenancePortfolio } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

describe('fetchPortfolios', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('load method', () => {  
    it('fetches portfolio group data', async () => {  
      const mockData: MaintenancePortfolio[] = [  
        { portfolioId:1, portfolioGroupId:98, portfolioCode:'Code1', portfolioName:'Portfolio 1', portfolioNumber:'number 1', departmentId:1, departmentName:'Dept 1', divisionId:1, divisionName:'Div 1', status:'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
        { portfolioId:2, portfolioGroupId:99, portfolioCode:'Code2', portfolioName:'Portfolio 2', portfolioNumber:'number 2', departmentId:1, departmentName:'Dept 2', divisionId:1, divisionName:'Div 2', status:'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
      ];
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchPortfolios();        
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolios'), expect.any(Object));  
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
        await fetchPortfolios();
          throw new Error('Load data failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: No Data Found');  
        }
    });
  });

  describe('insert method', () => {
    const newItem:RequestMaintenancePortfolio = {  
        portfolioCode:'Code1', 
        portfolioName:'Portfolio 1', 
        portfolioGroupId:98, 
        portfolioNumber:'number 1', 
        departmentId:1, 
        departmentName:'Dept 1', 
        divisionId:1, 
        divisionName:'Div 1', 
        status:'Active', 
        lastUpdateBy: mockUserInfo.name?? 'User1' 
      };  

    it('new data and returns inserted data successfully', async () => {  
      const returnedItem:MaintenancePortfolio = { portfolioId: 2, lastUpdateDate:new Date(), ...newItem };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await createPortfolio(newItem);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio'), expect.objectContaining({  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          portfolioCode: newItem.portfolioCode,
          portfolioName: newItem.portfolioName,  
          portfolioGroupId: newItem.portfolioGroupId,
          portfolioNumber: newItem.portfolioNumber,
          departmentId: newItem.departmentId,  
          departmentName: newItem.departmentName,
          divisionId: newItem.divisionId,
          divisionName: newItem.divisionName,
          status: newItem.status,  
          lastUpdateBy: newItem.lastUpdateBy,  
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
        await createPortfolio(newItem);  
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Internal Server Error');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));       
    
      try {  
        await createPortfolio(newItem);  
          throw new Error('Network fail');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Network failure');  
        }
    }); 
  }); 

  describe('update method', () => {  
    const updateItem:RequestMaintenancePortfolio = {  
        portfolioName:'Updated Portfolio', 
        portfolioCode:'Updated Code', 
        portfolioGroupId:1, 
        portfolioNumber:'Updated Number', 
        departmentId:11, 
        departmentName:'Updated Dept', 
        divisionId:11, 
        divisionName:'Updated Div', 
        status:'Active', 
        lastUpdateBy: mockUserInfo.name?? 'User1' 
      };
    it('update data and returns updated data successfully', async () => {  
      const key = 1;      
    
      const returnedItem: MaintenancePortfolio = { portfolioId:1, lastUpdateDate:new Date(), ...updateItem  };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
    
      const result = await updatePortfolio(key, updateItem);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/portfolios/${key}`),expect.objectContaining({  
          method: 'PUT',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            portfolioName: updateItem.portfolioName,  
            portfolioCode: updateItem.portfolioCode,
            portfolioGroupId: updateItem.portfolioGroupId,
            portfolioNumber: updateItem.portfolioNumber,
            departmentId: updateItem.departmentId,  
            departmentName: updateItem.departmentName,
            divisionId: updateItem.divisionId,
            divisionName: updateItem.divisionName,
            status: updateItem.status,  
            lastUpdateBy: updateItem.lastUpdateBy  
          }),  
        })  
      );  
      
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));        

    try {  
      await updatePortfolio(1, updateItem);  
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

      const result = await deletePortfolio(key);
      
      expect(result).toBeTruthy();
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  

      try {  
      await deletePortfolio;  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        expect(String(err)).toMatch('Error: Delete failed');  
      } 
    });  
  });       
});