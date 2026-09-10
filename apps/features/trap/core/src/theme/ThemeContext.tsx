/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { theme as antdTheme, type ThemeConfig } from 'antd';
import type { CustomTheme } from './customThemes';
import { ThemeFamily, ThemeName } from './types';
import { BRAND_FONT, COMMON_TOKENS, WEALTH_FONT } from './constants';

export const THEME_FAMILIES: ThemeFamily[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'TCW brand — navy, grey & white',
        group: 'Core',
        modes: { light: 'default', dark: 'dark' },
    },
    {
        id: 'wealth',
        name: 'Wealth',
        description: 'Warm gold, serif accents',
        group: 'Specialty',
        modes: { light: 'wealthLight', dark: 'wealthDark' },
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Neon magenta on black',
        group: 'Specialty',
        modes: { dark: 'cyberpunk' },
    },
    {
        id: 'dreamy',
        name: 'Dreamy',
        description: 'Soft orchid pastels',
        group: 'Specialty',
        modes: { light: 'dreamy' },
    },
    {
        id: 'dumpsterFire',
        name: 'Dumpster Fire',
        description: 'Charred orange chaos',
        group: 'Specialty',
        modes: { dark: 'dumpsterFire' },
    },
];

export type ThemeSurfaceMeta = {
    hudGradient: string;
    hudGlow: string;
    accentGradient: string;
    widgetBorderGradient: string;
    isGradientTheme: boolean;
    appBackground: string;
};

export const THEME_OPTIONS: Array<{ value: ThemeName; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'dark', label: 'Dark' },
    { value: 'holiday', label: 'Holiday' },

    { value: 'ocean', label: 'Ocean' },
    { value: 'sunset', label: 'Sunset' },
    { value: 'forest', label: 'Forest' },

    { value: 'neonMint', label: 'Neon Mint' },
    { value: 'vaporwave', label: 'Vaporwave' },
    { value: 'neonGlow', label: 'Neon Glow' },

    { value: 'solarizedLight', label: 'Solarized Light' },
    { value: 'solarizedDark', label: 'Solarized Dark' },

    { value: 'plumGradient', label: 'Plum Gradient' },
    { value: 'goldGradient', label: 'Gold Gradient' },
    { value: 'greenGradient', label: 'Green Gradient' },
    { value: 'blueGradient', label: 'Blue Gradient' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'matrix', label: 'Matrix' },
    { value: 'dreamy', label: 'Dream, Yo' },
    { value: 'ink', label: 'Ink Sketch' },
    { value: 'dumpsterFire', label: 'Dumpster Fire' },
];

// themeName is a string now: a built-in ThemeName OR a "custom-…" id. Custom themes + live
// preview live here so the drawer editor and the app stay in sync.
// A live preview carries not just the antd config + page background but its IDENTITY (themeName),
// so anything keyed off themeName (surface-meta gradients, data-theme, dark-HUD) reflects the
// draft too — otherwise the previously-active theme's gradients leak onto the preview.
export type PreviewTheme = { config: ThemeConfig; appBackground: string; themeName: string } | null;
export type ThemeContextValue = {
    themeName: string;
    setTheme: (t: string) => void;
    customThemes: CustomTheme[];
    upsertCustomTheme: (t: CustomTheme) => void;
    deleteCustomTheme: (id: string) => void;
    setPreview: (p: PreviewTheme) => void;
};
export const ThemeContext = React.createContext<ThemeContextValue>({
    themeName: 'default',
    setTheme: () => { },
    customThemes: [],
    upsertCustomTheme: () => { },
    deleteCustomTheme: () => { },
    setPreview: () => { },
});

export function useTheme() {
    return React.useContext(ThemeContext);
}

const makeSubtleAppBackground = ({ base, glow }: { base: string; glow?: string }) =>
    glow
        ? `radial-gradient(circle at top left, ${glow} 0%, rgba(255,255,255,0) 34%), ${base}`
        : base;

