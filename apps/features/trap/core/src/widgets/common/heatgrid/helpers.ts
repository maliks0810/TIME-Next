import {
    ColumnDef,
    ColumnNode,
    GridRow,
    HeatRamp,
    HeatScale,
    HeatSpec,
    isRampSpec,
    RAMP_STOPS,
    SeriesToggle,
} from './types';

function deepMap(defs: ColumnDef[], fn: (d: ColumnDef) => ColumnDef): ColumnDef[] {
    return defs.map((d) => {
        const m = fn(d);
        return m.children?.length ? { ...m, children: deepMap(m.children, fn) } : m;
    });
}

export function setGrouping(catalog: ColumnDef[], orderedKeys: string[]): ColumnDef[] {
    return deepMap(catalog, (d) => {
        if (d.role !== 'dimension') return d;
        const i = orderedKeys.indexOf(d.key);
        return { ...d, groupIndex: i === -1 ? undefined : i };
    });
}

export function setMemberSelected(
    catalog: ColumnDef[],
    memberKey: string,
    selected: boolean
): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'group' && d.selectable && d.key === memberKey ? { ...d, selected } : d
    );
}

export function setSeriesOn(catalog: ColumnDef[], seriesKey: string, on: boolean): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.series?.key === seriesKey
            ? { ...d, series: { ...d.series, on } }
            : d
    );
}

export function setHiddenLeaves(catalog: ColumnDef[], hidden: ReadonlySet<string>): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' ? { ...d, visible: !hidden.has(d.key) } : d
    );
}

/** Set the color spectrum for every column on a heat scale. */
export function setHeatRamp(catalog: ColumnDef[], scale: string, ramp: HeatRamp): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.heat?.scale === scale ? { ...d, heat: { ...d.heat, ramp } } : d
    );
}

/** Set the outlier (|z|>3) cell color for every column on a heat scale. */
export function setHeatOutlierColor(
    catalog: ColumnDef[],
    scale: string,
    outlierColor: string
): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.heat?.scale === scale
            ? { ...d, heat: { ...d.heat, outlierColor } }
            : d
    );
}

/** Set the missing / no-data cell color for every column on a heat scale. */
export function setHeatMissingColor(
    catalog: ColumnDef[],
    scale: string,
    missingColor: string
): ColumnDef[] {
    return deepMap(catalog, (d) =>
        d.role === 'value' && d.heat?.scale === scale
            ? { ...d, heat: { ...d.heat, missingColor } }
            : d
    );
}

export function flattenVisibleRows(
    rows: GridRow[],
    expanded: ReadonlySet<string>,
    showLeaves: boolean,
    out: GridRow[] = []
): GridRow[] {
    for (const r of rows) {
        if (r.isLeaf && !showLeaves) continue;
        out.push(r);
        if (!r.isLeaf && expanded.has(r.key)) {
            flattenVisibleRows(r.children, expanded, showLeaves, out);
        }
    }
    return out;
}

