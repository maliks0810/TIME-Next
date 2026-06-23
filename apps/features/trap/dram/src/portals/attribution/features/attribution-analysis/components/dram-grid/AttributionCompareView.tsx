import { useMemo, useState } from "react";
import {
  Card,
  Col,
  Empty,
  Row as AntRow,
  Segmented,
  Space,
  Typography,
  theme,
} from "antd";
import ReactECharts from "echarts-for-react";

import type { ComposeOption } from "echarts/core";
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
} from "echarts/charts";

const { Text } = Typography;

type DataRow = Record<string, unknown>;

type CompareMetric = "weight" | "totalReturn" | "contribution";
type GlobalSort = "absDelta" | "portfolio" | "benchmark" | "name";
type WeightViewMode = "compare" | "delta";

type Props = {
  leftPeriod: string;
  rightPeriod: string;
  leftRows: DataRow[];
  rightRows: DataRow[];
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
  height?: number;
};

type AlignedGroupRow = {
  SecurityGroup: string;
  left: DataRow | null;
  right: DataRow | null;
};

type ChartTheme = {
  colorText: string;
  colorTextSecondary: string;
  colorBorderSecondary: string;
  colorPrimary: string;
  colorInfo: string;
  colorWarning: string;
  colorError: string;
  colorSuccess: string;
  colorFillSecondary: string;
  colorFillTertiary: string;
  palette: string[];
};

type PfBmDeltaChartOption = ComposeOption<
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | BarSeriesOption
  | LineSeriesOption
>;

type WeightGroupedBarChartOption = ComposeOption<
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | BarSeriesOption
>;

type WeightDumbbellChartOption = ComposeOption<
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | LineSeriesOption
  | ScatterSeriesOption
>;

type WaterfallChartOption = ComposeOption<
  | GridComponentOption
  | TooltipComponentOption
  | BarSeriesOption
>;

type MainChartOption =
  | PfBmDeltaChartOption
  | WeightGroupedBarChartOption
  | WeightDumbbellChartOption;

type AxisTooltipParam = {
  seriesName?: string;
  value?: unknown;
  name?: string;
  axisValue?: string;
  axisValueLabel?: string;
};

type ChartClickParam = {
  name?: unknown;
};

const NUMBER_FIELDS = {
  weight: {
    label: "Weight",
    pf: "PFAvgWeight",
    bm: "BMAvgWeight",
  },
  totalReturn: {
    label: "Total Return",
    pf: "PFTotalRet",
    bm: "BMTotalRet",
  },
  contribution: {
    label: "Contribution Return",
    pf: "PFContribToRet",
    bm: "BMContribToRet",
  },
} satisfies Record<
  CompareMetric,
  {
    label: string;
    pf: string;
    bm: string;
  }
>;

