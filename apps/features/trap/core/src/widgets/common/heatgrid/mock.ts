import type { DimensionDef, GridRow } from '../heatgrid/types';
import { dimensionMapOf } from '../heatgrid/types';

/**
 * Mock air-quality service for the generic-grid demo: monthly mean US EPA AQI
 * per country, rolled up server-side by the requested grouping — same contract
 * shape as the attribution service. AQI maps naturally onto the green → yellow
 * → orange → red heat ramp (50 good · 100 moderate · 150+ unhealthy).
 */

export const AQI_DIMENSIONS: DimensionDef[] = [
    { key: 'continent', label: 'Continent', shortLabel: 'Continent' },
    { key: 'subregion', label: 'Subregion', shortLabel: 'Subregion' },
    {
        key: 'income',
        label: 'Income Group',
        shortLabel: 'Income',
        order: ['High', 'Upper-middle', 'Lower-middle', 'Low'],
    },
];

// [name, continent, subregion, income group, annual base AQI, seasonal amplitude, peak month]
type CountryDef = [string, string, string, string, number, number, number];

const COUNTRIES: CountryDef[] = [
    // South Asia — winter inversion smog
    ['India', 'Asia', 'South Asia', 'Lower-middle', 155, 75, 12],
    ['Pakistan', 'Asia', 'South Asia', 'Lower-middle', 160, 70, 12],
    ['Bangladesh', 'Asia', 'South Asia', 'Lower-middle', 158, 78, 1],
    ['Nepal', 'Asia', 'South Asia', 'Lower-middle', 130, 60, 1],
    ['Sri Lanka', 'Asia', 'South Asia', 'Lower-middle', 75, 25, 2],
    // East Asia
    ['China', 'Asia', 'East Asia', 'Upper-middle', 110, 45, 1],
    ['Mongolia', 'Asia', 'East Asia', 'Lower-middle', 95, 90, 1],
    ['South Korea', 'Asia', 'East Asia', 'High', 85, 35, 3],
    ['Japan', 'Asia', 'East Asia', 'High', 45, 12, 3],
    // Southeast Asia — burning seasons / haze
    ['Thailand', 'Asia', 'Southeast Asia', 'Upper-middle', 95, 55, 3],
    ['Vietnam', 'Asia', 'Southeast Asia', 'Lower-middle', 95, 40, 1],
    ['Indonesia', 'Asia', 'Southeast Asia', 'Upper-middle', 90, 40, 9],
    ['Malaysia', 'Asia', 'Southeast Asia', 'Upper-middle', 75, 35, 9],
    ['Singapore', 'Asia', 'Southeast Asia', 'High', 55, 25, 9],
    ['Philippines', 'Asia', 'Southeast Asia', 'Lower-middle', 60, 15, 4],
    // Middle East — summer dust
    ['Iraq', 'Asia', 'Middle East', 'Upper-middle', 125, 50, 7],
    ['Saudi Arabia', 'Asia', 'Middle East', 'High', 110, 40, 7],
    ['United Arab Emirates', 'Asia', 'Middle East', 'High', 105, 35, 7],
    ['Iran', 'Asia', 'Middle East', 'Upper-middle', 105, 40, 12],
    ['Qatar', 'Asia', 'Middle East', 'High', 100, 35, 7],
    // Africa
    ['Egypt', 'Africa', 'North Africa', 'Lower-middle', 115, 35, 6],
    ['Morocco', 'Africa', 'North Africa', 'Lower-middle', 70, 20, 7],
    ['Nigeria', 'Africa', 'Sub-Saharan Africa', 'Lower-middle', 95, 45, 1],
    ['Senegal', 'Africa', 'Sub-Saharan Africa', 'Lower-middle', 90, 45, 2],
    ['Ghana', 'Africa', 'Sub-Saharan Africa', 'Lower-middle', 85, 40, 1],
    ['South Africa', 'Africa', 'Sub-Saharan Africa', 'Upper-middle', 70, 30, 7],
    ['Ethiopia', 'Africa', 'Sub-Saharan Africa', 'Low', 65, 20, 12],
    ['Kenya', 'Africa', 'Sub-Saharan Africa', 'Lower-middle', 60, 15, 8],
    // Europe
    ['Poland', 'Europe', 'Eastern Europe', 'High', 75, 45, 1],
    ['Türkiye', 'Europe', 'Eastern Europe', 'Upper-middle', 80, 30, 1],
    ['Italy', 'Europe', 'Southern Europe', 'High', 60, 25, 1],
    ['Greece', 'Europe', 'Southern Europe', 'High', 55, 20, 7],
    ['Spain', 'Europe', 'Southern Europe', 'High', 45, 15, 7],
    ['Germany', 'Europe', 'Western Europe', 'High', 45, 15, 2],
    ['France', 'Europe', 'Western Europe', 'High', 45, 15, 2],
    ['Netherlands', 'Europe', 'Western Europe', 'High', 42, 12, 2],
    ['United Kingdom', 'Europe', 'Western Europe', 'High', 40, 12, 1],
    ['Norway', 'Europe', 'Northern Europe', 'High', 25, 8, 1],
    // North America
    ['Mexico', 'North America', 'Central America & Caribbean', 'Upper-middle', 85, 30, 4],
    ['Guatemala', 'North America', 'Central America & Caribbean', 'Upper-middle', 75, 30, 4],
    ['United States', 'North America', 'Northern America', 'High', 48, 18, 8],
    ['Cuba', 'North America', 'Central America & Caribbean', 'Upper-middle', 45, 10, 7],
    ['Canada', 'North America', 'Northern America', 'High', 35, 22, 7],
    // South America — dry-season burning
    ['Peru', 'South America', 'South America', 'Upper-middle', 85, 25, 6],
    ['Chile', 'South America', 'South America', 'High', 80, 45, 6],
    ['Bolivia', 'South America', 'South America', 'Lower-middle', 70, 35, 9],
    ['Brazil', 'South America', 'South America', 'Upper-middle', 60, 35, 9],
    ['Colombia', 'South America', 'South America', 'Upper-middle', 55, 15, 3],
    ['Argentina', 'South America', 'South America', 'Upper-middle', 50, 18, 6],
    // Oceania
    ['Australia', 'Oceania', 'Oceania', 'High', 35, 20, 12],
    ['New Zealand', 'Oceania', 'Oceania', 'High', 22, 8, 7],
    ['Fiji', 'Oceania', 'Oceania', 'Upper-middle', 20, 5, 8],
];

