// WCAG 2.1 contrast math (ported from the Credit Research Portal). Used by the custom-theme
// editor to validate text/accent legibility. AA thresholds: 4.5:1 normal text, 3:1 large/bold.

export type RGBA = { r: number; g: number; b: number; a: number };

const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 };

/** Parse #hex (3/4/6/8) or rgb()/rgba() into an RGBA. Returns null if unparseable. */
export function parseColor(input: string | undefined): RGBA | null {
    if (!input) return null;
    const s = String(input).trim();
    const hex = s.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
        let h = hex[1];
        if (h.length === 3 || h.length === 4)
            h = h
                .split('')
                .map((c) => c + c)
                .join('');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    }
    const rgb = s.match(/^rgba?\(([^)]+)\)$/i);
    if (rgb) {
        const parts = rgb[1].split(',').map((p) => p.trim());
        if (parts.length < 3) return null;
        return {
            r: +parts[0],
            g: +parts[1],
            b: +parts[2],
            a: parts[3] !== undefined ? +parts[3] : 1,
        };
    }
    return null;
}

/** Alpha-composite a foreground over an (assumed opaque) background. */
export function composite(fg: RGBA, bg: RGBA): RGBA {
    const a = fg.a + bg.a * (1 - fg.a);
    const mix = (f: number, b: number) => Math.round((f * fg.a + b * bg.a * (1 - fg.a)) / (a || 1));
    return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a };
}

function channel(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance. */
export function luminance({ r, g, b }: RGBA): number {
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio (1–21) between two opaque colors. */
export function contrastRatio(c1: RGBA, c2: RGBA): number {
    const l1 = luminance(c1);
    const l2 = luminance(c2);
    const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
}

/**
 * Contrast ratio of a foreground token over a background token, resolving any alpha by
 * compositing over the background (and the background over white). Returns null if unparseable.
 */
export function ratioOf(fg: string, bg: string): number | null {
    const bgc = parseColor(bg);
    const fgc = parseColor(fg);
    if (!bgc || !fgc) return null;
    const bgSolid = bgc.a >= 1 ? bgc : composite(bgc, WHITE);
    const fgSolid = fgc.a >= 1 ? fgc : composite(fgc, bgSolid);
    return contrastRatio(fgSolid, bgSolid);
}

export type ContrastPair = {
    key: string;
    label: string;
    fg: string; // token key
    bg: string; // token key
    large?: boolean; // large/bold text → 3:1 threshold
};

/** The pairs the editor validates for a theme's token map. */
export const CONTRAST_PAIRS: ContrastPair[] = [
    { key: 'text-surface', label: 'Text on surface', fg: 'colorTextBase', bg: 'colorBgContainer' },
    { key: 'text-page', label: 'Text on page', fg: 'colorTextBase', bg: 'colorBgLayout' },
    {
        key: 'primary-surface',
        label: 'Primary on surface',
        fg: 'colorPrimary',
        bg: 'colorBgContainer',
        large: true,
    },
    { key: 'error-surface', label: 'Error on surface', fg: 'colorError', bg: 'colorBgContainer', large: true },
];

export type PairResult = {
    key: string;
    label: string;
    ratio: number;
    threshold: number;
    pass: boolean;
    measurable: boolean;
};

/** Evaluate all contrast pairs against a token map. */
export function evaluatePairs(tokens: Record<string, unknown>): PairResult[] {
    return CONTRAST_PAIRS.map((p) => {
        const threshold = p.large ? 3 : 4.5;
        const ratio = ratioOf(String(tokens[p.fg] ?? ''), String(tokens[p.bg] ?? ''));
        if (ratio == null) {
            return { key: p.key, label: p.label, ratio: 0, threshold, pass: false, measurable: false };
        }
        return {
            key: p.key,
            label: p.label,
            ratio,
            threshold,
            pass: ratio >= threshold,
            measurable: true,
        };
    });
}
