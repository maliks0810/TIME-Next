import { useMemo, useRef, useState } from "react";
import { Button, Empty, Segmented, Space, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import type { CallbackDataParams } from "echarts/types/dist/shared";
import type { PrimitiveCellValue } from "../dram-grid/types";
import { DRAM_CHART_THEME_NAME } from "./dramChartTheme";

const { Text } = Typography;

type Row = Record<string, PrimitiveCellValue>;

type ChartMode = "weight" | "return" | "contribution" | "effects";
type WeightViewMode = "pie" | "bars";

type Props = {
  data: Row[];
  height?: number;
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
  breakdown?: string;
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

type AxisTooltipParam = CallbackDataParams & {
  axisValue?: unknown;
  axisValueLabel?: unknown;
};

type PieTooltipParam = CallbackDataParams & {
  percent?: unknown;
  seriesName?: string;
};

type ChartClickParam = {
  name?: unknown;
};

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
    portfolioField: "PFContToRet",
    benchmarkField: "BMContToRet",
  },
  effects: {
    kind: "effects",
    label: "Attribution Effects",
  },
};

function toNum(value: PrimitiveCellValue | unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function fmtPct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function fmtPctValue(value: number): string {
  return (value * 100).toFixed(2);
}

function getChartValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const numericValue = value.find(
      (item): item is number => typeof item === "number" && Number.isFinite(item)
    );

    return numericValue ?? 0;
  }

  if (value && typeof value === "object" && "value" in value) {
    return getChartValue((value as { value?: unknown }).value);
  }

  return 0;
}

function getAxisValue(params: CallbackDataParams[]): string {
  const first = params[0] as AxisTooltipParam | undefined;

  if (!first) {
    return "";
  }

  if (typeof first.axisValueLabel === "string") {
    return first.axisValueLabel;
  }

  if (typeof first.axisValue === "string") {
    return first.axisValue;
  }

  if (typeof first.name === "string") {
    return first.name;
  }

  return "";
}

function getGroup(row: Row): string {
  return String(row["SecurityGroup"] ?? "");
}

