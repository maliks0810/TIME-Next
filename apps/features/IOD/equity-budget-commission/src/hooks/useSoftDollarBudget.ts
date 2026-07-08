import { useState, useEffect, useCallback } from 'react';
import { NoTrailingForwardSlash } from '../utils/url-utils';
import type { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';
import { fetchBrokers } from '../services/broker-service';
import { fetchMasterBrokers } from '../services/master-broker-service';
import { fetchDepartments } from '../services/department-service';
import { fetchServices } from '../services/services-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import type { SoftDollarBudget, RequestSoftDollarBudget, BudgetService, BudgetYear } from '../datatypes/research-budget-types';
import { createSoftBudget, 
    updateSoftBudget, 
    deleteSoftBudget, 
    fetchSoftDollarBudgets, 
    generateYears,    
 } from '../services/softdollar-service';
import { MaintenanceBroker, MaintenanceDepartment, MaintenanceMasterBroker, MaintenanceUser } from '../datatypes/budget-maintenance-types';

interface UseSoftDollarBudgetsProps {
    userInfo: UserInfo;
    budgetYear: number;
}

export function useSoftDollarBudgets({ userInfo, budgetYear }: UseSoftDollarBudgetsProps) {
    const [softBudgetData, setSoftBudgetData] = useState<SoftDollarBudget[]>([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<MaintenanceDepartment[]>([]);
    const [brokers, setBrokers] = useState<MaintenanceBroker[]>([]);
    const [mstBrokers, setMstBrokers] = useState<MaintenanceMasterBroker[]>([]);
    const [services, setServices] = useState<BudgetService[]>([]);
    const [budgetYears, setBudgetYears] = useState<BudgetYear[]>();
    const currentYear = new Date().getFullYear();
    const [adminData, setAdminData] = useState<MaintenanceUser[]>([]);

    const isAdmin = Array.isArray(adminData) && userInfo?.name
        ? adminData.some(a => `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() === userInfo.name)
        : false;

    // Construct the endpoint URL  
    const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);  
    const apiEndPoint = `${apiBaseUrl}/soft-dollar-budget`;  

    const loadSoftDollarBudgetData = useCallback(async () => {  
        // If budgetYear is 0 or otherwise invalid, clear data  
        if (!budgetYear) {  
            setSoftBudgetData([]);  
            return;  
        }  
        setLoading(true);  

        try {                 
            const [budgetData, deptData, brokerData, mstBrokerData, serviceData, bYears] = await Promise.all([
                fetchSoftDollarBudgets(budgetYear),  
                fetchDepartments(),
                fetchBrokers(),
                fetchMasterBrokers(),
                fetchServices(),
                generateYears(2000, currentYear)
            ]);
            
            setSoftBudgetData(budgetData); 
            setSoftBudgetData(prev =>  {
                if(!prev){
                    return [];
                }
                else{
                    return prev.map(p => 
                    ({ ...p, year: budgetYear }))  
                }
            }); 
            setDepartments(deptData?.filter(x=> x.divisionId??0 > 0) ?? []);
            setBrokers(brokerData?.filter(b => b.brokerType !== 'LEGACY') ?? []);
            setMstBrokers(mstBrokerData);
            setServices(serviceData);
            setBudgetYears(bYears);

        } catch (err) {  
            if (err instanceof Error) {  
                throw(err.message);  
            } else {  
                throw('error occurred while loading SoftDollarBudgets.');  
            }  
        } finally {  
            setLoading(false);  
        }  
    }, [apiEndPoint, budgetYear]);  

    // Automatically load data whenever budgetYear changes.  
      useEffect(() => {
    // initial load
        const loadAdminData = async() => {
            const adData = await fetchAdminUsers();      
                setAdminData(adData);
            };

        loadAdminData();  
        loadSoftDollarBudgetData().catch((err) => {  
            console.error('useSoftDollarBudgets load error:', err);  
        });  
    }, [loadSoftDollarBudgetData]);  

    const insertSoftDollarBudget = useCallback(  
        async (values: Partial<RequestSoftDollarBudget>) => {  
            const newReq: RequestSoftDollarBudget = {
                year: values.year ?? budgetYear,
                brokerId: values.brokerId ?? 0,
                budgetTypeId: values.budgetTypeId ?? 0,
                departmentId: values.departmentId ?? 0,
                ratio: values.ratio ?? 0,
                serviceId: values.serviceId ?? 0,
                lastUpdateBy: userInfo.name ?? ""
            }
            const newRecord = await createSoftBudget(newReq);  
            setSoftBudgetData((prev) => [...prev, newRecord]);  
            return newRecord;  
        },  
        [apiEndPoint]
    );  

    const updateSoftDollarBudget = useCallback(  
        async (key: number, 
            values: Partial<RequestSoftDollarBudget>
        ) => {
        if (!key) {  
            throw new Error('No valid ID provided for updating a SoftDollarBudget.');  
        }

        const updReq: RequestSoftDollarBudget = {
            softDollarBudgetId: key,
            year: values.year ?? budgetYear,
            brokerId: values.brokerId ?? 0,
            budgetTypeId: values.budgetTypeId ?? 0,
            departmentId: values.departmentId ?? 0,
            ratio: values.ratio ?? 0,
            serviceId: values.serviceId ?? 0,
            lastUpdateBy: userInfo.name ?? ""
        }
       
        const updatedRecord = await updateSoftBudget(updReq) ;
        setSoftBudgetData((prev) => {  
            return prev.map((item) => (item.softDollarBudgetId === key ? updatedRecord : item));  
        });  
        return updatedRecord;  
    },  
    [apiEndPoint]  
    );  

    const removeSoftDollarBudget = useCallback(  
        async (key: number) => {  
            if (!key) {  
                throw new Error('No valid ID provided for removing a SoftDollarBudget.');  
            }  
            await deleteSoftBudget(key);

            // Remove the item from local state  
            setSoftBudgetData((prev) => prev.filter((item) => item.softDollarBudgetId !== key));  
        },[apiEndPoint]  
    );       

    // Expose the data, loading, error, and CRUD methods  
    return {  
        departments,
        brokers,
        mstBrokers,
        services,
        softBudgetData,  
        budgetYears,
        loading,  
        loadSoftDollarBudgetData,            // If you need to manually refetch  
        insertSoftDollarBudget,  
        updateSoftDollarBudget,  
        removeSoftDollarBudget,  
        isAdmin,
    };  
}