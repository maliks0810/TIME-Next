/* eslint-disable @typescript-eslint/no-explicit-any */
import { SettingsTemplate } from '../HeatGridWidget';
import { activeGrouping, heatScales, columnAxisGroups, hiddenFields } from '../helpers';
import { HeatmapSettings, ColumnDef, HeatScaleConfig } from '../types';
export interface TemplateStore<T> {
    loadTemplates(): SettingsTemplate<T>[];
    persistTemplates(list: SettingsTemplate<T>[]): void;
    loadActiveId(): string | null;
    persistActiveId(id: string | null): void;
}
export function createTemplateStore<T>(listKey: string, activeKey: string): TemplateStore<T> {
    return {
        loadTemplates() {
            try {
                const raw = localStorage.getItem(listKey);
                if (!raw) return [];
                const parsed = JSON.parse(raw) as SettingsTemplate<T>[];
                return Array.isArray(parsed)
                    ? parsed.filter((t) => t && t.id && t.name && t.settings)
                    : [];
            } catch {
                return [];
            }
        },
        persistTemplates(list) {
            try {
                localStorage.setItem(listKey, JSON.stringify(list));
            } catch {
                /* persistence unavailable */
            }
        },
        loadActiveId() {
            try {
                return localStorage.getItem(activeKey);
            } catch {
                return null;
            }
        },
        persistActiveId(id) {
            try {
                if (id == null) localStorage.removeItem(activeKey);
                else localStorage.setItem(activeKey, id);
            } catch {
                /* persistence unavailable */
            }
        },
    };
}

// Reverse projection: catalog (post user edits in the drawer) → settings.
// Used by HeatGridWidgetBase's onColumnsChange to round-trip drawer changes
// back into persisted settings.
export function catalogToSettings(next: ColumnDef[], prev: HeatmapSettings): HeatmapSettings {
    const groupBy = activeGrouping(next).map((group: any) => group.key);
    const heatConfig: Record<string, HeatScaleConfig> = { ...prev.heatConfig };
    for (const scale of heatScales(next))
        heatConfig[scale.scale] = {
            ramp: scale.ramp,
            outlierColor: scale.outlierColor,
            missingColor: scale.missingColor,
        };
    // Collect the selected axis-group members across ALL axisGroups (server may
    // emit more than one — e.g., year + region — though current consumers
    // typically use one). Domain-agnostic: we just gather selected ids.
    const selectedAxisMembers: string[] = [];
    for (const axis of columnAxisGroups(next)) {
        for (const m of axis.children ?? []) {
            if (m.role === 'group' && m.selectable && m.selected) {
                selectedAxisMembers.push(m.key);
            }
        }
    }
    return {
        ...prev,
        groupBy,
        hiddenColumns: [...hiddenFields(next)],
        heatConfig,
        selectedAxisMembers,
    };
}

export function loadSettings(storageKey: string, defaults: HeatmapSettings): HeatmapSettings {
    // No dimension whitelist validation here — the catalog the server returns
    // is the authority on which dimension keys exist. Unknown keys in
    // settings.groupBy are filtered out gracefully by setGrouping at catalog
    // projection time (indexOf === -1 → groupIndex undefined → ignored).
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return structuredClone(defaults);
        const parsed = JSON.parse(raw) as Partial<HeatmapSettings>;
        return {
            ...structuredClone(defaults),
            ...parsed,
            groupBy: Array.isArray(parsed.groupBy) ? parsed.groupBy.map(String) : defaults.groupBy,
            hiddenColumns: Array.isArray(parsed.hiddenColumns)
                ? parsed.hiddenColumns.filter((k) => typeof k === 'string')
                : [],
            selectedAxisMembers: Array.isArray(parsed.selectedAxisMembers)
                ? parsed.selectedAxisMembers.filter((k) => typeof k === 'string')
                : [],
            heatConfig: { ...defaults.heatConfig, ...parsed.heatConfig },
        };
    } catch {
        return structuredClone(defaults);
    }
}
