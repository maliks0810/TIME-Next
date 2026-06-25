import React, { useMemo, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Row, Col, Typography, Table, Tag, Segmented, Empty, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { usePerformanceSnapshot } from "../hooks/usePerformanceSnapshot";
import type {
  PerformanceSnapshotApiResponse,
  PerformanceSnapshotItem,
  SnapshotHorizon,
} from "../api/types";

const { Title, Text } = Typography;

type MatrixRow = {
  key: "NET" | "BENCH" | "SPREAD";
  metric: string;
  values: Record<string, number>;
};

type HistoryMode = "last3BusinessDays" | "lastMonthDaily" | "monthEnd";

function formatPct(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number") return "—";
  return `${value.toFixed(digits)}%`;
}

const EMPTY_SNAPSHOT: PerformanceSnapshotItem = {
  shareClassKey: "",
  asOfDate: "",
  portfolioName:"",
  horizons: [],
};

export default function PerformanceSnapshotDashboard(): React.JSX.Element {
  const { data, loading, error } = usePerformanceSnapshot();

  //  ALWAYS run hooks first
  const shareClasses = useMemo(
    () => [...new Set(data.map((d) => d.shareClassKey))],
    [data]
  );

  const [selectedShareClass, setSelectedShareClass] = useState<string>("");

  const [historyMode, setHistoryMode] =
    useState<HistoryMode>("last3BusinessDays");

  //  Fix initial selection when data arrives
  useEffect(() => {
    if (!selectedShareClass && shareClasses.length > 0) {
      setSelectedShareClass(shareClasses[0]);
    }
  }, [shareClasses, selectedShareClass]);

  const shareClassData = useMemo(
    () =>
      data
        .filter((d) => d.shareClassKey === selectedShareClass)
        .sort(
          (a, b) =>
            new Date(b.asOfDate).getTime() -
            new Date(a.asOfDate).getTime(),
        ),
    [data, selectedShareClass],
  );

  const currentSnapshot = shareClassData[0] ?? EMPTY_SNAPSHOT;

  const kpis = useMemo(() => {
    const map = new Map(currentSnapshot.horizons.map((h) => [h.key, h]));

    return [
      { title: "Daily Net", value: map.get("DAILY")?.netReturn ?? null },
      { title: "MTD Net", value: map.get("MTD")?.netReturn ?? null },
      { title: "3M Net", value: map.get("3M")?.netReturn ?? null },
      { title: "6M Net", value: map.get("6M")?.netReturn ?? null },
      { title: "12M Net", value: map.get("12M")?.netReturn ?? null },
    ];
  }, [currentSnapshot]);

  function getLast3(data: PerformanceSnapshotApiResponse) {
    return data.slice(0, 3).reverse();
  }

  function getMonthEnd(data: PerformanceSnapshotApiResponse) {
    const map = new Map<string, PerformanceSnapshotItem>();

    data.forEach((d) => {
      const m = d.asOfDate.slice(0, 7);
      if (!map.has(m)) map.set(m, d);
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.asOfDate).getTime() -
        new Date(b.asOfDate).getTime(),
    );
  }

  function getLastMonthDaily(data: PerformanceSnapshotApiResponse) {
    if (!data.length) return [];

    const latestMonth = data[0].asOfDate.slice(0, 7);

    return data.filter((d) => d.asOfDate.startsWith(latestMonth));
  }

  const historyData = useMemo(() => {
    switch (historyMode) {
      case "last3BusinessDays":
        return getLast3(shareClassData);
      case "lastMonthDaily":
        return getLastMonthDaily(shareClassData);
      case "monthEnd":
        return getMonthEnd(shareClassData);
    }
  }, [shareClassData, historyMode]);

  const historyChart = useMemo(() => ({
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: historyData.map((d) => d.asOfDate),
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Daily Net",
        type: "line",
        data: historyData.map(
          (d) => d.horizons.find((h) => h.key === "DAILY")?.netReturn ?? null
        ),
      },
    ],
  }), [historyData]);

  const chartOption = useMemo(() => ({
    tooltip: { trigger: "axis" },
    legend: { data: ["Net", "Bench"] },
    xAxis: {
      type: "category",
      data: currentSnapshot.horizons.map((h) => h.label),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Net",
        type: "bar",
        data: currentSnapshot.horizons.map((h) =>
          typeof h.netReturn === "number" ? h.netReturn : null
        ),
      },
      {
        name: "Gross",
        type: "bar",
        data: currentSnapshot.horizons.map((h) =>
          typeof h.benchReturn === "number" ? h.benchReturn : null
        ),
      },
    ],
  }), [currentSnapshot]);

  function buildMatrixRows(snapshot: PerformanceSnapshotItem): MatrixRow[] {
    const net: Record<string, number> = {};
    const gross: Record<string, number> = {};
    const spread: Record<string, number> = {};

    snapshot.horizons.forEach((h) => {
      const n = typeof h.netReturn === "number" ? h.netReturn : 0;
      const g = typeof h.benchReturn === "number" ? h.benchReturn : 0;

      net[h.key] = n;
      gross[h.key] = g;
      spread[h.key] = g - n;
    });

    return [
      { key: "NET", metric: "Net", values: net },
      { key: "BENCH", metric: "Bench", values: gross },
      { key: "SPREAD", metric: "Spread", values: spread },
    ];
  }

  function buildMatrixColumns(
    horizons: SnapshotHorizon[],
  ): ColumnsType<MatrixRow> {
    return [
      { title: "Metric", dataIndex: "metric", key: "metric" },
      ...horizons.map((h) => ({
        title: h.label,
        key: h.key,
        render: (_: unknown, row: MatrixRow) => {
          const val = row.values[h.key];
          if (typeof val !== "number") return <Tag>—</Tag>;

          const color = val > 0 ? "green" : val < 0 ? "red" : "default";
          return <Tag color={color}>{val.toFixed(2)}%</Tag>;
        },
      })),
    ];
  }

  const matrixRows = buildMatrixRows(currentSnapshot);
  const matrixColumns = buildMatrixColumns(currentSnapshot.horizons);

  //  AFTER hooks
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;
  if (!data.length) return <Empty description="No data" />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Performance Snapshot</Title>

      <Text type="secondary">
        {currentSnapshot.shareClassKey} — {currentSnapshot.asOfDate}
      </Text>

      <Space direction="vertical" style={{ marginTop: 16 }}>
        <Segmented
          value={selectedShareClass}
          onChange={(v) => setSelectedShareClass(String(v))}
          options={shareClasses}
        />

        <Segmented
          value={historyMode}
          onChange={(v) => setHistoryMode(v as HistoryMode)}
          options={[
            { label: "3D", value: "last3BusinessDays" },
            { label: "Last Month", value: "lastMonthDaily" },
            { label: "Month-End", value: "monthEnd" },
          ]}
        />
      </Space>

      <Row gutter={16} style={{ marginTop: 16 }}>
        {kpis.map((kpi) => (
          <Col key={kpi.title} span={6}>
            <Card>
              <Text>{kpi.title}</Text>
              <Title level={4}>{formatPct(kpi.value)}</Title>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Returns by Horizon" style={{ marginTop: 24 }}>
        <ReactECharts option={chartOption} style={{ height: 400 }} />
      </Card>

      <Card title="Historical Trend" style={{ marginTop: 24 }}>
        <ReactECharts option={historyChart} style={{ height: 300 }} />
      </Card>

      <Card title="Return Matrix" style={{ marginTop: 24 }}>
        <Table<MatrixRow>
          rowKey="key"
          columns={matrixColumns}
          dataSource={matrixRows}
          pagination={false}
        />
      </Card>
    </div>
  );
}
