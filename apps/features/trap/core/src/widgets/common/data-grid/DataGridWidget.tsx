/* eslint-disable  @typescript-eslint/no-explicit-any */
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    Pager,
    Scrolling,
} from 'devextreme-react/data-grid';

import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import styles from './DataGridWidget.module.scss';

import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';

export default function DataGridWidget(props: WidgetComponentProps) {
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
                    className={styles.grid}
                    /* TODO: fix rows type */
                    dataSource={rows as []}
                    allowColumnReordering={false}
                    rowAlternationEnabled
                    showBorders
                    width="100%"
                    keyExpr={rowKeyField as string}
                >
                    <Scrolling mode="virtual" />
                    <GroupPanel visible={true} />
                    <Grouping autoExpandAll={false} />
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
