import { fetchBrokers, createBroker, updateBroker, deleteBroker, fetchMasterBrokers } from '../../services/broker-service';  
import type { MaintenanceBroker, MaintenanceMasterBroker, RequestMaintenanceBroker } from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('fetchBrokers', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 

  describe('load method', () => {  
    it('fetches brokers data', async () => {  
      const mockData: MaintenanceBroker[] = [  
        { brokerId: 1, masterBrokerId: "1", brokerName: 'Broker 1', brokerCode: 'B001', aladdinBrokerCode: 'ABD', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
        { brokerId: 2, masterBrokerId: "2", brokerName: 'Broker 2', brokerCode: 'B002', aladdinBrokerCode: 'ABD', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
      ];
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchBrokers();        
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/brokers'), expect.any(Object));  
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
        await fetchBrokers();
          throw new Error('Load failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: No Data Found');  
        }
    });

    it('fetches master brokers data', async () => {  
      const mockData: MaintenanceMasterBroker[] = [  
        { ID: 1, masterBrokerId: "1", masterBrokerName: 'MBroker 1', masterBrokerCode: 'B001', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
        { ID: 2, masterBrokerId: "2", masterBrokerName: 'MBroker 2', masterBrokerCode: 'B002', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
      ];
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => mockData,  
      } as Response);  
  
      const data = await fetchMasterBrokers();        
  
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/master-brokers'), expect.any(Object));  
      expect(data).toEqual(mockData);
    });  
  
    it('return empty or undefined master data on load failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        status: 204,  
        statusText: 'No Data Found',  
        json: async () => ({ message: 'No Data found' }),  
      } as Response); 
  
      try {  
        await fetchMasterBrokers();
          throw new Error('Load failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: No Data Found');  
        }
    });
  });

  describe('insert method', () => {  
    const newItem: RequestMaintenanceBroker = { brokerName: 'New Broker', brokerCode: 'NB001', aladdinBrokerCode: 'ABD1', masterBrokerId: "1", status: 'Active', lastUpdateBy: mockUserInfo.name };  

    it('posts data and returns inserted item', async () => {  
      const returnedItem: MaintenanceBroker = { brokerId: 2, ...newItem, lastUpdateDate: new Date()  };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await createBroker(newItem);

      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/broker'), expect.objectContaining({  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          brokerName: newItem.brokerName,  
          brokerCode: newItem.brokerCode,  
          aladdinBrokerCode: newItem.aladdinBrokerCode,
          masterBrokerId: "1",
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

      try {  
        await createBroker(newItem); 
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Internal Server Error');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
  
      try {  
        await createBroker(newItem);  
          throw new Error('Network fail');  
        } catch (err) {  
          //console.log('Caught errors again:'+ String(err));
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Network failure');  
        }
    }); 
  }); 

  describe('update method', () => {        
    const updateItem: RequestMaintenanceBroker = {  
        masterBrokerId: "1",  
        brokerName: 'Updated Broker',  
        brokerCode: 'UB001',  
        aladdinBrokerCode: 'ABD',
        status: 'Active',  
      };  

    it('updates data and returns updated item successfully', async () => {  
      const key = 1; 
      
      const returnedItem = {  
        masterBrokerId: "1",  
        masterBrokerName: 'Updated Broker',  
        masterBrokerCode: 'UB001',  
        aladdinBrokerCode: 'ABD',
        status: 'Active',  
        lastUpdateBy: mockUserInfo.name,  
      };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const result = await updateBroker(key, updateItem);  
  
      // Check fetch called with correct URL and options  
      expect(window.fetch).toHaveBeenCalledWith(  
        expect.stringContaining(`/brokers/${key}`),  
        expect.objectContaining({  
          method: 'PUT',  
          cache: 'no-store',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            masterBrokerId: "1",  
            brokerName: updateItem.brokerName,  
            brokerCode: updateItem.brokerCode,  
            aladdinBrokerCode: 'ABD',
            status: 'Active', // status transformed  
          }),  
        })  
      );
      
      // Check returned data matches mocked response  
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  

    try {  
      await updateBroker(1, updateItem);  
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

      const result = await deleteBroker(key);
     
      expect(result).toBeTruthy();
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  

      try {  
      await deleteBroker(key);  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        expect(String(err)).toMatch('Error: Key Not Found');  
      } 
    });  
  }); 
});  