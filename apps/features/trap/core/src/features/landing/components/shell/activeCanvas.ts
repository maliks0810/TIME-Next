/* eslint-disable  @typescript-eslint/no-explicit-any */
import { WidgetDefinitionLike } from '../../../../types/widget';
import React from 'react';

/**
 * Bridge from the active draft canvas to the shell chrome (drawer / strip).
 * The embedded designer for the ACTIVE tab publishes its imperative actions here;
 * the drawer's Widgets segment (and, later, the strip) reads them. Only the active
 * draft registers, so there is a single source of truth at any time.
 */
export type WidgetOption = { id: string; name: string; category: string; description: string };

export type CanvasActions = {
    isDraft: boolean;
    widgets: WidgetOption[];
    addWidget: () => void;
    selectedWidgetParams: any;
    loading: boolean;
    onWidgetParamsSelect: any;
    setSelectedWidgetDefId: (id: string) => void;
    selectedWidgetDef: WidgetDefinitionLike;
    filteredWidgetDefs: WidgetDefinitionLike[];
} | null;

let current: CanvasActions = null;
const listeners = new Set<() => void>();

export function setActiveCanvas(actions: CanvasActions) {
    current = actions;
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useActiveCanvas(): CanvasActions {
    return React.useSyncExternalStore(
        subscribe,
        () => current,
        () => current
    );
}
