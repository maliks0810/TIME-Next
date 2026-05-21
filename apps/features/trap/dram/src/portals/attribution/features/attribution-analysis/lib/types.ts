import { DynamicGridState } from "../components/buildDynamicGrid";
import { AnalyticsRow } from "./attributionRowModel";
import { MetricLabel } from "./metrics";
import { PeriodCode } from "./periods";


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

export interface AnalyticsResponse {
  metadata: AnalyticsMetadata;
  columns: ColumnMeta[];
  rows: AnalyticsRow[];
}

export interface WorkspaceData {
  kpis?: [string, string][];
}

export
interface WorkspaceState extends DynamicGridState {
  frequencyMode: "Monthly" | "Daily";

  asOfDate: string;
  startDate: string;
  endDate: string;

  benchmarks: string[];

  periods: PeriodCode[];
  metrics: MetricLabel[];
}

export type PortBenchRow = Readonly<{
  PORTFOLIO_KEY: string;
  PORTFOLIO_NAME: string;
  PORTFOLIO_GROUP_CODE: string | null;

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
export interface WorkspaceResponse {
  rows?: AnalyticsRow[];
}
