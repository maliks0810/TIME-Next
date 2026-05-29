/* eslint-disable  @typescript-eslint/no-explicit-any */
import { message } from 'antd';
import clsx from 'clsx';
import DataGrid, { Column, Pager, Paging, HeaderFilter } from 'devextreme-react/data-grid';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import styles from './ArcDashboardWidget.module.scss';
import { PreviewCustomCellRenderer } from './PreviewCustomCellRenderer';

import { useEffect, useMemo, useState } from 'react';
import { PreviewModals } from './PreviewModals';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { COUNTER_TILE_STORE_KEY } from '../../constants';
import { statusCustomCellRenderer } from './StatusCustomeRenderer';

import { widgetPreviewResult } from './widgetPreviewResult';

export default function ArcDashboardWidget({
    result,
    widgetInstance,
    error,
    loading,
    mode,
}: WidgetComponentProps) {
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
        channelId: widgetInstance?.config?.params?.channel,
        key: COUNTER_TILE_STORE_KEY,
    });
    const [dataSource, setDataSource] = useState<any[]>(result?.rows as any[]);

    useEffect(() => {
        if (result?.rows) {
            setDataSource(result?.rows as any[]);
        }
    }, [result?.rows]);

    useEffect(() => {
        const originalRows = result?.rows as any;
        if (counterTileValue && counterTileValue !== 'TOTAL' && originalRows?.length > 0) {
            setDataSource(() =>
                originalRows?.filter(({ status }: any) => status === counterTileValue)
            );
        } else {
            setDataSource(originalRows);
        }
    }, [counterTileValue]);

    const columns = useMemo(() => {
        if (mode === 'preview') {
            return widgetPreviewResult.columns;
        } else {
            return result?.columns;
        }
    }, [result?.columns, mode]);

    if (loading) {
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

    if (error) {
        return (
            <WidgetCardShell>
                <WidgetErrorState message={error} />
            </WidgetCardShell>
        );
    }

    if (!result && mode !== 'preview') {
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
                <div
                    className={clsx('antd-dx-container', {
                        previewContainer: mode === 'preview',
                    })}
                >
                    <DataGrid
                        key={widgetInstance.id}
                        columnAutoWidth={false}
                        columnResizingMode="widget"
                        className={styles.grid}
                        dataSource={mode === 'preview' ? widgetPreviewResult.rows : dataSource}
                        allowColumnReordering={false}
                        rowAlternationEnabled
                        hoverStateEnabled
                        showBorders
                        width="100%"
                        keyExpr="aladdinId"
                        onRowDblClick={({ data }) => {
                            window.open(
                                `/risk/arc?assetId=${data.assetAnalyticsSetupId}`,
                                '_blank'
                            );
                        }}
                    >
                        <Paging defaultPageSize={widgetInstance?.config?.params?.pageSize || 25} />
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
                        {(columns as Array<unknown>)?.map((columnOptions: any) =>
                            columnOptions.dataField === 'status' ? (
                                <Column
                                    {...columnOptions}
                                    key={columnOptions.dataField}
                                    cellRender={statusCustomCellRenderer}
                                />
                            ) : (
                                <Column
                                    {...columnOptions}
                                    key={columnOptions.dataField}
                                    width={undefined}
                                    minWidth={columnOptions.width}
                                />
                            )
                        )}
                        <Column
                            caption="Preview"
                            allowEditing={false}
                            allowFiltering={false}
                            allowSorting={false}
                            alignment="center"
                            // width={60}
                            minWidth={60}
                            cellRender={({ data }) => (
                                <PreviewCustomCellRenderer
                                    data={data}
                                    handlePreview={setPreviewState}
                                />
                            )}
                        />
                        <Column
                            width={1}
                            allowResizing={false}
                            allowReordering={false}
                            allowFiltering={false}
                            allowSorting={false}
                        />
                    </DataGrid>
                </div>
            </WidgetCardShell>
        </>
    );
}
