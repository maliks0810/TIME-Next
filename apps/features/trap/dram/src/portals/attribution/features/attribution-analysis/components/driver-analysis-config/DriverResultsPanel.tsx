import React from "react";
import { Alert, Card, Col, Empty, Row, Segmented, Space, Statistic, Table, Tag, Typography } from "antd";
import type { TableProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowDownOutlined, ArrowUpOutlined, AuditOutlined, GroupOutlined, UnorderedListOutlined } from "@ant-design/icons";
import type { DriverAnalysisResult, DriverRow } from "./driverTypes";
import { DriverEChartsPanel } from "./DriverEChartsPanel";

const { Text } = Typography;

export type DriverGridViewMode = "flat" | "period";

interface DriverResultsPanelProps {
  result?: DriverAnalysisResult;
  gridViewMode: DriverGridViewMode;
  onGridViewModeChange: (mode: DriverGridViewMode) => void;
}

type PeriodGroupRow = {
  key: string;
  period: string;
  direction: "top" | "bottom";
  rank: number;
  driverName: string;
  metricName: string;
  metricLabel: string;
  metricValue: number;
  metricDisplay: string;
  isPeriodGroup: true;
  children: DriverRow[];
};

type DriverGridRow = DriverRow | PeriodGroupRow;

function isPeriodGroupRow(row: DriverGridRow): row is PeriodGroupRow {
  return "isPeriodGroup" in row && row.isPeriodGroup === true;
}

const cardStyle: React.CSSProperties = {
  borderRadius: 8,
  border: "1px solid #d8dee9",
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)"
};

const cardBodyStyle: React.CSSProperties = { padding: 10 };

const formatBps = (value: number) => `${(value * 10000).toFixed(1)} bps`;

