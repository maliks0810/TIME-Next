/* eslint-disable  @typescript-eslint/no-explicit-any */

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
