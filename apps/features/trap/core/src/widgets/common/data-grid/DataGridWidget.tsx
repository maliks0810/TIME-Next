/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    Pager,
    Scrolling,
    Export,
    SearchPanel,
} from 'devextreme-react/data-grid';

import { handleExport } from './exportExcel';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import styles from './DataGridWidget.module.scss';

import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';

export default function DataGridWidget(props: WidgetComponentProps) {
    const gridRef = useRef<any>(null);
    if (props.loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

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

    const { columns = [], rows = [], rowKeyField = 'id' } = props.result;
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
                    <Pager visible={false} />
                </DataGrid>
            </WidgetCardShell>
        </>
    );
}
