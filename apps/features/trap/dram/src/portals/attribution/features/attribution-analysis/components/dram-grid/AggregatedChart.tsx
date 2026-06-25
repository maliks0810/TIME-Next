import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Empty } from "antd";
import type { PrimitiveCellValue } from "../dram-grid/types";

type Row = Record<string, PrimitiveCellValue>;

type Metric = {
  id: string;
  label: string;
  visible?: boolean;
};

interface Props {
  data: Row[];
  metrics: Metric[];
  height?: number;
  onSelect?: (group: string) => void;
}

const getNumber = (row: Row, key: string): number | null => {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

export const AggregatedEChart: React.FC<Props> = ({
  data,
  metrics,
  height = 360,
  onSelect
}) => {

  const option = useMemo(() => {
    if (!data.length || !metrics?.length) return null;

    const categories = data.map(
      (r) => String(r["SecurityGroup"] ?? "Unknown")
    );

    const visibleMetrics = metrics.filter(
      (m) => m.visible !== false
    );

    const series = visibleMetrics.map((metric) => {
      const isEffect = metric.id.includes("Effect");

      return {
        name: metric.label,
        type: isEffect ? "line" : "bar",   //
        data: data.map((row) => getNumber(row, metric.id)),

        itemStyle: {
          color: isEffect ? "#6C1444" : "#1D518D",
        },
      };
    });

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (value: unknown) =>
          typeof value === "number"
            ? `${(value * 100).toFixed(2)}%`
            : "",
      },

      legend: {
        top: 0,
      },

      grid: {
        left: 56,
        right: 24,
        top: 48,
        bottom: 72,
      },

      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          interval: 0,
          rotate: 25,
        },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) =>
            `${(value * 100).toFixed(0)}%`,
        },
      },

      series,
    };
  }, [data, metrics]);

  if (!option) {
    return <Empty description="No chart data" />;
  }

  const onEvents = {
    click: (params: { name?: string }) => {
      if (typeof params.name === "string") {
        onSelect?.(params.name);
      }
    },
  };

  return (
    <ReactECharts
      option={option}
      style={{ width: "100%", height }}
      notMerge
      lazyUpdate
      onEvents={onEvents}
    />
  );
};