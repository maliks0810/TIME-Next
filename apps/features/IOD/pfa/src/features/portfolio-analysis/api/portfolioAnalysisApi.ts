import { useQuery } from '@tanstack/react-query';
import type { PortfolioPositionAnalytics, SecurityAnalytics } from '../types';
import { apiUrl, fetchPfaJson } from './pfaFetch';

export function usePortfolioPositionAnalytics({
  portfolioKey,
  comparisonTMinus,
  lookThrough = false,
  enabled = true,
}: {
  portfolioKey: string | null;
  comparisonTMinus: number;
  lookThrough?: boolean;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['portfolio-analysis', 'positions', portfolioKey, comparisonTMinus, lookThrough],
    queryFn: () =>
      fetchPfaJson<PortfolioPositionAnalytics[]>(
        apiUrl(
          `/portfolio-position-analytics?tMinusStart=${comparisonTMinus}&tMinusEnd=0&lookThrough=${lookThrough ? 'true' : 'false'}&portfolioKeys=${encodeURIComponent(
            portfolioKey ?? '',
          )}`,
        ),
      ),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function useSecurities({
  portfolioKey,
  comparisonTMinus,
  enabled = true,
}: {
  portfolioKey: string | null;
  comparisonTMinus: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['portfolio-analysis', 'securities', portfolioKey, comparisonTMinus],
    queryFn: () =>
      fetchPfaJson<SecurityAnalytics[]>(
        apiUrl(
          `/securities?tMinusStart=${comparisonTMinus}&tMinusEnd=0&portfolioKeys=${encodeURIComponent(
            portfolioKey ?? '',
          )}`,
        ),
      ),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}
