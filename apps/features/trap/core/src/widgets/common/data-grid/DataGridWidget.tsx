/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from 'react';
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    Pager,
    Scrolling,
    Export,
    SearchPanel,
    Selection,
} from 'devextreme-react/data-grid';

import { handleExport } from './exportExcel';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import styles from './DataGridWidget.module.scss';

import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import { useSetWidgetValue, useGetWidgetValueArray } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { COMMON_DATE_GRID_ROW_KEY } from '../../constants';
import { widgetPreviewResult } from './widgetPreviewResult';
import clsx from 'clsx';

export default function DataGridWidget({
    widgetInstance: { config = {} },
    loading,
    error,
    result,
    execute,
    mode,
}: WidgetComponentProps) {
    const activeTab = useGetActiveTab();
    const gridRef = useRef<any>(null);
    const listensToKeys = useMemo(
        () =>
            Array.isArray(config?.params?.listensToKeys)
                ? config?.params?.listensToKeys
                : [config?.params?.listensToKeys],
        [config?.params?.listensToKeys]
    );
    const selectionMode = config?.params?.selectionMode;

    const context = useGetWidgetValueArray({
        channelId: config.params?.channel,
        keys: listensToKeys,
    });

    const setWidgetValue = useSetWidgetValue();

    const subscribedValues = useMemo(
        () =>
            listensToKeys
                ? listensToKeys.reduce(
                      (acc: any, cur: string) => ({ ...acc, [cur]: context?.[cur] || null }),
                      {}
                  )
                : {},
        [context, listensToKeys]
    );

    useEffect(() => {
        if (subscribedValues && listensToKeys) {
            execute?.({ ...subscribedValues }, { ...subscribedValues });
        }
    }, [subscribedValues, listensToKeys]);

    const handleSelectRow = (props: any) => {
        const { selectedRowsData } = props;

        //Devextreme always emits an array on select of rows, even if selection mode is single. We want to story either array or single item in state
        const emitValue = selectionMode === 'single' ? selectedRowsData[0] : selectedRowsData;

        setWidgetValue({
            channelId: config.params?.channel,
            value: emitValue,
            key: COMMON_DATE_GRID_ROW_KEY,
            activeTab,
        });
    };

    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

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

    const {
        columns = [],
        rows = [],
        rowKeyField = 'id',
    } = mode === 'preview' ? widgetPreviewResult : (result as any);

    return (
        <>
            <WidgetCardShell>
                <div
                    className={clsx('antd-dx-container', {
                        previewContainer: mode === 'preview',
                    })}
                >
                    <DataGrid
                        ref={gridRef}
                        className={styles.grid}
                        dataSource={mode === 'preview' ? widgetPreviewResult.rows : (rows as [])}
                        allowColumnReordering={false}
                        rowAlternationEnabled
                        showColumnLines={false}
                        showBorders={false}
                        width="100%"
                        keyExpr={rowKeyField as string}
                        onExporting={() => handleExport(gridRef)}
                        onSelectionChanged={handleSelectRow}
                    >
                        <SearchPanel visible={true} />

                        <Scrolling mode="virtual" />
                        <GroupPanel visible={true} />
                        <Grouping autoExpandAll={false} />
                        <Export enabled />
                        {/* TODO: fix columns type */}
                        {(columns as Array<unknown>).map((columnOptions: any) => (
                            <Column
                                {...columnOptions}
                                key={columnOptions.dataField}
                                width={undefined}
                                minWidth={columnOptions.width}
                            />
                        ))}
                        <Column width={0} />
                        <Pager visible={false} />
                        <Selection
                            mode={selectionMode}
                            allowSelectAll={false}
                            selectByClick={true}
                            showCheckBoxesMode="onClick"
                        />
                    </DataGrid>
                </div>
            </WidgetCardShell>
        </>
    );
}
