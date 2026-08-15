import { BrandSwatch } from '../features/landing/components/shell/ThemePanel';

export const BRAND_LIGHT: BrandSwatch[] = [
    { role: 'Primary', name: 'Blue', hex: '#013D7D' },
    { role: 'Accent', name: 'Plum', hex: '#813451' },
    { role: 'Success', name: 'Green', hex: '#4B773D' },
    { role: 'Warning', name: 'Gold', hex: '#DB9F00' },
    { role: 'Error', name: 'Data Red', hex: '#CE1F00' },
    { role: 'Text', name: 'Grey 900', hex: '#1A1A1A' },
    { role: 'Surface', name: 'White', hex: '#FFFFFF' },
    { role: 'Border', name: 'Grey 300', hex: '#E0E0E0' },
];
export const BRAND_DARK: BrandSwatch[] = [
    { role: 'Primary', name: 'Blue', hex: '#688FBD' },
    { role: 'Accent', name: 'Plum', hex: '#C06378' },
    { role: 'Success', name: 'Green', hex: '#739563' },
    { role: 'Warning', name: 'Gold', hex: '#E4BB34' },
    { role: 'Error', name: 'Data Red', hex: '#CE1F00' },
    { role: 'Text', name: 'Grey 100', hex: '#F9F9F9' },
    { role: 'Surface', name: 'Grey 1000', hex: '#0D0D0D' },
    { role: 'Border', name: 'Grey 800', hex: '#333333' },
];
export const COMMON_TOKENS = {
    fontSize: 12,
    fontSizeSM: 11,
    fontSizeLG: 12,
    lineHeight: 1.3,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
};

// Brand + ported typefaces. The named faces (Monument Grotesk / IBM Plex Sans / Albert Sans)
// aren't bundled yet, so each stack falls back to system fonts until they're loaded.
export const BRAND_FONT =
    '"Monument Grotesk", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif';
export const WEALTH_FONT = '"Albert Sans", ui-sans-serif, system-ui, sans-serif';