function getNumber(row: DataRow | null | undefined, key: string): number {
  const value = row?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getGroup(row: DataRow | null | undefined): string {
  return String(row?.["SecurityGroup"] ?? "");
}

function fmtPct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
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

function isAxisTooltipParams(value: unknown): value is AxisTooltipParam[] {
  return Array.isArray(value);
}

function alignRows(
  leftRows: DataRow[],
  rightRows: DataRow[]
): AlignedGroupRow[] {
  const leftMap = new Map<string, DataRow>();
  const rightMap = new Map<string, DataRow>();

  for (const row of leftRows) {
    const key = getGroup(row);
    if (key) {
      leftMap.set(key, row);
    }
  }

  for (const row of rightRows) {
    const key = getGroup(row);
    if (key) {
      rightMap.set(key, row);
    }
  }

  const keys = Array.from(
    new Set<string>([
      ...Array.from(leftMap.keys()),
      ...Array.from(rightMap.keys()),
    ])
  ).filter((key) => key !== "Total");

  return keys.map((key) => ({
    SecurityGroup: key,
    left: leftMap.get(key) ?? null,
    right: rightMap.get(key) ?? null,
  }));
}

function sortAlignedRows(
  rows: AlignedGroupRow[],
  metric: CompareMetric,
  sortBy: GlobalSort
): AlignedGroupRow[] {
  const { pf, bm } = NUMBER_FIELDS[metric];

  const next = [...rows];

  next.sort((a, b) => {
    const aPfDelta = getNumber(a.right, pf) - getNumber(a.left, pf);
    const bPfDelta = getNumber(b.right, pf) - getNumber(b.left, pf);

    const aBmDelta = getNumber(a.right, bm) - getNumber(a.left, bm);
    const bBmDelta = getNumber(b.right, bm) - getNumber(b.left, bm);

    const aAbsDelta = Math.max(Math.abs(aPfDelta), Math.abs(aBmDelta));
    const bAbsDelta = Math.max(Math.abs(bPfDelta), Math.abs(bBmDelta));

    switch (sortBy) {
      case "portfolio":
        return getNumber(b.right, pf) - getNumber(a.right, pf);

      case "benchmark":
        return getNumber(b.right, bm) - getNumber(a.right, bm);

      case "name":
        return a.SecurityGroup.localeCompare(b.SecurityGroup);

      case "absDelta":
      default:
        return bAbsDelta - aAbsDelta;
    }
  });

  return next;
}

function buildWeightGroupedBarOption(
  rows: AlignedGroupRow[],
  leftPeriod: string,
  rightPeriod: string,
  chartTheme: ChartTheme
): WeightGroupedBarChartOption {
  const cfg = NUMBER_FIELDS.weight;
  const categories = rows.map((row) => row.SecurityGroup);

  const leftPf = rows.map((row) => getNumber(row.left, cfg.pf));
  const leftBm = rows.map((row) => getNumber(row.left, cfg.bm));
  const rightPf = rows.map((row) => getNumber(row.right, cfg.pf));
  const rightBm = rows.map((row) => getNumber(row.right, cfg.bm));

  const series: BarSeriesOption[] = [
    {
      name: `${leftPeriod.toUpperCase()} PF`,
      type: "bar",
      data: leftPf,
      itemStyle: {
        color: chartTheme.colorPrimary,
      },
    },
    {
      name: `${leftPeriod.toUpperCase()} BM`,
      type: "bar",
      data: leftBm,
      itemStyle: {
        color: chartTheme.colorTextSecondary,
      },
    },
    {
      name: `${rightPeriod.toUpperCase()} PF`,
      type: "bar",
      data: rightPf,
      itemStyle: {
        color: chartTheme.colorInfo,
      },
    },
    {
      name: `${rightPeriod.toUpperCase()} BM`,
      type: "bar",
      data: rightBm,
      itemStyle: {
        color: chartTheme.colorBorderSecondary,
      },
    },
  ];

  return {
    backgroundColor: "transparent",
    color: chartTheme.palette,
    textStyle: {
      color: chartTheme.colorText,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown): string => {
        if (!isAxisTooltipParams(params) || !params.length) {
          return "";
        }

        const first = params[0];
        const group = first.axisValueLabel ?? first.axisValue ?? first.name ?? "";

        return [
          `<strong>${group}</strong>`,
          ...params.map((param) => {
            const value = getChartValue(param.value);
            return `${param.seriesName ?? ""}: ${fmtPct(value)}`;
          }),
        ].join("<br/>");
      },
    },
    legend: {
      top: 0,
      textStyle: {
        color: chartTheme.colorTextSecondary,
      },
    },
    grid: {
      left: 160,
      right: 48,
      top: 56,
      bottom: 32,
    },
    xAxis: {
      type: "value",
      name: "Weight",
      nameTextStyle: {
        color: chartTheme.colorTextSecondary,
      },
      axisLabel: {
        color: chartTheme.colorTextSecondary,
        formatter: (value: number): string => fmtPct(value),
      },
      splitLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true,
      axisLabel: {
        color: chartTheme.colorTextSecondary,
      },
      axisLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    series,
  };
}

function buildWeightDumbbellOption(
  rows: AlignedGroupRow[],
  leftPeriod: string,
  rightPeriod: string,
  chartTheme: ChartTheme
): WeightDumbbellChartOption {
  const cfg = NUMBER_FIELDS.weight;

  const leftLabel = leftPeriod.toUpperCase();
  const rightLabel = rightPeriod.toUpperCase();

  const categoryRows = rows.flatMap((row) => [
    `${row.SecurityGroup} · ${leftLabel}`,
    `${row.SecurityGroup} · ${rightLabel}`,
  ]);

  const leftPfScatter: Array<[number, string]> = [];
  const leftBmScatter: Array<[number, string]> = [];
  const rightPfScatter: Array<[number, string]> = [];
  const rightBmScatter: Array<[number, string]> = [];

  const connectorSeries: LineSeriesOption[] = [];

  for (const row of rows) {
    const leftCategory = `${row.SecurityGroup} · ${leftLabel}`;
    const rightCategory = `${row.SecurityGroup} · ${rightLabel}`;

    const leftPf = getNumber(row.left, cfg.pf);
    const leftBm = getNumber(row.left, cfg.bm);
    const rightPf = getNumber(row.right, cfg.pf);
    const rightBm = getNumber(row.right, cfg.bm);

    leftPfScatter.push([leftPf, leftCategory]);
    leftBmScatter.push([leftBm, leftCategory]);
    rightPfScatter.push([rightPf, rightCategory]);
    rightBmScatter.push([rightBm, rightCategory]);

    connectorSeries.push(
      {
        type: "line",
        data: [
          [leftPf, leftCategory],
          [leftBm, leftCategory],
        ],
        symbol: "none",
        silent: true,
        lineStyle: {
          color: leftPf >= leftBm ? chartTheme.colorSuccess : chartTheme.colorError,
          width: 2,
          opacity: 0.65,
        },
        tooltip: {
          show: false,
        },
      },
      {
        type: "line",
        data: [
          [rightPf, rightCategory],
          [rightBm, rightCategory],
        ],
        symbol: "none",
        silent: true,
        lineStyle: {
          color:
            rightPf >= rightBm ? chartTheme.colorSuccess : chartTheme.colorError,
          width: 2,
          opacity: 0.65,
        },
        tooltip: {
          show: false,
        },
      }
    );
  }

  const scatterSeries: ScatterSeriesOption[] = [
    {
      name: `${leftLabel} PF`,
      type: "scatter",
      data: leftPfScatter,
      symbolSize: 10,
      itemStyle: {
        color: chartTheme.colorPrimary,
      },
    },
    {
      name: `${leftLabel} BM`,
      type: "scatter",
      data: leftBmScatter,
      symbolSize: 10,
      itemStyle: {
        color: chartTheme.colorTextSecondary,
      },
    },
    {
      name: `${rightLabel} PF`,
      type: "scatter",
      data: rightPfScatter,
      symbolSize: 10,
      itemStyle: {
        color: chartTheme.colorInfo,
      },
    },
    {
      name: `${rightLabel} BM`,
      type: "scatter",
      data: rightBmScatter,
      symbolSize: 10,
      itemStyle: {
        color: chartTheme.colorBorderSecondary,
      },
    },
  ];

  const series: Array<LineSeriesOption | ScatterSeriesOption> = [
    ...connectorSeries,
    ...scatterSeries,
  ];

  return {
    backgroundColor: "transparent",
    color: chartTheme.palette,
    textStyle: {
      color: chartTheme.colorText,
    },
    tooltip: {
      trigger: "item",
      formatter: (params: unknown): string => {
        if (
          !params ||
          typeof params !== "object" ||
          !("seriesName" in params) ||
          !("value" in params)
        ) {
          return "";
        }

        const typed = params as {
          seriesName?: string;
          value?: unknown;
          name?: string;
        };

        const value = getChartValue(typed.value);
        const label =
          typeof typed.name === "string" && typed.name
            ? typed.name
            : Array.isArray(typed.value) && typeof typed.value[1] === "string"
              ? typed.value[1]
              : "";

        return [
          `<strong>${label}</strong>`,
          `${typed.seriesName ?? ""}: ${fmtPct(value)}`,
        ].join("<br/>");
      },
    },
    legend: {
      top: 0,
      textStyle: {
        color: chartTheme.colorTextSecondary,
      },
    },
    grid: {
      left: 190,
      right: 56,
      top: 56,
      bottom: 32,
    },
    xAxis: {
      type: "value",
      name: "Weight",
      nameTextStyle: {
        color: chartTheme.colorTextSecondary,
      },
      axisLabel: {
        color: chartTheme.colorTextSecondary,
        formatter: (value: number): string => fmtPct(value),
      },
      splitLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    yAxis: {
      type: "category",
      data: categoryRows,
      inverse: true,
      axisLabel: {
        color: chartTheme.colorTextSecondary,
      },
      axisLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    series,
  };
}

function buildPfBmDeltaOption(
  rows: AlignedGroupRow[],
  metric: CompareMetric,
  leftPeriod: string,
  rightPeriod: string,
  chartTheme: ChartTheme
): PfBmDeltaChartOption {
  const cfg = NUMBER_FIELDS[metric];
  const categories = rows.map((row) => row.SecurityGroup);

  const leftPf = rows.map((row) => getNumber(row.left, cfg.pf));
  const leftBm = rows.map((row) => getNumber(row.left, cfg.bm));
  const rightPf = rows.map((row) => getNumber(row.right, cfg.pf));
  const rightBm = rows.map((row) => getNumber(row.right, cfg.bm));

  const pfDelta = rows.map(
    (row) => getNumber(row.right, cfg.pf) - getNumber(row.left, cfg.pf)
  );

  const bmDelta = rows.map(
    (row) => getNumber(row.right, cfg.bm) - getNumber(row.left, cfg.bm)
  );

  const series: Array<BarSeriesOption | LineSeriesOption> = [
    {
      name: `${leftPeriod.toUpperCase()} Portfolio`,
      type: "bar",
      data: leftPf,
      itemStyle: {
        color: chartTheme.colorPrimary,
      },
    },
    {
      name: `${leftPeriod.toUpperCase()} Benchmark`,
      type: "bar",
      data: leftBm,
      itemStyle: {
        color: chartTheme.colorTextSecondary,
      },
    },
    {
      name: `${rightPeriod.toUpperCase()} Portfolio`,
      type: "bar",
      data: rightPf,
      itemStyle: {
        color: chartTheme.colorInfo,
      },
    },
    {
      name: `${rightPeriod.toUpperCase()} Benchmark`,
      type: "bar",
      data: rightBm,
      itemStyle: {
        color: chartTheme.colorBorderSecondary,
      },
    },
    {
      name: "Portfolio Δ",
      type: "line",
      yAxisIndex: 1,
      data: pfDelta,
      smooth: false,
      symbolSize: 8,
      itemStyle: {
        color: chartTheme.colorError,
      },
      lineStyle: {
        width: 2,
      },
    },
    {
      name: "Benchmark Δ",
      type: "line",
      yAxisIndex: 1,
      data: bmDelta,
      smooth: false,
      symbolSize: 8,
      itemStyle: {
        color: chartTheme.colorWarning,
      },
      lineStyle: {
        width: 2,
        type: "dashed",
      },
    },
  ];

  return {
    backgroundColor: "transparent",
    color: chartTheme.palette,
    textStyle: {
      color: chartTheme.colorText,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown): string => {
        if (!isAxisTooltipParams(params) || !params.length) {
          return "";
        }

        const first = params[0];
        const axisValue = first.axisValueLabel ?? first.axisValue ?? first.name ?? "";

        return [
          `<strong>${axisValue}</strong>`,
          ...params.map((param) => {
            const value = getChartValue(param.value);
            return `${param.seriesName ?? ""}: ${fmtPct(value)}`;
          }),
        ].join("<br/>");
      },
    },
    legend: {
      top: 0,
      textStyle: {
        color: chartTheme.colorTextSecondary,
      },
    },
    grid: {
      left: 56,
      right: 56,
      top: 64,
      bottom: 96,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: 35,
        color: chartTheme.colorTextSecondary,
      },
      axisLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    yAxis: [
      {
        type: "value",
        name: cfg.label,
        nameTextStyle: {
          color: chartTheme.colorTextSecondary,
        },
        axisLabel: {
          color: chartTheme.colorTextSecondary,
          formatter: (value: number): string => fmtPct(value),
        },
        splitLine: {
          lineStyle: {
            color: chartTheme.colorBorderSecondary,
          },
        },
      },
      {
        type: "value",
        name: "Delta",
        nameTextStyle: {
          color: chartTheme.colorTextSecondary,
        },
        axisLabel: {
          color: chartTheme.colorTextSecondary,
          formatter: (value: number): string => fmtPct(value),
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series,
  };
}

function buildWaterfallOption(
  row: DataRow | null,
  period: string,
  chartTheme: ChartTheme
): WaterfallChartOption {
  const alloc = getNumber(row, "AllocEffect");
  const select = getNumber(row, "SelectEffect");
  const inter = getNumber(row, "InterEffect");
  const total = alloc + select + inter;

  const values = [alloc, select, inter, total];
  const labels = ["Allocation", "Selection", "Interaction", "Total Active"];
  const cumulative = [0, alloc, alloc + select, 0];

  const series: BarSeriesOption[] = [
    {
      type: "bar",
      stack: "total",
      itemStyle: {
        color: "rgba(0,0,0,0)",
        borderColor: "rgba(0,0,0,0)",
      },
      emphasis: {
        itemStyle: {
          color: "rgba(0,0,0,0)",
          borderColor: "rgba(0,0,0,0)",
        },
      },
      data: cumulative,
    },
    {
      name: "Effect",
      type: "bar",
      stack: "total",
      label: {
        show: true,
        position: "top",
        color: chartTheme.colorText,
        formatter: (params): string => fmtPct(getChartValue(params.value)),
      },
      data: values.map((value, idx) => ({
        value,
        itemStyle: {
          color:
            idx === 3
              ? chartTheme.colorPrimary
              : value >= 0
                ? chartTheme.colorTextSecondary
                : chartTheme.colorWarning,
        },
      })),
    },
  ];

  return {
    backgroundColor: "transparent",
    textStyle: {
      color: chartTheme.colorText,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (): string => {
        return [
          `<strong>${period.toUpperCase()}</strong>`,
          `Allocation: ${fmtPct(alloc)}`,
          `Selection: ${fmtPct(select)}`,
          `Interaction: ${fmtPct(inter)}`,
          `Total Active: ${fmtPct(total)}`,
        ].join("<br/>");
      },
    },
    grid: {
      left: 40,
      right: 24,
      top: 56,
      bottom: 40,
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        color: chartTheme.colorTextSecondary,
      },
      axisLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: chartTheme.colorTextSecondary,
        formatter: (value: number): string => fmtPct(value),
      },
      splitLine: {
        lineStyle: {
          color: chartTheme.colorBorderSecondary,
        },
      },
    },
    series,
  };
}

function extractGroupFromChartClick(
  rawName: unknown,
  leftPeriod: string,
  rightPeriod: string
): string | null {
  if (typeof rawName !== "string" || !rawName) {
    return null;
  }

  const leftSuffix = ` · ${leftPeriod.toUpperCase()}`;
  const rightSuffix = ` · ${rightPeriod.toUpperCase()}`;

  if (rawName.endsWith(leftSuffix)) {
    return rawName.slice(0, -leftSuffix.length);
  }

  if (rawName.endsWith(rightSuffix)) {
    return rawName.slice(0, -rightSuffix.length);
  }

  return rawName;
}

export default function AttributionCompareView({
  leftPeriod,
  rightPeriod,
  leftRows,
  rightRows,
  selectedGroup,
  onSelect,
  height = 420,
}: Props) {
  const { token } = theme.useToken();

  const [metric, setMetric] = useState<CompareMetric>("weight");
  const [sortBy, setSortBy] = useState<GlobalSort>("absDelta");
  const [weightViewMode, setWeightViewMode] =
    useState<WeightViewMode>("compare");

  const chartTheme = useMemo<ChartTheme>(
    () => ({
      colorText: token.colorText,
      colorTextSecondary: token.colorTextSecondary,
      colorBorderSecondary: token.colorBorderSecondary,
      colorPrimary: token.colorPrimary,
      colorInfo: token.colorInfo,
      colorWarning: token.colorWarning,
      colorError: token.colorError,
      colorSuccess: token.colorSuccess,
      colorFillSecondary: token.colorFillSecondary,
      colorFillTertiary: token.colorFillTertiary,
      palette: [
        token.colorPrimary,
        token.colorInfo,
        token.colorSuccess,
        token.colorWarning,
        token.colorError,
        token.colorTextSecondary,
        token.colorBorderSecondary,
        token.colorFillSecondary,
        token.colorFillTertiary,
      ],
    }),
    [
      token.colorText,
      token.colorTextSecondary,
      token.colorBorderSecondary,
      token.colorPrimary,
      token.colorInfo,
      token.colorWarning,
      token.colorError,
      token.colorSuccess,
      token.colorFillSecondary,
      token.colorFillTertiary,
    ]
  );

  const alignedRows = useMemo(() => {
    return sortAlignedRows(alignRows(leftRows, rightRows), metric, sortBy);
  }, [leftRows, rightRows, metric, sortBy]);

  const leftLookup = useMemo(() => {
    const map = new Map<string, DataRow>();

    for (const row of leftRows) {
      map.set(getGroup(row), row);
    }

    return map;
  }, [leftRows]);

  const rightLookup = useMemo(() => {
    const map = new Map<string, DataRow>();

    for (const row of rightRows) {
      map.set(getGroup(row), row);
    }

    return map;
  }, [rightRows]);

  const waterfallGroup = selectedGroup ?? "Total";

  const leftSelected =
    leftLookup.get(waterfallGroup) ?? leftLookup.get("Total") ?? null;

  const rightSelected =
    rightLookup.get(waterfallGroup) ?? rightLookup.get("Total") ?? null;

  const mainOption = useMemo<MainChartOption>(() => {
    if (metric === "weight") {
      if (weightViewMode === "delta") {
        return buildWeightDumbbellOption(
          alignedRows,
          leftPeriod,
          rightPeriod,
          chartTheme
        );
      }

      return buildWeightGroupedBarOption(
        alignedRows,
        leftPeriod,
        rightPeriod,
        chartTheme
      );
    }

    return buildPfBmDeltaOption(
      alignedRows,
      metric,
      leftPeriod,
      rightPeriod,
      chartTheme
    );
  }, [
    alignedRows,
    metric,
    weightViewMode,
    leftPeriod,
    rightPeriod,
    chartTheme,
  ]);

  const leftWaterfall = useMemo<WaterfallChartOption>(
    () => buildWaterfallOption(leftSelected, leftPeriod, chartTheme),
    [leftSelected, leftPeriod, chartTheme]
  );

  const rightWaterfall = useMemo<WaterfallChartOption>(
    () => buildWaterfallOption(rightSelected, rightPeriod, chartTheme),
    [rightSelected, rightPeriod, chartTheme]
  );

  if (!alignedRows.length) {
    return <Empty description="No aligned compare-period data available." />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <AntRow justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Text strong>
            {metric === "weight"
              ? weightViewMode === "delta"
                ? "Portfolio vs Benchmark Weight Delta"
                : "Portfolio vs Benchmark Weight Compare"
              : "Portfolio vs Benchmark with Delta"}
          </Text>
        </Col>

        <Col>
          <Space wrap>
            <Segmented
              value={metric}
              onChange={(value) => setMetric(value as CompareMetric)}
              options={[
                { label: "Weight", value: "weight" },
                { label: "Total Return", value: "totalReturn" },
                { label: "Contribution", value: "contribution" },
              ]}
            />

            {metric === "weight" ? (
              <Segmented
                value={weightViewMode}
                onChange={(value) => setWeightViewMode(value as WeightViewMode)}
                options={[
                  { label: "Compare", value: "compare" },
                  { label: "Delta", value: "delta" },
                ]}
              />
            ) : null}

            <Segmented
              value={sortBy}
              onChange={(value) => setSortBy(value as GlobalSort)}
              options={[
                { label: "Δ", value: "absDelta" },
                { label: "PF", value: "portfolio" },
                { label: "BM", value: "benchmark" },
                { label: "A→Z", value: "name" },
              ]}
            />
          </Space>
        </Col>
      </AntRow>

      <ReactECharts
        style={{
          width: "100%",
          height:
            metric === "weight" && weightViewMode === "delta"
              ? Math.max(height, alignedRows.length * 56)
              : height,
        }}
        option={mainOption}
        notMerge
        lazyUpdate
        onEvents={{
          click: (params: ChartClickParam) => {
            const group = extractGroupFromChartClick(
              params.name,
              leftPeriod,
              rightPeriod
            );

            if (group) {
              onSelect?.(group);
            }
          },
        }}
      />

      <AntRow gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title={
              <AntRow justify="space-between">
                <span>Attribution Waterfall</span>
                <Text type="secondary">
                  {leftPeriod.toUpperCase()} · {waterfallGroup}
                </Text>
              </AntRow>
            }
          >
            <ReactECharts
              style={{ width: "100%", height: 320 }}
              option={leftWaterfall}
              notMerge
              lazyUpdate
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <AntRow justify="space-between">
                <span>Attribution Waterfall</span>
                <Text type="secondary">
                  {rightPeriod.toUpperCase()} · {waterfallGroup}
                </Text>
              </AntRow>
            }
          >
            <ReactECharts
              style={{ width: "100%", height: 320 }}
              option={rightWaterfall}
              notMerge
              lazyUpdate
            />
          </Card>
        </Col>
      </AntRow>
    </Space>
  );
}