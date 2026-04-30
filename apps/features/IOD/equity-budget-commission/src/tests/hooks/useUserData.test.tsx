import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUsers } from '../../hooks/useUserData';
import { fetchDepartments, fetchDivisions, fetchLocations, fetchUsers, createUser, updateUser, deleteUser} from '../../services/user-service';
import { MaintenanceDivision, MaintenanceDepartment, MaintenanceLocation, MaintenanceUser, RequestMaintenanceUser } from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/user-service', () => ({
    fetchDepartments: vi.fn(),    
    fetchDivisions: vi.fn(),    
    fetchLocations: vi.fn(),    
    fetchUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockDepartments:MaintenanceDepartment[] = [
    { departmentId:1, departmentName:"Dept1 Name", status:"Active", active:true, divisionId:1, lastUpdateDate: new Date()},
    { departmentId:2, departmentName:"Dept2 Name", status:"Active", active:true, divisionId:2, lastUpdateDate: new Date()}
]

const mockDivisions:MaintenanceDivision[] = [
    { divisionId:1, divisionName:"Div1 Name", status:"Active", active:true, lastUpdateDate: new Date()},
    { divisionId:2, divisionName:"Div2 Name", status:"Active", active:true, lastUpdateDate: new Date()}
]

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'lname,fname', firstName: 'fname', lastName:'lname', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:''  }  
];

const mockLocations: MaintenanceLocation[] = [
    { locationId: 1, locationCode:'LA', locationDescription: 'Los Angeles', lastUpdateBy: 'User1', comments:'', orgCode:'US' },
    { locationId: 2, locationCode:'LV', locationDescription: 'Las Vegas', lastUpdateBy: 'User1', comments:'', orgCode:'US' }
]  

describe('useUsers hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    it('fetches Divisions master data', async () => {  
        vi.fn(fetchDivisions).mockResolvedValueOnce(mockDivisions);  

        const { result } = renderHook(() =>  
            useUsers({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.divisions).toEqual(mockDivisions);  
        });  

        expect(fetchDivisions).toHaveBeenCalledTimes(1);  
    });

    it('fetches Departments data successfully', async () => {  
        vi.fn(fetchDepartments).mockResolvedValueOnce(mockDepartments);  

        const { result } = renderHook(() =>  
            useUsers({userInfo})
        );  

        await waitFor(() => {  
            expect(result.current.departments).toEqual(mockDepartments);  
        });  

        expect(fetchDepartments).toHaveBeenCalledTimes(1);  
    });

    it('fetches Locations data successfully', async () => {  
        vi.fn(fetchLocations).mockResolvedValueOnce(mockLocations);  

        const { result } = renderHook(() =>  
            useUsers({userInfo})
        );  

        await waitFor(() => {  
            expect(result.current.locations).toEqual(mockLocations);  
        });  

        expect(fetchLocations).toHaveBeenCalledTimes(1);  
    });

    it('fetches users data successfully', async () => {  
        vi.fn(fetchUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useUsers({userInfo})
        );  

        await waitFor(() => {  
            expect(result.current.users).toEqual(mockUsers);  
        });  

        expect(fetchUsers).toHaveBeenCalledTimes(1);  
    });

    it('handle error when loads users data failed', async () => {  
        vi.fn(fetchUsers).mockRejectedValueOnce(  
            new Error('Failed to load users')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchUsers).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to load users');
            }
        });
    });

    it('insert user data successfully', async () => {  
        vi.fn(fetchUsers).mockResolvedValueOnce([]); 

        const newItem: RequestMaintenanceUser = { firstName: 'fname', lastName:'lname', locationCode: 'US', divisionId:1, departmentId:1, 
            lastUpdateBy:userInfo.name??"User1", startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:1, coopStaffCode:1,
            costCenterCode:'', jobCode:'', status: 'Active' }; 

        const resultItem: MaintenanceUser = {userId:2, ...newItem, userName: newItem.lastName+ "," + newItem.firstName };

        vi.fn(createUser).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useUsers({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.users).toEqual([]);  
        });
        await act(async () => {          
            const created = await result.current.addUser(newItem);  
            expect(created).toEqual(resultItem);  
        });    
    }); 

    it('add user throws error on insert fails', async () => {  
        vi.fn(createUser).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceUser = { firstName: 'fname', lastName:'lname', locationCode: 'US', divisionId:1, departmentId:1, 
            lastUpdateBy:userInfo.name??"User1", startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:1, coopStaffCode:1,
            costCenterCode:'', jobCode:'', status: 'Active' }; 

        const { result } = renderHook(() =>  
            useUsers({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addUser(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    }); 

    it('update user data successfully', async () => {  
        const userId = 1;
        const updatedItem: RequestMaintenanceUser = { firstName: 'Updated', lastName:'User', locationCode: 'US', divisionId:1, departmentId:1, 
            lastUpdateBy:userInfo.name??"User1", startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:1, coopStaffCode:1,
            costCenterCode:'', jobCode:'', status: 'Active' }; 

        const resultItem: MaintenanceUser = {userId:1, ...updatedItem, userName: updatedItem.lastName+ "," + updatedItem.firstName};

        vi.fn(updateUser).mockResolvedValueOnce(resultItem);  

        const { result } = renderHook(() =>  
            useUsers({userInfo})
        );  

        // Act  
        await act(async () => { 
            try {
                const updated = await result.current.modifyUser(userId, updatedItem);
                expect(updated).toEqual(resultItem);  
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: User not found"]);
            }
        });
    });

    it('update user throws error on update fails', async () => {  
        vi.fn(updateUser).mockRejectedValueOnce(new Error('Update failed'));  
        const userId = 1;
        const updatedItem: RequestMaintenanceUser = { firstName: 'Updated', lastName:'User', locationCode: 'US', divisionId:1, departmentId:1, 
            lastUpdateBy:userInfo.name??"User1", startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:1, coopStaffCode:1,
            costCenterCode:'', jobCode:'', status: 'Active' }; 


        const { result } = renderHook(() =>  
            useUsers({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyUser(userId, updatedItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: User not found"]);
            }
        }); 
    });     

    it('delete user data successfully', async () => {  
        vi.fn(fetchUsers).mockResolvedValueOnce(mockUsers);  
        vi.fn(deleteUser).mockResolvedValueOnce(true);  
        const userId = 1;
    
        const { result } = renderHook(() =>  
            useUsers({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.users).toEqual(mockUsers);  
        }); 

        await act(async () => {  
            await result.current.removeUser(userId);  
        });  

        expect(deleteUser).toHaveBeenCalledWith(userId); 
    });

    it('delete user throws error on failures', async () => {  
        vi.fn(fetchUsers).mockResolvedValueOnce([]);  
        vi.fn(deleteUser).mockRejectedValueOnce(new Error('Delete failed'));  
        const userId = 1;

        const { result } = renderHook(() =>  
            useUsers({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.users).toEqual([]);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeUser(userId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toMatch('Error: Delete failed');
            }
        });  
    });
});