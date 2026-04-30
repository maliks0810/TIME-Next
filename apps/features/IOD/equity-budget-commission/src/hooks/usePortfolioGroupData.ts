import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createPortfolioGroup,
  updatePortfolioGroup,
  deletePortfolioGroup,
  fetchPortfolioGroups,
} from '../services/portfolio-group-service';
import { fetchPortfolios } from '../services/portfolio-service';
import { fetchPortfolioGroupXrefs } from '../services/portfolio-group-xref-service';
import {
  MaintenancePortfolio,
  MaintenancePortfolioGroup,
  MaintenancePortfolioGroupXref,
  RequestMaintenancePortfolioGroup,
} from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

interface UsePortfolioGroupsProps {
  userInfo: UserInfo;
}

const normalizeActive = (status?: string) => status === 'Active' || status === 'A';

const normalizePortfolio = (p: MaintenancePortfolio): MaintenancePortfolio => ({
  ...p,
  active: normalizeActive(p.status),
});

const normalizePortfolioGroup = (g: MaintenancePortfolioGroup): MaintenancePortfolioGroup => ({
  ...g,
  active: normalizeActive(g.status),
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

export function usePortfolioGroups({ userInfo }: UsePortfolioGroupsProps) {
  const [portfolios, setPortfolios] = useState<MaintenancePortfolio[]>([]);
  const [portfolioGroups, setPortfolioGroups] = useState<MaintenancePortfolioGroup[]>([]);
  const [portfolioGroupXrefs, setPortfolioGroupXrefs] = useState<MaintenancePortfolioGroupXref[]>([]);

  // Avoid stale closure reads in async update operations
  const portfolioGroupsRef = useRef<MaintenancePortfolioGroup[]>([]);
  useEffect(() => {
    portfolioGroupsRef.current = portfolioGroups;
  }, [portfolioGroups]);

  /**
   * This is required for DataGrid onSaving to show refreshed recordset
   */
  const reload = useCallback(async () => {
    const data = await fetchPortfolioGroups();
    const normalized = (data ?? []).map(normalizePortfolioGroup);
    setPortfolioGroups(normalized);
    return data ?? [];
  }, []);

  // Initial load
  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        const [portfolioData, portGrpData, portGrpDataXref] = await Promise.all([
          fetchPortfolios(),
          fetchPortfolioGroups(),
          fetchPortfolioGroupXrefs(),
        ]);

        if (!alive) return;

        setPortfolios((portfolioData ?? []).map(normalizePortfolio));
        setPortfolioGroups((portGrpData ?? []).map(normalizePortfolioGroup));
        setPortfolioGroupXrefs(portGrpDataXref ?? []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, []);

  // Create 
  const addPortfolioGroup = useCallback(
    async (values: Partial<MaintenancePortfolioGroup>) => {
      const newReq: RequestMaintenancePortfolioGroup = {
        portfolioGroupCode: values.portfolioGroupCode ?? '',
        portfolioGroupName: values.portfolioGroupName ?? '',
        status: values.active ? 'Active' : 'Inactive',
        comment: values.comment ?? '',
        lastUpdateBy: userInfo.name ?? '',
      };

      const created = await createPortfolioGroup(newReq);
      const normalized = normalizePortfolioGroup(created);

      setPortfolioGroups(prev => upsertById(prev, normalized, 'portfolioGroupId'));
      return normalized;
    },
    [userInfo.name]
  );

  // Update 
  const modifyPortfolioGroup = useCallback(
    async (portfolioGroupId: number, values: Partial<MaintenancePortfolioGroup>) => {
      const prev = portfolioGroupsRef.current.find(d => d.portfolioGroupId === portfolioGroupId);
      if (!prev) throw new Error('Portfolio Group not found');

      const updatedReq: RequestMaintenancePortfolioGroup = {
        portfolioGroupCode: values.portfolioGroupCode ?? prev.portfolioGroupCode,
        portfolioGroupName: values.portfolioGroupName ?? prev.portfolioGroupName,
        comment: values.comment ?? prev.comment,
        status:
          values.active !== undefined
            ? (values.active ? 'Active' : 'Inactive')
            : (prev.status ?? 'Active'),
        lastUpdateBy: userInfo.name ?? prev.lastUpdateBy,
      };

      const updated = await updatePortfolioGroup(portfolioGroupId, updatedReq);
      const normalized = normalizePortfolioGroup(updated);

      setPortfolioGroups(prevList =>
        prevList.map(item => (item.portfolioGroupId === portfolioGroupId ? normalized : item))
      );

      return normalized;
    },
    [userInfo.name]
  );

  // Remove 
  const removePortfolioGroup = useCallback(async (portfolioGroupId: number) => {
    await deletePortfolioGroup(portfolioGroupId);
    setPortfolioGroups(prevList => prevList.filter(item => item.portfolioGroupId !== portfolioGroupId));
  }, []);

  return {
    portfolios,
    portfolioGroups,
    portfolioGroupXrefs,
    reload,

    addPortfolioGroup,
    modifyPortfolioGroup,
    removePortfolioGroup,
  };
}
