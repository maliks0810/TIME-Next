import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDirectedRules } from '../../hooks/useDirectedRules';
import { fetchDirectedRules, createDirectedRule, updateDirectedRule, deleteDirectedRule,
    fetchDirectedRulesXref, createDirectedRuleXref, updateDirectedRuleXref, deleteDirectedRuleXref
 } from '../../services/directed-rules-service';
import { fetchBrokers } from '../../services/broker-service';
import { fetchPortfolios } from '../../services/portfolio-service';
import { MaintenanceDirectedRules, RequestMaintenanceDirectedRules, MaintenanceDirectedRulesXref, RequestMaintenanceDirectedRulesXref, 
    MaintenanceBroker, MaintenancePortfolio,
    MaintenanceUser,  
} from '../../datatypes/budget-maintenance-types';
import { fetchAdminUsers } from '../../services/admin-user-service';
import { UserInfo } from '../../../../../../../packages/utils/src/hooks/Authentication/user-info';

vi.mock('@platform/utils', () => ({
    useUserInfo: vi.fn(() => ({})),
}));

vi.mock('../../services/broker-service', () => ({
    fetchBrokers: vi.fn(),
}));

vi.mock('../../services/portfolio-service', () => ({
    fetchPortfolios: vi.fn(),
}));

vi.mock('../../services/directed-rules-service', () => ({
    fetchDirectedRules: vi.fn(),
    createDirectedRule: vi.fn(),
    updateDirectedRule: vi.fn(),
    deleteDirectedRule: vi.fn(),
    fetchDirectedRulesXref: vi.fn(),
    createDirectedRuleXref: vi.fn(),
    updateDirectedRuleXref: vi.fn(),
    deleteDirectedRuleXref: vi.fn(),
}));

vi.mock('../../services/admin-user-service', () => ({
    fetchAdminUsers: vi.fn(),
}));

const userInfo: UserInfo = { id:'test1', name: 'Test User', email:'Test@test.com', isAdmin:false };  

const mockDirectedRulesData: MaintenanceDirectedRules[] = [  
    { directedRulesId: 1, directedRulesName: 'Direct Rule 1', directedRulesCode: 'DR001', comment: 'ABD', budgetPercent: 10, lastUpdateDt: new Date(), lastUpdateBy: 'User1', status:'Active', active:true },  
    { directedRulesId: 2, directedRulesName: 'Direct Rule 2', directedRulesCode: 'DR002', comment: 'ABD', budgetPercent: 12, lastUpdateDt: new Date(), lastUpdateBy: 'User1', status:'Active', active:true }  
];

const mockDirectedRulesXrefData: MaintenanceDirectedRulesXref[] = [  
    { directedRulesXRefId:1 ,directedRulesId: 1, brokerCode: 'B001', accountCode:'A001', year:2026, lastUpdateDt: new Date(), lastUpdateBy: 'User1' },  
    { directedRulesXRefId:2 ,directedRulesId: 2, brokerCode: 'B002', accountCode:'A002', year:2026, lastUpdateDt: new Date(), lastUpdateBy: 'User1' }  
];

