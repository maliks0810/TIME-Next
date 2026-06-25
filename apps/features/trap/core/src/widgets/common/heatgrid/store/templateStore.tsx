import { TemplateStore, SettingsTemplate } from '../HeatGridWidget';
import { activeGrouping, heatScales, columnAxisGroups, hiddenFields } from '../helpers';
import { AQI_DIMENSIONS } from '../mock';
import { HeatmapSettings, ColumnDef, HeatScaleConfig } from '../types';
export const DEFAULTS: HeatmapSettings = {
    groupBy: ['continent'],
    hiddenColumns: [],
    showLeaves: true,
    blankGroupRows: false,
    showTotal: true,
    showNameHeader: true,
    quarters: ['q1', 'q2', 'q3', 'q4'],
    heatConfig: {},
};

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
                // persistence unavailable
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
                // persistence unavailable
            }
        },
    };
}

export function catalogToSettings(next: ColumnDef[], prev: HeatmapSettings): HeatmapSettings {
    const groupBy = activeGrouping(next).map((d) => d.key);
    const heatConfig: Record<string, HeatScaleConfig> = { ...prev.heatConfig };
    for (const scale of heatScales(next))
        heatConfig[scale.scale] = {
            ramp: scale.ramp,
            outlierColor: scale.outlierColor,
            missingColor: scale.missingColor,
        };
    const axis = columnAxisGroups(next)[0];
    const quarters = (axis?.children ?? [])
        .filter((m) => m.role === 'group' && m.selectable && m.selected)
        .map((m) => m.key);
    return { ...prev, groupBy, hiddenColumns: [...hiddenFields(next)], heatConfig, quarters };
}

export function loadSettings(storageKey: string): HeatmapSettings {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return structuredClone(DEFAULTS);
        const parsed = JSON.parse(raw) as Partial<HeatmapSettings>;
        const validDims = new Set(AQI_DIMENSIONS.map((d) => d.key));
        return {
            ...structuredClone(DEFAULTS),
            ...parsed,
            groupBy: (parsed.groupBy ?? DEFAULTS.groupBy).filter((k) => validDims.has(k)),
            hiddenColumns: Array.isArray(parsed.hiddenColumns)
                ? parsed.hiddenColumns.filter((k) => typeof k === 'string')
                : [],
            heatConfig: { ...DEFAULTS.heatConfig, ...parsed.heatConfig },
        };
    } catch {
        return structuredClone(DEFAULTS);
    }
}
