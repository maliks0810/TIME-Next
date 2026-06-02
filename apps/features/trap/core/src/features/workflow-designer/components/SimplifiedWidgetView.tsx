/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Divider, Empty } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import WidgetHost from '../../../components/widget-runtime/WidgetHost';
import { WidgetDefinition } from '../../../state/types';
import styles from './SimplifiedWidgetView.module.scss';
import CanvasContainer from '../../../components/layout/CanvasContainer';
import { useMemo } from 'react';

type SimplifiedWidgetViewProps = {
    filteredWidgetDefs: any[];
    selectedWidgetDefId: string;
    onSelectWidget: (widgetId: string) => void;
    onSelectParams: (params?: any) => void;
    selectedWidgetDef: WidgetDefinition;
    selectedParams: any;
    selectedWidgetVariantId?: string;
};

export const SimplifiedWidgetView = ({
    selectedWidgetDefId,
    filteredWidgetDefs,
    onSelectParams,
    onSelectWidget,
    selectedWidgetDef,
    selectedParams,
    selectedWidgetVariantId,
}: SimplifiedWidgetViewProps) => {
    const computedLayout = useMemo(() => {
        const selectedVariant = selectedWidgetVariantId
            ? selectedWidgetVariantId
            : selectedWidgetDef?.variants[0].id;
        const selectedVariantConfig = selectedWidgetDef?.variants.find(
            ({ id }: { id: string; grid: any }) => id === selectedVariant
        )?.grid;

        return [
            {
                i: 'widget_picker_preview_item',
                x: (12 - (selectedVariantConfig?.defaultW || 0)) / 2,
                y: 0,
                w: selectedVariantConfig?.defaultW,
                h: selectedVariantConfig?.defaultH,
                minW: selectedVariantConfig?.minW,
                minH: selectedVariantConfig?.minH,
            },
        ];
    }, [selectedWidgetDef, selectedWidgetVariantId]);

    return (
        <>
            <div className={styles.widgetPreviewContainer}>
                {selectedWidgetDefId ? (
                    <>
                        <h3>Widget Preview</h3>

                        <div
                            style={{
                                height: 320,
                                width: '100%',
                            }}
                        >
                            <div className={styles.modalPreviewContainer}>
                                <CanvasContainer
                                    layout={computedLayout}
                                    isDraggable={false}
                                    isResizable={false}
                                    isInitialLoading={false}
                                >
                                    <div key="widget_picker_preview_item">
                                        <WidgetHost
                                            widgetInstance={{
                                                id: selectedWidgetDef?.id,
                                                variantId: selectedWidgetVariantId,
                                                config: selectedParams
                                                    ? { params: selectedParams }
                                                    : { params: {} },
                                            }}
                                            widgetDefinition={selectedWidgetDef}
                                            mode="designer"
                                        />
                                    </div>
                                </CanvasContainer>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyWidgetPreviewContainer}>
                        <h4>Select widget for preview</h4>
                    </div>
                )}
            </div>
            <Divider size="middle" />
            <div className={styles.widgetsGridContainer}>
                {filteredWidgetDefs.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', paddingTop: 40 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No widgets found"
                        />
                    </div>
                ) : (
                    filteredWidgetDefs.map((d: any) => {
                        return (
                            <div
                                key={d.id}
                                onClick={() => {
                                    onSelectWidget(d.id);
                                    // params cleanup on selected widget change
                                    onSelectParams({});
                                }}
                                data-selected={d.id === selectedWidgetDefId}
                                className={styles.mainContainer}
                            >
                                <div className={styles.widgetCardContainer}>
                                    <div
                                        data-selected={d.id === selectedWidgetDefId}
                                        className={styles.widgetIcon}
                                    >
                                        <AppstoreOutlined style={{ fontSize: 18 }} />
                                    </div>

                                    <div className={styles.widgetInfoContainer}>
                                        <div className={styles.widgetName} title={d.name}>
                                            {d.name}
                                        </div>

                                        <div className={styles.widgetDescription}>
                                            {d.description ||
                                                'Reusable widget for workflow composition.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};
