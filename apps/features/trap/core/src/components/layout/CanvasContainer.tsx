/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout/legacy';

export const CANVAS_SHELL_WIDTH = 1840;
export const CANVAS_COLUMNS_COUNT = 12;
export const CANVAS_ROW_HEIGHT = 50;
const CANVAS_MIN_WIDTH = 1140;

const ReactGridLayout = WidthProvider(RGL);

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

const scaleLayout = (layout: any[], action: 'reduce' | 'increase') => {
    switch (action) {
        case 'reduce':
            return layout.map((widget) => ({
                ...widget,
                h: Math.round(widget.h / CANVAS_ROW_HEIGHT),

                maxH: widget.maxH / CANVAS_ROW_HEIGHT,
                minH: widget.minH / CANVAS_ROW_HEIGHT,
                y: Math.round(widget.y / CANVAS_ROW_HEIGHT),
            }));
        case 'increase':
            return layout.map((widget) => ({
                ...widget,
                h: widget.h * CANVAS_ROW_HEIGHT,

                maxH: widget.maxH * CANVAS_ROW_HEIGHT,
                minH: widget.minH * CANVAS_ROW_HEIGHT,
                y: widget.y * CANVAS_ROW_HEIGHT,
            }));
        default:
            return layout;
    }
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
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const adjustedLayout = useMemo(() => scaleLayout(layout, 'reduce'), [layout]);

    return (
        <div
            style={{
                maxWidth: CANVAS_SHELL_WIDTH,
                width: '100%',
                minWidth: CANVAS_MIN_WIDTH,
                margin: '0 auto',
            }}
        >
            <ReactGridLayout
                className={className}
                cols={CANVAS_COLUMNS_COUNT}
                rowHeight={CANVAS_ROW_HEIGHT}
                layout={adjustedLayout as any}
                isDraggable={isDraggable}
                isResizable={isResizable}
                resizeHandles={['se']}
                draggableHandle={draggableHandle}
                draggableCancel={draggableCancel}
                // No auto-repack on drop → a resized item keeps the size you
                // released at instead of RGL compacting it back.
                compactType={null}
                preventCollision={true}
                isBounded={false}
                autoSize={true}
                useCSSTransforms={mounted}
                margin={[0, 0]}
                containerPadding={[0, 0]}
                onLayoutChange={(layout: any) => {
                    if (!isInitialLoading && onLayoutChange)
                        onLayoutChange(scaleLayout(layout, 'increase') as any);
                }}
                style={{ minWidth: CANVAS_MIN_WIDTH }}
            >
                {children}
            </ReactGridLayout>
        </div>
    );
}
