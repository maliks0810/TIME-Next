/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
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
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { COMMON_DATE_GRID_ROW_KEY } from '../../constants';

export default function DataGridWidget({
    widgetInstance: { config = {} },
    loading,
    error,
    result,
    execute,
}: WidgetComponentProps) {
    const activeTab = useGetActiveTab();
    const gridRef = useRef<any>(null);
    const listensToKeys = config?.params?.listensToKeys;
    const selectionMode = config?.params?.selectionMode;

    const subscribedValue = useGetWidgetValue({
        channelId: config.params?.channel,
        key: listensToKeys,
    });

    const setWidgetValue = useSetWidgetValue();

    useEffect(() => {
        if (subscribedValue && listensToKeys) {
            execute?.({ [listensToKeys]: subscribedValue });
        }
    }, [subscribedValue, listensToKeys]);

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

    if (!result) {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12 }}>No grid data available.</div>
            </WidgetCardShell>
        );
    }

    const { columns = [], rows = [], rowKeyField = 'id' } = result;
    return (
        <>
            <WidgetCardShell>
                <DataGrid
                    ref={gridRef}
                    className={styles.grid}
                    /* TODO: fix rows type */
                    dataSource={rows as []}
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
                        <Column {...columnOptions} key={columnOptions.dataField} />
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
            </WidgetCardShell>
        </>
    );
}
