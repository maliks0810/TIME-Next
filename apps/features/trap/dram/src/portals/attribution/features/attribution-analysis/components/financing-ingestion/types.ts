export type FinancingSourceType = "TBA" | "FUTURES";

export type IngestStatus =
  | "RECEIVED"
  | "VALIDATING"
  | "STAGED"
  | "PROMOTING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED";

export interface FinancingIngestResponse {
  batch_id: string;
  source_type: FinancingSourceType;
  status: IngestStatus;
  original_file_name: string;
  sheet_count: number;
  raw_row_count: number;
  valid_row_count: number;
  error_row_count: number;
  duplicate_row_count: number;
  message?: string | null;
}

export interface FinancingBatchDto {
  batch_id: string;
  source_type: FinancingSourceType;
  original_file_name: string;
  file_hash: string;
  uploaded_by?: string | null;
  status: IngestStatus;
  sheet_count: number;
  raw_row_count: number;
  valid_row_count: number;
  error_row_count: number;
  duplicate_row_count: number;
  started_at: string;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface FinancingErrorDto {
  error_id: number;
  batch_id: string;
  source_type: FinancingSourceType;
  sheet_name?: string | null;
  excel_row_number?: number | null;
  portfolio_key?: string | null;
  error_code: string;
  error_message: string;
  created_at: string;
}

export interface FinancingMonthlyRow {
  source_type: FinancingSourceType;
  portfolio_key: string;
  month_end_date: string;
  total_base_value: string;
  financing_amount: string;
  financing_bps: string;
  value_basis: string;
}

export interface FinancingSummaryRow {
  source_type: FinancingSourceType;
  month_end_date: string;
  portfolio_count: number;
  total_base_value: string;
  total_financing_amount: string;
  weighted_financing_bps?: string | null;
}
export interface FinancingBatchApiResponse {
  message: string;
  data: {
    metadata: {
      page_title: string;
      value_date: string;
      grid_count: number;
      request_id: string | null;
      timestamp: string;
    };
    grids: Array<{
      title: string;
      rows: FinancingBatchDto[];
    }>;
  };
}
export interface FinancingMonthlyApiResponse {
  message: string;
  data: {
    metadata: {
      page_title: string;
      value_date: string;
      grid_count: number;
      request_id: string | null;
      timestamp: string;
    };
    grids: Array<{
      title: string;
      rows: FinancingMonthlyRow[];
    }>;
  };
}