/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, Spin, Tooltip } from 'antd';
import {
    ColumnHeightOutlined,
    FileExcelOutlined,
    SettingOutlined,
    VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import HeatMapGrid from '../heatgrid/HeatMapGrid';
import HeatSettingsPanel, { type TemplatesSection } from '../heatgrid/HeatSettingsPanel';
import {
    activeGrouping,
    HeatmapSettings,
    collectGroupKeys,
    columnAxisGroups,
    flattenVisibleRows,
    FoundationConfig,
    HeatScaleConfig,
    heatScales,
    hiddenFields,
    renderColumns,
    type ColumnDef,
    type GridRow,
} from '../heatgrid/types';
import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { buildCatalog } from './utils';
import { AQI_DIMENSIONS, fetchAirQuality } from './mock';

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

interface Props {
    className: string;
    title: ReactNode;
    titleActions?: ReactNode;
    /** Widget-specific content for the designer "Widget settings" popover. */
    settingsExtra?: ReactNode;
    toolbarExtras?: ReactNode;
    /** Filter/search box, in the controls bar; gated by the Foundation toggle. */
    search?: ReactNode;
    /** Heat-scale legend, shown in the controls bar; gated by the Foundation toggle. */
    legend?: ReactNode;

    nameHeader: string;
    columns: ColumnDef[];
    roots: GridRow[];
    totalRow: GridRow | null;
    showLeaves: boolean;
    onShowLeavesChange: (v: boolean) => void;
    /** Blank in-tree rollup rows (labels only). Omit the handler to hide the toggle. */
    blankGroupRows?: boolean;
    onBlankGroupRowsChange?: (v: boolean) => void;
    /** Show the pinned total row toggle in the drawer. Omit the handler to hide it. */
    showTotal?: boolean;
    onShowTotalChange?: (v: boolean) => void;
    /** Show the dimension column header label. Omit the handler to hide the toggle. */
    showNameHeader?: boolean;
    onShowNameHeaderChange?: (v: boolean) => void;
    onColumnsChange: (next: ColumnDef[]) => void;

    groupingLabels: string[];
    leafLabel?: string;

    leafRows?: { title: string; sub?: string };
    /** Heading for the column-tree block. Default "Columns". */
    seriesLabel?: string;
    onReset: () => void;
    templatesSection?: TemplatesSection<any>;
    foundation: FoundationConfig;
    loading?: boolean;
    ready?: boolean;
    exportMeta?: ExportMeta;
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

const DEFAULTS: HeatmapSettings = {
    groupBy: ['continent'],
    hiddenColumns: [],
    showLeaves: true,
    blankGroupRows: false,
    showTotal: true,
    showNameHeader: true,
    quarters: ['q1', 'q2', 'q3', 'q4'],
    heatConfig: {},
};
function catalogToSettings(next: ColumnDef[], prev: HeatmapSettings): HeatmapSettings {
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

function loadSettings(storageKey: string): HeatmapSettings {
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

export const HeatGridWidget = ({ widgetInstance }: WidgetComponentProps) => {
    const { config } = widgetInstance;
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

    return (
        <WidgetCardShell>
            <HeatGridWidgetBase
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
                groupingLabels={[]}
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
                // leafRows={{
                //     title: 'Show individual countries',
                //     sub: 'List countries under the deepest group',
                // }}
            />
        </WidgetCardShell>
    );
};
export default function HeatGridWidgetBase({
    className,
    title,
    titleActions,
    toolbarExtras,
    search,
    legend,
    nameHeader,
    columns,
    roots,
    totalRow,
    showLeaves,
    onShowLeavesChange,
    blankGroupRows,
    onBlankGroupRowsChange,
    showTotal,
    onShowTotalChange,
    showNameHeader = true,
    onShowNameHeaderChange,
    onColumnsChange,
    groupingLabels,
    leafLabel,
    leafRows,
    seriesLabel,
    onReset,
    templatesSection,
    loading = false,
    ready = true,
    foundation,
    exportMeta,
}: Props) {
    // const [foundation, setFoundation] = useFoundation(`perf-attribution.foundation.${className}`);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(null);
    const [viewport, setViewport] = useState({ top: 0, height: 400 });
    const [exporting, setExporting] = useState(false);

    const groupingSig = activeGrouping(columns)
        .map((d) => d.key)
        .join('|');
    useEffect(() => {
        setExpandedOverride(null);
    }, [groupingSig]);

    const defaultExpanded = useMemo(
        () => new Set(roots.filter((n) => !n.isLeaf).map((n) => n.key)),
        [roots]
    );
    const expanded = expandedOverride ?? defaultExpanded;
    const toggle = (key: string) => {
        const next = new Set(expanded);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setExpandedOverride(next);
    };

    const gridAreaRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const el = gridAreaRef.current;
        if (!el) return;
        const measure = () => setViewport((v) => ({ ...v, height: el.clientHeight }));
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const scrollTicking = useRef(false);

    const onExport = async () => {
        if (!exportMeta) return;
        setExporting(true);
        try {
            const { exportToExcel } = await import('../heatgrid/exportExcel');
            await exportToExcel({
                ...exportMeta,
                nameHeader,
                columns: renderColumns(columns),
                rows: flattenVisibleRows(roots, expanded, showLeaves),
                totalRow,
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={`widget ${className}`}>
            <div className="wg-titlebar">
                {foundation.showTitle && (
                    <div className="wg-title">
                        <div className="brand-mark">
                            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                                <g
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    fill="none"
                                >
                                    <path d="M3 8 h10 a3 3 0 1 0 -3 -3" />
                                    <path d="M3 13 h14 a3 3 0 1 1 -3 3" />
                                    <path d="M3 18 h7" />
                                </g>
                            </svg>
                        </div>
                        {title}
                    </div>
                )}
                <div className="wg-actions">
                    {titleActions}
                    {/* {true && (
                        <WidgetSettingsButton
                            foundation={foundation}
                            onFoundationChange={setFoundation}
                            hasLegend
                            hasSearch={search != null}
                            extra={settingsExtra}
                        />
                    )} */}
                    {exportMeta && foundation.showExport && (
                        <Tooltip title="Export to Excel — current view">
                            <Button
                                type="text"
                                size="small"
                                icon={<FileExcelOutlined />}
                                loading={exporting}
                                disabled={!ready}
                                onClick={onExport}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Display settings">
                        <Button
                            type="text"
                            size="small"
                            icon={<SettingOutlined />}
                            onClick={() => setDrawerOpen(true)}
                        />
                    </Tooltip>
                </div>
            </div>

            {(foundation.showGrouping ||
                foundation.showExpand ||
                foundation.showCollapse ||
                (foundation.showSearch && search != null) ||
                (foundation.showLegend && legend != null) ||
                toolbarExtras != null) && (
                <div className="wg-controls">
                    {foundation.showGrouping && (
                        <button
                            className="group-path"
                            onClick={() => setDrawerOpen(true)}
                            title="Edit grouping"
                        >
                            {groupingLabels.length === 0 ? (
                                <span className="path-empty">No grouping</span>
                            ) : (
                                groupingLabels.map((label, i) => (
                                    <span key={`${label}-${i}`} className="path-seg">
                                        {i > 0 && <span className="path-sep">›</span>}
                                        <span className="path-chip">{label}</span>
                                    </span>
                                ))
                            )}
                            {showLeaves && groupingLabels.length > 0 && leafLabel && (
                                <span className="path-seg">
                                    <span className="path-sep">›</span>
                                    <span className="path-chip muted">{leafLabel}</span>
                                </span>
                            )}
                        </button>
                    )}
                    <div className="wg-spacer" />
                    {toolbarExtras}
                    {foundation.showSearch && search}
                    {foundation.showLegend && legend}
                    {foundation.showExpand && (
                        <Tooltip title="Expand all" placement="bottom">
                            <Button
                                size="small"
                                type="text"
                                icon={<ColumnHeightOutlined />}
                                onClick={() =>
                                    setExpandedOverride(new Set(collectGroupKeys(roots)))
                                }
                                aria-label="Expand all"
                            />
                        </Tooltip>
                    )}
                    {foundation.showCollapse && (
                        <Tooltip title="Collapse all" placement="bottom">
                            <Button
                                size="small"
                                type="text"
                                icon={<VerticalAlignMiddleOutlined />}
                                onClick={() => setExpandedOverride(new Set())}
                                aria-label="Collapse all"
                            />
                        </Tooltip>
                    )}
                </div>
            )}

            {loading && (
                <div className="wg-progress">
                    <div className="wg-progress-bar" />
                </div>
            )}

            <main
                ref={(el) => {
                    gridAreaRef.current = el;
                }}
                className="grid-area"
                onScroll={(e) => {
                    const el = e.currentTarget;
                    const v = el.scrollLeft > 1 ? 'true' : 'false';
                    if (el.dataset.hscroll !== v) el.dataset.hscroll = v;
                    if (!scrollTicking.current) {
                        scrollTicking.current = true;
                        requestAnimationFrame(() => {
                            scrollTicking.current = false;
                            setViewport((prev) =>
                                prev.top === el.scrollTop ? prev : { ...prev, top: el.scrollTop }
                            );
                        });
                    }
                }}
            >
                {!ready ? (
                    <div className="grid-loading">
                        <Spin size="large" />
                    </div>
                ) : (
                    <HeatMapGrid
                        nameHeader={nameHeader}
                        columns={columns}
                        roots={roots}
                        totalRow={totalRow}
                        showLeaves={showLeaves}
                        blankGroupRows={blankGroupRows}
                        expanded={expanded}
                        onToggle={toggle}
                        viewportTop={viewport.top}
                        viewportHeight={viewport.height}
                        gridLines={foundation.showGridLines}
                        showNameHeader={showNameHeader}
                        showTooltip={foundation.showTooltip}
                    />
                )}
            </main>

            <HeatSettingsPanel
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                columns={columns}
                onColumnsChange={onColumnsChange}
                showLeaves={showLeaves}
                onShowLeavesChange={onShowLeavesChange}
                blankGroupRows={blankGroupRows}
                onBlankGroupRowsChange={onBlankGroupRowsChange}
                showTotal={showTotal}
                onShowTotalChange={onShowTotalChange}
                showNameHeader={showNameHeader}
                onShowNameHeaderChange={onShowNameHeaderChange}
                leafRows={leafRows}
                seriesLabel={seriesLabel}
                onReset={onReset}
                templatesSection={templatesSection}
            />
        </div>
    );
}
