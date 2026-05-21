import { PeriodCode } from "./periods";
import type { MetricLabel } from "./metrics";
export const referencePeriods : readonly PeriodCode[] =
 ["DAILY","MTD","QTD","YTD","1Y","2Y","3Y","4Y","5Y","6Y","7Y","8Y","9Y","10Y","15Y","20Y","SI"] as const;

export const metricShortLabels: Record<MetricLabel, string> = {
  "Port. Total Contribution": "Port. TC",
  "Bench. Total Contribution": "Bench. TC",
  "Allocation Effect": "Alloc",
  "Selection Effect": "Sel",
  "Interaction Effect": "Int",
};
