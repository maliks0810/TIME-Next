import { BASE_API } from "./endpoints";

// NEW: Build iframe URL for SSRS
export const getReportViewerUrl = (reportPath: string) => {
  // reportPath example: "/EnterpriseReports/AANA Calculation"
  return `${BASE_API}ReportProxy/view?path=${encodeURIComponent(reportPath)}`;
};
