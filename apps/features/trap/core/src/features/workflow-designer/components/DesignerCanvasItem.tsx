/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { Button, Tooltip } from 'antd';

import WidgetHost from '../../../components/widget-runtime/WidgetHost';

import type { WidgetLayout } from '../../../state/types';
import type { DesignerWidgetInstance } from '../types/workflowDesigner.types';
import { hasConfigurableSchema } from '../utils/workflowDesigner.utils';
import { WidgetConfigureModal } from '../../widget-studio/WidgetConfigureModal';
import { WidgetDefinitionLike } from '../../../types/widget';

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

    onConfigUpdate?: (widget: DesignerWidgetInstance) => void;
};

const DesignerCanvasItem = React.forwardRef<HTMLDivElement, DesignerCanvasItemProps>(
    (
        {
            item,
            widget,
            widgetDefinition,
            templateId,
            versionId,
            isPublished,
            isDraft,
            isDraftSaved,
            onRemove,
            className,
            style,
            onMouseDown,
            onMouseUp,
            onTouchEnd,
            onConfigUpdate,
        },
        ref
    ) => {
        const widgetTitle = String(widgetDefinition?.name ?? widget?.widgetDefinitionId ?? item.i);
        const hasConfig = hasConfigurableSchema(widgetDefinition);
        const [isConfigOpen, setIsConfigOpen] = useState(false);
        const configureDisabledReason = useMemo(() => {
            if (!templateId) return 'Create or load a draft first';
            if (isPublished) return 'Published versions cannot be configured';
            if (!isDraft) return 'Only draft versions can be configured';
            if (!isDraftSaved) return 'Save draft before configuring widgets';
            if (!hasConfig) return 'This widget has no configurable options';
            return undefined;
        }, [templateId, isPublished, isDraft, isDraftSaved, hasConfig]);

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
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                minWidth: 0,
                            }}
                        >
                            <div
                                style={{
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.96)',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: 6,
                                    padding: '2px 4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    height: 24,
                                    textOverflow: 'ellipsis',
                                    maxWidth: 150,
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
                                marginLeft: 'auto',
                            }}
                        >
                            <Button
                                className="widget-drag-handle"
                                size="small"
                                disabled={isPublished}
                                style={{
                                    cursor: isPublished ? 'default' : 'grab',
                                    width: 24,
                                    minWidth: 24,
                                    height: 24,
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
                            <WidgetConfigureModal
                                templateId={templateId}
                                versionId={versionId}
                                isOpen={isConfigOpen}
                                onSave={(widget) => {
                                    onConfigUpdate?.(widget as DesignerWidgetInstance);
                                }}
                                onClose={() => setIsConfigOpen(false)}
                                data={{
                                    instance: widget,
                                    definition: widgetDefinition as WidgetDefinitionLike,
                                }}
                            />
                            <Tooltip title={configureDisabledReason ?? 'Configure widget'}>
                                <span>
                                    <Button
                                        className="rgl-no-drag"
                                        size="small"
                                        disabled={!!configureDisabledReason}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (configureDisabledReason) return;
                                            setIsConfigOpen(true);
                                        }}
                                        style={{
                                            width: 24,
                                            minWidth: 24,
                                            height: 24,
                                            padding: 0,
                                            justifyContent: 'center',

                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        }}
                                        title="Configure"
                                    >
                                        ⚙
                                    </Button>
                                </span>
                            </Tooltip>
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
                                    width: 24,
                                    minWidth: 24,
                                    height: 24,
                                    padding: 0,
                                    justifyContent: 'center',

                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                }}
                                title="Remove"
                            >
                                ✕
                            </Button>
                        </div>
                    </div>

                    <div style={{ height: '100%', padding: '2px' }}>
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
