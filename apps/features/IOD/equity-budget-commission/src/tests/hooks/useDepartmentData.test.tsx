import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDepartments } from '../../hooks/useDepartmentData';
import { fetchDepartments, fetchDivisions, createDepartment, deleteDepartment, updateDepartment} from '../../services/department-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { MaintenanceDepartment, MaintenanceDivision, MaintenanceUser, RequestMaintenanceDepartment } from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/department-service', () => ({
    fetchDepartments: vi.fn(),
    fetchDivisions: vi.fn(),    
    createDepartment: vi.fn(),    
    updateDepartment: vi.fn(),    
    deleteDepartment: vi.fn(),    
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockDepartments:MaintenanceDepartment[] = [
    { departmentId:1, departmentName:"Dept1 Name", status:"Active", active:true, divisionId:1, lastUpdateDate: new Date()},
    { departmentId:2, departmentName:"Dept2 Name", status:"Active", active:true, divisionId:2, lastUpdateDate: new Date()}
];

const mockDivisions:MaintenanceDivision[] = [
    { divisionId:1, divisionName:"Div Name", status:"Active", active:true, lastUpdateDate: new Date()}
];

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useDepartments hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    it('loads departments data successfully', async () => {  
        vi.fn(fetchDepartments).mockResolvedValueOnce(mockDepartments);  

        const { result } = renderHook(() =>  
            useDepartments({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.departments).toEqual(mockDepartments);  
        });  

        expect(fetchDepartments).toHaveBeenCalledTimes(1);  
    });

    it('handle error when loads departments data failed', async () => {  
        vi.fn(fetchDepartments).mockRejectedValueOnce(  
            new Error('Failed to fetch departments')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchDepartments).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch departments');
            }
        });
    });

    it('loads divisions master data', async () => {  
        vi.fn(fetchDivisions).mockResolvedValueOnce(mockDivisions);  

        const { result } = renderHook(() =>  
            useDepartments({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.divisions).toEqual(mockDivisions);  
        });  

        expect(fetchDivisions).toHaveBeenCalledTimes(1);  
    }); 

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useDepartments({userInfo})  
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
    
    it('insert department data successfully', async () => {  
        vi.fn(fetchDepartments).mockResolvedValueOnce([]);  

        const newItem: MaintenanceDepartment = { departmentId:0, departmentName:"Test Dept", lastUpdateDate: new Date(), status:"Active"}
        const resultItem = { ...newItem, departmentId:1}
        vi.fn(createDepartment).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useDepartments({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.departments).toEqual([]);  
        });
        await act(async () => {          
            const created = await result.current.addDepartment(newItem);  
            expect(created).toEqual(resultItem);  
        });    
    }); 

    it('add department throws error on insert fails', async () => {  
        vi.fn(createDepartment).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceDepartment = { departmentName:"Test Dept", status:"Active"}

        const { result } = renderHook(() =>  
            useDepartments({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addDepartment(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update department data successfully', async () => {  
        const deptId:number = 1;
        const updateItem: RequestMaintenanceDepartment = { departmentName:"Test Dept", status:"Active"}
        const resultItem:MaintenanceDepartment = {departmentId:1, departmentName:"Test Dept", status:"Active", lastUpdateDate:new Date(), lastUpdateBy:userInfo.name}
        vi.fn(updateDepartment).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useDepartments({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyDepartment(deptId, updateItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Department not found"]);
            }
        });
    });

    it('update department throws error on update fails', async () => {  
        vi.fn(updateDepartment).mockRejectedValueOnce(new Error('Update failed'));  
        const deptId:number = 1;
        const updateItem: RequestMaintenanceDepartment = { departmentName:"Test Dept", status:"Active"}

        const { result } = renderHook(() =>  
            useDepartments({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyDepartment(deptId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: Department not found"]);
            }
        }); 
    });     

    it('delete department data successfully', async () => {  
        vi.fn(fetchDepartments).mockResolvedValueOnce(mockDepartments);  
        vi.fn(deleteDepartment).mockResolvedValueOnce(true);  
        const deptId:number = 1;
    
        const { result } = renderHook(() =>  
            useDepartments({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.departments).toEqual(mockDepartments);  
        }); 

        await act(async () => {  
            await result.current.removeDepartment(deptId);  
        });  

        expect(deleteDepartment).toHaveBeenCalledWith(1); 
    });

    it('delete department throws error on failures', async () => {  
        vi.fn(fetchDepartments).mockResolvedValueOnce(mockDepartments);  
        vi.fn(deleteDepartment).mockRejectedValueOnce(new Error('Delete failed'));  
        const deptId:number = 1;

        const { result } = renderHook(() =>  
            useDepartments({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.departments).toEqual(mockDepartments);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeDepartment(deptId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });
});