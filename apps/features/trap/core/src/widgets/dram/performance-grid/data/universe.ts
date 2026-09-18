import { Currency, Region, Security, BenchKey, Benchmark } from '../types';
import { mulberry32 } from './mock';

/** GICS sector → { color, short label }. Ported verbatim. */
export const SECTORS: Record<string, { c: string; s: string }> = {
    'Information Technology': { c: '#2f6bff', s: 'Info Tech' },
    'Communication Services': { c: '#8b5cf6', s: 'Comm Svcs' },
    'Consumer Discretionary': { c: '#e0851b', s: 'Cons Disc' },
    'Health Care': { c: '#12a58a', s: 'Health Care' },
    Financials: { c: '#3b82c4', s: 'Financials' },
    Industrials: { c: '#8a94a6', s: 'Industrials' },
    'Consumer Staples': { c: '#6aa84f', s: 'Cons Staples' },
    Energy: { c: '#c0553b', s: 'Energy' },
    Utilities: { c: '#a0863d', s: 'Utilities' },
    Materials: { c: '#b0728f', s: 'Materials' },
    'Real Estate': { c: '#5a9ba8', s: 'Real Estate' },
};

export const shortSector = (n: string): string => SECTORS[n]?.s || n;

/** Industry → GICS industry group. */
const GGROUP: Record<string, string> = {
    'Tech Hardware': 'Tech Hardware & Equipment',
    Software: 'Software & Services',
    Semiconductors: 'Semiconductors & Equipment',
    'Interactive Media': 'Media & Entertainment',
    Entertainment: 'Media & Entertainment',
    'Broadline Retail': 'Consumer Discr. Distribution',
    Automobiles: 'Automobiles & Components',
    'Specialty Retail': 'Consumer Discr. Distribution',
    Restaurants: 'Consumer Services',
    Apparel: 'Consumer Durables & Apparel',
    'Managed Care': 'Health Care Equip. & Services',
    Pharma: 'Pharma, Biotech & Life Sci.',
    Biotech: 'Pharma, Biotech & Life Sci.',
    Banks: 'Banks',
    'Diversified Financials': 'Financial Services',
    Payments: 'Financial Services',
    Machinery: 'Capital Goods',
    'Aerospace & Defense': 'Capital Goods',
    'Industrial Conglomerates': 'Capital Goods',
    'Household Products': 'Household & Personal Prod.',
    Beverages: 'Food, Beverage & Tobacco',
    'Consumer Retail': 'Cons. Staples Distribution',
    'Packaged Foods': 'Food, Beverage & Tobacco',
    'Integrated Oil': 'Energy',
    'Electric Utilities': 'Utilities',
    'Industrial Gases': 'Materials',
    'Industrial REITs': 'Equity REITs',
};

const CCY: Record<string, Currency> = {
    'N. America': 'USD',
    Europe: 'EUR',
    'Asia Pac': 'TWD',
};

/** [id, name, sector, industry, region, mktcap, beta, divYld, pe, spxElig, worldElig] */
type URow = [
    string,
    string,
    string,
    string,
    Region,
    number,
    number,
    number,
    number,
    number,
    number,
];

