import { researchBudgetDataService } from '../../services/research-budget-service';  
import CustomStore from 'devextreme/data/custom_store';  
import type { ResearchBudget } from '../../datatypes/research-budget-types';  
import { vi, expect, describe, it, beforeEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  describe('researchBudgetDataService', () => {  

    const mockSetDataCallback = vi.fn();  
    const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  
    const mockBudgetYear = 2025;
    const mockDivisionId = 1;

    beforeEach(() => {  
      vi.resetAllMocks();  
    });  
    
    it('returns a CustomStore instance', () => {  
      const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);  
      expect(store).toBeInstanceOf(CustomStore);  
    });  

    describe('load method', () => {  
        it('fetches data and calls setDataCallback', async () => {  
            const mockData: ResearchBudget[] = [  
            { composite_Id: '1', masterBrokerId: "1", divisionId:1, budgetYear:2025, masterBroker: 'Broker 1', mBkrCode: 'B001', division: 'ABD', total: 100, 
                quarter_Four_Id:4, quarter_One_Id:1, quarter_Three_Id:3, quarter_Two_Id:2, 
                quarterFour:0, quarterOne:0, quarterThree:0, quarterTwo:0 }  
            ];
        
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: true,  
            json: async () => mockData,  
            } as Response);  
        
            const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId); 
            const data = await store.load();  
        
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/research-budget'), expect.any(Object));  
            expect(mockSetDataCallback).toHaveBeenCalledWith(mockData);  
            expect(data).toEqual(mockData);
        });  
        
        it('return empty or undefined data on fetch failure', async () => {  
            vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
            ok: false,  
            status: 204,  
            statusText: 'No Data Found',  
            json: async () => ({ message: 'No Data found' }),  
            } as Response); 
        
            const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);   

            try {  
            await store.load();  
                throw new Error('Load failed');  
            } catch (err) {  
                //console.log('Caught Load errors:'+ String(err));
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Load error: Error: Load Data error');  
            }
        });
    });

  describe('insert method', () => {  
    const newItem = { masterBrokerId: "1", divisionId:1, budgetYear:2025, masterBroker: 'Broker 1', mBkrCode: 'B001', division: 'ABD', total: 100, 
                quarter_Four_Id:4, quarter_One_Id:1, quarter_Three_Id:3, quarter_Two_Id:2, 
                quarterFour:0, quarterOne:0, quarterThree:0, quarterTwo:0 }; 
    it('posts data and returns inserted item', async () => { 
      
      const returnedItem = { composite_Id: '2', ...newItem, lastUpdateBy: mockUserInfo.name };  
  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);  
      const result = await store.insert(newItem);  
      
      expect(result).toEqual(returnedItem);  
    });  
  
    it('throws error on insert failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        status: 500,  
        statusText: 'Internal Server Error',  
        json: async () => ({ message: 'Server error' }),  
      } as Response);   
      
    const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);  

      try {  
        await store.insert(newItem);  
          throw new Error('Insert failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Insert error: Error: Server responded with status 500');  
        }  
    });
    
    it('throws error on network failure', async () => {  
      vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network failure'));  
    
      const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);    
      try {  
        await store.insert(newItem);  
          throw new Error('Network fail');  
        } catch (err) {  
          //console.log('Caught errors again:'+ String(err));
          expect(err).toBeInstanceOf(Error);  
          expect(String(err)).toMatch('Error: Insert error: Error: Network failure');  
        }
    }); 
  }); 

  describe('update method', () => {  
    
    it('updates data and returns updated item successfully', async () => {  
      const key = '1234';  
      const values = {  
        composite_Id: '1234',  
        masterBroker: 'Broker 1',  
        mBkrCode: 'B001',
        division: 'Div001',  
        quarterOne: 10,
        lastUpdateBy: mockUserInfo.name,  
      };  
    
      const returnedItem = {  
        composite_Id: '1234',  
        masterBroker: 'Broker',  
        mBkrCode: 'ABD',
        division: 'Div001',  
        quarterOne: 10,
        lastUpdateBy: mockUserInfo.name,  
      };  
  
      // Mock fetch to resolve with the returnedItem  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: true,  
        json: async () => returnedItem,  
      } as Response);  
  
      const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);    
        
      const result = await store.update(key, values);    
      
      // Check returned data matches mocked response  
      expect(result).toEqual(returnedItem);  
  });  
  
  it('throws error on update failure', async () => {  
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Update failed'));  
        
    const updatedItem = { composite_Id: 1, masterBroker: 'Broker 1', quarterOne:10 };  

    const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);    

    try {  
      await store.update(1, updatedItem);  
        throw new Error('Update failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        expect(String(err)).toMatch('Error: Update error: Error: Update failed');  
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

      const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);    
  
      const result = await store.remove(key);
     
      //console.log('remove error: '+result)
      expect(result).toBe(key);
    });  

    it('throws error on delete failure', async () => {  
      vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
        ok: false,  
        statusText: 'Key Not Found',  
      } as Response);  

      const store = researchBudgetDataService(mockSetDataCallback, mockUserInfo, mockBudgetYear, mockDivisionId);    

      try {  
      await store.remove(key);  
        throw new Error('Delete failed');  
      } catch (err) {  
        expect(err).toBeInstanceOf(Error); 
        //console.log('remove error: '+String(err));
        expect(String(err)).toMatch('Error: Delete error: Key Not Found');  
      } 
    });  
  }); 

  });