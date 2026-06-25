/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { HeatmapSettings, FoundationConfig, type ColumnDef } from '../heatgrid/types';
import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { buildCatalog } from './utils';
import { AQI_DIMENSIONS, fetchAirQuality } from './mock';
import HeatGridWidgetBase from './components/HeatmapWidgetBase';
import { SpectrumLegend } from './SpectrumLegend';
import {
    createTemplateStore,
    loadSettings,
    catalogToSettings,
    DEFAULTS,
} from './store/templateStore';
import './heatgrid.scss';

/**
 * Common Heat Map Grid widget shell — the heatgrid counterpart of GridWidget.
 * Owns the generic chrome (titlebar, controls, status, virtualization,
 * expand/collapse, drawer, chooser, "as-shown" export); a data source supplies
 * the column catalog + rows + labels. Deliberately separate from perfgrid's
 * GridWidget (the two engines share no code).
 */

export interface ExportMeta {
    fileName: string;
    title: string;
    subtitleLines: string[];
}

export interface SettingsTemplate<T> {
    id: string;
    name: string;
    settings: T;
}

export interface TemplateStore<T> {
    loadTemplates(): SettingsTemplate<T>[];
    persistTemplates(list: SettingsTemplate<T>[]): void;
    loadActiveId(): string | null;
    persistActiveId(id: string | null): void;
}

export const HeatGridWidget = ({ widgetInstance }: WidgetComponentProps) => {
    const { config } = widgetInstance;
    const view = config?.params?.settingsView || 'modal';
    const settingsStorageKey = config?.params?.settingsStorageKey || '';
    const templatesStorageKey = config?.params?.templatesStorageKey || '';
    const activeTemplateStorageKey = config?.params?.activeTemplateStorageKey || '';
    const storedTemplates = createTemplateStore<HeatmapSettings>(
        templatesStorageKey,
        activeTemplateStorageKey
    );
    const [settings, setSettingsState] = useState<HeatmapSettings>(() =>
        loadSettings(settingsStorageKey)
    );
    const columns = useMemo(() => buildCatalog(settings), [settings]);

    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
        storedTemplates.loadActiveId
    );
    const [templates, setTemplates] = useState<SettingsTemplate<HeatmapSettings>[]>(
        storedTemplates.loadTemplates
    );
    const [loading, setLoading] = useState(true);
    const groupByKey = settings.groupBy.join('|');
    const requestSeq = useRef(0);
    const [data, setData] = useState<any | null>(null);
    const roots = data?.roots ?? [];
    const total = data?.total ?? null;
    const setSettings = (next: HeatmapSettings) => {
        setSettingsState(next);
        try {
            localStorage.setItem(settingsStorageKey, JSON.stringify(next));
        } catch {
            // persistence unavailable
        }
    };
    const groupingLabels = settings.groupBy.map(
        (group) => AQI_DIMENSIONS.find((dimension) => dimension.key === group)?.shortLabel ?? group
    );
    useEffect(() => {
        const seq = ++requestSeq.current;
        setLoading(true);
        fetchAirQuality(groupByKey ? groupByKey.split('|') : []).then((res) => {
            if (requestSeq.current !== seq) return;
            setData(res);
            setLoading(false);
        });
    }, [groupByKey]);
    const onColumnsChange = (next: ColumnDef[]) => {
        const s = catalogToSettings(next, settings);
        setSettings(s.groupBy.length === 0 ? { ...s, showLeaves: true } : s);
    };

    const title = config?.params?.title || '';
    const exportFileName = config?.params?.title || 'Exported heat map';
    const exportFileNameTitle = config?.params?.title || 'Exported heat map';
    const leafLabel = config?.params?.leafLabel || '';
    const foundation: FoundationConfig = {
        showTitle: config?.params?.showTitle,
        showGrouping: config?.params?.showGrouping,
        showSearch: config?.params?.showSearch,
        showLegend: config?.params?.showLegend,
        showTooltip: config?.params?.showTooltip,
        showExport: config?.params?.showExport,
        showExpand: config?.params?.showExpand,
        showCollapse: config?.params?.showCollapse,
        showGridLines: config?.params?.showGridLines,
    };

    const activeTemplate = templates.find((t) => t.id === activeTemplateId) ?? null;
    const templateDirty =
        activeTemplate != null &&
        JSON.stringify(activeTemplate.settings) !== JSON.stringify(settings);

    const setActiveTemplate = (id: string | null) => {
        setActiveTemplateId(id);
        storedTemplates.persistActiveId(id);
    };

    const applyTemplate = (id: string) => {
        const t = templates.find((x) => x.id === id);
        if (!t) return;
        setSettings(structuredClone(t.settings));
        setActiveTemplate(id);
    };

    const saveTemplate = (name: string) => {
        const t: SettingsTemplate<HeatmapSettings> = {
            id: `tpl-${Date.now().toString(36)}`,
            name,
            settings: structuredClone(settings),
        };
        const next = [...templates, t];
        setTemplates(next);
        storedTemplates.persistTemplates(next);
        setActiveTemplate(t.id);
    };

    const updateTemplate = () => {
        if (!activeTemplateId) return;
        const next = templates.map((t) =>
            t.id === activeTemplateId ? { ...t, settings: structuredClone(settings) } : t
        );
        setTemplates(next);
        storedTemplates.persistTemplates(next);
    };

    const deleteTemplate = (id: string) => {
        const next = templates.filter((t) => t.id !== id);
        setTemplates(next);
        storedTemplates.persistTemplates(next);
        if (activeTemplateId === id) setActiveTemplate(null);
    };
    const exportMeta = {
        fileName: exportFileName,
        title: exportFileNameTitle,
        subtitleLines: [],
    };
    const ramp = settings.heatConfig['aqi']?.ramp ?? 'gyor';
    const legend = <SpectrumLegend ramp={ramp} lowLabel="Good" highLabel="Unhealthy" />;
    return (
        <WidgetCardShell>
            <HeatGridWidgetBase
                exportMeta={exportMeta}
                legend={legend}
                view={view}
                foundation={foundation}
                className={''}
                title={<span>{title}</span>}
                nameHeader={'Region'}
                columns={columns}
                loading={loading}
                roots={roots}
                totalRow={settings.showTotal ? total : null}
                showLeaves={settings.showLeaves}
                onShowLeavesChange={(v) => setSettings({ ...settings, showLeaves: v })}
                onColumnsChange={onColumnsChange}
                groupingLabels={groupingLabels}
                onReset={() => setSettings(structuredClone(DEFAULTS))}
                leafLabel={leafLabel}
                templatesSection={{
                    templates,
                    activeId: activeTemplateId,
                    dirty: templateDirty,
                    onApply: applyTemplate,
                    onSave: saveTemplate,
                    onUpdate: updateTemplate,
                    onDelete: deleteTemplate,
                }}
            />
        </WidgetCardShell>
    );
};
