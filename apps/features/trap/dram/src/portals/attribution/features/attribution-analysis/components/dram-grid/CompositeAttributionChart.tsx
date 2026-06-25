import React, { useMemo } from "react";
import { Empty, Typography } from "antd";
import { CompositeAttributionViewData, MultiPeriodAttributionRow } from "./compositeAttributionAdapter";


const { Text } = Typography;

interface CompositeAttributionChartProps {
  data: CompositeAttributionViewData;
  decimalPlaces?: number;
  height?: number;
}

interface ChartPoint {
  periodId: string;
  label: string;
  value: number;
}

const CHART_WIDTH = 920;
const DEFAULT_HEIGHT = 280;
const MARGIN_TOP = 24;
const MARGIN_RIGHT = 24;
const MARGIN_BOTTOM = 48;
const MARGIN_LEFT = 56;

const findTotalRow = (
  rows: MultiPeriodAttributionRow[],
): MultiPeriodAttributionRow | undefined => {
  for (const row of rows) {
    if (row.label.toLowerCase() === "total") {
      return row;
    }

    if (row.children) {
      const childMatch = findTotalRow(row.children);

      if (childMatch) {
        return childMatch;
      }
    }
  }

  return undefined;
};

const collectLeafRows = (
  rows: MultiPeriodAttributionRow[],
): MultiPeriodAttributionRow[] => {
  return rows.flatMap((row) => {
    if (row.children && row.children.length > 0) {
      return collectLeafRows(row.children);
    }

    return [row];
  });
};

const buildFallbackTotalValues = (
  rows: MultiPeriodAttributionRow[],
  periodIds: string[],
): Record<string, number | null> => {
  const leafRows = collectLeafRows(rows).filter(
    (row) => row.label.toLowerCase() !== "total",
  );

  return Object.fromEntries(
    periodIds.map((periodId) => {
      const values = leafRows
        .map((row) => row.values[periodId])
        .filter((value): value is number => typeof value === "number");

      if (values.length === 0) {
        return [periodId, null];
      }

      return [
        periodId,
        values.reduce((sum, value) => sum + value, 0),
      ];
    }),
  );
};

const formatNumber = (value: number, decimalPlaces: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

const getNiceDomain = (values: number[]): { min: number; max: number } => {
  if (values.length === 0) {
    return { min: -1, max: 1 };
  }

  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const padding = Math.max((maxValue - minValue) * 0.15, 1);

  return {
    min: Math.floor(minValue - padding),
    max: Math.ceil(maxValue + padding),
  };
};

const CompositeAttributionChart: React.FC<CompositeAttributionChartProps> = ({
  data,
  decimalPlaces = 0,
  height = DEFAULT_HEIGHT,
}) => {
  const visiblePeriods = useMemo(() => {
    return data.periods
      .filter((period) => period.visible)
      .sort((left, right) => left.sort_order - right.sort_order);
  }, [data.periods]);

  const points = useMemo<ChartPoint[]>(() => {
    const periodIds = visiblePeriods.map((period) => period.id);
    const totalRow = findTotalRow(data.attributionRows);

    const values =
      totalRow?.values ??
      buildFallbackTotalValues(data.attributionRows, periodIds);

    return visiblePeriods
      .map((period) => {
        const value = values[period.id];

        if (typeof value !== "number" || !Number.isFinite(value)) {
          return null;
        }

        return {
          periodId: period.id,
          label: period.short_label || period.label,
          value,
        };
      })
      .filter((point): point is ChartPoint => point !== null);
  }, [data.attributionRows, visiblePeriods]);

  if (points.length === 0) {
    return <Empty description="No composite chart data available." />;
  }

  const chartHeight = height;
  const innerWidth = CHART_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const innerHeight = chartHeight - MARGIN_TOP - MARGIN_BOTTOM;

  const values = points.map((point) => point.value);
  const domain = getNiceDomain(values);
  const domainSpan = domain.max - domain.min;

  const zeroY =
    MARGIN_TOP + ((domain.max - 0) / domainSpan) * innerHeight;

  const barGap = 18;
  const barWidth = Math.max(
    24,
    (innerWidth - barGap * Math.max(points.length - 1, 0)) / points.length,
  );

  const scaleY = (value: number): number => {
    return MARGIN_TOP + ((domain.max - value) / domainSpan) * innerHeight;
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Text strong>Composite Attribution Total</Text>
        <Text type="secondary"> — bps by period</Text>
      </div>

      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${CHART_WIDTH} ${chartHeight}`}
        role="img"
        aria-label="Composite attribution chart"
      >
        <line
          x1={MARGIN_LEFT}
          x2={CHART_WIDTH - MARGIN_RIGHT}
          y1={zeroY}
          y2={zeroY}
          stroke="#8c8c8c"
          strokeWidth={1}
        />

        <line
          x1={MARGIN_LEFT}
          x2={MARGIN_LEFT}
          y1={MARGIN_TOP}
          y2={chartHeight - MARGIN_BOTTOM}
          stroke="#d9d9d9"
          strokeWidth={1}
        />

        <text
          x={MARGIN_LEFT - 10}
          y={MARGIN_TOP + 4}
          textAnchor="end"
          fontSize={11}
          fill="#595959"
        >
          {formatNumber(domain.max, decimalPlaces)}
        </text>

        <text
          x={MARGIN_LEFT - 10}
          y={zeroY + 4}
          textAnchor="end"
          fontSize={11}
          fill="#595959"
        >
          0
        </text>

        <text
          x={MARGIN_LEFT - 10}
          y={chartHeight - MARGIN_BOTTOM}
          textAnchor="end"
          fontSize={11}
          fill="#595959"
        >
          {formatNumber(domain.min, decimalPlaces)}
        </text>

        {points.map((point, index) => {
          const x = MARGIN_LEFT + index * (barWidth + barGap);
          const valueY = scaleY(point.value);
          const barHeight = Math.abs(valueY - zeroY);
          const isPositive = point.value >= 0;

          return (
            <g key={point.periodId}>
              <rect
                x={x}
                y={isPositive ? valueY : zeroY}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill={isPositive ? "#1677ff" : "#cf1322"}
              />

              <text
                x={x + barWidth / 2}
                y={isPositive ? valueY - 6 : zeroY + barHeight + 14}
                textAnchor="middle"
                fontSize={11}
                fill="#262626"
              >
                {formatNumber(point.value, decimalPlaces)}
              </text>

              <text
                x={x + barWidth / 2}
                y={chartHeight - 20}
                textAnchor="middle"
                fontSize={12}
                fill="#262626"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        <text
          x={16}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#595959"
          transform={`rotate(-90 16 ${chartHeight / 2})`}
        >
          bps
        </text>
      </svg>
    </div>
  );
};

export default CompositeAttributionChart;