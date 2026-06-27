/**
 * Heat Map Grid — domain-agnostic datagrid contract. Owned and evolved
 * independently of the Performance Grid (src/perfgrid); the two share no code by
 * design, so changes here cannot break performance consumers.
 *
 * Initialized with two data models — a `ColumnDef[]` catalog and the row data
 * (`GridRow[]`). The drawer (row grouping, column toggles, AND the color-
 * spectrum picker) is a PROJECTION of the catalog, not a separate metadata
 * object. The grid never aggregates and contains no domain vocabulary.
 *
 * Cell vocabulary is heat-native: plain numbers with shared-scale color-ramp
 * backgrounds. A value column declares the heat `scale` it maps onto (its
 * "index"); columns sharing a scale share a min→max domain and one spectrum.
 */

/**
 * A custom spectrum — any begin→end gradient, optional midpoint. Data-driven or
 * user-picked; the grid interpolates it exactly like a preset.
 */
export interface RampSpec {
    from: string; // hex at t=0 (weak)
    mid?: string; // hex at t=0.5
    to: string; // hex at t=1 (strong)
}

export interface HeaderCell {
    node: ColumnNode;
    isGroup: boolean;
    colSpan: number;
    rowSpan: number;
    startLeaf: number;
}

export interface HeaderModel {
    depth: number;
    rows: HeaderCell[][];
    leaves: ColumnNode[];
    /** Leaf indices that start a visual block — vertical separators. */
    boundaries: Set<number>;
}

/**
 * coolwarm: diverging blue↔red around the midpoint (hot/cold).
 * gyor: sequential green → yellow → orange → red (low good, high bad).
 * ryg:  sequential red → yellow → green (weak → neutral → strong); yellow is the
 *       midpoint (t=0.5). The directional-strength spectrum for normalized signals.
 * RampSpec: a custom begin→end gradient.
 */
export type RampPreset = 'coolwarm' | 'gyor' | 'ryg';
export type HeatRamp = RampPreset | RampSpec;

export const isRampSpec = (r: HeatRamp): r is RampSpec => typeof r === 'object';

/** Preset spectra offered in the display-settings picker (extend freely). */
export const HEAT_RAMPS: { key: RampPreset; label: string }[] = [
    { key: 'ryg', label: 'Red → green' },
    { key: 'gyor', label: 'Green → red' },
    { key: 'coolwarm', label: 'Cool → warm' },
];

/**
 * Generic fallbacks for the two data-integrity states — the ONLY heat colors the
 * grid hardcodes, used when neither the source nor display settings configure
 * them. Everything else is a data-driven / user-picked input.
 */
export const DEFAULT_OUTLIER_COLOR = '#9ca3af'; // gray
export const DEFAULT_MISSING_COLOR = '#111418'; // near-black (no data)

/* ============================================================================
 * Render tree — the internal shape the renderer/exporter consume. Produced by
 * projecting the catalog (renderColumns); never authored directly.
 * ========================================================================== */

export interface ColumnNode {
    key: string;
    label: string;
    tooltip?: string;
    children?: ColumnNode[];
    decimals?: number;
    /** Group the integer part with thousands separators. Default false. */
    thousands?: boolean;
    /** Columns sharing a heat id are background-shaded on a common min→max scale. */
    heat?: string;
    /** Color ramp for the heat scale. Default 'gyor'. */
    heatRamp?: HeatRamp;
    /** Outlier / missing cell colors for this scale (see HeatSpec). */
    heatOutlier?: string;
    heatMissing?: string;
    /** Color negative values red. Default false — heat domains rarely want it. */
    colorNegative?: boolean;
}

export function leafColumns(nodes: ColumnNode[], out: ColumnNode[] = []): ColumnNode[] {
    for (const n of nodes) {
        if (n.children?.length) leafColumns(n.children, out);
        else out.push(n);
    }
    return out;
}

export function headerDepth(nodes: ColumnNode[]): number {
    let d = 1;
    for (const n of nodes) {
        if (n.children?.length) d = Math.max(d, 1 + headerDepth(n.children));
    }
    return d;
}

/* ============================================================================
 * Column catalog — the single source of truth the grid is initialized with.
 * One ColumnDef[] carries every available field/member with its own state.
 * ========================================================================== */

