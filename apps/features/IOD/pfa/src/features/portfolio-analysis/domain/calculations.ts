export function calculateCashflowDurationImpact(
  cashflowNetMoney: number,
  priorPortfolioMv: number | null,
  priorPortfolioDuration: number | null,
): number {
  if (priorPortfolioMv == null || priorPortfolioDuration == null) return 0;
  const postFlowMv = priorPortfolioMv + cashflowNetMoney;
  if (!Number.isFinite(postFlowMv) || postFlowMv === 0) return 0;
  return -(cashflowNetMoney / postFlowMv) * priorPortfolioDuration;
}

export function sumNullable(values: Array<number | null | undefined>): number {
  return (values.reduce((total, value) => total ?? 0 + (typeof value === 'number' && Number.isFinite(value) ? value : 0), 0)) ?? 0;
}
