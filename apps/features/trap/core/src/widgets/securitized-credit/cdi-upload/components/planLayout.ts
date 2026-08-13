/**
 * CDI Upload — layout matrix (single source of truth). Mirrors the previewer.
 *
 *   Width bands (cols):  narrow 3–5 · split 6+  (split → two-pane: action left, recent right)
 *   Height tiers (px):   100 · 150 · 200 · 250  (grid snaps 50px, rows 10–25 @ rowHeight 50)
 *
 * Rules:
 *   - Title ("CDI Extraction") + fetch inputs ALWAYS.
 *   - Upload button ONLY when no dropzone (dropzone is the upload path when present).
 *   - Dropzone ONLY at cols ≥ 6 AND height ≥ 200 (its text self-adapts to its slice).
 *   - Recently Ingested (mirrors Security Lookup):
 *       3–5 cols → 2 side-by-side, stacked below, at height ≥ 200
 *       6 cols   → right pane, 1 lane
 *       7–8 cols → right pane, 2 lanes
 *       9–12     → right pane, 2-up flow
 *   - Success/Error: rich box (button below) at cols ≥ 6 && h ≥ 200; else compact inline row.
 */

export type RecentLanes = 'two' | 'one' | 'multi';

export interface CDIPlan {
    split: boolean;          // two-pane (action left, recent right)
    dropzone: boolean;       // full dropzone present
    showUploadBtn: boolean;  // upload button in action row (only when no dropzone)
    recentBelow: boolean;    // narrow: recent stacked below
    recentInPane: boolean;   // split: recent in right pane
    recentLanes: RecentLanes;
    richState: boolean;      // success/error rich box vs compact inline
}

function heightTier(px: number): 1 | 2 | 3 | 4 {
    if (px >= 210) return 4; // 250
    if (px >= 160) return 3; // 200
    if (px >= 110) return 2; // 150
    return 1;                // 100
}

export function planCDIUpload(cols: number, heightPx: number): CDIPlan {
    const t = heightTier(heightPx);

    const split = cols >= 6;
    const dropzone = cols >= 6 && t >= 3;        // ≥200px
    const showUploadBtn = !dropzone;             // no dropzone → button is the upload path
    const richState = dropzone;                  // same gate as dropzone

    const recentInPane = split;
    const recentBelow = !split && t >= 3;        // narrow: ≥200px, 2 side-by-side
    const recentLanes: RecentLanes =
        !split ? 'two' : cols >= 7 ? 'multi' : 'one';

    return {
        split,
        dropzone,
        showUploadBtn,
        recentBelow,
        recentInPane,
        recentLanes,
        richState,
    };
}