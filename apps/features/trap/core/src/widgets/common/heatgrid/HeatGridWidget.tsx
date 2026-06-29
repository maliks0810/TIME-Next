/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, Tooltip } from 'antd';
import {
    ColumnHeightOutlined,
    FileExcelOutlined,
    SettingOutlined,
    VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import HeatMapGrid from './HeatMapGrid';
import HeatSettingsPanel, { type TemplatesSection } from './HeatSettingsPanel';
import { SpectrumLegend } from './SpectrumLegend';
import { type ColumnDef, type FoundationConfig, type GridRow, type HeatmapSettings } from './types';
import {
    activeGrouping,
    collectGroupKeys,
    columnAxisGroups,
    flattenVisibleRows,
    heatScales,
    renderColumns,
    setHeatMissingColor,
    setHeatOutlierColor,
    setHeatRamp,
    setHiddenLeaves,
    setMemberSelected,
} from './helpers';
import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import './heatgrid.scss';
import { catalogToSettings, createTemplateStore, loadSettings } from './store/templateStore';

/**
 * Generic Heat Map Grid widget — the production consumer of every cwd_heatmap
 * instance regardless of schemaKey (econ.indicators.heatmap,
 * credit.spreads.heatmap, etc.).
 *
 * Architecture (matches CommentWidget / WidgetHost pattern):
 *   - WidgetHost calls executeWidget(cwd_heatmap, { schemaKey, ... }, mode)
 *   - Gateway's ds_heatmap router resolves the schemaKey to the right handler
 *   - Handler returns HeatGridData { columns, roots, total }
 *   - WidgetHost injects `result` into this widget as a prop
 *   - This widget reads result.columns/roots/total directly — no client-side
 *     catalog construction, no data fetching. Per-widget display state
 *     (chips, hidden columns, ramp choice) is layered on top as catalog
 *     transforms (setMemberSelected, setHiddenLeaves, setHeatRamp).
 *
 * Per the heatgrid contract README:
 *   "The React client passes the response straight into <HeatGridWidget> with
 *    no reshaping. The grid never aggregates; the resolver rolls the tree up
 *    by groupBy."
 *
 * Configuration via widgetInstance.config.params:
 *   schemaKey        — string, picks the data source on the gateway side
 *   nameHeader       — string, label for the dimension column (e.g., "Indicator")
 *   title            — string, widget title
 *   leafLabel        — string, terminal-row label in the grouping path crumb
 *   defaultGroupBy   — string[], initial row-axis dimensions when no localStorage entry
 *   settingsStorageKey         — string, localStorage key for ephemeral display settings
 *   templatesStorageKey        — string, localStorage key for saved templates list
 *   activeTemplateStorageKey   — string, localStorage key for the currently-applied template id
 *   settingsView     — 'drawer' | 'modal', settings panel presentation
 *   showTitle / showGrouping / showSearch / showLegend / showTooltip /
 *   showExport / showExpand / showCollapse / showGridLines — foundation toggles
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
    settingsExtra?: ReactNode;
    toolbarExtras?: ReactNode;
    search?: ReactNode;
    view: 'drawer' | 'modal';
    legend?: ReactNode;

    nameHeader: string;
    columns: ColumnDef[];
    roots: GridRow[];
    totalRow: GridRow | null;
    showLeaves: boolean;
    onShowLeavesChange: (v: boolean) => void;
    blankGroupRows?: boolean;
    onBlankGroupRowsChange?: (v: boolean) => void;
    showTotal?: boolean;
    onShowTotalChange?: (v: boolean) => void;
    showNameHeader?: boolean;
    onShowNameHeaderChange?: (v: boolean) => void;
    onColumnsChange: (next: ColumnDef[]) => void;

    groupingLabels: string[];
    leafLabel?: string;

    leafRows?: { title: string; sub?: string };
    seriesLabel?: string;
    onReset: () => void;
    templatesSection?: TemplatesSection<any>;
    foundation: FoundationConfig;
    /** Fresh data in flight — shows the top progress bar + the grid skeleton. */
    loading?: boolean;
    exportMeta?: ExportMeta;
}

