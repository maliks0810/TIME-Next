/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import GridLayout from 'react-grid-layout';

export const APP_SHELL_WIDTH = 1920;
export const CANVAS_WIDTH = 12;

type CanvasContainerProps = {
    children: React.ReactNode;
    layout: any[];
    className?: string;
    onLayoutChange?: (layout: any[]) => void;
    draggableHandle?: string;
    draggableCancel?: string;
    compactType?: 'vertical' | 'horizontal' | null;
    preventCollision?: boolean;
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
                width: APP_SHELL_WIDTH,
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
                        cols: CANVAS_WIDTH,
                        rowHeight: 1,
                        margin: [0, 0],
                        containerPadding: [0, 0],
                    }}
                    width={APP_SHELL_WIDTH}
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
