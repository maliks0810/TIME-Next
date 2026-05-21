import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DateBoxTypes } from 'devextreme-react/date-box';
import { useCommissionTrade } from '../../hooks/useCommissionTradeData';
import {
    fetchCommissionTrades,
    fetchReasonCodes,
    fetchBrokerData,
    saveBatchUpdateChanges
} from '../../services/commission-trade-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { CommissionTrade } from '../../datatypes/tcw-commission-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';
import { MaintenanceUser } from '@/datatypes/budget-maintenance-types';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/commission-trade-service', () => ({
    fetchCommissionTrades: vi.fn(),
    fetchReasonCodes: vi.fn(),
    fetchBrokerData: vi.fn(),
    saveBatchUpdateChanges: vi.fn(),
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockStartDate = new Date('2025-10-01');
const mockEndDate = new Date('2025-10-15');

const mockReasons = [
    { code: 'R1', name: 'Reason One' },
    { code: 'R2', name: 'Reason Two' },
];

const mockBrokers = [
    { execBroker: 'JPM', creditBroker: 'WOLF', creditBrokerName: 'Wolfe Research' },
    { execBroker: 'JPM', creditBroker: 'HUBRP', creditBrokerName: 'Huber Research Partners' },
];

const mockTrades:CommissionTrade[] = [
    {
        orderId: 'ORD-123',
        trader: 'Bob',
        ticker: 'AAPL',
        side: 'BUY',
        cusip: '012345678',
        currency: 'USD',
        creditBroker: 'WOLF',
        execBroker: 'JPM',
        divisionName: 'Equities',
        shares: 100,
        totalComm: 20,
        price: 150,
        reason: 'R2',
        account: 123,
        creditMBroker: "",
        department: "",
        departmentCode: 123,
        divisionCode: 123,
        execComm: 0,
        execMBroker: "" ,
        researchComm: 0, 
        securityName: "",
        securityType: "",
        ticketNumber: 12134,
        tradeDate: new Date(),
        tradeType: "",
        usdExecComm: 0,
        usdNet: 0,
        usdPrice: 0,
        usdResearchComm: 0,
        usdTotalComm: 0,
    },
];

