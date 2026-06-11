import type { EChartsOption } from "echarts";
import { pct, pctAxis, compact } from "./alphaDashboardFormatters";
import { average, getMetricValue, normalizeItem, safeArray, sortRows } from "./alphaDashboardHelpers";
import { DashboardPayload, MetricConfig, MetricKey, RankingItem, RankingItemRaw } from "../types/alphaDashboard";

export const COLORS = {
  text: "#0f172a",
  muted: "#64748b",
  green: "#4B773D",
  red: "#ef4444",
  blue: "#013D7D",
  purple: "#6C1444",
};

export const METRICS: Record<MetricKey, MetricConfig> = {
  alpha: {
    key: "alpha",
    label: "Alpha",
    color: COLORS.blue,
    heatColorMin: "#E7F3FC",
    heatColorMax: "#013D7D",
  },
  portfolioReturn: {
    key: "portfolioReturn",
    label: "Gross Return",
    color: COLORS.green,
    heatColorMin: "#F6FAE8",
    heatColorMax: "#4B773D",
  },
  netReturn: {
    key: "netReturn",
    label: "Net Return",
    color: COLORS.purple,
    heatColorMin: "#F4DBDD",
    heatColorMax: "#6C1444",
  },
};

export function metricLabel(metric: MetricKey): string {
  return METRICS[metric]?.label ?? "Metric";
}

export function buildRankBarOption(
  items: RankingItemRaw[] | undefined,
  title: string,
  metric: MetricKey,
  color: string,
  direction: "top" | "bottom"
): EChartsOption {
  const normalized = safeArray(items).map(normalizeItem);

  const fallback: RankingItem = {
    portfolioNumber: "—",
    portfolioName: "No Data",
    alpha: 0,
    portfolioReturn: 0,
    netReturn: 0,
    rank: 0,
    nav: null,
    benchmarkName: "—",
    performanceStatus: "—",
  };

  const displayItems = sortRows(
    normalized.length ? normalized : [fallback],
    metric,
    direction === "bottom" ? "asc" : "desc"
  );

  return {
    animationDuration: 500,
    grid: { left: 18, right: 18, top: 48, bottom: 18, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = Array.isArray(params) ? params : [params];
        const first = arr[0] as { dataIndex?: number } | undefined;
        const row = displayItems[first?.dataIndex ?? 0];
        if (!row) return "";

        return [
          `<strong>${row.portfolioName}</strong>`,
          `Rank: ${row.rank ?? "—"}`,
          `${metricLabel(metric)}: ${pct(getMetricValue(row, metric))}`,
          `Alpha: ${pct(row.alpha)}`,
          `Gross Return: ${pct(row.portfolioReturn)}`,
          `Net Return: ${pct(row.netReturn)}`,
          `NAV: ${compact(row.nav)}`,
          `Benchmark: ${row.benchmarkName}`,
          `Status: ${row.performanceStatus}`,
        ].join("<br/>");
      },
    },
    xAxis: {
      type: "value",
      axisLabel: { formatter: (value: number) => pctAxis(value), color: COLORS.muted },
      splitLine: { lineStyle: { color: "rgba(100,116,139,0.15)" } },
    },
    yAxis: {
      type: "category",
      data: displayItems.map((item) => item.portfolioName),
      axisLabel: { color: "#334155", width: 160, overflow: "truncate" },
    },
    series: [
      {
        type: "bar",
        data: displayItems.map((item) => getMetricValue(item, metric) ?? 0),
        barMaxWidth: 26,
        itemStyle: {
          color,
          borderRadius: direction === "bottom" ? [8, 0, 0, 8] : [0, 8, 8, 0],
        },
      },
    ],
    title: {
      text: title,
      left: "center",
      textStyle: { fontSize: 14, fontWeight: 700, color: COLORS.text },
    },
  };
}

export function buildGroupedBarOption(
  payload: DashboardPayload,
  period: string,
  metric: MetricKey
): EChartsOption {
  const styleNames =
    Array.isArray(payload.styles) && payload.styles.length
      ? payload.styles
      : Object.keys(payload.rankingsByStyle ?? {});

  const summary = styleNames.map((styleName) => {
    const bucket = payload.rankingsByStyle?.[styleName]?.[period] ?? { top: [], bottom: [] };

    return {
      styleName,
      avgTop: average(safeArray(bucket.top).map(normalizeItem).map((row) => getMetricValue(row, metric))),
      avgBottom: average(safeArray(bucket.bottom).map(normalizeItem).map((row) => getMetricValue(row, metric))),
    };
  });

  return {
    legend: { top: 10 },
    grid: { left: 18, right: 18, top: 52, bottom: 18, containLabel: true },
    xAxis: { type: "category", data: summary.map((item) => item.styleName) },
    yAxis: { type: "value", axisLabel: { formatter: (value: number) => pctAxis(value) } },
    series: [
      {
        name: `Avg Top ${metricLabel(metric)}`,
        type: "bar",
        data: summary.map((item) => item.avgTop ?? 0),
        itemStyle: { color: METRICS[metric].color },
      },
      {
        name: `Avg Bottom ${metricLabel(metric)}`,
        type: "bar",
        data: summary.map((item) => item.avgBottom ?? 0),
        itemStyle: { color: COLORS.red },
      },
    ],
  };
}