const MONTH_KEYS = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12'];

function hashString(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function monthly(def: CountryDef): Record<string, number | null> {
    const [name, , , , base, amp, peak] = def;
    const values: Record<string, number | null> = {};
    let sum = 0;
    for (let m = 1; m <= 12; m++) {
        // One-sided seasonal bump concentrated around the peak month.
        const phase = Math.cos(((m - peak) * 2 * Math.PI) / 12);
        const bump = Math.max(0, phase) ** 1.5;
        const noise = ((hashString(`${name}|${m}`) % 1000) / 1000 - 0.5) * base * 0.12;
        const v = Math.max(8, Math.round(base - amp * 0.35 + amp * bump + noise));
        values[`m${m}`] = v;
        sum += v;
    }
    values.avg = Math.round(sum / 12);
    return values;
}

const VALUE_KEYS = [...MONTH_KEYS, 'avg'];

function meanValues(rows: GridRow[]): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    for (const k of VALUE_KEYS) {
        let sum = 0;
        let n = 0;
        for (const r of rows) {
            const v = r.values[k];
            if (v != null) {
                sum += v;
                n++;
            }
        }
        out[k] = n > 0 ? Math.round(sum / n) : null;
    }
    return out;
}

export interface AirQualityResponse {
    roots: GridRow[];
    total: GridRow;
    countryCount: number;
    tookMs: number;
}

export async function fetchAirQuality(groupBy: string[]): Promise<AirQualityResponse> {
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 90 + Math.random() * 120));

    const dims = dimensionMapOf(AQI_DIMENSIONS);
    const attrsOf = (c: CountryDef): Record<string, string> => ({
        continent: c[1],
        subregion: c[2],
        income: c[3],
    });

    const leaf = (c: CountryDef, depth: number): GridRow => ({
        key: `country:${c[0]}`,
        label: c[0],
        depth,
        isLeaf: true,
        leafCount: 1,
        children: [],
        values: monthly(c),
    });

    const build = (
        list: CountryDef[],
        level: number,
        parentKey: string,
        depth: number
    ): GridRow[] => {
        if (level >= groupBy.length) {
            return [...list].sort((a, b) => a[0].localeCompare(b[0])).map((c) => leaf(c, depth));
        }
        const dim = dims[groupBy[level]];
        if (!dim) return build(list, level + 1, parentKey, depth);
        const buckets = new Map<string, CountryDef[]>();
        for (const c of list) {
            const value = attrsOf(c)[dim.key] ?? 'Unclassified';
            let members = buckets.get(value);
            if (!members) {
                members = [];
                buckets.set(value, members);
            }
            members.push(c);
        }
        const nodes: GridRow[] = [];
        for (const [value, members] of buckets) {
            const key = `${parentKey}/${dim.key}:${value}`;
            nodes.push({
                key,
                label: value,
                depth,
                isLeaf: false,
                leafCount: members.length,
                children: build(members, level + 1, key, depth + 1),
                values: meanValues(members.map((c) => leaf(c, 0))),
            });
        }
        if (dim.order) {
            const idx = (l: string) => {
                const i = dim.order!.indexOf(l);
                return i === -1 ? dim.order!.length : i;
            };
            nodes.sort((a, b) => idx(a.label) - idx(b.label));
        } else {
            nodes.sort((a, b) => a.label.localeCompare(b.label));
        }
        return nodes;
    };

    const roots = build(COUNTRIES, 0, 'root', 0);
    const total: GridRow = {
        key: '__total',
        label: 'Global',
        depth: 0,
        isLeaf: false,
        leafCount: COUNTRIES.length,
        children: [],
        values: meanValues(COUNTRIES.map((c) => leaf(c, 0))),
    };

    return {
        roots,
        total,
        countryCount: COUNTRIES.length,
        tookMs: Math.round(performance.now() - t0),
    };
}

export const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
