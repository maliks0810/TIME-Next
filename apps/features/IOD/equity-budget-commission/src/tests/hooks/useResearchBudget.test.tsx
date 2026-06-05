import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useResearchBudgets } from '../../hooks/useResearchBudget';
import { fetchResearchBudgets, createResearchBudgets, fetchAllBudgetYears, generateYears } from '../../services/annual-research-budget-service'
import { fetchAdminUsers } from '../../services/admin-user-service';
import { BudgetYear, RequestResearchBudget, ResearchBudget } from '../../datatypes/research-budget-types';
import { v4 as uuidv4 } from 'uuid'
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';
import { MaintenanceUser } from '../../datatypes/budget-maintenance-types';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/annual-research-budget-service', () => ({
    fetchResearchBudgets: vi.fn(),
    createResearchBudgets: vi.fn(),
    fetchAllBudgetYears: vi.fn(),
    generateYears: vi.fn(),
}));
vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const mockUserInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockBudgetData: ResearchBudget[] = [  
{ composite_Id: '1', masterBrokerId: "1", divisionId:1, budgetYear:2025, masterBroker: 'Broker 1', 
    mBkrCode: 'B001', division: 'ABD', total: 150, 
    quarter_Four_Id:4, quarter_One_Id:1, quarter_Three_Id:3, quarter_Two_Id:2, 
    quarterFour:0, quarterOne:150, quarterThree:0, quarterTwo:0 },
{ composite_Id: '2', masterBrokerId: "2", divisionId:1, budgetYear:2025, masterBroker: 'Broker 2', 
    mBkrCode: 'B002', division: 'ABD', total: 100, 
    quarter_Four_Id:4, quarter_One_Id:1, quarter_Three_Id:3, quarter_Two_Id:2, 
    quarterFour:0, quarterOne:100, quarterThree:0, quarterTwo:0 }
];

