import { useEffect, useState, useCallback } from 'react';
import {
  createBroker,
  updateBroker,
  deleteBroker,
  fetchBrokers,
  fetchMasterBrokers,
} from '../services/broker-service';
import {
  MaintenanceBroker,
  MaintenanceMasterBroker,
  RequestMaintenanceBroker,
} from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

interface UseBrokersProps {
  userInfo: UserInfo;
}

export function useBrokers({ userInfo }: UseBrokersProps) {
  const [brokers, setBrokers] = useState<MaintenanceBroker[]>([]);
  const [masterBrokers, setMasterBrokers] = useState<MaintenanceMasterBroker[]>([]);

  /** ✅ normalize API data once */
  const normalizeBrokers = useCallback(
    (items?: MaintenanceBroker[]) =>
      (items ?? []).map(b => ({
        ...b,
        active: b.status === 'Active',
      })),
    []
  );

  /** ✅ REAL reload: replaces state */
  const reload = useCallback(async () => {
    const [brokerData, mstBrokerData] = await Promise.all([
      fetchBrokers(),
      fetchMasterBrokers(),
    ]);

    setBrokers(normalizeBrokers(brokerData));
    setMasterBrokers(mstBrokerData ?? []);
  }, [normalizeBrokers]);

  /** initial load */
  useEffect(() => {
    void reload();
  }, [reload]);

  /** ✅ Create — NO local setState */
  const addBroker = useCallback(
    async (values: Partial<MaintenanceBroker>) => {
      const req: RequestMaintenanceBroker = {
        masterBrokerId: values.masterBrokerId ?? '',
        brokerCode: values.brokerCode ?? '',
        aladdinBrokerCode: values.aladdinBrokerCode ?? '',
        brokerName: values.brokerName ?? '',
        status: values.active ? 'Active' : 'Inactive',
        lastUpdateBy: userInfo.name,
      };

      return await createBroker(req);
    },
    [userInfo.name]
  );

  /** ✅ Update — NO local setState */
  const modifyBroker = useCallback(
    async (brokerId: number, values: Partial<MaintenanceBroker>) => {
      const prev = brokers.find(b => b.brokerId === brokerId);
      if (!prev) throw new Error('Broker not found');

      const req: RequestMaintenanceBroker = {
        masterBrokerId: values.masterBrokerId ?? prev.masterBrokerId ?? '',
        brokerName: values.brokerName ?? prev.brokerName ?? '',
        brokerCode: values.brokerCode ?? prev.brokerCode ?? '',
        aladdinBrokerCode: values.aladdinBrokerCode ?? prev.aladdinBrokerCode ?? '',
        status:
          values.active !== undefined
            ? values.active
              ? 'Active'
              : 'Inactive'
            : prev.status ?? 'Active',
        lastUpdateBy: userInfo.name,
      };

      return await updateBroker(brokerId, req);
    },
    [brokers, userInfo.name]
  );

  /** ✅ Remove — NO local filter */
  const removeBroker = useCallback(async (brokerId: number) => {
    await deleteBroker(brokerId);
  }, []);

  return {
    brokers,
    masterBrokers,
    reload,        // ✅ real reload
    addBroker,
    modifyBroker,
    removeBroker,
  };
}