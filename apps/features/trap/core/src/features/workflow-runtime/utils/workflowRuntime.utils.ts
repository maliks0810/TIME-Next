/* eslint-disable  @typescript-eslint/no-explicit-any */
export function safeParseJson(maybe: any) {
    if (!maybe) return null;
    if (typeof maybe === 'object') return maybe;
    if (typeof maybe === 'string') {
        try {
            return JSON.parse(maybe);
        } catch {
            return null;
        }
    }
    return null;
}

export function extractLayout(view: any): any[] {
    if (!view || typeof view !== 'object') return [];

    const direct = view.layout ?? view.Layout ?? view.grid ?? view.Grid;
    if (Array.isArray(direct)) return direct;

    const nested = view.view ?? view.View;
    if (nested && typeof nested === 'object') {
        const nestedDirect = nested.layout ?? nested.Layout ?? nested.grid ?? nested.Grid;
        return Array.isArray(nestedDirect) ? nestedDirect : [];
    }

    return [];
}

export function extractWidgetsArray(view: any): any[] {
    if (!view || typeof view !== 'object') return [];

    const widgets = view.widgets ?? view.Widgets;
    if (Array.isArray(widgets)) return widgets;
    if (widgets && typeof widgets === 'object') return Object.values(widgets);

    const nested = view.view ?? view.View;
    if (nested && typeof nested === 'object') return extractWidgetsArray(nested);

    return [];
}

export function widgetsMapById(arr: any[]): Record<string, any> {
    const out: Record<string, any> = {};
    for (const w of arr) {
        const id = String(w?.id ?? w?.instanceId ?? '');
        if (id) out[id] = w;
    }
    return out;
}

export function resolveWidgetId(w: any) {
    return String(w?.composedWidgetId ?? w?.widgetDefinitionId ?? '');
}