export default function AttributionSingleModeChart({
  data,
  height = 360,
  selectedGroup,
  onSelect,
  breakdown,
}: Props) {
  const [mode, setMode] = useState<ChartMode>("weight");
  const [weightViewMode, setWeightViewMode] = useState<WeightViewMode>("bars");

  const chartRef = useRef<ReactECharts | null>(null);

  const metricConfig = METRIC_CONFIG[mode];

  const chartRows = useMemo(() => {
    return data.filter((row) => getGroup(row) !== "Total");
  }, [data]);

  const option = useMemo(() => {
    if (!chartRows.length) {
      return null;
    }

    const categories = chartRows.map((row) => getGroup(row));

    /**
     * WEIGHT = PIE / GROUPED HORIZONTAL BARS
     */
    if (mode === "weight") {
      const portfolioData = chartRows.map((row) => toNum(row["PFAvgWeight"]));
      const benchmarkData = chartRows.map((row) => toNum(row["BMAvgWeight"]));

      if (weightViewMode === "pie") {
        const portfolioPieData = chartRows.map((row) => ({
          name: getGroup(row),
          value: toNum(row["PFAvgWeight"]),
        }));

        const benchmarkPieData = chartRows.map((row) => ({
          name: getGroup(row),
          value: toNum(row["BMAvgWeight"]),
        }));

        return {
          animation: false,

          tooltip: {
            trigger: "item",
            formatter: (params: PieTooltipParam): string => {
              const value = getChartValue(params.value);
              const percent =
                typeof params.percent === "number" &&
                Number.isFinite(params.percent)
                  ? params.percent
                  : 0;

              return [
                `<strong>${params.seriesName ?? ""}</strong>`,
                `${params.name}`,
                `Value: ${fmtPct(value)}`,
                `Share: ${percent.toFixed(2)}%`,
              ].join("<br/>");
            },
          },

          legend: {
            type: "scroll",
            bottom: 0,
            textStyle: {
              fontSize: 11,
            },
          },

          series: [
            {
              name: "Portfolio",
              type: "pie",
              radius: ["42%", "68%"],
              center: ["30%", "45%"],
              data: portfolioPieData,
              stillShowZeroSum: true,
              avoidLabelOverlap: true,
              label: {
                show: true,
                fontSize: 10,
                formatter: (params: CallbackDataParams): string => {
                  const name =
                    typeof params.name === "string" ? params.name : "";

                  const percent =
                    "percent" in params &&
                    typeof (params as PieTooltipParam).percent === "number"
                      ? (params as PieTooltipParam).percent
                      : 0;

                  return `${name}\n${percent?.toFixed(1)}%`;
                },
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: "#fff",
              },
            },
            {
              name: "Benchmark",
              type: "pie",
              radius: ["42%", "68%"],
              center: ["70%", "45%"],
              data: benchmarkPieData,
              stillShowZeroSum: true,
              avoidLabelOverlap: true,
              label: {
                show: true,
                fontSize: 10,
                formatter: (params: CallbackDataParams): string => {
                  const name =
                    typeof params.name === "string" ? params.name : "";

                  const percent =
                    "percent" in params &&
                    typeof (params as PieTooltipParam).percent === "number"
                      ? (params as PieTooltipParam).percent
                      : 0;

                  return `${name}\n${percent?.toFixed(1)}%`;
                },
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: "#fff",
              },
            },
          ],

          graphic: [
            {
              type: "text",
              left: "24%",
              top: 10,
              style: {
                text: "Portfolio",
                fill: "#333",
                fontSize: 13,
                fontWeight: 600,
              },
            },
            {
              type: "text",
              left: "66%",
              top: 10,
              style: {
                text: "Benchmark",
                fill: "#333",
                fontSize: 13,
                fontWeight: 600,
              },
            },
          ],
        };
      }

      /**
       * WEIGHT = GROUPED HORIZONTAL BARS
       *
       * This is the better default compare view:
       * - same baseline
       * - easier PF vs BM comparison
       * - closer to client-report style sector weighting chart
       */
      return {
        animation: false,

        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params: CallbackDataParams[]): string => {
            if (!params.length) {
              return "";
            }

            const axisValue = getAxisValue(params);

            return [
              `<strong>${axisValue}</strong>`,
              ...params.map((param) => {
                const value = getChartValue(param.value);
                return `${param.seriesName}: ${fmtPct(value)}`;
              }),
            ].join("<br/>");
          },
        },

        legend: {
          bottom: 0,
        },

        grid: {
          left: 170,
          right: 56,
          top: 28,
          bottom: 70,
        },

        xAxis: {
          type: "value",
          name: "% of Portfolio",
          nameLocation: "end",
          nameGap: 18,
          axisLabel: {
            formatter: (value: number): string => fmtPctValue(value),
          },
          splitLine: {
            show: false,
          },
        },

        yAxis: {
          type: "category",
          data: categories,
          inverse: true,
          axisTick: {
            show: false,
          },
          axisLabel: {
            width: 150,
            overflow: "truncate",
          },
        },

        series: [
          {
            name: "Portfolio",
            type: "bar",
            data: portfolioData,
            barMaxWidth: 14,
            label: {
              show: true,
              position: "right",
              formatter: (params: CallbackDataParams): string => {
                return fmtPctValue(getChartValue(params.value));
              },
            },
          },
          {
            name: "Benchmark",
            type: "bar",
            data: benchmarkData,
            barMaxWidth: 14,
            label: {
              show: true,
              position: "right",
              formatter: (params: CallbackDataParams): string => {
                return fmtPctValue(getChartValue(params.value));
              },
            },
          },
        ],
      };
    }

    /**
     * EFFECTS = BAR
     */
    if (metricConfig.kind === "effects") {
      const allocData = chartRows.map((row) => toNum(row["AllocEffect"]));
      const selectData = chartRows.map((row) => toNum(row["SelectEffect"]));
      const interData = chartRows.map((row) => toNum(row["InterEffect"]));

      return {
        animation: false,

        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params: CallbackDataParams[]): string => {
            if (!params.length) {
              return "";
            }

            const axisValue = getAxisValue(params);

            return [
              `<strong>${axisValue}</strong>`,
              ...params.map((param) => {
                const value = getChartValue(param.value);
                const finalValue = breakdown === "MktCap" || breakdown === "PEfwd" ? value : fmtPct(value);
                return `${param.seriesName}: ${finalValue}`;
              }),
            ].join("<br/>");
          },
        },

        legend: {
          bottom: 0,
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
        },

        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (value: number): string => breakdown === "MktCap" || breakdown === "PEfwd" ? value.toString() : fmtPct(value),
          },
        },

        series: [
          {
            name: "Allocation",
            type: "bar",
            data: allocData,
          },
          {
            name: "Selection",
            type: "bar",
            data: selectData,
          },
          {
            name: "Interaction",
            type: "bar",
            data: interData,
          },
        ],
      };
    }

    /**
     * RETURN / CONTRIBUTION = BAR
     */
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
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: CallbackDataParams[]): string => {
          if (!params.length) {
            return "";
          }

          const axisValue = getAxisValue(params);

          return [
            `<strong>${axisValue}</strong>`,
            ...params.map((param) => {
              const value = getChartValue(param.value);
              const finalValue = breakdown === "MktCap" || breakdown === "PEfwd" ? value : fmtPct(value);
              return `${param.seriesName}: ${finalValue}`;
            }),
          ].join("<br/>");
        },
      },

      legend: {
        bottom: 0,
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
      },

      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number): string => breakdown === "MktCap" || breakdown === "PEfwd" ? value.toString() : fmtPct(value),
        },
      },

      series: [
        {
          name: "Portfolio",
          type: "bar",
          data: portfolioData,
        },
        {
          name: "Benchmark",
          type: "bar",
          data: benchmarkData,
        },
      ],
    };
  }, [chartRows, metricConfig, mode, weightViewMode]);

  const onEvents = useMemo(
    () => ({
      click: (params: ChartClickParam) => {
        if (typeof params.name === "string") {
          const next =
            params.name === selectedGroup ? null : params.name;
          onSelect?.(next ?? "");
        }
      },
    }),
    [onSelect]
  );

  function exportChartAsImage(): void {
    const chartInstance = chartRef.current?.getEchartsInstance();

    if (!chartInstance) {
      return;
    }

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

  if (!chartRows.length) {
    return <Empty description="No chart data available" />;
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "95%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Text strong>
          {mode === "weight" && weightViewMode === "bars"
            ? "Portfolio vs Benchmark Weight - Bar Compare"
            : mode === "weight" && weightViewMode === "pie"
              ? "Portfolio vs Benchmark Weight - Pie Compare"
              : metricConfig.label}
        </Text>

        <Space wrap>
          {
            breakdown === "MktCap" || breakdown === "PEfwd" ? <Segmented
            value={mode}
            onChange={(value) => setMode(value as ChartMode)}
            options={[
              { label: "Weight", value: "weight" },
              { label: "Return", value: "return" },
              { label: "Effects", value: "effects" },
            ]}
            size="middle"
          /> :
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
          }

          {mode === "weight" ? (
            <Segmented
              value={weightViewMode}
              onChange={(value) => setWeightViewMode(value as WeightViewMode)}
              options={[
                { label: "Bars", value: "bars" },
                { label: "Pie", value: "pie" },
              ]}
              size="middle"
            />
          ) : null}

          <Button onClick={exportChartAsImage}>Export Chart</Button>
        </Space>
      </div>

      {selectedGroup ? (
        <Text type="secondary">Drilldown: {selectedGroup}</Text>
      ) : null}

      {option ? (
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{
            width: "100%",
            height:
              mode === "weight" && weightViewMode === "bars"
                ? Math.max(height, chartRows.length * 34 + 90)
                : height,
          }}
          notMerge
          lazyUpdate
          onEvents={onEvents}
          theme={DRAM_CHART_THEME_NAME}
        />
      ) : (
        <Empty description="No chartable values available" />
      )}
    </Space>
  );
}