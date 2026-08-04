/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';

import CanvasContainer from '../../../components/layout/CanvasContainer';
import WidgetHost from '../../../components/widget-runtime/WidgetHost';

import { extractLayout, extractWidgetsArray, widgetsMapById } from '../utils/landing.utils';
import { applySizing } from '../../../components/layout/sizing';

type LandingCanvasProps = {
    onOpenWorkflowFromRecent: (input: {
        target?: {
            templateId?: string;
            title?: string;
            templateVersionStatus?: string;
        };
        context?: Record<string, any>;
    }) => void | Promise<void>;
    compiledLandingVersion?: any;
};

export default function LandingCanvas(props: LandingCanvasProps) {
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    const compiledLayout = React.useMemo(
        () => extractLayout(props.compiledLandingVersion),
        [props.compiledLandingVersion]
    );

    const compiledWidgetsArr = React.useMemo(
        () => extractWidgetsArray(props.compiledLandingVersion),
        [props.compiledLandingVersion]
    );

    const compiledWidgetsById = React.useMemo(
        () => widgetsMapById(compiledWidgetsArr),
        [compiledWidgetsArr]
    );

    React.useEffect(() => {
        if (compiledLayout.length !== 0) {
            setIsInitialLoading(false);
        }
    }, [compiledLayout]);

    const sizedLayout = React.useMemo(() => applySizing(compiledLayout, {}, {}), [compiledLayout]);

    return (
        <CanvasContainer
            layout={sizedLayout as any}
            isDraggable={false}
            isResizable={false}
            isInitialLoading={isInitialLoading}
        >
            {sizedLayout
                .filter((it: any) => !!compiledWidgetsById[it.i])
                .map((it: any) => {
                    const widgetInstance = compiledWidgetsById[it.i];

                    const mergedWidgetInstance = {
                        ...widgetInstance,
                        uiActions: {
                            ...(widgetInstance?.uiActions ?? {}),
                            openWorkflow: props.onOpenWorkflowFromRecent,
                        },
                    };

                    return (
                        <div key={it.i} data-grid={it as any} style={{ padding: '2px' }}>
                            <WidgetHost
                                widgetInstance={mergedWidgetInstance}
                                widgetDefinition={{
                                    id:
                                        widgetInstance?.composedWidgetId ??
                                        widgetInstance?.widgetDefinitionId,
                                }}
                                mode="landing"
                                uiActions={mergedWidgetInstance.uiActions}
                            />
                        </div>
                    );
                })}
        </CanvasContainer>
    );
}
