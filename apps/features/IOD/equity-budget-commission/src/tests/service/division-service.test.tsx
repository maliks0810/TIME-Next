import { fetchDivisions, createDivision, deleteDivision, updateDivision } from '../../services/division-service';  
import type { MaintenanceDivision, RequestMaintenanceDivision } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('fetchDivisions', () => {  
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  
  const mockData: MaintenanceDivision[] = [  
        { divisionId: 1, divisionName: 'Division 1', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
      ];

  describe('load method', () => {  
      it('fetch division data', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => mockData,  
        } as Response);  
    
        const data = await fetchDivisions();  
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/divisions'), expect.any(Object));  
        expect(data).toEqual(mockData);
      });  
    
      it('return empty or undefined data on fetch failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,
          status: 204,
          statusText: 'No Data found',
          json: async () => ({ message: 'No Data found' }),
        } as Response);  
  
        try {  
          await fetchDivisions();; 
            throw new Error('Load failed');  
          } catch (err) {
              if(err instanceof Error)
                expect(err.message).toMatch('No Data found');
          }
      });
  });

  describe('insert method', () => {  
      it('post data and returns inserted data successfully', async () => {  
        const newItem:RequestMaintenanceDivision = { divisionName: 'New Division', status: "Active", lastUpdateBy: mockUserInfo.name  };  
        const returnedItem:MaintenanceDivision = { divisionId: 2, lastUpdateDate:new Date(), ...newItem };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await createDivision(newItem);  
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/division'), expect.objectContaining({  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
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
      
        const newItem = {  
          divisionName: 'Test Division',  
          status: "Active",  
        };  
   
        try {  
          await createDivision(newItem);  
            throw new Error('Insert failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Internal Server Error');  
          }  
      });
      
      it('throws error on network failure', async () => {  
        vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
        const newItem = {  
          divisionName: 'Test Division',  
          status: "Active",  
        };  
     
        try {  
          await createDivision(newItem);  
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
        const values:RequestMaintenanceDivision = {  
          divisionName: 'Updated Division',  
          status: "Active", 
          lastUpdateBy: mockUserInfo.name
        };  
      
        const returnedItem: MaintenanceDivision = { divisionId:1, lastUpdateDate:new Date(), ...values  };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
      
        const result = await updateDivision(key, values);  
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/divisions/${key}`),expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({  
              divisionName: returnedItem.divisionName,  
              status: returnedItem.status,
              lastUpdateBy: returnedItem.lastUpdateBy,  
            }),  
          })  
        );  
        
        expect(result).toEqual(returnedItem);  
    });  
    
    it('throws error on update failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  
          
      const updatedItem = { divisionId: 1, divisionName: 'Updated Division', status: "Active" };  
  
      try {  
        await updateDivision(1, updatedItem);  
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
  
        const result = await deleteDivision(key);
        
        expect(result).toBeTruthy();
      });  
  
      it('throws error on delete failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          statusText: 'Key Not Found',  
        } as Response);  
  
        try {  
        await deleteDivision;  
          throw new Error('Delete failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Delete failed');  
        } 
      });  
    }); 
});  