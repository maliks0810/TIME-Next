import React from "react";
import { Button, Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";

import "./CompositeAttributionView.css";
import { CompositeAttributionViewData, MultiPeriodAttributionRow, SinglePeriodAttributionRow } from "./compositeAttributionAdapter";
import { getCompositePeriodLabel } from "./periodUtils";


const { Text, Title } = Typography;

interface CompositeAttributionViewProps {
  data: CompositeAttributionViewData;
  onExportCsv?: () => void;
}

const formatPercent = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatBps = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getSinglePeriodColumns = (): ColumnsType<SinglePeriodAttributionRow> => [
  {
    title: "Security Group",
    dataIndex: "securityGroup",
    key: "securityGroup",
    fixed: "left",
    width: 260,
    render: (_value: unknown, row: SinglePeriodAttributionRow) => {
      const level = row.level ?? 0;

      return (
        <span
          className={row.securityGroup === "Total" ? "composite-total-row-text" : undefined}
          style={{ paddingLeft: level * 18 }}
        >
          {row.securityGroup}
        </span>
      );
    },
  },
  {
    title: "Portfolio",
    children: [
      {
        title: "Port. Avg Weight",
        dataIndex: "portfolioAvgWeight",
        key: "portfolioAvgWeight",
        align: "right",
        width: 160,
        render: (value: number | null) => formatPercent(value),
      },
      {
        title: "Port. Total Return",
        dataIndex: "portfolioTotalReturn",
        key: "portfolioTotalReturn",
        align: "right",
        width: 170,
        render: (value: number | null) => formatPercent(value),
      },
      {
        title: "Port. Cont. Total Return",
        dataIndex: "portfolioContributionTotalReturn",
        key: "portfolioContributionTotalReturn",
        align: "right",
        width: 190,
        render: (value: number | null) => formatPercent(value),
      },
    ],
  },
  {
    title: "Bench",
    children: [
      {
        title: "Bench. Avg Weight",
        dataIndex: "benchmarkAvgWeight",
        key: "benchmarkAvgWeight",
        align: "right",
        width: 170,
        render: (value: number | null) => formatPercent(value),
      },
      {
        title: "Bench. Total Return",
        dataIndex: "benchmarkTotalReturn",
        key: "benchmarkTotalReturn",
        align: "right",
        width: 170,
        render: (value: number | null) => formatPercent(value),
      },
      {
        title: "Bench. Cont. Total Return",
        dataIndex: "benchmarkContributionTotalReturn",
        key: "benchmarkContributionTotalReturn",
        align: "right",
        width: 200,
        render: (value: number | null) => formatPercent(value),
      },
    ],
  },
  {
    title: "Attribution Analysis",
    children: [
      {
        title: "Alloc Effect",
        dataIndex: "allocationEffect",
        key: "allocationEffect",
        align: "right",
        width: 160,
        render: (value: number | null) => formatPercent(value),
      },
      {
        title: "Select Effect",
        dataIndex: "selectionEffect",
        key: "selectionEffect",
        align: "right",
        width: 160,
        render: (value: number | null) => formatPercent(value),
      },
      {
        title: "Inter Effect",
        dataIndex: "interactionEffect",
        key: "interactionEffect",
        align: "right",
        width: 160,
        render: (value: number | null) => formatPercent(value),
      },
    ],
  },
];

export const CompositeAttributionView: React.FC<CompositeAttributionViewProps> = ({
  data,
  onExportCsv,
}) => {
  const isSinglePeriod = data.periods.length <= 1;

  if (isSinglePeriod) {
    return (
      <Card
        className="composite-grid-card"
        title={
          <div className="composite-card-title">
            <span>Analytics Grid</span>
            <Text className="composite-row-count">{data.singlePeriodRows.length} rows</Text>
          </div>
        }
        extra={
          onExportCsv ? (
            <Button type="primary" icon={<DownloadOutlined />} onClick={onExportCsv}>
              Export CSV
            </Button>
          ) : null
        }
      >
        <Table<SinglePeriodAttributionRow>
          bordered
          size="small"
          rowKey="key"
          columns={getSinglePeriodColumns()}
          dataSource={data.singlePeriodRows}
          pagination={false}
          scroll={{ x: 1500, y: 520 }}
          rowClassName={(row) =>
            row.securityGroup === "Total" ? "composite-total-row" : "composite-standard-row"
          }
        />
      </Card>
    );
  }

  return <MultiPeriodCompositeView data={data} />;
};

interface MultiPeriodCompositeViewProps {
  data: CompositeAttributionViewData;
}

const MultiPeriodCompositeView: React.FC<MultiPeriodCompositeViewProps> = ({ data }) => {
  return (
    <div className="composite-report">
      <Title level={4} className="composite-report-title">
        {data.title}
      </Title>

      <div className="composite-as-of">{data.asOfDateText}</div>

      <table className="composite-report-table composite-summary-table">
        <thead>
          <tr>
            <th className="composite-label-col" />
            {data.periods.map((period) => (
              <th key={period.id}>{getCompositePeriodLabel(period)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.summaryRows.map((row) => (
            <tr
              key={row.key}
              className={[
                row.emphasis ? "composite-emphasis-row" : "",
                row.shaded ? "composite-shaded-row" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <td className="composite-label-col">{row.label}</td>

              {data.periods.map((period) => (
                <td key={period.id} className="composite-number-cell">
                  {formatPercent(row.values[period.id] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Title level={4} className="composite-attribution-title">
        Attribution of Gross Out/Underperformance (bps)
      </Title>

      <table className="composite-report-table composite-attribution-table">
        <thead>
          <tr>
            <th className="composite-label-col" />
            {data.periods.map((period) => (
              <th key={period.id}>{getCompositePeriodLabel(period)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {flattenAttributionRows(data.attributionRows).map((row) => (
            <tr key={row.key} className={row.level === 0 ? "composite-section-row" : ""}>
              <td className="composite-label-col">
                <span style={{ paddingLeft: (row.level ?? 0) * 40 }}>{row.label}</span>
              </td>

              {data.periods.map((period) => (
                <td key={period.id} className="composite-number-cell">
                  {formatBps(row.values[period.id] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Title level={4} className="composite-attribution-title">
        Contribution to Total Return (bps)
      </Title>

      <table className="composite-report-table composite-attribution-table">
        <thead>
          <tr>
            <th className="composite-label-col" />
            {data.periods.map((period) => (
              <th key={period.id}>{getCompositePeriodLabel(period)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {flattenAttributionRows(data.contributionRows).map((row) => (
            <tr
              key={row.key}
              className={[
                row.isTotal ? "composite-total-row" : "",
                row.level === 0 ? "composite-section-row" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <td className="composite-label-col">
                <span style={{ paddingLeft: (row.level ?? 0) * 40 }}>
                  {row.label}
                </span>
              </td>

              {data.periods.map((period) => (
                <td key={period.id} className="composite-number-cell">
                  {formatBps(row.values[period.id] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const flattenAttributionRows = (
  rows: MultiPeriodAttributionRow[],
): MultiPeriodAttributionRow[] => {
  return rows.flatMap((row) => {
    const children = row.children ? flattenAttributionRows(row.children) : [];
    return [row, ...children];
  });
};