import type { JSX } from 'react';
import { chip } from '../../domain/dates';
import type { DecimalMode, DecimalSettings } from '../../domain/format';
import { fmtDynamicSignedNumber } from '../../domain/format';
import type { PortfolioAnalysisContext, PortfolioAnalysisTreeRow } from '../../types';
import { PortfolioAnalysisMiniGrid, type PortfolioAnalysisMiniGridColumn } from './PortfolioAnalysisMiniGrid';
import type { PortfolioAnalysisPeriodKey } from './PortfolioAnalysisPeriodSelector';
import { deltaPeriods } from './periodScope';

export type { PortfolioAnalysisPeriodKey } from './PortfolioAnalysisPeriodSelector';

type PeriodBreakdownRow = {
  key: PortfolioAnalysisPeriodKey;
  label: string;
  durationDelta: number | null;
  trades: number | null;
  cashflows: number | null;
  drift: number | null;
  marketValueDelta: number | null;
  parDelta: number | null;
};

function valueOf(
  row: PortfolioAnalysisTreeRow,
  key: PortfolioAnalysisPeriodKey,
  metric: keyof PortfolioAnalysisTreeRow['total'],
): number | null {
  return key === "total"
  ? (row.total[metric] ?? null)
  : (row.day[key]?.[metric] ?? null);
}

function fmt(value: number | null | undefined, places: number, mode: DecimalMode): string {
  return fmtDynamicSignedNumber(value, places, mode);
}

export function PortfolioAnalysisPeriodBreakdownGrid({
  selectedRow,
  context,
  activeTMinus,
  onActiveTMinusChange,
  decimalSettings,
  decimalMode,
  showCashflows,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  showCashflows: boolean;
}): JSX.Element {
  const dayRows: PeriodBreakdownRow[] = deltaPeriods(context, activeTMinus).map((tMinus) => ({
    key: tMinus,
    label: `${chip(tMinus)} vs ${chip(tMinus + 1)}`,
    durationDelta: valueOf(selectedRow, tMinus, 'durationDelta'),
    trades: valueOf(selectedRow, tMinus, 'trades'),
    cashflows: valueOf(selectedRow, tMinus, 'cashflows'),
    drift: valueOf(selectedRow, tMinus, 'drift'),
    marketValueDelta: valueOf(selectedRow, tMinus, 'marketValueDelta'),
    parDelta: valueOf(selectedRow, tMinus, 'parDelta'),
  }));

  const rows: PeriodBreakdownRow[] = [
    {
      key: 'total',
      label: `T vs ${chip(context.comparisonTMinus)}`,
      durationDelta: valueOf(selectedRow, 'total', 'durationDelta'),
      trades: valueOf(selectedRow, 'total', 'trades'),
      cashflows: valueOf(selectedRow, 'total', 'cashflows'),
      drift: valueOf(selectedRow, 'total', 'drift'),
      marketValueDelta: valueOf(selectedRow, 'total', 'marketValueDelta'),
      parDelta: valueOf(selectedRow, 'total', 'parDelta'),
    },
    ...dayRows,
  ];

  const columns: Array<PortfolioAnalysisMiniGridColumn<PeriodBreakdownRow>> = [
    {
      key: 'period',
      label: 'Period',
      align: 'left',
      render: (row) => row.label,
      sortValue: (row) => (row.key === 'total' ? -1 : row.key),
    },
    {
      key: 'durationDelta',
      label: 'Δ Dur',
      render: (row) => fmt(row.durationDelta, decimalSettings.contrib, decimalMode),
      sortValue: (row) => Math.abs(row.durationDelta ?? 0),
      toneValue: (row) => row.durationDelta,
    },
    {
      key: 'trades',
      label: 'Trades',
      render: (row) => fmt(row.trades, decimalSettings.contrib, decimalMode),
      sortValue: (row) => Math.abs(row.trades ?? 0),
      toneValue: (row) => row.trades,
    },
    ...(showCashflows
      ? [
          {
            key: 'cashflows',
            label: 'Cashflows',
            render: (row: PeriodBreakdownRow) => fmt(row.cashflows, decimalSettings.contrib, decimalMode),
            sortValue: (row: PeriodBreakdownRow) => Math.abs(row.cashflows ?? 0),
            toneValue: (row: PeriodBreakdownRow) => row.cashflows,
          },
        ]
      : []),
    {
      key: 'drift',
      label: 'Drift',
      render: (row) => fmt(row.drift, decimalSettings.contrib, decimalMode),
      sortValue: (row) => Math.abs(row.drift ?? 0),
      toneValue: (row) => row.drift,
    },
    {
      key: 'marketValueDelta',
      label: 'Δ MV',
      render: (row) => fmt(row.marketValueDelta, decimalSettings.money, decimalMode),
      sortValue: (row) => Math.abs(row.marketValueDelta ?? 0),
      toneValue: (row) => row.marketValueDelta,
    },
    {
      key: 'parDelta',
      label: 'Δ PAR',
      render: (row) => fmt(row.parDelta, decimalSettings.qty, decimalMode),
      sortValue: (row) => Math.abs(row.parDelta ?? 0),
      toneValue: (row) => row.parDelta,
    },
  ];

  return (
    <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
      <div className="portfolio-analysis-bottom-section-title">Breakdown</div>
      <PortfolioAnalysisMiniGrid
        rows={rows}
        columns={columns}
        onRowClick={(row) => onActiveTMinusChange(row.key)}
        rowClassName={(row) => (row.key === activeTMinus ? 'portfolio-analysis-bottom-row-active' : '')}
      />
    </section>
  );
}
