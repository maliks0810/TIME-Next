import React, { FC } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { RankingItem, MetricKey } from "./types/alphaDashboard";
import { pct, compact } from "./utils/alphaDashboardFormatters";
import { getMetricValue } from "./utils/alphaDashboardHelpers";
import { metricLabel } from "./utils/alphaDashboardCharts";

interface RankingTableProps {
  title: string;
  rows: RankingItem[];
  metric: MetricKey;
  bucket: "top" | "bottom";
}

export const RankingTable: FC<RankingTableProps> = ({
  rows,
  metric,
  bucket,
}) => {
  const columns: ColumnsType<RankingItem> = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
    },
    {
      title: "Portfolio",
      key: "portfolio",
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.portfolioName}</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>
            {row.portfolioNumber}
          </div>
        </div>
      ),
    },
    {
      title: metricLabel(metric),
      key: "metric",
      align: "right",
      render: (_, row) => pct(getMetricValue(row, metric)),
    },
    {
      title: "Alpha",
      dataIndex: "alpha",
      key: "alpha",
      align: "right",
      render: (value: number | null) => pct(value),
    },
    {
      title: "Gross",
      key: "portfolioReturn",
      align: "right",
      render: (_, row) =>
        pct(row.portfolioReturn ?? null),
    },
    {
      title: "Net",
      dataIndex: "netReturn",
      key: "netReturn",
      align: "right",
      render: (value: number | null) => pct(value),
    },
    {
      title: "NAV",
      dataIndex: "nav",
      key: "nav",
      align: "right",
      render: (value: number | null) => compact(value),
    },
    {
      title: "Benchmark",
      dataIndex: "benchmarkName",
      key: "benchmarkName",
    },
    {
      title: "Status",
      dataIndex: "performanceStatus",
      key: "performanceStatus",
    },
  ];

  return (
    <Table<RankingItem>
      rowKey={(row) =>
        `${row.portfolioNumber}-${row.rank ?? "na"}-${bucket}`
      }
      columns={columns}
      dataSource={rows}
      pagination={false}
      size="small"
      scroll={{ x: 900 }}
    />
  );
};