import React, { useEffect, useMemo, useState } from "react";
import { Empty, Segmented, Space, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import type { PrimitiveCellValue } from "../dram-grid/types";
import "./DramDataGrid.css"
type Row = Record<string, PrimitiveCellValue>;

type MetricConfig = {
  id: string;
  label: string;
  visible?: boolean;
};

interface Props {
  data: Row[];
  metrics: MetricConfig[];
  height?: number;
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
  defaultMetricId?: string;
}

const getNumber = (row: Row, key: string): number | null => {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const DEFAULT_PREFERRED_METRICS = [
  "PFAvgWeight",
  "BMAvgWeight",
  "PFContribToRet",
  "BMContribToRet",
];

export const AggregatedPieChart: React.FC<Props> = ({
  data,
  metrics,
  height = 360,
  selectedGroup,
  onSelect,
  defaultMetricId,
}) => {

  const metricOptions = useMemo(() => {
    return metrics
      .filter((m) => m.visible !== false)
      .filter((m) =>
        data.some((row) => typeof row[m.id] === "number")
      )
      .map((m) => ({
        value: m.id,
        label: m.label,
      }));
  }, [metrics, data]);

  const resolvedDefaultMetricId = useMemo(() => {
    if (defaultMetricId && metricOptions.some((m) => m.value === defaultMetricId)) {
      return defaultMetricId;
    }

    for (const preferred of DEFAULT_PREFERRED_METRICS) {
      if (metricOptions.some((m) => m.value === preferred)) {
        return preferred;
      }
    }

    return metricOptions[0]?.value;
  }, [metricOptions, defaultMetricId]);

  const [activeMetricId, setActiveMetricId] = useState<string | undefined>(
    resolvedDefaultMetricId
  );

  useEffect(() => {
    setActiveMetricId(resolvedDefaultMetricId);
  }, [resolvedDefaultMetricId]);

  const activeMetricLabel = useMemo(() => {
    return metricOptions.find((m) => m.value === activeMetricId)?.label ?? "";
  }, [metricOptions, activeMetricId]);

  const option = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || !activeMetricId) {
      return null;
    }

     const pieData = data
      .filter((row) => String(row["SecurityGroup"] ?? "") !== "Total")
      .map((row) => {
        const name = String(row["SecurityGroup"] ?? "Unknown");
        const value = getNumber(row, activeMetricId);

        if (value == null || value <= 0) {
          return null;
        }

        return {
          name,
          value,
          selected: selectedGroup === name,
        };
      })
      .filter(
        (
          item
        ): item is {
          name: string;
          value: number;
          selected: boolean;
        } => item !== null
      );

    if (pieData.length === 0) {
      return null;
    }

    return {
      tooltip: {
        trigger: "item",
        valueFormatter: (value: unknown) =>
          typeof value === "number"
            ? `${(value * 100).toFixed(2)}%`
            : "",
      },

      legend: {
        type: "scroll",
        orient: "vertical",
        right: 8,
        top: 20,
        bottom: 20,
      },

      series: [
        {
          name: activeMetricLabel,
          type: "pie",
          radius: ["35%", "70%"],
          center: ["38%", "50%"],
          avoidLabelOverlap: true,
          selectedMode: "single",
          itemStyle: {
            borderRadius: 4,
            borderColor: "#fff",
            borderWidth: 1,
          },
          label: {
            show: true,
            formatter: "{b}\n{d}%",
          },
          emphasis: {
            label: {
              show: true,
              fontWeight: 600,
            },
          },
          data: pieData,
        },
      ],
    };
  }, [data, activeMetricId, activeMetricLabel, selectedGroup]);

  const onEvents = useMemo(
    () => ({
      click: (params: { name?: string }) => {
        if (typeof params.name === "string") {
          onSelect?.(params.name);
        }
      },
    }),
    [onSelect]
  );

  if (!metricOptions.length) {
    return <Empty description="No metric options available for charting" />;
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Text strong>Metric</Typography.Text>

		<Segmented sizes="small" className="blue-segmented"
		value={activeMetricId}
		onChange={(val) => setActiveMetricId(val as string)}
		options={metricOptions.map((m) => ({
			label: m.label,
			value: m.value,
		}))}
		size="middle"
		/>
      </div>

      {option ? (
        <ReactECharts
          option={option}
          style={{ width: "100%", height }}
          notMerge
          lazyUpdate
          onEvents={onEvents}
        />
      ) : (
        <Empty description="No positive values available for the selected metric" />
      )}
    </Space>
  );
};