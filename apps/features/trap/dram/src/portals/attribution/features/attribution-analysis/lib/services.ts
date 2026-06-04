import * as URI from "uri-js";
import type { PeriodCode } from "../lib/periods";
import type { MetricLabel } from "../lib/metrics";
import { PortBenchRow } from "./types";

/* ---------------------------------- */
/*  Utility */
/* ---------------------------------- */

const resolveUri = (baseUri?: string, relativeUri?: string): string =>
  URI.resolve(URI.normalize(baseUri ?? ""), relativeUri ?? "");

/* ---------------------------------- */
/*  Base Paths */
/* ---------------------------------- */

const BASE_DRAM_2_SERVICE_PATH: string =
  import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;

const BASE_DRAM_2_PATH: string = resolveUri(
  BASE_DRAM_2_SERVICE_PATH,
  "./api/attribution/"
);

const buildDram2Url = (path: string): string =>
  resolveUri(BASE_DRAM_2_PATH, path);

/* ---------------------------------- */
/*  Generic Request Wrapper */
/* ---------------------------------- */

async function req<TResponse>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const res = await fetch(buildDram2Url(path), {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return (await res.json()) as TResponse;
}

/* ---------------------------------- */
/* Domain Types */
/* ---------------------------------- */

export interface WorkflowState {
  frequencyMode: "Daily" | "Monthly" ;

  portfolios: string[];
  benchmarks: string[];

  asOfDate: string;
  startDate: string;
  endDate: string;

  baseCurrency: string;
  carveOut: string;

  periods: PeriodCode[];
  metrics: MetricLabel[];

  primaryGrouping: string;
  secondaryGrouping?: string;
  tertiaryGrouping?: string;

  filters: string[];

  layoutMode: string;
  detailPanels: string[];
}
export interface OptionApiGrid {
  title: string;
  rows: PortBenchRow[];
}


export type OptionsResponse = {
  message: string;
  data: {
    metadata: unknown;
    grids: OptionApiGrid[];
  }; };

  export interface AnalyticResultRow {
    SecurityName: string;
    PFAvgWeight: number;
    PFTotalRet: number;
    PFContToRet: number;
    BMAvgWeight: number;
    BMTotalRet: number;
    BMContToRet: number;
    AllocEffect: number;
    SelectEffect: number;
    InterEffect: number;
    [key: string]: string | number | null; // dynamic GICSx
  }
 export interface AnalyticsApiGrid {
  title: string;
  rows: AnalyticResultRow[];
}

export interface AnalyticsResponse {
  message: string;
  data: {
    metadata: unknown;
    grids: AnalyticsApiGrid[];
  };
}


/* ---------------------------------- */
/*  API Layer */
/* ---------------------------------- */

export const api = {
  getEQOptions: (): Promise<OptionsResponse> =>
    req<OptionsResponse>("/api/attribution/equity-accounts/"),
  getEMOptions: (): Promise<OptionsResponse> =>
    req<OptionsResponse>("/api/attribution/em-accounts/"),
  getWorkflowState: (): Promise<WorkflowState> =>
    req<WorkflowState>("/workflow-state/"),

  saveWorkflowState: (state: WorkflowState): Promise<void> =>
    req<void>("/workflow-state/", {
      method: "POST",
      body: JSON.stringify(state),
    }),

  runMonthlyAssetAnalyis: (asset_class: string, port: string, inputDate: string) : Promise<AnalyticsResponse> =>
      req<AnalyticsResponse>
  (`/api/attr-monthly/${asset_class}/?port=${port}&inputDate=${inputDate}`),

  runAnalysis: (port: string, breakdown: string, startDate: string, endDate: string): Promise<AnalyticsResponse> =>
    req<AnalyticsResponse>
  (`/api/att-eq-mtd/?port=${port}&grouping=${breakdown}&start_date=${startDate}&end_date=${endDate}`),
};