export interface SettingsTemplate<T> {
    id: string;
    name: string;
    settings: T;
}

// ---------------------------------------------------------------------------
// Settings defaults + load/save
// ---------------------------------------------------------------------------
// Defaults are generic — no domain (no AQI continent, no econ category) baked
// in. Initial grouping is empty; the user's drawer selections drive it (no preset
// grouping config). The drawer + server catalog are the source of truth.
const BASE_DEFAULTS: HeatmapSettings = {
    groupBy: [],
    hiddenColumns: [],
    showLeaves: true,
    blankGroupRows: false,
    showTotal: true,
    showNameHeader: true,
    selectedAxisMembers: [],
    heatConfig: {},
};

function makeDefaults(defaultGroupBy: string[]): HeatmapSettings {
    return { ...structuredClone(BASE_DEFAULTS), groupBy: defaultGroupBy };
}

// ---------------------------------------------------------------------------
// Apply user display state on top of the server catalog.
//
// This is the heart of the production flow described in the heatgrid README:
//   "Display state is client-side. Which quarters are selected, which columns
//    are hidden, and the color ramp are projections of the returned catalog
//    (the set* transforms in ../types.ts) — instant, no round-trip."
//
// We do NOT touch the row data (roots/total) — that's already shaped by the
// server. Only the catalog gets re-projected on every settings change.
// ---------------------------------------------------------------------------
function applySettingsToCatalog(
    serverColumns: ColumnDef[],
    settings: HeatmapSettings
): ColumnDef[] {
    let c = serverColumns;

    // 1) Per-scale color overrides (ramp + outlier/no-data) the user picked
    for (const [scale, cfg] of Object.entries(settings.heatConfig)) {
        if (cfg.ramp) c = setHeatRamp(c, scale, cfg.ramp);
        if (cfg.outlierColor) c = setHeatOutlierColor(c, scale, cfg.outlierColor);
        if (cfg.missingColor) c = setHeatMissingColor(c, scale, cfg.missingColor);
    }

    // 2) Axis-group member chips — server marks members selectable+selected;
    //    we keep only settings.selectedAxisMembers on. If user has never
    //    touched the chips (empty array from defaults), respect server's
    //    initial `selected` state instead of forcing everything off.
    if (settings.selectedAxisMembers.length > 0) {
        for (const axis of columnAxisGroups(c)) {
            for (const m of axis.children ?? []) {
                if (m.role === 'group' && m.selectable) {
                    c = setMemberSelected(c, m.key, settings.selectedAxisMembers.includes(m.key));
                }
            }
        }
    }

    // 3) Column tree hidden leaves
    c = setHiddenLeaves(c, new Set(settings.hiddenColumns));

    return c;
}

