import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_PDM_API_BASE ?? '/iod/v1/api';

const RWM_API_PATHS = {
  portfolios: '/portfolios',
  portfolioAnalytics: '/portfolio-analytics',
  treasuryInstruments: '/treasury-instruments',
} as const;

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${url}`);
  }
  return response.json() as Promise<T>;
}

export type RwmPortfolio = {
  portfolioKey?: string | null;
  portfolioName?: string | null;
  legacyPortfolioNumber?: string | null;
  parentCode?: string | null;
  rhsGroupCode?: string | null;
  rhsGroup?: string | null;
  portfolioGroup?: string | null;
};

export type RwmPortfolioAnalytics = {
  portfolioKey?: string | null;
  duration?: number | null;
  dur?: number | null;
  intra_dur?: number | null;
  intradayDuration?: number | null;
};

export type RwmPortfolioOption = {
  portfolioKey: string;
  portfolioName: string;
  portfolioNumber: string;
  portfolioGroup: string;
  rhsGroupCode: string;
  duration: number | null;
  searchText: string;
};

export type RwmTreasuryInstrument = Record<string, unknown> & {
  securityKey?: string | null;
  securityId?: string | null;
  cusip?: string | null;
  securityDescription?: string | null;
  description?: string | null;
  assetType?: string | null;
  instrumentType?: string | null;
  duration?: number | null;
  effectiveDuration?: number | null;
};

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeCode(value: unknown): string {
  return normalizeText(value).toUpperCase();
}

function toNumberOrNull(value: unknown): number | null {
  const next = Number(value ?? Number.NaN);
  return Number.isFinite(next) ? next : null;
}

function getRhsGroupCode(portfolio: RwmPortfolio): string {
  return normalizeCode(portfolio.rhsGroupCode ?? portfolio.rhsGroup ?? portfolio.portfolioGroup ?? portfolio.parentCode);
}

function getPortfolioGroup(portfolio: RwmPortfolio): string {
  return normalizeCode(portfolio.portfolioGroup ?? portfolio.parentCode);
}

function getDuration(analytics: RwmPortfolioAnalytics | undefined): number | null {
  if (!analytics) return null;
  return toNumberOrNull(analytics.duration ?? analytics.dur ?? analytics.intra_dur ?? analytics.intradayDuration);
}

export function useTreasuryInstruments() {
  return useQuery({
    queryKey: ['rwm', 'treasury-instruments'],
    queryFn: () => fetchJson<RwmTreasuryInstrument[]>(apiUrl(RWM_API_PATHS.treasuryInstruments)),
    staleTime: 10 * 60_000,
  });
}

export function useRwmPortfolioOptions() {
  const portfoliosQuery = useQuery({
    queryKey: ['rwm', 'portfolios'],
    queryFn: () => fetchJson<RwmPortfolio[]>(apiUrl(RWM_API_PATHS.portfolios)),
    staleTime: 10 * 60_000,
  });

  const analyticsQuery = useQuery({
    queryKey: ['rwm', 'portfolio-analytics', 'live'],
    queryFn: () => fetchJson<RwmPortfolioAnalytics[]>(apiUrl(RWM_API_PATHS.portfolioAnalytics)),
    staleTime: 30_000,
  });

  const options = useMemo<RwmPortfolioOption[]>(() => {
    const analyticsByPortfolioKey = new Map<string, RwmPortfolioAnalytics>();
    for (const analytics of analyticsQuery.data ?? []) {
      const key = normalizeText(analytics.portfolioKey);
      if (key) analyticsByPortfolioKey.set(key, analytics);
    }

    return (portfoliosQuery.data ?? [])
      .map((portfolio) => {
        const portfolioKey = normalizeText(portfolio.portfolioKey);
        if (!portfolioKey) return null;

        const portfolioName = normalizeText(portfolio.portfolioName);
        const portfolioNumber = normalizeText(portfolio.legacyPortfolioNumber);
        const portfolioGroup = getPortfolioGroup(portfolio);
        const rhsGroupCode = getRhsGroupCode(portfolio);
        const duration = getDuration(analyticsByPortfolioKey.get(portfolioKey));

        return {
          portfolioKey,
          portfolioName,
          portfolioNumber,
          portfolioGroup,
          rhsGroupCode,
          duration,
          searchText: `${portfolioKey} ${portfolioNumber} ${portfolioName} ${portfolioGroup} ${rhsGroupCode}`.toLowerCase(),
        };
      })
      .filter((option): option is RwmPortfolioOption => Boolean(option))
      .sort((a, b) => a.portfolioKey.localeCompare(b.portfolioKey));
  }, [analyticsQuery.data, portfoliosQuery.data]);

  return {
    options,
    isLoading: portfoliosQuery.isLoading || analyticsQuery.isLoading,
    isFetching: portfoliosQuery.isFetching || analyticsQuery.isFetching,
    isError: portfoliosQuery.isError || analyticsQuery.isError,
    error: portfoliosQuery.error ?? analyticsQuery.error ?? null,
    refetch: async () => {
      await Promise.all([portfoliosQuery.refetch(), analyticsQuery.refetch()]);
    },
  };
}

export function useRwmRhsGroups(): string[] {
  const { options } = useRwmPortfolioOptions();
  return useMemo(
    () => Array.from(new Set(options.map((option) => option.rhsGroupCode).filter(Boolean))).sort(),
    [options],
  );
}
