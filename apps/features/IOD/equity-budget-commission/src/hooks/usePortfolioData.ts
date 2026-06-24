import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortfolio, updatePortfolio, deletePortfolio, fetchPortfolios } from '../services/portfolio-service';
import { fetchDivisions } from '../services/division-service';
import { fetchDepartments } from '../services/department-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import { fetchPortfolioGroups } from '../services/portfolio-group-service';
import {
  fetchPortfolioGroupXrefs,
  createPortfolioGroupXref,
  updatePortfolioGroupXref,
  deletePortfolioGroupXref,
} from '../services/portfolio-group-xref-service';

import {
  MaintenanceDepartment,
  MaintenanceDivision,
  MaintenancePortfolio,
  MaintenancePortfolioGroup,
  MaintenancePortfolioGroupXref,
  RequestMaintenancePortfolio,
  RequestMaintenancePortfolioGroupXref,
} from '../datatypes/budget-maintenance-types';

import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

interface UsePortfoliosProps {
  userInfo: UserInfo;
}

const normalizePortfolio = (p: MaintenancePortfolio): MaintenancePortfolio => ({
  ...p,
  // supports "Active"/"Inactive" (and optionally A/I if your API ever uses it)
  active: p.status === 'Active' || p.status === 'A',
});

const upsertById = <T, K extends keyof T>(list: T[], item: T, key: K) => {
  const idx = list.findIndex(x => x[key] === item[key]);
  if (idx >= 0) {
    const copy = list.slice();
    copy[idx] = item;
    return copy;
  }
  return [...list, item];
};

