import { useMemo, type JSX } from "react";
import type { DecimalMode, DecimalSettings } from "../../domain/format";
import { fmtDynamicNumber, fmtDynamicSignedNumber } from "../../domain/format";
import type {
  PortfolioAnalysisContext,
  PortfolioAnalysisTreeRow,
  SecurityAnalytics,
} from "../../types";
import type { PortfolioAnalysisColumnGroupContext } from "./PortfolioAnalysisColumnGroupContext";
import {
  PortfolioAnalysisMiniGrid,
  type PortfolioAnalysisMiniGridColumn,
} from "./PortfolioAnalysisMiniGrid";
import type { PortfolioAnalysisPeriodKey } from "./PortfolioAnalysisPeriodSelector";
import {
  deltaPeriods,
  effectivePeriod,
  valueTMinusValues,
} from "./periodScope";

export type SecurityMode = "value" | "delta";
type MetricRow = {
  metric: string;
  values: Record<string, number | string | null | undefined>;
  places: number;
};

function numberDelta(
  current: number | string | null | undefined,
  prior: number | string | null | undefined,
): number | null {
  const currentNumber = typeof current === "number" ? current : null;
  const priorNumber = typeof prior === "number" ? prior : null;
  return currentNumber == null && priorNumber == null
    ? null
    : (currentNumber ?? 0) - (priorNumber ?? 0);
}
function formatValue(
  value: number | string | null | undefined,
  places: number,
  mode: DecimalMode,
): string {
  return typeof value === "number"
    ? fmtDynamicNumber(value, places, mode)
    : String(value ?? "");
}
function formatDelta(
  value: number | null | undefined,
  places: number,
  mode: DecimalMode,
): string {
  return fmtDynamicSignedNumber(value, places, mode);
}
function tMinusLabel(value: number): string {
  return value === 0 ? "T" : `T-${value}`;
}
function deltaColumnLabel(period: number): string {
  return `${tMinusLabel(period)} vs ${tMinusLabel(period + 1)}`;
}
function buildPositionRows(
  selectedRow: PortfolioAnalysisTreeRow,
  settings: DecimalSettings,
): MetricRow[] {
  const rows: MetricRow[] = [
    { metric: "MV", places: settings.money, values: {} },
    { metric: "MV%", places: settings.pct, values: {} },
    { metric: "PAR", places: settings.qty, values: {} },
    { metric: "Dur Contrib", places: settings.contrib, values: {} },
  ];
  rows.forEach((row) =>
    Object.entries(selectedRow.day).forEach(([key, day]) => {
      if (row.metric === "MV") row.values[key] = day.marketValue;
      if (row.metric === "MV%") row.values[key] = day.exposure;
      if (row.metric === "PAR") row.values[key] = day.par;
      if (row.metric === "Dur Contrib")
        row.values[key] = day.durationContribution;
    }),
  );
  return rows;
}
function buildSecurityRows(
  selectedRow: PortfolioAnalysisTreeRow,
  settings: DecimalSettings,
): MetricRow[] {
  const metrics: Array<{
    metric: string;
    key: keyof SecurityAnalytics;
    places: number;
  }> = [
    { metric: "YTW", key: "yieldToWorst", places: settings.contrib },
    {
      metric: "Spread Duration",
      key: "spreadDuration",
      places: settings.contrib,
    },
    { metric: "Price Source", key: "priceSource", places: 0 },
    { metric: "OAS", key: "oas", places: settings.contrib },
    { metric: "Local Price", key: "localPrice", places: settings.contrib },
    { metric: "Dirty Price", key: "dirtyPrice", places: settings.contrib },
    { metric: "Duration", key: "duration", places: settings.contrib },
    { metric: "Avg Life", key: "averageLife", places: settings.contrib },
    { metric: "KRD 2Y", key: "krd2YrBucket", places: settings.contrib },
    { metric: "KRD 5Y", key: "krd5YrBucket", places: settings.contrib },
    { metric: "KRD 10Y", key: "krd10YrBucket", places: settings.contrib },
    { metric: "KRD 30Y", key: "krd30YrBucket", places: settings.contrib },
  ];
  return metrics.map((metric) => {
    const values: MetricRow["values"] = {};
    Object.entries(selectedRow.diagnostics ?? {}).forEach(
      ([key, diagnostics]) => {
        values[key] = diagnostics.currentSecurity?.[metric.key] as
          | number
          | string
          | null
          | undefined;
        values[String(Number(key) + 1)] ??= diagnostics.priorSecurity?.[
          metric.key
        ] as number | string | null | undefined;
      },
    );
    return { metric: metric.metric, places: metric.places, values };
  });
}
function buildValueColumns(
  values: number[],
  mode: DecimalMode,
): Array<PortfolioAnalysisMiniGridColumn<MetricRow>> {
  return [
    {
      key: "metric",
      label: "Metric",
      align: "left",
      render: (row) => row.metric,
      sortValue: (row) => row.metric,
    },
    ...values.map((value) => ({
      key: `v-${value}`,
      label: tMinusLabel(value),
      render: (row: MetricRow) =>
        formatValue(row.values[String(value)], row.places, mode),
      sortValue: (row: MetricRow) =>
        typeof row.values[String(value)] === "number"
          ? (row.values[String(value)] as number)
          : String(row.values[String(value)] ?? ""),
      toneValue: (row: MetricRow) =>
        typeof row.values[String(value)] === "number"
          ? (row.values[String(value)] as number)
          : null,
    })),
  ];
}
function buildDeltaColumns(
  periods: number[],
  mode: DecimalMode,
): Array<PortfolioAnalysisMiniGridColumn<MetricRow>> {
  return [
    {
      key: "metric",
      label: "Metric",
      align: "left",
      render: (row) => row.metric,
      sortValue: (row) => row.metric,
    },
    ...periods.map((period) => ({
      key: `d-${period}`,
      label: deltaColumnLabel(period),
      render: (row: MetricRow) =>
        formatDelta(
          numberDelta(
            row.values[String(period)],
            row.values[String(period + 1)],
          ),
          row.places,
          mode,
        ),
      sortValue: (row: MetricRow) =>
        Math.abs(
          numberDelta(
            row.values[String(period)],
            row.values[String(period + 1)],
          ) ?? 0,
        ),
      toneValue: (row: MetricRow) =>
        numberDelta(row.values[String(period)], row.values[String(period + 1)]),
    })),
  ];
}

