/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';

import CanvasContainer from '../../../components/layout/CanvasContainer';

import type { WidgetLayout } from '../../../state/types';
import type { DesignerWidgetInstance } from '../types/workflowDesigner.types';
import DesignerCanvasItem from './DesignerCanvasItem';

type DesignerCanvasProps = {
    layout: WidgetLayout[];
    widgetsById: Record<string, DesignerWidgetInstance>;
    widgetDefById: Record<string, any>;
    templateId: string;
    isPublished: boolean;
    isDraft: boolean;
    isDraftSaved: boolean;
    defaultContextJson: string;
    removingIdsRef: React.MutableRefObject<Set<string>>;
    onLayoutChange: (next: WidgetLayout[]) => void;
    onRemoveWidget: (instanceId: string) => void;
};

export default function DesignerCanvas({
    layout,
    widgetsById,
    widgetDefById,
    templateId,
    isPublished,
    isDraft,
    isDraftSaved,
    defaultContextJson,
    removingIdsRef,
    onLayoutChange,
    onRemoveWidget,
}: DesignerCanvasProps) {
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    React.useEffect(() => {
        if (layout.length !== 0) {
            setIsInitialLoading(false);
        }
    }, [layout]);

    return (
        <CanvasContainer
            layout={layout as any}
            onLayoutChange={(current) => {
                const removed = removingIdsRef.current;
                const next = (current as any[]).filter((it) => !removed.has(it.i));
                onLayoutChange(next as WidgetLayout[]);
            }}
            draggableHandle=".widget-drag-handle"
            draggableCancel=".rgl-no-drag"
            isDraggable={!isPublished}
            isResizable={false}
            isInitialLoading={isInitialLoading}
        >
            {layout
                .filter((it) => !!widgetsById[it.i])
                .map((it) => {
                    const widget = widgetsById[it.i];
                    const widgetDefinition = widgetDefById[widget?.widgetDefinitionId];

                    return (
                        <DesignerCanvasItem
                            key={it.i}
                            item={it}
                            widget={widget}
                            widgetDefinition={widgetDefinition}
                            templateId={templateId}
                            isPublished={isPublished}
                            isDraft={isDraft}
                            isDraftSaved={isDraftSaved}
                            defaultContextJson={defaultContextJson}
                            onRemove={onRemoveWidget}
                        />
                    );
                })}
        </CanvasContainer>
    );
}
