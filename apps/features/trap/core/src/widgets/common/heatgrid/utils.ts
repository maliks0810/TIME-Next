import {
    type ColumnNode,
    type HeaderCell,
    type HeaderModel,
    headerDepth,
} from './types';

/**
 * Generic utility helpers for the heat map grid.
 *
 * Domain-free by design — anything that knows about months, quarters,
 * dimensions, or specific scales belongs in a consumer (or in the server
 * payload the widget consumes), not in this file.
 *
 * Exports:
 *   buildHeaderModel — lays out an arbitrary-depth column tree as stacked
 *                      header rows with correct rowspan/colspan accounting.
 *   fmt              — number formatter shared by the cell renderer and the
 *                      Excel exporter (em dash for null, optional thousands
 *                      separator, fixed decimals).
 *
 * (The previous AQI-specific `buildCatalog(settings)` was removed in the
 * server-shaping refactor. Catalogs now arrive ready-to-render from the
 * gateway as part of HeatGridData; the widget projects user display state
 * on top of that catalog instead of building it from scratch.)
 */

/**
 * Lay out an arbitrary-depth column tree as stacked header rows.
 *
 * Walks the catalog depth-first, producing:
 *   - `rows`       — header cells grouped by level (top-most = level 0)
 *   - `leaves`     — flat list of every value-leaf in left-to-right order
 *   - `boundaries` — set of leaf indices where a new visual block begins
 *                    (used by the renderer to draw vertical separators
 *                    between sibling groups)
 *
 * Group cells get rowSpan=1 + colSpan=<leafCount under them>; leaf cells
 * get colSpan=1 + rowSpan=<remaining depth> so they stretch down to the
 * bottom of the header band. The math is intentionally NOT collapsed into
 * a single pass — separate `countLeaves` and `walk` keeps each piece
 * obviously correct.
 */
export function buildHeaderModel(columns: ColumnNode[]): HeaderModel {
    const depth = headerDepth(columns);
    const rows: HeaderCell[][] = Array.from({ length: depth }, () => []);
    const leaves: ColumnNode[] = [];
    const boundaries = new Set<number>([0]);

    const countLeaves = (n: ColumnNode): number =>
        n.children?.length
            ? n.children.reduce((acc, c) => acc + countLeaves(c), 0)
            : 1;

    const walk = (node: ColumnNode, level: number) => {
        const isGroup = !!node.children?.length;

        // The first leaf under a group starts a new visual block — the renderer
        // draws a vertical separator there.
        if (isGroup) boundaries.add(leaves.length);

        rows[level].push({
            node,
            isGroup,
            colSpan: isGroup ? countLeaves(node) : 1,
            rowSpan: isGroup ? 1 : depth - level,
            startLeaf: leaves.length,
        });

        if (isGroup) {
            for (const child of node.children!) walk(child, level + 1);
        } else {
            leaves.push(node);
        }
    };

    columns.forEach((node, i) => {
        // A flat (leaf) column directly following a stacked group also starts
        // a new visual block — the boundary set captures both transitions so
        // the renderer can draw consistent separators between sibling regions.
        if (i > 0 && columns[i - 1].children?.length) boundaries.add(leaves.length);
        walk(node, 0);
    });

    return { depth, rows, leaves, boundaries };
}

/**
 * Format a numeric value for display in a cell or an export row.
 *
 *   - `null` → em dash ("—")
 *   - `thousands=true` → comma-grouped integer part (en-US locale)
 *   - otherwise → fixed-decimal `toFixed(dp)`
 *
 * `dp` is the number of decimals to render. Callers determine it from the
 * column's `decimals` field (with row-level override allowed).
 */
export function fmt(v: number | null, dp: number, thousands: boolean): string {
    if (v == null) return '—';
    return thousands
        ? v.toLocaleString('en-US', {
              minimumFractionDigits: dp,
              maximumFractionDigits: dp,
          })
        : v.toFixed(dp);
}