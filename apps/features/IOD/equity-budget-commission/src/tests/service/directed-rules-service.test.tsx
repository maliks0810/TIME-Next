import { fetchDirectedRules, createDirectedRule, updateDirectedRule, deleteDirectedRule,
    fetchDirectedRulesXref, createDirectedRuleXref, updateDirectedRuleXref, deleteDirectedRuleXref
} from '../../services/directed-rules-service';  
import type { MaintenanceDirectedRules, RequestMaintenanceDirectedRules, 
  MaintenanceDirectedRulesXref, RequestMaintenanceDirectedRulesXref
} from '../../datatypes/budget-maintenance-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));
  
describe('DirectedRulesService', () => {  
    beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {  
    vi.resetAllMocks(); // resets usage data  
  });
  
  const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false }; 
  
  describe('fetchDirectedRules', () => {
    describe('load method', () => {  
      it('fetches brokergroups data', async () => {  
        const mockData: MaintenanceDirectedRules[] = [  
          { directedRulesId: 1, directedRulesName: 'Direct Rule 1', directedRulesCode: 'DR001', comment: 'ABD', budgetPercent: 10, lastUpdateDt: new Date(), lastUpdateBy: 'User1' },  
          { directedRulesId: 2, directedRulesName: 'Direct Rule 2', directedRulesCode: 'DR002', comment: 'ABD', budgetPercent: 12, lastUpdateDt: new Date(), lastUpdateBy: 'User1' }  
        ];
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => mockData,  
        } as Response);  
    
        const data = await fetchDirectedRules();        
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/directedrules'), expect.any(Object));  
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
          await fetchDirectedRules();
            throw new Error('Load failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: No Data Found');  
          }
      });      
    });

    describe('insert method', () => {  
      const newItem: RequestMaintenanceDirectedRules = { directedRulesName: 'New Direct Rule', directedRulesCode: 'ND001', comment: 'ABD1', budgetPercent:5, lastUpdateBy: mockUserInfo.name??"User1" };  

      it('post data and returns inserted item', async () => {  
        const returnedItem: MaintenanceDirectedRules = { directedRulesId: 2, ...newItem, lastUpdateDt: new Date()  };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await createDirectedRule(newItem);

        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/directedrules'), expect.objectContaining({  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            directedRulesName: newItem.directedRulesName,  
            directedRulesCode: newItem.directedRulesCode,  
            comment: newItem.comment,
            budgetPercent: newItem.budgetPercent,  
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
          await createDirectedRule(newItem); 
            throw new Error('Insert failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Internal Server Error');  
          }  
      });
      
      it('throws error on network failure', async () => {  
        vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
        try {  
          await createDirectedRule(newItem);  
            throw new Error('Network fail');  
          } catch (err) {  
            //console.log('Caught errors again:'+ String(err));
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Network failure');  
          }
      }); 
    }); 

    describe('update method', () => {        
      const updateItem: RequestMaintenanceDirectedRules = {  
          directedRulesName: 'Updated Direct Rule',  
          directedRulesCode: 'UD001',  
          comment: 'ABD',
          budgetPercent: 10,
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
    
        const result = await updateDirectedRule(key, updateItem);  
    
        // Check fetch called with correct URL and options  
        expect(window.fetch).toHaveBeenCalledWith(  
          expect.stringContaining(`/directedrule/${key}`),  
          expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({  
              directedRulesName: updateItem.directedRulesName,  
              directedRulesCode: updateItem.directedRulesCode,  
              comment: updateItem.comment,
              budgetPercent: updateItem.budgetPercent,  
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
        await updateDirectedRule(1, updateItem);  
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

        const result = await deleteDirectedRule(key);
      
        expect(result).toBeTruthy();
      });  

      it('throws error on delete failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          statusText: 'Key Not Found',  
        } as Response);  

        try {  
        await deleteDirectedRule(key);  
          throw new Error('Delete failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Key Not Found');  
        } 
      });  
    }); 
  });

  describe('fetchDirectedRulesXref', () => {
    describe('load method', () => { 
      it('fetches directedrulesxref data', async () => {  
        const mockData: MaintenanceDirectedRulesXref[] = [  
          { directedRulesXRefId:1 ,directedRulesId: 1, brokerCode: 'B001', accountCode:'A001', year:2026, lastUpdateDt: new Date(), lastUpdateBy: 'User1' },  
          { directedRulesXRefId:2 ,directedRulesId: 2, brokerCode: 'B002', accountCode:'A002', year:2026, lastUpdateDt: new Date(), lastUpdateBy: 'User1' }  
        ];
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => mockData,  
        } as Response);  
    
        const data = await fetchDirectedRulesXref();        
    
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/directedrulesxref'), expect.any(Object));  
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
          await fetchDirectedRulesXref();
            throw new Error('Load failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: No Data Found');  
          }
      });
    });

    describe('insert method', () => {  
      const newItem: RequestMaintenanceDirectedRulesXref = { directedRulesId: 1, brokerCode: 'B001', accountCode:'A003', year:2026, lastUpdateBy: mockUserInfo.name??"User1", lastUpdateDt: new Date() };  

      it('posts data and returns inserted item', async () => {  
        const returnedItem: MaintenanceDirectedRulesXref = { directedRulesXRefId: 2, ...newItem, lastUpdateDt: new Date() };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await createDirectedRuleXref(newItem);

        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/directedrulesxref'), expect.objectContaining({  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            directedRulesId: newItem.directedRulesId,
            brokerCode: newItem.brokerCode,  
            accountCode: newItem.accountCode,  
            year: newItem.year,  
            lastUpdateBy: mockUserInfo.name,
            lastUpdateDt: newItem.lastUpdateDt 
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
          await createDirectedRuleXref(newItem); 
            throw new Error('Insert failed');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Internal Server Error');  
          }  
      });
      
      it('throws error on network failure', async () => {  
        vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
        try {  
          await createDirectedRuleXref(newItem);  
            throw new Error('Network fail');  
          } catch (err) {  
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toMatch('Error: Network failure');  
          }
      }); 
    }); 

    describe('update method', () => {        
      const updateItem: RequestMaintenanceDirectedRulesXref = {  
          directedRulesId: 1,  
          brokerCode: 'B001',  
          accountCode: 'A001',
          year: 2026,  
          lastUpdateBy: mockUserInfo.name??"",
          lastUpdateDt: new Date()  
        };  

      it('updates data and returns updated item successfully', async () => {  
        const key = 1; 
        
        const returnedItem: MaintenanceDirectedRulesXref = {  
          directedRulesXRefId: 1,
          directedRulesId: 1,  
          brokerCode: 'B001',  
          accountCode: 'A001',
          year: 2026,  
          lastUpdateBy: mockUserInfo.name ?? '',
          lastUpdateDt: new Date()  
        };  
    
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => returnedItem,  
        } as Response);  
    
        const result = await updateDirectedRuleXref(key, updateItem);  
    
        expect(window.fetch).toHaveBeenCalledWith(  
          expect.stringContaining(`/directedrulexref/${key}`),  
          expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({  
              directedRulesId: updateItem.directedRulesId,
              brokerCode: updateItem.brokerCode,  
              accountCode: updateItem.accountCode,  
              year: updateItem.year,  
              lastUpdateBy: mockUserInfo.name,
              lastUpdateDt: updateItem.lastUpdateDt  
            }),  
          })  
        );
        
        expect(result).toEqual(returnedItem);  
    });  
    
    it('throws error on update failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  

      try {  
        await updateDirectedRuleXref(1, updateItem);  
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

        const result = await deleteDirectedRuleXref(key);
      
        expect(result).toBeTruthy();
      });  

      it('throws error on delete failure', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          statusText: 'Key Not Found',  
        } as Response);  

        try {  
        await deleteDirectedRuleXref(key);  
          throw new Error('Delete failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Key Not Found');  
        } 
      });  
    });
  });
});  