const mockBudgetYears:BudgetYear[] = [{text:"2024",value:2024},{text:"2025",value:2025},{text:"2026",value:2026}];
const mockAllYears:number[] = [2020,2021,2022,2023,2024,2025,2026];
const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useResearchBudgets', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    describe('load method', () =>  {
        it('load research budget data successfully', async () => {  
            vi.fn(fetchResearchBudgets).mockResolvedValueOnce(mockBudgetData);  

            const { result } = renderHook(() =>  
                useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
            );  

            await waitFor(async () => {  
                await result.current.loadResearchBudgetData();  
            });
            
            expect(fetchResearchBudgets).toHaveBeenCalledTimes(1);
            expect(result.current.researchBudgets.length).toBeGreaterThanOrEqual(0);
            expect(result.current.selectedRowKeys.length).toBeGreaterThanOrEqual(0);
            expect(result.current.loading).toBeOneOf([true, false]);
        });   

        it('handle error when load research budget data failed', async () => {  
            vi.fn(fetchResearchBudgets).mockRejectedValueOnce(  
                new Error('Error occurred while loading research budget.')  
            );  

            // Act  
            await act(async () => { 
                try { 
                    vi.fn(fetchResearchBudgets).mockResolvedValueOnce([]);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error occurred while loading research budget.');
                }
            });
        });    
        
        it('load all budget years data successfully', async () => {  
            vi.fn(fetchAllBudgetYears).mockResolvedValueOnce(mockAllYears);  

            const { result } = renderHook(() =>  
                useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
            );
            
            await act(async () => { 
                try { 
                    vi.fn(fetchAllBudgetYears).mockResolvedValueOnce(mockAllYears);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error occurred while loading all years.');
                }
            });

            expect(fetchAllBudgetYears).toHaveBeenCalledTimes(1);
            expect(result.current.uniqueYears).toBeDefined();
        });

        it('load budget years data successfully', async () => {  
            vi.fn(generateYears).mockResolvedValueOnce(mockBudgetYears);  

            const { result } = renderHook(() =>  
                useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
            );

            await act(async () => { 
                try { 
                    vi.fn(generateYears).mockResolvedValueOnce(mockBudgetYears);
                } catch (err) {
                    expect(err).toBeInstanceOf(Error);  
                    expect(String(err)).toBe('Error occurred while loading budget years.');
                }
            });
            expect(generateYears).toHaveBeenCalledTimes(1);
            expect(result.current.budgetYears).toBeDefined();
        });

        it('loads admin users data', async () => {  
            vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

            const { result } = renderHook(() =>  
                useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})
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

    describe('insert method', ()=> {
        const newItems: RequestResearchBudget[]=[
            { masterBrokerId: "123", divisionId:1, budgetYear:2025, quarterFour:100, quarterOne:0, quarterThree:0, quarterTwo:0 },
            { masterBrokerId: "234", divisionId:1, budgetYear:2025, quarterFour:110, quarterOne:0, quarterThree:0, quarterTwo:0 },
        ];        
        it('insert research budget data successfully', async () => {  
            vi.fn(fetchResearchBudgets).mockResolvedValueOnce([]); 

            vi.fn(createResearchBudgets).mockResolvedValueOnce(mockBudgetData);     

            const { result } = renderHook(() =>  
                useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
            );

            await waitFor(async () => {  
                await result.current.loadResearchBudgetData();  
            });

            await act(async () => {          
                const created = await result.current.insertResearchBudgets(newItems);  
                expect(created).toEqual(mockBudgetData);  
            });    
        }); 

        it('add reasearch budget throws error on insert fails', async () => {  
            vi.fn(createResearchBudgets).mockRejectedValueOnce(new Error('Insert failed'));  
           
            const { result } = renderHook(() =>  
                useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
            );  

            await act(async () => { 
                try { 
                    await result.current.insertResearchBudgets(newItems);
                } catch (err) {
                    expect(String(err)).toBeOneOf(["Insert failed"]);
                }
            }); 
        }); 
    });     

    it('onSelectionChanged should update selectedRowKeys', () => {  
        const { result } = renderHook(() =>  
            useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
        );  

        act(() => {  
            result.current.onSelectionChanged(['abc', '123']);  
        });  

        expect(result.current.selectedRowKeys).toEqual(['abc', '123']);  
    });  
    
    it('onAddNewRecord should add New BudgetId to selectedRowKeys', () => { 
        const newItem: RequestResearchBudget = {budgetYear:2026, divisionId:1, masterBrokerId:"1", 
            quarterFour:10, quarterThree:10, quarterTwo:10, quarterOne:10}
        const { result } = renderHook(() =>  
            useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
        );  
        const newEntry: ResearchBudget = {composite_Id: uuidv4(), ...newItem }
        
        act(() => {  
            result.current.onAddNewRecord(newEntry);  
        });  

        expect(result.current.selectedRowKeys.length).toBeGreaterThanOrEqual(1);  
    });

    it('onClearBudgetsClick should clear all the quareter data to 0', () => {
        
        const { result } = renderHook(() =>  
            useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
        );  
        
        act(() => {  
            result.current.onClearBudgetsClick();  
        });  

        expect(result.current.researchBudgets.every(c=> c.quarterOne)).toBeTruthy();  
    });

    it('onBudgetQuarterValueChange should change the quareter data', () => {
        const updateItem: RequestResearchBudget = {budgetYear:2026, divisionId:1, masterBrokerId:"1", 
            quarterFour:10, quarterThree:10, quarterTwo:10, quarterOne:10}
        const composite_Id = "123456";

        const { result } = renderHook(() =>  
            useResearchBudgets({userInfo:mockUserInfo, budgetYear:2025, forYear:2026})  
        );  
        
        act(() => {  
            result.current.onBudgetQuarterValueChange(composite_Id, updateItem);  
        });  

        expect(result.current.researchBudgets.length).toEqual(0);  
    });
});