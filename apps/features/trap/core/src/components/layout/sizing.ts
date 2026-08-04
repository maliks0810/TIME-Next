/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Widget sizing — free-resize support driven by the widget definition.
 * --------------------------------------------------------------------
 * `sizing` lives on each VARIANT (`variant.sizing`). The DEFINITION is
 * authoritative for min/max/resizable. Persisted layout items may carry STALE
 * constraints from before the rows migration (minH/h in old pixels), so we
 * derive min/max from the def and clamp the persisted h/w into the def range.
 *
 * Units (legacy react-grid-layout, rowHeight = 10):
 *   - width  is GRID COLUMNS (1..12) — RGL snaps to columns natively
 *   - height is GRID ROWS (1 row = 10px) — RGL snaps to rows natively
 */

export type SizingAxis = {
    default: number;
    min?: number;
    max?: number;
    step?: number;
};

export type WidgetSizing = {
    resizable?: boolean;
    width?: SizingAxis; // columns
    height?: SizingAxis; // rows (10px each)
};

export function resolveVariant(def: any, variantId?: string): any {
    const variants = def?.variants;
    if (!Array.isArray(variants) || variants.length === 0) return undefined;
    return variants.find((variant: any) => variant?.id === variantId) ?? variants[0];
}

export function getVariantSizing(def: any, variantId?: string): WidgetSizing | undefined {
    const variant = resolveVariant(def, variantId);
    return variant?.sizing ?? def?.sizing ?? def?.uiHints?.sizing;
}

/**
 * Decorate a layout with per-item resize policy from each widget's variant
 * sizing. Opted-in widgets become resizable with def-driven min/max; every
 * other item is explicitly locked so grid-level resize never leaks to widgets
 * that haven't opted in. Render-only; stripped via toPersistedLayout before save.
 *
 * Height snapping is native (integer rows × rowHeight); no custom snap needed.
 */
export function applySizing(
    layout: any[],
    widgetsById: Record<string, any>,
    widgetDefById: Record<string, any>
): any[] {
    return layout.map((item) => {
        const widget = widgetsById[item.i];
        const def = widget ? widgetDefById[widget.widgetDefinitionId] : undefined;
        const sizing = def ? getVariantSizing(def, widget?.variantId) : undefined;

        if (!sizing) {
            return { ...item, isResizable: false };
        }

        const width = sizing.width;
        const height = sizing.height;
        const resizable = sizing.resizable !== false;

        const minW = width?.min ?? item.minW;
        const maxW = width?.max ?? item.maxW;
        const minH = height?.min ?? item.minH;
        const maxH = height?.max ?? item.maxH;

        // Clamp a possibly-stale persisted size into the def's range.
        let h = item.h;
        if (typeof h === 'number') {
            if (typeof maxH === 'number') h = Math.min(h, maxH);
            if (typeof minH === 'number') h = Math.max(h, minH);
        }
        let w = item.w;
        if (typeof w === 'number') {
            if (typeof maxW === 'number') w = Math.min(w, maxW);
            if (typeof minW === 'number') w = Math.max(w, minW);
        }

        return {
            ...item,
            w,
            h,
            isResizable: resizable,
            ...(resizable ? { resizeHandles: ['se'] } : {}),
            minW,
            maxW,
            minH,
            maxH,
        };
    });
}

/**
 * Strip render-only decoration before persisting, so saved layouts keep their
 * historical `{ i, x, y, w, h, minW, minH, maxW, maxH }` shape.
 */
export function toPersistedLayout(item: any) {
    const { i, x, y, w, h, minW, minH, maxW, maxH } = item;
    return { i, x, y, w, h, minW, minH, maxW, maxH };
}
