/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Empty } from 'antd';
import JsonInfoModal from '../../../components/common/JsonInfoModal';
import WidgetHost from '../../../components/widget-runtime/WidgetHost';
import styles from './PreviewWidgetsContainer.module.scss';
import { WidgetDefinition } from '../../../state/types';

type PreviewWidgetsContainerProps = {
    filteredWidgetDefs: WidgetDefinition[];
    selectedWidgetDefId: string;
    onSelectWidget: (widgetId: string) => void;
    onSelectParams: (params?: any) => void;
};

export const PreviewWidgetsContainer = ({
    selectedWidgetDefId,
    filteredWidgetDefs,
    onSelectParams,
    onSelectWidget,
}: PreviewWidgetsContainerProps) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflowY: 'auto',
                paddingRight: 4,
            }}
        >
            {filteredWidgetDefs.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', paddingTop: 40 }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No widgets found" />
                </div>
            ) : (
                filteredWidgetDefs.map((d: any) => {
                    return (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                                onSelectWidget(d.id);
                                // params cleanup on selected widget change
                                onSelectParams({});
                            }}
                            data-selected={d.id === selectedWidgetDefId}
                            className={styles.mainContainer}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    gap: 12,
                                    minWidth: 0,
                                    height: '100%',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ width: '30%' }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 14,
                                            lineHeight: '18px',
                                        }}
                                        title={d.name}
                                    >
                                        {d.name}
                                    </div>

                                    <div className={styles.widgetDescription}>
                                        {d.description ||
                                            'Reusable widget for workflow composition.'}
                                    </div>
                                </div>
                                <div className={styles.previewContainer}>
                                    <WidgetHost
                                        widgetInstance={{
                                            id: d.id,
                                            composedWidgetId: d?.id,
                                            composedWidgetVersion: d?.widgetDefinitionVersion,
                                            variantId: d?.variantId,
                                            config: d?.config ?? { params: {} },
                                            listensToKeys: d?.listensToKeys,
                                            emitsKeys: d?.emitsKeys,
                                        }}
                                        widgetDefinition={d}
                                        mode="preview"
                                    />
                                </div>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <JsonInfoModal
                                        title={`${d.name} Definition`}
                                        tooltip="Widget Definition JSON"
                                        data={{
                                            id: d.id,
                                            name: d.name,
                                            description: d.description,
                                            category: d?.uiHints?.category ?? d?.category,
                                            datasetId: d?.datasetId,
                                            variants: Array.isArray(d?.variants)
                                                ? d.variants.map((v: any) => ({
                                                      id: v.id,
                                                      label: v.label,
                                                  }))
                                                : [],
                                            listensToKeys: d?.listensToKeys,
                                            emitsKeys: d?.emitsKeys,
                                            configSchema: d?.configSchema,
                                        }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );
};
