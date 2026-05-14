import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchDirectedRules,
  deleteDirectedRule,
  createDirectedRule,
  updateDirectedRule,
  fetchDirectedRulesXref,
  createDirectedRuleXref,
  updateDirectedRuleXref,
  deleteDirectedRuleXref,
} from '../services/directed-rules-service';

import {
  MaintenanceBroker,
  MaintenanceDirectedRules,
  MaintenanceDirectedRulesXref,
  MaintenancePortfolio,
  RequestMaintenanceDirectedRules,
  RequestMaintenanceDirectedRulesXref,
} from '../datatypes/budget-maintenance-types';

import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';
import { fetchBrokers } from '../services/broker-service';
import { fetchPortfolios } from '../services/portfolio-service';

interface UseDirectedRulesProps {
  userInfo: UserInfo;
}

export function useDirectedRules({ userInfo }: UseDirectedRulesProps) {
  const [directedRules, setDirectedRules] = useState<MaintenanceDirectedRules[]>([]);
  const [directedRulesXref, setDirectedRulesXref] = useState<MaintenanceDirectedRulesXref[]>([]);
  const [portfolios, setPortfolios] = useState<MaintenancePortfolio[]>([]);
  const [brokers, setBrokers] = useState<MaintenanceBroker[]>([]);

  // Refs to avoid stale closure reads in async operations
  const directedRulesRef = useRef<MaintenanceDirectedRules[]>([]);
  const directedRulesXrefRef = useRef<MaintenanceDirectedRulesXref[]>([]);

  useEffect(() => {
    directedRulesRef.current = directedRules;
  }, [directedRules]);

  useEffect(() => {
    directedRulesXrefRef.current = directedRulesXref;
  }, [directedRulesXref]);

  /**
   * These are required for DataGrid onSaving to refresh the recordset.
   */
  const reloadDirectRules = useCallback(async () => {
    const data = await fetchDirectedRules();
    setDirectedRules(data ?? []);
    return data ?? [];
  }, []);

  const reloadDirectRulesXref = useCallback(async () => {
    const data = await fetchDirectedRulesXref();
    setDirectedRulesXref(data ?? []);
    return data ?? []; // important: your UI filters the returned array
  }, []);

  const reloadPortfolios = useCallback(async () => {
    const data = await fetchPortfolios();
    setPortfolios(data ?? []);
    return data ?? [];
  }, []);

  const reloadBrokers = useCallback(async () => {
    const data = await fetchBrokers();
    setBrokers(data ?? []);
    return data ?? [];
  }, []);

  // Initial load (safe defaults for tests/mocks)
  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        const [rules, xrefs, portfolioData, brokerData] = await Promise.all([
          fetchDirectedRules(),
          fetchDirectedRulesXref(),
          fetchPortfolios(),
          fetchBrokers(),
        ]);

        if (!alive) return;

        setDirectedRules(rules ?? []);
        setDirectedRulesXref(xrefs ?? []);
        setPortfolios(portfolioData ?? []);
        setBrokers(brokerData ?? []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    return () => {
      alive = false;
    };
  }, []);

  // --- Directed Rules CRUD ---

  const addDirectedRule = useCallback(
    async (values: Partial<MaintenanceDirectedRules>) => {
      const newReq: RequestMaintenanceDirectedRules = {
        directedRulesCode: values.directedRulesCode ?? '',
        directedRulesName: values.directedRulesName ?? '',
        comment: values.comment ?? '',
        budgetPercent: values.budgetPercent ?? 0,
        lastUpdateBy: userInfo.name ?? '',
      };

      const created = await createDirectedRule(newReq);
      setDirectedRules(prev => [...prev, created]);

      return created;
    },
    [userInfo.name]
  );

  const modifyDirectedRule = useCallback(
    async (directedRuleId: number, values: Partial<MaintenanceDirectedRules>) => {
      const prev = directedRulesRef.current.find(d => d.directedRulesId === directedRuleId);
      if (!prev) throw new Error('DirectedRule not found');

      const updatedReq: RequestMaintenanceDirectedRules = {
        directedRulesName: values.directedRulesName ?? prev.directedRulesName ?? '',
        directedRulesCode: values.directedRulesCode ?? prev.directedRulesCode ?? '',
        budgetPercent: values.budgetPercent ?? prev.budgetPercent ?? 0,
        comment: values.comment ?? prev.comment ?? '',
        lastUpdateBy: userInfo.name ?? '',
      };

      const updated = await updateDirectedRule(directedRuleId, updatedReq);

      setDirectedRules(prevList =>
        prevList.map(item => (item.directedRulesId === directedRuleId ? updated : item))
      );

      return updated;
    },
    [userInfo.name]
  );

  const removeDirectedRule = useCallback(async (directedRuleId: number) => {
    await deleteDirectedRule(directedRuleId);
    setDirectedRules(prevList => prevList.filter(item => item.directedRulesId !== directedRuleId));
  }, []);

  // --- Directed Rules Xref CRUD ---

  const addDirectedRuleXref = useCallback(
    async (values: Partial<MaintenanceDirectedRulesXref>) => {
      const newReq: RequestMaintenanceDirectedRulesXref = {
        brokerCode: values.brokerCode ?? '',
        accountCode: values.accountCode ?? '',
        year: values.year ?? 0,
        directedRulesId: values.directedRulesId ?? 0,
        lastUpdateBy: userInfo.name ?? '',
      };

      const created = await createDirectedRuleXref(newReq);
      setDirectedRulesXref(prev => [...prev, created]);

      return created;
    },
    [userInfo.name]
  );

  const modifyDirectedRuleXref = useCallback(
    async (directedRuleXrefId: number, values: Partial<MaintenanceDirectedRulesXref>) => {
      const prev = directedRulesXrefRef.current.find(d => d.directedRulesXRefId === directedRuleXrefId);
      if (!prev) throw new Error('DirectedRuleXref not found');

      const updatedReq: RequestMaintenanceDirectedRulesXref = {
        accountCode: values.accountCode ?? prev.accountCode,
        brokerCode: values.brokerCode ?? prev.brokerCode,
        year: values.year ?? prev.year,
        directedRulesId: values.directedRulesId ?? prev.directedRulesId ?? 0,
        lastUpdateBy: userInfo.name ?? '',
      };

      const updated = await updateDirectedRuleXref(directedRuleXrefId, updatedReq);

      setDirectedRulesXref(prevList =>
        prevList.map(item => (item.directedRulesXRefId === directedRuleXrefId ? updated : item))
      );

      return updated;
    },
    [userInfo.name]
  );

  const removeDirectedRuleXref = useCallback(async (directedRuleXrefId: number) => {
    await deleteDirectedRuleXref(directedRuleXrefId);
    setDirectedRulesXref(prevList =>
      prevList.filter(item => item.directedRulesXRefId !== directedRuleXrefId)
    );
  }, []);

  return {
    directedRules,
    directedRulesXref,
    portfolios,
    brokers,

    // onSaving needs these to set state
    reloadDirectRules,
    reloadDirectRulesXref,
    reloadPortfolios,
    reloadBrokers,

    addDirectedRule,
    modifyDirectedRule,
    removeDirectedRule,

    addDirectedRuleXref,
    modifyDirectedRuleXref,
    removeDirectedRuleXref,
  };
}