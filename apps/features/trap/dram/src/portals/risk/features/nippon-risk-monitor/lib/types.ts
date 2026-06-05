import { Dayjs } from 'dayjs';
export interface NipponReportsCatalogResponse {
  reports?: string[]
  reportType?: string
  folderName?: string
  reportingDate?: string
  validationReports?: string[]
  correlationId?: string
}

export type MonthRow = {
  key: number;
  month_name: string;
  total_reports: number;
  is_validated: boolean;
};

export type KpiItem = {
  title: string;
  value: number;
  suffix?: string;
  highlight?: "green" | "blue" | "default";
};

export type ReportItem = {
  name: string;
};
export type NipponKpiModel = {
  folderName: string;
  totalReports: number;
  validationReports: number;
};

export type NipponMonthSummaryRow = {
  monthName: string;
  totalReports: number;
  isValidated: boolean;
};

export type NipponMonthSummaryModel = {
  months: NipponMonthSummaryRow[];
};

export type NipponReportsRow = {
  fileName: string;
  isValidation: boolean;
};

export type NipponReportsModel = {
  folderName: string;
  reports: NipponReportsRow[];
};

export type NipponDownloadModel = {
  url: string;
};
export interface RunBuyMaintainRequest {
  portfolio: string;
  reporting_date: string;
  start_date: string;
  test_mode?: boolean;
  validate_output?: boolean;
  upload_to_azure?: boolean;
}

export interface RunReportResponse {
  success: boolean;
  message?: string;
  reportId?: string;
}
export type RunReportFormValues = {
  portfolio: string | null;
  reporting_date: Dayjs | null;
  start_date: Dayjs | null;
};
export type DownloadReportParams = {
  report_type: string;
  reporting_date: string;
  file_name?: string | null;
};
