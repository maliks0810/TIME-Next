/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from 'antd';
// import { useNavigate } from 'react-router-dom';

import JsonInfoModal from '../../../components/common/JsonInfoModal';
import WidgetHost from '../../../components/widget-runtime/WidgetHost';

import type { WidgetLayout } from '../../../state/types';
import type { DesignerWidgetInstance } from '../types/workflowDesigner.types';
import {
    // hasConfigurableSchema,
    // isConfigured,
    safeJsonParse,
} from '../utils/workflowDesigner.utils';

type DesignerCanvasItemProps = {
    item: WidgetLayout;
    widget: DesignerWidgetInstance;
    widgetDefinition: any;
    templateId: string;
    versionId: string;
    isPublished: boolean;
    isDraft: boolean;
    isDraftSaved: boolean;
    defaultContextJson: string;
    onRemove: (instanceId: string) => void;

    className?: string;
    style?: React.CSSProperties;
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
    onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
};

const DesignerCanvasItem = React.forwardRef<HTMLDivElement, DesignerCanvasItemProps>(
    (
        {
            item,
            widget,
            widgetDefinition,
            // templateId,
            // versionId,
            isPublished,
            // isDraft,
            // isDraftSaved,
            defaultContextJson,
            onRemove,
            className,
            style,
            onMouseDown,
            onMouseUp,
            onTouchEnd,
        },
        ref
    ) => {
        // const nav = useNavigate();

        // const configured = isConfigured(widgetDefinition, widget?.config);
        const widgetTitle = String(widgetDefinition?.name ?? widget?.widgetDefinitionId ?? item.i);
        // const hasConfig = hasConfigurableSchema(widgetDefinition);

        // const configureDisabledReason = !templateId
        //     ? 'Create or load a draft first'
        //     : isPublished
        //       ? 'Published versions cannot be configured'
        //       : !isDraft
        //         ? 'Only draft versions can be configured'
        //         : !isDraftSaved
        //           ? 'Save draft before configuring widgets'
        //           : !hasConfig
        //             ? 'This widget has no configurable options'
        //             : undefined;

        return (
            <div
                ref={ref}
                className={className}
                style={style}
                data-grid={item as any}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
            >
                <div
                    style={{
                        position: 'relative',
                        height: '100%',
                        boxSizing: 'border-box',
                        overflow: 'visible',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: -14,
                            left: 8,
                            right: 8,
                            zIndex: 3,
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center',
                            columnGap: 8,
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                minWidth: 0,
                                pointerEvents: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    maxWidth: '100%',
                                    background: 'rgba(255,255,255,0.96)',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: 6,
                                    padding: '4px 10px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    minWidth: 0,
                                }}
                                title={widgetTitle}
                            >
                                {widgetTitle}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                pointerEvents: 'auto',
                            }}
                        >
                            <Button
                                className="widget-drag-handle"
                                size="small"
                                disabled={isPublished}
                                style={{
                                    cursor: isPublished ? 'default' : 'grab',
                                    width: 64,
                                    minWidth: 64,
                                    height: 28,
                                    padding: 0,
                                    justifyContent: 'center',
                                }}
                                title="Move widget"
                            >
                                ⋮⋮
                            </Button>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                justifyContent: 'flex-end',
                                justifySelf: 'end',
                                pointerEvents: 'auto',
                            }}
                        >
                            <JsonInfoModal
                                title="Widget Raw JSON"
                                data={{ instance: widget, definition: widgetDefinition }}
                                tooltip="Widget JSON"
                            />

                            <Button
                                className="rgl-no-drag"
                                size="small"
                                danger
                                disabled={isPublished}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(item.i);
                                }}
                                style={{
                                    width: 32,
                                    minWidth: 32,
                                    height: 28,
                                    padding: 0,
                                    justifyContent: 'center',
                                }}
                                title="Remove"
                            >
                                ✕
                            </Button>
                        </div>
                    </div>

                    <div style={{ height: '100%', overflow: 'auto', padding: '2px' }}>
                        <WidgetHost
                            widgetInstance={{
                                id: widget?.instanceId ?? widget?.id,
                                composedWidgetId: widget?.widgetDefinitionId,
                                composedWidgetVersion: widget?.widgetDefinitionVersion,
                                variantId: widget?.variantId,
                                config: widget?.config ?? { params: {} },
                                listensToKeys: widget?.listensToKeys,
                                emitsKeys: widget?.emitsKeys,
                            }}
                            widgetDefinition={widgetDefinition}
                            contextSnapshot={safeJsonParse(defaultContextJson, {})}
                            mode="designer"
                        />
                    </div>
                </div>
            </div>
        );
    }
);

DesignerCanvasItem.displayName = 'DesignerCanvasItem';

export default DesignerCanvasItem;
