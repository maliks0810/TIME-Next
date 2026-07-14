/* eslint-disable  @typescript-eslint/no-explicit-any */
import { ReactNode, useState, useEffect, useMemo, useRef } from 'react';
import { ExportMeta } from '../HeatGridWidget';
import HeatMapGrid from '../HeatMapGrid';
import HeatSettingsPanel, { TemplatesSection } from '../HeatSettingsPanel';
import { ColumnDef, GridRow, FoundationConfig } from '../types';
import { Controls } from './Controls';
import { TitleBar } from './TitleBar';
import { Spin } from 'antd';
import { activeGrouping, renderColumns, flattenVisibleRows } from '../helpers';

export interface Props {
    view: 'drawer' | 'modal';
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
    view,
}: Props) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(null);
    const [viewport, setViewport] = useState({ top: 0, height: 400 });
    const [exporting, setExporting] = useState(false);

    const groupingSig = activeGrouping(columns)
        .map(({ key }) => key)
        .join('|');
    useEffect(() => {
        setExpandedOverride(null);
    }, [groupingSig]);

    const defaultExpanded = useMemo(
        () => new Set(roots.filter((node) => !node.isLeaf).map((node) => node.key)),
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
        const measure = () => setViewport((viewport) => ({ ...viewport, height: el.clientHeight }));
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
            const { exportToExcel } = await import('../../heatgrid/exportExcel');
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

    const onScroll = (e: any) => {
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
    };
    const toggleDrawer = () => {
        setDrawerOpen((prev) => !prev);
    };
    return (
        <div className={`widget ${className}`}>
            <TitleBar
                foundation={foundation}
                exporting={exporting}
                onExport={onExport}
                toggleDrawer={toggleDrawer}
                title={title}
                ready={ready}
                exportMeta={exportMeta}
                titleActions={titleActions}
            />

            <Controls
                groupingLabels={groupingLabels}
                foundation={foundation}
                roots={roots}
                showLeaves={showLeaves}
                toggleDrawer={toggleDrawer}
                setExpandedOverride={setExpandedOverride}
                search={search}
                legend={legend}
                toolbarExtras={toolbarExtras}
                leafLabel={leafLabel}
            />

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
                onScroll={onScroll}
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
                view={view}
                open={drawerOpen}
                onClose={toggleDrawer}
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
