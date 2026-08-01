import { createContext, useContext } from 'react';

/**
 * Live pixel dimensions of a widget's container (the grid box that the
 * definition.json sizing governs). Published by WidgetCardShell via a single
 * ResizeObserver and consumed by useWidgetSize(bands) to derive responsive
 * tiers. Raw px only — band thresholds are applied per-widget downstream.
 */
export interface WidgetPixels {
    widthPx: number;
    heightPx: number;
}

export const WidgetSizeContext = createContext<WidgetPixels>({
    widthPx: 0,
    heightPx: 0,
});

/** Read the live container px published by the enclosing WidgetCardShell. */
export function useWidgetPixels(): WidgetPixels {
    return useContext(WidgetSizeContext);
}