export function getThemeConfig(themeName: ThemeName) {
    switch (themeName) {
        // ── TCW brand Default (light) — every value is an EXACT hex from the TCW_brand_Guidelines.pdf
        //    tint scales (the guide publishes a tint ramp per primary, so tints are on-brand too).
        //    Blue #013D7D (identity) · gold #DB9F00 (warning) · data-red #CE1F00 (error) at base.
        //    Plum accent uses the one-step-lighter brand tint #813451; green stays at base #4B773D
        //    (its next tint #5F8650 drops small rating text below AA).
        //
        //    Status-chip backgrounds/borders use the LIGHTEST brand tints (antd's own derivation ran
        //    too dark/grey for these desaturated seeds). Result — rating pills read as light chips
        //    with strong contrast: plum #813451 on #FAEEF0 ≈ 7.3:1, green #4B773D on #F6FAE8 ≈ 4.8:1.
        case 'default':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#013D7D',
                    colorInfo: '#813451',
                    colorSuccess: '#4B773D',
                    colorWarning: '#DB9F00',
                    colorError: '#CE1F00',

                    // Lightest brand tints (see note) — used by Tag/Alert + the NA-RMBS rating chips.
                    colorInfoBg: '#FAEEF0',
                    colorInfoBorder: '#F4DBDD',
                    colorSuccessBg: '#F6FAE8',
                    colorSuccessBorder: '#EBF1D5',

                    colorBgBase: '#FFFFFF',
                    colorBgLayout: '#F9F9F9',
                    colorBgContainer: '#FFFFFF',
                    colorBgElevated: '#FFFFFF',
                    colorTextBase: '#1A1A1A',

                    colorBorder: '#E0E0E0',
                    colorBorderSecondary: '#EDEDED',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                    fontFamily: BRAND_FONT,
                },
            };
        //TODO: move to constants
        // TCW brand Default (dark): each accent is a lighter step from the guideline tint scale, so it
        // reads on the grey-1000 ground while staying on-brand (no ad-hoc "lifted" colours). Data-red
        // has no published tint ramp, so error stays at the brand base #CE1F00.
        case 'dark':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#688FBD', // Blue tint
                    colorInfo: '#C06378', // Plum tint
                    colorSuccess: '#739563', // Green tint
                    colorWarning: '#E4BB34', // Gold tint
                    colorError: '#CE1F00', // Data Red (no tint scale — brand base)

                    colorBgBase: '#0D0D0D',
                    colorBgLayout: '#0D0D0D',
                    colorBgContainer: '#1A1A1A',
                    colorBgElevated: '#242424',
                    colorTextBase: '#F9F9F9',

                    colorBorder: '#333333',
                    colorBorderSecondary: '#262626',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                    fontFamily: BRAND_FONT,
                },
            };

        case 'holiday':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#dc2626',
                    colorInfo: '#2563eb',
                    colorSuccess: '#16a34a',
                    colorWarning: '#f59e0b',
                    colorError: '#b91c1c',

                    colorBgBase: '#fffaf5',
                    colorBgLayout: '#fff7ed',
                    colorBgContainer: '#ffffff',
                    colorBgElevated: '#fffefe',
                    colorTextBase: '#2f1f1f',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'ocean':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#0284c7',
                    colorInfo: '#06b6d4',
                    colorSuccess: '#10b981',
                    colorWarning: '#f97316',
                    colorError: '#ef4444',

                    colorBgBase: '#f0fbff',
                    colorBgLayout: '#ecfeff',
                    colorBgContainer: '#ffffff',
                    colorBgElevated: '#fafdff',
                    colorTextBase: '#12313f',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'sunset':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#f97316',
                    colorInfo: '#fb7185',
                    colorSuccess: '#22c55e',
                    colorWarning: '#facc15',
                    colorError: '#ef4444',

                    colorBgBase: '#fff7ed',
                    colorBgLayout: '#ffedd5',
                    colorBgContainer: '#fffaf5',
                    colorBgElevated: '#ffffff',
                    colorTextBase: '#3f2418',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'forest':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#16a34a',
                    colorInfo: '#0f766e',
                    colorSuccess: '#22c55e',
                    colorWarning: '#d97706',
                    colorError: '#dc2626',

                    colorBgBase: '#f7fee7',
                    colorBgLayout: '#ecfccb',
                    colorBgContainer: '#ffffff',
                    colorBgElevated: '#fbfff5',
                    colorTextBase: '#1f2f1f',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'neonMint':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#00ffa8',
                    colorInfo: '#22d3ee',
                    colorSuccess: '#00ffa8',
                    colorWarning: '#ffde59',
                    colorError: '#ff4d6d',
                    colorBgBase: '#0b1220',
                    colorTextBase: '#eafff7',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'vaporwave':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#ff4fd8',
                    colorInfo: '#6d5efc',
                    colorSuccess: '#2de2e6',
                    colorWarning: '#f9c80e',
                    colorError: '#ff2e63',
                    colorBgBase: '#120021',
                    colorTextBase: '#f7e8ff',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'neonGlow':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#39ff14',
                    colorInfo: '#00F5FF',
                    colorSuccess: '#39ff14',
                    colorWarning: '#ffde59',
                    colorError: '#ff4d6d',
                    colorBgBase: '#070b12',
                    colorTextBase: '#eafff7',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'solarizedLight':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#268bd2',
                    colorInfo: '#2aa198',
                    colorSuccess: '#859900',
                    colorWarning: '#b58900',
                    colorError: '#dc322f',
                    colorBgBase: '#fdf6e3',
                    colorTextBase: '#073642',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'solarizedDark':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#268bd2',
                    colorInfo: '#2aa198',
                    colorSuccess: '#859900',
                    colorWarning: '#b58900',
                    colorError: '#dc322f',
                    colorBgBase: '#002b36',
                    colorTextBase: '#eee8d5',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'plumGradient':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#a855f7',
                    colorInfo: '#c084fc',
                    colorSuccess: '#22c55e',
                    colorWarning: '#f59e0b',
                    colorError: '#ef4444',
                    colorBgBase: '#1b1026',
                    colorTextBase: '#f6ecff',
                    colorBgContainer: '#241235',
                    colorBgElevated: '#2e1847',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'goldGradient':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#d4a72c',
                    colorInfo: '#facc15',
                    colorSuccess: '#84cc16',
                    colorWarning: '#f59e0b',
                    colorError: '#ef4444',
                    colorBgBase: '#1f1608',
                    colorTextBase: '#fff7dd',
                    colorBgContainer: '#2a1d0b',
                    colorBgElevated: '#38260d',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'greenGradient':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#22c55e',
                    colorInfo: '#4ade80',
                    colorSuccess: '#22c55e',
                    colorWarning: '#eab308',
                    colorError: '#ef4444',
                    colorBgBase: '#0b1d13',
                    colorTextBase: '#ecfff3',
                    colorBgContainer: '#102918',
                    colorBgElevated: '#15351f',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'blueGradient':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#3b82f6',
                    colorInfo: '#60a5fa',
                    colorSuccess: '#22c55e',
                    colorWarning: '#f59e0b',
                    colorError: '#ef4444',
                    colorBgBase: '#0a1528',
                    colorTextBase: '#edf5ff',
                    colorBgContainer: '#10203b',
                    colorBgElevated: '#152a4e',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'cyberpunk':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#ff2bd6',
                    colorInfo: '#00e5ff',
                    colorSuccess: '#00f5a0',
                    colorWarning: '#ffb703',
                    colorError: '#ff4d6d',
                    colorBgBase: '#09040f',
                    colorTextBase: '#f5eefe',
                    colorBgContainer: '#12081c',
                    colorBgElevated: '#1a0d29',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'matrix':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#00ff9c',
                    colorInfo: '#00ffa0',
                    colorSuccess: '#00ff9c',
                    colorWarning: '#eab308',
                    colorError: '#ff4d6d',
                    colorBgBase: '#030706',
                    colorTextBase: '#c6ffe6',
                    colorBgContainer: '#07110d',
                    colorBgElevated: '#0c1a14',
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case 'dreamy':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#d946ef',
                    colorInfo: '#8b5cf6',
                    colorSuccess: '#22c55e',
                    colorWarning: '#f59e0b',
                    colorError: '#fb7185',

                    colorBgBase: '#fff7ff',
                    colorBgLayout: '#fdf4ff',
                    colorBgContainer: '#fffaff',
                    colorBgElevated: '#ffffff',

                    colorTextBase: '#4a335c',

                    colorBorder: 'rgba(217, 70, 239, 0.20)',
                    colorBorderSecondary: 'rgba(139, 92, 246, 0.14)',

                    colorFillAlter: 'rgba(217, 70, 239, 0.045)',
                    colorFillSecondary: 'rgba(251, 207, 232, 0.16)',
                    colorFillTertiary: 'rgba(196, 181, 253, 0.18)',

                    borderRadius: 8,
                    ...COMMON_TOKENS,
                },
            };

        case 'ink':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#111111',
                    colorInfo: '#2f2f2f',
                    colorSuccess: '#1f2937',
                    colorWarning: '#525252',
                    colorError: '#991b1b',

                    colorBgBase: '#ffffff',
                    colorBgLayout: '#ffffff',
                    colorBgContainer: '#ffffff',
                    colorBgElevated: '#ffffff',

                    colorTextBase: '#111111',

                    colorBorder: '#111111',
                    colorBorderSecondary: 'rgba(17,17,17,0.18)',

                    colorFillAlter: 'rgba(17,17,17,0.025)',
                    colorFillSecondary: 'rgba(17,17,17,0.045)',
                    colorFillTertiary: 'rgba(17,17,17,0.065)',

                    borderRadius: 3,
                    ...COMMON_TOKENS,
                },
            };

        case 'dumpsterFire':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: '#ff6a00',
                    colorInfo: '#f97316',
                    colorSuccess: '#84cc16',
                    colorWarning: '#facc15',
                    colorError: '#ef4444',

                    colorBgBase: '#130806',
                    colorTextBase: '#fff1e6',
                    colorBgContainer: '#1f0d08',
                    colorBgElevated: '#2a120a',

                    colorBorder: 'rgba(255, 106, 0, 0.28)',
                    colorBorderSecondary: 'rgba(255, 184, 77, 0.14)',

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        // ── Wealth — 1:1 with Credit Research Portal (warm gold, Albert Sans body + Newsreader
        //    serif display, 3px). Cream translucent cards, gilt hairlines. Serif headings applied
        //    via the [data-theme] rule in global.css; the page gradient lives in surface meta.
        case 'wealthLight':
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#9a6b22',
                    colorInfo: '#9a6b22',
                    colorSuccess: '#3f7d4f',
                    colorWarning: '#c2861a',
                    colorError: '#b23a2e',

                    colorBgBase: '#fdfbf5',
                    colorBgLayout: '#faf6ea',
                    colorBgContainer: '#fffdf8',
                    colorBgElevated: '#f6f0e0',

                    colorTextBase: '#211a0f',
                    colorTextSecondary: '#6a5e47',
                    colorTextTertiary: 'rgba(33,26,15,0.42)',
                    colorTextQuaternary: 'rgba(33,26,15,0.30)',

                    colorBorder: 'rgba(120,84,24,0.42)',
                    colorBorderSecondary: 'rgba(120,84,24,0.24)',
                    colorFillTertiary: 'rgba(120,84,24,0.08)',
                    colorFillQuaternary: 'rgba(120,84,24,0.05)',

                    borderRadius: 3,
                    ...COMMON_TOKENS,
                    fontFamily: WEALTH_FONT,
                },
                components: {
                    Card: {
                        colorBgContainer: '#fffdf8',
                    },
                    Table: {
                        headerBg: '#f6f0e0',
                        headerColor: '#6a5e47',
                        rowHoverBg: 'rgba(120,84,24,0.06)',
                        borderColor: 'rgba(120,84,24,0.20)',
                    },
                    Layout: {
                        headerBg: 'transparent',
                        bodyBg: 'transparent',
                    },
                },
            };

        case 'wealthDark':
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    /*
                     * Exact Wealth Dark identity colors from the original
                     */
                    colorPrimary: '#e6b45a',
                    colorInfo: '#e6b45a',
                    colorSuccess: '#6fae6a',
                    colorWarning: '#e0a93e',
                    colorError: '#d2685a',

                    /*
                     * Exact dark page and surface colors.
                     */
                    colorBgBase: '#0b0907',
                    colorBgLayout: '#0b0907',
                    colorBgContainer: 'rgba(17,13,8,0.66)',
                    colorBgElevated: '#100d09',

                    /*
                     * Exact Wealth Dark text hierarchy.
                     */
                    colorTextBase: '#f1e7d4',
                    colorTextSecondary: 'rgba(241,231,212,0.58)',
                    colorTextTertiary: 'rgba(241,231,212,0.34)',
                    colorTextQuaternary: 'rgba(241,231,212,0.22)',

                    /*
                     * Exact gilt border and fill hierarchy.
                     */
                    colorBorder: 'rgba(230,180,90,0.30)',
                    colorBorderSecondary: 'rgba(230,180,90,0.16)',
                    colorFillAlter: 'rgba(230,180,90,0.025)',
                    colorFillSecondary: 'rgba(230,180,90,0.04)',
                    colorFillTertiary: 'rgba(230,180,90,0.08)',
                    colorFillQuaternary: 'rgba(230,180,90,0.05)',

                    /*
                     * Prototype uses tight 2–3px geometry.
                     */
                    borderRadius: 3,

                    ...COMMON_TOKENS,
                    fontFamily: WEALTH_FONT,
                },

                components: {
                    Card: {
                        colorBgContainer: 'rgba(17,13,8,0.66)',
                    },

                    Table: {
                        headerBg: '#100d09',
                        headerColor: 'rgba(241,231,212,0.58)',
                        rowHoverBg: 'rgba(230,180,90,0.06)',
                        borderColor: 'rgba(230,180,90,0.16)',
                    },

                    Layout: {
                        headerBg: 'transparent',
                        bodyBg: 'transparent',
                    },

                    Tooltip: {
                        colorBgSpotlight: '#0b0907',
                        colorTextLightSolid: '#f1e7d4',
                    },

                    Popover: {
                        colorBgElevated: '#100d09',
                    },

                    Dropdown: {
                        colorBgElevated: '#100d09',
                    },

                    Select: {
                        optionSelectedBg: 'rgba(154,106,38,0.12)',
                        optionActiveBg: 'rgba(230,180,90,0.06)',
                    },

                    Button: {
                        primaryColor: '#120d06',
                        defaultColor: 'rgba(241,231,212,0.58)',
                        defaultBorderColor: 'rgba(230,180,90,0.30)',
                        defaultBg: 'transparent',
                    },

                    Tag: {
                        defaultBg: 'rgba(230,180,90,0.06)',
                        defaultColor: 'rgba(241,231,212,0.58)',
                    },

                    Input: {
                        colorBgContainer: 'transparent',
                        activeBorderColor: '#e6b45a',
                        hoverBorderColor: 'rgba(230,180,90,0.48)',
                    },
                },
            };

        default:
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    ...COMMON_TOKENS,
                },
            };
    }
}

