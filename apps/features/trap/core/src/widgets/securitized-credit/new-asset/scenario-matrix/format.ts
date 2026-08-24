import type { AnalyticsMetric } from "./types";

/** Format an analytics value per the metric's declared format (render-only). */
export function formatMetric(value: number | undefined, metric: AnalyticsMetric): string {
    if (value === undefined || value === null || Number.isNaN(value)) return "—";
    switch (metric.format) {
        case "price":
            return value.toFixed(2);
        case "percent":
            return `${value.toFixed(2)}%`;
        case "bp":
            return `${Math.round(value)} bp`;
        case "years":
            return `${value.toFixed(2)} yrs`;
        default:
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
}

/** Compact currency for cash-flow cells. */
export function formatMoney(value: number): string {
    return `$${Math.round(value).toLocaleString()}`;
}