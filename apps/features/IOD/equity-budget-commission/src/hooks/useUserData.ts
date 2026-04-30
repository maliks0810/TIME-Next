import { useEffect, useState } from 'react';
import { createUser, updateUser, deleteUser, fetchUsers, fetchDepartments, fetchDivisions, fetchLocations } from '../services/user-service';
import { MaintenanceDepartment, MaintenanceDivision, MaintenanceLocation, MaintenanceUser, RequestMaintenanceUser } from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info'; 

interface UseUsersProps {
    userInfo: UserInfo;
}

export function useUsers({ userInfo }: UseUsersProps) {
    const [divisions, setDivisions] = useState<MaintenanceDivision[]>([]);
    const [departments, setDepartments] = useState<MaintenanceDepartment[]>([]);
    const [locations, setLocations] = useState<MaintenanceLocation[]>([]);
    const [users, setUsers] = useState<MaintenanceUser[]>([]);

    // Load data  
    useEffect(() => {  
        const loadData = async () => {  
            try {  
            const [divData, deptData, locData, userData] = await Promise.all([  
                fetchDivisions(),  
                fetchDepartments(),  
                fetchLocations(),
                fetchUsers()
            ]);  
            setDivisions(divData);
            setDepartments(deptData);
            setLocations(locData);
            setUsers(userData);
            setUsers(prev =>  {
                if(!prev){
                    return [];
                }
                else{
                    return prev.map(p => 
                    ({ ...p, active: (p.status === "Active"?true:false), }))  
                }
            });

            } catch (error) {  
                console.error('Error loading data:', error);  
            }  
        };  
        loadData();  
    }, []);  

    // Create  
    const addUser = async (values: Partial<MaintenanceUser>) => {  
        try {  
            const fname:string = values['firstName']!= undefined?values['firstName']:"";
            const lname:string = values['lastName']!= undefined?values['lastName']:"";

            const newReq: RequestMaintenanceUser = {  
                firstName: fname,
                lastName: lname,
                userName: lname+","+fname,
                coopDptCode: values['coopDptCode']!= undefined?values['coopDptCode']:0,
                coopStaffCode: values['coopStaffCode']!= undefined?values['coopStaffCode']:0,
                costCenterCode: values['costCenterCode']!= undefined?values['costCenterCode']:"",
                departmentId: values['departmentId']!= undefined?values['departmentId']:0,
                divisionId: values['divisionId']!= undefined?values['divisionId']:0,
                startDate: values['startDate']!= undefined?values['startDate']:"",
                endDate: values['endDate']!= undefined?values['endDate']:"",
                status: values['active']!= undefined? values['active']?"Active":"Inactive":"Inactive",
                jobCode: values['jobCode']!= undefined?values['jobCode']:"",
                locationCode: values['locationCode']!= undefined?values['locationCode']:"",
                lastUpdateBy: userInfo?.name??""  
            };  
            const newUser = await createUser(newReq);  
            setUsers((prev) => [...prev, newUser]);  
            return newUser;  
        } catch (error) {  
            throw error;
        }  
    };  

    // Update  
    const modifyUser = async (  
    userId: number,  
    values: Partial<MaintenanceUser>  
    ) => {  
    try {  
        const prev = users.find((d) => d.userId === userId);  
        if (!prev) 
            throw new Error('User not found');  

        const updatedReq: RequestMaintenanceUser = {  
            userId: userId,
            firstName: values['firstName']!= undefined?values['firstName']:prev?.firstName??"",
            lastName: values['lastName']!= undefined?values['lastName']:prev?.lastName??"",
            userName: values['lastName']!= undefined?values['lastName']:prev?.lastName??"" + "," + values['firstName']!= undefined?values['firstName']:prev?.firstName??"",
            coopDptCode: values['coopDptCode']!= undefined?values['coopDptCode']:prev?.coopDptCode?? 0,
            coopStaffCode: values['coopStaffCode']!= undefined?values['coopStaffCode']:prev?.coopStaffCode??0,
            costCenterCode: values['costCenterCode']!= undefined?values['costCenterCode']:prev?.costCenterCode??"",
            departmentId: values['departmentId']!= undefined?values['departmentId']:prev?.departmentId?? 0,
            divisionId: values['divisionId']!= undefined?values['divisionId']:prev?.divisionId?? 0,
            startDate: values['startDate']!= undefined?values['startDate']:prev?.startDate?? "",
            endDate: values['endDate']!= undefined?values['endDate']:prev?.endDate?? "",
            status: values['active']!= undefined?values['active']?"Active":"Inactive":prev?.status?? "Inactive",
            jobCode: values['jobCode']!= undefined?values['jobCode']:prev?.jobCode?? "",
            locationCode: values['locationCode']!= undefined?values['locationCode']:prev?.locationCode?? "",
            lastUpdateBy: userInfo?.name??"",
        };  
        const updated = await updateUser(userId, updatedReq);  
        setUsers((prevList) =>  
            prevList.map((item) => (item.userId === userId ? updated : item))  
        );  
        return updated;  
    } catch (error) {  
        throw error;  
    }  
    };  

    // Remove  
    const removeUser = async (userId: number) => {
    try {  
        await deleteUser(userId);  
        setUsers((prevList) =>  
            prevList.findIndex(x=> x.userId === userId) >= 0? prevList.filter((item) => item.userId !== userId): prevList
        );
    } catch (error) {  
        throw error;  
    }  
    };  

    return {  
        users,
        divisions,
        departments,
        locations,
        reload:fetchUsers,
        addUser,  
        modifyUser,  
        removeUser,  
    };  
}