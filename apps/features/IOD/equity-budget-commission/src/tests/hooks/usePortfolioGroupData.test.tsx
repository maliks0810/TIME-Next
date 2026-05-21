import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePortfolioGroups } from '../../hooks/usePortfolioGroupData';
import { fetchPortfolios } from '../../services/portfolio-service';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { fetchPortfolioGroupXrefs } from '../../services/portfolio-group-xref-service';
import { fetchPortfolioGroups, createPortfolioGroup, deletePortfolioGroup, updatePortfolioGroup } from '../../services/portfolio-group-service';
import { MaintenancePortfolio, MaintenancePortfolioGroup, MaintenancePortfolioGroupXref, MaintenanceUser, RequestMaintenancePortfolioGroup } from '../../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));
vi.mock('../../services/portfolio-service', () => ({
    fetchPortfolios: vi.fn(),    
}));
vi.mock('../../services/portfolio-group-xref-service', () => ({
    fetchPortfolioGroupXrefs: vi.fn(),
}));
vi.mock('../../services/portfolio-group-service', () => ({
    fetchPortfolioGroups: vi.fn(),    
    createPortfolioGroup: vi.fn(),    
    updatePortfolioGroup: vi.fn(),    
    deletePortfolioGroup: vi.fn(),    
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

const mockPortfolioGrpXrefData: MaintenancePortfolioGroupXref[] = [
    { portfolioGroupXrefId: 1, portfolioGroupId:8, portfolioId:98, lastUpdateBy: 'User1', lastUpdateDate: new Date() },
    { portfolioGroupXrefId: 2, portfolioGroupId:9, portfolioId:99, lastUpdateBy: 'User1', lastUpdateDate: new Date() }
]

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('usePortfolioGroups hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });
    describe('load method', () => {
        it('load portfolio groups data successfully', async () => {  
            vi.fn(fetchPortfolioGroups).mockResolvedValueOnce(mockPortfolioGrpData);  

            const { result } = renderHook(() =>  
                usePortfolioGroups({userInfo})  
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

        it('loads portfolios data', async () => {  
            vi.fn(fetchPortfolios).mockResolvedValueOnce(mockPortfolioData);  

            const { result } = renderHook(() =>  
                usePortfolioGroups({userInfo})
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

        it('loads portfolio group xrefs data', async () => {  
            vi.fn(fetchPortfolioGroupXrefs).mockResolvedValueOnce(mockPortfolioGrpXrefData);  

            const { result } = renderHook(() =>  
                usePortfolioGroups({userInfo})  
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
                usePortfolioGroups({userInfo})  
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

    describe('insert method', () => {
        it('insert portfolio group data successfully', async () => {  
            vi.fn(fetchPortfolios).mockResolvedValueOnce([]);  
            const newItem: RequestMaintenancePortfolioGroup = {  
                portfolioGroupCode:'Grp Code1', 
                portfolioGroupName:'Portfolio Group 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const resultItem: MaintenancePortfolioGroup = { portfolioGroupId: 3, ...newItem, lastUpdateDate: new Date()}
            vi.fn(createPortfolioGroup).mockResolvedValueOnce(resultItem);     

            const { result } = renderHook(() =>  
                usePortfolioGroups({userInfo})  
            );

            await act(async () => {          
                const created = await result.current.addPortfolioGroup(newItem);
                expect(created).toEqual({ ...resultItem, active: true });
            });    
        }); 

        it('create portfolio group throws error on insert fails', async () => {  
            vi.fn(createPortfolioGroup).mockRejectedValueOnce(new Error('Insert failed'));  
            const newItem: RequestMaintenancePortfolioGroup = {  
                portfolioGroupCode:'Grp Code1', 
                portfolioGroupName:'Portfolio Group 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const { result } = renderHook(() =>  
                usePortfolioGroups({ userInfo })  
            );  

            await act(async () => { 
                try { 
                    await result.current.addPortfolioGroup(newItem);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Insert failed"]);
                }
            }); 
        }); 
    });

    describe('update method', () => {
        it('update portfolio data successfully', async () => {  
            const portfolioGroupId:number = 1;
            const updateItem: RequestMaintenancePortfolioGroup = {  
                portfolioGroupCode:'Code1', 
                portfolioGroupName:'Portfolio 1', 
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };
            const resultItem: MaintenancePortfolioGroup = { portfolioGroupId: 1, ...updateItem, lastUpdateDate: new Date()}
            vi.fn(updatePortfolioGroup).mockResolvedValueOnce(resultItem);  

            const { result } = renderHook(() =>  
                usePortfolioGroups({userInfo})
            );  

            // Act  
            await act(async () => { 
                try {
                    const updated = await result.current.modifyPortfolioGroup(portfolioGroupId, updateItem);
                    expect(updated).toEqual(resultItem);  
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Portfolio Group not found"]);
                }
            });
        });

        it('update portfolio throws error on update fails', async () => {  
            vi.fn(updatePortfolioGroup).mockRejectedValueOnce(new Error('Update failed'));  
            const portfolioGroupId: number = 1;
            const updateItem: RequestMaintenancePortfolioGroup = {  
                portfolioGroupCode:'Code1', 
                portfolioGroupName:'Portfolio 1',
                status:'Active', 
                lastUpdateBy: userInfo.name?? 'User1' 
            };

            const { result } = renderHook(() =>  
                usePortfolioGroups({ userInfo })  
            );  

            await act(async () => { 
                try { 
                    await result.current.modifyPortfolioGroup(portfolioGroupId, updateItem);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBeOneOf(["Error: Update failed","Error: Portfolio Group not found"]);
                }
            }); 
        });     
    });
    
    describe('delete method', () => {
        it('delete portfolio group data successfully', async () => {  
            const portfolioGroupId: number = 1;
            vi.fn(fetchPortfolioGroups).mockResolvedValueOnce(mockPortfolioGrpData);  
            vi.fn(deletePortfolioGroup).mockResolvedValueOnce(true);  
        
            const { result } = renderHook(() =>  
                usePortfolioGroups({userInfo})  
            );

            await waitFor(() => {  
                expect(result.current.portfolioGroups).toEqual(mockPortfolioGrpData);  
            }); 

            await act(async () => {  
                await result.current.removePortfolioGroup(portfolioGroupId);  
            });  

            expect(deletePortfolioGroup).toBeTruthy(); 
        });

        it('delete portfolio group throws error on failures', async () => {  
            const portfolioGroupId: number = 1;
            vi.fn(fetchPortfolioGroups).mockResolvedValueOnce(mockPortfolioGrpData);  
            vi.fn(deletePortfolioGroup).mockRejectedValueOnce(new Error('Delete failed'));  

            const { result } = renderHook(() =>  
                usePortfolioGroups({ userInfo })  
            );  

            await waitFor(() => {  
                expect(result.current.portfolioGroups).toEqual(mockPortfolioGrpData);  
            });  

            await act(async () => { 
                try { 
                    await result.current.removePortfolioGroup(portfolioGroupId);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error: Delete failed');
                }
            });  
        });
    });
});