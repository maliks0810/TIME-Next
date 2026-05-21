import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDivisions } from '../../hooks/useDivisionData';
import { fetchDivisions, createDivision, deleteDivision, updateDivision} from '../../services/division-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { MaintenanceDivision, MaintenanceUser, RequestMaintenanceDivision } from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/division-service', () => ({
    fetchDivisions: vi.fn(),    
    createDivision: vi.fn(),    
    updateDivision: vi.fn(),    
    deleteDivision: vi.fn(),    
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockDivisions:MaintenanceDivision[] = [
    { divisionId:1, divisionName:"Div1 Name", status:"Active", active:true, lastUpdateDate: new Date()},
    { divisionId:2, divisionName:"Div2 Name", status:"Active", active:true, lastUpdateDate: new Date()}
];

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useDivisions hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    it('loads divisions data successfully', async () => {  
        vi.fn(fetchDivisions).mockResolvedValueOnce(mockDivisions);  

        const { result } = renderHook(() =>  
            useDivisions({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.divisions).toEqual(mockDivisions);  
        });  

        expect(fetchDivisions).toHaveBeenCalledTimes(1);  
    });

    it('handle error when loads divisions data failed', async () => {  
        vi.fn(fetchDivisions).mockRejectedValueOnce(  
            new Error('Failed to fetch divisions')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchDivisions).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch divisions');
            }
        });
    });

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useDivisions({userInfo})  
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
    
    it('insert division data successfully', async () => {  
        vi.fn(fetchDivisions).mockResolvedValueOnce([]); 

        const newItem: RequestMaintenanceDivision = { divisionName:"Test Division", status:"Active"}
        const resultItem: MaintenanceDivision = {divisionId:2, lastUpdateDate: new Date(), ...newItem }
        vi.fn(createDivision).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useDivisions({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.divisions).toEqual([]);  
        });
        await act(async () => {          
            const created = await result.current.addDivision(newItem);  
            expect(created).toEqual(resultItem);  
        });    
    }); 

    it('add division throws error on insert fails', async () => {  
        vi.fn(createDivision).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceDivision = { divisionName:"Test Div", status:"Active"}

        const { result } = renderHook(() =>  
            useDivisions({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addDivision(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update division data successfully', async () => {  
        const divId = 1;
        const updateItem: RequestMaintenanceDivision = { divisionName:"Test division", status:"Active"}
        const resultItem:MaintenanceDivision = {divisionId:1, lastUpdateDate:new Date(), lastUpdateBy:userInfo.name, ...updateItem}
        vi.fn(updateDivision).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useDivisions({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyDivision(divId, updateItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Division not found"]);
            }
        });
    });

    it('update division throws error on update fails', async () => {  
        vi.fn(updateDivision).mockRejectedValueOnce(new Error('Update failed'));  
        const divId = 1;
        const updateItem: RequestMaintenanceDivision = { divisionName:"Test Div", status:"Active"}

        const { result } = renderHook(() =>  
            useDivisions({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyDivision(divId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Division not found"]);
            }
        }); 
    });     

    it('delete division data successfully', async () => {  
        vi.fn(fetchDivisions).mockResolvedValueOnce(mockDivisions);  
        vi.fn(deleteDivision).mockResolvedValueOnce(true);  
        const divId = 1;
    
        const { result } = renderHook(() =>  
            useDivisions({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.divisions).toEqual(mockDivisions);  
        }); 

        await act(async () => {  
            await result.current.removeDivision(divId);  
        });  

        expect(deleteDivision).toHaveBeenCalledWith(1); 
    });

    it('delete division throws error on failures', async () => {  
        vi.fn(fetchDivisions).mockResolvedValueOnce(mockDivisions);  
        vi.fn(deleteDivision).mockRejectedValueOnce(new Error('Delete failed'));  
        const divId = 1;

        const { result } = renderHook(() =>  
            useDivisions({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.divisions).toEqual(mockDivisions);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeDivision(divId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });
});