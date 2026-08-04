/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import CanvasContainer from '../../../components/layout/CanvasContainer';
import WidgetHost from '../../../components/widget-runtime/WidgetHost';
import { applySizing } from '../../../components/layout/sizing';

type RuntimeCanvasProps = {
    layout: any[];
    runtimeItems: Array<{ item: any; widgetInstance: any; widgetDefinition: any }>;
};

export default function RuntimeCanvas(props: RuntimeCanvasProps) {
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    React.useEffect(() => {
        if (props.layout.length !== 0) setIsInitialLoading(false);
    }, [props.layout]);

    const { widgetsById, widgetDefById } = React.useMemo(() => {
        const wById: Record<string, any> = {};
        const dById: Record<string, any> = {};
        for (const { item, widgetInstance, widgetDefinition } of props.runtimeItems) {
            wById[item.i] = widgetInstance;
            const defId =
                widgetInstance?.composedWidgetId ??
                widgetInstance?.widgetDefinitionId ??
                widgetDefinition?.id;
            if (defId) dById[defId] = widgetDefinition;
        }
        return { widgetsById: wById, widgetDefById: dById };
    }, [props.runtimeItems]);

    // Runtime is fully STATIC (published): no drag, no resize. applySizing still
    // provides the per-item sizes so the layout renders at its saved dimensions,
    // but every item is locked (isResizable false is forced below via props).
    const sizedLayout = React.useMemo(
        () => applySizing(props.layout, widgetsById, widgetDefById),
        [props.layout, widgetsById, widgetDefById]
    );

    return (
        <CanvasContainer
            layout={sizedLayout as any}
            isDraggable={false} /* runtime = locked */
            isResizable={false} /* runtime = locked */
            isInitialLoading={isInitialLoading}
        >
            {props.runtimeItems.map(({ item, widgetInstance, widgetDefinition }) => (
                <div key={item.i} data-grid={item} style={{ padding: '2px' }}>
                    <WidgetHost
                        widgetInstance={widgetInstance}
                        widgetDefinition={widgetDefinition}
                        mode="workflow"
                    />
                </div>
            ))}
        </CanvasContainer>
    );
}
