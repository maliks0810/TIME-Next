import type { EChartsOption } from "echarts";
import type { PerformanceSnapshotApiResponse, PerformanceSnapshotItem } from "../api/types";

export function safeNumber(value: number | null | undefined): number | null {
  return typeof value === "number" ? value : null;
}

export function safeSpread(
  gross: number | null | undefined,
  net: number | null | undefined,
): number | null {
  return typeof gross === "number" && typeof net === "number"
    ? gross - net
    : null;
}

export function buildSnapshotChartOption(
  snapshot: PerformanceSnapshotItem,
): EChartsOption {
  return {
    animation: true,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Net", "Gross", "Spread"],
      top: 0,
    },
    grid: {
      left: 20,
      right: 20,
      top: 48,
      bottom: 20,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: snapshot.horizons.map((h) => h.label),
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: "value",
        name: "Return",
        axisLabel: {
          formatter: (value: number) => `${value}%`,
        },
        splitLine: {
          lineStyle: { color: "#f0f0f0" },
        },
      },
      {
        type: "value",
        name: "Spread",
        axisLabel: {
          formatter: (value: number) => `${value}%`,
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Net",
        type: "bar",
        data: snapshot.horizons.map((h) => safeNumber(h.netReturn)),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: "#013D7D",
        },
      },
      {
        name: "Gross",
        type: "bar",
        data: snapshot.horizons.map((h) => safeNumber(h.grossReturn)),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: "#4B773D",
        },
      },
      {
        name: "Spread",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: snapshot.horizons.map((h) =>
          safeSpread(h.grossReturn, h.netReturn),
        ),
        lineStyle: {
          width: 3,
          color: "#D76712",
        },
        itemStyle: {
          color: "#D76712",
        },
      },
    ],
  };
}

export function buildChart(snapshot: PerformanceSnapshotItem): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Net", "Gross"] },
    xAxis: {
      type: "category",
      data: snapshot.horizons.map((h) => h.label),
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Net",
        type: "bar",
        data: snapshot.horizons.map((h) => safeNumber(h.netReturn)),
      },
      {
        name: "Gross",
        type: "bar",
        data: snapshot.horizons.map((h) => safeNumber(h.grossReturn)),
      },
    ],
  };
}

export function buildSnapshotFromArray(
  data: PerformanceSnapshotApiResponse,
): EChartsOption {
  const snapshot = data[0]; // latest
  return buildSnapshotChartOption(snapshot);
}
