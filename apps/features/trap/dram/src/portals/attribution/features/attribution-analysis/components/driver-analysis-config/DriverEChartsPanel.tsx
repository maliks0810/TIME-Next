import React from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ECharts, ComposeOption } from "echarts/core";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  DatasetComponentOption,
} from "echarts/components";
import { Card, Empty, Segmented, Space, Typography } from "antd";
import { BarChartOutlined, LineChartOutlined } from "@ant-design/icons";
import type { DriverAnalysisResult, DriverRow } from "./driverTypes";

const { Text } = Typography;

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  TransformComponent,
  CanvasRenderer,
]);

type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | DatasetComponentOption
>;

export type DriverChartMode = "topBottom" | "periodTrend";

interface DriverEChartsPanelProps {
  result?: DriverAnalysisResult;
}

const compactCardStyle: React.CSSProperties = {
  borderRadius: 8,
  border: "1px solid #d8dee9",
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
};

const useEChart = (option: ECOption | undefined) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<ECharts | null>(null);

  React.useEffect(() => {
    if (!containerRef.current || !option) return;

    chartRef.current = echarts.init(containerRef.current, undefined, {
      renderer: "canvas",
    });
    chartRef.current.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chartRef.current?.resize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [option]);

  return containerRef;
};

const getChartValue = (row: DriverRow, format: string): number => {
  if (format === "usd" || format === "number") return row.metricValue;
  if (format === "percent") return row.metricValue * 100;
  return row.metricValue * 10000;
};

const getAxisLabel = (format: string): string => {
  if (format === "usd") return "USD";
  if (format === "percent") return "%";
  if (format === "number") return "Value";
  return "bps";
};

const formatTooltipValue = (value: number, format: string): string => {
  if (format === "usd") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (format === "percent") return `${value.toFixed(2)}%`;
  if (format === "number") return value.toFixed(4);
  return `${value.toFixed(2)} bps`;
};

const topRowsByPeriod = (rows: DriverRow[], period: string, limit: number) =>
  rows
    .filter((row) => row.period === period)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);

const buildTopBottomOption = (result: DriverAnalysisResult): ECOption => {
  const format = result.metric.format;
  const periods = result.periods;
  const categories = periods.flatMap((period) => {
    const top = topRowsByPeriod(result.topDrivers, period, 3).map((row) => `${period} ${row.driverName}`);
    const bottom = topRowsByPeriod(result.bottomDrivers, period, 3).map((row) => `${period} ${row.driverName}`);
    return [...top, ...bottom];
  });

  const topValuesByCategory = new Map<string, number>();
  const bottomValuesByCategory = new Map<string, number>();

  periods.forEach((period) => {
    topRowsByPeriod(result.topDrivers, period, 3).forEach((row) => {
      topValuesByCategory.set(`${period} ${row.driverName}`, getChartValue(row, format));
    });
    topRowsByPeriod(result.bottomDrivers, period, 3).forEach((row) => {
      bottomValuesByCategory.set(`${period} ${row.driverName}`, getChartValue(row, format));
    });
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => formatTooltipValue(Number(value), format),
    },
    legend: {
      top: 0,
      right: 8,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11 },
    },
    grid: {
      top: 34,
      right: 18,
      bottom: 72,
      left: 52,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: 38,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      name: getAxisLabel(format),
      nameTextStyle: { fontSize: 10 },
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series: [
      {
        name: "Top",
        type: "bar",
        data: categories.map((category) => topValuesByCategory.get(category) ?? null),
        barMaxWidth: 18,
        itemStyle: { color: "#1d4ed8" },
      },
      {
        name: "Bottom",
        type: "bar",
        data: categories.map((category) => bottomValuesByCategory.get(category) ?? null),
        barMaxWidth: 18,
        itemStyle: { color: "#b91c1c" },
      },
    ],
  };
};

const buildPeriodTrendOption = (result: DriverAnalysisResult): ECOption => {
  const format = result.metric.format;
  const periods = result.periods;
  const topTotals = periods.map((period) =>
    result.topDrivers
      .filter((row) => row.period === period)
      .reduce((sum, row) => sum + getChartValue(row, format), 0)
  );
  const bottomTotals = periods.map((period) =>
    result.bottomDrivers
      .filter((row) => row.period === period)
      .reduce((sum, row) => sum + getChartValue(row, format), 0)
  );
  const netTotals = topTotals.map((value, index) => value + bottomTotals[index]);

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatTooltipValue(Number(value), format),
    },
    legend: {
      top: 0,
      right: 8,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11 },
    },
    grid: {
      top: 34,
      right: 18,
      bottom: 28,
      left: 52,
    },
    xAxis: {
      type: "category",
      data: periods,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: getAxisLabel(format),
      nameTextStyle: { fontSize: 10 },
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series: [
      {
        name: "Top Total",
        type: "bar",
        data: topTotals,
        barMaxWidth: 22,
        itemStyle: { color: "#1d4ed8" },
      },
      {
        name: "Bottom Total",
        type: "bar",
        data: bottomTotals,
        barMaxWidth: 22,
        itemStyle: { color: "#b91c1c" },
      },
      {
        name: "Net",
        type: "line",
        data: netTotals,
        smooth: true,
        symbolSize: 7,
        lineStyle: { width: 2, color: "#334155" },
        itemStyle: { color: "#334155" },
      },
    ],
  };
};

export function DriverEChartsPanel({ result }: DriverEChartsPanelProps) {
  const [mode, setMode] = React.useState<DriverChartMode>("topBottom");

  const option = React.useMemo(() => {
    if (!result) return undefined;
    return mode === "topBottom" ? buildTopBottomOption(result) : buildPeriodTrendOption(result);
  }, [mode, result]);
  function EChart({ option }: { option: ECOption }) {
    const ref = useEChart(option);

    return (
      <div
        ref={ref}
        className="driver-echarts-panel"
        style={{ height: "100%", width: "100%", minHeight: 300 }}
      />
    );
  }
  return (
    <Card
      size="small"
      style={compactCardStyle}
      title={
        <Space size={6}>
          {mode === "topBottom" ? <BarChartOutlined /> : <LineChartOutlined />}
          Driver Charts
        </Space>
      }
      extra={
        <Segmented
          size="small"
          value={mode}
          onChange={(value) => setMode(value as DriverChartMode)}
          options={[
            { label: "Top/Bottom", value: "topBottom", icon: <BarChartOutlined /> },
            { label: "By Period", value: "periodTrend", icon: <LineChartOutlined /> },
          ]}
        />
      }
    >
      {!result || !option ? (
        <Empty description="Run analysis to view driver charts." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>

          <div style={{ height: 300 }}>
            <EChart option={option} />
          </div>

          <Text type="secondary" style={{ fontSize: 12 }}>
            {mode === "topBottom"
              ? "Top three and bottom three drivers by selected period."
              : "Period-level top total, bottom total, and net driver impact."}
          </Text>
        </>
      )}
    </Card>
  );
}
