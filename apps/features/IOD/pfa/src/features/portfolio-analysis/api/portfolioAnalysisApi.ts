import { useQuery } from '@tanstack/react-query';
import type {
  BenchmarkPositionAnalytics,
  BenchmarkUniverseType,
  PortfolioPositionAnalytics,
  SecurityAnalytics,
} from '../types';
import { apiUrl, fetchPfaJson } from './pfaFetch';

export function usePortfolioPositionAnalytics({
  portfolioKey,
  comparisonTMinus,
  lookThrough = false,
  loadVersion = 0,
  enabled = true,
}: {
  portfolioKey: string | null;
  comparisonTMinus: number;
  lookThrough?: boolean;
  loadVersion?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['portfolio-analysis', 'positions', portfolioKey, comparisonTMinus, lookThrough, loadVersion],
    queryFn: () =>
      fetchPfaJson<PortfolioPositionAnalytics[]>(
        apiUrl(
          `/portfolio-position-analytics?tMinusStart=${comparisonTMinus}&tMinusEnd=0` +
            `&lookThrough=${lookThrough ? 'true' : 'false'}` +
            `&portfolioKeys=${encodeURIComponent(portfolioKey ?? '')}`,
        ),
      ),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function useBenchmarkPositionAnalytics({
  legacyBenchmarkCode,
  comparisonTMinus,
  universeType,
  loadVersion = 0,
  enabled = true,
}: {
  legacyBenchmarkCode: string | null;
  comparisonTMinus: number;
  universeType: BenchmarkUniverseType;
  loadVersion?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      'portfolio-analysis',
      'benchmark-positions',
      legacyBenchmarkCode,
      comparisonTMinus,
      universeType,
      loadVersion,
    ],
    queryFn: () =>
      fetchPfaJson<BenchmarkPositionAnalytics[]>(
        apiUrl(
          `/benchmark-position-analytics?tMinusStart=${comparisonTMinus}&tMinusEnd=1` +
            `&legacyBenchmarkCodes=${encodeURIComponent(legacyBenchmarkCode ?? '')}` +
            `&universeTypeCode=${encodeURIComponent(universeType)}`,
        ),
      ),
    enabled: Boolean(enabled && legacyBenchmarkCode && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function useSecurities({
  portfolioKey,
  comparisonTMinus,
  loadVersion = 0,
  enabled = true,
}: {
  portfolioKey: string | null;
  comparisonTMinus: number;
  loadVersion?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['portfolio-analysis', 'securities', portfolioKey, comparisonTMinus, loadVersion],
    queryFn: () =>
      fetchPfaJson<SecurityAnalytics[]>(
        apiUrl(
          `/securities?tMinusStart=${comparisonTMinus}&tMinusEnd=0` +
            `&portfolioKeys=${encodeURIComponent(portfolioKey ?? '')}`,
        ),
      ),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}