export type ColumnRole = 'dimension' | 'axisGroup' | 'group' | 'value';

/** Cross-cutting column series — value leaves sharing a `key` toggle together. */
export interface ColumnSeries {
    key: string;
    label: string;
    sub?: string;
    /** On/off; default true. */
    on?: boolean;
}

/** The heat mapping a value column declares: which shared scale + spectrum. */
export interface HeatSpec {
    /** Shared-scale id — columns with the same scale share a min→max domain. */
    scale: string;
    /** Label shown in the drawer's Color spectrum section, e.g. "AQI". */
    label: string;
    /** Color spectrum — preset or custom begin→end (user-selectable). */
    ramp: HeatRamp;
    /** Outlier (|z|>3) cell color. Default DEFAULT_OUTLIER_COLOR. */
    outlierColor?: string;
    /** Missing / no-data cell color. Default DEFAULT_MISSING_COLOR. */
    missingColor?: string;
}

/** Per-scale heat appearance a data source persists (user overrides of the
 *  source defaults). Applied to the HeatSpec when building the catalog. */
export interface HeatScaleConfig {
    ramp?: HeatRamp;
    outlierColor?: string;
    missingColor?: string;
}

export interface ColumnDef {
    key: string;
    label: string;
    tooltip?: string;
    role: ColumnRole;
    children?: ColumnDef[];

    /* value-leaf rendering */
    decimals?: number;
    /** Group the integer part with thousands separators. */
    thousands?: boolean;
    colorNegative?: boolean;
    heat?: HeatSpec;

    /* dimension (row axis) state */
    groupable?: boolean;
    groupIndex?: number;

    /* axisGroup descriptor */
    caption?: string;

    /* group (column-axis member) state */
    selectable?: boolean;
    selected?: boolean;

    /* value-leaf state */
    visible?: boolean;
    /** Cross-cutting series this leaf belongs to (drives the column toggles). */
    series?: ColumnSeries;
}

/* ---------------- catalog → render tree projection ---------------- */

export function renderColumns(
    catalog: ColumnDef[],
    opts: { includeHidden?: boolean } = {}
): ColumnNode[] {
    const includeHidden = opts.includeHidden ?? false;

    const leaf = (d: ColumnDef): ColumnNode | null => {
        if (d.series?.on === false) return null;
        if (!includeHidden && d.visible === false) return null;
        return {
            key: d.key,
            label: d.label,
            tooltip: d.tooltip,
            decimals: d.decimals,
            thousands: d.thousands,
            colorNegative: d.colorNegative,
            heat: d.heat?.scale,
            heatRamp: d.heat?.ramp,
            heatOutlier: d.heat?.outlierColor,
            heatMissing: d.heat?.missingColor,
        };
    };

    const group = (d: ColumnDef): ColumnNode | null => {
        const kids: ColumnNode[] = [];
        for (const c of d.children ?? []) {
            const n = c.role === 'value' ? leaf(c) : c.role === 'group' ? group(c) : null;
            if (n) kids.push(n);
        }
        if (!kids.length) return null;
        return { key: d.key, label: d.label, tooltip: d.tooltip, children: kids };
    };

    const out: ColumnNode[] = [];
    for (const d of catalog) {
        if (d.role === 'dimension') continue;
        if (d.role === 'axisGroup') {
            for (const m of d.children ?? []) {
                if (m.role !== 'group') continue;
                if (m.selectable && !m.selected) continue;
                const n = group(m);
                if (n) out.push(n);
            }
            continue;
        }
        if (d.role === 'group') {
            if (d.selectable && !d.selected) continue;
            const n = group(d);
            if (n) out.push(n);
            continue;
        }
        if (d.role === 'value') {
            const n = leaf(d);
            if (n) out.push(n);
        }
    }
    return out;
}

/* ---------------- catalog → drawer projections ---------------- */

function forEachValue(defs: ColumnDef[], fn: (d: ColumnDef) => void): void {
    for (const d of defs) {
        if (d.role === 'value') fn(d);
        if (d.children?.length) forEachValue(d.children, fn);
    }
}

export function groupingDims(catalog: ColumnDef[]): ColumnDef[] {
    return catalog.filter((d) => d.role === 'dimension' && d.groupable);
}

