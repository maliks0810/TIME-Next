import React, { useMemo } from "react";
import { Button, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AborVsIborMtdRow } from "./aborVsIbor";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getBreakTextStyle,
  getFlagPillStyle,
  getMtdRowClassName,
  isMtdToleranceBreak,
  withMtdTotalRow,
} from "./aborVsIborTableModels";
import { CsvColumn, exportRowsToCsv } from "./exportCsv";

export interface AttributionABORvsIBORTableProps {
  data: AborVsIborMtdRow[];
  onDrillDown?: (portfolioId: string) => void;
}

export default function AttributionABORvsIBORTable({
  data,
  onDrillDown,
}: AttributionABORvsIBORTableProps) {
  const dataSource = useMemo(() => withMtdTotalRow(data), [data]);

  const exportColumns: CsvColumn<AborVsIborMtdRow>[] = [
    { key: "portfolioId", header: "Portfolio ID" },
    { key: "portfolioName", header: "Portfolio Name" },
    { key: "mtdAbor", header: "MTD ABOR", format: (v) => String(v ?? "") },
    { key: "mtdAborCfAdj", header: "MTD ABOR CF Adj", format: (v) => String(v ?? "") },
    { key: "mtdIbor", header: "MTD IBOR", format: (v) => String(v ?? "") },
    { key: "bomNav", header: "BOM NAV", format: (v) => String(v ?? "") },
    { key: "mtdCf", header: "MTD CF", format: (v) => String(v ?? "") },
    { key: "mtdCfBomNavPct", header: "MTD CF / BOM NAV (%)", format: (v) => String(v ?? "") },
    {
      key: "mtdAborMinusMtdAborCfAdj",
      header: "MTD ABOR - MTD ABOR CF Adj",
      format: (v) => String(v ?? ""),
    },
    {
      key: "mtdAborCfAdjMinusMtdIbor",
      header: "MTD ABOR CF Adj - MTD IBOR",
      format: (v) => String(v ?? ""),
    },
    { key: "tolerance", header: "Tolerance", format: (v) => String(v ?? "") },
    { key: "flag", header: "Flag", format: (v) => String(v ?? "") },
  ];

  const handleExport = (): void => {
    exportRowsToCsv(
      "abor-vs-ibor-mtd.csv",
      dataSource,
      exportColumns,
    );
  };

  const columns: ColumnsType<AborVsIborMtdRow> = [
    {
      title: "Portfolio ID",
      dataIndex: "portfolioId",
      key: "portfolioId",
      fixed: "left",
      width: 120,
      render: (value: string, row) =>
        row.isTotalRow ? <strong>{value}</strong> : value,
    },
    {
      title: "Portfolio Name",
      dataIndex: "portfolioName",
      key: "portfolioName",
      fixed: "left",
      width: 280,
      render: (value: string, row) =>
        row.isTotalRow ? <strong>{value}</strong> : value,
    },
    {
      title: "MTD ABOR",
      dataIndex: "mtdAbor",
      key: "mtdAbor",
      align: "right",
      width: 130,
      render: (value: number, row) => {
        const isBreak = isMtdToleranceBreak(row);
        return <span style={getBreakTextStyle(isBreak)}>{formatPercent(value, 4)}</span>;
      },
    },
    {
      title: "MTD ABOR CF Adj",
      dataIndex: "mtdAborCfAdj",
      key: "mtdAborCfAdj",
      align: "right",
      width: 150,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "MTD IBOR",
      dataIndex: "mtdIbor",
      key: "mtdIbor",
      align: "right",
      width: 120,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "BOM NAV",
      dataIndex: "bomNav",
      key: "bomNav",
      align: "right",
      width: 150,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "MTD CF",
      dataIndex: "mtdCf",
      key: "mtdCf",
      align: "right",
      width: 130,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "MTD CF / BOM NAV (%)",
      dataIndex: "mtdCfBomNavPct",
      key: "mtdCfBomNavPct",
      align: "right",
      width: 170,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "MTD ABOR - MTD ABOR CF Adj",
      dataIndex: "mtdAborMinusMtdAborCfAdj",
      key: "mtdAborMinusMtdAborCfAdj",
      align: "right",
      width: 220,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "MTD ABOR CF Adj - MTD IBOR",
      dataIndex: "mtdAborCfAdjMinusMtdIbor",
      key: "mtdAborCfAdjMinusMtdIbor",
      align: "right",
      width: 210,
      render: (value: number, row) => {
        const isBreak = isMtdToleranceBreak(row);
        return (
          <span style={getBreakTextStyle(isBreak, true)}>
            {formatPercent(value, 4)}
          </span>
        );
      },
    },
    {
      title: "Tolerance",
      dataIndex: "tolerance",
      key: "tolerance",
      align: "right",
      width: 100,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatNumber(value, 0)}
        </span>
      ),
    },
    {
      title: "Flag",
      dataIndex: "flag",
      key: "flag",
      align: "center",
      width: 90,
      render: (value: number, row) => {
        if (row.isTotalRow) {
          return <strong>{value}</strong>;
        }

        if (value === 1) {
          return <span style={getFlagPillStyle(value, row.isTotalRow)}>1</span>;
        }

        return value;
      },
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_value, row) => {
        if (row.isTotalRow) {
          return null;
        }

        return (
          <Button
            size="small"
            onClick={() => onDrillDown?.(row.portfolioId)}
          >
            View Daily
          </Button>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Text strong>ABOR vs IBOR MTD</Typography.Text>
        <Button onClick={handleExport}>Export CSV</Button>
      </Space>

      <Table<AborVsIborMtdRow>
        rowKey={(row) =>
          `${row.portfolioId}-${row.gridTitle}-${row.isTotalRow ? "total" : "detail"}`
        }
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 2050 }}
        rowClassName={getMtdRowClassName}
        size="small"
        sticky
      />
    </Space>
  );
}