import { useEffect, useState } from 'react';
import { createMasterBroker, updateMasterBroker, deleteMasterBroker, fetchMasterBrokers, fetchAladMasterBrokers } from '../services/master-broker-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import { MaintenanceAladBroker, MaintenanceMasterBroker, RequestMaintenanceMasterBroker } from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info'; 

interface UseMasterBrokersProps {
    userInfo: UserInfo;
}

export function useMasterBrokers({ userInfo }: UseMasterBrokersProps) {
    const [masterBrokers, setMasterBrokers] = useState<MaintenanceMasterBroker[]>([]);
    const [aladMasterBrokers, setAladMasterBrokers] = useState<MaintenanceAladBroker[]>([]);
    const [isAdmin,setIsAdmin] = useState<boolean>(false);

    // Load data  
    useEffect(() => {  
        const loadData = async () => {  
            try {  
            const [mBrokerData, aldBrokerData, adminData] = await Promise.all([  
                fetchMasterBrokers(),  
                fetchAladMasterBrokers(),  
                fetchAdminUsers(),
            ]);  
            setMasterBrokers(mBrokerData);  
            setMasterBrokers(prev => { 
                if(!prev){
                    return [];
                }
                else{
                    return prev.map(p => 
                    ({ ...p, active: (p.status === "Active"?true:false), }))
                }
            });
            setAladMasterBrokers(aldBrokerData);  
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

    // Create  
    const addMasterBroker = async (values: Partial<MaintenanceMasterBroker>) => {  
        try {  
            const newReq:RequestMaintenanceMasterBroker = {  
                masterBrokerId: values.masterBrokerId ?? "",  
                masterBrokerCode: values.masterBrokerCode??"",  
                masterBrokerName: values.masterBrokerName??"",  
                status: values.active ? 'Active' : 'Inactive',  
                lastUpdateBy: userInfo.name,  
            };  
            const newMBrker = await createMasterBroker(newReq);  
            setMasterBrokers((prev) => [...prev, newMBrker]);  
            return newMBrker;  
        } catch (error) {  
            throw error;
        }  
    };  

    // Update  
    const modifyMasterBroker = async (  
    Id: number,  
    values: Partial<MaintenanceMasterBroker>  
    ) => {  
    try {  
        const prev = masterBrokers.find((d) => d.ID === Id);  
        if (!prev) 
            throw new Error('Master Broker not found');  

        const updatedReq:RequestMaintenanceMasterBroker = {  
            masterBrokerId: values.masterBrokerId ?? prev.masterBrokerId??"",  
            masterBrokerName: values.masterBrokerName ?? prev.masterBrokerName??"",  
            masterBrokerCode: values.masterBrokerCode ?? prev.masterBrokerCode??"",  
            status: values.active !== undefined  
                ? values.active ? 'Active' : 'Inactive'  
                : prev.status??"A",  
            lastUpdateBy: userInfo.name,  
        };  
        const updated = await updateMasterBroker(Id, updatedReq);  
        setMasterBrokers((prevList) =>  
            prevList.map((item) => (item.ID === Id ? updated : item))  
        );  
        return updated;  
    } catch (error) {  
        throw error;  
    }  
    };  

    // Remove  
    const removeMasterBroker = async (Id: number) => {  
    try {  
        await deleteMasterBroker(Id);  
        setMasterBrokers((prevList) =>  
            prevList.findIndex(x=> x.ID === Id) >= 0? prevList.filter((item) => item.ID !== Id): prevList
        );
    } catch (error) {  
        throw error;  
    }  
    };  

    return {  
        masterBrokers,
        aladMasterBrokers,
        reload:fetchMasterBrokers,
        addMasterBroker,  
        modifyMasterBroker,  
        removeMasterBroker,
        isAdmin
    };  
}