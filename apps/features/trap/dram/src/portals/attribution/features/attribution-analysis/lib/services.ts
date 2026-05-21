import * as URI from "uri-js";
import type { PeriodCode } from "../lib/periods";
import type { MetricLabel } from "../lib/metrics";
import { PortBenchRow, WorkspaceData } from "./types";
import { DynamicGridState } from "../components/buildDynamicGrid";

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
export type OptionsResponse = { rows: PortBenchRow[] };
export interface AnalyticsResponse {
  metadata: Record<string, unknown>;
  columns: unknown[];
  rows: Record<string, unknown>[];
}

/* ---------------------------------- */
/*  API Layer */
/* ---------------------------------- */

export const api = {
  getOptions: (): Promise<OptionsResponse> =>
    req<OptionsResponse>("/api/attribution/equity-accounts/"),

  getWorkflowState: (): Promise<WorkflowState> =>
    req<WorkflowState>("/workflow-state/"),

  saveWorkflowState: (state: WorkflowState): Promise<void> =>
    req<void>("/workflow-state/", {
      method: "POST",
      body: JSON.stringify(state),
    }),

  getWorkspace: (port: string): Promise<WorkspaceData> =>
    req<WorkspaceData>(`/api/att-eq-mtd/?port=${port}`),

  runAnalysis: (
    state: DynamicGridState
  ): Promise<AnalyticsResponse> =>
    req<AnalyticsResponse>("/run-analysis/", {
      method: "POST",
      body: JSON.stringify(state),
    }),
};