import { useState, useEffect, useCallback } from 'react';
import type { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';
import type { SoftDollarBudgetDetail,
    SoftDollarBudgetAccount, RequestSoftDollarBudgetAccount,
    SoftDollarBudgetAccountUser, RequestSoftDollarBudgetAccountUser} from '../datatypes/research-budget-types';
import { 
    fetchSoftDollarBudgetDetails
 } from '../services/softdollar-service'
import { fetchSoftdollarBudgetAccounts, 
    updateSoftdollarBudgetAccount, 
    insertSoftdollarBudgetAccount,
    deleteSoftdollarBudgetAccount } from '../services/softdollar-account-service';
import { fetchUsers } from '../services/user-service';
import { MaintenanceUser } from '../datatypes/budget-maintenance-types';
import { fetchAccountUserAllocations, 
    insertAccountUserAllocation, 
    updateAccountUserAllocation, 
    deleteAccountUserAllocation } from '../services/softdollar-account-user-service';

interface UseSoftDollarBudgetsProps {
    userData: UserInfo;
    softdollarBudgetId: number;
    softdollarBudgetAccountId: number;
}

export function useSoftDollarBudgetDetails({ userData, softdollarBudgetId, softdollarBudgetAccountId }: UseSoftDollarBudgetsProps) {
    const [softBudgetDetails, setSoftBudgetDetails] = useState<SoftDollarBudgetDetail>();
    const [softBudgetAccounts, setSoftBudgetAccounts] = useState<SoftDollarBudgetAccount[]>([]);
    const [softAccountUserAllocations, setSoftAccountUserAllocations] = useState<SoftDollarBudgetAccountUser[]>([]);
    const [users, setUsers] = useState<MaintenanceUser[]>([]);
    const [isUserLoading, setIsUserLoading] = useState(false);

    useEffect(() => {
        const loadUsers = async() => {
            try {                 
                const [userData] = await Promise.all([
                    fetchUsers(),
                ]);    
                setUsers(userData);
            } catch (err) {  
                if (err instanceof Error) {  
                    throw(err.message);  
                } else {  
                    throw('Error occurred while loading users data.');  
                }  
            } 
        }
        loadUsers();
    },[]);

    const loadSoftDollarBudgetDetails = useCallback(
        async (softBudgetId: number) => {
            if (!softBudgetId) {  
                throw new Error('No valid ID provided for removing a SoftDollarBudget.');  
            } 
            const budgetDetailData = await fetchSoftDollarBudgetDetails(softBudgetId);
            if (Array.isArray(budgetDetailData)) {  
                const newDetails = budgetDetailData[0] || {};  // pick the first item, or empty  
                setSoftBudgetDetails(newDetails);
                return newDetails;
            } else {  
                const newDetails1 = budgetDetailData;   
                setSoftBudgetDetails(newDetails1);
                return newDetails1;
            }
        },[softdollarBudgetId]
    );

    const loadSoftdollarBudgetAccounts = useCallback(async (softBudgetId: number) => {
        try {
            if (!softBudgetId) {  
                throw new Error('No valid ID provided for removing a SoftDollarBudget.');  
            } 
            const [budgetAccountData] = await Promise.all([
                fetchSoftdollarBudgetAccounts(softBudgetId),  
            ]);    
            setSoftBudgetAccounts(budgetAccountData);  
        } catch (error) {
            throw error;
        }
    },[softdollarBudgetId]);

    // Create  
    const createSoftdollarBudgetAccount = useCallback(async (values: Partial<SoftDollarBudgetAccount>) => {  
        try {  
            const newReq:RequestSoftDollarBudgetAccount = { 
                softDollarBudgetId: values.softDollarBudgetId ?? softdollarBudgetId,
                account: values.account ?? "",
                divisionId: values.divisionId,
                departmentId: values.departmentId ?? 0,
                comments: "Inserted from Budgets App",
                cost: values.cost ?? 0,
                startDate: values.startDate ?? new Date(),
                endDate: values.endDate ?? new Date(),
                status: values.status ?? "A",
                softDollar: values.softDollar ?? 0,
                year: values.year ?? 0,
                lastUpdateBy: userData.name ?? ""
            };  

            const newSoftAccount:SoftDollarBudgetAccount = await insertSoftdollarBudgetAccount(newReq);
            //const accounts = await fetchSoftdollarBudgetAccounts(softdollarBudgetId);
            setSoftBudgetAccounts((prev) => [...prev, newSoftAccount]);  
            return newSoftAccount;  
        } catch (error) {  
            throw error;
        }  
    },[softdollarBudgetId, loadSoftDollarBudgetDetails]);

    const modifySoftdollarBudgetAccount = useCallback(async  (softdollarBudgetAccountId:number, values: Partial<SoftDollarBudgetAccount>) => {
        try {  
            const prev = softBudgetAccounts.find((d) => d.softDollarBudgetAccountId === softdollarBudgetAccountId);  
            if (!prev) 
                throw new Error('Softdollar Budget Account not found');  

            const updateReq:RequestSoftDollarBudgetAccount = { 
                softDollarBudgetId: softdollarBudgetId,
                account: values.account ?? prev.account,
                divisionId: values.divisionId ?? prev.divisionId,
                departmentId: values.departmentId ?? prev.departmentId,
                comments: "Updated from Budgets App",
                cost: values.cost ?? prev.cost,
                startDate: values.startDate ?? prev.startDate,
                endDate: values.endDate ?? prev.endDate,
                status: values.status ?? prev.status,
                softDollar: values.softDollar ?? prev.softDollar,
                year: values.year ?? prev.year,
                lastUpdateBy: userData.name ?? ""
            };  

            const updatedSoftAccount:SoftDollarBudgetAccount = await updateSoftdollarBudgetAccount(softdollarBudgetAccountId, updateReq);  
            setSoftBudgetAccounts((prev) => [...prev, updatedSoftAccount]);  
            return updatedSoftAccount;  
        } catch (error) {  
            throw error;
        }
    },[softBudgetAccounts, softdollarBudgetAccountId, softdollarBudgetId,loadSoftDollarBudgetDetails]);

    const removeSoftdollarBudgetAccount = useCallback( async  (softdollarBudgetAccountId: number) => {
        try {  
            await deleteSoftdollarBudgetAccount(softdollarBudgetAccountId);  
            setSoftBudgetAccounts((prev) =>  
                prev.findIndex(x=> x.softDollarBudgetAccountId === softdollarBudgetAccountId) >= 0? prev.filter((item) => item.softDollarBudgetAccountId !== softdollarBudgetAccountId): prev
            );
        } catch (error) {  
            throw error;  
        } 
    },[softBudgetAccounts, loadSoftDollarBudgetDetails]);
        
    const loadSoftAccountUserAllocations = useCallback(async (softBudgetAccountId: number) => {  
        // If budgetYear is 0 or otherwise invalid, clear data  
        if (!softBudgetAccountId) {  
            setSoftAccountUserAllocations([]);  
            return;  
        }  
        setIsUserLoading(true);  

        try {                 
            const [userAllocData] = await Promise.all([
                fetchAccountUserAllocations(softBudgetAccountId),
            ]);    
            setSoftAccountUserAllocations(userAllocData);  
        } catch (err) {  
            if (err instanceof Error) {  
                throw(err.message);  
            } else {  
                throw('Error occurred while loading user allocations data.');  
            }  
        } finally {  
            setIsUserLoading(false);  
        }  
    }, []);  

    const clearSoftAccountUserAllocationData = useCallback(() => {
        setSoftAccountUserAllocations([]);  
    }, []);

    // Create  
    const createSoftAccountUserAllocation = useCallback(async (values: Partial<SoftDollarBudgetAccountUser>) => {  
        try {  
            const newReq:RequestSoftDollarBudgetAccountUser = { 
                softDollarBudgetAccountId: values.softDollarBudgetAccountId ?? softdollarBudgetAccountId,
                userId: values.userId ?? 0,
                budgetYear: values.budgetYear ?? 0,
                departmentId: values.departmentId ?? 0,
                budgetState: "",
                coopStaffCode: "",
                totalCost: values.totalCost ?? 0,
                startDate: values.startDate ?? new Date(),
                endDate: values.endDate ?? new Date(),
                userStatus: values.userStatus ?? "Active",
                commission: values.commission ?? 0,
                serviceId: values.serviceId ?? 0,
                lastUpdateBy: userData.name ??""
            };  
            
            const newSoftAccountUser:SoftDollarBudgetAccountUser = await insertAccountUserAllocation(newReq);  
            var allUserAllocations = await fetchAccountUserAllocations(softdollarBudgetAccountId)
            setSoftAccountUserAllocations(allUserAllocations);  
            return newSoftAccountUser;  
        } catch (error) {  
            throw error;
        }  
    },[softAccountUserAllocations, loadSoftDollarBudgetDetails, loadSoftdollarBudgetAccounts]);

    const modifySoftAccountUserAllocation = useCallback(async  (userAllocationId:number, values: Partial<SoftDollarBudgetAccountUser>) => {
        try {  
            const prev = softAccountUserAllocations.find((d) => d.userAllocationId === userAllocationId);  
            if (!prev) 
                throw new Error('Softdollar Budget Account User not found');      
            
            const updateReq:RequestSoftDollarBudgetAccountUser = { 
                softDollarBudgetAccountId: softdollarBudgetAccountId,
                userId: values.userId ?? prev.userId,
                budgetYear: values.budgetYear ?? prev.budgetYear,
                departmentId: values.departmentId ?? prev.departmentId,
                budgetState: "",
                coopStaffCode: "",
                totalCost: values.totalCost ?? prev.totalCost,
                startDate: values.startDate ?? prev.startDate,
                endDate: values.endDate ?? prev.endDate,
                userStatus: values.userStatus ?? prev.userStatus,
                commission: values.commission ?? prev.commission,
                serviceId: values.serviceId ?? prev.serviceId,
                lastUpdateBy: userData.name ??""
            };  
            const softUserAlloc:SoftDollarBudgetAccountUser = {
                userAllocationId: userAllocationId, 
                departmentName:prev.departmentName,
                softDollarBudgetId: prev.softDollarBudgetId,
                userName: prev.userName,  
                ratio: prev.ratio,              
                ...updateReq
            };

            const updatedUserAllocation:SoftDollarBudgetAccountUser = await updateAccountUserAllocation(userAllocationId, updateReq);  
            setSoftAccountUserAllocations((prev) => 
                prev.map((item) => 
                    (item.userAllocationId === userAllocationId? softUserAlloc : item)));  
            return updatedUserAllocation;  
        } catch (error) {  
            throw error;
        }
    },[softAccountUserAllocations,softdollarBudgetAccountId,softBudgetDetails, softBudgetAccounts]);

    const removeSoftAccountUserAllocation = useCallback(async  (userAllocationId: number) => {
        try {  
            await deleteAccountUserAllocation(userAllocationId);  
            setSoftAccountUserAllocations((prev) =>  
                prev.findIndex(p=> p.userAllocationId === userAllocationId) >= 0? prev.filter((item) => item.userAllocationId !== userAllocationId): prev
            );
        } catch (error) {  
            throw error;  
        } 
    },[loadSoftDollarBudgetDetails, loadSoftdollarBudgetAccounts, loadSoftAccountUserAllocations]);
    // Expose the data, loading, error, and CRUD methods  
    return {  
        isUserLoading,
        //Data
        softBudgetDetails,
        softBudgetAccounts,
        softAccountUserAllocations,
        users,
        //Callable methods
        loadSoftDollarBudgetDetails,
        reloadSoftBudgetDetails: fetchSoftDollarBudgetDetails,
        loadSoftdollarBudgetAccounts,
        createSoftdollarBudgetAccount,
        modifySoftdollarBudgetAccount,
        removeSoftdollarBudgetAccount,
        loadSoftAccountUserAllocations,
        createSoftAccountUserAllocation,
        modifySoftAccountUserAllocation,
        removeSoftAccountUserAllocation,
        clearSoftAccountUserAllocationData,
        reloadUserAllocations: fetchAccountUserAllocations
    };  
}