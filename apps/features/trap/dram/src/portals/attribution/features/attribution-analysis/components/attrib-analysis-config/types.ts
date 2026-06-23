export type FrequencyModeId = "monthly" | "daily";
export interface AttribConfigSelectionState {
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