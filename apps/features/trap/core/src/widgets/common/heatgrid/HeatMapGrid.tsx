import { useMemo, useRef } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import {
    DEFAULT_MISSING_COLOR,
    DEFAULT_OUTLIER_COLOR,
    buildHeatScales,
    flattenVisibleRows,
    heatRgba,
    readableText,
    renderColumns,
    strengthRgba,
    type ColumnDef,
    type ColumnNode,
    type GridRow,
} from './types';
import './heatgrid.scss';
import { buildHeaderModel, fmt } from './utils';

/**
 * Heat Map Grid renderer: virtualized tree rows, N-tier stacked headers,
 * pinned total, frozen name column, shared-scale color-ramp cell backgrounds.
 * No performance concepts (signed over/under, diverging bars) live here —
 * that's the Performance Grid's domain (src/perfgrid).
 */

const NUM_COL_WIDTH = 88;
/** Uniform body-row height — required for windowed rendering math. */
const ROW_H = 28;
const HEADER_ROW_H = 28;
const TOTAL_ROW_H = 32;
const OVERSCAN_ROWS = 12;

interface Props {
    nameHeader: string;
    /** Column catalog — the renderable subset is projected from it internally. */
    columns: ColumnDef[];
    roots: GridRow[];
    /** Pinned under the header; null hides the total row. */
    totalRow: GridRow | null;
    showLeaves: boolean;
    /** Blank the cells of in-tree rollup (group) rows — labels only, no values/color. */
    blankGroupRows?: boolean;
    expanded: Set<string>;
    onToggle: (key: string) => void;
    /** Scroll window of the host container — drives row virtualization. */
    viewportTop: number;
    viewportHeight: number;
    /** Foundation toggle — false strips every cell border. Default true. */
    gridLines?: boolean;
    /** Show the dimension column's header label. Default true. */
    showNameHeader?: boolean;
    /** Show the per-cell hover tooltip. Default true. */
    showTooltip?: boolean;
}

