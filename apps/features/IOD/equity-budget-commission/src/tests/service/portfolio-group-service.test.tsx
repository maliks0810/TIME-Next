import { fetchPortfolioGroups, createPortfolioGroup, deletePortfolioGroup, updatePortfolioGroup } from '../../services/portfolio-group-service';  
import type { MaintenancePortfolioGroup, RequestMaintenancePortfolioGroup } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

describe('fetchPortfolioGroups', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('load method', () => {  
    it('fetches portfolio group data', async () => {  
      const mockData: MaintenancePortfolioGroup[] = [  
        { portfolioGroupId:98, portfolioGroupCode:'Grp Code1', portfolioGroupName:'Portfolio Group 1', status:'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
        { portfolioGroupId:99, portfolioGroupCode:'Grp Code2', portfolioGroupName:'Portfolio Group 2', status:'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
      ];
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchPortfolioGroups();        
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio-groups'), expect.any(Object));  
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
        await fetchPortfolioGroups();
          throw new Error('Load data failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: No Data Found');  
        }
    });
  });

  describe('insert method', () => {  
    it('new data and returns inserted data successfully', async () => {  
      const newItem:RequestMaintenancePortfolioGroup = { portfolioGroupName: 'New PortfolioGroup', portfolioGroupCode:'New Code', status: "Active", lastUpdateBy: mockUserInfo.name  };  
      const returnedItem:MaintenancePortfolioGroup = { portfolioGroupId: 2, lastUpdateDate:new Date(), ...newItem };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await createPortfolioGroup(newItem);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio-group'), expect.objectContaining({  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          portfolioGroupName: newItem.portfolioGroupName,  
          portfolioGroupCode: newItem.portfolioGroupCode,  
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
    
      const newItem:RequestMaintenancePortfolioGroup = {  
        portfolioGroupName: 'Test PortfolioGroup',  
        portfolioGroupCode:'New Code',
        status: "Active",  
      };  
  
      try {  
        await createPortfolioGroup(newItem);  
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Internal Server Error');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
  
      const newItem:RequestMaintenancePortfolioGroup = {  
        portfolioGroupName: 'Test PortfolioGroup',  
        portfolioGroupCode:'New Code',
        status: "Active",  
      };  
    
      try {  
        await createPortfolioGroup(newItem);  
          throw new Error('Network fail');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Network failure');  
        }
    }); 
  }); 

  describe('update method', () => {  
    it('update data and returns updated data successfully', async () => {  
      const key = 1;  
      const values:RequestMaintenancePortfolioGroup = {  
        portfolioGroupName: 'Updated PortfolioGroup',  
        portfolioGroupCode:'Updated Code',
        status: "Active", 
        lastUpdateBy: mockUserInfo.name
      };  
    
      const returnedItem: MaintenancePortfolioGroup = { portfolioGroupId:1, lastUpdateDate:new Date(), ...values  };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
    
      const result = await updatePortfolioGroup(key, values);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/portfolio-groups/${key}`),expect.objectContaining({  
          method: 'PUT',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            portfolioGroupName: returnedItem.portfolioGroupName,  
            portfolioGroupCode: returnedItem.portfolioGroupCode,  
            status: returnedItem.status,
            lastUpdateBy: returnedItem.lastUpdateBy,  
          }),  
        })  
      );  
      
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  
        
    const updatedItem = { portfolioGroupId: 1, portfolioGroupName: 'Updated PortfolioGroup',portfolioGroupCode:'Updated Code', status: "Active" };           

    try {  
      await updatePortfolioGroup(1, updatedItem);  
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

      const result = await deletePortfolioGroup(key);
      
      expect(result).toBeTruthy();
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  

      try {  
      await deletePortfolioGroup;  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        expect(String(err)).toMatch('Error: Delete failed');  
      } 
    });  
  });       
});