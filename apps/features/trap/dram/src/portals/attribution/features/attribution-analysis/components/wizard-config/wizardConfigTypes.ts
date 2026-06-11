export type FrequencyModeId = "monthly" | "daily";

export interface BackendColumnConfig {
  id: string;
  label: string;
  accessor?: string;
  visible: boolean;
  frozen: boolean;
  group: string;
  order: number;
  format: string;
  columnGroupLabel?: string;
  columnGroupKey: string;
  columnGroupOrder?: number;
}

export interface BackendMetricConfig {
  id: string;
  label: string;
  visible: boolean;
  frozen: boolean;
  group: string;
  order: number;
  format: string;
  columnGroupLabel?: string;
  columnGroupKey: string;
  columnGroupOrder?: number;
}


export interface BackendFrequencyMode {
  id: FrequencyModeId;
  label: string;
  group: string;
}


export interface WizardSelectionState {
  frequencyMode: FrequencyModeId;
  periodIds: string[];
  breakdownModeId: string | null;
  selectedColumnIds: string[];
  asOfDate: string;
  startDate: string;
  endDate: string;
  portfolio: string;
  benchmark: string;
}