import type { DriverAnalysisFormState, DriverAnalysisResult, DriverRow } from "./driverTypes";

const formatMetric = (value: number, format: string): string => {
  if (format === "bps") return `${(value * 10000).toFixed(2)} bps`;
  if (format === "percent") return `${(value * 100).toFixed(2)}%`;
  if (format === "usd") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return value.toFixed(6);
};

const sampleDrivers = [
  "Technology",
  "Financials",
  "Health Care",
  "Energy",
  "Consumer Discretionary",
  "Industrials",
  "Communication Services",
  "Utilities"
];

export async function runDriverAnalysis(request: DriverAnalysisFormState): Promise<DriverAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const rows: DriverRow[] = [];

  request.periods.forEach((period, periodIndex) => {
    sampleDrivers.forEach((driver, index) => {
      const direction = index < 4 ? "top" : "bottom";
      const sign = direction === "top" ? 1 : -1;
      const base = (8 - index) * 0.00045;
      const periodMultiplier = 1 + periodIndex * 0.35;
      const metricValue = sign * base * periodMultiplier;

      rows.push({
        key: `${period}-${direction}-${driver}`,
        period,
        direction,
        rank: direction === "top" ? index + 1 : index - 3,
        driverName: driver,
        metricName: request.metric.name,
        metricLabel: request.metric.label,
        metricValue,
        metricDisplay: formatMetric(metricValue, request.metric.format),
        allocationEffect: metricValue * 0.25,
        selectionEffect: metricValue * 0.6,
        interactionEffect: metricValue * 0.15,
        portfolioContribution: metricValue * 1.3,
        benchmarkContribution: metricValue * 0.7,
        activeContribution: metricValue
      });
    });
  });

  return {
    runId: `DRV-${Date.now()}`,
    portfolioId: request.portfolioId,
    asOfDate: request.asOfDate,
    periods: request.periods,
    groupBy: request.groupBy,
    metric: request.metric,
    topDrivers: rows.filter((x) => x.direction === "top"),
    bottomDrivers: rows.filter((x) => x.direction === "bottom"),
    summary: {
      status: "Completed",
      inputRows: 2480,
      filteredRows: 2164,
      topCount: rows.filter((x) => x.direction === "top").length,
      bottomCount: rows.filter((x) => x.direction === "bottom").length,
      durationMs: 451,
      warnings: request.datasetSource.type === "endpoint" ? ["Endpoint dataset was validated successfully before analysis."] : []
    }
  };
}