const mockBrokersData: MaintenanceBroker[] = [  
    { brokerId: 1, masterBrokerId: "1", brokerName: 'Broker 1', brokerCode: 'B001', aladdinBrokerCode: 'ABD', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { brokerId: 2, masterBrokerId: "2", brokerName: 'Broker 2', brokerCode: 'B002', aladdinBrokerCode: 'ABD', status: 'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' }  
];

const mockPortfolioData: MaintenancePortfolio[] = [  
    { portfolioId:1, portfolioGroupId:98, portfolioCode:'Code1', portfolioName:'Portfolio 1', portfolioNumber:'number 1', departmentId:1, departmentName:'Dept 1', divisionId:1, divisionName:'Div 1', status:'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
    { portfolioId:2, portfolioGroupId:99, portfolioCode:'Code2', portfolioName:'Portfolio 2', portfolioNumber:'number 2', departmentId:1, departmentName:'Dept 2', divisionId:1, divisionName:'Div 2', status:'Active', active:true, lastUpdateDate: new Date(), lastUpdateBy: 'User1' },  
];

const mockUsers: MaintenanceUser[] = [
    { userId: 1, userName: 'User,Test', firstName: 'Test', lastName:'User', locationCode: 'US', status: 'Active', active:true, lastUpdateBy:'User1', 
        divisionId:1, departmentId:1, startDate:'01-01-2025', endDate:'12-31-2025', coopDptCode:0, coopStaffCode:0, costCenterCode:'', jobCode:'', admin:true  }  
];

describe('useDirectedRules hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {  
        vi.resetAllMocks(); 
    });

    /** Brokers Data */
    it('load brokers data successfully', async () => {  
        vi.fn(fetchBrokers).mockResolvedValueOnce(mockBrokersData);  

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.brokers).toEqual(mockBrokersData);  
        });  

        expect(fetchBrokers).toHaveBeenCalledTimes(1);  
    });

    it('handle error when load brokers data failed', async () => {  
        vi.fn(fetchBrokers).mockRejectedValueOnce(  
            new Error('Failed to fetch brokers')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchBrokers).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch brokers');
            }
        });
    });    

    /** Portfolios Data */
    it('load portfolios data successfully', async () => {  
        vi.fn(fetchPortfolios).mockResolvedValueOnce(mockPortfolioData);  

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
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

    /** Directed Rules Data */
    it('load directed rules data successfully', async () => {  
        vi.fn(fetchDirectedRules).mockResolvedValueOnce(mockDirectedRulesData);  

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.directedRules).toEqual(mockDirectedRulesData);  
        });  

        expect(fetchDirectedRules).toHaveBeenCalledTimes(1);  
    });

    it('handle error when load directed rules data failed', async () => {  
        vi.fn(fetchDirectedRules).mockRejectedValueOnce(  
            new Error('Failed to fetch directed rules data')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchDirectedRules).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch directed rules data');
            }
        });
    });

    it('loads admin users data', async () => {  
        vi.fn(fetchAdminUsers).mockResolvedValueOnce(mockUsers);  

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
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
    
    it('insert directed rules data successfully', async () => {  
        vi.fn(fetchDirectedRules).mockResolvedValueOnce([]);  
        const newItem: RequestMaintenanceDirectedRules = { directedRulesName: "New Rule", directedRulesCode:"NR003", comment:"test", status:'Active', active:true, budgetPercent:10, lastUpdateBy: "User1", };  

        const resultItem: MaintenanceDirectedRules = { directedRulesId: 3, ...newItem, lastUpdateDt: new Date()}
        vi.fn(createDirectedRule).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );

        await act(async () => {          
            const created = await result.current.addDirectedRule(newItem);
            expect(created).toEqual(resultItem);  
        });    

        expect(createDirectedRule).toHaveBeenCalledTimes(1); 

    }); 

    it('create directed rules throws error on insert fail', async () => {  
        vi.fn(createDirectedRule).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceDirectedRules = { directedRulesName: "New Rule", directedRulesCode:"NR003", comment:"test", status:'Active', active:true, budgetPercent:10, lastUpdateBy: "User1", };  

        const { result } = renderHook(() =>  
            useDirectedRules({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addDirectedRule(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    });    

    it('update directed rules data successfully', async () => { 
        const directedRulesId:number =  1 
        vi.fn(fetchDirectedRules).mockResolvedValueOnce([]);  
        const updateItem: RequestMaintenanceDirectedRules = { directedRulesName: "Updated Rule", directedRulesCode:"UR003", comment:"test", status:'Active', active:true, budgetPercent:10, lastUpdateBy: "User1", };  

        const resultItem: MaintenanceDirectedRules = { directedRulesId: 1, ...updateItem, lastUpdateDt: new Date()}
        vi.fn(updateDirectedRule).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );

        await act(async () => {    
          try{      
            const updated = await result.current.modifyDirectedRule(directedRulesId,updateItem);
            expect(updated).toEqual(resultItem); 
          }catch (err){
            expect(err).toBeInstanceOf(Error);  
            expect(String(err)).toBeOneOf(["Error: Update failed","Error: DirectedRule not found"]);
          } 
        }); 
    }); 

    it('update directed rules throws error on update fail', async () => {  
        const directedRulesId:number =  1 
        vi.fn(updateDirectedRule).mockRejectedValueOnce(new Error('Update failed'));  
        const updateItem: RequestMaintenanceDirectedRules = { directedRulesName: "Updated Rule", directedRulesCode:"UR003", comment:"test", status:'Active', active:true, budgetPercent:10, lastUpdateBy: "User1", };  

        const { result } = renderHook(() =>  
            useDirectedRules({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.modifyDirectedRule(directedRulesId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: DirectedRule not found"]);
            }
        }); 
    });

    it('delete directed rules data successfully', async () => {  
        const directedRulesId: number = 1;
        vi.fn(fetchDirectedRules).mockResolvedValueOnce(mockDirectedRulesData);  
        vi.fn(deleteDirectedRule).mockResolvedValueOnce(true);  
    
        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.directedRules).toEqual(mockDirectedRulesData);  
        }); 

        await act(async () => {  
            await result.current.removeDirectedRule(directedRulesId);  
        });  

        expect(deleteDirectedRule).toHaveBeenCalledWith(1); 
    });

    it('delete directed rules throws error on failure', async () => {  
        const directedRulesId: number = 1;
        vi.fn(fetchDirectedRules).mockResolvedValueOnce(mockDirectedRulesData);  
        vi.fn(deleteDirectedRule).mockRejectedValueOnce(new Error('Delete failed'));  

        const { result } = renderHook(() =>  
            useDirectedRules({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.directedRules).toEqual(mockDirectedRulesData);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeDirectedRule(directedRulesId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });    


    /** Directed Rules Xref Data */
    it('load directed rules xref data successfully', async () => {  
        vi.fn(fetchDirectedRulesXref).mockResolvedValueOnce(mockDirectedRulesXrefData);  

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );  

        await waitFor(() => {  
            expect(result.current.directedRulesXref).toEqual(mockDirectedRulesXrefData);  
        });  

        expect(fetchDirectedRulesXref).toHaveBeenCalledTimes(1);  
    });

    it('handle error when load directed rules xref data failed', async () => {  
        vi.fn(fetchDirectedRulesXref).mockRejectedValueOnce(  
            new Error('Failed to fetch directed rules xref data')  
        );  

        // Act  
        await act(async () => { 
            try { 
                vi.fn(fetchDirectedRulesXref).mockResolvedValueOnce([]);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Failed to fetch directed rules xref data');
            }
        });
    });

    it('insert directed rules xref data successfully', async () => {  
        vi.fn(fetchDirectedRulesXref).mockResolvedValueOnce([]);  
        const newItem: RequestMaintenanceDirectedRulesXref = { directedRulesId: 1, brokerCode: 'B001', accountCode:'A003', year:2026, lastUpdateBy: "User1", lastUpdateDt: new Date() };  

        const resultItem: MaintenanceDirectedRulesXref = { directedRulesXRefId: 3, ...newItem, lastUpdateDt: new Date()}
        vi.fn(createDirectedRuleXref).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );

        await act(async () => {          
            const created = await result.current.addDirectedRuleXref(newItem);
            expect(created).toEqual(resultItem);  
        });    

        expect(createDirectedRuleXref).toHaveBeenCalledTimes(1); 
    }); 

    it('create directed rules xref throws error on insert fails', async () => {  
        vi.fn(fetchDirectedRulesXref).mockResolvedValueOnce(mockDirectedRulesXrefData);  
        vi.fn(createDirectedRuleXref).mockRejectedValueOnce(new Error('Insert failed'));  
        const newItem: RequestMaintenanceDirectedRulesXref = { directedRulesId: 1, brokerCode: 'B001', accountCode:'A003', year:2026, lastUpdateBy: "User1", lastUpdateDt: new Date() }; 

        const { result } = renderHook(() =>  
            useDirectedRules({ userInfo })  
        );  

        await act(async () => { 
            try { 
                await result.current.addDirectedRuleXref(newItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Insert failed"]);
            }
        }); 
    });

    it('update directed rules xref data successfully', async () => { 
        const directedRulesXrefId:number =  1   
        const updateItem: RequestMaintenanceDirectedRulesXref = {  
          directedRulesId: 1,  
          brokerCode: 'B001',  
          accountCode: 'A001',
          year: 2026,  
          lastUpdateBy: userInfo.name??"",
          lastUpdateDt: new Date()  
        };

        const resultItem: MaintenanceDirectedRulesXref = { directedRulesXRefId: 1, ...updateItem, lastUpdateDt: new Date()}
        vi.fn(updateDirectedRuleXref).mockResolvedValueOnce(resultItem);     

        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );
        
        await act(async () => { 
            try { 
                 const updated = await result.current.modifyDirectedRuleXref(directedRulesXrefId, updateItem);
            expect(updated).toEqual(resultItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: DirectedRuleXref not found"]);
            }
        });
    }); 

    it('update directed rules xref throws error on update fail', async () => {  
        const directedRulesXrefId:number =  1 
        vi.fn(updateDirectedRuleXref).mockRejectedValueOnce(new Error('Update failed'));  
        const updateItem: RequestMaintenanceDirectedRulesXref = {  
          directedRulesId: 1,  
          brokerCode: 'B001',  
          accountCode: 'A001',
          year: 2026,  
          lastUpdateBy: userInfo.name??"",
          lastUpdateDt: new Date()  
        };

        const { result } = renderHook(() =>  
            useDirectedRules({ userInfo })  
        );          

        await act(async () => { 
            try { 
                await result.current.modifyDirectedRuleXref(directedRulesXrefId, updateItem);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBeOneOf(["Error: Update failed","Error: DirectedRuleXref not found"]);
            }
        }); 
    });     

    it('delete directed rules xref data successfully', async () => {  
        const directedRulesXrefId: number = 1;
        vi.fn(fetchDirectedRulesXref).mockResolvedValueOnce(mockDirectedRulesXrefData);  
        vi.fn(deleteDirectedRuleXref).mockResolvedValueOnce(true);  
    
        const { result } = renderHook(() =>  
            useDirectedRules({userInfo})  
        );

        await waitFor(() => {  
            expect(result.current.directedRulesXref).toEqual(mockDirectedRulesXrefData);  
        }); 

        await act(async () => {  
            await result.current.removeDirectedRuleXref(directedRulesXrefId);  
        });  

        expect(deleteDirectedRuleXref).toHaveBeenCalledWith(1); 
    });

    it('delete directed rules xref throws error on failure', async () => {  
        const directedRulesXrefId: number = 1;
        vi.fn(fetchDirectedRulesXref).mockResolvedValueOnce(mockDirectedRulesXrefData);  
        vi.fn(deleteDirectedRuleXref).mockRejectedValueOnce(new Error('Delete failed'));  

        const { result } = renderHook(() =>  
            useDirectedRules({ userInfo })  
        );  

        await waitFor(() => {  
            expect(result.current.directedRulesXref).toEqual(mockDirectedRulesXrefData);  
        });  

        await act(async () => { 
            try { 
                await result.current.removeDirectedRuleXref(directedRulesXrefId);
            } catch (err) {
                expect(err).toBeInstanceOf(Error);  
                expect(String(err)).toBe('Error: Delete failed');
            }
        });  
    });    
});