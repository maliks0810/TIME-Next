import type { BreakdownLevel } from './types';
import { NUM_ATTRS } from './catalog';

/** Rotating palette for band/rule-group swatches (ported). */
export const PALETTE = [
    '#2f6bff',
    '#12a58a',
    '#e0851b',
    '#8b5cf6',
    '#c0553b',
    '#6aa84f',
    '#3b82c4',
    '#b0728f',
    '#a0863d',
    '#8a94a6',
];

export const nextColor = (c: string): string => PALETTE[(PALETTE.indexOf(c) + 1) % PALETTE.length];

/** Default config when a level's grouping class is chosen (ported verbatim). */
export function defaultConfig(cls: BreakdownLevel['cls']): BreakdownLevel['config'] {
    if (cls === 'attribute') return { field: 'Default', label: 'Default' };
    if (cls === 'band')
        return {
            attr: 'pe',
            unmatched: 'bucket',
            bands: [
                { label: 'Value ≤15', op: '≤', val: 15, color: '#12a58a' },
                { label: 'Core 15–25', op: 'between', val: 15, val2: 25, color: '#2f6bff' },
                { label: 'Growth >25', op: '>', val: 25, color: '#e0851b' },
            ],
        };
    if (cls === 'ntile') return { attr: 'mktcap', n: 5, dir: 'desc' };
    if (cls === 'conditional')
        return {
            unmatched: 'bucket',
            groups: [
                {
                    name: 'High-Beta Tech',
                    color: '#2f6bff',
                    rules: [
                        { attr: 'sector', op: '=', val: 'Information Technology', join: 'AND' },
                        { attr: 'beta', op: '>', val: 1.2 },
                    ],
                },
                {
                    name: 'Defensive',
                    color: '#12a58a',
                    rules: [{ attr: 'beta', op: '<', val: 0.8 }],
                },
                {
                    name: 'High Yield',
                    color: '#e0851b',
                    rules: [{ attr: 'divYld', op: '≥', val: 3 }],
                },
            ],
        };
    return {} as BreakdownLevel['config'];
}

/** Long-form summary for a level (shown in the level card). */
export function levelSummary(level: BreakdownLevel): string {
    if (level.cls === 'attribute') return 'Attribute · ' + level.config.label;
    if (level.cls === 'band')
        return (
            'Range/Band · ' +
            NUM_ATTRS[level.config.attr] +
            ' · ' +
            level.config.bands.length +
            ' bands'
        );
    if (level.cls === 'ntile')
        return (
            'N-tile · ' +
            ({ 4: 'Quartile', 5: 'Quintile', 10: 'Decile' } as Record<number, string>)[
                level.config.n
            ] +
            ' by ' +
            NUM_ATTRS[level.config.attr]
        );
    if (level.cls === 'conditional')
        return 'Conditional · ' + level.config.groups.length + ' groups';
    return '';
}

export function levelLabelShort(level: BreakdownLevel): string {
    if (level.cls === 'attribute') return level.config.label;
    if (level.cls === 'band') return 'Bands: ' + NUM_ATTRS[level.config.attr].split(' ')[0];
    if (level.cls === 'ntile')
        return (
            ({ 4: 'Quartile', 5: 'Quintile', 10: 'Decile' } as Record<number, string>)[
                level.config.n
            ] +
            ' ' +
            NUM_ATTRS[level.config.attr].split(' ')[0]
        );
    if (level.cls === 'conditional') return 'Rules';
    if (level.cls === 'taxonomy') return `${level.config.label} · ${level.config.level}`;
    return '';
}
/** Compute a custom period's synthetic scaling factor (ported). */
export function computeFactor(cp: {
    kind: string;
    unit?: string;
    dur?: number | string;
    start?: string;
    end?: string;
}): number {
    if (cp.kind === 'itd') return 3.2;
    let days = 182;
    if (cp.kind === 'trailing') {
        const u = ({ D: 1, M: 30, Y: 365 } as Record<string, number>)[cp.unit || 'M'] || 30;
        days = +(cp.dur || 1) * u;
    } else if (cp.kind === 'range') {
        const a = Date.parse(cp.start || '');
        const b = Date.parse(cp.end || '');
        if (!isNaN(a) && !isNaN(b) && b > a) days = (b - a) / 86400000;
    }
    return Math.max(0.2, Math.min(4, days / 182));
}
