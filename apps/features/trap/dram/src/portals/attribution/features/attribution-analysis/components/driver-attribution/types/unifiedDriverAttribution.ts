import type { ReactNode } from "react";

export type DriverSourceType = "attribution" | "manual" | "model";
export type DriverSide = "top" | "bottom";
export type RunStatus = "Completed" | "Failed" | "Running" | "NotValidated";
export type ColumnFormatType = "text" | "number" | "percent" | "bps" | "currency" | "date";
export type ConditionalFormatMode = "none" | "positiveNegative" | "topBottom" | "quartile";
export type ConditionalDirection = "higherIsBetter" | "lowerIsBetter";
export type GridCellPrimitive = string | number | boolean | null | undefined;
export type GridRow = Record<string, GridCellPrimitive>;

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export interface WizardApplyPayload {
  assetClass: string;
  portfolio: string;
  portfolioId: string;
  benchmark: string;
  benchmarkId: string;
  frequencyMode: string;
  periodIds: string[];
  breakdownModeId: string;
  startDate: string;
  endDate: string;
  configuredColumns: NormalizedColumnConfig[];
}

export interface ColumnFormatRule {
  type: ColumnFormatType;
  decimals?: number;
  currencyCode?: string;
  scale?: number;
  negativeFormat?: "minus" | "parentheses";
  showZeroAsDash?: boolean;
}

export interface ConditionalFormatRule {
  mode: ConditionalFormatMode;
  direction?: ConditionalDirection;
}

export interface NormalizedColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  width?: number;
  groupId?: string;
  groupLabel?: string;
  pinned?: "left" | "right";
  format?: ColumnFormatRule;
  conditionalFormat?: ConditionalFormatRule;
}

export interface DriverColumnMapping {
  group: string;
  period: string;
  value: string;
  allocation?: string;
  selection?: string;
  interaction?: string;
  portfolioWeight?: string;
  benchmarkWeight?: string;
  portfolioReturn?: string;
  benchmarkReturn?: string;
}

export interface UploadedDatasetState {
  datasetId: string;
  fileName: string;
  columns: string[];
  rows: GridRow[];
  rowCount: number;
  validated: boolean;
  validationMessages: string[];
}

export interface DriverDataSourceConfig {
  type: DriverSourceType;
  datasetId?: string;
  endpointUrl?: string;
  modelId?: string;
}

export interface DriverModeConfig {
  sourceType: DriverSourceType;
  topN: number;
  rankingMetric: "totalEffect" | "allocationEffect" | "selectionEffect" | "interactionEffect" | "manualValue";
  uploadedDataset?: UploadedDatasetState;
  columnMapping?: DriverColumnMapping;
  modelEndpointUrl?: string;
  modelId?: string;
}

export interface AttributionMetricValues {
  portfolioWeight?: number;
  benchmarkWeight?: number;
  portfolioReturn?: number;
  benchmarkReturn?: number;
  portfolioContribution?: number;
  benchmarkContribution?: number;
  allocationEffect?: number;
  selectionEffect?: number;
  interactionEffect?: number;
  totalEffect?: number;
  manualValue?: number;
}

export interface UnifiedAttributionRow {
  rowKey: string;
  parentRowKey?: string | null;
  level: string;
  label: string;
  periodId: string;
  groupId: string;
  groupLabel: string;
  hasChildren: boolean;
  values: AttributionMetricValues;
  isDriver: boolean;
  driverSide?: DriverSide | null;
  driverRank?: number | null;
  driverScoreBps?: number | null;
}

export interface DriverRow {
  rowKey: string;
  periodId: string;
  groupId: string;
  groupLabel: string;
  side: DriverSide;
  rank: number;
  scoreBps: number;
  allocationBps?: number | null;
  selectionBps?: number | null;
  interactionBps?: number | null;
}

export interface DriverSummary {
  topTotalBps: number;
  bottomTotalBps: number;
  topCount: number;
  bottomCount: number;
}

export interface RunAudit {
  runId: string;
  status: RunStatus;
  metric: string;
  group: string;
  grid: string;
  inputRows: number;
  filteredRows: number;
  durationMs: number;
  sourceType: DriverSourceType;
}

export interface UnifiedDriverAttributionRequest {
  portfolioId: string;
  portfolioName: string;
  benchmarkId: string;
  benchmarkName: string;
  assetClass: string;
  frequencyMode: string;
  periodIds: string[];
  breakdownModeId: string;
  startDate: string;
  endDate: string;
  topN: number;
  rankingMetric: DriverModeConfig["rankingMetric"];
  dataSource: DriverDataSourceConfig;
  columnMapping?: DriverColumnMapping;
  manualRows?: GridRow[];
}

export interface UnifiedDriverAttributionResponse {
  request: UnifiedDriverAttributionRequest;
  rows: UnifiedAttributionRow[];
  drivers: DriverRow[];
  driverSummary: DriverSummary;
  runAudit: RunAudit;
}

export interface AutoCompleteDisplayOption {
  value: string;
  label: ReactNode;
}
