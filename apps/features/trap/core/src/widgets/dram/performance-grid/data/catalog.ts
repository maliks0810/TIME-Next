/** Metric + attribute catalogs. Ported verbatim from the prototype. */

export interface MetricDef {
    label: string;
    fmt: 'pct' | 'pctd' | 'bps' | 'num';
    dp: number;
    def: boolean;
    bench?: boolean;
}

/** Characteristics — shown once (left of the period groups). */
export const STATIC_METRICS: Record<string, MetricDef> = {
    // weight: { label: 'Weight %', fmt: 'pct', dp: 2, def: true },
    // benchWt: { label: 'Bench Wt', fmt: 'pct', dp: 2, def: false, bench: true },
    // activeWt: { label: 'Active Wt', fmt: 'pctd', dp: 2, def: true, bench: true },
    // beta: { label: 'Beta', fmt: 'num', dp: 2, def: true },
    // divYld: { label: 'Div Yld', fmt: 'pct', dp: 2, def: false },
    // pe: { label: 'P/E', fmt: 'num', dp: 1, def: false },
};

/** Per-period metrics — repeat under each period column group. */
export const PERIOD_METRICS: Record<string, MetricDef> = {
    retP: { label: 'Return', fmt: 'pct', dp: 2, def: true },
    benchRet: { label: 'Bench', fmt: 'pct', dp: 2, def: false, bench: true },
    activeRet: { label: 'Active', fmt: 'pctd', dp: 2, def: false, bench: true },
    contrib: { label: 'Contrib', fmt: 'bps', dp: 0, def: true },
    activeCon: { label: 'Act.Con', fmt: 'bps', dp: 0, def: true, bench: true },
};

export const PERIOD_ORDER = [
    'WTD',
    'MTD',
    'QTD',
    'YTD',
    'ITD',
    '1M',
    '3M',
    '6M',
    '1Y',
    '3Y',
    '5Y',
    '10Y',
];

/** Standard periods that have seeded data (others are disabled in the picker). */
export const HAS_DATA = new Set(PERIOD_ORDER);

/** Numeric attributes available to Band / N-tile / Conditional rules. */
export const NUM_ATTRS: Record<string, string> = {
    mktcap: 'Market Cap ($B)',
    beta: 'Beta',
    pe: 'P/E',
    divYld: 'Div Yield %',
    weight: 'Portfolio Weight %',
};
