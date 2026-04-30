import { fetchBrokerGroups, createBrokerGroup, updateBrokerGroup, deleteBrokerGroup, 
    fetchBrokerGroupsMember, createBrokerGroupMember, updateBrokerGroupMember, deleteBrokerGroupMember
} from '../../services/broker-group-service';  
import type { MaintenanceBrokerGroup, RequestMaintenanceBrokerGroup, 
  MaintenanceBrokerGroupMember, RequestMaintenanceBrokerGroupMember
} from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('BrokerGroupService', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 
  describe('fetchBrokerGroups', () => {
    describe('load method', () => {  
      it('fetches brokergroups data', async () => {  
        const mockData: MaintenanceBrokerGroup[] = [  
          { brokerGroupId: 1, brokerGroupName: 'Broker 1', brokerGroupCode: 'B001', comment: 'ABD', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
          { brokerGroupId: 2, brokerGroupName: 'Broker 2', brokerGroupCode: 'B002', comment: 'ABD', status: 'Active', lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
        ];
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => mockData,  
        } as Response);  
    
        const data = await fetchBrokerGroups();        
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/brokergroup'), expect.any(Object));  
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
          await fetchBrokerGroups();
            throw new Error('Load failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: No Data Found');  
          }
      });      
    });

    describe('insert method', () => {  
      const newItem: RequestMaintenanceBrokerGroup = { brokerGroupName: 'New Broker Group', brokerGroupCode: 'NB001', comment: 'ABD1', status: 'Active', lastUpdateBy: mockUserInfo.name??"User1" };  

      it('posts data and returns inserted item', async () => {  
        const returnedItem: MaintenanceBrokerGroup = { brokerGroupId: 2, ...newItem, lastUpdateDate: new Date()  };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await createBrokerGroup(newItem);

        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/brokergroup'), expect.objectContaining({  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            brokerGroupName: newItem.brokerGroupName,  
            brokerGroupCode: newItem.brokerGroupCode,  
            comment: newItem.comment,
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
          await createBrokerGroup(newItem); 
            throw new Error('Insert failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Internal Server Error');  
          }  
      });
      
      it('throws error on network failure', async () => {  
        vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
        try {  
          await createBrokerGroup(newItem);  
            throw new Error('Network fail');  
          } catch (err) {  
            //console.log('Caught errors again:'+ String(err));
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Network failure');  
          }
      }); 
    }); 

    describe('update method', () => {        
      const updateItem: RequestMaintenanceBrokerGroup = {  
          brokerGroupName: 'Updated Broker',  
          brokerGroupCode: 'UB001',  
          comment: 'ABD',
          status: 'Active',
          lastUpdateBy: mockUserInfo.name??""
        };  

      it('updates data and returns updated item successfully', async () => {  
        const key = 1; 
        
        const returnedItem = {  
          brokerGroupName: 'Updated Broker',  
          brokerGroupCode: 'UB001',  
          comment: 'ABD',
          status: 'Active',  
          lastUpdateBy: mockUserInfo.name,  
        };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await updateBrokerGroup(key, updateItem);  
    
        // Check fetch called with correct URL and options  
        expect(window.fetch).toHaveBeenCalledWith(  
          expect.stringContaining(`/brokergroup/${key}`),  
          expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({  
              brokerGroupName: updateItem.brokerGroupName,  
              brokerGroupCode: updateItem.brokerGroupCode,  
              comment: 'ABD',
              status: 'Active',  
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
        await updateBrokerGroup(1, updateItem);  
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

        const result = await deleteBrokerGroup(key);
      
        expect(result).toBeTruthy();
      });  

      it('throws error on delete failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          statusText: 'Key Not Found',  
        } as Response);  

        try {  
        await deleteBrokerGroup(key);  
          throw new Error('Delete failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Key Not Found');  
        } 
      });  
    }); 
  });

  describe('fetchBrokerGroupMembers', () => {
    describe('load method', () => { 
      it('fetches brokergroupmembers data', async () => {  
        const mockData: MaintenanceBrokerGroupMember[] = [  
          { brokerGroupMemberId:1 ,brokerGroupId: 1, brokerCode: 'B001', JoinedGroupAt: new Date(), lastUpdateBy: 'User1' },  
          { brokerGroupMemberId:2 ,brokerGroupId: 2, brokerCode: 'B002', JoinedGroupAt: new Date(), lastUpdateBy: 'User1' }  
        ];
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => mockData,  
        } as Response);  
    
        const data = await fetchBrokerGroupsMember();        
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/brokergroupmember'), expect.any(Object));  
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
          await fetchBrokerGroupsMember();
            throw new Error('Load failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: No Data Found');  
          }
      });
    });
    describe('insert method', () => {  
      const newItem: RequestMaintenanceBrokerGroupMember = { brokerGroupId: 1, brokerCode: 'B001', lastUpdateBy: mockUserInfo.name??"User1", JoinedGroupAt: new Date() };  

      it('posts data and returns inserted item', async () => {  
        const returnedItem: MaintenanceBrokerGroupMember = { brokerGroupMemberId: 2, ...newItem, JoinedGroupAt: new Date() };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await createBrokerGroupMember(newItem);

        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/brokerGroupMember'), expect.objectContaining({  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            brokerGroupId: newItem.brokerGroupId,
            brokerCode: newItem.brokerCode,  
            lastUpdateBy: mockUserInfo.name,
            JoinedGroupAt: newItem.JoinedGroupAt 
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
          await createBrokerGroupMember(newItem); 
            throw new Error('Insert failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Internal Server Error');  
          }  
      });
      
      it('throws error on network failure', async () => {  
        vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
        try {  
          await createBrokerGroupMember(newItem);  
            throw new Error('Network fail');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Network failure');  
          }
      }); 
    }); 

    describe('update method', () => {        
      const updateItem: RequestMaintenanceBrokerGroupMember = {  
          brokerGroupId: 1,  
          brokerCode: 'B001',  
          lastUpdateBy: mockUserInfo.name??""
        };  

      it('updates data and returns updated item successfully', async () => {  
        const key = 1; 
        
        const returnedItem = {  
          brokerGroupId: 1,  
          brokerCode: 'B001',  
          lastUpdateBy: mockUserInfo.name,  
        };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await updateBrokerGroupMember(key, updateItem);  
    
        expect(window.fetch).toHaveBeenCalledWith(  
          expect.stringContaining(`/brokerGroupMember/${key}`),  
          expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({  
              brokerGroupId: updateItem.brokerGroupId,  
              brokerCode: updateItem.brokerCode,  
              lastUpdateBy: mockUserInfo.name,  
            }),  
          })  
        );
        
        expect(result).toEqual(returnedItem);  
    });  
    
    it('throws error on update failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  

      try {  
        await updateBrokerGroupMember(1, updateItem);  
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

        const result = await deleteBrokerGroupMember(key);
      
        expect(result).toBeTruthy();
      });  

      it('throws error on delete failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          statusText: 'Key Not Found',  
        } as Response);  

        try {  
        await deleteBrokerGroupMember(key);  
          throw new Error('Delete failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Key Not Found');  
        } 
      });  
    });
  });
});  