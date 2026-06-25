import type {
  ColumnMapping,
  DatasetPreviewRow,
  DriverAnalysisFormState
} from "../driverTypes";

export interface UploadDatasetResponse {
  datasetId: string;
  fileName: string;
  rowCount: number;
  columns: string[];
  previewRows: DatasetPreviewRow[];
  status: "Uploaded";
}

export interface ValidateDatasetResponse {
  datasetId?: string;
  status: "Valid" | "Invalid";
  rowCount?: number;
  errors: string[];
  warnings: string[];
  availablePeriods?: string[];
  availableGroupings?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_BACKEND_DATASET_API = Boolean(import.meta.env.VITE_API_BASE_URL);

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function coerceValue(value: string): string | number | boolean | null {
  if (value === "") return null;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && value.trim() !== "") {
    return numeric;
  }

  return value;
}

async function uploadDatasetLocally(file: File): Promise<UploadDatasetResponse> {
  const isCsv = file.name.toLowerCase().endsWith(".csv");

  if (!isCsv) {
    return {
      datasetId: `LOCAL-${Date.now()}`,
      fileName: file.name,
      rowCount: 0,
      columns: [],
      previewRows: [],
      status: "Uploaded"
    };
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const columns = lines.length > 0 ? parseCsvLine(lines[0]) : [];
  const dataLines = lines.slice(1);
  const previewRows = dataLines.slice(0, 25).map((line) => {
    const values = parseCsvLine(line);
    return columns.reduce<DatasetPreviewRow>((row, column, index) => {
      row[column] = coerceValue(values[index] ?? "");
      return row;
    }, {});
  });

  return {
    datasetId: `LOCAL-${Date.now()}`,
    fileName: file.name,
    rowCount: dataLines.length,
    columns,
    previewRows,
    status: "Uploaded"
  };
}

export async function uploadDriverDataset(file: File): Promise<UploadDatasetResponse> {
  if (!USE_BACKEND_DATASET_API) {
    return uploadDatasetLocally(file);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analytics/drivers/datasets/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

function getMappedColumn(mapping: ColumnMapping | undefined, field: keyof ColumnMapping): string | undefined {
  return mapping?.[field];
}

function validateDatasetLocally(params: {
  datasetId?: string;
  metric: string;
  groupBy: string[];
  periods: string[];
  columnMapping?: ColumnMapping;
  columns?: string[];
  rowCount?: number;
}): ValidateDatasetResponse {
  const errors: string[] = [];
  const warnings: string[] = [];
  const columns = params.columns ?? [];
  const hasColumn = (column?: string) => Boolean(column && columns.includes(column));
  const requireMapped = (field: keyof ColumnMapping, label: string) => {
    const column = getMappedColumn(params.columnMapping, field);
    if (!hasColumn(column)) {
      errors.push(`${label} is required for ${params.metric} but is not mapped to an uploaded column.`);
    }
  };

  requireMapped("period", "Period");

  params.groupBy.forEach((groupBy) => {
    const field = groupBy as keyof ColumnMapping;
    if (!hasColumn(getMappedColumn(params.columnMapping, field))) {
      errors.push(`Group by '${groupBy}' is selected but not mapped to an uploaded column.`);
    }
  });

  const returnMetrics = new Set(["portfolio_contribution", "benchmark_contribution", "active_contribution"]);
  const attributionMetrics = new Set(["allocation_effect", "selection_effect", "interaction_effect", "total_effect"]);

  if (returnMetrics.has(params.metric)) {
    requireMapped("portfolioWeight", "Portfolio Weight");
    requireMapped("portfolioReturn", "Portfolio Return");

    if (["benchmark_contribution", "active_contribution"].includes(params.metric)) {
      requireMapped("benchmarkWeight", "Benchmark Weight");
      requireMapped("benchmarkReturn", "Benchmark Return");
    }
  }

  if (attributionMetrics.has(params.metric)) {
    const directMetricFieldMap: Record<string, keyof ColumnMapping> = {
      allocation_effect: "allocationEffect",
      selection_effect: "selectionEffect",
      interaction_effect: "interactionEffect",
      total_effect: "totalEffect"
    };

    const directField = directMetricFieldMap[params.metric];
    const directMetricMapped = hasColumn(getMappedColumn(params.columnMapping, directField));

    const formulaInputsMapped =
      hasColumn(getMappedColumn(params.columnMapping, "portfolioWeight")) &&
      hasColumn(getMappedColumn(params.columnMapping, "benchmarkWeight")) &&
      hasColumn(getMappedColumn(params.columnMapping, "portfolioReturn")) &&
      hasColumn(getMappedColumn(params.columnMapping, "benchmarkReturn"));

    if (!directMetricMapped && !formulaInputsMapped) {
      errors.push(
        `${params.metric} requires either a direct mapped metric column or mapped portfolio/benchmark weights and returns.`
      );
    }
  }

  if (params.metric === "pnl_contribution_usd") {
    requireMapped("pnlContributionUsd", "P&L Contribution USD");
  }

  if (params.metric === "tracking_error_contribution") {
    requireMapped("trackingErrorContribution", "Tracking Error Contribution");
  }

  if (params.metric === "var_contribution") {
    requireMapped("varContribution", "VaR Contribution");
  }

  if ((params.rowCount ?? 0) === 0) {
    warnings.push("The uploaded file has no parsed rows. CSV preview is supported locally; Excel/Parquet requires the backend upload API.");
  }

  return {
    datasetId: params.datasetId,
    status: errors.length === 0 ? "Valid" : "Invalid",
    rowCount: params.rowCount,
    errors,
    warnings,
    availablePeriods: params.periods,
    availableGroupings: params.groupBy
  };
}

export async function validateDriverDataset(params: {
  datasetId?: string;
  metric: string;
  groupBy: string[];
  periods: string[];
  columnMapping?: ColumnMapping;
  columns?: string[];
  rowCount?: number;
}): Promise<ValidateDatasetResponse> {
  if (!USE_BACKEND_DATASET_API) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return validateDatasetLocally(params);
  }

  const response = await fetch(`${API_BASE_URL}/api/analytics/drivers/datasets/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`);
  }

  return response.json();
}

export function buildDatasetSourcePayload(formState: DriverAnalysisFormState) {
  const datasetSource = formState.datasetSource;

  if (datasetSource.type === "uploaded_file") {
    return {
      type: "uploaded_file",
      datasetId: datasetSource.uploadState?.datasetId,
      fileName: datasetSource.uploadState?.fileName,
      columnMapping: datasetSource.columnMapping
    };
  }

  if (datasetSource.type === "endpoint") {
    return {
      type: "endpoint",
      endpoint: datasetSource.endpoint,
      columnMapping: datasetSource.columnMapping
    };
  }

  return {
    type: "platform"
  };
}
