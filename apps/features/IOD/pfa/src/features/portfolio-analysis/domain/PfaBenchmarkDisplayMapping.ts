import type { HoldingState } from '../types';

export const PORTFOLIO_CURRENT_T_MINUS = 0;
export const BENCHMARK_CURRENT_T_MINUS = 1;

export function benchmarkTMinusForDisplay(displayTMinus: number): number {
  return displayTMinus === PORTFOLIO_CURRENT_T_MINUS
    ? BENCHMARK_CURRENT_T_MINUS
    : displayTMinus;
}

export function currentHoldingState(
  hasPortfolioAtT: boolean,
  hasBenchmarkAtTMinus1: boolean,
): HoldingState {
  if (hasPortfolioAtT && hasBenchmarkAtTMinus1) return 'both';
  if (hasPortfolioAtT) return 'portfolio-only';
  if (hasBenchmarkAtTMinus1) return 'benchmark-only';
  return 'historical-only';
}
