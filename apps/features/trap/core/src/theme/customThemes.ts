/* eslint-disable @typescript-eslint/no-explicit-any */
import { theme as antdTheme } from 'antd';
import { getThemeConfig, getAppSurfaceBackground } from './ThemeContext';
import { ThemeName } from './types';

const THEME_KEY = 'trap_local_themes';
// A user-authored theme: a name, the built-in variant it forked from (for the algorithm + a
// starting palette), a light/dark mode, and the full set of editable tokens.
export type CustomTheme = {
    id: string;
    name: string;
    base: ThemeName;
    mode: 'light' | 'dark';
    tokens: Record<string, string | number>;
};

export async function fetchCustomThemes(): Promise<CustomTheme[]> {
    //TODO: fetch from BE

    const localThemes = JSON.parse(localStorage.getItem(THEME_KEY) || '[]');
    return localThemes;
}

export async function saveCustomThemeRemote(theme: CustomTheme): Promise<CustomTheme> {
    //TODO: save on BE

    const localThemes = JSON.parse(localStorage.getItem(THEME_KEY) || '[]');
    if (localThemes.find((saved: any) => saved.id === theme.id)) {
        //edit existing
        localStorage.setItem(
            THEME_KEY,
            JSON.stringify([
                ...localThemes.map((local: any) => (local.id === theme.id ? theme : local)),
            ])
        );
    } else {
        //new theme
        localStorage.setItem(THEME_KEY, JSON.stringify([...localThemes, theme]));
    }

    return theme;
}

export async function deleteCustomThemeRemote(id: string): Promise<void> {
    //TODO: remove on BE
    const localThemesFiltered = JSON.parse(localStorage.getItem(THEME_KEY) || '[]').filter(
        (theme: { id: string }) => theme.id !== id
    );

    localStorage.setItem(THEME_KEY, JSON.stringify([...localThemesFiltered]));
    return localThemesFiltered;
}

export function newCustomId(): string {
    try {
        return `custom-${crypto.randomUUID().slice(0, 8)}`;
    } catch {
        return `custom-${Math.random().toString(36).slice(2, 10)}`;
    }
}

export function isCustomId(id: string): boolean {
    return typeof id === 'string' && id.startsWith('custom-');
}

// The color tokens exposed in the editor (order = display order).
export const EDITABLE_COLORS: { key: string; label: string }[] = [
    { key: 'colorPrimary', label: 'Primary' },
    { key: 'colorInfo', label: 'Info / accent' },
    { key: 'colorBgLayout', label: 'Page background' },
    { key: 'colorBgContainer', label: 'Surface / card' },
    { key: 'colorBgElevated', label: 'Elevated / popover' },
    { key: 'colorTextBase', label: 'Text' },
    { key: 'colorBorder', label: 'Border' },
    { key: 'colorSuccess', label: 'Success' },
    { key: 'colorWarning', label: 'Warning' },
    { key: 'colorError', label: 'Error' },
];

export const FONT_OPTIONS: { label: string; value: string }[] = [
    {
        label: 'System sans',
        value: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },
    {
        label: 'Monument Grotesk (brand)',
        value: '"Monument Grotesk", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif',
    },
    { label: 'IBM Plex Sans', value: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' },
    { label: 'Albert Sans', value: '"Albert Sans", ui-sans-serif, system-ui, sans-serif' },
    { label: 'Newsreader (serif)', value: '"Newsreader", Georgia, serif' },
];

/** Read a base theme's tokens as sensible starting values for a new custom theme. */
export function seedTokensFromBase(base: ThemeName): Record<string, string | number> {
    const cfg = getThemeConfig(base) as any;
    const t = cfg.token ?? {};
    const isDark = cfg.algorithm === antdTheme.darkAlgorithm;
    return {
        // Carry EVERY token the base theme defines (status -bg/-border tints, borders, common
        // tokens) so a fork reproduces its base exactly — the editable keys below are just the
        // subset the editor exposes; anything not edited stays faithful to the base.
        ...t,
        colorPrimary: t.colorPrimary ?? (isDark ? '#4c8fd6' : '#013d7d'),
        colorInfo: t.colorInfo ?? (isDark ? '#c77ba6' : '#813451'),
        colorBgLayout: t.colorBgLayout ?? (isDark ? '#0d0d0d' : '#f9f9f9'),
        colorBgContainer: t.colorBgContainer ?? (isDark ? '#1a1a1a' : '#ffffff'),
        colorBgElevated: t.colorBgElevated ?? (isDark ? '#242424' : '#ffffff'),
        colorBgBase: t.colorBgBase ?? (isDark ? '#0d0d0d' : '#ffffff'),
        colorTextBase: t.colorTextBase ?? (isDark ? '#f9f9f9' : '#1a1a1a'),
        colorBorder: t.colorBorder ?? (isDark ? '#333333' : '#e0e0e0'),
        colorSuccess: t.colorSuccess ?? '#4b773d',
        colorWarning: t.colorWarning ?? '#db9f00',
        colorError: t.colorError ?? '#ce1f00',
        borderRadius: t.borderRadius ?? 6,
        fontFamily: t.fontFamily ?? FONT_OPTIONS[0].value,
    };
}

/** Build an antd ThemeConfig from a custom theme. */
export function customToConfig(c: CustomTheme) {
    return {
        algorithm: c.mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
            fontSize: 12,
            fontSizeSM: 11,
            fontSizeLG: 12,
            lineHeight: 1.3,
            ...c.tokens,
        },
    };
}

export function customAppBackground(c: CustomTheme): string {
    return String(c.tokens.colorBgLayout ?? c.tokens.colorBgBase ?? 'var(--ant-color-bg-layout)');
}

/** Preview-tile colors (bg · primary · accent · text · border) for a custom theme. */
export function customPreview(c: CustomTheme) {
    const t = c.tokens as any;
    const isDark = c.mode === 'dark';
    return {
        bg: t.colorBgContainer ?? t.colorBgBase ?? (isDark ? '#1a1a1a' : '#ffffff'),
        primary: t.colorPrimary ?? '#1677ff',
        accent: t.colorWarning ?? t.colorSuccess ?? t.colorPrimary ?? '#faad14',
        text: t.colorTextBase ?? (isDark ? '#f5f5f5' : '#1a1a1a'),
        border: t.colorBorder ?? (isDark ? '#333' : '#e0e0e0'),
    };
}

export type ResolvedTheme = { config: any; appBackground: string };

/** Resolve any theme id (built-in name or custom id) to its antd config + app background. */
export function resolveTheme(themeName: string, customThemes: CustomTheme[]): ResolvedTheme {
    if (isCustomId(themeName)) {
        const c = customThemes.find((x) => x.id === themeName);
        if (c) return { config: customToConfig(c), appBackground: customAppBackground(c) };
    }
    return {
        config: getThemeConfig(themeName as ThemeName),
        appBackground: getAppSurfaceBackground(themeName as ThemeName),
    };
}
