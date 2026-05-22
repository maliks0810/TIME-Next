export const metricKeyMap = {
  "Port. Total Contribution": "PFContToRet",
  "Bench. Total Contribution": "BMContToRet",
  "Allocation Effect": "AllocEffect",
  "Selection Effect": "SelectEffect",
  "Interaction Effect": "InterEffect",
} as const;

export type MetricLabel = keyof typeof metricKeyMap;

/** Runtime-safe narrowing from AntD Checkbox values */
export function isMetricLabel(v: unknown): v is MetricLabel {
  return typeof v === "string" && v in metricKeyMap;
}