const formatMetricValue = (
  value: number,
  format: DriverAnalysisResult["metric"]["format"]
) => {
  if (format === "usd") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (format === "percent") {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (format === "number") {
    return value.toFixed(6);
  }
  return formatBps(value);
};

const createPeriodGroupRows = (
  rows: DriverRow[],
  result: DriverAnalysisResult,
  direction: "top" | "bottom"
): DriverGridRow[] => {
  const groupRows: Array<PeriodGroupRow | undefined> = result.periods.map((period) => {
    const periodRows = rows
      .filter((row) => row.period === period)
      .sort((a, b) => a.rank - b.rank);

    if (periodRows.length === 0) return undefined;

    const total = periodRows.reduce((sum, row) => sum + row.metricValue, 0);

    return {
      key: `${direction}-period-group-${period}`,
      period,
      direction,
      rank: 0,
      driverName: `${period} ${direction === "top" ? "Top" : "Bottom"} Drivers`,
      metricName: result.metric.name,
      metricLabel: result.metric.label,
      metricValue: total,
      metricDisplay: formatMetricValue(total, result.metric.format),
      isPeriodGroup: true,
      children: periodRows
    };
  });

  return groupRows.filter((row): row is PeriodGroupRow => row !== undefined);
};

const createColumns = (): ColumnsType<DriverGridRow> => [
  {
    title: "Period",
    dataIndex: "period",
    width: 78,
    fixed: "left",
    render: (value, row) => <Tag color={isPeriodGroupRow(row) ? "geekblue" : "blue"}>{value}</Tag>
  },
  {
    title: "#",
    dataIndex: "rank",
    width: 54,
    align: "center",
    render: (value, row) => (isPeriodGroupRow(row) ? "—" : value)
  },
  {
    title: "Driver",
    dataIndex: "driverName",
    width: 220,
    ellipsis: true,
    render: (value, row) => (
      <Text strong={isPeriodGroupRow(row)} style={isPeriodGroupRow(row) ? { color: "#0f172a" } : undefined}>
        {value}
      </Text>
    )
  },
  { title: "Metric", dataIndex: "metricLabel", width: 150, ellipsis: true },
  {
    title: "Value",
    dataIndex: "metricDisplay",
    width: 120,
    align: "right",
    render: (value, row) => (
      <Text strong={isPeriodGroupRow(row)} type={row.direction === "top" ? "success" : "danger"}>
        {value}
      </Text>
    )
  },
  {
    title: "Alloc",
    dataIndex: "allocationEffect",
    width: 100,
    align: "right",
    render: (value?: number) => (value === undefined ? "—" : formatBps(value))
  },
  {
    title: "Select",
    dataIndex: "selectionEffect",
    width: 100,
    align: "right",
    render: (value?: number) => (value === undefined ? "—" : formatBps(value))
  },
  {
    title: "Inter",
    dataIndex: "interactionEffect",
    width: 100,
    align: "right",
    render: (value?: number) => (value === undefined ? "—" : formatBps(value))
  }
];

export function DriverResultsPanel({ result, gridViewMode, onGridViewModeChange }: DriverResultsPanelProps) {
  if (!result) {
    return (
      <Card size="small" style={cardStyle} bodyStyle={{ padding: 28 }}>
        <Empty description="Configure the driver analysis controls and run analysis." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  const topTotal = result.topDrivers.reduce((sum, row) => sum + row.metricValue, 0);
  const bottomTotal = result.bottomDrivers.reduce((sum, row) => sum + row.metricValue, 0);

  const topRows: DriverGridRow[] =
    gridViewMode === "period" ? createPeriodGroupRows(result.topDrivers, result, "top") : result.topDrivers;

  const bottomRows: DriverGridRow[] =
    gridViewMode === "period" ? createPeriodGroupRows(result.bottomDrivers, result, "bottom") : result.bottomDrivers;

  const tableExpandable: TableProps<DriverGridRow>["expandable"] =
    gridViewMode === "period"
      ? {
          defaultExpandAllRows: true,
          indentSize: 14
        }
      : undefined;

  const gridModeToggle = (
    <Segmented
      size="small"
      value={gridViewMode}
      onChange={(value) => onGridViewModeChange(value as DriverGridViewMode)}
      options={[
        { label: "Flat", value: "flat", icon: <UnorderedListOutlined /> },
        { label: "By Period", value: "period", icon: <GroupOutlined /> }
      ]}
    />
  );

  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {result.summary.warnings && result.summary.warnings.length > 0 && (
        <Alert type="warning" showIcon message="Analysis completed with warnings" description={result.summary.warnings.join(" ")} />
      )}

      <Row gutter={[10, 10]}>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic title="Portfolio" value={result.portfolioId} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>As of {result.asOfDate}</Text>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic title="Periods" value={result.periods.join(", ")}
            valueStyle={{ fontSize: 18, fontWeight: 600 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Multi-period run</Text>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic title="Top Total" value={topTotal * 10000} precision={2} suffix="bps" prefix={<ArrowUpOutlined />} valueStyle={{ color: "#1d4ed8", fontSize: 18, fontWeight: 600 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{result.summary.topCount} rows</Text>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic title="Bottom Total" value={bottomTotal * 10000} precision={2} suffix="bps" prefix={<ArrowDownOutlined />} valueStyle={{ color: "#b91c1c", fontSize: 18, fontWeight: 600 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{result.summary.bottomCount} rows</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[10, 10]}>
        <Col xs={24} lg={16}>
          <DriverEChartsPanel result={result} />
        </Col>
        <Col xs={24} lg={8}>
          <Card size="small" style={cardStyle} title={<Space><AuditOutlined />Run Audit</Space>}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Text><strong>Run ID:</strong> {result.runId}</Text>
              <Text><strong>Status:</strong> <Tag color="green">{result.summary.status}</Tag></Text>
              <Text><strong>Metric:</strong> {result.metric.label}</Text>
              <Text><strong>Group:</strong> {result.groupBy.join(", ")}</Text>
              <Text><strong>Grid:</strong> {gridViewMode === "period" ? "Grouped by period" : "Flat rows"}</Text>
              <Text><strong>Input Rows:</strong> {result.summary.inputRows}</Text>
              <Text><strong>Filtered:</strong> {result.summary.filteredRows}</Text>
              <Text><strong>Duration:</strong> {result.summary.durationMs} ms</Text>
            </Space>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
         <Card size="small" style={cardStyle} title={<Space><ArrowUpOutlined />Top Drivers</Space>} extra={gridModeToggle}>
        <Table<DriverGridRow>
          rowKey="key"
          size="small"
          bordered
          columns={createColumns()}
          dataSource={topRows}
          expandable={tableExpandable}
          pagination={gridViewMode === "period" ? false : { pageSize: 8, size: "small" }}
          scroll={{ x: 980 }}
          rowClassName={(row) => (isPeriodGroupRow(row) ? "driver-period-group-row" : "")}
        />
      </Card>
        </Col>
         <Col span={12}>
               <Card size="small" style={cardStyle} title={<Space><ArrowDownOutlined />Bottom Drivers</Space>} extra={gridModeToggle}>
        <Table<DriverGridRow>
          rowKey="key"
          size="small"
          bordered
          columns={createColumns()}
          dataSource={bottomRows}
          expandable={tableExpandable}
          pagination={gridViewMode === "period" ? false : { pageSize: 8, size: "small" }}
          scroll={{ x: 980 }}
          rowClassName={(row) => (isPeriodGroupRow(row) ? "driver-period-group-row" : "")}
        />
      </Card>
        </Col>
      </Row>



    </Space>
  );
}
