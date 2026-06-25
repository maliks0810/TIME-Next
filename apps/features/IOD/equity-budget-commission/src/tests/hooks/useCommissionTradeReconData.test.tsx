import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DateBoxTypes } from 'devextreme-react/date-box';
import { useCommissionTradeRecon } from '../../hooks/useCommissionTradeReconData';
import {
    fetchReasonCodes,
    fetchBrokerData
} from '../../services/commission-trade-service';
import {
    fetchReconData
} from '../../services/recon-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { CommissionRecon } from '../../datatypes/tcw-commission-types';
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

vi.mock('../../services/recon-service', () => ({
    fetchReconData: vi.fn(),
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

const mockRecons: CommissionRecon[] = [{ 
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
        order_ID: 'ORD-123',
        trader: 'Bob',
        ticker: 'AAPL',
        security_Name: '',
        cusip: '12345',
        security_Type: '',
        trade_Type: '',
        side: 'BUY',
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
        vi.fn(fetchReconData).mockResolvedValueOnce(mockRecons);  

        // Act 
        const { result } = renderHook(() =>  
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        // Assert 
        await waitFor(() => {  
            expect(result.current.reasonsData).toEqual(mockReasons);  
            expect(result.current.brokersData).toEqual(mockBrokers);  
            expect(result.current.reconData).toEqual(mockRecons);  
        });  

        expect(fetchReasonCodes).toHaveBeenCalledTimes(1);  
        expect(fetchBrokerData).toHaveBeenCalledTimes(1);  
        expect(fetchReconData).toHaveBeenCalledTimes(1);  
    }); 

    it('handles refresh to reload recons data', async () => {  
        // Arrange
        vi.fn(fetchReasonCodes).mockResolvedValueOnce(mockReasons);  
        vi.fn(fetchBrokerData).mockResolvedValueOnce(mockBrokers);  
        vi.fn(fetchReconData).mockResolvedValueOnce(mockRecons);  

        const { result } = renderHook(() =>  
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        await waitFor(() => {  
            expect(result.current.reconData).toEqual(mockRecons);  
        });  

        // Arrange
        const updatedTrades = [         
            ...mockRecons
        ];  
        vi.fn(fetchReconData).mockResolvedValueOnce(updatedTrades);  

        // Act 
        act(() => {  
            result.current.handleRefresh();  
        });  

        // Assert 
        await waitFor(() => {  
            expect(result.current.reconData).toEqual(updatedTrades);  
        });  

        expect(fetchReconData).toHaveBeenCalledTimes(2);  
    });     

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
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
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate}) 
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
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
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
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        const rowData = mockRecons[0];  

        // Act  
        act(() => {  
            result.current.onRowDblClick(rowData);  
        });  

        // Assert  
        expect(result.current.popupVisible).toBe(true);  
        expect(result.current.reconDetailData).toMatchObject({  
            orderId: 'ORD-123',  
            trader: 'Bob',  
            ticker: 'AAPL',  
            side: 'BUY',  
        });  
    });  

    
    it('closes the single trade popup and clears formData when handleClosePopup is called', async () => {  
        vi.fn(fetchReasonCodes).mockResolvedValue([]);  
        vi.fn(fetchBrokerData).mockResolvedValue([]);  
        vi.fn(fetchReconData).mockResolvedValue([]);     

        const { result } = renderHook(() =>  
            useCommissionTradeRecon({userInfo, startDate:mockStartDate, endDate:mockEndDate})  
        );  

        await waitFor(() => {  
            expect(result.current.reconData).toEqual([]);  
        });  

        act(() => {  
            result.current.onRowDblClick({  
            order_ID: 'ORD-ABC',  
            trader: 'Alice',  
            ticker: 'AAPL',  
            side: 'BUY',  
            cusip: '037833100',  
            currency: 'USD',  
            credit_Broker: 'WOLF',  
            exec_Broker: 'JPM',  
            division_Name: 'Equities',  
            shares: 10,  
            total_Comm: 1.5,  
            price: 150,  
            reason: 'R1',  
            } as CommissionRecon);  
        });  

        expect(result.current.popupVisible).toBe(true);  
        expect(result.current.reconDetailData).toBeDefined();  

        act(() => {  
            result.current.handleClosePopup();  
        });  

        expect(result.current.popupVisible).toBe(false);  
        expect(result.current.reconDetailData).toBeUndefined();  
    });    
});