export function getThemeSurfaceMeta(themeName: ThemeName): ThemeSurfaceMeta {
    switch (themeName) {
        case 'holiday':
            return {
                hudGradient: 'linear-gradient(135deg, #fff7ed 0%, #fee2e2 48%, #dcfce7 100%)',
                hudGlow: 'rgba(220, 38, 38, 0.14)',
                accentGradient: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 50%, #16a34a 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(220,38,38,0.34), rgba(245,158,11,0.18) 45%, rgba(22,163,74,0.00) 78%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(220,38,38,0.10) 0%, rgba(220,38,38,0.00) 30%), ' +
                    'radial-gradient(circle at top right, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.00) 28%), ' +
                    'var(--ant-color-bg-layout)',
            };

        case 'ocean':
            return {
                hudGradient: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 52%, #fff7ed 100%)',
                hudGlow: 'rgba(6, 182, 212, 0.16)',
                accentGradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 55%, #f97316 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(2,132,199,0.36), rgba(6,182,212,0.22) 45%, rgba(249,115,22,0.00) 78%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.00) 32%), ' +
                    'radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, rgba(249,115,22,0.00) 28%), ' +
                    'var(--ant-color-bg-layout)',
            };

        case 'sunset':
            return {
                hudGradient: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 48%, #fecdd3 100%)',
                hudGlow: 'rgba(249, 115, 22, 0.18)',
                accentGradient: 'linear-gradient(135deg, #f97316 0%, #fb7185 55%, #facc15 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(249,115,22,0.42), rgba(251,113,133,0.24) 45%, rgba(250,204,21,0.00) 78%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(249,115,22,0.13) 0%, rgba(249,115,22,0.00) 32%), ' +
                    'radial-gradient(circle at top right, rgba(251,113,133,0.10) 0%, rgba(251,113,133,0.00) 28%), ' +
                    'var(--ant-color-bg-layout)',
            };

        case 'forest':
            return {
                hudGradient: 'linear-gradient(135deg, #f7fee7 0%, #dcfce7 50%, #ffedd5 100%)',
                hudGlow: 'rgba(34, 197, 94, 0.15)',
                accentGradient: 'linear-gradient(135deg, #16a34a 0%, #84cc16 55%, #d97706 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(22,163,74,0.36), rgba(132,204,22,0.20) 45%, rgba(217,119,6,0.00) 78%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(34,197,94,0.11) 0%, rgba(34,197,94,0.00) 32%), ' +
                    'radial-gradient(circle at top right, rgba(217,119,6,0.07) 0%, rgba(217,119,6,0.00) 28%), ' +
                    'var(--ant-color-bg-layout)',
            };

        case 'dark':
            return {
                hudGradient: '',
                hudGlow: 'rgba(109, 94, 252, 0.10)',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(109, 94, 252, 0.08)',
                }),
            };

        case 'neonMint':
            return {
                hudGradient: '',
                hudGlow: 'rgba(0, 255, 168, 0.10)',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(0, 255, 168, 0.08)',
                }),
            };

        case 'vaporwave':
            return {
                hudGradient: '',
                hudGlow: 'rgba(255, 79, 216, 0.10)',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(255, 79, 216, 0.08)',
                }),
            };

        case 'neonGlow':
            return {
                hudGradient: '',
                hudGlow: 'rgba(57, 255, 20, 0.10)',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(57, 255, 20, 0.08)',
                }),
            };

        case 'solarizedDark':
            return {
                hudGradient: '',
                hudGlow: 'rgba(38, 139, 210, 0.10)',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(38, 139, 210, 0.08)',
                }),
            };
        case 'plumGradient':
            return {
                hudGradient: 'linear-gradient(135deg, #2a102f 0%, #4b1d5e 42%, #7c3aed 100%)',
                hudGlow: 'rgba(168, 85, 247, 0.28)',
                accentGradient: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(168,85,247,0.55), rgba(236,72,153,0.10) 45%, rgba(168,85,247,0.00) 78%)',
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(168, 85, 247, 0.10)',
                }),
            };

        case 'goldGradient':
            return {
                hudGradient: 'linear-gradient(135deg, #2c2110 0%, #6b4f1d 45%, #d4a72c 100%)',
                hudGlow: 'rgba(250, 204, 21, 0.24)',
                accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #facc15 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(250,204,21,0.60), rgba(245,158,11,0.14) 45%, rgba(250,204,21,0.00) 78%)',
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(250, 204, 21, 0.08)',
                }),
            };

        case 'greenGradient':
            return {
                hudGradient: 'linear-gradient(135deg, #0d2216 0%, #14532d 40%, #22c55e 100%)',
                hudGlow: 'rgba(34, 197, 94, 0.22)',
                accentGradient: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(34,197,94,0.55), rgba(74,222,128,0.12) 45%, rgba(34,197,94,0.00) 78%)',
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(34, 197, 94, 0.08)',
                }),
            };

        case 'blueGradient':
            return {
                hudGradient: 'linear-gradient(135deg, #0b1d35 0%, #123c78 45%, #3b82f6 100%)',
                hudGlow: 'rgba(59, 130, 246, 0.24)',
                accentGradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(59,130,246,0.58), rgba(96,165,250,0.12) 45%, rgba(59,130,246,0.00) 78%)',
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(59, 130, 246, 0.09)',
                }),
            };

        case 'cyberpunk':
            return {
                hudGradient:
                    'linear-gradient(135deg, #0b0f1e 0%, #1a1240 32%, #0f3b55 64%, #05070f 100%)',
                hudGlow: 'rgba(0, 229, 255, 0.28)',
                accentGradient:
                    'linear-gradient(135deg, #ff2bd6 0%, #6d5efc 35%, #00e5ff 70%, #3bdcff 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(255,43,214,0.65), rgba(109,94,252,0.40) 32%, rgba(0,229,255,0.45) 62%, rgba(59,220,255,0.00) 82%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(255, 43, 214, 0.16) 0%, rgba(255, 43, 214, 0.00) 34%), ' +
                    'radial-gradient(circle at top right, rgba(109, 94, 252, 0.10) 0%, rgba(109, 94, 252, 0.00) 30%), ' +
                    'var(--ant-color-bg-layout)',
            };

        case 'matrix':
            return {
                hudGradient: 'linear-gradient(135deg, #020806 0%, #063b2b 45%, #00ff9c 100%)',
                hudGlow: 'rgba(0,255,156,0.25)',
                accentGradient: 'linear-gradient(135deg, #00ff9c 0%, #00ffa0 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(0,255,156,0.60), rgba(0,255,156,0.12) 45%, rgba(0,255,156,0.00) 78%)',
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: 'var(--ant-color-bg-layout)',
                    glow: 'rgba(0, 255, 156, 0.08)',
                }),
            };

        case 'dreamy':
            return {
                hudGradient:
                    'linear-gradient(135deg, #fff1fb 0%, #f5d0fe 32%, #ddd6fe 64%, #bfdbfe 100%)',
                hudGlow: 'rgba(217,70,239,0.28)',
                accentGradient:
                    'linear-gradient(135deg, #f9a8d4 0%, #d946ef 34%, #8b5cf6 68%, #60a5fa 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(217,70,239,0.46), rgba(139,92,246,0.30) 42%, rgba(96,165,250,0.12) 70%, rgba(217,70,239,0.00) 86%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(249,168,212,0.30) 0%, rgba(249,168,212,0.00) 34%), ' +
                    'radial-gradient(circle at top right, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0.00) 32%), ' +
                    'radial-gradient(circle at 50% 0%, rgba(96,165,250,0.16) 0%, rgba(96,165,250,0.00) 38%), ' +
                    'linear-gradient(180deg, #fff7ff 0%, #fdf4ff 42%, #fffaf0 100%)',
            };

        case 'ink':
            return {
                hudGradient:
                    'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.96) 100%)',
                hudGlow: 'rgba(17,17,17,0.025)',
                accentGradient:
                    'linear-gradient(90deg, rgba(17,17,17,0.70) 0%, rgba(17,17,17,0.12) 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(17,17,17,0.28), rgba(17,17,17,0.05) 45%, rgba(17,17,17,0.00) 78%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(17,17,17,0.025) 0%, rgba(17,17,17,0.00) 30%), ' +
                    'linear-gradient(180deg, #ffffff 0%, #ffffff 100%)',
            };

        case 'dumpsterFire':
            return {
                hudGradient:
                    'linear-gradient(135deg, #160806 0%, #3b1208 34%, #7c1d12 62%, #ff6a00 100%)',
                hudGlow: 'rgba(255, 106, 0, 0.30)',
                accentGradient:
                    'linear-gradient(135deg, #ef4444 0%, #ff6a00 42%, #facc15 76%, #3b1208 100%)',
                widgetBorderGradient:
                    'linear-gradient(135deg, rgba(239,68,68,0.62), rgba(255,106,0,0.42) 38%, rgba(250,204,21,0.20) 62%, rgba(255,106,0,0.00) 82%)',
                isGradientTheme: true,
                appBackground:
                    'radial-gradient(circle at top left, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.00) 34%), ' +
                    'radial-gradient(circle at top right, rgba(255,106,0,0.14) 0%, rgba(255,106,0,0.00) 30%), ' +
                    'radial-gradient(circle at bottom left, rgba(250,204,21,0.07) 0%, rgba(250,204,21,0.00) 28%), ' +
                    'var(--ant-color-bg-layout)',
            };

        // Wealth carries the Credit Research Portal's exact --page-bg gradients. Not a "gradient
        // theme" in the HUD sense (no neon accent borders) — just the page ground.
        case 'wealthLight':
            return {
                hudGradient: '',
                hudGlow: '',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: 'linear-gradient(180deg,#fdfbf5 0%,#faf6ea 55%,#f5efdd 100%)',
            };
        case 'wealthDark':
            return {
                hudGradient: '',
                hudGlow: '',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground:
                    'radial-gradient(circle at 50% 0%, rgba(230,180,90,0.06) 0%, rgba(11,9,7,0) 42%), #0b0907',
            };

        default:
            return {
                hudGradient: '',
                hudGlow: '',
                accentGradient: '',
                widgetBorderGradient: '',
                isGradientTheme: false,
                appBackground: 'var(--ant-color-bg-layout)',
            };
    }
}

// Colors for a theme's mini-preview tile in the Themes drawer, pulled from its own tokens so the
// swatch always reflects the real palette (bg + primary + text + border).
export type ThemePreview = {
    bg: string;
    primary: string;
    accent: string;
    text: string;
    border: string;
};
export function getThemePreview(themeName: ThemeName): ThemePreview {
    const cfg = getThemeConfig(themeName) as any;
    const token = cfg.token ?? {};
    const isDark = cfg.algorithm === antdTheme.darkAlgorithm;
    return {
        bg: token.colorBgContainer ?? token.colorBgBase ?? (isDark ? '#141414' : '#ffffff'),
        primary: token.colorPrimary ?? '#1677ff',
        accent: token.colorWarning ?? token.colorSuccess ?? token.colorPrimary ?? '#faad14',
        text: token.colorTextBase ?? (isDark ? '#f5f5f5' : '#1a1a1a'),
        border: token.colorBorder ?? (isDark ? '#333' : '#e0e0e0'),
    };
}

export function getAppSurfaceBackground(themeName: ThemeName): string {
    return getThemeSurfaceMeta(themeName).appBackground;
}
