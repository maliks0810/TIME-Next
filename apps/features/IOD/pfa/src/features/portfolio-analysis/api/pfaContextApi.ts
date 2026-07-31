import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chip } from '../domain/dates';
import type { MonitorV2Cashflow, MonitorV2Trade, PortfolioAnalysisContext, Snapshot } from '../types';
import { apiUrl, fetchPfaJson } from './pfaFetch';

type AnyRecord = Record<string, unknown>;

export type PfaPortfolio = {
  portfolioKey?: string | null;
  PortfolioKey?: string | null;
  portfolioName?: string | null;
  PortfolioName?: string | null;
  portfolioGroup?: string | null;
  PortfolioGroup?: string | null;
  parentCode?: string | null;
  ParentCode?: string | null;
  rhsGroup?: string | null;
  RhsGroup?: string | null;
  rhsGroupCode?: string | null;
  RhsGroupCode?: string | null;
  benchmarkCode?: string | null;
  BenchmarkCode?: string | null;
  legacyPortfolioBenchmarkCode?: string | null;
  LegacyPortfolioBenchmarkCode?: string | null;
  futureEligible?: boolean | string | null;
  FutureEligible?: boolean | string | null;
  [key: string]: unknown;
};

export type PfaPortfolioAnalytics = {
  asOfDate?: string | null;
  AsOfDate?: string | null;
  tMinus?: number | null;
  TMinus?: number | null;
  portfolioKey?: string | null;
  PortfolioKey?: string | null;
  portfolioNumber?: string | null;
  PortfolioNumber?: string | null;
  legacyPortfolioNumber?: string | null;
  LegacyPortfolioNumber?: string | null;
  mv?: number | null;
  Mv?: number | null;
  level1Cash?: number | null;
  Level1Cash?: number | null;
  level1CashPct?: number | null;
  Level1CashPct?: number | null;
  duration?: number | null;
  Duration?: number | null;
  krd2YrBucket?: number | null;
  Krd2YrBucket?: number | null;
  krd5YrBucket?: number | null;
  Krd5YrBucket?: number | null;
  krd10YrBucket?: number | null;
  Krd10YrBucket?: number | null;
  krd30YrBucket?: number | null;
  Krd30YrBucket?: number | null;
  oas?: number | null;
  Oas?: number | null;
  spreadDuration?: number | null;
  SpreadDuration?: number | null;
  avgLife?: number | null;
  AvgLife?: number | null;
  yieldToWorst?: number | null;
  YieldToWorst?: number | null;
  [key: string]: unknown;
};

const PORTFOLIO_KEY_FIELDS = [
  'portfolioKey',
  'PortfolioKey',
  'portfolio_key',
  'PORTFOLIO_KEY',
  'portfolioNumber',
  'PortfolioNumber',
  'portfolio_number',
  'PORTFOLIO_NUMBER',
  'legacyPortfolioNumber',
  'LegacyPortfolioNumber',
  'legacy_portfolio_number',
  'LEGACY_PORTFOLIO_NUMBER',
] as const;

