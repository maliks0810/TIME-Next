import { useMemo, useRef } from "react";

import DataGrid, {
  Column,
  ColumnFixing,
  Grouping,
  Scrolling,
  Selection,
  Sorting,
} from "devextreme-react/data-grid";
import {  } from "devextreme-react/data-grid";
import type { DataGridRef as DxDataGridRef } from "devextreme-react/data-grid";

import { AnalyticResultRow } from "../lib/services";
import '../lib/styles.scss';
import React from "react";
import { ToolbarPreparingEvent } from "devextreme/ui/data_grid";

type GridRowKind = "subtotal" | "security";

type GridRow = AnalyticResultRow & {
  GICS: string;
  rowKey: string;
  RowKind: GridRowKind;
  SortInGroup: number; // 0 subtotal first, 1 securities
  Level: number;
};
const norm = (s: unknown) => String(s ?? "").trim().toUpperCase();



export function normalizeRowsForGicsGrouping(
  rows: AnalyticResultRow[],
  breakdownField: string
): GridRow[] {
  return rows.map((r) => {
    const raw = r[breakdownField as keyof AnalyticResultRow];
    const gics =
      typeof raw === "string" && raw.trim().length > 0 ? raw : "Unclassified";

    // Subtotal rule: when GICS1 exists and SecurityName equals GICS1
    const gics1 = (r as unknown as { GICS1?: string | null }).GICS1;
    const isSubtotal = norm(r.SecurityName) === norm(gics1);

    return {
      ...r,
      GICS: gics,
      RowKind: isSubtotal ? "subtotal" : "security",
      SortInGroup: isSubtotal ? 0 : 1,
      Level: isSubtotal ? 0 : 1,
      rowKey: `${gics}::${isSubtotal ? "SUBTOTAL" : norm(r.SecurityName)}`,
    };
  });
}


type Props = {
  dataset: AnalyticResultRow[];
  breakdownField: string;
  onToolbarPreparing: (id: ToolbarPreparingEvent) => void
};

// const formatPct = (v?: number | null): string =>
//   v != null ? `${(v * 100).toFixed(4)}%` : "-";

// const formatBps = (v?: number | null): string =>
//   v != null ? `${(v * 10000).toFixed(5)}` : "-";

export function AnalyticsGridDx({ dataset, breakdownField ,onToolbarPreparing}: Props) {
  const gridRef = useRef<DxDataGridRef<GridRow, string> | null>(null);

  const { rows, totalRow } = useMemo(() => {
    const totalRow = dataset.find(
      (r) =>
        (r.SecurityName ?? "").trim().toUpperCase() === "TOTAL" &&
        (r[breakdownField as keyof AnalyticResultRow] == null)
    );

    const filtered = dataset.filter((r) => r !== totalRow);

    return {
      rows: normalizeRowsForGicsGrouping(filtered, breakdownField),
      totalRow,
    };
  }, [dataset, breakdownField]);

  const onDataGridToolbarPreparing = React.useCallback((e: ToolbarPreparingEvent) => {
  onToolbarPreparing(e);
  }, [onToolbarPreparing]);
return (
  <>
  <div className="dram-grid-wrapper">
    <div>{totalRow?.AllocEffect}</div>
    <DataGrid
      className="dram-grid"
      ref={gridRef}
      dataSource={rows}
      keyExpr="rowKey"
      showBorders
      onExporting={e => {
        e.fileName = `Attribution_by_${breakdownField}.xlsx`;
      }}
		  width="100%"
      columnAutoWidth={false}
      columnWidth={140}
      columnResizingMode="widget"
      onToolbarPreparing={onDataGridToolbarPreparing}
      repaintChangesOnly={true}

      onRowPrepared={(e) => {
        if (e.rowType !== "data") return;

        const row = e.data as GridRow;

        if (row.RowKind === "subtotal") {
          e.rowElement.classList.add("subtotal-row");
        }

        if (row.Level === 1) {
          e.rowElement.classList.add("level-1");
        }

      }}

    >

      <Grouping autoExpandAll />
      <Sorting mode="multiple" />

      <Selection mode="single" />
      <Scrolling mode="virtual"
         rowRenderingMode="virtual"
        columnRenderingMode="virtual"
        showScrollbar="always"/>
      <ColumnFixing enabled={true} />

      {/* group */}
      <Column dataField={breakdownField} groupIndex={0} visible={false} />

      <Column dataField="SortInGroup" visible={false} sortOrder="asc" />

      {/* main column */}

    <Column
      dataField="SecurityName"
      caption="Security"
      width={220}
      fixed
      fixedPosition="left"

    />


      {/* banded columns */}
      <Column caption="Portfolio">
        <Column dataField="PFAvgWeight" format="#.####%"  width={140} />
        <Column dataField="PFTotalRet" format="#.#####"  width={140}/>
        <Column dataField="PFContToRet" format="#.####"  width={140}/>
      </Column>

      <Column caption="Benchmark">
        <Column dataField="BMAvgWeight" format="#.####%"  width={140}/>
        <Column dataField="BMTotalRet" format="#.#####"  width={140}/>
        <Column dataField="BMContToRet" format="#.#####"  width={140}/>
      </Column>

      <Column caption="Effects">
        <Column dataField="AllocEffect"  format="#.#####"  width={140}/>
        <Column dataField="SelectEffect"  format="#.#####"  width={140}/>
        <Column dataField="InterEffect" format="#.#####"  width={140}/>
      </Column>
    </DataGrid>
    </div>
  </>
);
}