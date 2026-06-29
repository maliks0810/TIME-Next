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

export interface SeriesToggle {
    key: string;
    label: string;
    sub?: string;
    on: boolean;
}

/* ---------------- catalog transforms (pure, immutable) ---------------- */

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
export const RAMP_STOPS: Record<'gyor' | 'ryg', [number, number, number][]> = {
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
