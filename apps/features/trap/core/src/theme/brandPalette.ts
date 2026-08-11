// The TCW brand-approved palette for the custom-theme editor's "Brand" mode: the documented
// primaries with their official tint scales, neutrals, and data-viz colors — all EXACT hexes
// from TCW_brand_Guidelines.pdf (each primary listed base → lightest tint). The guideline
// publishes these tints, so any shade here is on-brand — no generated/derived colors.

export type SwatchGroup = { title: string; rows: { name?: string; hexes: string[] }[] };

// Official primary tint scales (base first, then tints toward white), verbatim from the guide.
const PRIMARY_TINTS: { name: string; hexes: string[] }[] = [
    { name: 'Blue',  hexes: ['#013D7D', '#1D518D', '#36669D', '#4F7AAD', '#688FBD', '#82A3CD', '#9BB8DD', '#B4CCE9', '#CEDFF4', '#E7F3FC'] },
    { name: 'Green', hexes: ['#4B773D', '#5F8650', '#739563', '#87A576', '#9BB489', '#AFC49C', '#C3D3AF', '#D7E2C2', '#EBF1D5', '#F6FAE8'] },
    { name: 'Plum',  hexes: ['#6C1444', '#813451', '#96435E', '#AB536B', '#C06378', '#D58C96', '#E1A5AC', '#ECC2C5', '#F4DBDD', '#FAEEF0'] },
    { name: 'Gold',  hexes: ['#DB9F00', '#E0AD1A', '#E4BB34', '#E9C94E', '#EDD768', '#F2E582', '#F6F39C', '#FAF9B6', '#FDFDCF', '#FFFEEC'] },
];

const GREYS = [
    '#FFFFFF', '#F9F9F9', '#EDEDED', '#E0E0E0', '#D4D4D4', '#B2B2B2',
    '#757575', '#4D4D4D', '#333333', '#1A1A1A', '#0D0D0D', '#000000',
];

const DATA_VIZ = ['#654D88', '#904529', '#CB197B', '#D76712', '#CE1F00'];

export const BRAND_GROUPS: SwatchGroup[] = [
    { title: 'Primaries · base → tints', rows: PRIMARY_TINTS },
    { title: 'Neutrals · Grey 100–1000', rows: [{ hexes: GREYS.slice(0, 6) }, { hexes: GREYS.slice(6) }] },
    { title: 'Data visualization', rows: [{ hexes: DATA_VIZ }] },
];

/** Every allowed brand hex (lowercased), for "is this on-brand?" checks. */
export const BRAND_HEXES: Set<string> = new Set(
    BRAND_GROUPS.flatMap((g) => g.rows.flatMap((r) => r.hexes)).map((h) => h.toLowerCase())
);

export function isBrandColor(hex: string | undefined): boolean {
    return !!hex && BRAND_HEXES.has(String(hex).toLowerCase());
}
