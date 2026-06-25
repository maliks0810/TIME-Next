import type { DriverColumnMapping, GridRow, UploadedDatasetState } from "../types/unifiedDriverAttribution";

export interface MappingValidationResult {
  valid: boolean;
  messages: string[];
}

export function validateColumnMapping(
  dataset: UploadedDatasetState | undefined,
  mapping: DriverColumnMapping | undefined
): MappingValidationResult {
  const messages: string[] = [];

  if (!dataset) messages.push("Upload a dataset before validation.");
  if (!mapping) messages.push("Map required columns before validation.");

  if (!dataset || !mapping) return { valid: false, messages };

  const required: Array<keyof DriverColumnMapping> = ["group", "period", "value"];
  required.forEach((field) => {
    const mappedColumn = mapping[field];
    if (!mappedColumn) {
      messages.push(`Missing mapping for ${field}.`);
    } else if (!dataset.columns.includes(mappedColumn)) {
      messages.push(`Mapped column ${mappedColumn} for ${field} is not present in dataset.`);
    }
  });

  const valueColumn = mapping.value;
  if (valueColumn) {
    const invalidValueRows = dataset.rows.filter((row) => {
      const value = row[valueColumn];
      return typeof value !== "number" && value !== null && value !== undefined && value !== "";
    });

    if (invalidValueRows.length > 0) {
      messages.push(`Column ${valueColumn} contains non-numeric values.`);
    }
  }

  return { valid: messages.length === 0, messages };
}

export function buildDatasetState(
  datasetId: string,
  fileName: string,
  columns: string[],
  rows: GridRow[]
): UploadedDatasetState {
  return {
    datasetId,
    fileName,
    columns,
    rows,
    rowCount: rows.length,
    validated: false,
    validationMessages: [],
  };
}
