import { fetchBrokerData, fetchCommissionTrades, fetchReasonCodes, saveBatchUpdateChanges } from '../../services/commission-trade-service';  
import type { CommissionTrade, CommissionTradeBatchRequestDto, Reason } from '../../datatypes/tcw-commission-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  describe('commissionTradeService', () => {      
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    }); 
    
    afterEach(() => {  
      vi.resetAllMocks(); // resets usage data  
    });

    const mockStartDate = new Date(2026,0,1);
    const mockEndDate = new Date(2026,0,31);
    const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

    const mockData: CommissionTrade[] = [  
    { 
          account: 123,
          accountName: 'Test Account',
          divisionCode: 123,
          divisionName: 'Test Division',
          departmentCode: 123,
          department: 'Test Department',
          reason: 'R',
          execBroker: 'Test Ex Broker',
          execMBroker: 'Test MBroker',
          execMBrokerName: 'Test Mst Broker',
          creditBroker: 'Test Cr Broker',
          creditMBroker: 'Test CMBrker',
          creditMBrokerName: 'Test CM Broker',
          currency: 'USD',
          ticketNumber: 123,
          orderId: 'OrderId-123',
          trader: '',
          ticker: '',
          securityName: '',
          cusip: '12345',
          securityType: '',
          tradeType: '',
          side: '',
          tradeDate: new Date(),
          settleDate: new Date(),
          shares: 10,
          price: 1,
          totalComm: 1,
          execComm: 1,
          researchComm: 0,
          usdTotalComm: 0,
          usdExecComm: 0,
          usdResearchComm: 0,
          usdPrice: 0,
          net: 0,
          usdNet: 0,
          basePrinFxRate: 0,
          prinBaseFxRate: 0 
        }  
    ];

    const mockReasonCode: Reason[] =[
      { code:'X', name:'Test X'},
      { code:'Y', name:'Test Y'},
      { code:'Z', name:'Test Z'}
    ];

    const mockBrokers = [
      { execBroker: 'A', creditBroker: 'X', creditBrokerName: 'Test X' },
      { execBroker: 'B', creditBroker: 'Y', creditBrokerName: 'Text Y' },
      { execBroker: 'C', creditBroker: 'Z', creditBrokerName: 'Text Z' },
    ]

    describe('load master data', () => {
      it('fetch reasons data', async() => {
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockReasonCode
            } as Response); 
          // Act  
          const data = await fetchReasonCodes();   
        
          expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/reason-codes'), expect.any(Object));  
          expect(data).toEqual(mockReasonCode); 
      });

      it('fetch brokers data', async() => {
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
                ok: true,  
                json: async () => mockBrokers
            } as Response); 
          // Act  
          const data = await fetchBrokerData();   
        
          //expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/reason-codes'), expect.any(Object));  
          expect(data).length.greaterThanOrEqual(1); 
      });
    });
        

    describe('load method', () => {  
      it('fetches commision trades data', async () => {        
          vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
              ok: true,  
              json: async () => mockData,  
          } as Response);  
      
          // Act  
          const data = await fetchCommissionTrades(mockStartDate,mockEndDate);   
      
          expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/commission-trade'), expect.any(Object));  
          expect(data).toEqual(mockData);
      });  
      
      it('return empty or null data on fetch failure', async () => {  
          vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: false,  
          status: 204,  
          statusText: 'No Data Found',  
          json: async () => ({ message: 'No Data found' }),  
          } as Response); 
      

          try {  
            await fetchCommissionTrades(mockStartDate,mockEndDate);    
              throw new Error('Load failed');  
          } catch (err) {  
              //console.log('Caught Load errors:'+ String(err));
              expect(err).toBeInstanceOf(Error);  
              expect(String(err)).toMatch('Error: Load Data error 204');  
          }
      });
    });

    describe('save method', () => {
      const updateItem: CommissionTradeBatchRequestDto = {
          orderId:['123','234'],
          creditBroker:'Updated broker',
          reason: 'R',
          lastUpdateBy: mockUserInfo.name
      }
      it('save updated batch of tradeid', async () => {  
        vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
          ok: true,  
          json: async () => {},  
        } as Response);  
    
        const result = await saveBatchUpdateChanges(updateItem);  
        
        expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/commission-trades/batch-update`),
        expect.objectContaining({  
            method: 'PUT',  
            cache: 'no-store',  
            headers: { 'Content-Type': 'application/json' },  
            body: JSON.stringify({
              orderId:['123','234'],
              creditBroker:'Updated broker',
              reason: 'R',
              lastUpdateBy: mockUserInfo.name
            }),  
          })  
        ); 
        //console.log(JSON.stringify(result));
        expect(result).toBeTruthy();
      });

      it('throw error on batch update failures', async () => {  
       vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Batch Update failed'));     
        
        try {  
          await saveBatchUpdateChanges(updateItem);  
            throw new Error('Update failed');  
        } catch (err) {  
          expect(err).toBeInstanceOf(Error); 
          expect(String(err)).toMatch('Error: Batch Update failed');  
        }
      });
    });  
});