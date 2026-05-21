import { useEffect, useState, useCallback } from 'react';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchDivisions
} from '../services/department-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import {
  MaintenanceDepartment,
  MaintenanceDivision,
  RequestMaintenanceDepartment
} from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

interface UseDepartmentsProps {
  userInfo: UserInfo;
}

export function useDepartments({ userInfo }: UseDepartmentsProps) {
  const [departments, setDepartments] = useState<MaintenanceDepartment[]>([]);
  const [divisions, setDivisions] = useState<MaintenanceDivision[]>([]);
  const [isAdmin,setIsAdmin] = useState<boolean>(false);

  /** Normalize once */
  
  const normalizeDepartments = useCallback(
    (items: MaintenanceDepartment[] | undefined) =>
      (items ?? []).map(d => ({
        ...d,
        active: d.status === 'Active',
      })),
    []
  );


  /** ✅ REAL reload (replaces state, never appends) */
  const reload = useCallback(async () => {
    const [deptData, divisionData] = await Promise.all([
      fetchDepartments(),
      fetchDivisions(),
    ]);

    setDepartments(normalizeDepartments(deptData));
    setDivisions(divisionData);
  }, [normalizeDepartments]);

  /** Initial load */
  useEffect(() => {
    const loadAdminData = async() => {
      const [adminData] = await Promise.all([
        fetchAdminUsers()
      ]);
      const u = adminData?.find(a=> a.firstName+ " "+ a.lastName === userInfo.name);
      if(u){
        setIsAdmin(true);
      }
    };
    loadAdminData();
    void reload();
  }, [reload]);

  /** ✅ Create – NO local setState */
  const addDepartment = useCallback(
    async (values: Partial<MaintenanceDepartment>) => {
      const req = {
        departmentName: values.departmentName,
        divisionId: values.divisionId,
        status: values.active ? 'Active' : 'Inactive',
        lastUpdateBy: userInfo.name,
      };

      return await createDepartment(req);
    },
    [userInfo.name]
  );

  /** ✅ Update – NO local setState */
  const modifyDepartment = useCallback(
    async (departmentId: number, values: Partial<MaintenanceDepartment>) => {
      const prev = departments.find(d => d.departmentId === departmentId);
      if (!prev) throw new Error('Department not found');

      const req: RequestMaintenanceDepartment = {
        departmentName: values.departmentName ?? prev.departmentName,
        divisionId: values.divisionId ?? prev.divisionId,
        status:
          values.active !== undefined
            ? values.active ? 'Active' : 'Inactive'
            : prev.status ?? 'Active',
        lastUpdateBy: userInfo.name,
      };

      return await updateDepartment(departmentId, req);
    },
    [departments, userInfo.name]
  );

  /** ✅ Remove – NO local filter */
  const removeDepartment = useCallback(async (departmentId: number) => {
    await deleteDepartment(departmentId);
  }, []);

  return {
    departments,
    divisions,
    reload,            // ✅ working reload
    addDepartment,
    modifyDepartment,
    removeDepartment,
    isAdmin
  };
}
