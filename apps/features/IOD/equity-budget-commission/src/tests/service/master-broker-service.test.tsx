import { fetchMasterBrokers, createMasterBroker, updateMasterBroker, deleteMasterBroker, fetchAladMasterBrokers } from '../../services/master-broker-service';  
import type { MaintenanceAladBroker, MaintenanceMasterBroker, RequestMaintenanceMasterBroker } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('fetchMasterBrokers', () => {  
  beforeEach(() => {  
    vi.resetAllMocks();  
  });    

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });

  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  
  const mockData: MaintenanceMasterBroker[] = [  
        { ID:1, masterBrokerId: "1", masterBrokerName: 'MBroker 1', masterBrokerCode:"MBC", status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
      ];
  const mockAldData: MaintenanceAladBroker[] = [  
      { masterBrokerId: "1", masterBrokerName: 'Ald MBroker 1', masterBrokerCode:"AMBC1" },
      { masterBrokerId: "2", masterBrokerName: 'Ald MBroker 2', masterBrokerCode:"AMBC2" }
    ];
  
  describe('load method', () => {  
    it('fetch masterbroker data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchMasterBrokers();
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/master-brokers'), expect.any(Object));  
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
        await fetchMasterBrokers(); 
          throw new Error('Load failed');  
        } catch (err) {
            expect(err).instanceOf(Error);
            expect(String(err)).toMatch('Error: No Data found');
        }
    });

    it('fetch aladdin masterbroker data', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockAldData,  
      } as Response);  
  
      const data = await fetchAladMasterBrokers();
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/aladdin-master-brokers'), expect.any(Object));  
      expect(data).toEqual(mockAldData);
    }); 
  });

  describe('insert method', () => {  
    it('posts data and returns inserted item', async () => {  
      const newItem: RequestMaintenanceMasterBroker = { masterBrokerName: 'New Broker', masterBrokerCode: 'NB001', masterBrokerId: "1", status: "Active", lastUpdateBy: mockUserInfo.name  };  
      const returnedItem: MaintenanceMasterBroker = { ID: 2, ...newItem, lastUpdateDate:new Date() };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await createMasterBroker(newItem);  
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/master-broker'), expect.objectContaining({  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          masterBrokerName: newItem.masterBrokerName,  
          masterBrokerCode: newItem.masterBrokerCode,  
          masterBrokerId: newItem.masterBrokerId,
          status: 'Active',  
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
    
      const newItem:RequestMaintenanceMasterBroker = {  
        masterBrokerName: 'Test Broker',  
        masterBrokerCode: 'TB001',  
        masterBrokerId: "1",
        status: "Active",  
      };  

      try {  
        await createMasterBroker(newItem);   
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Internal Server Error');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
  
      const newItem: RequestMaintenanceMasterBroker = {  
        masterBrokerName: 'Test Broker',  
        masterBrokerCode: 'TB001',  
        masterBrokerId: "1",
        status: "Active",  
      };  
  
      try {  
        await createMasterBroker(newItem);   
          throw new Error('Network fail');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Network failure');  
        }
    }); 
  }); 

  describe('update method', () => {  
    const key = 1;  
    it('updates data and returns updated item successfully', async () => {  
      const values:RequestMaintenanceMasterBroker = {  
        masterBrokerName: 'Updated Broker',  
        masterBrokerCode: 'UB001',  
        masterBrokerId: "1",
        status: "Active",  
        lastUpdateBy: mockUserInfo.name,  
      };  
    
      const returnedItem: MaintenanceMasterBroker = {  
        ID: 1,
        masterBrokerName: 'Updated Broker',  
        masterBrokerCode: 'UB001',  
        masterBrokerId: "1",  
        status: 'Active',  
        lastUpdateBy: mockUserInfo.name,  
        lastUpdateDate: new Date()
      };  
  
      // Mock fetch to resolve with the returnedItem  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
    
      const result = await updateMasterBroker(key, values);  
  
      // Check fetch called with correct URL and options  
      expect(window.fetch).toHaveBeenCalledWith(  
        expect.stringContaining(`/master-broker/${key}`),  
        expect.objectContaining({  
          method: 'PUT',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            masterBrokerName: values.masterBrokerName,   
            masterBrokerCode: values.masterBrokerCode,  
            masterBrokerId: values.masterBrokerId,
            status: 'Active', // status transformed  
            lastUpdateBy: mockUserInfo.name,  
          }),  
        })  
      );  
      
      // Check returned data matches mocked response  
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  
        
    const updatedItem: RequestMaintenanceMasterBroker = { masterBrokerName: 'Updated Name', masterBrokerCode:"Up Cd", masterBrokerId: "1", status: "Active" };  

    try {  
      await updateMasterBroker(key, updatedItem);  
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

      const result = await deleteMasterBroker(key);
     
      //console.log('remove error: '+result)
      expect(result).toBeTruthy();
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  
 
      try {  
      await deleteMasterBroker(key);  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        expect(String(err)).toMatch('Error: Key Not Found');  
      } 
    });  
  }); 
});  