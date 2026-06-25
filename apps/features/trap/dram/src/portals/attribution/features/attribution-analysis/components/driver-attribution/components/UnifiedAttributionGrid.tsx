import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UnifiedAttributionRow } from "../types/unifiedDriverAttribution";
import { formatBps } from "../utils/formatting";

interface UnifiedAttributionGridProps {
  rows: UnifiedAttributionRow[];
  selectedDriverRowKey?: string;
  onRowClick?: (row: UnifiedAttributionRow) => void;
}

export function UnifiedAttributionGrid({ rows, selectedDriverRowKey, onRowClick }: UnifiedAttributionGridProps): React.ReactElement {
  const columns: ColumnsType<UnifiedAttributionRow> = [
    {
      title: "Driver",
      key: "driverIndicator",
      width: 120,
      fixed: "left",
      render: (_, row) => row.isDriver && row.driverRank && row.driverSide ? <Tag color={row.driverSide === "top" ? "blue" : "red"}>{row.driverSide === "top" ? "Top" : "Bottom"} #{row.driverRank}</Tag> : null,
    },
    { title: "Period", dataIndex: "periodId", key: "periodId", width: 100, fixed: "left" },
    { title: "Group", dataIndex: "groupLabel", key: "groupLabel", width: 220, fixed: "left" },
    { title: "Portfolio Wgt", key: "portfolioWeight", align: "right", render: (_, row) => row.values.portfolioWeight === undefined ? "—" : `${(row.values.portfolioWeight * 100).toFixed(2)}%` },
    { title: "Bench Wgt", key: "benchmarkWeight", align: "right", render: (_, row) => row.values.benchmarkWeight === undefined ? "—" : `${(row.values.benchmarkWeight * 100).toFixed(2)}%` },
    { title: "Portfolio Ret", key: "portfolioReturn", align: "right", render: (_, row) => row.values.portfolioReturn === undefined ? "—" : `${(row.values.portfolioReturn * 100).toFixed(2)}%` },
    { title: "Bench Ret", key: "benchmarkReturn", align: "right", render: (_, row) => row.values.benchmarkReturn === undefined ? "—" : `${(row.values.benchmarkReturn * 100).toFixed(2)}%` },
    { title: "Alloc", key: "allocationEffect", align: "right", render: (_, row) => formatBps((row.values.allocationEffect ?? 0) * 10000) },
    { title: "Select", key: "selectionEffect", align: "right", render: (_, row) => formatBps((row.values.selectionEffect ?? 0) * 10000) },
    { title: "Inter", key: "interactionEffect", align: "right", render: (_, row) => formatBps((row.values.interactionEffect ?? 0) * 10000) },
    { title: "Total", key: "totalEffect", align: "right", render: (_, row) => formatBps((row.values.totalEffect ?? row.values.manualValue ?? 0) * 10000) },
  ];

  return (
    <Table<UnifiedAttributionRow>
      size="small"
      rowKey="rowKey"
      columns={columns}
      dataSource={rows}
      pagination={false}
      scroll={{ x: 1500, y: 520 }}
      onRow={(row) => ({
        onClick: () => onRowClick?.(row),
        style: {
          cursor: onRowClick ? "pointer" : "default",
          background: row.rowKey === selectedDriverRowKey ? "#e6f4ff" : undefined,
        },
      })}
    />
  );
}
