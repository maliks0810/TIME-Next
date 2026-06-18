import { useMemo, useRef, useState } from "react";import { Button, Empty, Segmented, Space, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import type { PrimitiveCellValue } from "../dram-grid/types";

const { Text } = Typography;

type Row = Record<string, PrimitiveCellValue>;

type ChartMode = "weight" | "return" | "contribution" | "effects";

type Props = {
  data: Row[];
  height?: number;
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
};

type PairedMetricConfig = {
  kind: "paired";
  label: string;
  portfolioField: string;
  benchmarkField: string;
};

type EffectsMetricConfig = {
  kind: "effects";
  label: string;
};

type MetricConfig = PairedMetricConfig | EffectsMetricConfig;

const METRIC_CONFIG: Record<ChartMode, MetricConfig> = {
  weight: {
    kind: "paired",
    label: "Portfolio vs Benchmark Weight",
    portfolioField: "PFAvgWeight",
    benchmarkField: "BMAvgWeight",
  },
  return: {
    kind: "paired",
    label: "Portfolio vs Benchmark Total Return",
    portfolioField: "PFTotalRet",
    benchmarkField: "BMTotalRet",
  },
  contribution: {
    kind: "paired",
    label: "Portfolio vs Benchmark Contribution Return",
    portfolioField: "PFContribToRet",
    benchmarkField: "BMContribToRet",
  },
  effects: {
    kind: "effects",
    label: "Attribution Effects",
  },
};

const COLORS = {
  portfolio: "#1f6aa5",
  benchmark: "#6b6b6b",
  allocation: "#1f6aa5",
  selection: "#6b6b6b",
  interaction: "#faad14",
};

const toNum = (value: PrimitiveCellValue): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const fmtPct = (value: number): string => `${(value * 100).toFixed(2)}%`;

export default function AttributionSingleModeChart({
  data,
  height = 360,
  selectedGroup,
  onSelect,
}: Props) {
  const [mode, setMode] = useState<ChartMode>("weight");
  const chartRef = useRef<ReactECharts | null>(null);
  const metricConfig = METRIC_CONFIG[mode];

  const chartRows = useMemo(() => {
    return data.filter(
      (row) => String(row["SecurityGroup"] ?? "") !== "Total"
    );
  }, [data]);

  const option = useMemo(() => {
    if (!chartRows.length) return null;

    const categories = chartRows.map((row) =>
      String(row["SecurityGroup"] ?? "")
    );

    if (metricConfig.kind === "effects") {
      const allocData = chartRows.map((row) => toNum(row["AllocEffect"]));
      const selectData = chartRows.map((row) => toNum(row["SelectEffect"]));
      const interData = chartRows.map((row) => toNum(row["InterEffect"]));

      return {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (
            params: Array<{
              seriesName: string;
              value: number;
              axisValue: string;
            }>
          ) => {
            if (!Array.isArray(params) || params.length === 0) return "";

            return [
              `<strong>${params[0].axisValue}</strong>`,
              ...params.map(
                (p) => `${p.seriesName}: ${fmtPct(Number(p.value ?? 0))}`
              ),
            ].join("<br/>");
          },
        },
        legend: {
          data: ["Allocation", "Selection", "Interaction"],
          bottom: 0,
          textStyle: {
            fontSize: 11,
            color: "#333",
          },
        },
        grid: {
          left: 40,
          right: 20,
          top: 28,
          bottom: 70,
        },
        xAxis: {
          type: "category",
          data: categories,
          axisLabel: {
            rotate: 25,
            fontSize: 10,
            color: "#333",
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (v: number) => fmtPct(v),
            fontSize: 10,
            color: "#333",
          },
        },
        series: [
          {
            name: "Allocation",
            type: "bar",
            data: allocData,
            itemStyle: {
              color: COLORS.allocation,
            },
            barCategoryGap: "35%",
          },
          {
            name: "Selection",
            type: "bar",
            data: selectData,
            itemStyle: {
              color: COLORS.selection,
            },
          },
          {
            name: "Interaction",
            type: "bar",
            data: interData,
            itemStyle: {
              color: COLORS.interaction,
            },
          },
        ],
      };
    }

    const portfolioData = chartRows.map((row) =>
      toNum(row[metricConfig.portfolioField])
    );
    const benchmarkData = chartRows.map((row) =>
      toNum(row[metricConfig.benchmarkField])
    );

    return {
      animation: false,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (
          params: Array<{
            seriesName: string;
            value: number;
            axisValue: string;
          }>
        ) => {
          if (!Array.isArray(params) || params.length === 0) return "";

          return [
            `<strong>${params[0].axisValue}</strong>`,
            ...params.map(
              (p) => `${p.seriesName}: ${fmtPct(Number(p.value ?? 0))}`
            ),
          ].join("<br/>");
        },
      },
      legend: {
        data: ["Portfolio", "Benchmark"],
        bottom: 0,
        textStyle: {
          fontSize: 11,
          color: "#333",
        },
      },
      grid: {
        left: 40,
        right: 20,
        top: 28,
        bottom: 70,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          rotate: 25,
          fontSize: 10,
          color: "#333",
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (v: number) => fmtPct(v),
          fontSize: 10,
          color: "#333",
        },
      },
      series: [
        {
          name: "Portfolio",
          type: "bar",
          data: portfolioData,
          itemStyle: {
            color: COLORS.portfolio,
          },
          barCategoryGap: "35%",
        },
        {
          name: "Benchmark",
          type: "bar",
          data: benchmarkData,
          itemStyle: {
            color: COLORS.benchmark,
          },
        },
      ],
    };
  }, [chartRows, metricConfig]);

  const onEvents = useMemo(
    () => ({
      click: (params: { name?: string }) => {
        if (typeof params?.name === "string") {
          onSelect?.(params.name);
        }
      },
    }),
    [onSelect]
  );

  if (!chartRows.length) {
    return <Empty description="No chart data available" />;
  }
function exportChartAsImage() {
  const chartInstance = chartRef.current?.getEchartsInstance();

  if (!chartInstance) return;

  const url = chartInstance.getDataURL({
    type: "png",
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.href = url;
  link.download = "chart.png";
  link.click();
}
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong>{metricConfig.label}</Text>

        <Segmented
          value={mode}
          onChange={(value) => setMode(value as ChartMode)}
          options={[
            { label: "Weight", value: "weight" },
            { label: "Return", value: "return" },
            { label: "Contribution", value: "contribution" },
            { label: "Effects", value: "effects" },
          ]}
          size="middle"
        />
        <Button onClick={exportChartAsImage}>
                    Export Chart
        </Button>
      </div>

      {selectedGroup ? (
        <Text type="secondary">Drilldown: {selectedGroup}</Text>
      ) : null}

      {option ? (
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ width: "100%", height }}
          notMerge
          lazyUpdate
          onEvents={onEvents}
        />
      ) : (
        <Empty description="No chartable values available" />
      )}
    </Space>
  );
}