export function collectGroupKeys(rows: GridRow[], out: string[] = []): string[] {
    for (const r of rows) {
        if (!r.isLeaf) {
            out.push(r.key);
            collectGroupKeys(r.children, out);
        }
    }
    return out;
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function lerp3(
    a: [number, number, number],
    b: [number, number, number],
    f: number
): [number, number, number] {
    return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
    ];
}

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '').trim();
    if (h.length === 3)
        h = h
            .split('')
            .map((c) => c + c)
            .join('');
    const n = parseInt(h || '000000', 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Pick black or white text for legibility on an arbitrary (user-picked) fill. */
export function readableText(hex: string): string {
    const [r, g, b] = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#15181d' : '#ffffff';
}

/** Solid rgb for position t∈[0,1] on a ramp — used by the spectrum legend and
 *  by per-cell strength shading. Handles custom begin→end specs, then presets. */
export function rampRgb(t: number, ramp: HeatRamp): [number, number, number] {
    const tt = clamp01(t);
    if (isRampSpec(ramp)) {
        const from = hexToRgb(ramp.from);
        const to = hexToRgb(ramp.to);
        if (ramp.mid) {
            const mid = hexToRgb(ramp.mid);
            return tt < 0.5 ? lerp3(from, mid, tt * 2) : lerp3(mid, to, (tt - 0.5) * 2);
        }
        return lerp3(from, to, tt);
    }
    if (ramp === 'coolwarm') {
        const mid: [number, number, number] = [232, 232, 232];
        return tt < 0.5
            ? lerp3([59, 130, 246], mid, tt * 2)
            : lerp3(mid, [239, 68, 68], (tt - 0.5) * 2);
    }
    const pts = RAMP_STOPS[ramp];
    const n = pts.length - 1;
    const seg = Math.min(n - 1e-6, tt * n);
    const i = Math.floor(seg);
    return lerp3(pts[i], pts[i + 1], seg - i);
}

/** CSS gradient (left = weak/0 → right = strong/1) for the spectrum legend. */
export function rampGradient(ramp: HeatRamp, steps = 16): string {
    const stops: string[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const [r, g, b] = rampRgb(t, ramp);
        stops.push(`rgb(${r}, ${g}, ${b}) ${Math.round(t * 100)}%`);
    }
    return `linear-gradient(90deg, ${stops.join(', ')})`;
}

/** rgba() string for a pre-normalized strength cell (data-source driven). */
export function strengthRgba(strength: number, ramp: HeatRamp): string {
    const [r, g, b] = rampRgb(strength, ramp);
    return `rgba(${r}, ${g}, ${b}, 0.55)`;
}

export function buildHeatScales(leaves: ColumnNode[], rows: GridRow[]): Record<string, HeatScale> {
    const scales: Record<string, HeatScale> = {};
    for (const c of leaves) {
        if (c.heat && !scales[c.heat]) {
            scales[c.heat] = { min: Infinity, max: -Infinity, ramp: c.heatRamp ?? 'gyor' };
        }
    }
    for (const r of rows) {
        for (const c of leaves) {
            if (!c.heat) continue;
            const v = r.values[c.key];
            if (v == null) continue;
            const s = scales[c.heat];
            if (v < s.min) s.min = v;
            if (v > s.max) s.max = v;
        }
    }
    return scales;
}

/** rgba components for a value on a scale, or null when the cell is unshaded. */
export function heatRgba(v: number, scale: HeatScale): [number, number, number, number] | null {
    const span = scale.max - scale.min;
    if (span <= 0) return null;
    const t = clamp01((v - scale.min) / span);

    if (scale.ramp === 'coolwarm') {
        const a = Math.abs(t - 0.5) * 2 * 0.32;
        if (a < 0.02) return null;
        return t < 0.5 ? [59, 130, 246, a] : [239, 68, 68, a];
    }

    // sequential ramps (gyor / ryg): fade in with magnitude
    const [r, g, b] = rampRgb(t, scale.ramp);
    return [r, g, b, 0.2 + t * 0.3];
}
/** Distinct cross-cutting series in first-appearance order — the column toggles. */
export function seriesToggles(catalog: ColumnDef[]): SeriesToggle[] {
    const out: SeriesToggle[] = [];
    forEachValue(catalog, (d) => {
        if (!d.series) return;
        if (!out.some((s) => s.key === d.series!.key)) {
            out.push({
                key: d.series.key,
                label: d.series.label,
                sub: d.series.sub,
                on: d.series.on !== false,
            });
        }
    });
    return out;
}

export function hiddenFields(catalog: ColumnDef[]): Set<string> {
    const s = new Set<string>();
    forEachValue(catalog, (d) => {
        if (d.visible === false) s.add(d.key);
    });
    return s;
}

/** Distinct heat scales in the catalog — drives the Color spectrum picker. */
export function heatScales(catalog: ColumnDef[]): HeatSpec[] {
    const out: HeatSpec[] = [];
    forEachValue(catalog, (d) => {
        if (d.heat && !out.some((s) => s.scale === d.heat!.scale)) {
            out.push({
                scale: d.heat.scale,
                label: d.heat.label,
                ramp: d.heat.ramp,
                outlierColor: d.heat.outlierColor,
                missingColor: d.heat.missingColor,
            });
        }
    });
    return out;
}
function forEachValue(defs: ColumnDef[], fn: (d: ColumnDef) => void): void {
    for (const d of defs) {
        if (d.role === 'value') fn(d);
        if (d.children?.length) forEachValue(d.children, fn);
    }
}

export function groupingDims(catalog: ColumnDef[]): ColumnDef[] {
    return catalog.filter((d) => d.role === 'dimension' && d.groupable);
}

export function activeGrouping(catalog: ColumnDef[]): ColumnDef[] {
    return groupingDims(catalog)
        .filter((d) => d.groupIndex != null)
        .sort((a, b) => a.groupIndex! - b.groupIndex!);
}

export function columnAxisGroups(catalog: ColumnDef[]): ColumnDef[] {
    return catalog.filter((d) => d.role === 'axisGroup');
}
export function renderColumns(
    catalog: ColumnDef[],
    opts: { includeHidden?: boolean } = {}
): ColumnNode[] {
    const includeHidden = opts.includeHidden ?? false;

    const leaf = (d: ColumnDef): ColumnNode | null => {
        if (d.series?.on === false) return null;
        if (!includeHidden && d.visible === false) return null;
        return {
            key: d.key,
            label: d.label,
            tooltip: d.tooltip,
            decimals: d.decimals,
            thousands: d.thousands,
            colorNegative: d.colorNegative,
            heat: d.heat?.scale,
            heatRamp: d.heat?.ramp,
            heatOutlier: d.heat?.outlierColor,
            heatMissing: d.heat?.missingColor,
        };
    };

    const group = (d: ColumnDef): ColumnNode | null => {
        const kids: ColumnNode[] = [];
        for (const c of d.children ?? []) {
            const n = c.role === 'value' ? leaf(c) : c.role === 'group' ? group(c) : null;
            if (n) kids.push(n);
        }
        if (!kids.length) return null;
        return { key: d.key, label: d.label, tooltip: d.tooltip, children: kids };
    };

    const out: ColumnNode[] = [];
    for (const d of catalog) {
        if (d.role === 'dimension') continue;
        if (d.role === 'axisGroup') {
            for (const m of d.children ?? []) {
                if (m.role !== 'group') continue;
                if (m.selectable && !m.selected) continue;
                const n = group(m);
                if (n) out.push(n);
            }
            continue;
        }
        if (d.role === 'group') {
            if (d.selectable && !d.selected) continue;
            const n = group(d);
            if (n) out.push(n);
            continue;
        }
        if (d.role === 'value') {
            const n = leaf(d);
            if (n) out.push(n);
        }
    }
    return out;
}

/* ---------------- catalog → drawer projections ---------------- */
