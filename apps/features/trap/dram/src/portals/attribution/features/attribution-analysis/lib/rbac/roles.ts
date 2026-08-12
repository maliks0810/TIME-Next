// rbac/roles.ts

/**
* Returns a role string or ''.
*/

export function getRoleByOrg(group: string): string {
  if (group === 'Inv Risk & Research Tech') {
    return 'R2-Developer-ReadWrite';
  }

  if (
    group === 'Perf Measurement & Attrib' ||
    group === 'Inv Risk & Quant Research' ||
    group === 'Performance Measurement & Attribution' ||
    group === 'Investment Risk & Quantitative Research Group'
  ) {
    return 'PMRA-Analyst-ReadWrite';
  }

  return '';
}
export const PERSONA_BY_ROLE: Record<string, string> = {
  'PMRA-Analyst-ReadWrite': 'PMA Analyst',
  'R2-Developer-ReadWrite': 'R2 Quant',
  'CS-Admin-ReadWrite': 'CS Administrator',
  'Portfolio-Manager-ReadWrite': 'Portfolio Manager',
};

export function getPersonaByRole(role: string): string {
  return PERSONA_BY_ROLE[role] ?? 'Generic User';
}

/**
 * Strongly typed set of known roles.
 * Add new roles here (single source of truth).
 */
export const ROLE_IDS = ['R2-Developer-ReadWrite', 'PMRA-Analyst-ReadWrite'] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export type ResolvedRole = RoleId | 'UNKNOWN';

export function isRoleId(value: string): value is RoleId {
  const known: readonly string[] = ROLE_IDS;
  return known.includes(value);
}

export function resolveRoleFromOrg(group: string): ResolvedRole {
  const raw = getRoleByOrg(group);
  return isRoleId(raw) ? raw : 'UNKNOWN';
}
//Investment Risk & Quantitative Research Group