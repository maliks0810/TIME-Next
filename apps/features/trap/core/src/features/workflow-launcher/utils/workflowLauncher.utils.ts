import type { TemplateVersionLite } from '../types/workflowLauncher.types';

export function sortVersionsDesc(items: TemplateVersionLite[]) {
    return [...items].sort((a, b) => Number(b.version ?? 0) - Number(a.version ?? 0));
}
