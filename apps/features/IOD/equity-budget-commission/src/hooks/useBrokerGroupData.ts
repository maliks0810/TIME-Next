import { useEffect, useState, useCallback } from 'react';
import { fetchBrokers } from '../services/broker-service';
import {
  createBrokerGroup,
  fetchBrokerGroups,
  fetchBrokerGroupsMember,
  updateBrokerGroup,
  deleteBrokerGroup,
  createBrokerGroupMember,
  updateBrokerGroupMember,
  deleteBrokerGroupMember,
} from '../services/broker-group-service';
import { fetchAdminUsers } from '../services/admin-user-service';
import {
  MaintenanceBrokerGroupMember,
  MaintenanceBrokerGroup,
  MaintenanceBroker,
  RequestMaintenanceBrokerGroup,
  RequestMaintenanceBrokerGroupMember,
} from '../datatypes/budget-maintenance-types';
import { UserInfo } from '../../../../../../packages/utils/src/hooks/Authentication/user-info';

interface UseBrokerGroupProps {
  userInfo: UserInfo;
}

export function useBrokerGroups({ userInfo }: UseBrokerGroupProps) {
  const [brokerGroups, setBrokerGroups] = useState<MaintenanceBrokerGroup[]>([]);
  const [brokerGroupMembers, setBrokerGroupMembers] = useState<MaintenanceBrokerGroupMember[]>([]);
  const [brokers, setBrokers] = useState<MaintenanceBroker[]>([]);
  const [isAdmin,setIsAdmin] = useState<boolean>(false);
  const [selectedBrokerGroupId, setSelectedBrokerGroupId] = useState<number>();

  /** normalize once, and be defensive */
  const normalizeBrokerGroups = useCallback((items?: MaintenanceBrokerGroup[]) => {
    return (items ?? []).map(g => ({
      ...g,
      active: g.status === 'Active',
    }));
  }, []);

  /** ✅ real reloads that REPLACE state */
  const reloadGroup = useCallback(async () => {
    const groups = await fetchBrokerGroups();
    setBrokerGroups(normalizeBrokerGroups(groups));
  }, [normalizeBrokerGroups]);

  const reloadBrokers = useCallback(async () => {
    const brkers = await fetchBrokers();
    setBrokers(brkers?.filter(c=> c.brokerType !== 'LEGACY') ?? []);
  }, []);

  const reloadGroupMemberGroup = useCallback(async () => {
    const allmembers = await fetchBrokerGroupsMember();

    const members:MaintenanceBrokerGroupMember[] = allmembers?.filter(x=> x.brokerGroupId == selectedBrokerGroupId);
    setBrokerGroupMembers(members ?? []);
  }, [selectedBrokerGroupId]);

  /** initial load */
  useEffect(() => {
    void (async () => {
      try {
        const [grpData, brokerData, adminData] = await Promise.all([
          fetchBrokerGroups(),
          //fetchBrokerGroupsMember(),
          fetchBrokers(),
          fetchAdminUsers(),
        ]);

        setBrokerGroups(normalizeBrokerGroups(grpData));
        //setBrokerGroupMembers(memberData ?? []);
        setBrokers(brokerData?.filter(c=> c.brokerType !== 'LEGACY') ?? []);
        const u = adminData?.find(a=> a.firstName+ " "+ a.lastName === userInfo.name);
        if(u){
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    })();
  }, [normalizeBrokerGroups]);

  /* ---------------- Broker Group CRUD (NO local state mutation) ---------------- */

  const addBrokerGroup = useCallback(
    async (values: Partial<MaintenanceBrokerGroup>) => {
      const req: RequestMaintenanceBrokerGroup = {
        brokerGroupCode: values.brokerGroupCode ?? '',
        brokerGroupName: values.brokerGroupName ?? '',
        status: values.active ? 'Active' : 'Inactive',
        comment: values.comment ?? '',
        brokerClassCode: values.brokerClassCode ?? '',
        lastUpdateBy: userInfo.name ?? ''
      };

      return await createBrokerGroup(req);
    },
    [userInfo.name]
  );

  const modifyBrokerGroup = useCallback(
    async (brokerGroupId: number, values: Partial<MaintenanceBrokerGroup>) => {
      const prev = brokerGroups.find(d => d.brokerGroupId === brokerGroupId);
      if (!prev) throw new Error('Broker Group not found');

      const req: RequestMaintenanceBrokerGroup = {
        brokerGroupId: brokerGroupId,
        brokerGroupCode: values.brokerGroupCode ?? prev.brokerGroupCode,
        brokerGroupName: values.brokerGroupName ?? prev.brokerGroupName,
        status:
          values.active !== undefined
            ? values.active ? 'Active' : 'Inactive'
            : prev.status ?? 'Active',
        comment: values.comment ?? prev.comment ?? '',
        brokerClassCode: values.brokerClassCode ?? prev.brokerClassCode ?? '',
        lastUpdateBy: userInfo.name ?? '',
      };

      return await updateBrokerGroup(brokerGroupId, req);
    },
    [brokerGroups, userInfo.name]
  );

  const removeBrokerGroup = useCallback(async (brokerGroupId: number) => {
    await deleteBrokerGroup(brokerGroupId);
  }, []);

  const onSelectionChanged = async (selectedKeys: number[]) => {
    const key: number = selectedKeys[0];
    setSelectedBrokerGroupId(key);
  }

  useEffect(() => { 
    void (async () => {
      if (selectedBrokerGroupId) {
        await reloadGroupMemberGroup();
      } else {
        setBrokerGroupMembers([]);
      }
    })();
  }, [selectedBrokerGroupId, reloadGroupMemberGroup]);
  /* ---------------- Broker Group Member CRUD (NO local state mutation) ---------------- */

  const addBrokerGroupMember = useCallback(
    async (values: Partial<MaintenanceBrokerGroupMember>) => {
      const req: RequestMaintenanceBrokerGroupMember = {
        brokerCode: values.brokerCode ?? '',
        brokerGroupId: values.brokerGroupId ?? 0,
        lastUpdateBy: userInfo.name ?? ''
      };

      const newMember = await createBrokerGroupMember(req);
      await reloadGroupMemberGroup();
      return newMember;
    },
    [userInfo.name, reloadGroupMemberGroup, brokerGroupMembers]
  );

  const modifyBrokerGroupMember = useCallback(
    async (brokerGroupMemberId: number, values: Partial<MaintenanceBrokerGroupMember>) => {
      const prev = brokerGroupMembers.find(d => d.brokerGroupMemberId === brokerGroupMemberId);
      if (!prev) throw new Error('Broker Group Member not found');

      const req: RequestMaintenanceBrokerGroupMember = {
        brokerGroupId: values.brokerGroupId ?? prev.brokerGroupId,
        brokerCode: values.brokerCode ?? prev.brokerCode,
        lastUpdateBy: userInfo.name ?? ''
      };

      return await updateBrokerGroupMember(brokerGroupMemberId, req);
    },
    [userInfo.name, reloadGroupMemberGroup, brokerGroupMembers]
  );

  const removeBrokerGroupMember = useCallback(async (brokerGroupMemberId: number) => {
    await deleteBrokerGroupMember(brokerGroupMemberId);
  }, []);

  return {
    brokerGroups,
    brokerGroupMembers,
    brokers,
    reloadBrokers,
    addBrokerGroup,
    modifyBrokerGroup,
    removeBrokerGroup,
    reloadGroup,                 // ✅ now sets state
    onSelectionChanged,
    selectedBrokerGroupId,

    addBrokerGroupMember,
    modifyBrokerGroupMember,
    removeBrokerGroupMember,
    reloadGroupMemberGroup,  
    
    isAdmin    // ✅ now sets state
  };
}