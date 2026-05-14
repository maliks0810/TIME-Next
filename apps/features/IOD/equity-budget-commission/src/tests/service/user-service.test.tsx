import { fetchDepartments, fetchDivisions, fetchLocations, fetchUsers, createUser, updateUser, deleteUser } from '../../services/user-service';  
import type { MaintenanceDepartment, MaintenanceDivision, MaintenanceLocation, MaintenanceUser, RequestMaintenanceUser } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('userDataService', () => {  
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });

  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };   
  const mockData: MaintenanceUser[] = [  
      { userId: 1, userName: 'lname,fname', firstName: 'fname', lastName:'lname', locationCode: 'US', status: 'Active', lastUpdateBy:'User1', 
          divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:''  }  
    ];
  const mockDeptData: MaintenanceDepartment[] = [  
      { departmentId: 1, departmentName: 'Department 1', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
    ]; 
  const mockDivData: MaintenanceDivision[] = [  
      { divisionId: 1, divisionName: 'Division 1', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
    ];
  const mockLocData: MaintenanceLocation[] = [
      { locationId: 1, locationCode:'LA', locationDescription: 'Los Angeles', lastUpdateBy: 'User1', comments:'', orgCode:'US' }
    ]  

  describe('load method', () => {  
    it('fetches divisions data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockDivData,  
      } as Response);  
  
      const data = await fetchDivisions();  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/divisions'), expect.any(Object));  
      expect(data).toEqual(mockDivData);
    });

    it('fetches departments data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockDeptData,  
      } as Response);  
  
      const data = await fetchDepartments();  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/department'), expect.any(Object));  
      expect(data).toEqual(mockDeptData);
    });

    it('fetches locations data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockLocData,  
      } as Response);  
  
      const data = await fetchLocations();  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/locations'), expect.any(Object));  
      expect(data).toEqual(mockLocData);
    });

    it('fetches users data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchUsers();  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/users'), expect.any(Object));  
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
        await fetchUsers();  
          throw new Error('Load failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: No Data Found');  
        }
    });
  });

  describe('insert method', () => {  
    const newItem: RequestMaintenanceUser = { firstName: 'fname', lastName:'lname', locationCode: 'US', divisionId:1, departmentId:1, 
        lastUpdateBy:mockUserInfo.name??"User1", startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:1, coopStaffCode:1,
        costCenterCode:'', jobCode:'', status: 'Active' }; 

    it('posts data and returns inserted item', async () => {   
      const returnedItem: MaintenanceUser = { userId: 2, ...newItem, userName: newItem.userName ?? "" };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await createUser(newItem);  

      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/user`),expect.objectContaining({  
          method: 'POST',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({
            firstName: returnedItem.firstName, 
            lastName: returnedItem.lastName, 
            locationCode: returnedItem.locationCode, 
            divisionId: returnedItem.divisionId, 
            departmentId: returnedItem.departmentId, 
            lastUpdateBy: returnedItem.lastUpdateBy, 
            startDate: returnedItem.startDate, 
            endDate: returnedItem.endDate, 
            coopDptCode: returnedItem.coopDptCode, 
            coopStaffCode: returnedItem.coopStaffCode,
            costCenterCode: returnedItem.costCenterCode, 
            jobCode: returnedItem.jobCode, 
            status: returnedItem.status
          }),  
        })  
      );
     
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
        await createUser(newItem);  
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Internal Server Error');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
  
      try {  
        await createUser(newItem);  
          throw new Error('Network fail');  
        } catch (err) {  
          //console.log('Caught errors again:'+ String(err));
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Network failure');  
        }
    }); 
  }); 

  describe('update method', () => { 
    const updatedItem: RequestMaintenanceUser = { firstName: 'Updated', lastName:'User', locationCode: 'US', divisionId:1, departmentId:1, 
        lastUpdateBy:mockUserInfo.name??"User1", startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:1, coopStaffCode:1,
        costCenterCode:'', jobCode:'', status: 'Active' }; 

    it('updates data and returns updated item successfully', async () => {  
      const key = 1;     
    
      const returnedItem: MaintenanceUser = { userId:1, ...updatedItem, userName: updatedItem.userName??"Update user"  };  
  
      // Mock fetch to resolve with the returnedItem  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await updateUser(key, updatedItem);  

      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/users/${key}`),expect.objectContaining({  
          method: 'PUT',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({
            firstName: returnedItem.firstName, 
            lastName: returnedItem.lastName, 
            locationCode: returnedItem.locationCode, 
            divisionId: returnedItem.divisionId, 
            departmentId: returnedItem.departmentId, 
            lastUpdateBy: returnedItem.lastUpdateBy, 
            startDate: returnedItem.startDate, 
            endDate: returnedItem.endDate, 
            coopDptCode: returnedItem.coopDptCode, 
            coopStaffCode: returnedItem.coopStaffCode,
            costCenterCode: returnedItem.costCenterCode, 
            jobCode: returnedItem.jobCode, 
            status: returnedItem.status
          }),  
        })  
      );        
      // Check returned data matches mocked response  
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  
        
    try {  
      await updateUser(1, updatedItem);  
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

      const result = await deleteUser(key);
     
      //console.log('remove error: '+result)
      expect(result).toBeTruthy();
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  

      try {  
      await deleteUser(key);  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        //console.log('remove error: '+String(err));
        expect(String(err)).toMatch('Error: Key Not Found');  
      } 
    });  
  });  
});