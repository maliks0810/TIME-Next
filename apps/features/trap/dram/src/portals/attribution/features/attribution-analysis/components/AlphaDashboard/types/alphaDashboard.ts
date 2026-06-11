import { buildDram2Url } from "../../../lib/services";

export type MetricKey = "alpha" | "portfolioReturn" | "netReturn";

export interface RankingItemRaw {
  portfolioNumber?: string | null;
  portfolioName?: string | null;
  alpha?: number | null;
  portfolioReturn?: number | null;
  return?: number | null;
  netReturn?: number | null;
  portfolioNetReturn?: number | null;
  portNetReturn?: number | null;
  rank?: number | null;
  nav?: number | null;
  benchmarkName?: string | null;
  performanceStatus?: string | null;
}

export interface RankingItem {
  portfolioNumber: string;
  portfolioName: string;
  alpha: number | null;
  portfolioReturn: number | null;
  netReturn: number | null;
  rank: number | null;
  nav: number | null;
  benchmarkName: string;
  performanceStatus: string;
}

export interface PeriodBucket {
  top?: RankingItemRaw[];
  bottom?: RankingItemRaw[];
}

export type StylePeriodMap = Record<string, PeriodBucket>;
export type RankingsByStyle = Record<string, StylePeriodMap>;

export interface DashboardPayload {
  asOfDate?: string;
  periods?: string[];
  styles?: string[];
  rankingsByStyle?: RankingsByStyle;
}

export interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  heatColorMin: string;
  heatColorMax: string;
}

export interface SummaryValues {
  best: number | null;
  worst: number | null;
  spread: number | null;
  totalNav: number;
}

export interface ExportRow extends RankingItem {
  bucket: "top" | "bottom";
}

export interface SelectorItem<T extends string> {
  value: T;
  label: string;
}

export interface GetAlphaRankingsParams {
  asOfDate: string;
  topN?: number;
//  metric: MetricKey;
}

export async function getAlphaRankings(
  params: GetAlphaRankingsParams
): Promise<DashboardPayload> {
  const { asOfDate, topN = 5 } = params;

  const qs = new URLSearchParams({
    as_of_date: asOfDate,
    top_n: String(topN),

  });

  const response = await fetch(buildDram2Url(`/api/performance/pa/alpha-rankings?${qs.toString()}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load alpha rankings: ${response.status}`);
  }

  return (await response.json()) as DashboardPayload;
}