export function usePortfolios({ userInfo }: UsePortfoliosProps) {
  const [portfolios, setPortfolios] = useState<MaintenancePortfolio[]>([]);
  const [divisions, setDivisions] = useState<MaintenanceDivision[]>([]);
  const [departments, setDepartments] = useState<MaintenanceDepartment[]>([]);
  const [portfolioGroups, setPortfolioGroups] = useState<MaintenancePortfolioGroup[]>([]);
  const [portfolioGroupXrefs, setPortfolioGroupXrefs] = useState<MaintenancePortfolioGroupXref[]>([]);
  const [isAdmin,setIsAdmin] = useState<boolean>(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number>();

  // Keep latest state refs to avoid stale closure reads in async calls
  const portfoliosRef = useRef<MaintenancePortfolio[]>([]);
  const xrefsRef = useRef<MaintenancePortfolioGroupXref[]>([]);

  useEffect(() => {
    portfoliosRef.current = portfolios;
  }, [portfolios]);

  useEffect(() => {
    xrefsRef.current = portfolioGroupXrefs;
  }, [portfolioGroupXrefs]);

  /**
   * ✅ REAL reloads: fetch + set state
   * These are what your DataGrid onSaving should call.
   */
  const reload = useCallback(async () => {
    const portfolioData = await fetchPortfolios();
    setPortfolios((portfolioData ?? []).map(normalizePortfolio));
    return portfolioData;
  }, []);

  const reloadGroupXref = useCallback(async () => {
    const allXrefData = await fetchPortfolioGroupXrefs();
    const xrefData:MaintenancePortfolioGroupXref[] = allXrefData?.filter(x=> x.portfolioId == selectedPortfolioId);
    setPortfolioGroupXrefs(xrefData?? []);
  }, [selectedPortfolioId]);

  // Initial load
  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        const [portfolioData, divData, deptData, portGrpData, adminData] = await Promise.all([
            fetchPortfolios(),
            fetchDivisions(),
            fetchDepartments(),
            fetchPortfolioGroups(),
            //fetchPortfolioGroupXrefs(),
            fetchAdminUsers(),
          ]);

          if (!alive) return;

          setPortfolios((portfolioData ?? []).map(p => ({ ...p, active: p.status === "Active" || p.status === "A" })));
          setDivisions(divData ?? []);
          setDepartments(deptData?.filter(x=> x.divisionId??0 > 0)??[]);
          setPortfolioGroups(portGrpData ?? []);
          //setPortfolioGroupXrefs(portGrpDataXref ?? []);
          const u = adminData?.find(a=> a.firstName+ " "+ a.lastName === userInfo.name);
          if(u){
              setIsAdmin(true);
          }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, []);

  // --- Portfolio CRUD ---

  const addPortfolio = useCallback(
    async (values: Partial<MaintenancePortfolio>) => {
      const newReq: RequestMaintenancePortfolio = {
        portfolioCode: values.portfolioCode ?? '',
        portfolioName: values.portfolioName ?? '',
        portfolioNumber: values.portfolioNumber ?? '',
        portfolioGroupId: values.portfolioGroupId ?? 0,
        status: values.active ? 'Active' : 'Inactive',
        departmentId: values.departmentId ?? 0,
        departmentName: values.departmentName ?? '',
        divisionId: values.divisionId ?? 0,
        divisionName: values.divisionName ?? '',
        lastUpdateBy: userInfo.name ?? '',
      };

      const created = await createPortfolio(newReq);
      const normalized = normalizePortfolio(created);

      // ✅ upsert prevents dupes if overlap occurs
      setPortfolios(prev => upsertById(prev, normalized, 'portfolioId'));
      return normalized;
    },
    [userInfo.name]
  );

  const modifyPortfolio = useCallback(
    async (portfolioId: number, values: Partial<MaintenancePortfolio>) => {
      const prev = portfoliosRef.current.find(d => d.portfolioId === portfolioId);
      if (!prev) throw new Error('portfolio not found');

      const updatedReq: RequestMaintenancePortfolio = {
        portfolioCode: values.portfolioCode ?? prev.portfolioCode,
        portfolioNumber: values.portfolioNumber ?? prev.portfolioNumber,
        portfolioName: values.portfolioName ?? prev.portfolioName,
        portfolioGroupId: values.portfolioGroupId ?? prev.portfolioGroupId,
        divisionId: values.divisionId ?? prev.divisionId,
        divisionName: values.divisionName ?? prev.divisionName,
        departmentId: values.departmentId ?? prev.departmentId,
        departmentName: values.departmentName ?? prev.departmentName,
        status:
          values.active !== undefined
            ? (values.active ? 'Active' : 'Inactive')
            : (prev.status ?? 'Active'),
        lastUpdateBy: userInfo.name ?? prev.lastUpdateBy,
      };

      const updated = await updatePortfolio(portfolioId, updatedReq);
      const normalized = normalizePortfolio(updated);

      setPortfolios(prevList =>
        prevList.map(item => (item.portfolioId === portfolioId ? normalized : item))
      );

      return normalized;
    },
    [userInfo.name]
  );

  const removePortfolio = useCallback(async (portfolioId: number) => {
    await deletePortfolio(portfolioId);
    setPortfolios(prevList => prevList.filter(item => item.portfolioId !== portfolioId));
  }, []);

  const onSelectionChanged = async (selectedKeys: number[]) => {
    const key: number = selectedKeys[0];
    setSelectedPortfolioId(key);
  }
  // --- Portfolio Group Xref CRUD ---
  useEffect(() => { 
    void (async () => {
      if (selectedPortfolioId) {
        await reloadGroupXref();
      } else {
        setPortfolioGroupXrefs([]);
      }
    })();
  }, [selectedPortfolioId, reloadGroupXref]);

  const addPortfolioGroupXref = useCallback(
    async (values: Partial<MaintenancePortfolioGroupXref>) => {
      const newReq: RequestMaintenancePortfolioGroupXref = {
        portfolioGroupId: values.portfolioGroupId ?? 0,
        portfolioId: values.portfolioId ?? 0,
        lastUpdateBy: userInfo.name ?? '',
      };

      const created = await createPortfolioGroupXref(newReq);

      // ✅ upsert (by xref id) to prevent duplicates
      setPortfolioGroupXrefs(prev => upsertById(prev, created, 'portfolioGroupXrefId'));
      return created;
    },
    [userInfo.name]
  );

  const modifyPortfolioGroupXref = useCallback(
    async (portfolioGroupXrefId: number, values: Partial<MaintenancePortfolioGroupXref>) => {
      const prev = xrefsRef.current.find(d => d.portfolioGroupXrefId === portfolioGroupXrefId);
      if (!prev) throw new Error('Portfolio Group Xref not found');

      const updatedReq: RequestMaintenancePortfolioGroupXref = {
        portfolioGroupId: values.portfolioGroupId ?? prev.portfolioGroupId,
        portfolioId: values.portfolioId ?? prev.portfolioId,
        lastUpdateBy: userInfo.name ?? prev.lastUpdateBy,
      };

      const updated = await updatePortfolioGroupXref(portfolioGroupXrefId, updatedReq);

      setPortfolioGroupXrefs(prevList =>
        prevList.map(item => (item.portfolioGroupXrefId === portfolioGroupXrefId ? updated : item))
      );

      return updated;
    },
    [userInfo.name]
  );

  const removePortfolioGroupXref = useCallback(async (portfolioGroupXrefId: number) => {
    await deletePortfolioGroupXref(portfolioGroupXrefId);

    // ✅ FIXED BUG: you were comparing/filtering portfolioGroupId instead of portfolioGroupXrefId
    setPortfolioGroupXrefs(prevList =>
      prevList.filter(item => item.portfolioGroupXrefId !== portfolioGroupXrefId)
    );
  }, []);

  return {
    portfolios,
    divisions,
    departments,
    portfolioGroups,
    portfolioGroupXrefs,

    // ✅ these now update state (required for onSaving)
    reload,
    reloadGroupXref,
    onSelectionChanged,
    selectedPortfolioId,

    addPortfolio,
    modifyPortfolio,
    removePortfolio,

    addPortfolioGroupXref,
    modifyPortfolioGroupXref,
    removePortfolioGroupXref,
    isAdmin
  };
}