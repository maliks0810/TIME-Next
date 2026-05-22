/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import CanvasContainer from '../../../components/layout/CanvasContainer';
import WidgetHost from '../../../components/widget-runtime/WidgetHost';
type RuntimeCanvasProps = {
    layout: any[];
    runtimeItems: Array<{
        item: any;
        widgetInstance: any;
        widgetDefinition: any;
    }>;
};

export default function RuntimeCanvas(props: RuntimeCanvasProps) {
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    React.useEffect(() => {
        if (props.layout.length !== 0) {
            setIsInitialLoading(false);
        }
    }, [props.layout]);

    return (
        <CanvasContainer
            layout={props.layout as any}
            isDraggable={false}
            isResizable={false}
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
