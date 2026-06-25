/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import GridLayout from 'react-grid-layout';

export const CANVAS_SHELL_WIDTH = 1840;
export const CANVAS_COLUMNS_COUNT = 12;
const CANVAS_MIN_WIDTH = 1140;

type CanvasContainerProps = {
    children: React.ReactNode;
    layout: any[];
    className?: string;
    onLayoutChange?: (layout: any[]) => void;
    draggableHandle?: string;
    draggableCancel?: string;
    isInitialLoading: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
};

export default function CanvasContainer({
    children,
    layout,
    className = 'layout',
    onLayoutChange,
    draggableHandle,
    draggableCancel,
    isInitialLoading,
    isDraggable = false,
    isResizable = false,
}: CanvasContainerProps) {
    return (
        <div
            style={{
                maxWidth: CANVAS_SHELL_WIDTH,
                width: '100%',
                minWidth: CANVAS_MIN_WIDTH,
                margin: '0 auto',
            }}
        >
            <div
                style={{
                    margin: '0 auto',
                }}
            >
                <GridLayout
                    className={className}
                    gridConfig={{
                        cols: CANVAS_COLUMNS_COUNT,
                        rowHeight: 1,
                        margin: [0, 0],
                        containerPadding: [0, 14],
                    }}
                    width={CANVAS_SHELL_WIDTH}
                    style={{
                        width: '100%',
                        maxWidth: CANVAS_SHELL_WIDTH,
                        minWidth: CANVAS_MIN_WIDTH,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        //TODO Keep commented until 6/30/2026, remove in case it wouldn't lead us to UI bugs
                        // minHeight: '85vh',
                    }}
                    layout={layout as any}
                    onLayoutChange={(layout: any) => {
                        if (!isInitialLoading && onLayoutChange) {
                            onLayoutChange(layout as any);
                        }
                    }}
                    dragConfig={{
                        handle: draggableHandle,
                        cancel: draggableCancel,
                        enabled: isDraggable,
                    }}
                    resizeConfig={{ enabled: isResizable }}
                >
                    {children}
                </GridLayout>
            </div>
        </div>
    );
}