function readString(source: unknown, names: readonly string[], fallback = ''): string {
  const record = source as AnyRecord;
  for (const name of names) {
    const value = record[name];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return fallback;
}

function readNumber(source: unknown, names: readonly string[]): number | null {
  const record = source as AnyRecord;
  for (const name of names) {
    const value = record[name];
    if (value === undefined || value === null || value === '') continue;
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function normalizePortfolioKey(value: string | null | undefined): string {
  return String(value ?? '').trim().toUpperCase();
}

function portfolioKeyCandidates(value: string | null | undefined): string[] {
  const normalized = normalizePortfolioKey(value);
  if (!normalized) return [];
  const withoutT = normalized.endsWith('T') ? normalized.slice(0, -1) : normalized;
  const withT = normalized.endsWith('T') ? normalized : `${normalized}T`;
  return Array.from(new Set([normalized, withoutT, withT]));
}

export function portfolioMatches(rowPortfolioKey: string | null | undefined, selectedPortfolioKey: string): boolean {
  const rowCandidates = portfolioKeyCandidates(rowPortfolioKey);
  const selectedCandidates = portfolioKeyCandidates(selectedPortfolioKey);
  return rowCandidates.some((candidate) => selectedCandidates.includes(candidate));
}

export function filterByPortfolio<T>(rows: T[], portfolioKey: string | null): T[] {
  if (!portfolioKey) return rows;
  return rows.filter((row) => portfolioMatches(readString(row, PORTFOLIO_KEY_FIELDS), portfolioKey));
}

export function getPortfolioKey(portfolio: PfaPortfolio): string {
  return readString(portfolio, PORTFOLIO_KEY_FIELDS);
}

export function getPortfolioName(portfolio: PfaPortfolio): string {
  return readString(portfolio, ['portfolioName', 'PortfolioName', 'portfolio_name', 'PORTFOLIO_NAME']);
}

export function getPortfolioGroup(portfolio: PfaPortfolio): string {
  return readString(portfolio, ['portfolioGroup', 'PortfolioGroup', 'portfolio_group', 'PORTFOLIO_GROUP', 'parentCode', 'ParentCode', 'parent_code', 'PARENT_CODE']);
}

export function getPortfolioBenchmark(portfolio: PfaPortfolio): string {
  return readString(portfolio, [
    'benchmarkCode',
    'BenchmarkCode',
    'benchmark_code',
    'BENCHMARK_CODE',
    'legacyPortfolioBenchmarkCode',
    'LegacyPortfolioBenchmarkCode',
    'legacy_portfolio_benchmark_code',
    'LEGACY_PORTFOLIO_BENCHMARK_CODE',
  ]);
}

export function getPortfolioLegacyBenchmarkCode(portfolio: PfaPortfolio): string {
  return readString(portfolio, [
    'legacyPortfolioBenchmarkCode',
    'LegacyPortfolioBenchmarkCode',
    'legacy_portfolio_benchmark_code',
    'LEGACY_PORTFOLIO_BENCHMARK_CODE',
  ]);
}

export function getRhsGroup(portfolio: PfaPortfolio): string {
  return readString(portfolio, ['rhsGroup', 'RhsGroup', 'rhs_group', 'RHS_GROUP', 'rhsGroupCode', 'RhsGroupCode', 'rhs_group_code', 'RHS_GROUP_CODE']);
}

function getFutureEligible(portfolio: PfaPortfolio): boolean | null {
  const record = portfolio as AnyRecord;
  const value = record.futureEligible ?? record.FutureEligible ?? record.future_eligible ?? record.FUTURE_ELIGIBLE;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (normalized === 'Y' || normalized === 'YES' || normalized === 'TRUE') return true;
    if (normalized === 'N' || normalized === 'NO' || normalized === 'FALSE') return false;
  }
  return null;
}

function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return normalized.slice(0, 10);
}

function buildSnapshots(analytics: PfaPortfolioAnalytics[], comparisonTMinus: number): {
  snapshots: Record<number, Snapshot>;
  dateLabels: Record<number, string>;
} {
  const rows = [...analytics]
    .filter((row) => dateOnly(readString(row, ['asOfDate', 'AsOfDate', 'as_of_date', 'AS_OF_DATE'])))
    .sort((a, b) => {
      const aDate = dateOnly(readString(a, ['asOfDate', 'AsOfDate', 'as_of_date', 'AS_OF_DATE'])) ?? '';
      const bDate = dateOnly(readString(b, ['asOfDate', 'AsOfDate', 'as_of_date', 'AS_OF_DATE'])) ?? '';
      return bDate.localeCompare(aDate);
    });

  const snapshots: Record<number, Snapshot> = {};
  const dateLabels: Record<number, string> = {};

  rows.slice(0, comparisonTMinus + 1).forEach((row, index) => {
    const explicitTMinus = readNumber(row, ['tMinus', 'TMinus', 't_minus', 'T_MINUS']);
    const tMinus = explicitTMinus != null && explicitTMinus >= 0 ? explicitTMinus : index;
    if (tMinus > comparisonTMinus) return;

    const asOfDate = dateOnly(readString(row, ['asOfDate', 'AsOfDate', 'as_of_date', 'AS_OF_DATE'])) ?? '';

    snapshots[tMinus] = {
      asOfDate,
      tMinus,
      metadata: {
        mv: readNumber(row, ['mv', 'Mv', 'MV', 'marketValue', 'MarketValue', 'market_value', 'USD_MARKET_VALUE']),
        level1Cash: readNumber(row, ['level1Cash', 'Level1Cash', 'level1_cash', 'LEVEL1_CASH']),
        level1CashPct: readNumber(row, ['level1CashPct', 'Level1CashPct', 'level1_cash_pct', 'LEVEL1_CASH_PCT']),
      },
      portfolio: {
        dur: readNumber(row, ['duration', 'Duration', 'dur', 'DUR', 'DURATION']),
        krd2y: readNumber(row, ['krd2YrBucket', 'Krd2YrBucket', 'krd_2yr_bucket', 'KRD_2YR_BUCKET', 'krd2y']),
        krd5y: readNumber(row, ['krd5YrBucket', 'Krd5YrBucket', 'krd_5yr_bucket', 'KRD_5YR_BUCKET', 'krd5y']),
        krd10y: readNumber(row, ['krd10YrBucket', 'Krd10YrBucket', 'krd_10yr_bucket', 'KRD_10YR_BUCKET', 'krd10y']),
        krd30y: readNumber(row, ['krd30YrBucket', 'Krd30YrBucket', 'krd_30yr_bucket', 'KRD_30YR_BUCKET', 'krd30y']),
        oas: readNumber(row, ['oas', 'Oas', 'OAS']),
        spreadDuration: readNumber(row, ['spreadDuration', 'SpreadDuration', 'spread_duration', 'SPREAD_DURATION']),
        avgLife: readNumber(row, ['avgLife', 'AvgLife', 'avg_life', 'AVG_LIFE']),
        yieldToWorst: readNumber(row, ['yieldToWorst', 'YieldToWorst', 'yield_to_worst', 'YIELD_TO_WORST']),
      },
      benchmark: {},
      target: {},
      ouBenchmark: {},
      ouTarget: {},
    };

    dateLabels[tMinus] = tMinus === 0 ? `T (${asOfDate})` : `${chip(tMinus)} (${asOfDate})`;
  });

  return { snapshots, dateLabels };
}

export function usePfaPortfolios() {
  return useQuery({
    queryKey: ['pfa', 'portfolios'],
    queryFn: () => fetchPfaJson<PfaPortfolio[]>(apiUrl('/portfolios')),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function usePfaPortfolioAnalytics({ portfolioKey, comparisonTMinus, enabled = true }: { portfolioKey: string | null; comparisonTMinus: number; enabled?: boolean }) {
  return useQuery({
    queryKey: ['pfa', 'portfolio-analytics', portfolioKey, comparisonTMinus],
    queryFn: async () => filterByPortfolio(await fetchPfaJson<PfaPortfolioAnalytics[]>(apiUrl(`/portfolio-analytics?tMinusStart=${comparisonTMinus}&tMinusEnd=0`)), portfolioKey),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function usePfaTrades({ portfolioKey, comparisonTMinus, enabled = true }: { portfolioKey: string | null; comparisonTMinus: number; enabled?: boolean }) {
  return useQuery({
    queryKey: ['pfa', 'trades', portfolioKey, comparisonTMinus],
    queryFn: async () => filterByPortfolio(await fetchPfaJson<MonitorV2Trade[]>(apiUrl(`/trades?tMinusStart=${comparisonTMinus}&tMinusEnd=0`)), portfolioKey),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function usePfaCashflows({ portfolioKey, comparisonTMinus, enabled = true }: { portfolioKey: string | null; comparisonTMinus: number; enabled?: boolean }) {
  return useQuery({
    queryKey: ['pfa', 'cashflows', portfolioKey, comparisonTMinus],
    queryFn: async () => filterByPortfolio(await fetchPfaJson<MonitorV2Cashflow[]>(apiUrl(`/cashflows?tMinusStart=${comparisonTMinus}&tMinusEnd=0`)), portfolioKey),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function usePfaPortfolioAnalysisContext({
  portfolioKey,
  comparisonTMinus,
  portfolios,
  enabled = true,
}: {
  portfolioKey: string | null;
  comparisonTMinus: number;
  portfolios: PfaPortfolio[] | undefined;
  enabled?: boolean;
}) {
  const analyticsQ = usePfaPortfolioAnalytics({ portfolioKey, comparisonTMinus, enabled });
  const tradesQ = usePfaTrades({ portfolioKey, comparisonTMinus, enabled });
  const cashflowsQ = usePfaCashflows({ portfolioKey, comparisonTMinus, enabled });

  const context = useMemo<PortfolioAnalysisContext | null>(() => {
    if (!portfolioKey || comparisonTMinus <= 0 || !analyticsQ.data) return null;
    const selectedPortfolio = (portfolios ?? []).find((portfolio) => portfolioMatches(getPortfolioKey(portfolio), portfolioKey));
    const { snapshots, dateLabels } = buildSnapshots(analyticsQ.data, comparisonTMinus);
    if (!snapshots[0] || !snapshots[comparisonTMinus]) return null;

    return {
      portfolioKey,
      portfolioName: selectedPortfolio ? getPortfolioName(selectedPortfolio) : undefined,
      benchmarkCode: selectedPortfolio ? getPortfolioBenchmark(selectedPortfolio) : undefined,
      legacyBenchmarkCode: selectedPortfolio ? getPortfolioLegacyBenchmarkCode(selectedPortfolio) : undefined,
      portfolioGroup: selectedPortfolio ? getPortfolioGroup(selectedPortfolio) : undefined,
      rhsGroup: selectedPortfolio ? getRhsGroup(selectedPortfolio) : undefined,
      futureEligible: selectedPortfolio ? getFutureEligible(selectedPortfolio) : null,
      comparisonTMinus,
      dateLabels,
      snapshots,
      cachedTrades: tradesQ.data ?? [],
      cachedCashflows: cashflowsQ.data ?? [],
    };
  }, [analyticsQ.data, cashflowsQ.data, comparisonTMinus, portfolioKey, portfolios, tradesQ.data]);

  return {
    context,
    analyticsQ,
    tradesQ,
    cashflowsQ,
    isLoading: analyticsQ.isLoading || tradesQ.isLoading || cashflowsQ.isLoading,
    isError: analyticsQ.isError || tradesQ.isError || cashflowsQ.isError,
  };
}
