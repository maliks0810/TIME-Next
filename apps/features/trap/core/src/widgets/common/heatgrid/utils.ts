import { AQI_DIMENSIONS, MONTHS } from './mock';
import {
    HeatmapSettings,
    ColumnDef,
    ColumnNode,
    HeaderCell,
    headerDepth,
    HeaderModel,
} from './types';

/**
 * Build the heat catalog. Q2–Q4 stack their three months under the selectable
 * Quarter axisGroup (chips), while Jan/Feb/Mar and the annual Year sit as FLAT
 * top-level columns — so they appear as individual rows in the drawer's column
 * tree. All months share one 'aqi' color scale (Year excluded); the spectrum is
 * user-selectable in display settings, and per-column visibility is the tree.
 */
export function buildCatalog(settings: HeatmapSettings): ColumnDef[] {
    const hidden = new Set(settings.hiddenColumns);
    const cfg = settings.heatConfig['aqi'];
    const ramp = cfg?.ramp ?? 'gyor';

    const dims: ColumnDef[] = AQI_DIMENSIONS.map((d) => {
        const i = settings.groupBy.indexOf(d.key);
        return {
            key: d.key,
            label: d.label,
            role: 'dimension',
            groupable: true,
            groupIndex: i === -1 ? undefined : i,
        };
    });

    const month = (m: number): ColumnDef => ({
        key: `m${m}`,
        label: MONTHS[m - 1],
        role: 'value',
        decimals: 0,
        heat: {
            scale: 'aqi',
            label: 'AQI',
            ramp,
            outlierColor: cfg?.outlierColor,
            missingColor: cfg?.missingColor,
        },
        visible: !hidden.has(`m${m}`),
    });
    // The annual mean is a summary, not part of the monthly heat scale — no `heat`
    // means a plain (uncolored) cell while the months stay shaded.
    const year: ColumnDef = {
        key: 'avg',
        label: 'Year',
        tooltip: 'Annual mean AQI',
        role: 'value',
        decimals: 0,
        visible: !hidden.has('avg'),
    };

    // EXERCISE: Jan/Feb/Mar are NOT assigned to the axisGroup — they're flat
    // top-level value columns that show as individual rows in the column tree.
    // Q2–Q4 stay as selectable members of the Quarter axisGroup.
    const flatMonths: ColumnDef[] = [1, 2, 3].map(month);
    const quarterAxis: ColumnDef = {
        key: 'quarters',
        label: 'Quarter',
        role: 'axisGroup',
        caption: 'Pick which quarters to show.',
        children: [2, 3, 4].map((q) => ({
            key: `q${q}`,
            label: `Q${q}`,
            role: 'group',
            selectable: true,
            selected: settings.quarters.includes(`q${q}`),
            children: [month(q * 3 - 2), month(q * 3 - 1), month(q * 3)],
        })),
    };

    return [...dims, year, ...flatMonths, quarterAxis];
}
/** Lay out an arbitrary-depth column tree as stacked header rows. */
export function buildHeaderModel(columns: ColumnNode[]): HeaderModel {
    const depth = headerDepth(columns);
    const rows: HeaderCell[][] = Array.from({ length: depth }, () => []);
    const leaves: ColumnNode[] = [];
    const boundaries = new Set<number>([0]);

    const countLeaves = (n: ColumnNode): number =>
        n.children?.length ? n.children.reduce((acc, c) => acc + countLeaves(c), 0) : 1;

    const walk = (node: ColumnNode, level: number) => {
        const isGroup = !!node.children?.length;
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
        // A flat column following a stacked group starts a new visual block.
        if (i > 0 && columns[i - 1].children?.length) boundaries.add(leaves.length);
        walk(node, 0);
    });

    return { depth, rows, leaves, boundaries };
}

export function fmt(v: number | null, dp: number, thousands: boolean): string {
    if (v == null) return '—';
    return thousands
        ? v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
        : v.toFixed(dp);
}
