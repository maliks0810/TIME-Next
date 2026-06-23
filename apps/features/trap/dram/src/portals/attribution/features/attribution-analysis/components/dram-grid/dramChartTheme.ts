import * as echarts from "echarts";

export const DRAM_CHART_THEME_NAME = "dram-light";

export function registerDramChartTheme() {
  echarts.registerTheme(DRAM_CHART_THEME_NAME, {
    color: [
      "#1f6aa5", // primary (portfolio)
      "#6b6b6b", // benchmark
      "#DB9F00", // highlight
      "#4B773D",
      "#654D88",
    ],

    backgroundColor: "#ffffff",

    textStyle: {
      fontFamily: "Segoe UI, Roboto, sans-serif",
      color: "#333",
    },

    title: {
      textStyle: {
        fontWeight: 600,
        fontSize: 14,
      },
    },

    legend: {
      textStyle: {
        color: "#333",
      },
    },

    tooltip: {
      backgroundColor: "#ffffff",
      borderColor: "#ddd",
      borderWidth: 1,
      textStyle: {
        color: "#333",
      },
    },

    xAxis: {
      axisLine: { lineStyle: { color: "#ccc" } },
      axisLabel: { color: "#555" },
      splitLine: {
        show: false,
      },
    },

    yAxis: {
      axisLine: { show: false },
      axisLabel: { color: "#555" },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#f0f0f0",
        },
      },
    },

    grid: {
      containLabel: true,
    },
  });
}