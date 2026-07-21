import { useMemo, useState, type JSX } from 'react';
import type { DecimalMode, DecimalSettings } from '../../domain/format';
import { fmtDynamicNumber, fmtDynamicSignedNumber } from '../../domain/format';
import type { PortfolioAnalysisContext, PortfolioAnalysisTreeRow, SecurityAnalytics } from '../../types';
import { PortfolioAnalysisMiniGrid, type PortfolioAnalysisMiniGridColumn } from './PortfolioAnalysisMiniGrid';
import type { PortfolioAnalysisPeriodKey } from './PortfolioAnalysisPeriodSelector';
import type { PortfolioAnalysisColumnGroupContext } from './PortfolioAnalysisColumnGroupContext';
import { deltaLabel, deltaPeriods, effectivePeriod, periodLabel, valueTMinusValues } from './periodScope';

type SecurityMode = 'value' | 'delta';

type MetricRow = {
  metric: string;
  values: Record<string, number | string | null | undefined>;
  places: number;
};

function numberDelta(current: number | string | null | undefined, prior: number | string | null | undefined): number | null {
  const currentNumber = typeof current === 'number' ? current : null;
  const priorNumber = typeof prior === 'number' ? prior : null;

  return currentNumber == null && priorNumber == null ? null : (currentNumber ?? 0) - (priorNumber ?? 0);
}

function formatValue(value: number | string | null | undefined, places: number, mode: DecimalMode): string {
  return typeof value === 'number' ? fmtDynamicNumber(value, places, mode) : String(value ?? '');
}

function formatDelta(value: number | null | undefined, places: number, mode: DecimalMode): string {
  return fmtDynamicSignedNumber(value, places, mode);
}

function buildPositionRows(selectedRow: PortfolioAnalysisTreeRow, decimalSettings: DecimalSettings): MetricRow[] {
  const rows: MetricRow[] = [
    { metric: 'MV', places: decimalSettings.money, values: {} },
    { metric: 'MV%', places: decimalSettings.pct, values: {} },
    { metric: 'PAR', places: decimalSettings.qty, values: {} },
    { metric: 'Dur Contrib', places: decimalSettings.contrib, values: {} },
  ];

  rows.forEach((row) => {
    Object.entries(selectedRow.day).forEach(([key, day]) => {
      if (row.metric === 'MV') row.values[key] = day.marketValue;
      if (row.metric === 'MV%') row.values[key] = day.exposure;
      if (row.metric === 'PAR') row.values[key] = day.par;
      if (row.metric === 'Dur Contrib') row.values[key] = day.durationContribution;
    });
  });

  return rows;
}

function buildSecurityRows(selectedRow: PortfolioAnalysisTreeRow, decimalSettings: DecimalSettings): MetricRow[] {
  const metrics: Array<{ metric: string; key: keyof SecurityAnalytics; places: number }> = [
    { metric: 'YTW', key: 'yieldToWorst', places: decimalSettings.contrib },
    { metric: 'Spread Duration', key: 'spreadDuration', places: decimalSettings.contrib },
    { metric: 'Price Source', key: 'priceSource', places: 0 },
    { metric: 'OAS', key: 'oas', places: decimalSettings.contrib },
    { metric: 'Local Price', key: 'localPrice', places: decimalSettings.contrib },
    { metric: 'Dirty Price', key: 'dirtyPrice', places: decimalSettings.contrib },
    { metric: 'Duration', key: 'duration', places: decimalSettings.contrib },
    { metric: 'Avg Life', key: 'averageLife', places: decimalSettings.contrib },
    { metric: 'KRD 2Y', key: 'krd2YrBucket', places: decimalSettings.contrib },
    { metric: 'KRD 5Y', key: 'krd5YrBucket', places: decimalSettings.contrib },
    { metric: 'KRD 10Y', key: 'krd10YrBucket', places: decimalSettings.contrib },
    { metric: 'KRD 30Y', key: 'krd30YrBucket', places: decimalSettings.contrib },
  ];

  return metrics.map((metric) => {
    const values: Record<string, number | string | null | undefined> = {};

    Object.entries(selectedRow.diagnostics ?? {}).forEach(([key, diagnostics]) => {
      values[key] = diagnostics.currentSecurity?.[metric.key] as number | string | null | undefined;
      values[String(Number(key) + 1)] ??= diagnostics.priorSecurity?.[metric.key] as number | string | null | undefined;
    });

    return { metric: metric.metric, places: metric.places, values };
  });
}

