/* eslint-disable  @typescript-eslint/no-explicit-any */
import { message } from 'antd';
import DataGrid, { Column, Pager, Paging, HeaderFilter } from 'devextreme-react/data-grid';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import styles from './ArcDashboardWidget.module.scss';
import { PreviewCustomCellRenderer } from './PreviewCustomCellRenderer';

import { useEffect, useState } from 'react';
import { PreviewModals } from './PreviewModals';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { COUNTER_TILE_STORE_KEY } from '../../constants';
import { StatusCustomCellRenderer } from './StatusCustomeRenderer';

export default function ArcDashboardWidget(props: WidgetComponentProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const [previewState, setPreviewState] = useState<{
        previewModal: 'bond' | 'static' | 'analytics' | null;
        aladdinId: string | null;
        assetId: null | string;
    }>({
        previewModal: null,
        aladdinId: null,
        assetId: null,
    });

    const counterTileValue = useGetWidgetValue({
        channelId: props?.widgetInstance?.config?.params?.channel,
        key: COUNTER_TILE_STORE_KEY,
    });
    const [dataSource, setDataSource] = useState<any[]>(props.result?.rows as any[]);

    useEffect(() => {
        if (props.result?.rows) {
            setDataSource(props.result?.rows as any[]);
        }
    }, [props.result?.rows]);

    useEffect(() => {
        const originalRows = props.result?.rows as any;
        if (counterTileValue && originalRows?.length > 0) {
            setDataSource(() =>
                originalRows?.filter(({ status }: any) => status === counterTileValue)
            );
        } else {
            setDataSource(originalRows);
        }
    }, [counterTileValue]);

    if (props.loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    const onCloseModal = () => {
        setPreviewState({
            previewModal: null,
            aladdinId: null,
            assetId: null,
        });
    };

    //TODO:  uncomment this part when Execute Widget is done
    if (props.error) {
        return (
            <WidgetCardShell>
                <WidgetErrorState message={props.error} />
            </WidgetCardShell>
        );
    }

    if (!props.result) {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12 }}>No grid data available.</div>
            </WidgetCardShell>
        );
    }

    return (
        <>
            {contextHolder}
            <PreviewModals
                handleToggle={onCloseModal}
                previewState={previewState}
                messageApi={messageApi}
            />
            <WidgetCardShell>
                <DataGrid
                    key={props.widgetInstance.id}
                    className={styles.grid}
                    /* TODO: fix rows type */
                    dataSource={dataSource as Array<{ assetAnalyticsSetupId: string }>}
                    allowColumnReordering={false}
                    rowAlternationEnabled
                    hoverStateEnabled
                    showBorders
                    width="100%"
                    keyExpr="aladdinId"
                    onRowDblClick={({ data }) => {
                        window.open(`/risk/arc?assetId=${data.assetAnalyticsSetupId}`, '_blank');
                    }}
                >
                    <Paging
                        defaultPageSize={props.widgetInstance?.config?.params?.pageSize || 25}
                    />
                    <Pager
                        visible={true}
                        allowedPageSizes={[10, 25, 50, 'all']}
                        displayMode="full"
                        showPageSizeSelector
                        showInfo
                        showNavigationButtons
                    />
                    <HeaderFilter visible />
                    {/* TODO: fix columns type */}
                    {(props.result.columns as Array<unknown>).map((columnOptions: any) =>
                        columnOptions.dataField === 'status' ? (
                            <Column
                                {...columnOptions}
                                key={columnOptions.dataField}
                                cellRender={StatusCustomCellRenderer}
                            />
                        ) : (
                            <Column {...columnOptions} key={columnOptions.dataField} />
                        )
                    )}
                    <Column
                        caption="Preview"
                        allowEditing={false}
                        allowFiltering={false}
                        allowSorting={false}
                        alignment="center"
                        width={60}
                        cellRender={({ data }) => (
                            <PreviewCustomCellRenderer
                                data={data}
                                handlePreview={setPreviewState}
                            />
                        )}
                    />
                </DataGrid>
            </WidgetCardShell>
        </>
    );
}