export function activeGrouping(catalog: ColumnDef[]): ColumnDef[] {
    return groupingDims(catalog)
        .filter((d) => d.groupIndex != null)
        .sort((a, b) => a.groupIndex! - b.groupIndex!);
}

export function columnAxisGroups(catalog: ColumnDef[]): ColumnDef[] {
    return catalog.filter((d) => d.role === 'axisGroup');
}

export interface SeriesToggle {
    key: string;
    label: string;
    sub?: string;
    on: boolean;
}

/** Distinct cross-cutting series in first-appearance order — the column toggles. */
export function seriesToggles(catalog: ColumnDef[]): SeriesToggle[] {
    const out: SeriesToggle[] = [];
    forEachValue(catalog, (d) => {
        if (!d.series) return;
        if (!out.some((s) => s.key === d.series!.key)) {
            out.push({
                key: d.series.key,
                label: d.series.label,
                sub: d.series.sub,
                on: d.series.on !== false,
            });
        }
    });
    return out;
}

export function hiddenFields(catalog: ColumnDef[]): Set<string> {
    const s = new Set<string>();
    forEachValue(catalog, (d) => {
        if (d.visible === false) s.add(d.key);
    });
    return s;
}

/** Distinct heat scales in the catalog — drives the Color spectrum picker. */
export function heatScales(catalog: ColumnDef[]): HeatSpec[] {
    const out: HeatSpec[] = [];
    forEachValue(catalog, (d) => {
        if (d.heat && !out.some((s) => s.scale === d.heat!.scale)) {
            out.push({
                scale: d.heat.scale,
                label: d.heat.label,
                ramp: d.heat.ramp,
                outlierColor: d.heat.outlierColor,
                missingColor: d.heat.missingColor,
            });
        }
    });
    return out;
}

/* ---------------- catalog transforms (pure, immutable) ---------------- */

function deepMap(defs: ColumnDef[], fn: (d: ColumnDef) => ColumnDef): ColumnDef[] {
    return defs.map((d) => {
        const m = fn(d);
        return m.children?.length ? { ...m, children: deepMap(m.children, fn) } : m;
    });
}

export function setGrouping(catalog: ColumnDef[], orderedKeys: string[]): ColumnDef[] {
    return deepMap(catalog, (d) => {
        if (d.role !== 'dimension') return d;
        const i = orderedKeys.indexOf(d.key);
        return { ...d, groupIndex: i === -1 ? undefined : i };
    });
}

export function setMemberSelected(
    catalog: ColumnDef[],
    memberKey: string,
    selected: boolean
): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'group' && d.selectable && d.key === memberKey ? { ...d, selected } : d
    );
}

export function setSeriesOn(catalog: ColumnDef[], seriesKey: string, on: boolean): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.series?.key === seriesKey
            ? { ...d, series: { ...d.series, on } }
            : d
    );
}

export function setHiddenLeaves(catalog: ColumnDef[], hidden: ReadonlySet<string>): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' ? { ...d, visible: !hidden.has(d.key) } : d
    );
}

/** Set the color spectrum for every column on a heat scale. */
export function setHeatRamp(catalog: ColumnDef[], scale: string, ramp: HeatRamp): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.heat?.scale === scale ? { ...d, heat: { ...d.heat, ramp } } : d
    );
}

/** Set the outlier (|z|>3) cell color for every column on a heat scale. */
export function setHeatOutlierColor(
    catalog: ColumnDef[],
    scale: string,
    outlierColor: string
): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.heat?.scale === scale
            ? { ...d, heat: { ...d.heat, outlierColor } }
            : d
    );
}

/** Set the missing / no-data cell color for every column on a heat scale. */
export function setHeatMissingColor(
    catalog: ColumnDef[],
    scale: string,
    missingColor: string
): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.heat?.scale === scale
            ? { ...d, heat: { ...d.heat, missingColor } }
            : d
    );
}

/* ============================================================================
 * Rows — the second data model. Pre-aggregated by the server; values keyed by
 * leaf ColumnDef.key. null renders as an em dash.
 * ========================================================================== */