export function buildTreemapOption(
  payload: DashboardPayload,
  period: string,
  metric: MetricKey
): EChartsOption {
  const styleNames =
    Array.isArray(payload.styles) && payload.styles.length
      ? payload.styles
      : Object.keys(payload.rankingsByStyle ?? {});

  return {
    tooltip: {
      formatter: (info: unknown) => {
        const data = (info as { data?: { name?: string; metricValue?: number | null; nav?: number | null; value?: unknown } })?.data;
        if (!data?.name) return "";
        return [
          `<strong>${data.name}</strong>`,
          `${metricLabel(metric)}: ${pct(data.metricValue ?? null)}`,
          `NAV: ${compact(data.nav ?? null)}`,
        ].join("<br/>");
      },
    },
    series: [
      {
        type: "treemap",
        data: styleNames.map((styleName) => {
          const bucket = payload.rankingsByStyle?.[styleName]?.[period] ?? { top: [], bottom: [] };
          const children = [...safeArray(bucket.top), ...safeArray(bucket.bottom)]
            .map(normalizeItem)
            .map((row) => ({
              name: row.portfolioName,
              value: [row.nav ?? 0, getMetricValue(row, metric) ?? 0],
              itemStyle: {
                color: (getMetricValue(row, metric) ?? 0) >= 0 ? COLORS.green : COLORS.red,
              },
              metricValue: getMetricValue(row, metric),
              nav: row.nav,
            }));

          return {
            name: styleName,
            children: children.length
              ? children
              : [{ name: "No Data", value: [1, 0] }],
          };
        }),
      },
    ],
  };
}

export function buildHeatmapOption(
  payload: DashboardPayload,
  metric: MetricKey
): EChartsOption {
  const periods =
    Array.isArray(payload.periods) && payload.periods.length
      ? payload.periods
      : ["MTD", "QTD", "YTD"];

  const styleNames =
    Array.isArray(payload.styles) && payload.styles.length
      ? payload.styles
      : Object.keys(payload.rankingsByStyle ?? {});

  const points: Array<[number, number, number]> = [];
  const allValues: number[] = [];

  styleNames.forEach((styleName, yIndex) => {
    periods.forEach((period, xIndex) => {
      const bucket = payload.rankingsByStyle?.[styleName]?.[period] ?? { top: [], bottom: [] };
      const avg = average(
        [...safeArray(bucket.top), ...safeArray(bucket.bottom)]
          .map(normalizeItem)
          .map((row) => getMetricValue(row, metric))
      );
      const safeValue = avg ?? 0;
      allValues.push(safeValue);
      points.push([xIndex, yIndex, safeValue]);
    });
  });

  const min = allValues.length ? Math.min(...allValues) : -0.05;
  const max = allValues.length ? Math.max(...allValues) : 0.05;

  return {
    tooltip: {
      position: "top",
      formatter: (arg: unknown) => {
        const value = (arg as { value: [number, number, number] }).value;
        return `${styleNames[value[1]]} ${periods[value[0]]}<br/>Avg ${metricLabel(metric)}: ${pct(value[2])}`;
      },
    },
    grid: { left: 90, right: 24, top: 16, bottom: 60 },
    xAxis: { type: "category", data: periods, splitArea: { show: true } },
    yAxis: { type: "category", data: styleNames, splitArea: { show: true } },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: {
        color: [METRICS[metric].heatColorMin, METRICS[metric].heatColorMax],
      },
      formatter: (value: unknown) => {
        const n = Number(value);
        return Number.isFinite(n) ? pct(n) : "";
      },
    },
    series: [
      {
        name: `Avg ${metricLabel(metric)}`,
        type: "heatmap",
        data: points,
        label: {
          show: true,
          formatter: (arg: unknown) => {
            const value = (arg as { value: [number, number, number] }).value;
            return pct(value[2]);
          },
        },
      },
    ],
  };
}
