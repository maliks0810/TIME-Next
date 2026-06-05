import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ResearchBudget, RequestResearchBudget, BudgetYear } from '../datatypes/research-budget-types';
import { fetchResearchBudgets, generateYears,  createResearchBudgets, fetchAllBudgetYears    
 } from '../services/annual-research-budget-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info'; 

interface UseResearchBudgetsProps {
    userInfo: UserInfo;
    budgetYear: number;
    forYear: number;
}

export function useResearchBudgets({ userInfo, budgetYear, forYear }: UseResearchBudgetsProps) {
    const [researchBudgets, setResearchBudgets] = useState<ResearchBudget[]>([]);
    const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);  
    const [uniqueYears, setUniqueYears] = useState<number[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() =>{
        const loadData = async () => {  
            try {  
                const [years, uniqueYrs, adminData] = await Promise.all([
                    generateYears(2000),  
                    fetchAllBudgetYears(),
                    fetchAdminUsers(),
                    
                ]);  
                setBudgetYears(years);
                setUniqueYears(uniqueYrs);
                const u = adminData?.find(a=> a.firstName+ " "+ a.lastName === userInfo.name);
                if(u){
                    setIsAdmin(true);
                }
            } catch (error) {  
                console.error('Error loading data:', error);  
            }  
        };
        loadData(); 
    }, []); 

    const loadResearchBudgetData = useCallback(async () => {  
        // If budgetYear is 0 or otherwise invalid, clear data  
        if (!budgetYear) {  
            setResearchBudgets([]);  
            return;  
        }  
        setLoading(true);  

        try {                 
            const [budgetData] = await Promise.all([
                fetchResearchBudgets(budgetYear),  
            ]);    
            setResearchBudgets(budgetData);            
            setSelectedRowKeys(budgetData.map(d=> d.composite_Id??"0"));
        } catch (err) {  
            if (err instanceof Error) {  
                throw(err.message);  
            } else {  
                throw('Error occurred while loading research budget.');  
            }  
        } finally {  
            setLoading(false);  
        }  
    }, [budgetYear]);

    const insertResearchBudgets = useCallback(  
        async (values: RequestResearchBudget[]) => {  
            try{
                const newReq: RequestResearchBudget[] = values;
                newReq.map(x=> x.budgetYear = forYear);
                const newRecords = await createResearchBudgets(newReq);  
                return newRecords;  
            }
            catch(err){
                if (err instanceof Error) {  
                    throw(err.message);  
                } else {  
                    throw('Error occurred while saving Annual research budgets.');  
                } 
            }
    },[]); 

    const onClearBudgetsClick = useCallback(() => {  
        setResearchBudgets(prev =>  
            prev.map(p => 
            ({ ...p, quarterOne: 0, quarterTwo: 0, quarterThree: 0, quarterFour: 0, }))  
        );  
    }, []); 

    const onSelectionChanged = useCallback((selectedKeys: string[]) => {  
        setSelectedRowKeys(selectedKeys);  
    }, []);      

    function onAddNewRecord(newItem:RequestResearchBudget) {
        //unique id for newly added row
        const newEntry: ResearchBudget = {composite_Id: uuidv4(), ...newItem }

        setResearchBudgets(prev => [newEntry, ...prev]);
        setSelectedRowKeys(prev => [...prev, newEntry.composite_Id]);
    }
    function onBudgetQuarterValueChange(key:string, data:RequestResearchBudget) {  
        // key is the composite_Id, “data” is an object of changed fields  
        setResearchBudgets(prev => {  
            return prev.map(item => {  
                if (item.composite_Id === key) {
                    return { ...item, ...data };  
                }  
                return item;  
            });  
        });  
    } 

    return {
        loading,
        researchBudgets,
        budgetYears,
        selectedRowKeys,
        uniqueYears,
        loadResearchBudgetData,
        insertResearchBudgets,
        onClearBudgetsClick,
        onSelectionChanged,
        onAddNewRecord,
        onBudgetQuarterValueChange,
        isAdmin
    };
};