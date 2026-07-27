// NEW: apps/features/trap/core/src/widgets/securitized-credit/TrancheDetailsWidget/components/planLayout.ts
//
// Tranche Detail — layout matrix. Keyed off true cols + measured content-px height.
//
// Model (fills width, never gaps, never scrolls, never clips):
//   Every visible panel spans the FULL WIDTH and lays its rows out in a
//   multi-column body that scales with width (12 cols → 3, 7-8 → 2, 6 → 2). So a
//   single panel uses the whole width AND stays short — which lets more panels
//   stack below. Panels layer in (priority order) only while they still fit the
//   measured height, computed from known row counts + conservative geometry
//   (biased high → prefer a little bottom whitespace over any clip).
//
//   forceMax (fullscreen) shows all 5 with the widest (3-col) bodies.

export type PanelName =
    | 'Tranche info'
    | 'Cash flow'
    | 'Floater info'
    | 'Credit support'
    | 'Accumulators';

export const TRANCHE_PANEL_ORDER: PanelName[] = [
    'Tranche info',
    'Cash flow',
    'Floater info',
    'Credit support',
    'Accumulators',
];

const PANEL_ROWS: Record<PanelName, number> = {
    'Tranche info': 11,
    'Cash flow': 9,
    'Floater info': 8,
    'Credit support': 6,
    'Accumulators': 5,
};

// Conservative geometry (biased high → under-show rather than clip).
const ROW_H = 26;        // one detail row
const PANEL_CHROME = 44; // panel title + vertical padding
const PANEL_GAP = 10;    // gap between stacked panels
const HEADER_H = 15;     // widget header
const GAP = 12;          // container gaps (×2 around metrics)
const CARDS_H = 62;      // metric cards row
const STRIP_H = 24;      // compact metric strip
const SAFETY = 6;        // guard

export interface TDPlan {
    metricCards: boolean;
    panels: PanelName[]; // full-width, stacked in priority order
    bodyCols: 1 | 2 | 3; // columns INSIDE each panel body (scales with width)
}

function bodyColsForWidth(cols: number): 1 | 2 | 3 {
    if (cols >= 9) return 3;
    if (cols >= 7) return 2;
    return 2; // 6 cols is still ~900px wide — 2-col body reads well, stays short
}

function panelHeight(name: PanelName, bodyCols: 1 | 2 | 3): number {
    const rows = Math.ceil(PANEL_ROWS[name] / bodyCols);
    return rows * ROW_H + PANEL_CHROME;
}

/** Largest prefix of the priority list whose full-width stack fits `avail`. */
function fitCount(bodyCols: 1 | 2 | 3, avail: number): number {
    let used = 0;
    let count = 0;
    for (const name of TRANCHE_PANEL_ORDER) {
        const h = panelHeight(name, bodyCols) + (count > 0 ? PANEL_GAP : 0);
        if (used + h > avail) break;
        used += h;
        count += 1;
    }
    return Math.max(1, count); // always show at least one when data exists
}

export function planTrancheDetail(cols: number, heightPx: number, forceMax = false): TDPlan {
    if (forceMax) {
        return {
            metricCards: true,
            panels: [...TRANCHE_PANEL_ORDER],
            bodyCols: 3,
        };
    }

    const bodyCols = bodyColsForWidth(cols);
    const metricCards = heightPx >= 340;
    const metricsH = metricCards ? CARDS_H : STRIP_H;

    const avail = heightPx - HEADER_H - GAP - metricsH - GAP - SAFETY;
    const count = avail <= 0 ? 1 : fitCount(bodyCols, avail);

    return {
        metricCards,
        panels: TRANCHE_PANEL_ORDER.slice(0, count),
        bodyCols,
    };
}
