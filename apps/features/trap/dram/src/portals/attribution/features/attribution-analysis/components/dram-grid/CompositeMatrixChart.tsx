import React, { useMemo } from "react";
import { Empty, Typography } from "antd";
import { PeriodConfig } from "./types";
import { MultiPeriodAttributionRow } from "./compositeAttributionAdapter";

const { Text } = Typography;

interface CompositeMatrixChartProps {
  title: string;
  subtitle?: string;
  periods: PeriodConfig[];
  rows: MultiPeriodAttributionRow[];
  decimalPlaces?: number;
  height?: number;
}

interface ChartPoint {
  periodId: string;
  label: string;
  value: number;
}

const CHART_WIDTH = 920;
const DEFAULT_HEIGHT = 260;

const MARGIN_TOP = 24;
const MARGIN_BOTTOM = 48;
const MARGIN_LEFT = 56;
const MARGIN_RIGHT = 24;

const findTotalRow = (
  rows: MultiPeriodAttributionRow[],
): MultiPeriodAttributionRow | undefined => {
  return rows.find(
    (r) => r.isTotal || r.label.toLowerCase() === "total",
  );
};

const formatNumber = (value: number, dp: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value);
};

export const CompositeMatrixChart: React.FC<CompositeMatrixChartProps> = ({
  title,
  subtitle,
  periods,
  rows,
  decimalPlaces = 0,
  height = DEFAULT_HEIGHT,
}) => {
  /* ---------------- periods ---------------- */
  const visiblePeriods = useMemo(() => {
    return (periods ?? [])
      .filter((p) => p.visible)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [periods]);

  /* ---------------- total row ---------------- */
  const points = useMemo<ChartPoint[]>(() => {
    if (!rows || rows.length === 0) return [];

    const total = findTotalRow(rows);
    if (!total) return [];

    return visiblePeriods
      .map((p) => {
        const raw = total.values?.[p.id];

        if (typeof raw !== "number" || !Number.isFinite(raw)) {
          return null;
        }

        return {
          periodId: p.id,
          label: p.short_label || p.label,
          value: raw,
        };
      })
      .filter((x): x is ChartPoint => x !== null);
  }, [rows, visiblePeriods]);

  if (points.length === 0) {
    return <Empty description="No chart data available" />;
  }

  /* ---------------- layout ---------------- */
  const innerWidth = CHART_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const innerHeight = height - MARGIN_TOP - MARGIN_BOTTOM;

  const values = points.map((p) => p.value);

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);

  const span = Math.max(max - min, 1); //  prevent divide-by-zero

  const yScale = (val: number): number =>
    MARGIN_TOP + ((max - val) / span) * innerHeight;

  const zeroY = yScale(0);

  const gap = 18;
  const barWidth = Math.max(
    24,
    (innerWidth - gap * Math.max(points.length - 1, 0)) / points.length,
  );

  /* ---------------- render ---------------- */
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Text strong>{title}</Text>
        {subtitle && <Text type="secondary"> — {subtitle}</Text>}
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
      >
        {/* zero line */}
        <line
          x1={MARGIN_LEFT}
          x2={CHART_WIDTH - MARGIN_RIGHT}
          y1={zeroY}
          y2={zeroY}
          stroke="#8c8c8c"
        />

        {/* y axis */}
        <line
          x1={MARGIN_LEFT}
          x2={MARGIN_LEFT}
          y1={MARGIN_TOP}
          y2={height - MARGIN_BOTTOM}
          stroke="#d9d9d9"
        />

        {points.map((p, i) => {
          const x = MARGIN_LEFT + i * (barWidth + gap);
          const y = yScale(p.value);
          const h = Math.abs(y - zeroY);
          const positive = p.value >= 0;

          return (
            <g key={p.periodId}>
              <rect
                x={x}
                y={positive ? y : zeroY}
                width={barWidth}
                height={h}
                fill={positive ? "#1677ff" : "#cf1322"}
                rx={3}
              />

              <text
                x={x + barWidth / 2}
                y={positive ? y - 6 : zeroY + h + 14}
                textAnchor="middle"
                fontSize={11}
              >
                {formatNumber(p.value, decimalPlaces)}
              </text>

              <text
                x={x + barWidth / 2}
                y={height - 20}
                textAnchor="middle"
                fontSize={12}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CompositeMatrixChart;