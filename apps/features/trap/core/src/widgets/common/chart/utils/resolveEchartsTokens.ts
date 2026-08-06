export type EchartsRoleColors = Record<string, string>;

/**
 * Resolve "@role" color tokens in an ECharts option to real colors.
 *
 * Supports two forms:
 *   • "@role"        -> roles["@role"]                    (exact map lookup)
 *   • "@roleFadeNN"  -> roles["@role"] at NN% opacity     (gradient fades)
 *
 * The gradient fills (CGL area, DQ stacked areas, gradient bars) use the fade
 * convention, e.g. "@successFade35" = @success at 35% alpha, "@errorFade02" =
 * @error at 2%.
 *
 * ROLE COLORS LIVE HERE TOO. The @token -> hex maps (light + dark) are defined
 * in this same file (ECHARTS_ROLE_COLORS_LIGHT / _DARK) so there is ONE file to
 * deploy. The three tokens that were missing (causing gray lines + no gradient
 * shading on the DQ chart) are included: @info, @warningDark, @errorDark.
 *
 * HARDENING: this walker will NEVER emit an unresolved "@..." string as a color.
 * If a token (or a fade's base token) is missing from `roles`, it resolves to a
 * safe fallback instead of crashing ECharts' addColorStop / gradient parsing:
 *   • a fade whose base is unknown -> "transparent"  (so the gradient still draws)
 *   • a plain unknown "@token"     -> UNKNOWN_COLOR   (visible neutral, so a
 *                                     missing token is obvious but never fatal)
 * A dev warning is logged once per distinct unknown token to aid cleanup.
 */

// ---------------------------------------------------------------------------
// Role color maps (light + dark). Includes @info / @warningDark / @errorDark.
// ---------------------------------------------------------------------------

/** LIGHT theme role colors. */
export const ECHARTS_ROLE_COLORS_LIGHT: EchartsRoleColors = {
    "@success": "#2da44e",       // green   — 1-29 DPD
    "@warning": "#bf8700",       // amber   — 30-59 DPD
    "@warningDark": "#9a6700",   // dark amber — 60-89 DPD
    "@error": "#cf222e",         // red     — 90-119 DPD
    "@errorDark": "#a40e26",     // dark red — 120+ DPD / Charged Off
    "@info": "#0969da",          // blue    — Current band
    "@text": "#1f2328",          // near-black — roll line, value labels
    "@textSecondary": "#57606a", // axis labels
    "@textTertiary": "#6e7781",  // axis names / faint labels
    "@splitLine": "#d0d7de",     // gridlines
};

/** DARK theme role colors. */
export const ECHARTS_ROLE_COLORS_DARK: EchartsRoleColors = {
    "@success": "#3fb950",       // green   — 1-29 DPD
    "@warning": "#d29922",       // amber   — 30-59 DPD
    "@warningDark": "#bb8009",   // dark amber — 60-89 DPD
    "@error": "#f85149",         // red     — 90-119 DPD
    "@errorDark": "#b62324",     // dark red — 120+ DPD / Charged Off
    "@info": "#58a6ff",          // blue    — Current band
    "@text": "#e6edf3",          // near-white — roll line, value labels
    "@textSecondary": "#9198a1", // axis labels
    "@textTertiary": "#6e7681",  // axis names / faint labels
    "@splitLine": "#30363d",     // gridlines
};

/** Pick the role-color map for the active theme. Defaults to light. */
export function getEchartsRoleColors(theme: "light" | "dark" = "light"): EchartsRoleColors {
    return theme === "dark" ? ECHARTS_ROLE_COLORS_DARK : ECHARTS_ROLE_COLORS_LIGHT;
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const UNKNOWN_COLOR = '#888888';           // neutral grey for a missing @token
const _warned = new Set<string>();

function warnOnce(token: string): void {
    if (_warned.has(token)) return;
    _warned.add(token);
    if (typeof console !== 'undefined' && console.warn) {
        console.warn(
            `[resolveEchartsTokens] unknown color token "${token}" — ` +
            `add it to the EchartsRoleColors map. Using a safe fallback for now.`,
        );
    }
}

/**
 * Resolve "@role" / "@roleFadeNN" tokens in an ECharts option.
 *
 * `roles` is optional: if omitted, the light map above is used. Pass
 * getEchartsRoleColors('dark') (or your themed map) to override.
 */
export function resolveEchartsTokens<T>(
    option: T,
    roles: EchartsRoleColors = ECHARTS_ROLE_COLORS_LIGHT,
): T {
    const walk = (node: unknown): unknown => {
        if (typeof node === 'string') {
            if (node.charAt(0) !== '@') return node;

            // Exact role match first (plain "@token").
            if (roles[node]) return roles[node];

            // "@<name>Fade<NN>" -> base @<name> at NN% opacity.
            const fade = /^@(.+)Fade(\d{1,3})$/.exec(node);
            if (fade) {
                const baseToken = '@' + fade[1];
                const baseColor = roles[baseToken];
                if (baseColor) {
                    const alpha = Math.min(100, Math.max(0, parseInt(fade[2], 10))) / 100;
                    return applyAlpha(baseColor, alpha);
                }
                // Base token missing: transparent keeps the gradient valid + drawable.
                warnOnce(baseToken);
                return 'transparent';
            }

            // Unknown plain token: neutral fallback (never a raw "@..." to ECharts).
            warnOnce(node);
            return UNKNOWN_COLOR;
        }
        if (Array.isArray(node)) return node.map(walk);
        if (node && typeof node === 'object') {
            const out: Record<string, unknown> = {};
            for (const k of Object.keys(node as Record<string, unknown>)) {
                out[k] = walk((node as Record<string, unknown>)[k]);
            }
            return out;
        }
        return node;
    };
    return walk(JSON.parse(JSON.stringify(option))) as T;
}

/**
 * Apply alpha (0..1) to a resolved color. Handles #rgb, #rrggbb, #rrggbbaa, and
 * rgb()/rgba(). Falls back to the input on anything unexpected.
 */
function applyAlpha(color: string, alpha: number): string {
    if (typeof color !== 'string' || color.length === 0) return color;
    const a = Math.min(1, Math.max(0, alpha));

    // #rgb / #rrggbb / #rrggbbaa
    if (color.charAt(0) === '#') {
        const hex = color.slice(1);
        let r: number, g: number, b: number;
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
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return color;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // rgb(...) / rgba(...)
    const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color);
    if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})`;

    // Named / hsl / unknown — cannot alpha without a canvas; return as-is.
    return color;
}