function buildValueColumns(
  context: PortfolioAnalysisContext,
  tMinusValues: number[],
  decimalMode: DecimalMode,
): Array<PortfolioAnalysisMiniGridColumn<MetricRow>> {
  return [
    { key: 'metric', label: 'Metric', align: 'left', render: (row) => row.metric, sortValue: (row) => row.metric },
    ...tMinusValues.map(
      (tMinus): PortfolioAnalysisMiniGridColumn<MetricRow> => ({
        key: `v-${tMinus}`,
        label: periodLabel(context, tMinus),
        render: (row) => formatValue(row.values[String(tMinus)], row.places, decimalMode),
        sortValue: (row) => {
          const value = row.values[String(tMinus)];
          return typeof value === 'number' ? value : String(value ?? '');
        },
        toneValue: (row) => {
          const value = row.values[String(tMinus)];
          return typeof value === 'number' ? value : null;
        },
      }),
    ),
  ];
}

function buildDeltaColumns(
  context: PortfolioAnalysisContext,
  periods: number[],
  decimalMode: DecimalMode,
): Array<PortfolioAnalysisMiniGridColumn<MetricRow>> {
  return [
    { key: 'metric', label: 'Metric', align: 'left', render: (row) => row.metric, sortValue: (row) => row.metric },
    ...periods.map(
      (period): PortfolioAnalysisMiniGridColumn<MetricRow> => ({
        key: `d-${period}`,
        label: deltaLabel(context, period),
        render: (row) => formatDelta(numberDelta(row.values[String(period)], row.values[String(period + 1)]), row.places, decimalMode),
        sortValue: (row) => Math.abs(numberDelta(row.values[String(period)], row.values[String(period + 1)]) ?? 0),
        toneValue: (row) => numberDelta(row.values[String(period)], row.values[String(period + 1)]),
      }),
    ),
  ];
}

function ModeToggle({ mode, onModeChange }: { mode: SecurityMode; onModeChange: (mode: SecurityMode) => void }): JSX.Element {
  return (
    <div className="portfolio-analysis-bottom-mode-toggle" role="tablist" aria-label="Security tab mode">
      <button type="button" data-active={mode === 'value'} onClick={() => onModeChange('value')}>
        Value
      </button>
      <button type="button" data-active={mode === 'delta'} onClick={() => onModeChange('delta')}>
        Delta
      </button>
    </div>
  );
}

export function PortfolioAnalysisSecurityTab({
  selectedRow,
  context,
  activeTMinus,
  selectedColumnGroup,
  decimalSettings,
  decimalMode,
  securitiesAvailable,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  securitiesAvailable: boolean;
}): JSX.Element {
  const [mode, setMode] = useState<SecurityMode>('value');
  const scopedPeriod = effectivePeriod(context, activeTMinus, selectedColumnGroup);
  const tMinusValues = useMemo(() => valueTMinusValues(context, scopedPeriod), [context, scopedPeriod]);
  const periodDeltas = useMemo(() => deltaPeriods(context, scopedPeriod), [context, scopedPeriod]);

  if (selectedRow.nodeType === 'root' || selectedRow.nodeType === 'bucket') {
    return <div className="portfolio-analysis-bottom-empty">Select a security row to view security analytics.</div>;
  }

  const columns =
    mode === 'value'
      ? buildValueColumns(context, tMinusValues, decimalMode)
      : buildDeltaColumns(context, periodDeltas, decimalMode);

  return (
    <div className="portfolio-analysis-bottom-tab-content portfolio-analysis-bottom-tab-content-fill">
      <ModeToggle mode={mode} onModeChange={setMode} />
      <div className="portfolio-analysis-bottom-two-col portfolio-analysis-bottom-two-col-fill">
        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">Position Movement</div>
          <PortfolioAnalysisMiniGrid rows={buildPositionRows(selectedRow, decimalSettings)} defaultSortKey="metric" columns={columns} />
        </section>
        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">Security Analytics</div>
          {!securitiesAvailable ? (
            <div className="portfolio-analysis-bottom-empty">Security analytics unavailable.</div>
          ) : (
            <PortfolioAnalysisMiniGrid rows={buildSecurityRows(selectedRow, decimalSettings)} defaultSortKey="metric" columns={columns} />
          )}
        </section>
      </div>
    </div>
  );
}
