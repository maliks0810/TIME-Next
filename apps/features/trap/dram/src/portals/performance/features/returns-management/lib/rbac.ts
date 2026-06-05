import { Role } from "./types";
export function getRoleByOrg(group: string) : string{
  if (group === 'Inv Risk & Research Tech')
    return'R2-Developer-ReadWrite';
  if (group === 'Performance Measurement & Attribution')
    return 'PMRA-Analyst-ReadWrite';
  else
    return '';
}

export const RBAC = {
  tabs: {
    imports: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
    merge: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
    errors: ['R2-Developer-ReadWrite'] as Role[],
    recompute: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
  },
  actions: {
    importUpload: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
    recomputeRun: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
    zipDownload: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
    csvPreview: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
    exportCsv: ['PMRA-Analyst-ReadWrite', 'R2-Developer-ReadWrite'] as Role[],
  },
} as const;

export const allow = (role: Role, allowed: readonly Role[]) => allowed.includes(role);
