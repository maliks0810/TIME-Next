import type { PeriodCode } from "./periods";
import type { MetricLabel } from "./metrics";

export interface MetricValue {
  metric: MetricLabel;
  value: number | null;
}

export interface PeriodBlock {
  period: PeriodCode;
  metrics: MetricValue[];
}

export interface PortfolioBlock {
  portfolio: string;
  portfolioWeight?: number;
  periods: PeriodBlock[];
}

export type AnalyticsRow = {
  key?: string;
  benchmarkWeight?: number;
} & Record<string, string | number | null | undefined>;

export interface AnalyticsDataNode {
  dimensions: Record<string, string>; // Sector, Country, etc.

  benchmarkWeight?: number;

  portfolios: {
    portfolio: string;
    portfolioWeight?: number;

    periods: {
      period: PeriodCode;

      metrics: {
        metric: MetricLabel;
        value: number | null;
      }[];
    }[];
  }[];
}
export interface AnalyticsApiResponse {
  metadata: {
    asOfDate: string;
    portfolios: string[];
    periods: PeriodCode[];
    metrics: MetricLabel[];
    groupings: string[];
  };

  data: AnalyticsDataNode[];
}