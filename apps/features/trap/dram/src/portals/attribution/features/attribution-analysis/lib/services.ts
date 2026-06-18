import * as URI from "uri-js";
import type { PeriodCode } from "../lib/periods";
import type { MetricLabel } from "../lib/metrics";
import { AttributionDispersionResponse, PortBenchRow } from "./types";
import { GridConfigResponse } from "../components/dram-grid";

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

export const buildDram2Url = (path: string): string =>
  resolveUri(BASE_DRAM_2_PATH, path);


const BASE_RTN_ATTR_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_1_SERVICE;
const BASE_RTN_ATTR_PATH = resolveUri(BASE_RTN_ATTR_SERVICE_PATH, './rtn-attribution/api/v2/');
export const buildDram1Url = (path: string) => resolveUri(BASE_RTN_ATTR_PATH, path);

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

export type Metadata = {
  page_title?: string;
  value_date?: string;
}

export interface AnalyticsResponse {
  message: string;
  data: {
    metadata: Metadata;
    grids: AnalyticsApiGrid[];
  };
}


/* ---------------------------------- */
/*  API Layer */
/* ---------------------------------- */

export const api = {
  getConfigs: (asset_class: string): Promise<GridConfigResponse> =>
      req<GridConfigResponse>
  (`/api/attribution/metadata/${asset_class}/`),
  getAccounts: (asset_class: string): Promise<OptionsResponse> =>
      req<OptionsResponse>
  (`/api/attribution/accounts/${asset_class}/`),
  getEQAccounts: (): Promise<OptionsResponse> =>
    req<OptionsResponse>("/api/attribution/equity-accounts/"),
  getEMAccounts: (): Promise<OptionsResponse> =>
    req<OptionsResponse>("/api/attribution/em-accounts/"),
  getHYAccounts: (): Promise<OptionsResponse> =>
    req<OptionsResponse>("/api/attribution/highyield-accounts/"),
  getWorkflowState: (): Promise<WorkflowState> =>
    req<WorkflowState>("/workflow-state/"),

  saveWorkflowState: (state: WorkflowState): Promise<void> =>
    req<void>("/workflow-state/", {
      method: "POST",
      body: JSON.stringify(state),
    }),

  runAnalysis: (asset_class: string,port: string,period: string, breakdown: string, startDate: string, endDate: string): Promise<AnalyticsResponse> =>
    req<AnalyticsResponse>
  (`/api/attribution/${asset_class}/${period}/?port=${port}&grouping=${breakdown}&start_date=${startDate}&end_date=${endDate}`),
  runTestAnalysis: (asset_class: string,port: string,period: string, breakdown: string, startDate: string): Promise<AnalyticsResponse> =>
    req<AnalyticsResponse>
  (`/api/attribution/${asset_class}/${period}/?port=${port}&grouping=${breakdown}&start_date=${startDate}`),

  requestByDateAborvsIborReportService:(as_of_date: string):  Promise<AttributionDispersionResponse> =>
	  req<AttributionDispersionResponse>
  (`/api/abor-ibor/?date=${as_of_date}`),
  requestAborvsIborReportService:():  Promise<AttributionDispersionResponse> =>
	  req<AttributionDispersionResponse>
  (`/api/abor-ibor/`),
  requestByDateCorePlusAttributionDispersonReportService: (as_of_date: string):  Promise<AttributionDispersionResponse> =>
	      req<AttributionDispersionResponse>
  (`/api/attr-dispersion/?date==${as_of_date}`),

  requestCorePlusAttributionDispersonReportService: ():  Promise<AttributionDispersionResponse> =>
	  req<AttributionDispersionResponse>
    (`/api/attr-dispersion/`),
};
