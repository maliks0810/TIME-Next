import React, { useEffect, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

import { ResolvedRole, resolveRoleFromOrg } from './features/attribution-analysis/lib/rbac/roles';
import { getAllowedTabs, getAllowedTabSet } from './features/attribution-analysis/lib/rbac/tabAccess';
import { TAB_CONFIG, TabKey, typedKeys } from './features/attribution-analysis/components/tabs/tabConfig';
import { useUserInfo } from '@platform/utils';

export default function AttributionAnalysisDashboard() {
  const { claims } = useUserInfo();

  /** FIXED: use claims instead of props */
  const role: ResolvedRole = useMemo(
    () => resolveRoleFromOrg(claims?.OrgLevel4 ?? ''),
    [claims?.OrgLevel4]
  );

  const allowedTabs = useMemo(() => getAllowedTabs(role), [role]);
  const allowedSet = useMemo(() => getAllowedTabSet(role), [role]);

  const [activeKey, setActiveKey] = useState<TabKey>(() => allowedTabs[0] ?? 'multi');

  /** Build visible tabs */
  const items: TabsProps['items'] = useMemo(() => {
    const orderedKeys = typedKeys(TAB_CONFIG) as TabKey[];
    const visibleKeys = orderedKeys.filter((k) => allowedSet.has(k));

    return visibleKeys.map((key) => ({
      key,
      label: TAB_CONFIG[key].label,
      children: TAB_CONFIG[key].getChildren((targetKey: TabKey) => {
        if (allowedSet.has(targetKey)) {
          setActiveKey(targetKey);
        }
      }),
    }));
  }, [allowedSet]);

  /** Handle user tab click */
  const handleTabChange = (key: string) => {
    const typedKey = key as TabKey;
    if (allowedSet.has(typedKey)) {
      setActiveKey(typedKey);
    }
  };

  /** Auto-redirect if role changes */
  useEffect(() => {
    if (!allowedSet.has(activeKey)) {
      const next = allowedTabs[0];
      if (next) setActiveKey(next);
    }
  }, [activeKey, allowedSet, allowedTabs]);

  /** No access */
  if (allowedTabs.length === 0) {
    return (
      <div className="dram-attribution-dashboard">
        <div style={{ marginTop: 24 }} />
        <div className="componentHighlight">
          <div style={{ padding: 16 }}>
            You don’t currently have access to any tabs for this dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dram-attribution-dashboard">
      <div style={{ marginTop: 24 }} />
      <div className="componentHighlight">
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          items={items}
        />
      </div>
    </div>
  );
}