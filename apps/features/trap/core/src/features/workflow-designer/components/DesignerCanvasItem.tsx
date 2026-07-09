/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { Button, Tooltip } from 'antd';
import clsx from 'clsx';

import WidgetHost from '../../../components/widget-runtime/WidgetHost';

import type { WidgetLayout } from '../../../state/types';
import type { DesignerWidgetInstance } from '../types/workflowDesigner.types';
import { hasConfigurableSchema } from '../utils/workflowDesigner.utils';
import { WidgetConfigureModal } from '../../widget-studio/WidgetConfigureModal';
import { WidgetDefinitionLike } from '../../../types/widget';

import styles from './DesignerCanvasItem.module.scss';

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
    children?: React.ReactNode;
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
            children,
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
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <div
                                className={styles.headerTitleInner}
                                title={widgetTitle}
                            >
                                {widgetTitle}
                            </div>
                        </div>
                        <div className={styles.moveWidgetSection}>
                            <Button
                                size="small"
                                disabled={isPublished}
                                className={clsx("widget-drag-handle", styles.headerBtn, isPublished ? styles.defaultCursor: styles.grabCursor)}
                                title="Move widget"
                            >
                                ⋮⋮
                            </Button>
                        </div>
                        <div className={styles.btnSection}>
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
                                        className={clsx("rgl-no-drag", styles.headerBtn)}
                                        size="small"
                                        disabled={!!configureDisabledReason}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (configureDisabledReason) return;
                                            setIsConfigOpen(true);
                                        }}
                                        title="Configure"
                                    >
                                        ⚙
                                    </Button>
                                </span>
                            </Tooltip>
                            <Button
                                className={clsx("rgl-no-drag", styles.headerBtn)}
                                size="small"
                                danger
                                disabled={isPublished}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(item.i);
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
                {children}
            </div>
        );
    }
);

DesignerCanvasItem.displayName = 'DesignerCanvasItem';

export default DesignerCanvasItem;
