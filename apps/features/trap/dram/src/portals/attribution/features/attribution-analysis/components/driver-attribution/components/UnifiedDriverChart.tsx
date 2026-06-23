import React from "react";
import { Card } from "antd";
import type { DriverRow } from "../types/unifiedDriverAttribution";

interface UnifiedDriverChartProps {
  drivers: DriverRow[];
  selectedDriverRowKey?: string;
  onDriverClick: (driver: DriverRow) => void;
}

export function UnifiedDriverChart({ drivers, selectedDriverRowKey, onDriverClick }: UnifiedDriverChartProps): React.ReactElement {
  const chartDrivers = drivers.slice(0, 20);
  const width = 960;
  const barHeight = 22;
  const gap = 8;
  const height = Math.max(120, chartDrivers.length * (barHeight + gap) + 40);
  const maxAbs = Math.max(...chartDrivers.map((driver) => Math.abs(driver.scoreBps)), 1);
  const center = width / 2;

  return (
    <Card size="small" title="Driver Chart">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height }} role="img" aria-label="Top and bottom drivers chart">
        <line x1={center} x2={center} y1={20} y2={height - 20} stroke="#8c8c8c" />
        {chartDrivers.map((driver, index) => {
          const y = 24 + index * (barHeight + gap);
          const barWidth = Math.abs(driver.scoreBps) / maxAbs * (center - 180);
          const positive = driver.scoreBps >= 0;
          const x = positive ? center : center - barWidth;
          const selected = driver.rowKey === selectedDriverRowKey;
          return (
            <g key={driver.rowKey} onClick={() => onDriverClick(driver)} style={{ cursor: "pointer" }}>
              <text x={positive ? center - 8 : center + 8} y={y + 15} textAnchor={positive ? "end" : "start"} fontSize="12" fill="#595959">{driver.periodId} {driver.groupLabel}</text>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={positive ? "#2f54eb" : "#cf1322"} opacity={selected ? 1 : 0.82} rx={3} />
              <text x={positive ? x + barWidth + 6 : x - 6} y={y + 15} textAnchor={positive ? "start" : "end"} fontSize="12" fill="#262626">{driver.scoreBps.toFixed(2)} bps</text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}
