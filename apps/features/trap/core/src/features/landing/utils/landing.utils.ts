/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { TemplateVersion } from '../types/landing.types';

export function pickBestVersion(vs: TemplateVersion[]): TemplateVersion | undefined {
    if (!vs?.length) return undefined;

    const norm = (s: any) => String(s ?? '').toUpperCase();

    const byUpdated = [...vs].sort((a, b) => {
        const au = Date.parse(a.updatedAt || a.createdAt || '') || 0;
        const bu = Date.parse(b.updatedAt || b.createdAt || '') || 0;
        return bu - au;
    });

    return (
        byUpdated.find((v) => norm(v.status) === 'PUBLISHED') ??
        byUpdated.find((v) => norm(v.status) === 'DRAFT') ??
        byUpdated[0]
    );
}

export function extractLayout(view: any): any[] {
    if (!view || typeof view !== 'object') return [];
    return Array.isArray(view?.layout) ? view.layout : [];
}

export function extractWidgetsArray(view: any): any[] {
    if (!view || typeof view !== 'object') return [];
    return Array.isArray(view?.widgets) ? view.widgets : [];
}

export function widgetsMapById(arr: any[]): Record<string, any> {
    const out: Record<string, any> = {};
    for (const w of arr) {
        const id = String(w?.id ?? w?.instanceId ?? '');
        if (id) out[id] = w;
    }
    return out;
}
