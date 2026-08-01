export type RecentMode = 'none' | 'two' | 'one' | 'multi';

export interface SLPlan {
    showTitle: boolean;
    showIds: boolean;
    split: boolean;
    recent: RecentMode;
}

function heightTier(px: number): 1 | 2 | 3 | 4 {
    if (px >= 210) return 4;
    if (px >= 160) return 3;
    if (px >= 110) return 2;
    return 1;
}

export function planSecurityLookup(cols: number, heightPx: number): SLPlan {
    const t = heightTier(heightPx);
    const showTitle = true;
    const showIds = t >= 2;

    // 3–5 cols: single column (too narrow to split with a usable Recent pane).
    const narrow = cols <= 5;
    if (narrow) {
        return {
            showTitle,
            showIds,
            split: false,
            recent: t >= 4 ? 'two' : 'none',   // 2 side-by-side, stacked, at 250 only
        };
    }

    // 6+ cols: two-pane. 6 = 1 lane; 7+ = 2 lanes / 2-up.
    const recent: RecentMode = cols >= 7 ? 'multi' : 'one';
    return { showTitle, showIds, split: true, recent };
}
