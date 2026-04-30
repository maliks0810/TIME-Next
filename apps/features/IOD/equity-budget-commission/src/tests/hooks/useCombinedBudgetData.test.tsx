import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DateBoxTypes } from 'devextreme-react/date-box';
import { useCommissionCombinedBudget } from '../../hooks/useCombinedBudgetData';
import { fetchCombinedBudgetData,} from '../../services/combined-budget-service';
import { CombinedBudget } from '../../datatypes/tcw-commission-types';

vi.mock('../../services/combined-budget-service', () => ({
    fetchCombinedBudgetData: vi.fn(),
}));

const mockStartDate = new Date('2025-12-01');
const mockEndDate = new Date('2025-12-31');

const mockBudget:CombinedBudget[] = [
    {
        division: "TEST DIV",
        intMstBkr: "TMB",
        masterBrokerName: "TEST M BROKER",
        uniqueId: "1212121",
        pctDone: 0,
        remaining: 0,
        sumOfTotalComm: 100,
        totalBudget: 100,
        year: 2025
    }
];

describe('useCommissionCombinedBudget hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); // resets usage data  
    });

    it('loads combined budget data on mount', async () => {  
        vi.fn(fetchCombinedBudgetData).mockResolvedValueOnce(mockBudget);  

        const { result } = renderHook(() =>  
            useCommissionCombinedBudget(mockStartDate, mockEndDate)  
        );  

        await waitFor(() => {  
            expect(result.current.budgetData).toEqual(mockBudget);  
        });  

        expect(fetchCombinedBudgetData).toHaveBeenCalledTimes(1);  
    }); 

    it('handles refresh (handleRefresh) to reload combinedbudget', async () => {  
        vi.fn(fetchCombinedBudgetData).mockResolvedValueOnce(mockBudget);  

        const { result } = renderHook(() =>  
            useCommissionCombinedBudget(mockStartDate, mockEndDate)  
        );  

        await waitFor(() => {  
            expect(result.current.budgetData).toEqual(mockBudget);  
        });  

        const updatedBudgets = [         
            ...mockBudget
        ];  
        vi.fn(fetchCombinedBudgetData).mockResolvedValueOnce(updatedBudgets);  

        //Act
        act(() => {  
            result.current.handleRefresh();  
        });  

        await waitFor(() => {  
            expect(result.current.budgetData).toEqual(updatedBudgets);  
        });  

        //Assert
        expect(fetchCombinedBudgetData).toHaveBeenCalledTimes(2);  
    });     

    it('updates selectedBeginDate when handleFromDateChanged is called', async () => {  
        const { result } = renderHook(() =>  
            useCommissionCombinedBudget(mockStartDate, mockEndDate)  
        );  

        // Act  
        act(() => {  
            result.current.handleFromDateChanged({ value: mockStartDate } as DateBoxTypes.ValueChangedEvent);  
        });  

        // Assert  
        expect(result.current.selectedBeginDate?.toISOString()).toContain('2025-12-01');  
    });  

    it('updates selectedEndDate when handleToDateChanged is called', async () => {  
        const { result } = renderHook(() =>  
            useCommissionCombinedBudget(mockStartDate, mockEndDate)  
        );  

        // Act  
        act(() => {  
            result.current.handleToDateChanged({ value: mockEndDate } as DateBoxTypes.ValueChangedEvent);  
        });  

        // Assert  
        expect(result.current.selectedEndDate?.toISOString()).toContain('2025-12-31'); 
    }); 

});