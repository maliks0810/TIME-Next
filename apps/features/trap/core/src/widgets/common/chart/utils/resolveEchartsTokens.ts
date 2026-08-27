/* eslint-disable @typescript-eslint/no-explicit-any */
export type EchartsRoleColors = Record<string, string>;

const WEALTH_UI_FONT =
    '"Hanken Grotesk", "Albert Sans", ui-sans-serif, system-ui, sans-serif';

const WEALTH_DISPLAY_FONT =
    '"Spectral", "Newsreader", Georgia, serif';

const WEALTH_MONO_FONT =
    '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';

/**
 * Resolve "@role" color tokens in an ECharts option to real colors.
 *
 * Supported forms:
 *   - "@role"       -> exact role-map lookup
 *   - "@roleFadeNN" -> base role at NN percent opacity
 *
 * This module also defines the base light/dark role maps and the analytics
 * chart palettes used by ChartWidget and GeoMapWidget.
 */

// ---------------------------------------------------------------------------
// Base role color maps
// ---------------------------------------------------------------------------

export const ECHARTS_ROLE_COLORS_LIGHT: EchartsRoleColors = {
    "@primary": "#013D7D",
    "@success": "#2da44e",
    "@warning": "#bf8700",
    "@warningDark": "#9a6700",
    "@error": "#cf222e",
    "@errorDark": "#a40e26",
    "@info": "#0969da",
    "@text": "#1f2328",
    "@textSecondary": "#57606a",
    "@textTertiary": "#6e7781",
    "@border": "#d0d7de",
    "@splitLine": "#d0d7de",
};

export const ECHARTS_ROLE_COLORS_DARK: EchartsRoleColors = {
    "@primary": "#688FBD",
    "@success": "#3fb950",
    "@warning": "#d29922",
    "@warningDark": "#bb8009",
    "@error": "#f85149",
    "@errorDark": "#b62324",
    "@info": "#58a6ff",
    "@text": "#e6edf3",
    "@textSecondary": "#9198a1",
    "@textTertiary": "#6e7681",
    "@border": "#30363d",
    "@splitLine": "#30363d",
};

/**
 * Shared tooltip chrome for ALL analytics charts (ChartWidget, GeoMap, CashFlow).
 * Chrome only — never sets `formatter`/`trigger`, so each chart keeps its own
 * content. @role tokens resolve downstream via resolveEchartsTokens, so it themes
 * for Light/Dark/Wealth/Cyberpunk/etc. Merge this UNDER a chart's own tooltip so
 * chart-specific keys (trigger, formatter, axisPointer, position) win.
 */
export const ECHARTS_TOOLTIP_CHROME = {
    backgroundColor: "@surface",
    borderColor: "@border",
    borderWidth: 1,
    padding: [8, 10],
    textStyle: { color: "@text", fontSize: 11, lineHeight: 16 },
    extraCssText:
        "box-shadow: 0 4px 16px rgba(0,0,0,0.16); border-radius: 6px; backdrop-filter: none;",
} as const;

export function getEchartsRoleColors(
    theme: "light" | "dark" = "light",
): EchartsRoleColors {
    return theme === "dark"
        ? ECHARTS_ROLE_COLORS_DARK
        : ECHARTS_ROLE_COLORS_LIGHT;
}

// ---------------------------------------------------------------------------
// Analytics chart palettes
// ---------------------------------------------------------------------------

/**
 * Add presentation-specific chart roles to a base ECharts role map.
 *
 * Priority:
 *   1. Explicit specialty themes receive purpose-built palettes.
 *   2. Any other dark theme, including custom dark themes, receives a muted
 *      dark analytics palette.
 *   3. Any remaining light theme, including custom light themes, receives the
 *      default pastel analytics palette.
 */