/**
 * How a cell maps to a heat treatment — a fixed, generic contract (NOT bespoke
 * per dataset). The data source tags every cell with a `kind`; the grid renders
 * each kind the same way, using the scale's configured colors:
 *   - 'spectrum' → shaded by `strength` (0 weak → 1 strong) on the ramp
 *   - 'blank'    → the no-data color   (e.g. missing, excluded from scaling)
 *   - 'outlier'  → the outlier color   (e.g. |z|>3, excluded from normalization)
 * Computed UPSTREAM (the grid never derives it); keyed by leaf ColumnDef.key
 * alongside `values`.
 */
export type HeatKind = 'spectrum' | 'blank' | 'outlier';

export interface HeatDatum {
    /** The mapping enum — which treatment this cell gets. */
    kind: HeatKind;
    /** Ramp position 0..1 (0 weak → 1 strong); used when kind === 'spectrum'. */
    strength?: number;
    /** Polarity-adjusted interpretation, surfaced in the cell tooltip. */
    note?: string;
}

export interface GridRow {
    key: string;
    label: string;
    depth: number;
    isLeaf: boolean;
    leafCount: number;
    children: GridRow[];
    values: Record<string, number | null>;
    /** Optional pre-computed heat per leaf key — see HeatDatum. Absent → value-shaded. */
    heatCells?: Record<string, HeatDatum>;
    /** Per-row display precision override (each series may carry its own units). */
    decimals?: number;
}

export function flattenVisibleRows(
    rows: GridRow[],
    expanded: ReadonlySet<string>,
    showLeaves: boolean,
    out: GridRow[] = []
): GridRow[] {
    for (const r of rows) {
        if (r.isLeaf && !showLeaves) continue;
        out.push(r);
        if (!r.isLeaf && expanded.has(r.key)) {
            flattenVisibleRows(r.children, expanded, showLeaves, out);
        }
    }
    return out;
}

export function collectGroupKeys(rows: GridRow[], out: string[] = []): string[] {
    for (const r of rows) {
        if (!r.isLeaf) {
            out.push(r.key);
            collectGroupKeys(r.children, out);
        }
    }
    return out;
}

/* ============================================================================
 * Heat scales (shared by renderer and exporter) — compute a min→max domain per
 * scale from the visible rows, then map a value's position onto the ramp.
 * ========================================================================== */

export interface HeatScale {
    min: number;
    max: number;
    ramp: HeatRamp;
}

