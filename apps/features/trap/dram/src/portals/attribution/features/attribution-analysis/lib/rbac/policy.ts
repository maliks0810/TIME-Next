// rbac/policy.ts
import { TabKey } from '../../components/tabs/tabConfig';
import type { RoleId, ResolvedRole } from './roles';

type Resource = 'tab';
type Action = 'view';

type PermissionRule =
  | Readonly<{ resource: Resource; action: Action; tabKey: TabKey }>
  | Readonly<{ resource: Resource; action: Action; tabKey: 'ALL' }>;

type Policy = Readonly<{
  roles: Readonly<Record<RoleId, readonly PermissionRule[]>>;
  unknownRole: readonly PermissionRule[];
}>;

export const POLICY: Policy = {
  roles: {
    'R2-Developer-ReadWrite': [{ resource: 'tab', action: 'view', tabKey: 'ALL' }],
    'PMRA-Analyst-ReadWrite': [
      { resource: 'tab', action: 'view', tabKey: 'ALL'  },
    ],
  },
  unknownRole: [{ resource: 'tab', action: 'view', tabKey: 'dashboard' }],
} as const;

export function canViewTab(role: ResolvedRole, tabKey: TabKey): boolean {
  const rules = role === 'UNKNOWN' ? POLICY.unknownRole : POLICY.roles[role];
  return rules.some(
    (r) =>
      r.resource === 'tab' &&
      r.action === 'view' &&
      (r.tabKey === 'ALL' || r.tabKey === tabKey)
  );
}