export function withAnalyticsChartRoles(
    roles: EchartsRoleColors,
    themeName: string,
    isDark: boolean,
): EchartsRoleColors {
    if (themeName === 'wealthLight') {
        return {
            ...roles,

            /*
             * Concentration and ranked-chart ramp.
             * Used by Geo, Heatmap, Manufacturer, Model, Originator,
             * Servicer, and other ordered concentration views.
             */
            '@chartBlueLight': '#E3CFA6',
            '@chartBlue': '#D4B582',
            '@chartBlueMid': '#B07F3A',
            '@chartBlueDark': '#6E4A20',

            /*
             * Composition palette.
             * Used by Vehicle Type, New/Used, Zero-Balance Reason,
             * and other categorical views.
             */
            '@chartTeal': '#6E4A20',
            '@chartGreen': '#9A6A26',
            '@chartAmber': '#B07F3A',
            '@chartCoral': '#C39A5E',
            '@chartPurple': '#D4B582',
            '@chartSlate': '#E3CFA6',

            /*
             * Primary Wealth chart accent.
             * Used by CGL and other gold-highlight series.
             */
            '@chartGold': '#9A6B22',

            /*
             * Performance and credit-risk colors remain semantic.
             * Wealth must not collapse DQ/performance risk into gold.
             */
            '@riskBest': '#3F7D4F',
            '@riskGood': '#779458',
            '@riskModerate': '#C2861A',
            '@riskElevated': '#A96416',
            '@riskHigh': '#B23A2E',
        };
    }

    if (themeName === 'wealthDark') {
        return {
            ...roles,

            /*
             * Concentration and ranked-chart ramp.
             * Dark bronze at the low end, bright cream-gold at the high end.
             */
            '@chartBlueLight': '#6E4A20',
            '@chartBlue': '#8F6427',
            '@chartBlueMid': '#CF9A44',
            '@chartBlueDark': '#F6DDA0',

            /*
             * Composition palette.
             * Explicit opaque shades keep donut segments distinguishable.
             */
            '@chartTeal': '#F6DDA0',
            '@chartGreen': '#E6B45A',
            '@chartAmber': '#CF9A44',
            '@chartCoral': '#B27F34',
            '@chartPurple': '#8F6427',
            '@chartSlate': '#6E4A20',

            /*
             * Primary Wealth Dark chart accent.
             */
            '@chartGold': '#E6B45A',

            /*
             * Semantic performance and credit-risk scale.
             */
            '@riskBest': '#6FAE6A',
            '@riskGood': '#96B46E',
            '@riskModerate': '#E0A93E',
            '@riskElevated': '#C9882F',
            '@riskHigh': '#D2685A',
        };
    }

    if (themeName === "cyberpunk") {
        return {
            ...roles,

            "@chartBlueLight": "#21153D",
            "@chartBlue": "#493B91",
            "@chartBlueMid": "#147FA3",
            "@chartBlueDark": "#00E5FF",

            "@chartTeal": "#2DE2E6",
            "@chartGreen": "#00F5A0",
            "@chartAmber": "#F9C80E",
            "@chartCoral": "#FF5C8A",
            "@chartPurple": "#A66CFF",
            "@chartSlate": "#7787A8",
            "@chartGold": "#FFD166",

            "@riskBest": "#00F5A0",
            "@riskGood": "#2DE2E6",
            "@riskModerate": "#F9C80E",
            "@riskElevated": "#FF7A59",
            "@riskHigh": "#FF2E63",
        };
    }

    if (themeName === "dreamy") {
        return {
            ...roles,

            "@chartBlueLight": "#EEF2FF",
            "@chartBlue": "#C4B5FD",
            "@chartBlueMid": "#A78BFA",
            "@chartBlueDark": "#7C3AED",

            "@chartTeal": "#99E6D9",
            "@chartGreen": "#B7E4C7",
            "@chartAmber": "#F9D8A7",
            "@chartCoral": "#F9A8D4",
            "@chartPurple": "#D8B4FE",
            "@chartSlate": "#C7D2E6",
            "@chartGold": "#E7B65C",

            "@riskBest": "#A7E8BD",
            "@riskGood": "#BDE7D0",
            "@riskModerate": "#F7D6A4",
            "@riskElevated": "#F5B7C7",
            "@riskHigh": "#EE91B7",
        };
    }

    if (themeName === "dumpsterFire") {
        return {
            ...roles,

            // Concentration: dark ember to bright yellow-hot.
            "@chartBlueLight": "#421407",
            "@chartBlue": "#9B2C0B",
            "@chartBlueMid": "#F0640A",
            "@chartBlueDark": "#FFD43B",

            // Categorical fire palette.
            "@chartTeal": "#B8C94A",
            "@chartGreen": "#84CC16",
            "@chartAmber": "#F7C948",
            "@chartCoral": "#F97316",
            "@chartPurple": "#C2416C",
            "@chartSlate": "#9A7768",
            "@chartGold": "#FFC928",

            // Risk ends in unmistakable red.
            "@riskBest": "#A8C94A",
            "@riskGood": "#D4C73D",
            "@riskModerate": "#F7C948",
            "@riskElevated": "#F97316",
            "@riskHigh": "#EF3340",
        };
    }

    if (isDark) {
        return {
            ...roles,

            // Generic/custom dark concentration palette.
            "@chartBlueLight": "#26384A",
            "@chartBlue": "#365A78",
            "@chartBlueMid": "#4D7FA5",
            "@chartBlueDark": "#70A4C8",

            // Muted dark categorical palette.
            "@chartTeal": "#5F9F97",
            "@chartGreen": "#739F7B",
            "@chartAmber": "#B99A59",
            "@chartCoral": "#B87670",
            "@chartPurple": "#8779AA",
            "@chartSlate": "#758493",
            "@chartGold": "#C4A052",

            // Muted dark risk progression.
            "@riskBest": "#668F6E",
            "@riskGood": "#7DA184",
            "@riskModerate": "#B59A60",
            "@riskElevated": "#B67D61",
            "@riskHigh": "#B96565",
        };
    }

    return {
        ...roles,

        // Generic/default/custom light concentration palette.
        "@chartBlueLight": "#E0EEF8",
        "@chartBlue": "#A9CCE6",
        "@chartBlueMid": "#72A8D2",
        "@chartBlueDark": "#3D7FB9",

        // Generic light pastel categorical palette.
        "@chartTeal": "#83BDB5",
        "@chartGreen": "#A8D3AF",
        "@chartAmber": "#EACD91",
        "@chartCoral": "#E5AAA5",
        "@chartPurple": "#BCAEE0",
        "@chartSlate": "#B8C4D1",
        "@chartGold": "#C79A2B",

        // Generic light pastel risk progression.
        "@riskBest": "#82BC8D",
        "@riskGood": "#A8D3AF",
        "@riskModerate": "#EACD91",
        "@riskElevated": "#E8B58D",
        "@riskHigh": "#E5AAA5",
    };
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const UNKNOWN_COLOR = "#888888";
const warned = new Set<string>();

function warnOnce(token: string): void {
    if (warned.has(token)) return;
    warned.add(token);

    if (typeof console !== "undefined" && console.warn) {
        console.warn(
            `[resolveEchartsTokens] unknown color token "${token}" - ` +
            "add it to the EchartsRoleColors map. Using a safe fallback.",
        );
    }
}

export function resolveEchartsTokens<T>(
    option: T,
    roles: EchartsRoleColors = ECHARTS_ROLE_COLORS_LIGHT,
): T {
    const walk = (node: unknown): unknown => {
        if (typeof node === "string") {
            if (node.charAt(0) !== "@") return node;

            if (roles[node]) return roles[node];

            const fade = /^@(.+)Fade(\d{1,3})$/.exec(node);
            if (fade) {
                const baseToken = `@${fade[1]}`;
                const baseColor = roles[baseToken];

                if (baseColor) {
                    const alpha =
                        Math.min(100, Math.max(0, parseInt(fade[2], 10))) /
                        100;

                    return applyAlpha(baseColor, alpha);
                }

                warnOnce(baseToken);
                return "transparent";
            }

            warnOnce(node);
            return UNKNOWN_COLOR;
        }

        if (Array.isArray(node)) {
            return node.map(walk);
        }

        if (node && typeof node === "object") {
            const out: Record<string, unknown> = {};

            for (const key of Object.keys(node as Record<string, unknown>)) {
                out[key] = walk((node as Record<string, unknown>)[key]);
            }

            return out;
        }

        return node;
    };

    return walk(JSON.parse(JSON.stringify(option))) as T;
}

/**
 * Apply alpha from 0 through 1 to #rgb, #rrggbb, #rrggbbaa, rgb(), or rgba().
 */
function applyAlpha(color: string, alpha: number): string {
    if (typeof color !== "string" || color.length === 0) return color;

    const a = Math.min(1, Math.max(0, alpha));

    if (color.charAt(0) === "#") {
        const hex = color.slice(1);
        let r: number;
        let g: number;
        let b: number;

        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6 || hex.length === 8) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else {
            return color;
        }

        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
            return color;
        }

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(
        color,
    );

    if (rgb) {
        return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${a})`;
    }

    return color;
}

function normalizeArray<T>(
    value: T | T[] | null | undefined,
): T[] {
    if (value === null || value === undefined) {
        return [];
    }

    return Array.isArray(value)
        ? value
        : [value];
}

export function applyEchartsTypography<T>(
    option: T,
    themeName: string,
): T {
    if (
        themeName !== 'wealthLight' &&
        themeName !== 'wealthDark'
    ) {
        return option;
    }

    const cloned = JSON.parse(
        JSON.stringify(option),
    ) as Record<string, any>;

    cloned.textStyle = {
        ...(cloned.textStyle ?? {}),
        fontFamily: WEALTH_UI_FONT,
    };

    const axes = [
        ...normalizeArray(cloned.xAxis),
        ...normalizeArray(cloned.yAxis),
        ...normalizeArray(cloned.radiusAxis),
        ...normalizeArray(cloned.angleAxis),
    ];

    for (const axis of axes) {
        axis.axisLabel = {
            ...(axis.axisLabel ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };

        axis.nameTextStyle = {
            ...(axis.nameTextStyle ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };
    }

    for (const legend of normalizeArray(cloned.legend)) {
        legend.textStyle = {
            ...(legend.textStyle ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };

        legend.pageTextStyle = {
            ...(legend.pageTextStyle ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };
    }

    for (const tooltip of normalizeArray(cloned.tooltip)) {
        tooltip.textStyle = {
            ...(tooltip.textStyle ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };
    }

    for (const visualMap of normalizeArray(cloned.visualMap)) {
        visualMap.textStyle = {
            ...(visualMap.textStyle ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };
    }

    for (const title of normalizeArray(cloned.title)) {
        title.textStyle = {
            ...(title.textStyle ?? {}),
            fontFamily: WEALTH_UI_FONT,
            fontWeight: 600,
        };

        title.subtextStyle = {
            ...(title.subtextStyle ?? {}),
            fontFamily: WEALTH_MONO_FONT,
            fontWeight: 400,
        };
    }

    for (const series of normalizeArray(cloned.series)) {
        if (series.label) {
            series.label = {
                ...series.label,
                fontFamily: WEALTH_DISPLAY_FONT,
                fontWeight: 300,
            };
        }

        if (series.endLabel) {
            series.endLabel = {
                ...series.endLabel,
                fontFamily: WEALTH_DISPLAY_FONT,
                fontWeight: 300,
            };
        }

        if (series.markPoint?.label) {
            series.markPoint = {
                ...series.markPoint,
                label: {
                    ...series.markPoint.label,
                    fontFamily: WEALTH_DISPLAY_FONT,
                    fontWeight: 300,
                },
            };
        }

        if (series.markLine?.label) {
            series.markLine = {
                ...series.markLine,
                label: {
                    ...series.markLine.label,
                    fontFamily: WEALTH_MONO_FONT,
                    fontWeight: 400,
                },
            };
        }

        if (series.markArea?.label) {
            series.markArea = {
                ...series.markArea,
                label: {
                    ...series.markArea.label,
                    fontFamily: WEALTH_MONO_FONT,
                    fontWeight: 400,
                },
            };
        }
    }

    return cloned as T;
}
