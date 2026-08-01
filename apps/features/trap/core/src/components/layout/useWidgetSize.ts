import React from 'react';
import { CANVAS_SHELL_WIDTH, CANVAS_COLUMNS_COUNT } from './CanvasContainer';

export type WidthBand = 'Wa' | 'Wb' | 'Wc';
export type HeightBand = 'H1' | 'H2' | 'H3' | 'H4';

export interface WidgetSizeBands {
    width: { wb: number; wc: number };
    height: { h2: number; h3: number; h4: number };
}

export interface WidgetSize {
    ref: React.RefObject<HTMLDivElement | null>;
    widthPx: number;
    heightPx: number;
    cols: number;
    wBand: WidthBand;
    hBand: HeightBand;
}

// Fixed canvas geometry — the SAME convention SL and CDI were tuned against.
// (No live-canvas hunting: that changed effective cols and broke both widgets.)
const COL_WIDTH = CANVAS_SHELL_WIDTH / CANVAS_COLUMNS_COUNT; // 1840 / 12

export function useWidgetSize(bands: WidgetSizeBands): WidgetSize {
    const ref = React.useRef<HTMLDivElement>(null);
    const [size, setSize] = React.useState({ widthPx: 0, heightPx: 0 });

    React.useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }
        const apply = (w: number, h: number) => {
            if (w > 0 || h > 0) {
                setSize({ widthPx: w, heightPx: h });
            }
        };
        const r = el.getBoundingClientRect();
        apply(r.width, r.height);
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                apply(e.contentRect.width, e.contentRect.height);
            }
        });
        ro.observe(el);
        return () => {
            ro.disconnect();
        };
    }, []);

    const { widthPx, heightPx } = size;

    const cols = widthPx > 0 ? Math.max(1, Math.round(widthPx / COL_WIDTH)) : 0;

    const wBand: WidthBand =
        cols >= bands.width.wc ? 'Wc' : cols >= bands.width.wb ? 'Wb' : 'Wa';

    const hBand: HeightBand =
        heightPx >= bands.height.h4
            ? 'H4'
            : heightPx >= bands.height.h3
            ? 'H3'
            : heightPx >= bands.height.h2
            ? 'H2'
            : 'H1';

    return { ref, widthPx, heightPx, cols, wBand, hBand };
}