import React, { useMemo } from "react";
import { Empty, Typography } from "antd";
import { CompositeAttributionViewData } from "./compositeAttributionAdapter";
import { getCompositePeriodLabel } from "./periodUtils";

const { Text } = Typography;

interface CompositeSummaryChartProps {
  data: CompositeAttributionViewData;
  decimalPlaces?: number;
}

const CompositeSummaryChart: React.FC<CompositeSummaryChartProps> = ({
  data,
  decimalPlaces = 2,
}) => {
  const visiblePeriods = useMemo(
    () =>
      data.periods
        .filter((period) => period.visible)
        .sort((left, right) => left.sort_order - right.sort_order),
    [data.periods],
  );

  if (data.summaryRows.length === 0 || visiblePeriods.length === 0) {
    return <Empty description="No summary chart data available." />;
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Text strong>Performance Summary</Text>
        <Text type="secondary"> — return by period</Text>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `180px repeat(${visiblePeriods.length}, 1fr)`,
          gap: 8,
          alignItems: "end",
        }}
      >
        <div />

        {visiblePeriods.map((period) => (
          <Text key={period.id} strong style={{ textAlign: "center" }}>
            {getCompositePeriodLabel(period)}
          </Text>
        ))}

        {data.summaryRows.map((row) => (
          <React.Fragment key={row.key}>
            <Text strong={row.emphasis}>{row.label}</Text>

            {visiblePeriods.map((period) => {
              const value: number | null = row.values[period.id] ?? null;

              return (
                <div
                  key={period.id}
                  style={{
                    textAlign: "center",
                    padding: "6px 8px",
                    borderRadius: 4,
                    background: row.shaded ? "#f0eeee" : "#f5f8ff",
                  }}
                >
                  {value !== null && Number.isFinite(value)
                    ? `${new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: decimalPlaces,
                        maximumFractionDigits: decimalPlaces,
                      }).format(value * 100)}%`
                    : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CompositeSummaryChart;