// ---------------------------------------------------------------------------
// HeatGridWidget — the WidgetComponentProps-consuming entry point
// ---------------------------------------------------------------------------
export const HeatGridWidget = ({
    result,
    loading,
    error,
    mode,
    widgetInstance,
}: WidgetComponentProps) => {
    const { config } = widgetInstance;
    const params = config?.params ?? {};

    // -------- Config-driven knobs --------
    const view: 'drawer' | 'modal' = params.settingsView || 'modal';
    // Storage keys are AUTOMATIC (no designer textbox — they're an internal concern,
    // confusing to end users). Derived per widget-instance so each heat map persists
    // its own display settings + templates in localStorage without colliding. A
    // legacy instance that still has the param set keeps using it (backward-compat).
    const instanceKey = String(
        widgetInstance.id ??
            widgetInstance.instanceId ??
            widgetInstance.composedWidgetId ??
            widgetInstance.widgetDefinitionId ??
            'cwd_heatmap'
    );
    const settingsStorageKey = params.settingsStorageKey || `cwd_heatmap:${instanceKey}:settings`;
    const templatesStorageKey =
        params.templatesStorageKey || `cwd_heatmap:${instanceKey}:templates`;
    const activeTemplateStorageKey =
        params.activeTemplateStorageKey || `cwd_heatmap:${instanceKey}:activeTemplate`;
    const title = params.title || '';
    // Row-axis header, leaf-chip label, initial grouping, and the export file name
    // are AUTOMATIC — no designer textboxes. The row-axis header is derived from the
    // active grouping (see `nameHeader` after groupingLabels); the leaf chip and a
    // preset grouping are omitted so the user's drawer selections drive them; and the
    // export name just uses the widget title (with a generic fallback).
    const exportFileName = title || 'Heat map';
    const exportFileNameTitle = title || 'Heat map';
    const leafLabel = '';
    const defaultGroupBy: string[] = [];

    // Each toggle defaults to its definition.json default (true) so show/hide
    // wiring works even when an instance's params aren't fully populated — the
    // studio writes the schema defaults, but a sparse/legacy instance would
    // otherwise hide everything (undefined → falsy). Set a param to false in the
    // designer to hide that control.
    const foundation: FoundationConfig = {
        showTitle: params.showTitle ?? true,
        showGrouping: params.showGrouping ?? true,
        showSearch: params.showSearch ?? true,
        showLegend: params.showLegend ?? true,
        showTooltip: params.showTooltip ?? true,
        showExport: params.showExport ?? true,
        showExpand: params.showExpand ?? true,
        showCollapse: params.showCollapse ?? true,
        // Grid lines are spec styling, not a user option — always on (no toggle).
        showGridLines: true,
    };

    // -------- Templates store (localStorage) --------
    const storedTemplates = useMemo(
        () => createTemplateStore<HeatmapSettings>(templatesStorageKey, activeTemplateStorageKey),
        [templatesStorageKey, activeTemplateStorageKey]
    );

    // -------- Settings state (localStorage-backed) --------
    const defaults = useMemo(() => makeDefaults(defaultGroupBy), [defaultGroupBy]);
    const [settings, setSettingsState] = useState<HeatmapSettings>(() =>
        loadSettings(settingsStorageKey, defaults)
    );
    const setSettings = (next: HeatmapSettings) => {
        setSettingsState(next);
        try {
            localStorage.setItem(settingsStorageKey, JSON.stringify(next));
        } catch {
            /* persistence unavailable */
        }
    };

    // -------- Server payload (HeatGridData from the gateway) --------
    // Cast to the catalog/row types — WidgetComponentProps types `result` as
    // Record<string, unknown> because every widget shape is different. The
    // gateway guarantees the shape for cwd_heatmap; we narrow at the boundary.
    const serverColumns: ColumnDef[] = useMemo(
        () => (Array.isArray(result?.columns) ? (result!.columns as ColumnDef[]) : []),
        [result]
    );
    const roots: GridRow[] = useMemo(
        () => (Array.isArray(result?.roots) ? (result!.roots as GridRow[]) : []),
        [result]
    );
    const total: GridRow | null = useMemo(() => {
        const t = (result?.total ?? null) as GridRow | null;
        return t && typeof t === 'object' ? t : null;
    }, [result]);

    // -------- Apply settings projections to the server catalog --------
    const columns = useMemo(
        () => applySettingsToCatalog(serverColumns, settings),
        [serverColumns, settings]
    );

    // -------- Grouping path crumb labels (driven by the server catalog) --------
    // Lookup map keyed by dimension key -> short label. Read from the columns
    // catalog so the breadcrumbs always match the dimensions the server actually
    // emitted — no hardcoded dimension table.
    const groupingLabels = useMemo(() => {
        const labelByKey = new Map<string, string>();
        for (const c of serverColumns) {
            if (c.role === 'dimension') labelByKey.set(c.key, c.label);
        }
        return settings.groupBy.map((k) => labelByKey.get(k) ?? k);
    }, [serverColumns, settings.groupBy]);

    // Row-axis header is automatic: it reflects the active grouping selection
    // (e.g. "Region / Country"), blank when nothing is grouped.
    const nameHeader = groupingLabels.join(' / ');

    // -------- Color legend (spectrum + outlier + no-data) --------
    // Built automatically from the catalog's first heat scale so it always matches
    // the cells; the chrome gates it on foundation.showLegend.
    const heatScaleList = heatScales(columns);
    const legend = heatScaleList.length ? (
        <SpectrumLegend
            ramp={heatScaleList[0].ramp}
            lowLabel="Low"
            highLabel="High"
            showOutlier
            showNoData
            outlierColor={heatScaleList[0].outlierColor}
            missingColor={heatScaleList[0].missingColor}
        />
    ) : undefined;

    // -------- Drawer round-trip: catalog edits → settings --------
    const onColumnsChange = (next: ColumnDef[]) => {
        const s = catalogToSettings(next, settings);
        // If user collapsed grouping to flat, force leaves on so the grid still
        // renders something (otherwise an empty grid is confusing).
        setSettings(s.groupBy.length === 0 ? { ...s, showLeaves: true } : s);
    };

    // -------- Templates: load/save/update/delete --------
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
        storedTemplates.loadActiveId
    );
    const [templates, setTemplates] = useState<SettingsTemplate<HeatmapSettings>[]>(
        storedTemplates.loadTemplates
    );

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

    // Error / loading / empty. Unlike the plain data grid, the heat map keeps its
    // chrome during a load and shows the top progress bar + an in-grid skeleton
    // (see HeatGridWidgetBase + HeatMapGrid) rather than a blank spinner — so the
    // header/cells read as "loading", not "empty". (After all hooks above to keep
    // hook order stable.)
    if (error) {
        return (
            <WidgetCardShell>
                <WidgetErrorState message={error} />
            </WidgetCardShell>
        );
    }

    // Fresh data in flight — or the first paint before the gateway responds, when
    // result is still undefined. Drives the progress bar + skeleton below. The
    // `mode !== 'preview'` guard is ONLY so the designer thumbnail (no gateway call,
    // so result stays undefined) shows an empty grid instead of an endless skeleton
    // — it has no effect in live/workflow mode. No preview sample data is rendered.
    const busy = loading || (!result && mode !== 'preview');

    // Settled with genuinely nothing to show → the shared empty message (never
    // during a load, so the skeleton isn't pre-empted by "No data").
    if (!busy && serverColumns.length === 0 && roots.length === 0 && mode !== 'preview') {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12 }}>No heat map data available.</div>
            </WidgetCardShell>
        );
    }

    return (
        <WidgetCardShell>
            <HeatGridWidgetBase
                view={view}
                foundation={foundation}
                loading={busy}
                legend={legend}
                className={''}
                title={<span>{title}</span>}
                nameHeader={nameHeader}
                columns={columns}
                roots={roots}
                totalRow={settings.showTotal ? total : null}
                showLeaves={settings.showLeaves}
                onShowLeavesChange={(v) => setSettings({ ...settings, showLeaves: v })}
                blankGroupRows={settings.blankGroupRows}
                onBlankGroupRowsChange={(v) => setSettings({ ...settings, blankGroupRows: v })}
                showTotal={settings.showTotal}
                onShowTotalChange={(v) => setSettings({ ...settings, showTotal: v })}
                showNameHeader={settings.showNameHeader}
                onShowNameHeaderChange={(v) => setSettings({ ...settings, showNameHeader: v })}
                onColumnsChange={onColumnsChange}
                groupingLabels={groupingLabels}
                onReset={() => setSettings(structuredClone(defaults))}
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
                exportMeta={exportMeta}
            />
        </WidgetCardShell>
    );
};

// ---------------------------------------------------------------------------
// HeatGridWidgetBase — the chrome (toolbar, drawer, virtualization, export).
// Unchanged from before; lives here as the presentation half of the widget.
// ---------------------------------------------------------------------------
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
    foundation,
    loading = false,
    exportMeta,
    view,
}: Props) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(null);
    const [viewport, setViewport] = useState({ top: 0, height: 400 });
    const [exporting, setExporting] = useState(false);

    const groupingSig = activeGrouping(columns)
        .map((group: any) => group.key)
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
            const { exportToExcel } = await import('./exportExcel');
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
                    {exportMeta && foundation.showExport && (
                        <Tooltip title="Export to Excel — current view">
                            <Button
                                type="text"
                                size="small"
                                icon={<FileExcelOutlined />}
                                loading={exporting}
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

            <div
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
                    loading={loading}
                />
            </div>

            <HeatSettingsPanel
                view={view}
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
