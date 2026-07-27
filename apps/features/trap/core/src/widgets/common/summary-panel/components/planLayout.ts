/* EXISTING: apps/features/trap/core/src/widgets/common/summary-panel/components/planLayout.ts
 *
 * SummaryPanel layout matrix — keyed off true cols + content-px height, mirroring
 * planDealDetails(cols, heightPx, forceMax). Type is FIXED (Deal Details tokens);
 * the plan ONLY decides: grid columns, header verbosity, footer, and fade.
 *
 * RECALIBRATED for the compact 2–4 col sizing (definition.json width max = 4):
 *   gridCols   : 2 at the widest tier (cols >= 4), else 1
 *   headerMode : 'eyebrow' (cols <= 2) -> 'name' (cols == 3) -> 'full' (cols >= 4)
 *                so all three modes are reachable inside the 2–4 window and the
 *                collateral chip appears at max width (previously stuck at 'name').
 *   footer     : 'as of' anchor shown only when there is vertical room (>= 240px)
 *   fade       : bottom scroll-affordance mask (harmless when not overflowing)
 *
 * forceMax (fullscreen popup) short-circuits to the roomiest layout.
 */

export type RowStyle = 'stacked' | 'inline';
export type HeaderMode = 'eyebrow' | 'name' | 'full';

export interface SummaryPlan {
    gridCols: 1 | 2;
    headerMode: HeaderMode;
    footer: boolean;
    fade: boolean;
}

export function planSummary(cols: number, heightPx: number, forceMax = false): SummaryPlan {
    if (forceMax) {
        return { gridCols: 2, headerMode: 'full', footer: true, fade: false };
    }

    const gridCols: 1 | 2 = cols >= 4 ? 2 : 1;
    const headerMode: HeaderMode = cols >= 4 ? 'full' : cols === 3 ? 'name' : 'eyebrow';
    const footer = heightPx >= 240;
    const fade = true;

    return { gridCols, headerMode, footer, fade };
}
