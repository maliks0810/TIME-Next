import { MetricLabel } from "./metrics";
import { PeriodCode } from "./periods";

export type FrequencyMode = "Monthly" | "Daily";
export type AssetClass = "EM" | "EQ" | "FI" | "BL" | "HY" | "None";

export interface ColumnMeta {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  align?: "left" | "right" | "center";
  children?: ColumnMeta[];
}

export interface AnalyticsMetadata {
  asOfDate: string;
  generatedAt: string;

  portfolios: string[];
  benchmarks: string[];

  periods: PeriodCode[];
  metrics: MetricLabel[];
}

export interface WorkspaceData {
  kpis?: [string, string][];
}

export type PortBenchRow = Readonly<{
  PORTFOLIO_KEY: string;
  PORTFOLIO_NAME: string;
  PORTFOLIO_GROUP_CODE?: string | null;

  PORTFOLIO_BENCHMARK_CODE: string | null;
  PORTFOLIO_BENCHMARK_NAME: string | null;

  PORTFOLIO_SECONDARY_BENCHMARK_CODE: string | null;
  PORTFOLIO_SECONDARY_BENCHMARK_NAME: string | null;
}>;

export type SelectOption = Readonly<{
  value: string;
  label: string;
  group?: string;
}>;

  export interface WorkspaceState  {
  frequencyMode: "Monthly" | "Daily";
  primaryGrouping: string;
  secondaryGrouping?: string;
  tertiaryGrouping?: string;

  asOfDate: string;
  startDate: string;
  endDate: string;
  portfolios: string,
  benchmarks: string;

  periods: PeriodCode[];
  metrics: MetricLabel[];
  baseCurrency:string | 'USD',
  carveOut:string | 'None',

  filters: string[] | ["None"],

  layoutMode: string |  "Grouped Grid",
  detailPanels: string[] |  ["Notes", "Validation", "Contributors"],
}
export type Props = {
  onComplete?: () => void;
  onConfigure?: () => void;
  onCallback?: (info: string, targetView?: string) => void;
  assetClass?: string;
  isConfigView?: boolean,
};


export interface DispersionRequest {
    selectedDate?: string,
}

export interface DispersionReportResponse {
    columns?: string,
    data?: string[]
}


export interface DispersionReportPayloadData {
  name: string;
  age: number;
}
export type Primitive = string | number | boolean | null;
export type GridRow = Record<string, Primitive>;
export type Grid = { title: string; rows?: GridRow[] };

export type AttributionDispersionResponse = {
  message: string;
  data: {
    metadata: {
      page_title: string;
      value_date: string;
      grid_count: number;
      request_id: string | null;
      timestamp: string;
    };
    grids?: Grid[];
  }
};

export type FiReportSummaryResponse = {
  asOfDate: string;
  portfolioNumbers: string[];
  count: number;
}