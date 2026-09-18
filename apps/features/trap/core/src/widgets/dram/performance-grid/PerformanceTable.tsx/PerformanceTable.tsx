import { useMemo, useState } from 'react';
import TreeList, { ColumnFixing, Scrolling } from 'devextreme-react/tree-list';
import type { RowPreparedEvent, CellPreparedEvent } from 'devextreme/ui/tree_list';

import type { ViewMode } from './types';
import { PerformanceColumns } from './PerformanceColumns';
import { PerformanceToolbar } from './PerformanceToolbar';
import styles from './PerformanceTable.module.scss';
import { transformPerformanceData } from './performance.utils';
import type { PerformanceGrid, PerformanceTreeRow } from './performance.types';
import { useAttributionStore } from '../state/useStore';

interface PerformaceTableProps {
    grids: PerformanceGrid[];
}

export function PerformanceTable({ grids }: PerformaceTableProps) {
    const metrics = useAttributionStore((store) => store.metrics);
    const [mode, setMode] = useState<ViewMode>('security');
    const [expandedRowKeys, setExpandedRowKeys] = useState<Array<string | number>>([]);
    const periods = useMemo(() => {
        return grids.map((grid) => grid.period);
    }, [grids]);

    const data = useMemo<PerformanceTreeRow[]>(() => {
        return transformPerformanceData(grids);
    }, [grids]);

    const handleExpandAll = () => {
        const parentIds = new Set<string>();
        data.forEach((row) => {
            if (row.parentId !== null) {
                parentIds.add(row.parentId);
            }
        });
        setExpandedRowKeys([...parentIds]);
    };

    const handleCollapseAll = () => {
        setExpandedRowKeys([]);
    };

    const handleRowPrepared = (
        event: RowPreparedEvent<PerformanceTreeRow, string | number | null>
    ) => {
        if (event.rowType !== 'data' || !event.rowElement) {
            return;
        }

        const rowData = event.data as PerformanceTreeRow;
        event.rowElement.classList?.add(styles.performanceRow);

        if (rowData.securityName === 'Total') {
            event.rowElement.classList.add(styles.performanceRowTotal);
        }

        const hasChild = data.some((row) => row.parentId === rowData.id);
        if (hasChild) {
            event.rowElement.classList.add(styles.performanceRowParent);
        } else {
            event.rowElement.classList.add(styles.performanceRowSecurity);
        }
    };

    const handleCellPrepared = (
        event: CellPreparedEvent<PerformanceTreeRow, string | number | null>
    ) => {
        if (event.rowType !== 'data' || !event.cellElement || typeof event.value !== 'number') {
            return;
        }

        event.cellElement.classList.remove('cell-positive', 'cell-negative');

        if (event.value > 0) {
            event.cellElement.classList.add(styles.cellPositive);
        }

        if (event.value < 0) {
            event.cellElement.classList.add(styles.cellNegative);
        }
    };

    return (
        <>
            <section className={styles.performanceTable}>
                <PerformanceToolbar
                    mode={mode}
                    onModeChange={setMode}
                    onExpandAll={handleExpandAll}
                    onCollapseAll={handleCollapseAll}
                />

                <div className={styles.performanceTableGrid}>
                    <TreeList
                        width="100%"
                        key={mode}
                        dataSource={data}
                        keyExpr="id"
                        parentIdExpr="parentId"
                        rootValue={null}
                        showBorders={false}
                        showColumnLines
                        showRowLines
                        columnAutoWidth={false}
                        allowColumnResizing
                        columnResizingMode="widget"
                        hoverStateEnabled
                        rowAlternationEnabled={false}
                        wordWrapEnabled={false}
                        expandedRowKeys={expandedRowKeys}
                        onExpandedRowKeysChange={setExpandedRowKeys}
                        autoExpandAll={false}
                        onRowPrepared={handleRowPrepared}
                        onCellPrepared={handleCellPrepared}
                    >
                        <ColumnFixing enabled />

                        <Scrolling mode="standard" useNative showScrollbar="always" />

                        <PerformanceColumns periods={periods} metrics={metrics} />
                    </TreeList>
                </div>
            </section>
        </>
    );
}