const U: URow[] = [
    [
        'AAPL',
        'Apple',
        'Information Technology',
        'Tech Hardware',
        'N. America',
        3200,
        1.24,
        0.5,
        31,
        1,
        1,
    ],
    [
        'MSFT',
        'Microsoft',
        'Information Technology',
        'Software',
        'N. America',
        3100,
        0.98,
        0.7,
        34,
        1,
        1,
    ],
    [
        'NVDA',
        'NVIDIA',
        'Information Technology',
        'Semiconductors',
        'N. America',
        2900,
        1.61,
        0.03,
        42,
        1,
        1,
    ],
    [
        'AVGO',
        'Broadcom',
        'Information Technology',
        'Semiconductors',
        'N. America',
        760,
        1.18,
        1.6,
        29,
        1,
        1,
    ],
    [
        'CRM',
        'Salesforce',
        'Information Technology',
        'Software',
        'N. America',
        290,
        1.29,
        0.6,
        40,
        1,
        1,
    ],
    ['ADBE', 'Adobe', 'Information Technology', 'Software', 'N. America', 240, 1.22, 0, 33, 1, 1],
    [
        'GOOGL',
        'Alphabet',
        'Communication Services',
        'Interactive Media',
        'N. America',
        2100,
        1.05,
        0.4,
        24,
        1,
        1,
    ],
    [
        'META',
        'Meta Platforms',
        'Communication Services',
        'Interactive Media',
        'N. America',
        1250,
        1.28,
        0.4,
        26,
        1,
        1,
    ],
    [
        'NFLX',
        'Netflix',
        'Communication Services',
        'Entertainment',
        'N. America',
        290,
        1.15,
        0,
        38,
        1,
        1,
    ],
    [
        'DIS',
        'Walt Disney',
        'Communication Services',
        'Entertainment',
        'N. America',
        190,
        1.2,
        0.9,
        21,
        1,
        1,
    ],
    [
        'AMZN',
        'Amazon',
        'Consumer Discretionary',
        'Broadline Retail',
        'N. America',
        1900,
        1.19,
        0,
        40,
        1,
        1,
    ],
    [
        'TSLA',
        'Tesla',
        'Consumer Discretionary',
        'Automobiles',
        'N. America',
        820,
        2.05,
        0,
        58,
        1,
        1,
    ],
    [
        'HD',
        'Home Depot',
        'Consumer Discretionary',
        'Specialty Retail',
        'N. America',
        360,
        1.02,
        2.4,
        24,
        1,
        1,
    ],
    [
        'MCD',
        "McDonald's",
        'Consumer Discretionary',
        'Restaurants',
        'N. America',
        210,
        0.72,
        2.3,
        25,
        1,
        1,
    ],
    ['NKE', 'Nike', 'Consumer Discretionary', 'Apparel', 'N. America', 120, 1.1, 1.8, 22, 1, 1],
    ['UNH', 'UnitedHealth', 'Health Care', 'Managed Care', 'N. America', 470, 0.62, 1.6, 18, 1, 1],
    ['JNJ', 'Johnson & Johnson', 'Health Care', 'Pharma', 'N. America', 380, 0.55, 3.0, 15, 1, 1],
    ['LLY', 'Eli Lilly', 'Health Care', 'Pharma', 'N. America', 760, 0.48, 0.6, 58, 1, 1],
    ['PFE', 'Pfizer', 'Health Care', 'Pharma', 'N. America', 160, 0.63, 5.8, 11, 1, 1],
    ['ABBV', 'AbbVie', 'Health Care', 'Biotech', 'N. America', 310, 0.58, 3.4, 17, 1, 1],
    ['JPM', 'JPMorgan Chase', 'Financials', 'Banks', 'N. America', 610, 1.11, 2.1, 13, 1, 1],
    ['BAC', 'Bank of America', 'Financials', 'Banks', 'N. America', 300, 1.3, 2.5, 12, 1, 1],
    [
        'BRK.B',
        'Berkshire Hathaway',
        'Financials',
        'Diversified Financials',
        'N. America',
        920,
        0.86,
        0,
        22,
        1,
        1,
    ],
    ['V', 'Visa', 'Financials', 'Payments', 'N. America', 560, 0.96, 0.7, 29, 1, 1],
    ['MA', 'Mastercard', 'Financials', 'Payments', 'N. America', 430, 1.04, 0.5, 33, 1, 1],
    ['CAT', 'Caterpillar', 'Industrials', 'Machinery', 'N. America', 170, 1.08, 1.5, 17, 1, 1],
    ['BA', 'Boeing', 'Industrials', 'Aerospace & Defense', 'N. America', 130, 1.42, 0, 45, 1, 1],
    [
        'HON',
        'Honeywell',
        'Industrials',
        'Industrial Conglomerates',
        'N. America',
        140,
        1.01,
        2.0,
        22,
        1,
        1,
    ],
    [
        'GE',
        'GE Aerospace',
        'Industrials',
        'Aerospace & Defense',
        'N. America',
        190,
        1.16,
        0.6,
        35,
        1,
        1,
    ],
    [
        'PG',
        'Procter & Gamble',
        'Consumer Staples',
        'Household Products',
        'N. America',
        390,
        0.42,
        2.4,
        26,
        1,
        1,
    ],
    ['KO', 'Coca-Cola', 'Consumer Staples', 'Beverages', 'N. America', 280, 0.58, 2.9, 24, 1, 1],
    ['PEP', 'PepsiCo', 'Consumer Staples', 'Beverages', 'N. America', 230, 0.52, 3.1, 22, 1, 1],
    [
        'COST',
        'Costco',
        'Consumer Staples',
        'Consumer Retail',
        'N. America',
        400,
        0.8,
        0.5,
        52,
        1,
        1,
    ],
    ['XOM', 'Exxon Mobil', 'Energy', 'Integrated Oil', 'N. America', 480, 0.88, 3.3, 13, 1, 1],
    ['CVX', 'Chevron', 'Energy', 'Integrated Oil', 'N. America', 280, 0.94, 4.1, 14, 1, 1],
    [
        'NEE',
        'NextEra Energy',
        'Utilities',
        'Electric Utilities',
        'N. America',
        150,
        0.54,
        2.8,
        20,
        1,
        1,
    ],
    ['LIN', 'Linde', 'Materials', 'Industrial Gases', 'N. America', 220, 0.86, 1.3, 31, 1, 1],
    ['PLD', 'Prologis', 'Real Estate', 'Industrial REITs', 'N. America', 110, 1.04, 3.2, 36, 1, 1],
    [
        'ASML',
        'ASML Holding',
        'Information Technology',
        'Semiconductors',
        'Europe',
        340,
        1.25,
        0.9,
        38,
        0,
        1,
    ],
    ['NESN', 'Nestlé', 'Consumer Staples', 'Packaged Foods', 'Europe', 250, 0.45, 3.2, 19, 0, 1],
    ['NVO', 'Novo Nordisk', 'Health Care', 'Pharma', 'Europe', 380, 0.61, 1.3, 30, 0, 1],
    [
        'TSM',
        'Taiwan Semiconductor',
        'Information Technology',
        'Semiconductors',
        'Asia Pac',
        790,
        1.2,
        1.4,
        25,
        0,
        0,
    ],
    ['SHEL', 'Shell', 'Energy', 'Integrated Oil', 'Europe', 210, 0.9, 3.9, 11, 0, 1],
    ['SAP', 'SAP SE', 'Information Technology', 'Software', 'Europe', 280, 1.02, 1.0, 44, 0, 1],
];

