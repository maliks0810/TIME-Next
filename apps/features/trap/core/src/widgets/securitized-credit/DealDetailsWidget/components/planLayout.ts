/**
 * Deal Details — layout matrix. Keyed off true cols + content-px height.
 * `forceMax` (fullscreen popup) short-circuits to the full 12-col/650 layout —
 * the popup is definitionally "max", so no measurement is trusted there.
 *
 * Thresholds set from REAL measured DOM heights:
 *   header = 15px · metric list 2-col (6 rows) = 154px · 3-col (4 rows) ≈ 103px ·
 *   card row = 62px · 4 stacked panels (1-col width) ≈ 394px · gap = 10px ·
 *   measured content box ≈ gridHeight − 30.
 *
 * TITLE IS ALWAYS SHOWN (required). Two fixes vs. prior:
 *   1) metricCards gated to cols >= 7. At 6 cols panels stack in a SINGLE column
 *      (~394px); cards (186px) starve them → Parties clipped. List (154px) at
 *      6 cols leaves panels ~431px → fits.
 *   2) At the smallest height tier (h < 250, where NO panels render) the metric
 *      list uses 3 columns → 4 rows (~103px) instead of 6 rows (154px), so the
 *      title + list fit inside the ~170px box at 6×200 without dropping the title.
 */

export type PanelName = 'Identity' | 'Structure' | 'Dates' | 'Parties';

export interface DDPlan {
    metricCards: boolean;
    metricRows: number;
    panels: PanelName[];
    panelCols: number;
    listCols: number;
    cardsPerRow: number;
}

export function planDealDetails(cols: number, heightPx: number, forceMax = false): DDPlan {
    if (forceMax) {
        return {
            metricCards: true,
            metricRows: 3,
            panels: ['Identity', 'Structure', 'Dates', 'Parties'],
            panelCols: 3,
            listCols: 3,
            cardsPerRow: 4,
        };
    }

    const h = heightPx;

    // Cards ONLY when tall AND wide enough that panels DON'T stack in one column.
    const metricCards = h >= 620 && cols >= 7;
    const metricRows = metricCards ? 3 : 0;

    const panels: PanelName[] =
        h >= 572 ? ['Identity', 'Structure', 'Dates', 'Parties'] :
        h >= 472 ? ['Identity', 'Structure', 'Dates'] :
        h >= 372 ? ['Identity', 'Structure'] :
        h >= 272 ? ['Identity'] : [];

    const panelCols = cols >= 9 ? 3 : cols >= 7 ? 2 : 1;

    // Smallest tier (no panels): 3-col list packs 12 items into 4 rows so the
    // title + list fit the ~170px box. Otherwise width-based (10+ cols = 3).
    const listCols = h < 250 ? 3 : cols >= 10 ? 3 : 2;

    const cardsPerRow = cols >= 7 ? 4 : 2;

    return { metricCards, metricRows, panels, panelCols, listCols, cardsPerRow };
}