import { useQuery } from "@tanstack/react-query";
import type {
  BenchmarkUniverseType,
  PortfolioPositionAnalytics,
  SecurityAnalytics,
} from "../types";
import { fetchBenchmarkPositionArrow } from "./benchmarkPositionArrow";
import { apiUrl, fetchPfaJson } from "./pfaFetch";

function benchmarkPositionArrowQuery(
  legacyBenchmarkCode: string | null,
  comparisonTMinus: number,
  universeType: BenchmarkUniverseType,
): string {
  return apiUrl(
    `/benchmark-position-analytics/arrow?tMinusStart=${comparisonTMinus}&tMinusEnd=1` +
      `&legacyBenchmarkCodes=${encodeURIComponent(legacyBenchmarkCode ?? "")}` +
      `&universeTypeCode=${encodeURIComponent(universeType)}`,
  );
}

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
    queryKey: [
      "portfolio-analysis",
      "positions",
      portfolioKey,
      comparisonTMinus,
      lookThrough,
      loadVersion,
    ],
    queryFn: ({ signal }) =>
      fetchPfaJson<PortfolioPositionAnalytics[]>(
        apiUrl(
          `/portfolio-position-analytics?tMinusStart=${comparisonTMinus}&tMinusEnd=0` +
            `&lookThrough=${lookThrough ? "true" : "false"}` +
            `&portfolioKeys=${encodeURIComponent(portfolioKey ?? "")}`,
        ),
        signal,
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
      "portfolio-analysis",
      "benchmark-positions-arrow",
      legacyBenchmarkCode,
      comparisonTMinus,
      universeType,
      loadVersion,
    ],
    queryFn: ({ signal }) =>
      fetchBenchmarkPositionArrow(
        benchmarkPositionArrowQuery(
          legacyBenchmarkCode,
          comparisonTMinus,
          universeType,
        ),
        signal,
      ),
    enabled: Boolean(enabled && legacyBenchmarkCode && comparisonTMinus > 0),
    staleTime: 300_000,
    retry: false,
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
    queryKey: [
      "portfolio-analysis",
      "securities",
      portfolioKey,
      comparisonTMinus,
      loadVersion,
    ],
    queryFn: ({ signal }) =>
      fetchPfaJson<SecurityAnalytics[]>(
        apiUrl(
          `/securities?tMinusStart=${comparisonTMinus}&tMinusEnd=0` +
            `&portfolioKeys=${encodeURIComponent(portfolioKey ?? "")}`,
        ),
        signal,
      ),
    enabled: Boolean(enabled && portfolioKey && comparisonTMinus > 0),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}
