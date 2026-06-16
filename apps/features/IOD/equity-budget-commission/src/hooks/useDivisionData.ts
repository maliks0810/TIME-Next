import { useEffect, useState, useCallback } from 'react';
import { createDivision, updateDivision, deleteDivision, fetchDivisions } from '../services/division-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import { MaintenanceDivision, MaintenanceUser, RequestMaintenanceDivision } from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

interface UseDivisionsProps {
  userInfo: UserInfo;
}

export function useDivisions({ userInfo }: UseDivisionsProps) {
  const [divisions, setDivisions] = useState<MaintenanceDivision[]>([]);
  const [adminData, setAdminData] = useState<MaintenanceUser[]>([]);
  const [isAdmin,setIsAdmin] = useState<boolean>(false);

  const normalize = useCallback((items: MaintenanceDivision[]) => {
    return (items ?? []).map(d => ({
      ...d,
      active: d.status === 'Active',
    }));
  }, []);

  const reload = useCallback(async () => {
    const data = await fetchDivisions();
    setDivisions(normalize(data));
    if(adminData.length > 0)
      checkAdmin(adminData);    
  }, [normalize]);

  useEffect(() => {
    // initial load
    const loadAdminData = async() => {
      const [adData] = await Promise.all([
        fetchAdminUsers()
      ]);
      
      checkAdmin(adData);
      setAdminData(adData);
    };
    loadAdminData();
    void reload();
  }, [reload]);
  
  function checkAdmin(admData: MaintenanceUser[]){
    const u = admData?.find(a=> a.firstName+ " "+ a.lastName === userInfo.name);
    if(u){
      setIsAdmin(true);
    }
  }

  // Create (no local append when using onSaving + reload)
  const addDivision = useCallback(
    async (values: Partial<MaintenanceDivision>) => {
      const req = {
        divisionName: values.divisionName,
        // Usually do NOT send divisionId on create unless your API requires it
        status: values.active ? 'Active' : 'Inactive',
        lastUpdateBy: userInfo.name,
      };

      const created = await createDivision(req);
      return created;
    },
    [userInfo.name]
  );

  // Update (no local mutate; let reload refresh)
  const modifyDivision = useCallback(
    async (divisionId: number, values: Partial<MaintenanceDivision>) => {
      const prev = divisions.find(d => d.divisionId === divisionId);
      if (!prev) throw new Error('Division not found');

      const updatedReq: RequestMaintenanceDivision = {
        divisionName: values.divisionName ?? prev.divisionName,
        status:
          values.active !== undefined
            ? values.active ? 'Active' : 'Inactive'
            : (prev.status ?? 'Active'),
        lastUpdateBy: userInfo.name,
      };

      const updated = await updateDivision(divisionId, updatedReq);
      return updated;
    },
    [divisions, userInfo.name]
  );

  // Remove (no local mutate; let reload refresh)
  const removeDivision = useCallback(async (divisionId: number) => {
    await deleteDivision(divisionId);
  }, []);

  return {
    divisions,
    reload,
    addDivision,
    modifyDivision,
    removeDivision,
    isAdmin
  };
}