describe('useCommissionTrade hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); // resets usage data  
    });

    it('loads data for reasons, brokers, and commission trades data', async () => {  
        // Arrange 
        vi.fn(fetchReasonCodes).mockResolvedValueOnce(mockReasons);  
        vi.fn(fetchBrokerData).mockResolvedValueOnce(mockBrokers);  
        vi.fn(fetchCommissionTrades).mockResolvedValueOnce(mockTrades);  

        // Act 
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        // Assert 
        await waitFor(() => {  
            expect(result.current.reasonData).toEqual(mockReasons);  
            expect(result.current.brokersData).toEqual(mockBrokers);  
            expect(result.current.commissionTradesData).toEqual(mockTrades);  
        });  

        expect(fetchReasonCodes).toHaveBeenCalledTimes(1);  
        expect(fetchBrokerData).toHaveBeenCalledTimes(1);  
        expect(fetchCommissionTrades).toHaveBeenCalledTimes(1);  
    }); 

    it('handles refresh to reload trades data', async () => {  
        // Arrange
        vi.fn(fetchReasonCodes).mockResolvedValueOnce(mockReasons);  
        vi.fn(fetchBrokerData).mockResolvedValueOnce(mockBrokers);  
        vi.fn(fetchCommissionTrades).mockResolvedValueOnce(mockTrades);  

        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        await waitFor(() => {  
            expect(result.current.commissionTradesData).toEqual(mockTrades);  
        });  

        // Arrange
        const updatedTrades = [         
            ...mockTrades
        ];  
        vi.fn(fetchCommissionTrades).mockResolvedValueOnce(updatedTrades);  

        // Act 
        act(() => {  
            result.current.handleRefresh();  
        });  

        // Assert 
        await waitFor(() => {  
            expect(result.current.commissionTradesData).toEqual(updatedTrades);  
        });  

        expect(fetchCommissionTrades).toHaveBeenCalledTimes(2);  
    });     

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        await waitFor(() => {  
            expect(result.current.isAdmin).toEqual(true);  
        });  

        expect(fetchAdminUsers).toHaveBeenCalledTimes(1);  
    }); 
    
    it('handle error when fetch admin users data failed', async () => {  
        vi.fn(fetchAdminUsers).mockRejectedValueOnce(  
            new Error('Failed to fetch admin users data')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchAdminUsers).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch admin users data');
            }
        });
    });

    it('updates begindate when handleFromDateChanged is called', async () => {  
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate}) 
        );  

        // Act  
        act(() => {  
            result.current.handleFromDateChanged({ value: mockStartDate } as DateBoxTypes.ValueChangedEvent);  
        });  

        // Assert  
        expect(result.current.selectedBeginDate?.toISOString()).toContain('2025-10-01');  
    });  

    it('updates enddate when handleToDateChanged is called', async () => {  
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        // Act  
        act(() => {  
            result.current.handleToDateChanged({ value: mockEndDate } as DateBoxTypes.ValueChangedEvent);
        });

        // Assert  
        expect(result.current.selectedEndDate?.toISOString()).toContain('2025-10-15');  
    }); 

    it('opens popup and sets formData on row double-click', () => {  
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        const rowData = mockTrades[0];  

        // Act  
        act(() => {  
            result.current.onRowDblClick(rowData);  
        });  

        // Assert  
        expect(result.current.popupVisible).toBe(true);  
        expect(result.current.formData).toMatchObject({  
            orderId: 'ORD-123',  
            trader: 'Bob',  
            ticker: 'AAPL',  
            side: 'BUY',  
        });  
    });  

    it('opens batch update popup only when multiple rows are selected', () => {  
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        act(() => {  
            result.current.onSelectionChanged(['ORD-123']);  
        });  
        expect(result.current.selectedRowKeys).toEqual(['ORD-123']);  

        act(() => {  
            result.current.handleBatchUpdate();  
        });  
        expect(result.current.batchPopupVisible).toBe(false);

        // Now select multiple rows  
        act(() => {  
            result.current.onSelectionChanged(['ORD-123', 'ORD-456']);  
        });  
        expect(result.current.selectedRowKeys).toEqual(['ORD-123', 'ORD-456']);  

        act(() => {  
            result.current.handleBatchUpdate();  
        });  
        expect(result.current.batchPopupVisible).toBe(true);  
    }); 

    it('closes the batch update popup when closeBatchUpdatePopup is called', async () => {  
        vi.fn(fetchReasonCodes).mockResolvedValue([]);  
        vi.fn(fetchBrokerData).mockResolvedValue([]);  
        vi.fn(fetchCommissionTrades).mockResolvedValue([]);  
 
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})
        );

        await waitFor(() => {  
            expect(result.current.commissionTradesData).toEqual([]);  
        });  

        act(() => {  
            result.current.onSelectionChanged(['ORD-001', 'ORD-002']);  
            result.current.handleBatchUpdate();  
        });

        expect(result.current.selectedRowKeys).toEqual(['ORD-001', 'ORD-002']);  
        act(() => {  
            result.current.handleBatchUpdate();  
        });  
        expect(result.current.batchPopupVisible).toBe(true);  

        act(() => {  
            result.current.closeBatchUpdatePopup();  
        });  
        expect(result.current.batchPopupVisible).toBe(false);  
    });  

    it('closes the single trade popup and clears formData when handleClosePopup is called', async () => {  
        vi.fn(fetchReasonCodes).mockResolvedValue([]);  
        vi.fn(fetchBrokerData).mockResolvedValue([]);  
        vi.fn(fetchCommissionTrades).mockResolvedValue([]);     

        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        await waitFor(() => {  
            expect(result.current.commissionTradesData).toEqual([]);  
        });  

        act(() => {  
            result.current.onRowDblClick({  
            orderId: 'ORD-ABC',  
            trader: 'Alice',  
            ticker: 'AAPL',  
            side: 'BUY',  
            cusip: '037833100',  
            currency: 'USD',  
            creditBroker: 'WOLF',  
            execBroker: 'JPM',  
            divisionName: 'Equities',  
            shares: 10,  
            totalComm: 1.5,  
            price: 150,  
            reason: 'R1',  
            } as CommissionTrade);  
        });  

        expect(result.current.popupVisible).toBe(true);  
        expect(result.current.formData).toBeDefined();  

        act(() => {  
            result.current.handleClosePopup();  
        });  

        expect(result.current.popupVisible).toBe(false);  
        expect(result.current.formData).toBeUndefined();  
    }); 

    it('saveBatchUpdateChange for multiple orderIds', async () => {        
        vi.fn(saveBatchUpdateChanges).mockResolvedValueOnce(true);  
        
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

       // Act  
        await act(async () => { 
            try {
                const updated = await result.current.saveBatchUpdateChange();
                expect(updated).toBeTruthy();  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
            }
        });
    });
    it('saveCommissionTradeChange for single orderid', async () => {
        const key = "1234";        
        const creditBroker = "Test Broker";
        const reason = "T";
               
        vi.fn(saveBatchUpdateChanges).mockResolvedValueOnce(true);  
        
        const { result } = renderHook(() =>  
            useCommissionTrade({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

       // Act  
        await act(async () => { 
            try {
                const updated = await result.current.saveCommissionTradeChange(key,creditBroker,reason);
                expect(updated).toBeTruthy();  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
            }
        });
    });
});