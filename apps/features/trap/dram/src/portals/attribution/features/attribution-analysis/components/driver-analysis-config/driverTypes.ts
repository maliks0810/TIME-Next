export type DatasetSourceType = "platform" | "uploaded_file" | "endpoint";
export type DriverMetricFormat = "bps" | "percent" | "usd" | "number";

export interface DriverMetric {
  name: string;
  label: string;
  format: DriverMetricFormat;
}

export interface DriverLimit {
  enabled: boolean;
  limit: number;
}

export interface EndpointDatasetConfig {
  url: string;
  method: "GET" | "POST";
  headersJson?: string;
  bodyJson?: string;
  authMode: "none" | "bearer" | "apiKey";
}

export interface UploadedDatasetConfig {
  datasetId?: string;
  fileName?: string;
}

export interface DatasetPreviewRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface DatasetUploadState {
  datasetId?: string;
  fileName?: string;
  rowCount?: number;
  columns: string[];
  previewRows: DatasetPreviewRow[];
  validationStatus?: "NotValidated" | "Validating" | "Valid" | "Invalid";
  validationErrors?: string[];
  validationWarnings?: string[];
}

export interface ColumnMapping {
  portfolioId?: string;
  asOfDate?: string;
  period?: string;
  sector?: string;
  industry?: string;
  country?: string;
  currency?: string;
  issuer?: string;
  security?: string;
  portfolioWeight?: string;
  benchmarkWeight?: string;
  portfolioReturn?: string;
  benchmarkReturn?: string;
  allocationEffect?: string;
  selectionEffect?: string;
  interactionEffect?: string;
  totalEffect?: string;
  pnlContributionUsd?: string;
  trackingErrorContribution?: string;
  varContribution?: string;
}

export interface DatasetSourceConfig {
  type: DatasetSourceType;
  uploadedFile?: UploadedDatasetConfig;
  endpoint?: EndpointDatasetConfig;
  uploadState?: DatasetUploadState;
  columnMapping?: ColumnMapping;
}

export interface DriverAnalysisFormState {
  portfolioId: string;
  asOfDate: string;
  periods: string[];
  groupBy: string[];
  displayNameField: string;
  metric: DriverMetric;
  top: DriverLimit;
  bottom: DriverLimit;
  includeComponents: string[];
  filters: {
    assetClass?: string[];
    currency?: string[];
    country?: string[];
    sector?: string[];
  };
  minimumAbsoluteValue?: number;
  datasetSource: DatasetSourceConfig;
}

export interface DriverRow {
  key: string;
  period: string;
  direction: "top" | "bottom";
  rank: number;
  driverName: string;
  metricName: string;
  metricLabel: string;
  metricValue: number;
  metricDisplay: string;
  allocationEffect?: number;
  selectionEffect?: number;
  interactionEffect?: number;
  portfolioContribution?: number;
  benchmarkContribution?: number;
  activeContribution?: number;
}

export interface DriverAnalysisResult {
  runId: string;
  portfolioId: string;
  asOfDate: string;
  periods: string[];
  groupBy: string[];
  metric: DriverMetric;
  topDrivers: DriverRow[];
  bottomDrivers: DriverRow[];
  summary: {
    status: "Completed" | "Warning" | "Failed";
    inputRows: number;
    filteredRows: number;
    topCount: number;
    bottomCount: number;
    durationMs: number;
    warnings?: string[];
  };
}
