import { BackendFrequencyMode, FrequencyModeId } from "../wizard-config/wizardConfigTypes";

export type ColumnFormat = "text" | "percent" | "bps";

export interface ApiColumnConfig {
  id: string;
  label: string;
  accessor?: string;
  visible: boolean;
  frozen: boolean;

  /**
   * Legacy fallback grouping field
   */
  group?: string | null;

  /**
   * Preferred backend grouping key
   * Example: "default", "portfolio", "bench", "attribution_analysis", "em", "eq"
   */
  columnGroupKey?: string | null;

  /**
   * Backend-provided display label for the group header.
   * Blank / null means do not render a visible group header.
   */
  columnGroupLabel?: string | null;

  /**
   * Backend-provided group order.
   * Lower values render earlier.
   */
  columnGroupOrder?: number | null;

  /**
   * Backend-provided styling token for the group header.
   * Example: "default", "portfolio", "bench", "attribution", "em", "eq", "neutral"
   */
  columnGroupStyleToken?: string | null;

  order: number;
  format: ColumnFormat;
}

export interface MetricConfig {
  id: string;
  label: string;
  visible: boolean;
  frozen: boolean;
  group: string;
  order: number;
  format: ColumnFormat;
}

export interface PeriodConfig {
  id: string;
  label: string;
  short_label: string;
  sort_order: number;
  visible: boolean;
  frequency_mode: FrequencyModeId;
}

export interface BreakdownMode {
  id: string;
  label: string;
  group: string;
}

export interface GridConfigResponse {
  columnConfigs: {
    all: ApiColumnConfig[];
  };
  metrics: MetricConfig[];
  periods: PeriodConfig[][];
  breakdownMode: BreakdownMode[];
  frequencyMode: BackendFrequencyMode[];
}

export interface GridMetadata {
  page_title: string;
  value_date: string;
  grid_count: number;
  request_id: string | null;
  timestamp: string;
}

export type PrimitiveCellValue = string | number | null | undefined;

export type AttributionRow = Record<string, PrimitiveCellValue> & {
  key: string;
};

export interface GridApiGrid {
  title: string;
  rows: Record<string, PrimitiveCellValue>[];
}

export interface GridDataResponse {
  message: string;
  data: {
    metadata: GridMetadata;
    grids: GridApiGrid[];
  };
}

export interface PersistedGridState {
  order: string[];
  widths: Record<string, number>;
  visibility: Record<string, boolean>;
}

export interface NormalizedColumnConfig {
  id: string;
  label: string;
  accessor: string;
  visible: boolean;
  frozen: boolean;

  /**
   * Resolved grouping key used by the UI.
   */
  groupKey: string;

  /**
   * Resolved visible label for group header.
   * Blank means render columns without a visible group header.
   */
  groupLabel: string;

  /**
   * Resolved order of the column group.
   */
  groupOrder: number;

  /**
   * Resolved styling token for group header look-and-feel.
   */
  groupStyleToken: string;

  order: number;
  format: ColumnFormat;
  width: number;
  minWidth: number;
  serverIndex: number;
}