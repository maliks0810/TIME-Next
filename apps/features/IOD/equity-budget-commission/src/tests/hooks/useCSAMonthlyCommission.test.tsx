import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCSAMonthlyCommission } from '../../hooks/useCSAMonthlyCommissionData';
import { fetchCSAMonthlyComm } from '../../services/csa-monthly-service';
import { CSAMonthlyCommission } from '../../datatypes/tcw-commission-types';

vi.mock('../../services/csa-monthly-service', () => ({
    fetchCSAMonthlyComm: vi.fn(),
}));

const mockData: CSAMonthlyCommission[] = [  
    { rowNum: 1, division: 'User,Test', creditBroker: 'Test', creditMBrokerName:'User', execMBroker: 'US', execMbrokerName: 'Active', 
    commission: 100, month:1,reason:'A' }];

    
describe('useBrokers hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });
    const month = 1;
    it('load csa monthly commissions data successfully', async () => {  
        vi.fn(fetchCSAMonthlyComm).mockResolvedValueOnce(mockData);  

        const { result } = renderHook(() =>  
            useCSAMonthlyCommission({month})  
        );  

        await waitFor(() => {  
            expect(result.current.csaMonthlyComms).toEqual(mockData);  
        });  

        expect(fetchCSAMonthlyComm).toHaveBeenCalledTimes(1);
    });

    it('handle error when load csa monthly commission data failed', async () => {  
        vi.fn(fetchCSAMonthlyComm).mockRejectedValueOnce(  
            new Error('Failed to fetch csa monthly commissions data')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchCSAMonthlyComm).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch csa monthly commissions data');
            }
        });
    });    
});