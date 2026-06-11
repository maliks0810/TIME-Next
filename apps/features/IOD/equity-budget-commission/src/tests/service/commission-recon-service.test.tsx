import { fetchReconData } from '../../services/recon-service';  
import type { CommissionRecon } from '../../datatypes/tcw-commission-types';  
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'; 

  vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
  }));

  describe('commissionReconService', () => {      
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    }); 
    
    afterEach(() => {  
      vi.resetAllMocks(); // resets usage data  
    });

    const mockStartDate = new Date(2026,0,1);
    const mockEndDate = new Date(2026,0,31);

    const mockData: CommissionRecon[] = [  
    { 
          account: 123,
          accountName: 'Test Account',
          division_Code: 123,
          division_Name: 'Test Division',
          department_Code: 123,
          department: 'Test Department',
          reason: 'R',
          exec_Broker: 'Test Ex Broker',
          exec_MBroker: 'Test MBroker',
          exec_MBrokerName: 'Test Mst Broker',
          credit_Broker: 'Test Cr Broker',
          credit_MBroker: 'Test CMBrker',
          credit_MBrokerName: 'Test CM Broker',
          currency: 'USD',
          ticket_Number: 123,
          order_ID: 'OrderId-123',
          trader: '',
          ticker: '',
          security_Name: '',
          cusip: '12345',
          security_Type: '',
          trade_Type: '',
          side: '',
          trade_Date: new Date(),
          settle_Date: new Date(),
          shares: 10,
          price: 1,
          total_Comm: 1,
          exec_Comm: 1,
          research_Comm: 0,
          usD_Total_Comm: 0,
          usD_Exec_Comm: 0,
          usD_Research_Comm: 0,
          usD_Price: 0,
          net: 0,
          usD_Net: 0,
          base_Prin_Fx_Rate: 0,
          priN_BASE_Fx_Rate: 0,
          issue: 'Test Issue'
        }  
    ];       

    describe('load method', () => {  
      it('fetches commission recon data', async () => {        
          vi.spyOn(window, 'fetch').mockResolvedValueOnce({  
              ok: true,  
              json: async () => mockData,  
          } as Response);  
      
          // Act  
          const data = await fetchReconData(mockStartDate,mockEndDate);   
      
          expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(`/trade-recon`), expect.any(Object));  
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
            await fetchReconData(mockStartDate,mockEndDate);    
              throw new Error('Load failed');  
          } catch (err) {  
              //console.log('Caught Load errors:'+ String(err));
              expect(err).toBeInstanceOf(Error);  
              expect(String(err)).toMatch('Error: Load Data error 204');  
          }
      });
    }); 
});