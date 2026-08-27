/**
 * Scenario Matrix — horizontal pager. Derives the visible scenario slice from the
 * MEASURED matrix container width (one scenario column = COLW.scen), keeps the
 * offset in range, and exposes prev/next. Shared by the widget and the sandbox.
 *
 * `innerWidth` is the ResizeObserver content-box width of `.mxWrap` (NOT the outer
 * widget width) so padding/border/scrollbar can never skew the fit count.
 */
import React from "react";
import { COLW, SBW } from "../constants";
import type { Scenario } from "../types";

export type Pager = {
    visibleCount: number;
    offset: number;
    total: number;
    maxOffset: number;
    visibleScenarios: Scenario[];
    /** Show the add-scenario column (room left AND on the last page). */
    addShown: boolean;
    prev: () => void;
    next: () => void;
    reset: () => void;
};

/** Fixed lead columns that never scroll: Assumption name + Units. */
const LEAD = COLW.name + COLW.units; // 236

export function usePager(innerWidth: number, scenarios: Scenario[], maxColumns: number): Pager {
    const [offset, setOffset] = React.useState(0);

    const maxCols = Math.min(maxColumns || 8, scenarios.length || 1);

    const visibleCount = React.useMemo(() => {
        if (!innerWidth) return Math.min(3, maxCols); // pre-measure fallback
        // Budget for scenario columns = inner content box − lead columns − scrollbar gutter.
        // The add column + slack live in the leftover, so they are NOT reserved here.
        const avail = innerWidth - LEAD - SBW;
        const raw = Math.floor(avail / COLW.scen);
        return Math.max(1, Math.min(maxCols, raw));
    }, [innerWidth, maxCols]);

    const total = scenarios.length;
    const maxOffset = Math.max(0, total - visibleCount);
    const clampedOffset = Math.min(offset, maxOffset);
    React.useEffect(() => {
        if (offset !== clampedOffset) setOffset(clampedOffset);
    }, [offset, clampedOffset]);

    const visibleScenarios = scenarios.slice(clampedOffset, clampedOffset + visibleCount);
    const addShown = total < (maxColumns || 8) && clampedOffset + visibleCount >= total;

    return {
        visibleCount,
        offset: clampedOffset,
        total,
        maxOffset,
        visibleScenarios,
        addShown,
        prev: () => setOffset((o) => Math.max(0, o - 1)),
        next: () => setOffset((o) => Math.min(maxOffset, o + 1)),
        reset: () => setOffset(0),
    };
}