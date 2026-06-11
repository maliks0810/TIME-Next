import React, { useMemo } from "react";
import { Button, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AborVsIborDailyRow } from "./aborVsIbor";
import {
  formatBp,
  formatCurrency,
  formatDate,
  formatPercent,
  getBreakTextStyle,
  getDailyRowClassName,
  isDailyToleranceBreak,
  withDailyTotalRow,
} from "./aborVsIborTableModels";
import { CsvColumn, exportRowsToCsv } from "./exportCsv";

export interface AttributionABORvsIBORDailyTableProps {
  data: AborVsIborDailyRow[];
  selectedPortfolioId?: string | null;
}

export default function AttributionABORvsIBORDailyTable({
  data,
  selectedPortfolioId,
}: AttributionABORvsIBORDailyTableProps) {
  const dataSource = useMemo(() => withDailyTotalRow(data), [data]);

  const exportColumns: CsvColumn<AborVsIborDailyRow>[] = [
    { key: "portfolioId", header: "Portfolio ID" },
    { key: "asOfDate", header: "As Of Date" },
    { key: "mv", header: "MV", format: (v) => String(v ?? "") },
    { key: "mtdIbor", header: "MTD IBOR", format: (v) => String(v ?? "") },
    { key: "dayIbor", header: "Day IBOR", format: (v) => String(v ?? "") },
    { key: "bodNav", header: "BOD NAV", format: (v) => String(v ?? "") },
    { key: "eodNav", header: "EOD NAV", format: (v) => String(v ?? "") },
    { key: "eodTotCf", header: "EOD TOT CF", format: (v) => String(v ?? "") },
    { key: "eodNavCfAdj", header: "EOD NAV CF Adj", format: (v) => String(v ?? "") },
    { key: "mtdAbor", header: "MTD ABOR", format: (v) => String(v ?? "") },
    { key: "dayAbor", header: "Day ABOR", format: (v) => String(v ?? "") },
    { key: "mtdAborMinusIborBp", header: "MTD ABOR - IBOR (bp)", format: (v) => String(v ?? "") },
    { key: "dayAborMinusIborBp", header: "Day ABOR - IBOR (bp)", format: (v) => String(v ?? "") },
  ];

  const handleExport = (): void => {
    const suffix = selectedPortfolioId ? `-${selectedPortfolioId}` : "";
    exportRowsToCsv(
      `abor-vs-ibor-daily${suffix}.csv`,
      dataSource,
      exportColumns,
    );
  };

  const columns: ColumnsType<AborVsIborDailyRow> = [
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
      title: "As Of Date",
      dataIndex: "asOfDate",
      key: "asOfDate",
      width: 140,
      render: (value: string, row) =>
        row.isTotalRow ? <strong /> : formatDate(value),
    },
    {
      title: "MV",
      dataIndex: "mv",
      key: "mv",
      align: "right",
      width: 140,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
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
      title: "Day IBOR",
      dataIndex: "dayIbor",
      key: "dayIbor",
      align: "right",
      width: 120,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "BOD NAV",
      dataIndex: "bodNav",
      key: "bodNav",
      align: "right",
      width: 140,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "EOD NAV",
      dataIndex: "eodNav",
      key: "eodNav",
      align: "right",
      width: 140,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "EOD TOT CF",
      dataIndex: "eodTotCf",
      key: "eodTotCf",
      align: "right",
      width: 140,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "EOD NAV CF Adj",
      dataIndex: "eodNavCfAdj",
      key: "eodNavCfAdj",
      align: "right",
      width: 160,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "MTD ABOR",
      dataIndex: "mtdAbor",
      key: "mtdAbor",
      align: "right",
      width: 120,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "Day ABOR",
      dataIndex: "dayAbor",
      key: "dayAbor",
      align: "right",
      width: 120,
      render: (value: number, row) => (
        <span style={row.isTotalRow ? { fontWeight: 700 } : undefined}>
          {formatPercent(value, 4)}
        </span>
      ),
    },
    {
      title: "MTD ABOR - IBOR (bp)",
      dataIndex: "mtdAborMinusIborBp",
      key: "mtdAborMinusIborBp",
      align: "right",
      width: 170,
      render: (value: number, row) => {
        const isBreak = isDailyToleranceBreak(row);
        return (
          <span style={getBreakTextStyle(isBreak, true)}>
            {formatBp(value, 1)}
          </span>
        );
      },
    },
    {
      title: "Day ABOR - IBOR (bp)",
      dataIndex: "dayAborMinusIborBp",
      key: "dayAborMinusIborBp",
      align: "right",
      width: 170,
      render: (value: number, row) => {
        const isBreak = isDailyToleranceBreak(row);
        return (
          <span style={getBreakTextStyle(isBreak, true)}>
            {formatBp(value, 1)}
          </span>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Text strong>
          ABOR vs IBOR Daily{selectedPortfolioId ? ` — ${selectedPortfolioId}` : ""}
        </Typography.Text>
        <Button onClick={handleExport}>Export CSV</Button>
      </Space>

      <Table<AborVsIborDailyRow>
        rowKey={(row) =>
          `${row.portfolioId}-${row.asOfDate}-${row.gridTitle}-${row.isTotalRow ? "total" : "detail"}`
        }
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 1850 }}
        rowClassName={getDailyRowClassName}
        size="small"
        sticky
      />
    </Space>
  );
}