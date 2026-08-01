import React from "react";
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ApartmentOutlined, BarChartOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import type { AttributionBreakdownRow, DriverAnalysisResult } from "./driverTypes";

const { Text } = Typography;

interface AttributionAnalysisPanelProps {
  result: DriverAnalysisResult;
}

const cardStyle: React.CSSProperties = {
  borderRadius: 8,
  border: "1px solid #d8dee9",
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)"
};

const cardBodyStyle: React.CSSProperties = { padding: 10 };
const toBps = (value: number) => Number((value * 10000).toFixed(2));
const formatBps = (value: number) => `${toBps(value).toFixed(2)} bps`;
const formatPct = (value: number) => `${(value * 100).toFixed(2)}%`;

function buildOption(rows: AttributionBreakdownRow[]): EChartsOption {
  const topRows = [...rows]
    .sort((a, b) => Math.abs(b.totalEffect) - Math.abs(a.totalEffect))
    .slice(0, 10);

  return {
    grid: { top: 28, left: 48, right: 18, bottom: 64 },
    legend: { top: 0, right: 0, textStyle: { fontSize: 11 } },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: topRows.map((row) => `${row.period} ${row.name}`),
      axisLabel: { rotate: 35, fontSize: 10 }
    },
    yAxis: {
      type: "value",
      name: "bps",
      splitLine: { lineStyle: { color: "#e5e7eb" } }
    },
    series: [
      {
        name: "Allocation",
        type: "bar",
        stack: "effect",
        data: topRows.map((row) => toBps(row.allocationEffect)),
        itemStyle: { color: "#2563eb" },
        barMaxWidth: 28
      },
      {
        name: "Selection",
        type: "bar",
        stack: "effect",
        data: topRows.map((row) => toBps(row.selectionEffect)),
        itemStyle: { color: "#16a34a" },
        barMaxWidth: 28
      },
      {
        name: "Interaction",
        type: "bar",
        stack: "effect",
        data: topRows.map((row) => toBps(row.interactionEffect)),
        itemStyle: { color: "#f59e0b" },
        barMaxWidth: 28
      },
      {
        name: "Total",
        type: "line",
        data: topRows.map((row) => toBps(row.totalEffect)),
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2, color: "#0f172a" },
        itemStyle: { color: "#0f172a" }
      }
    ]
  };
}

const columns: ColumnsType<AttributionBreakdownRow> = [
  { title: "Portfolio", dataIndex: "portfolioId", width: 105, fixed: "left" },
  { title: "Period", dataIndex: "period", width: 80, render: (value) => <Tag color="blue">{value}</Tag> },
  { title: "Dimension", dataIndex: "dimension", width: 110, ellipsis: true },
  { title: "Name", dataIndex: "name", width: 190, ellipsis: true, render: (value) => <Text strong>{value}</Text> },
  { title: "Port Wgt", dataIndex: "portfolioWeight", width: 100, align: "right", render: (value: number) => formatPct(value) },
  { title: "Bench Wgt", dataIndex: "benchmarkWeight", width: 100, align: "right", render: (value: number) => formatPct(value) },
  { title: "Active Wgt", dataIndex: "activeWeight", width: 100, align: "right", render: (value: number) => formatPct(value) },
  { title: "Port Ret", dataIndex: "portfolioReturn", width: 100, align: "right", render: (value: number) => formatPct(value) },
  { title: "Bench Ret", dataIndex: "benchmarkReturn", width: 100, align: "right", render: (value: number) => formatPct(value) },
  { title: "Alloc", dataIndex: "allocationEffect", width: 100, align: "right", render: (value: number) => formatBps(value) },
  { title: "Select", dataIndex: "selectionEffect", width: 100, align: "right", render: (value: number) => formatBps(value) },
  { title: "Inter", dataIndex: "interactionEffect", width: 100, align: "right", render: (value: number) => formatBps(value) },
  { title: "Total", dataIndex: "totalEffect", width: 110, align: "right", render: (value: number) => <Text type={value >= 0 ? "success" : "danger"}>{formatBps(value)}</Text> }
];

export function AttributionAnalysisPanel({ result }: AttributionAnalysisPanelProps) {
  const chartRef = React.useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = React.useRef<echarts.ECharts | null>(null);
  const rows = result.attributionBreakdown ?? [];
  const summary = result.attributionSummary;

  React.useEffect(() => {
    if (!chartRef.current || rows.length === 0) return;
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }
    chartInstanceRef.current.setOption(buildOption(rows), true);
    requestAnimationFrame(() => chartInstanceRef.current?.resize());
  }, [rows]);

  React.useEffect(() => {
    const onResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  if (!summary || rows.length === 0) {
    return null;
  }

  return (
    <Card
      size="small"
      style={cardStyle}
      title={
        <Space>
          <ApartmentOutlined />
          Attribution Analysis
        </Space>
      }
      extra={<Text type="secondary" style={{ fontSize: 12 }}>Allocation + Selection + Interaction</Text>}
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <Row gutter={[10, 10]}>
          <Col xs={24} md={6}>
            <Card size="small" bodyStyle={cardBodyStyle}>
              <Statistic title="Allocation" value={toBps(summary.allocationEffect)} precision={2} suffix="bps" valueStyle={{ fontSize: 16, color: "#2563eb" }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small" bodyStyle={cardBodyStyle}>
              <Statistic title="Selection" value={toBps(summary.selectionEffect)} precision={2} suffix="bps" valueStyle={{ fontSize: 16, color: "#16a34a" }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small" bodyStyle={cardBodyStyle}>
              <Statistic title="Interaction" value={toBps(summary.interactionEffect)} precision={2} suffix="bps" valueStyle={{ fontSize: 16, color: "#f59e0b" }} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small" bodyStyle={cardBodyStyle}>
              <Statistic title="Total Effect" value={toBps(summary.totalEffect)} precision={2} suffix="bps" valueStyle={{ fontSize: 16, color: summary.totalEffect >= 0 ? "#15803d" : "#b91c1c" }} />
            </Card>
          </Col>
        </Row>

        <Card size="small" bodyStyle={{ padding: 8 }} title={<Space><BarChartOutlined />Attribution Effects by Driver</Space>}>
          <div ref={chartRef} style={{ width: "100%", height: 280, minHeight: 280 }} />
        </Card>

        <Table<AttributionBreakdownRow>
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 8, size: "small" }}
          scroll={{ x: 1420 }}
        />
      </Space>
    </Card>
  );
}
