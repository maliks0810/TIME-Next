import type { JSX } from 'react';
import { chip, includedEventTMinus } from '../../domain/dates';
import type { PortfolioAnalysisContext } from '../../types';

export type PortfolioAnalysisPeriodKey = number | 'total';

type PeriodOption = {
  key: PortfolioAnalysisPeriodKey;
  label: string;
  priorLabel: string;
  currentLabel: string;
};

function buildPeriodOptions(context: PortfolioAnalysisContext): PeriodOption[] {
  const dayOptions = [...includedEventTMinus(context.comparisonTMinus)].sort((a, b) => a - b).map((tMinus) => ({
    key: tMinus,
    label: `${chip(tMinus)} / ${chip(tMinus + 1)}`,
    currentLabel: context.dateLabels[tMinus] ?? chip(tMinus),
    priorLabel: context.dateLabels[tMinus + 1] ?? chip(tMinus + 1),
  }));

  return [
    {
      key: 'total',
      label: `T / ${chip(context.comparisonTMinus)}`,
      currentLabel: context.dateLabels[0] ?? chip(0),
      priorLabel: context.dateLabels[context.comparisonTMinus] ?? chip(context.comparisonTMinus),
    },
    ...dayOptions,
  ];
}

export function periodCaption(context: PortfolioAnalysisContext, period: PortfolioAnalysisPeriodKey): string {
  if (period === 'total') return `T vs ${chip(context.comparisonTMinus)}`;
  return `${chip(period)} vs ${chip(period + 1)}`;
}

export function PortfolioAnalysisPeriodSelector({
  context,
  activeTMinus,
  onActiveTMinusChange,
}: {
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
}): JSX.Element {
  const options = buildPeriodOptions(context);
  const selected = options.find((option) => option.key === activeTMinus) ?? options[0];

  return (
    <div className="portfolio-analysis-period-selector">
      <div className="portfolio-analysis-period-selector-label">Period</div>
      <div className="portfolio-analysis-period-selector-buttons" role="tablist" aria-label="Comparison period">
        {options.map((option) => (
          <button
            key={String(option.key)}
            type="button"
            className="portfolio-analysis-period-selector-button"
            data-active={option.key === activeTMinus}
            aria-pressed={option.key === activeTMinus}
            onClick={() => onActiveTMinusChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="portfolio-analysis-period-selector-reference">
        <span>Prior</span>
        <strong>{selected.priorLabel}</strong>
        <span>Current</span>
        <strong>{selected.currentLabel}</strong>
      </div>
    </div>
  );
}
