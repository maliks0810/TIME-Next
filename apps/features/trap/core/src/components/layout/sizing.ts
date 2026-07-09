/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Widget sizing — free-resize support driven by the widget definition.
 * --------------------------------------------------------------------
 * Background: historically "variants" were misused as fixed sizes
 * (Small/Medium/Large). The real model is:
 *   - variant  = a genuine presentation mode (Compact, Vertical, …)
 *   - sizing   = how THAT variant may be sized/resized on the grid
 *
 * `sizing` is a field on each VARIANT (`variant.sizing`). So a widget can have
 * several variants, each with its own size + resize policy: e.g. Deal Details
 * with Compact/Standard/Full (each fixed, resizable:false), or Horizontal/
 * Vertical (each resizable:true with its own range). The active variant for an
 * instance is `instance.variantId`. A variant with no `sizing` stays locked,
 * exactly as before. Runtime is always read-only.
 *
 * Units (kept consistent with the existing grid, which runs rowHeight = 1):
 *   - width  is in GRID COLUMNS (1..12)  -> RGL snaps width to columns natively
 *   - height is in PIXELS                 -> snapped to `height.step` on resize
 *
 * We deliberately do NOT change the grid's global rowHeight: that would
 * rescale every persisted layout. Height snapping is achieved per-item via a
 * react-grid-layout v2 size constraint, so nothing else moves.
 */

export type SizingAxis = {
    default: number;
    min?: number;
    max?: number;
    step?: number;
};

export type WidgetSizing = {
    resizable?: boolean; // default true when the block is present
    width?: SizingAxis; // columns
    height?: SizingAxis; // pixels
};

/**
 * Resolve the active variant for an instance and return ITS sizing.
 * Falls back to the first variant, then to legacy locations
 * (definition.sizing / uiHints.sizing) so partially-migrated Cosmos docs keep
 * working during rollout.
 */
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
 * react-grid-layout v2 per-item size constraint that snaps the height to a
 * multiple of `step`. Because the grid runs rowHeight = 1, height grid-units
 * are pixels, so `step = 10` snaps to 10px. Width is left untouched (RGL
 * already snaps it to whole columns).
 */
const snapCache = new Map<
    number,
    { name: string; constrainSize: (i: any, w: number, h: number) => { w: number; h: number } }
>();
export function snapHeight(step: number) {
    let cache = snapCache.get(step);
    if (!cache) {
        cache = {
            name: 'snapHeight',
            constrainSize: (_item: any, w: number, h: number) => ({
                w,
                h: Math.max(step, Math.round(h / step) * step),
            }),
        };
        snapCache.set(step, cache);
    }
    return cache;
}

/**
 * Decorate a layout for the designer: items whose definition declares
 * `uiHints.sizing` become resizable (with min/max + height snap); every other
 * item is explicitly locked so enabling grid-level resize never leaks to
 * widgets that haven't opted in.
 *
 * The decoration is render-only (re-derived from the definition each load);
 * it is stripped before persisting via {@link toPersistedLayout}.
 */
export function applySizing(
    layout: any[],
    widgetsById: Record<string, any>,
    widgetDefById: Record<string, any>
): any[] {
    return layout.map((item) => {
        const widget = widgetsById[item.i];
        const def = widget ? widgetDefById[widget.widgetDefinitionId] : undefined;
        // Sizing comes from the instance's ACTIVE variant.
        const sizing = def ? getVariantSizing(def, widget?.variantId) : undefined;
        // Not opted in -> stay locked (preserve any existing min/max).
        if (!sizing) {
            return { ...item, isResizable: false };
        }

        const width = sizing.width;
        const height = sizing.height;
        const constraints = height?.step ? [snapHeight(height.step)] : undefined;
        const resizable = sizing.resizable !== false;

        return {
            ...item,
            isResizable: resizable,
            ...(resizable ? { resizeHandles: ['se'] } : {}),
            minW: width?.min ?? item.minW,
            maxW: width?.max ?? item.maxW,
            minH: height?.min ?? item.minH,
            maxH: height?.max ?? item.maxH,
            ...(constraints ? { constraints } : {}),
        };
    });
}

/**
 * Strip render-only decoration before persisting, so saved layouts keep their
 * historical `{ i, x, y, w, h, minW, minH, maxW, maxH }` shape (no
 * `constraints` / `isResizable` leaking into the workflow document).
 */
export function toPersistedLayout(item: any) {
    const { i, x, y, w, h, minW, minH, maxW, maxH } = item;
    return { i, x, y, w, h, minW, minH, maxW, maxH };
}
