import type { ExportRow, MetricKey } from "../types/alphaDashboard";
import { getMetricValue } from "./alphaDashboardHelpers";

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toCsv(rows: ExportRow[], metric: MetricKey): string {
  const headers = [
    "portfolioNumber",
    "portfolioName",
    "rank",
    metric,
    "alpha",
    "portfolioReturn",
    "netReturn",
    "nav",
    "benchmarkName",
    "performanceStatus",
    "bucket",
  ];

  const lines = [headers.join(",")];

  rows.forEach((row) => {
    const values = [
      row.portfolioNumber,
      row.portfolioName,
      row.rank,
      getMetricValue(row, metric),
      row.alpha,
      row.portfolioReturn,
      row.netReturn,
      row.nav,
      row.benchmarkName,
      row.performanceStatus,
      row.bucket,
    ].map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`);

    lines.push(values.join(","));
  });

  return lines.join("\n");
}