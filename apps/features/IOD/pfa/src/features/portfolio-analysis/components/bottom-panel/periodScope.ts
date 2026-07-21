import { chip, includedEventTMinus } from '../../domain/dates';
import type { PortfolioAnalysisContext } from '../../types';
import type { PortfolioAnalysisColumnGroupContext } from './PortfolioAnalysisColumnGroupContext';
import type { PortfolioAnalysisPeriodKey } from './PortfolioAnalysisPeriodSelector';

export function selectedScopePeriod(
  activeTMinus: PortfolioAnalysisPeriodKey,
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null,
): PortfolioAnalysisPeriodKey {
  return selectedColumnGroup?.period ?? activeTMinus;
}

export function normalizePeriod(
  context: PortfolioAnalysisContext,
  period: PortfolioAnalysisPeriodKey,
): PortfolioAnalysisPeriodKey {
  if (period === 'total') return 'total';
  if (typeof period === 'number' && period >= 0 && period < context.comparisonTMinus) return period;
  return 'total';
}

export function scopePeriod(
  context: PortfolioAnalysisContext,
  activeTMinus: PortfolioAnalysisPeriodKey,
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null,
): PortfolioAnalysisPeriodKey {
  return normalizePeriod(context, selectedScopePeriod(activeTMinus, selectedColumnGroup));
}

// Backward-compatible alias for files that still import `effectivePeriod`.
// Keep this until all callers are migrated to `scopePeriod`.
export function effectivePeriod(
  context: PortfolioAnalysisContext,
  activeTMinus: PortfolioAnalysisPeriodKey,
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null,
): PortfolioAnalysisPeriodKey {
  return scopePeriod(context, activeTMinus, selectedColumnGroup);
}

export function valueTMinusValues(context: PortfolioAnalysisContext, period: PortfolioAnalysisPeriodKey): number[] {
  if (period === 'total') {
    return Array.from({ length: context.comparisonTMinus + 1 }, (_, index) => index);
  }

  return [period, period + 1].filter((value) => value >= 0 && value <= context.comparisonTMinus);
}

export function deltaPeriods(context: PortfolioAnalysisContext, period: PortfolioAnalysisPeriodKey): number[] {
  if (period === 'total') return [...includedEventTMinus(context.comparisonTMinus)].sort((a, b) => a - b);
  return [period];
}

export function eventPeriods(context: PortfolioAnalysisContext, period: PortfolioAnalysisPeriodKey): number[] {
  if (period === 'total') return Array.from({ length: context.comparisonTMinus }, (_, index) => index);
  if (typeof period === 'number' && period >= 0 && period < context.comparisonTMinus) return [period];
  return [];
}

export function initialActivePeriodForScope(
  context: PortfolioAnalysisContext,
  period: PortfolioAnalysisPeriodKey,
): PortfolioAnalysisPeriodKey {
  if (period === 'total') return 'total';
  if (typeof period === 'number' && period >= 0 && period < context.comparisonTMinus) return period;
  return 'total';
}

export function periodLabel(context: PortfolioAnalysisContext, tMinus: number): string {
  return context.dateLabels[tMinus] ?? chip(tMinus);
}

export function deltaLabel(context: PortfolioAnalysisContext, tMinus: number): string {
  return `${periodLabel(context, tMinus)} vs ${periodLabel(context, tMinus + 1)}`;
}