export function PortfolioAnalysisSecurityTab({
  selectedRow,
  context,
  activeTMinus,
  selectedColumnGroup,
  decimalSettings,
  decimalMode,
  securitiesAvailable,
  mode,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  securitiesAvailable: boolean;
  mode: SecurityMode;
}): JSX.Element {
  const scopedPeriod = effectivePeriod(
    context,
    activeTMinus,
    selectedColumnGroup,
  );
  const values = useMemo(
    () => valueTMinusValues(context, scopedPeriod),
    [context, scopedPeriod],
  );
  const deltas = useMemo(
    () => deltaPeriods(context, scopedPeriod),
    [context, scopedPeriod],
  );
  if (selectedRow.nodeType === "root" || selectedRow.nodeType === "bucket")
    return (
      <div className="portfolio-analysis-bottom-empty">
        Select a security row to view security analytics.
      </div>
    );
  const columns =
    mode === "value"
      ? buildValueColumns(values, decimalMode)
      : buildDeltaColumns(deltas, decimalMode);
  return (
    <div className="portfolio-analysis-bottom-tab-content portfolio-analysis-bottom-tab-content-fill">
      <div className="portfolio-analysis-bottom-two-col portfolio-analysis-bottom-two-col-fill">
        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">
            Position Movement
          </div>
          <PortfolioAnalysisMiniGrid
            rows={buildPositionRows(selectedRow, decimalSettings)}
            defaultSortKey="metric"
            columns={columns}
          />
        </section>
        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">
            Security Analytics
          </div>
          {securitiesAvailable ? (
            <PortfolioAnalysisMiniGrid
              rows={buildSecurityRows(selectedRow, decimalSettings)}
              defaultSortKey="metric"
              columns={columns}
            />
          ) : (
            <div className="portfolio-analysis-bottom-empty">
              Security analytics unavailable.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
