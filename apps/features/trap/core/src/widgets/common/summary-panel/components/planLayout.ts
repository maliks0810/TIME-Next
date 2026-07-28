export type RowStyle = 'stacked' | 'inline';
export type HeaderMode = 'eyebrow' | 'full';

export interface SummaryPlan {
    gridCols: 1 | 2;
    headerMode: HeaderMode;
    footer: boolean;
    fade: boolean;
}

/** Two columns once there is room for two readable pairs. Lowered from 400 —
 *  at 6 def-cols the panel measures well under 400px, so 400 never triggered. */
export const COL2_MIN_PX = 300;
/** Collateral chip shows only when the header has comfortable width. */
export const CHIP_MIN_PX = 360;
/** Footer anchors only when there is vertical room. */
export const FOOTER_MIN_PX = 240;

export function planSummary(widthPx: number, heightPx: number): SummaryPlan {
    const gridCols: 1 | 2 = widthPx >= COL2_MIN_PX ? 2 : 1;
    const headerMode: HeaderMode = widthPx >= CHIP_MIN_PX ? 'full' : 'eyebrow';
    const footer = heightPx >= FOOTER_MIN_PX;
    const fade = true;

    return { gridCols, headerMode, footer, fade };
}