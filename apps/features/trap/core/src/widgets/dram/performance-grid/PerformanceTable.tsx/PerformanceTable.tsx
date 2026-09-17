// Currently Not deploying this functionality to production. Skip code review

import { useMemo, useState } from 'react';
import TreeList, { Column, ColumnFixing, Scrolling } from 'devextreme-react/tree-list';

import type { PerformanceRow, ViewMode } from './types';
import { breakdownRows, securityRows } from './performanceData';
import { PerformanceColumns } from './PerformanceColumns';
import { PerformanceToolbar } from './PerformanceToolbar';
import styles from './PerformanceTable.module.scss';

const NEUTRAL_FIELDS = ['weight', 'benchmarkWeight', 'beta', 'diviidentYield', 'pe'];

export function PerformanceTable() {
  const [mode, setMode] = useState<ViewMode>('security');
  const [expandedRowKeys, setExpandedRowKeys] = useState<Array<string | number>>([]);

  const data = useMemo<PerformanceRow[]>(() => {
    if(mode === 'security') {
      return securityRows;
    }

    return breakdownRows;
  }, [mode]);

  const handleExpandAll = () => {    
    const parentIds = new Set<string | number>();
    data.forEach((row) => {
      if(row.parentId !== null && row.parentId !== undefined) {
        parentIds.add(row.parentId);
      }
    });
    setExpandedRowKeys([...parentIds])
  };

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  }

  return (<>
    <section className={styles.performanceTable}>
      <PerformanceToolbar 
        mode={mode}
        onModeChange={setMode}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onExportToExcel={() => {

        }}
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
          columnResizingMode='widget'
          hoverStateEnabled
          rowAlternationEnabled={false}
          wordWrapEnabled={false}
          expandedRowKeys={expandedRowKeys}
          onExpandedRowKeysChange={setExpandedRowKeys}
          autoExpandAll={false}
          
          onRowPrepared={(event) => {
            if(event.rowType !== 'data' || !event.rowElement) {
              return;
            }

            const rowData = event.data as PerformanceRow;
            event.rowElement.classList?.add(styles.performanceRow);

            if(rowData.rowType === 'breakdown') {
              event.rowElement.classList.add(styles.performanceRowBreakdown);
            }

            if(rowData.rowType === 'security') {
              event.rowElement.classList.add(styles.performanceRowSecurity);
            }

            if(rowData.rowType === 'total') {
              event.rowElement.classList.add(styles.performanceRowTotal);
            }
          }}
          onCellPrepared={(event) => {
            if(event.rowType !== 'data' || !event.cellElement || typeof event.value !== 'number') {
              return;
            }

            const field = event.column?.dataField ?? "";

            event.cellElement.classList.remove('cell-positive', 'cell-negative');

            if(NEUTRAL_FIELDS.includes(field)) {
              return;
            }

            if(event.value > 0) {
              event.cellElement.classList.add(styles.cellPositive);
            }

            if(event.value < 0) {
              event.cellElement.classList.add(styles.cellNegative);
            }
          }}
        >
          <ColumnFixing enabled />

          <Scrolling 
            mode="standard"
            useNative
            showScrollbar="always"
          />

          <PerformanceColumns
            ColumnComponent={Column}
          />
        </TreeList>
      </div>
    </section>
  </>)
}