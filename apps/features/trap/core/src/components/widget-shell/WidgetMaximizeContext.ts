import { createContext, useContext } from 'react';

/**
 * Signals whether a widget is currently rendered in the fullscreen (maximized)
 * popup. Widgets read this to FORCE their max layout instead of measuring —
 * the popup is definitionally "show everything at max", so no size derivation.
 */
export interface WidgetMaximizeState {
    maximized: boolean;
}

export const WidgetMaximizeContext = createContext<WidgetMaximizeState>({ maximized: false });

export function useIsMaximized(): boolean {
    return useContext(WidgetMaximizeContext).maximized;
}