export default function HeatMapGrid({
    nameHeader,
    columns,
    roots,
    totalRow,
    showLeaves,
    blankGroupRows = false,
    expanded,
    onToggle,
    viewportTop,
    viewportHeight,
    gridLines = true,
    showNameHeader = true,
    showTooltip = true,
}: Props) {
    const tableRef = useRef<HTMLTableElement | null>(null);
    const renderCols = useMemo(() => renderColumns(columns), [columns]);
    const header = useMemo(() => buildHeaderModel(renderCols), [renderCols]);
    const { depth, leaves, boundaries } = header;
    const numCols = leaves.length;
    const headerH = depth * HEADER_ROW_H;
    const fixedTop = headerH + (totalRow ? TOTAL_ROW_H : 0);

    const rows = useMemo(
        () => flattenVisibleRows(roots, expanded, showLeaves),
        [roots, expanded, showLeaves]
    );

    const heatScales = useMemo(() => buildHeatScales(leaves, rows), [leaves, rows]);

    /* ---------------- delegated cell tooltip ---------------- */
    // One fixed element, updated imperatively on hover — no per-cell wrappers, no
    // re-render of the virtualized table. Cells carry data-rk / data-ck.
    const tipRef = useRef<HTMLDivElement>(null);
    const rowByKey = useMemo(() => {
        const m = new Map<string, GridRow>();
        const add = (rs: GridRow[]) =>
            rs.forEach((r) => {
                m.set(r.key, r);
                if (r.children?.length) add(r.children);
            });
        add(roots);
        if (totalRow) m.set(totalRow.key, totalRow);
        return m;
    }, [roots, totalRow]);
    const colByKey = useMemo(() => new Map(leaves.map((c) => [c.key, c])), [leaves]);

    const esc = (s: string) =>
        s.replace(/[&<>]/g, (ch) => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;'));

    const onCellOver = (e: React.MouseEvent) => {
        const tip = tipRef.current;
        if (!tip) return;
        if (!showTooltip) {
            tip.classList.remove('show');
            return;
        }
        const td = (e.target as HTMLElement).closest('td[data-rk]') as HTMLElement | null;
        if (!td) {
            tip.classList.remove('show');
            return;
        }
        const row = rowByKey.get(td.dataset.rk ?? '');
        const col = colByKey.get(td.dataset.ck ?? '');
        if (!row || !col) {
            tip.classList.remove('show');
            return;
        }
        const hd = row.heatCells?.[col.key];
        const raw =
            hd?.kind === 'blank'
                ? 'No data'
                : fmt(
                      row.values[col.key] ?? null,
                      row.decimals ?? col.decimals ?? 1,
                      col.thousands ?? false
                  );
        const parts = [
            `<div class="hg-tip-series">${esc(row.label)}</div>`,
            `<div class="hg-tip-period">${esc(col.label)}</div>`,
            `<div class="hg-tip-line"><span>Raw</span><b>${esc(raw)}</b></div>`,
        ];
        if (hd?.note) parts.push(`<div class="hg-tip-note">${esc(hd.note)}</div>`);
        if (hd?.kind === 'outlier')
            parts.push(`<div class="hg-tip-flag">Outlier · excluded from scaling</div>`);
        tip.innerHTML = parts.join('');

        const widgetOffset = tableRef.current?.getBoundingClientRect();
        tip.style.left = `${e.pageX - (widgetOffset?.x || 0 + 124)}px`;
        tip.style.top = `${e.pageY - (widgetOffset?.y || 0) + 84}px`;

        tip.classList.add('show');
    };
    const onCellLeave = () => tipRef.current?.classList.remove('show');

    // The name column earns width from what is actually visible.
    const nameWidth = useMemo(() => {
        const est = (label: string, depthOf: number, isGroup: boolean) =>
            14 + depthOf * 18 + 18 + label.length * (isGroup ? 5.8 : 5.4) + (isGroup ? 38 : 0) + 12;
        let max = totalRow ? est(totalRow.label, 0, false) : 230;
        for (const r of rows) max = Math.max(max, est(r.label, r.depth, !r.isLeaf));
        return Math.round(Math.max(230, Math.min(430, max)));
    }, [rows, totalRow]);

    const minWidth = nameWidth + numCols * NUM_COL_WIDTH;

    // Windowed rendering: only rows near the viewport hit the DOM.
    const first = Math.max(0, Math.floor((viewportTop - fixedTop) / ROW_H) - OVERSCAN_ROWS);
    const last = Math.min(
        rows.length,
        Math.ceil((viewportTop - fixedTop + viewportHeight) / ROW_H) + OVERSCAN_ROWS
    );
    const slice = rows.slice(first, last);
    const topPad = first * ROW_H;
    const bottomPad = (rows.length - last) * ROW_H;

    const renderCell = (col: ColumnNode, row: GridRow, groupStart: boolean, isTotal: boolean) => {
        const cls = groupStart ? ' group-start' : '';
        // Optionally blank in-tree rollup rows — labels only, no values or color.
        // The pinned total is exempt so it stays a meaningful summary.
        if (blankGroupRows && !row.isLeaf && !isTotal) {
            return <td key={col.key} className={`num${cls}`} />;
        }
        const v = row.values[col.key] ?? null;
        const dp = row.decimals ?? col.decimals ?? 1;
        const hd = col.heat ? row.heatCells?.[col.key] : undefined;

        // Heat is layered as a background-image so the cell's opaque background stays
        // underneath — sticky rows (total) must not bleed scrolled content.
        // Cell colors are configuration, not hardcoded: state colors come from the
        // heat spec (source default → user override) and fall back to the generic
        // defaults; strength/value shading uses the (possibly custom) ramp.
        let heatStyle: React.CSSProperties | undefined;
        let text = fmt(v, dp, col.thousands ?? false);

        if (hd?.kind === 'blank') {
            heatStyle = { backgroundColor: col.heatMissing ?? DEFAULT_MISSING_COLOR };
            text = ''; // no value (excluded from scaling upstream)
        } else if (hd?.kind === 'outlier') {
            const bg = col.heatOutlier ?? DEFAULT_OUTLIER_COLOR;
            heatStyle = { backgroundColor: bg, color: readableText(bg) }; // value kept + flagged in tooltip
        } else if (hd?.kind === 'spectrum' && hd.strength != null) {
            // data-source-driven strength (row-level scaling + polarity, done upstream)
            const c = strengthRgba(hd.strength, col.heatRamp ?? 'ryg');
            heatStyle = { backgroundImage: `linear-gradient(${c}, ${c})` };
        } else if (col.heat && v != null) {
            // value-vs-shared-scale shading (e.g. AQI)
            const rgba = heatRgba(v, heatScales[col.heat]);
            if (rgba) {
                const c = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3].toFixed(3)})`;
                heatStyle = { backgroundImage: `linear-gradient(${c}, ${c})` };
            }
        }

        const negative = !hd && v != null && v < 0 && col.colorNegative === true;
        // data-rk/ck drive the delegated cell tooltip (heat columns only).
        const tip = col.heat ? { 'data-rk': row.key, 'data-ck': col.key } : undefined;
        return (
            <td
                key={col.key}
                className={`num${negative ? ' neg-val' : ''}${cls}`}
                style={heatStyle}
                {...tip}
            >
                {text}
            </td>
        );
    };

    const numericCells = (row: GridRow, isTotal = false) =>
        leaves.map((c, i) => renderCell(c, row, boundaries.has(i), isTotal));

    return (
        <>
            <table
                className={`hg-table${gridLines ? '' : ' no-lines'}`}
                style={{ minWidth, '--hdr-h': `${headerH}px` } as React.CSSProperties}
                onMouseOver={onCellOver}
                onMouseLeave={onCellLeave}
                ref={tableRef}
            >
                <colgroup>
                    {/* The name/tree column flexes to absorb spare width; value columns keep a
            fixed width so they never stretch and group headers stay centered over
            them (AG-Grid-style). The table's minWidth floors the name col at
            nameWidth, so it never collapses below its content. */}
                    <col />
                    {Array.from({ length: numCols }, (_, i) => (
                        <col key={i} style={{ width: NUM_COL_WIDTH }} />
                    ))}
                </colgroup>
                <thead>
                    {header.rows.map((cells, level) => (
                        <tr key={level}>
                            {level === 0 && (
                                <th
                                    className="cell-name h-name"
                                    rowSpan={depth}
                                    style={{ height: headerH }}
                                >
                                    {showNameHeader ? nameHeader : null}
                                </th>
                            )}
                            {cells.map((c) => (
                                <th
                                    key={c.node.key}
                                    className={`${c.isGroup ? 'h-group' : 'h-sub'}${
                                        boundaries.has(c.startLeaf) ? ' group-start' : ''
                                    }`}
                                    colSpan={c.colSpan > 1 ? c.colSpan : undefined}
                                    rowSpan={c.rowSpan > 1 ? c.rowSpan : undefined}
                                    title={c.node.tooltip}
                                    style={{
                                        top: level * HEADER_ROW_H,
                                        height: c.rowSpan === 1 ? HEADER_ROW_H : undefined,
                                    }}
                                >
                                    {c.node.label}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {totalRow && (
                        <tr className="row-total">
                            <th className="cell-name" scope="row">
                                <span className="chev-spacer" />
                                <span className="label" title={totalRow.label}>
                                    {totalRow.label}
                                </span>
                            </th>
                            {numericCells(totalRow, true)}
                        </tr>
                    )}
                    {rows.length === 0 ? (
                        <tr className="row-empty">
                            <td colSpan={1 + numCols}>No rows match the current filter.</td>
                        </tr>
                    ) : (
                        <>
                            {topPad > 0 && (
                                <tr className="vpad" aria-hidden="true">
                                    <td colSpan={1 + numCols} style={{ height: topPad }} />
                                </tr>
                            )}
                            {slice.map((row) => {
                                const isOpen = expanded.has(row.key);
                                return (
                                    <tr
                                        key={row.key}
                                        className={`row depth-${Math.min(row.depth, 3)} ${row.isLeaf ? 'leaf' : 'group'}`}
                                        onClick={row.isLeaf ? undefined : () => onToggle(row.key)}
                                    >
                                        <th
                                            className="cell-name"
                                            scope="row"
                                            style={{ paddingLeft: 14 + row.depth * 18 }}
                                        >
                                            {row.isLeaf ? (
                                                <span className="chev-spacer" />
                                            ) : (
                                                <CaretRightOutlined
                                                    className={`chev${isOpen ? ' open' : ''}`}
                                                />
                                            )}
                                            <span className="label" title={row.label}>
                                                {row.label}
                                            </span>
                                            {!row.isLeaf && (
                                                <span className="count">
                                                    {row.leafCount.toLocaleString()}
                                                </span>
                                            )}
                                        </th>
                                        {numericCells(row)}
                                    </tr>
                                );
                            })}
                            {bottomPad > 0 && (
                                <tr className="vpad" aria-hidden="true">
                                    <td colSpan={1 + numCols} style={{ height: bottomPad }} />
                                </tr>
                            )}
                        </>
                    )}
                </tbody>
            </table>
            <div className="hg-tip" ref={tipRef} role="tooltip" aria-hidden="true" />
        </>
    );
}