/** Sequential ramp control points (low t → high t). */
const RAMP_STOPS: Record<'gyor' | 'ryg', [number, number, number][]> = {
    // green → yellow → orange → red (low good, high bad)
    gyor: [
        [22, 163, 74],
        [250, 204, 21],
        [249, 115, 22],
        [220, 38, 38],
    ],
    // red → yellow → green (weak → neutral → strong); yellow lands at t=0.5
    ryg: [
        [220, 38, 38],
        [250, 204, 21],
        [22, 163, 74],
    ],
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function lerp3(
    a: [number, number, number],
    b: [number, number, number],
    f: number
): [number, number, number] {
    return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
    ];
}

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '').trim();
    if (h.length === 3)
        h = h
            .split('')
            .map((c) => c + c)
            .join('');
    const n = parseInt(h || '000000', 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Pick black or white text for legibility on an arbitrary (user-picked) fill. */
export function readableText(hex: string): string {
    const [r, g, b] = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#15181d' : '#ffffff';
}

/** Solid rgb for position t∈[0,1] on a ramp — used by the spectrum legend and
 *  by per-cell strength shading. Handles custom begin→end specs, then presets. */
export function rampRgb(t: number, ramp: HeatRamp): [number, number, number] {
    const tt = clamp01(t);
    if (isRampSpec(ramp)) {
        const from = hexToRgb(ramp.from);
        const to = hexToRgb(ramp.to);
        if (ramp.mid) {
            const mid = hexToRgb(ramp.mid);
            return tt < 0.5 ? lerp3(from, mid, tt * 2) : lerp3(mid, to, (tt - 0.5) * 2);
        }
        return lerp3(from, to, tt);
    }
    if (ramp === 'coolwarm') {
        const mid: [number, number, number] = [232, 232, 232];
        return tt < 0.5
            ? lerp3([59, 130, 246], mid, tt * 2)
            : lerp3(mid, [239, 68, 68], (tt - 0.5) * 2);
    }
    const pts = RAMP_STOPS[ramp];
    const n = pts.length - 1;
    const seg = Math.min(n - 1e-6, tt * n);
    const i = Math.floor(seg);
    return lerp3(pts[i], pts[i + 1], seg - i);
}

/** CSS gradient (left = weak/0 → right = strong/1) for the spectrum legend. */
export function rampGradient(ramp: HeatRamp, steps = 16): string {
    const stops: string[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const [r, g, b] = rampRgb(t, ramp);
        stops.push(`rgb(${r}, ${g}, ${b}) ${Math.round(t * 100)}%`);
    }
    return `linear-gradient(90deg, ${stops.join(', ')})`;
}

/** rgba() string for a pre-normalized strength cell (data-source driven). */
export function strengthRgba(strength: number, ramp: HeatRamp): string {
    const [r, g, b] = rampRgb(strength, ramp);
    return `rgba(${r}, ${g}, ${b}, 0.55)`;
}

export function buildHeatScales(leaves: ColumnNode[], rows: GridRow[]): Record<string, HeatScale> {
    const scales: Record<string, HeatScale> = {};
    for (const c of leaves) {
        if (c.heat && !scales[c.heat]) {
            scales[c.heat] = { min: Infinity, max: -Infinity, ramp: c.heatRamp ?? 'gyor' };
        }
    }
    for (const r of rows) {
        for (const c of leaves) {
            if (!c.heat) continue;
            const v = r.values[c.key];
            if (v == null) continue;
            const s = scales[c.heat];
            if (v < s.min) s.min = v;
            if (v > s.max) s.max = v;
        }
    }
    return scales;
}

/** rgba components for a value on a scale, or null when the cell is unshaded. */
export function heatRgba(v: number, scale: HeatScale): [number, number, number, number] | null {
    const span = scale.max - scale.min;
    if (span <= 0) return null;
    const t = clamp01((v - scale.min) / span);

    if (scale.ramp === 'coolwarm') {
        const a = Math.abs(t - 0.5) * 2 * 0.32;
        if (a < 0.02) return null;
        return t < 0.5 ? [59, 130, 246, a] : [239, 68, 68, a];
    }

    // sequential ramps (gyor / ryg): fade in with magnitude
    const [r, g, b] = rampRgb(t, scale.ramp);
    return [r, g, b, 0.2 + t * 0.3];
}

/* ============================================================================
 * Dimension descriptor — a generic groupable-field shape shared with the mock
 * server (which rolls the tree up by these).
 * ========================================================================== */

export interface DimensionDef {
    key: string;
    label: string;
    shortLabel: string;
    order?: string[];
}

export function dimensionMapOf(dims: DimensionDef[]): Record<string, DimensionDef> {
    return Object.fromEntries(dims.map((d) => [d.key, d]));
}

/**
 * Per-widget display settings persisted in localStorage. These are the user's
 * ephemeral choices layered on top of the column catalog the widget builds.
 *
 * `selectedAxisMembers` is the GENERIC field for "which axis-group chips are
 * currently active" — e.g., for AQI it carries quarter ids like ['q1','q2',
 * 'q3','q4']; for econ heatmap it carries year ids like ['2024','2025',
 * '2026']. Each widget owns the semantics of what the strings mean; the grid
 * just toggles columns based on which members are selected.
 *
 * (Renamed from `quarters` — that name leaked AQI domain vocabulary into the
 * shared contract. Update widgets that previously read settings.quarters to
 * use settings.selectedAxisMembers; everything else stays the same.)
 */
export interface HeatmapSettings {
    groupBy: string[];
    hiddenColumns: string[];
    showLeaves: boolean;
    blankGroupRows: boolean;
    showTotal: boolean;
    showNameHeader: boolean;
    selectedAxisMembers: string[];
    heatConfig: Record<string, HeatScaleConfig>;
}

export interface FoundationConfig {
    showTitle: boolean;
    showGrouping: boolean;
    /** Filter/search box — only where the widget supplies one (perf grid). */
    showSearch: boolean;
    /** Heat-scale legend — heatgrid only; ignored by the Performance Grid. */
    showLegend: boolean;
    /** Per-cell hover tooltip (both grids). */
    showTooltip: boolean;
    showExport: boolean;
    showExpand: boolean;
    showCollapse: boolean;
    showGridLines: boolean;
}
