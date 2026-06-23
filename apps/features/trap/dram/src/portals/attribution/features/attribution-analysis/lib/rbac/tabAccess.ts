// rbac/tabAccess.ts
import { TAB_CONFIG, TabKey, typedKeys } from '../../components/tabs/tabConfig';
import { ResolvedRole, ROLE_IDS, RoleId } from './roles';

// Central allow-list mapping (easy onboarding)
const ROLE_TO_TABS: Readonly<Record<RoleId, readonly TabKey[]>> = {
  'R2-Developer-ReadWrite': ['dashboard','pma-landing', 'attribution-analysis','diagnostics','admin','driver-analysis'],
  'PMRA-Analyst-ReadWrite': ['dashboard','pma-landing', 'attribution-analysis','diagnostics','admin','driver-analysis'], // partial access example
} as const;

// Fallback behavior for unknown roles
const DEFAULT_TABS_FOR_UNKNOWN: readonly TabKey[] = ['dashboard'];

// Optional: ensure config doesn’t reference missing tab keys (runtime-safe)
function filterToExistingTabs(keys: readonly TabKey[]): readonly TabKey[] {
  const allTabs = new Set(typedKeys(TAB_CONFIG) as TabKey[]);
  return keys.filter((k) => allTabs.has(k));
}

export function getAllowedTabs(role: ResolvedRole): readonly TabKey[] {
  if (role === 'UNKNOWN') return filterToExistingTabs(DEFAULT_TABS_FOR_UNKNOWN);

  // role is RoleId here; ROLE_TO_TABS is total for RoleId
  return filterToExistingTabs(ROLE_TO_TABS[role]);
}

// Convenience: use a Set for fast checks
export function getAllowedTabSet(role: ResolvedRole): ReadonlySet<TabKey> {
  return new Set(getAllowedTabs(role));
}

// Optional: keep RoleId list discoverable (no any)
export function allKnownRoles(): readonly RoleId[] {
  return ROLE_IDS;
}