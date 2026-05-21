import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePortfolios } from '../../hooks/usePortfolioData';
import { fetchPortfolios, createPortfolio, updatePortfolio, deletePortfolio    
} from '../../services/portfolio-service';
import { fetchDivisions } from '../../services/division-service';
import { fetchDepartments } from '../../services/department-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { fetchPortfolioGroups } from '../../services/portfolio-group-service';
import { fetchPortfolioGroupXrefs, createPortfolioGroupXref, updatePortfolioGroupXref, deletePortfolioGroupXref
} from '../../services/portfolio-group-xref-service';
import { MaintenancePortfolio, MaintenancePortfolioGroup, RequestMaintenancePortfolio, MaintenanceDivision, 
    MaintenanceDepartment, MaintenancePortfolioGroupXref, RequestMaintenancePortfolioGroupXref, 
    MaintenanceUser} 
from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/portfolio-group-service', () => ({
    fetchPortfolioGroups: vi.fn(),    
}));
vi.mock('../../services/portfolio-group-xref-service', () => ({
    fetchPortfolioGroupXrefs: vi.fn(),
    createPortfolioGroupXref: vi.fn(),
    updatePortfolioGroupXref: vi.fn(),
    deletePortfolioGroupXref: vi.fn()
}));
vi.mock('../../services/division-service', () => ({
    fetchDivisions: vi.fn(),
}));
vi.mock('../../services/department-service', () => ({
    fetchDepartments: vi.fn(),
}));
vi.mock('../../services/portfolio-service', () => ({
    fetchPortfolios: vi.fn(),
    createPortfolio: vi.fn(),    
    updatePortfolio: vi.fn(),    
    deletePortfolio: vi.fn(),    
}));
vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));
const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockPortfolioData: MaintenancePortfolio[] = [  
    { portfolioId:1, portfolioGroupId:98, portfolioCode:'Code1', portfolioName:'Portfolio 1', portfolioNumber:'number 1', departmentId:1, departmentName:'Dept 1', divisionId:1, divisionName:'Div 1', status:'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { portfolioId:2, portfolioGroupId:99, portfolioCode:'Code2', portfolioName:'Portfolio 2', portfolioNumber:'number 2', departmentId:1, departmentName:'Dept 2', divisionId:1, divisionName:'Div 2', status:'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
];

const mockPortfolioGrpData: MaintenancePortfolioGroup[] = [  
    { portfolioGroupId:98, portfolioGroupCode:'Grp Code1', portfolioGroupName:'Portfolio Group 1', status:'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { portfolioGroupId:99, portfolioGroupCode:'Grp Code2', portfolioGroupName:'Portfolio Group 2', status:'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
];

const mockDivisions:MaintenanceDivision[] = [
    { divisionId:1, divisionName:"Div1 Name", status:"Active", lastUpdateDate: new Date()},
    { divisionId:2, divisionName:"Div2 Name", status:"Active", lastUpdateDate: new Date()}
]

const mockDepartments:MaintenanceDepartment[] = [
    { departmentId:1, departmentName:"Dept1 Name", status:"Active", divisionId:1, lastUpdateDate: new Date()},
    { departmentId:2, departmentName:"Dept2 Name", status:"Active", divisionId:2, lastUpdateDate: new Date()}
]

const mockPortfolioGrpXrefData: MaintenancePortfolioGroupXref[] = [
    { portfolioGroupXrefId: 1, portfolioGroupId:8, portfolioId:98, lastUpdateBy: 'User1', lastUpdateDate: new Date() },
    { portfolioGroupXrefId: 2, portfolioGroupId:9, portfolioId:99, lastUpdateBy: 'User1', lastUpdateDate: new Date() }
]

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('usePortfolios hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    describe('load method', () => {
        it('load portfolios data successfully', async () => {  
            vi.fn(fetchPortfolios).mockResolvedValueOnce(mockPortfolioData);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );  

            await waitFor(() => {  
                expect(result.current.portfolios).toEqual(mockPortfolioData);  
            });  

            expect(fetchPortfolios).toHaveBeenCalledTimes(1);  
        });

        it('handle error when load portfolios data failed', async () => {  
            vi.fn(fetchPortfolios).mockRejectedValueOnce(  
                new Error('Failed to fetch portfolios')  
            );  

            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchPortfolios).mockResolvedValueOnce([]);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Failed to fetch portfolios');
                }
            });
        });

        it('loads portfolio groups data', async () => {  
            vi.fn(fetchPortfolioGroups).mockResolvedValueOnce(mockPortfolioGrpData);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );  

            await waitFor(() => {  
                expect(result.current.portfolioGroups).toEqual(mockPortfolioGrpData);  
            });  

            expect(fetchPortfolioGroups).toHaveBeenCalledTimes(1);  
        }); 

        it('handle error when load portfolio groups data failed', async () => {  
            vi.fn(fetchPortfolioGroups).mockRejectedValueOnce(  
                new Error('Failed to fetch portfolio groups')  
            );  

            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchPortfolioGroups).mockResolvedValueOnce([]);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Failed to fetch portfolio groups');
                }
            });
        });

        it('loads divisions data', async () => {  
            vi.fn(fetchDivisions).mockResolvedValueOnce(mockDivisions);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );  

            await waitFor(() => {  
                expect(result.current.divisions).toEqual(mockDivisions);  
            });  

            expect(fetchDivisions).toHaveBeenCalledTimes(1);  
        });

        it('handle error when load divisions data failed', async () => {  
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

        it('loads departments data', async () => {  
            vi.fn(fetchDepartments).mockResolvedValueOnce(mockDepartments);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );  

            await waitFor(() => {  
                expect(result.current.departments).toEqual(mockDepartments);  
            });  

            expect(fetchDepartments).toHaveBeenCalledTimes(1);  
        });

        it('handle error when load departments data failed', async () => {  
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

        it('loads portfolio group xrefs data', async () => {  
            vi.fn(fetchPortfolioGroupXrefs).mockResolvedValueOnce(mockPortfolioGrpXrefData);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );  

            await waitFor(() => {  
                expect(result.current.portfolioGroupXrefs).toEqual(mockPortfolioGrpXrefData);  
            });  

            expect(fetchPortfolioGroupXrefs).toHaveBeenCalledTimes(1);  
        });

        it('handle error when load portfolio group xref data failed', async () => {  
            vi.fn(fetchPortfolioGroupXrefs).mockRejectedValueOnce(  
                new Error('Failed to fetch portfolio group xref')  
            );  

            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchPortfolioGroupXrefs).mockResolvedValueOnce([]);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Failed to fetch portfolio group xref');
                }
            });
        });
        
        it('loads admin users data', async () => {  
            vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
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
    });

    describe('insert method',() => {
        it('insert portfolio data successfully', async () => {  
            vi.fn(fetchPortfolios).mockResolvedValueOnce([]);  
            const newItem: RequestMaintenancePortfolio = {  
                portfolioCode:'Code1', 
                portfolioName:'Portfolio 1', 
                portfolioGroupId:98, 
                portfolioNumber:'number 1', 
                departmentId:1, 
                departmentName:'Dept 1', 
                divisionId:1, 
                divisionName:'Div 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const resultItem: MaintenancePortfolio = { portfolioId: 3, ...newItem, lastUpdateDate: new Date()}
            vi.fn(createPortfolio).mockResolvedValueOnce(resultItem);     

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );

            await act(async () => {          
                const created = await result.current.addPortfolio(newItem);
                expect(created).toEqual({ ...resultItem, active: true });
            });    
        }); 

        it('create portfolio throws error on insert fails', async () => {  
            vi.fn(createPortfolio).mockRejectedValueOnce(new Error('Insert failed'));  
            const newItem: RequestMaintenancePortfolio = {  
                portfolioCode:'Code1', 
                portfolioName:'Portfolio 1', 
                portfolioGroupId:98, 
                portfolioNumber:'number 1', 
                departmentId:1, 
                departmentName:'Dept 1', 
                divisionId:1, 
                divisionName:'Div 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const { result } = renderHook(() =>  
                usePortfolios({ userInfo })  
            );  

            await act(async () => { 
                try { 
                    await result.current.addPortfolio(newItem);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Insert failed"]);
                }
            }); 
        }); 

        /** Portfoio group xref */
        it('insert portfolio group xref data successfully', async () => {  
            vi.fn(fetchPortfolioGroupXrefs).mockResolvedValueOnce([]);  
            const newItem: RequestMaintenancePortfolioGroupXref = {  
                portfolioId:1, 
                portfolioGroupId:98, 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const resultItem: MaintenancePortfolioGroupXref = { portfolioGroupXrefId: 3, ...newItem, lastUpdateDate: new Date()}
            vi.fn(createPortfolioGroupXref).mockResolvedValueOnce(resultItem);     

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );

            await act(async () => {          
                const created = await result.current.addPortfolioGroupXref(newItem);
                expect(created).toEqual(resultItem);  
            });    
        }); 

        it('create portfolio group xref throws error on insert fails', async () => {  
            vi.fn(createPortfolioGroupXref).mockRejectedValueOnce(new Error('Insert failed'));  
            const newItem: RequestMaintenancePortfolioGroupXref = {  
                portfolioId:1, 
                portfolioGroupId:98, 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const { result } = renderHook(() =>  
                usePortfolios({ userInfo })  
            );  

            await act(async () => { 
                try { 
                    await result.current.addPortfolioGroupXref(newItem);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Insert failed"]);
                }
            }); 
        });
    });

    describe('update method', () => {
        it('update portfolio data successfully', async () => {  
            const portfolioId:number = 1;
            const updateItem: RequestMaintenancePortfolio = {  
                portfolioCode:'Code1', 
                portfolioName:'Portfolio 1', 
                portfolioGroupId:98, 
                portfolioNumber:'number 1', 
                departmentId:1, 
                departmentName:'Dept 1', 
                divisionId:1, 
                divisionName:'Div 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };
            const resultItem: MaintenancePortfolio = { portfolioId: 1, ...updateItem, lastUpdateDate: new Date()}
            vi.fn(updatePortfolio).mockResolvedValueOnce(resultItem);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})
            );  

            // Act  
            await act(async () => { 
                try {
                    const updated = await result.current.modifyPortfolio(portfolioId, updateItem);
                    expect(updated).toEqual(resultItem);  
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: portfolio not found"]);
                }
            });
        });

        it('update portfolio throws error on update fails', async () => {  
            vi.fn(updatePortfolio).mockRejectedValueOnce(new Error('Update failed'));  
            const portfolioId: number = 1;
            const updateItem: RequestMaintenancePortfolio = {  
                portfolioCode:'Code1', 
                portfolioName:'Portfolio 1', 
                portfolioGroupId:98, 
                portfolioNumber:'number 1', 
                departmentId:1, 
                departmentName:'Dept 1', 
                divisionId:1, 
                divisionName:'Div 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const { result } = renderHook(() =>  
                usePortfolios({ userInfo })  
            );  

            await act(async () => { 
                try { 
                    await result.current.modifyPortfolio(portfolioId, updateItem);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: portfolio not found"]);
                }
            }); 
        });  
        
        /** Portfolio group xref */
        it('update portfolio group xref data successfully', async () => {  
            const portfolioGroupXrefId:number = 1;
            const updateItem: RequestMaintenancePortfolioGroupXref = {  
                portfolioGroupId:98, 
                portfolioId: 1,
                lastUpdateBy: userInfo.name?? 'User1' 
            };
            const resultItem: MaintenancePortfolioGroupXref = { portfolioGroupXrefId: 1, ...updateItem, lastUpdateDate: new Date()}
            vi.fn(updatePortfolioGroupXref).mockResolvedValueOnce(resultItem);  

            const { result } = renderHook(() =>  
                usePortfolios({userInfo})
            );  

            // Act  
            await act(async () => { 
                try {
                    const updated = await result.current.modifyPortfolioGroupXref(portfolioGroupXrefId, updateItem);
                    expect(updated).toEqual(resultItem);  
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Portfolio Group Xref not found"]);
                }
            });
        });

        it('update portfolio throws error on update fails', async () => {  
            vi.fn(updatePortfolioGroupXref).mockRejectedValueOnce(new Error('Update failed'));  
            const portfolioGroupXrefId: number = 1;
            const updateItem: RequestMaintenancePortfolioGroupXref = {  
                portfolioId:1, 
                portfolioGroupId:98, 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const { result } = renderHook(() =>  
                usePortfolios({ userInfo })  
            );  

            await act(async () => { 
                try { 
                    await result.current.modifyPortfolioGroupXref(portfolioGroupXrefId, updateItem);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Portfolio Group Xref not found"]);
                }
            }); 
        });
    });

    describe('delete method', () => {
        it('delete portfolio data successfully', async () => {  
            const portfolioId: number = 1;
            vi.fn(fetchPortfolios).mockResolvedValueOnce(mockPortfolioData);  
            vi.fn(deletePortfolio).mockResolvedValueOnce(true);  
        
            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );

            await waitFor(() => {  
                expect(result.current.portfolios).toEqual(mockPortfolioData);  
            }); 

            await act(async () => {  
                await result.current.removePortfolio(portfolioId);  
            });  

            expect(deletePortfolio).toBeTruthy(); 
        });

        it('delete portfolio throws error on failures', async () => {  
            const portfolioId: number = 1;
            vi.fn(fetchPortfolios).mockResolvedValueOnce(mockPortfolioData);  
            vi.fn(deletePortfolio).mockRejectedValueOnce(new Error('Delete failed'));  

            const { result } = renderHook(() =>  
                usePortfolios({ userInfo })  
            );  

            await waitFor(() => {  
                expect(result.current.portfolios).toEqual(mockPortfolioData);  
            });  

            await act(async () => { 
                try { 
                    await result.current.removePortfolio(portfolioId);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error: Delete failed');
                }
            });  
        });

        /** Portfolio group xref */
        it('delete portfolio group xref data successfully', async () => {  
            const portfolioGroupXrefId: number = 1;
            vi.fn(fetchPortfolioGroupXrefs).mockResolvedValueOnce(mockPortfolioGrpXrefData);  
            vi.fn(deletePortfolioGroupXref).mockResolvedValueOnce(true);  
        
            const { result } = renderHook(() =>  
                usePortfolios({userInfo})  
            );

            await waitFor(() => {  
                expect(result.current.portfolioGroupXrefs).toEqual(mockPortfolioGrpXrefData);  
            }); 

            await act(async () => {  
                await result.current.removePortfolioGroupXref(portfolioGroupXrefId);  
            });  

            expect(deletePortfolioGroupXref).toBeTruthy(); 
        });

        it('delete portfolio throws error on failures', async () => {  
            const portfolioGroupXrefId: number = 1;
            vi.fn(fetchPortfolioGroupXrefs).mockResolvedValueOnce(mockPortfolioGrpXrefData);  
            vi.fn(deletePortfolioGroupXref).mockRejectedValueOnce(new Error('Delete failed'));  

            const { result } = renderHook(() =>  
                usePortfolios({ userInfo })  
            );  

            await waitFor(() => {  
                expect(result.current.portfolioGroupXrefs).toEqual(mockPortfolioGrpXrefData);  
            });  

            await act(async () => { 
                try { 
                    await result.current.removePortfolioGroupXref(portfolioGroupXrefId);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error: Delete failed');
                }
            });  
        });
    });
});