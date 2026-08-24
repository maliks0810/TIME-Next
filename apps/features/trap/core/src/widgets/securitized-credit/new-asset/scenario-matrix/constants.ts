/**
 * Scenario Matrix — layout geometry and fixed constants.
 *
 * Designed for the fixed 1840px canvas (12 grid columns, zero gutter ⇒ one grid
 * column = 153px). The scenario column IS one grid column, so the workspace's
 * own resize maps exactly 1 grid column → 1 scenario. See SCENARIO_MATRIX_PLAN.md §8.
 */

/**
 * Column widths (px) — tuned for density. The scenario column is deliberately
 * narrower than a grid column (153px at the 1840 canvas): the content is a single
 * right-aligned number, so a wide cell just adds dead space. The trade-off is that
 * "one grid step = one scenario" is now approximate (a wider drag can reveal two).
 */
export const COLW = { name: 168, units: 68, scen: 116, add: 32 } as const;

/** Reserved vertical scrollbar gutter. */
export const SBW = 10;

/** Non-scenario chrome width: name + units + add + gutter (168+68+32+10). */
export const CHROME = COLW.name + COLW.units + COLW.add + SBW; // 278

/** Hard cap on scenario columns (overridable by config / bootstrap). */
export const DEFAULT_MAX_COLUMNS = 8;

/** Pager degradation breakpoints (widget px). */
export const PAGER_BREAKS = { count: 520, label: 640, more: 780 } as const;

/**
 * At/above this widget width the cash-flow zone drops the Chart/Table toggle and
 * shows chart (left) + table (right) side by side; below it, the toggle returns.
 * 920px ≈ 6 grid columns at the 1840 canvas (1840/12 × 6).
 */
export const CF_DUAL_PANE_MIN = 920;

/**
 * Scenario identity palette for custom (user-added) scenarios. One stored
 * mid-tone colour each; the pastel chart fill is derived client-side.
 */
export const SCENARIO_PALETTE = [
    "#9B8EC4",
    "#7FB3B5",
    "#8FA3C8",
    "#B58E7F",
    "#93A1AD",
] as const;

/** Blend a mid-tone scenario colour 50% toward white for chart fills. */
export function pastel(hex: string, factor = 0.5): string {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const mix = (c: number) => Math.round(c + (255 - c) * factor);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Context channel keys (see widgets/constants.ts for shared keys). */
export const SCENARIO_SELECTED_RESULT_ID = "scenario.selectedResultId";
export const SCENARIO_SELECTED_SUMMARY = "scenario.selectedSummary";