export const SECS: Security[] = U.map((r, i) => {
    const s: Security = {
        id: r[0],
        name: r[1],
        sector: r[2],
        industry: r[3],
        region: r[4],
        mktcap: r[5],
        beta: r[6],
        divYld: r[7],
        pe: r[8],
        spxElig: !!r[9],
        worldElig: !!r[10],
        idx: i,
        gicsGroup: GGROUP[r[3]] || r[2],
        currency: CCY[r[4]] || 'USD',
        ret: {},
    };
    return s;
});

// Seed deterministic YTD/QTD/MTD returns (ported verbatim — seed 99).
(function seedReturns() {
    const rnd = mulberry32(99);
    const sm: Record<string, number> = {};
    Object.keys(SECTORS).forEach((s) => (sm[s] = rnd() * 2 - 1));
    SECS.forEach((s) => {
        const g = rnd();
        const b = s.beta;
        s.ret.YTD = +(9.5 * b * 0.5 + sm[s.sector] * 9 + (g * 2 - 1) * 11).toFixed(2);
        s.ret.QTD = +(3.0 * b * 0.5 + sm[s.sector] * 4 + (rnd() * 2 - 1) * 6).toFixed(2);
        s.ret.MTD = +(1.4 * b * 0.5 + sm[s.sector] * 2 + (rnd() * 2 - 1) * 3.5).toFixed(2);
    });
})();

// Seed the remaining standard periods too (separate RNG so MTD/QTD/YTD are untouched).
// FACTORS ≈ each period's cumulative return magnitude (YTD ≈ 9.5).
(function seedMorePeriods() {
    const rnd = mulberry32(151);
    const sm: Record<string, number> = {};
    Object.keys(SECTORS).forEach((s) => (sm[s] = rnd() * 2 - 1));
    const FACTORS: Record<string, number> = {
        WTD: 0.4,
        '1M': 1.4,
        '3M': 3.2,
        '6M': 6,
        '1Y': 12,
        ITD: 38,
        '3Y': 30,
        '5Y': 55,
        '10Y': 120,
    };
    SECS.forEach((s) => {
        const b = s.beta;
        for (const p in FACTORS) {
            const f = FACTORS[p];
            s.ret[p] = +(
                f * b * 0.5 +
                sm[s.sector] * (f * 0.9) +
                (rnd() * 2 - 1) * (f * 1.1)
            ).toFixed(2);
        }
    });
})();

export const BENCH: Record<BenchKey, Benchmark> = {
    SPX: { key: 'SPX', name: 'S&P 500', elig: (s) => s.spxElig },
    R1G: {
        key: 'R1G',
        name: 'Russell 1000 Growth',
        elig: (s) =>
            s.spxElig &&
            (s.pe >= 26 ||
                [
                    'Information Technology',
                    'Consumer Discretionary',
                    'Communication Services',
                ].includes(s.sector)),
    },
    MSCI: { key: 'MSCI', name: 'MSCI World', elig: (s) => s.worldElig },
    EAFE: { key: 'EAFE', name: 'MSCI EAFE', elig: (s) => s.region !== 'N. America' },
};

const BCACHE: Partial<Record<BenchKey, Map<string, number>>> = {};

/** Cap-weighted benchmark weights (%), memoized. */
export function benchWeights(bk: BenchKey): Map<string, number> {
    const cached = BCACHE[bk];
    if (cached) return cached;
    const pool = SECS.filter(BENCH[bk].elig);
    const tot = pool.reduce((a, s) => a + s.mktcap, 0) || 1;
    const m = new Map<string, number>();
    pool.forEach((s) => m.set(s.id, +((s.mktcap / tot) * 100).toFixed(3)));
    return (BCACHE[bk] = m);
}
