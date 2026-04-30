import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment, fetchDivisions } from '../../services/department-service';  
import type { MaintenanceDepartment, RequestMaintenanceDepartment } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
    
describe('fetchDepartments', () => {  
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });

  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  
  const mockData: MaintenanceDepartment[] = [  
    { departmentId: 1, departmentName: 'Department 1', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
  ]; 
  
  describe('load method', () => {  
    it('fetch department data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchDepartments();  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/department'), expect.any(Object));  
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
        await fetchDepartments();; 
          throw new Error('Load failed');  
        } catch (err) {
          //console.log('Caught Load errors:'+ String(err));
          expect(err).toBeInstanceOf(Error);
          expect(String(err)).toMatch('Error: No Data found');
        }
    });
    it('fetch divisions data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchDivisions();  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/divisions'), expect.any(Object));  
      expect(data).toEqual(mockData);
    });  
  
    it('return empty or undefined divisions data on fetch failure', async () => {  
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
          expect(err).toBeInstanceOf(Error);
          expect(String(err)).toMatch('Error: No Data found');
        }
    });
  });

  describe('insert method', () => {  
    it('post data and returns inserted data successfully', async () => {  
      const newItem = { departmentName: 'New Department', status: "Active", lastUpdateBy: mockUserInfo.name  };  
      const returnedItem = { departmentId: 2, ...newItem };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await createDepartment(newItem);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/department'), expect.objectContaining({  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          departmentName: newItem.departmentName,  
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
        departmentName: 'Test Department',  
        status: "Active",  
      };  
 
      try {  
        await createDepartment(newItem);  
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Internal Server Error');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
  
      const newItem = {  
        departmentName: 'Test Department',  
        status: "Active",  
      };  
   
      try {  
        await createDepartment(newItem);  
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
      const values:RequestMaintenanceDepartment = {  
        departmentName: 'Updated Department',  
        status: "Active", 
        lastUpdateBy: mockUserInfo.name
      };  
    
      const returnedItem: MaintenanceDepartment = { departmentId:1, lastUpdateDate:new Date(), ...values  };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
    
      const result = await updateDepartment(key, values);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/department/${key}`),expect.objectContaining({  
          method: 'PUT',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            departmentName: returnedItem.departmentName,  
            status: returnedItem.status,
            lastUpdateBy: returnedItem.lastUpdateBy,  
          }),  
        })  
      );  
      
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  
        
    const updatedItem = { departmentId: 1, departmentName: 'Updated Name', status: "Active" };  

    try {  
      await updateDepartment(1, updatedItem);  
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

      const result = await deleteDepartment(key);
      
      expect(result).toBeTruthy();
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  

      try {  
      await deleteDepartment;  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        expect(String(err)).toMatch('Error: Delete failed');  
      } 
    });  
  }); 
});  