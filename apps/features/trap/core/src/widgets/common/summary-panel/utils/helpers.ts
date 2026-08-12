/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SummaryMetric {
    key: string;
    label: string;
    value: string;
    unit?: string;
    accent?: boolean;
}

export interface NormalisedSummary {
    eyebrow: string;
    dealName: string | null;
    collateralType: string | null;
    asOf: string | null;
    metrics: SummaryMetric[];
}

function str(v: unknown): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s.length ? s : null;
}

export function normaliseSummary(result: any): NormalisedSummary | null {
    // Only a truly absent result yields null (nothing to render at all).
    if (!result) return null;

    const rawMetrics: any[] = Array.isArray(result.metrics) ? result.metrics : [];

    const metrics: SummaryMetric[] = rawMetrics
        .map((m, i) => {
            const value = str(m?.value);
            if (value === null) return null;
            return {
                key: str(m?.key) ?? `metric_${i}`,
                label: str(m?.label) ?? '',
                value,
                unit: str(m?.unit) ?? undefined,
                accent: Boolean(m?.accent),
            } as SummaryMetric;
        })
        .filter((m): m is SummaryMetric => m !== null);

    // Preserve the envelope even when metrics is empty, so the eyebrow (title)
    // renders on initial/empty — GraphQL-driven, consistent with ChartWidget.
    return {
        eyebrow: str(result.eyebrow) ?? str(result.title) ?? '',
        dealName: str(result.dealName),
        collateralType: str(result.collateralType),
        asOf: str(result.asOf),
        metrics,
    };
}