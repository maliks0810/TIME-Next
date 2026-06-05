import React from "react";
import { theme as antdTheme } from "antd";

export type ThemeName =
    | "default"
    | "dark"
    | "holiday"
    | "ocean"
    | "sunset"
    | "forest"
    | "neonMint"
    | "solarizedLight"
    | "solarizedDark"
    | "vaporwave"
    | "neonGlow"
    | "plumGradient"
    | "goldGradient"
    | "greenGradient"
    | "blueGradient"
    | "cyberpunk"
    | "matrix"
    | "dreamy"
    | "ink"
    | "dumpsterFire";

export type ThemeSurfaceMeta = {
    hudGradient: string;
    hudGlow: string;
    accentGradient: string;
    widgetBorderGradient: string;
    isGradientTheme: boolean;
    appBackground: string;
};

export const THEME_OPTIONS: Array<{ value: ThemeName; label: string }> = [
    { value: "default", label: "Default" },
    { value: "dark", label: "Dark" },
    { value: "holiday", label: "Holiday" },

    { value: "ocean", label: "Ocean" },
    { value: "sunset", label: "Sunset" },
    { value: "forest", label: "Forest" },

    { value: "neonMint", label: "Neon Mint" },
    { value: "vaporwave", label: "Vaporwave" },
    { value: "neonGlow", label: "Neon Glow" },

    { value: "solarizedLight", label: "Solarized Light" },
    { value: "solarizedDark", label: "Solarized Dark" },

    { value: "plumGradient", label: "Plum Gradient" },
    { value: "goldGradient", label: "Gold Gradient" },
    { value: "greenGradient", label: "Green Gradient" },
    { value: "blueGradient", label: "Blue Gradient" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "matrix", label: "Matrix" },
    { value: "dreamy", label: "Dream, Yo" },
    { value: "ink", label: "Ink Sketch" },
    { value: "dumpsterFire", label: "Dumpster Fire" }
];

export const ThemeContext = React.createContext<{
    themeName: ThemeName;
    setTheme: (t: ThemeName) => void;
}>({
    themeName: "default",
    setTheme: () => { },
});

export function useTheme() {
    return React.useContext(ThemeContext);
}

const COMMON_TOKENS = {
    fontSize: 12,
    fontSizeSM: 11,
    fontSizeLG: 12,
    lineHeight: 1.3,
    fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
};


const makeSubtleAppBackground = ({
    base,
    glow,
}: {
    base: string;
    glow?: string;
}) =>
    glow
        ? `radial-gradient(circle at top left, ${glow} 0%, rgba(255,255,255,0) 34%), ${base}`
        : base;

export function getThemeConfig(themeName: ThemeName) {
    switch (themeName) {
        case "default":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#0084ff",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "dark":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#6d5efc",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "holiday":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#dc2626",
                    colorInfo: "#2563eb",
                    colorSuccess: "#16a34a",
                    colorWarning: "#f59e0b",
                    colorError: "#b91c1c",

                    colorBgBase: "#fffaf5",
                    colorBgLayout: "#fff7ed",
                    colorBgContainer: "#ffffff",
                    colorBgElevated: "#fffefe",
                    colorTextBase: "#2f1f1f",

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "ocean":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#0284c7",
                    colorInfo: "#06b6d4",
                    colorSuccess: "#10b981",
                    colorWarning: "#f97316",
                    colorError: "#ef4444",

                    colorBgBase: "#f0fbff",
                    colorBgLayout: "#ecfeff",
                    colorBgContainer: "#ffffff",
                    colorBgElevated: "#fafdff",
                    colorTextBase: "#12313f",

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "sunset":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#f97316",
                    colorInfo: "#fb7185",
                    colorSuccess: "#22c55e",
                    colorWarning: "#facc15",
                    colorError: "#ef4444",

                    colorBgBase: "#fff7ed",
                    colorBgLayout: "#ffedd5",
                    colorBgContainer: "#fffaf5",
                    colorBgElevated: "#ffffff",
                    colorTextBase: "#3f2418",

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "forest":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#16a34a",
                    colorInfo: "#0f766e",
                    colorSuccess: "#22c55e",
                    colorWarning: "#d97706",
                    colorError: "#dc2626",

                    colorBgBase: "#f7fee7",
                    colorBgLayout: "#ecfccb",
                    colorBgContainer: "#ffffff",
                    colorBgElevated: "#fbfff5",
                    colorTextBase: "#1f2f1f",

                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "neonMint":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#00ffa8",
                    colorInfo: "#22d3ee",
                    colorSuccess: "#00ffa8",
                    colorWarning: "#ffde59",
                    colorError: "#ff4d6d",
                    colorBgBase: "#0b1220",
                    colorTextBase: "#eafff7",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "vaporwave":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#ff4fd8",
                    colorInfo: "#6d5efc",
                    colorSuccess: "#2de2e6",
                    colorWarning: "#f9c80e",
                    colorError: "#ff2e63",
                    colorBgBase: "#120021",
                    colorTextBase: "#f7e8ff",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "neonGlow":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#39ff14",
                    colorInfo: "#00F5FF",
                    colorSuccess: "#39ff14",
                    colorWarning: "#ffde59",
                    colorError: "#ff4d6d",
                    colorBgBase: "#070b12",
                    colorTextBase: "#eafff7",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "solarizedLight":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#268bd2",
                    colorInfo: "#2aa198",
                    colorSuccess: "#859900",
                    colorWarning: "#b58900",
                    colorError: "#dc322f",
                    colorBgBase: "#fdf6e3",
                    colorTextBase: "#073642",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "solarizedDark":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#268bd2",
                    colorInfo: "#2aa198",
                    colorSuccess: "#859900",
                    colorWarning: "#b58900",
                    colorError: "#dc322f",
                    colorBgBase: "#002b36",
                    colorTextBase: "#eee8d5",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "plumGradient":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#a855f7",
                    colorInfo: "#c084fc",
                    colorSuccess: "#22c55e",
                    colorWarning: "#f59e0b",
                    colorError: "#ef4444",
                    colorBgBase: "#1b1026",
                    colorTextBase: "#f6ecff",
                    colorBgContainer: "#241235",
                    colorBgElevated: "#2e1847",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "goldGradient":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#d4a72c",
                    colorInfo: "#facc15",
                    colorSuccess: "#84cc16",
                    colorWarning: "#f59e0b",
                    colorError: "#ef4444",
                    colorBgBase: "#1f1608",
                    colorTextBase: "#fff7dd",
                    colorBgContainer: "#2a1d0b",
                    colorBgElevated: "#38260d",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "greenGradient":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#22c55e",
                    colorInfo: "#4ade80",
                    colorSuccess: "#22c55e",
                    colorWarning: "#eab308",
                    colorError: "#ef4444",
                    colorBgBase: "#0b1d13",
                    colorTextBase: "#ecfff3",
                    colorBgContainer: "#102918",
                    colorBgElevated: "#15351f",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "blueGradient":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#3b82f6",
                    colorInfo: "#60a5fa",
                    colorSuccess: "#22c55e",
                    colorWarning: "#f59e0b",
                    colorError: "#ef4444",
                    colorBgBase: "#0a1528",
                    colorTextBase: "#edf5ff",
                    colorBgContainer: "#10203b",
                    colorBgElevated: "#152a4e",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "cyberpunk":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#ff2bd6",
                    colorInfo: "#00e5ff",
                    colorSuccess: "#00f5a0",
                    colorWarning: "#ffb703",
                    colorError: "#ff4d6d",
                    colorBgBase: "#09040f",
                    colorTextBase: "#f5eefe",
                    colorBgContainer: "#12081c",
                    colorBgElevated: "#1a0d29",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "matrix":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#00ff9c",
                    colorInfo: "#00ffa0",
                    colorSuccess: "#00ff9c",
                    colorWarning: "#eab308",
                    colorError: "#ff4d6d",
                    colorBgBase: "#030706",
                    colorTextBase: "#c6ffe6",
                    colorBgContainer: "#07110d",
                    colorBgElevated: "#0c1a14",
                    borderRadius: 6,
                    ...COMMON_TOKENS,
                },
            };

        case "dreamy":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#d946ef",
                    colorInfo: "#8b5cf6",
                    colorSuccess: "#22c55e",
                    colorWarning: "#f59e0b",
                    colorError: "#fb7185",

                    colorBgBase: "#fff7ff",
                    colorBgLayout: "#fdf4ff",
                    colorBgContainer: "#fffaff",
                    colorBgElevated: "#ffffff",

                    colorTextBase: "#4a335c",

                    colorBorder: "rgba(217, 70, 239, 0.20)",
                    colorBorderSecondary: "rgba(139, 92, 246, 0.14)",

                    colorFillAlter: "rgba(217, 70, 239, 0.045)",
                    colorFillSecondary: "rgba(251, 207, 232, 0.16)",
                    colorFillTertiary: "rgba(196, 181, 253, 0.18)",

                    borderRadius: 8,
                    ...COMMON_TOKENS,
                },
            };

        case "ink":
            return {
                algorithm: antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: "#111111",
                    colorInfo: "#2f2f2f",
                    colorSuccess: "#1f2937",
                    colorWarning: "#525252",
                    colorError: "#991b1b",

                    colorBgBase: "#ffffff",
                    colorBgLayout: "#ffffff",
                    colorBgContainer: "#ffffff",
                    colorBgElevated: "#ffffff",

                    colorTextBase: "#111111",

                    colorBorder: "#111111",
                    colorBorderSecondary: "rgba(17,17,17,0.18)",

                    colorFillAlter: "rgba(17,17,17,0.025)",
                    colorFillSecondary: "rgba(17,17,17,0.045)",
                    colorFillTertiary: "rgba(17,17,17,0.065)",

                    borderRadius: 3,
                    ...COMMON_TOKENS,
                },
            };

        case "dumpsterFire":
            return {
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: "#ff6a00",
                    colorInfo: "#f97316",
                    colorSuccess: "#84cc16",
                    colorWarning: "#facc15",
                    colorError: "#ef4444",

                    colorBgBase: "#130806",
                    colorTextBase: "#fff1e6",
                    colorBgContainer: "#1f0d08",
                    colorBgElevated: "#2a120a",

                    colorBorder: "rgba(255, 106, 0, 0.28)",
                    colorBorderSecondary: "rgba(255, 184, 77, 0.14)",

                    borderRadius: 6,
                    ...COMMON_TOKENS,
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

        case "holiday":
            return {
                hudGradient: "linear-gradient(135deg, #fff7ed 0%, #fee2e2 48%, #dcfce7 100%)",
                hudGlow: "rgba(220, 38, 38, 0.14)",
                accentGradient: "linear-gradient(135deg, #dc2626 0%, #f59e0b 50%, #16a34a 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(220,38,38,0.34), rgba(245,158,11,0.18) 45%, rgba(22,163,74,0.00) 78%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(220,38,38,0.10) 0%, rgba(220,38,38,0.00) 30%), " +
                    "radial-gradient(circle at top right, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.00) 28%), " +
                    "var(--ant-color-bg-layout)",
            };

        case "ocean":
            return {
                hudGradient: "linear-gradient(135deg, #ecfeff 0%, #dbeafe 52%, #fff7ed 100%)",
                hudGlow: "rgba(6, 182, 212, 0.16)",
                accentGradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 55%, #f97316 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(2,132,199,0.36), rgba(6,182,212,0.22) 45%, rgba(249,115,22,0.00) 78%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.00) 32%), " +
                    "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, rgba(249,115,22,0.00) 28%), " +
                    "var(--ant-color-bg-layout)",
            };

        case "sunset":
            return {
                hudGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 48%, #fecdd3 100%)",
                hudGlow: "rgba(249, 115, 22, 0.18)",
                accentGradient: "linear-gradient(135deg, #f97316 0%, #fb7185 55%, #facc15 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(249,115,22,0.42), rgba(251,113,133,0.24) 45%, rgba(250,204,21,0.00) 78%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(249,115,22,0.13) 0%, rgba(249,115,22,0.00) 32%), " +
                    "radial-gradient(circle at top right, rgba(251,113,133,0.10) 0%, rgba(251,113,133,0.00) 28%), " +
                    "var(--ant-color-bg-layout)",
            };

        case "forest":
            return {
                hudGradient: "linear-gradient(135deg, #f7fee7 0%, #dcfce7 50%, #ffedd5 100%)",
                hudGlow: "rgba(34, 197, 94, 0.15)",
                accentGradient: "linear-gradient(135deg, #16a34a 0%, #84cc16 55%, #d97706 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(22,163,74,0.36), rgba(132,204,22,0.20) 45%, rgba(217,119,6,0.00) 78%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(34,197,94,0.11) 0%, rgba(34,197,94,0.00) 32%), " +
                    "radial-gradient(circle at top right, rgba(217,119,6,0.07) 0%, rgba(217,119,6,0.00) 28%), " +
                    "var(--ant-color-bg-layout)",
            };

        case "dark":
            return {
                hudGradient: "",
                hudGlow: "rgba(109, 94, 252, 0.10)",
                accentGradient: "",
                widgetBorderGradient: "",
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(109, 94, 252, 0.08)",
                }),
            };

        case "neonMint":
            return {
                hudGradient: "",
                hudGlow: "rgba(0, 255, 168, 0.10)",
                accentGradient: "",
                widgetBorderGradient: "",
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(0, 255, 168, 0.08)",
                }),
            };

        case "vaporwave":
            return {
                hudGradient: "",
                hudGlow: "rgba(255, 79, 216, 0.10)",
                accentGradient: "",
                widgetBorderGradient: "",
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(255, 79, 216, 0.08)",
                }),
            };

        case "neonGlow":
            return {
                hudGradient: "",
                hudGlow: "rgba(57, 255, 20, 0.10)",
                accentGradient: "",
                widgetBorderGradient: "",
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(57, 255, 20, 0.08)",
                }),
            };

        case "solarizedDark":
            return {
                hudGradient: "",
                hudGlow: "rgba(38, 139, 210, 0.10)",
                accentGradient: "",
                widgetBorderGradient: "",
                isGradientTheme: false,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(38, 139, 210, 0.08)",
                }),
            };
        case "plumGradient":
            return {
                hudGradient: "linear-gradient(135deg, #2a102f 0%, #4b1d5e 42%, #7c3aed 100%)",
                hudGlow: "rgba(168, 85, 247, 0.28)",
                accentGradient: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(168,85,247,0.55), rgba(236,72,153,0.10) 45%, rgba(168,85,247,0.00) 78%)",
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(168, 85, 247, 0.10)",
                }),
            };

        case "goldGradient":
            return {
                hudGradient: "linear-gradient(135deg, #2c2110 0%, #6b4f1d 45%, #d4a72c 100%)",
                hudGlow: "rgba(250, 204, 21, 0.24)",
                accentGradient: "linear-gradient(135deg, #f59e0b 0%, #facc15 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(250,204,21,0.60), rgba(245,158,11,0.14) 45%, rgba(250,204,21,0.00) 78%)",
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(250, 204, 21, 0.08)",
                }),
            };

        case "greenGradient":
            return {
                hudGradient: "linear-gradient(135deg, #0d2216 0%, #14532d 40%, #22c55e 100%)",
                hudGlow: "rgba(34, 197, 94, 0.22)",
                accentGradient: "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(34,197,94,0.55), rgba(74,222,128,0.12) 45%, rgba(34,197,94,0.00) 78%)",
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(34, 197, 94, 0.08)",
                }),
            };

        case "blueGradient":
            return {
                hudGradient: "linear-gradient(135deg, #0b1d35 0%, #123c78 45%, #3b82f6 100%)",
                hudGlow: "rgba(59, 130, 246, 0.24)",
                accentGradient: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(59,130,246,0.58), rgba(96,165,250,0.12) 45%, rgba(59,130,246,0.00) 78%)",
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(59, 130, 246, 0.09)",
                }),
            };

        case "cyberpunk":
            return {
                hudGradient: "linear-gradient(135deg, #0b0f1e 0%, #1a1240 32%, #0f3b55 64%, #05070f 100%)",
                hudGlow: "rgba(0, 229, 255, 0.28)",
                accentGradient: "linear-gradient(135deg, #ff2bd6 0%, #6d5efc 35%, #00e5ff 70%, #3bdcff 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(255,43,214,0.65), rgba(109,94,252,0.40) 32%, rgba(0,229,255,0.45) 62%, rgba(59,220,255,0.00) 82%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(255, 43, 214, 0.16) 0%, rgba(255, 43, 214, 0.00) 34%), " +
                    "radial-gradient(circle at top right, rgba(109, 94, 252, 0.10) 0%, rgba(109, 94, 252, 0.00) 30%), " +
                    "var(--ant-color-bg-layout)"
            };

        case "matrix":
            return {
                hudGradient: "linear-gradient(135deg, #020806 0%, #063b2b 45%, #00ff9c 100%)",
                hudGlow: "rgba(0,255,156,0.25)",
                accentGradient: "linear-gradient(135deg, #00ff9c 0%, #00ffa0 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(0,255,156,0.60), rgba(0,255,156,0.12) 45%, rgba(0,255,156,0.00) 78%)",
                isGradientTheme: true,
                appBackground: makeSubtleAppBackground({
                    base: "var(--ant-color-bg-layout)",
                    glow: "rgba(0, 255, 156, 0.08)",
                }),
            };

        case "dreamy":
            return {
                hudGradient:
                    "linear-gradient(135deg, #fff1fb 0%, #f5d0fe 32%, #ddd6fe 64%, #bfdbfe 100%)",
                hudGlow: "rgba(217,70,239,0.28)",
                accentGradient:
                    "linear-gradient(135deg, #f9a8d4 0%, #d946ef 34%, #8b5cf6 68%, #60a5fa 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(217,70,239,0.46), rgba(139,92,246,0.30) 42%, rgba(96,165,250,0.12) 70%, rgba(217,70,239,0.00) 86%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(249,168,212,0.30) 0%, rgba(249,168,212,0.00) 34%), " +
                    "radial-gradient(circle at top right, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0.00) 32%), " +
                    "radial-gradient(circle at 50% 0%, rgba(96,165,250,0.16) 0%, rgba(96,165,250,0.00) 38%), " +
                    "linear-gradient(180deg, #fff7ff 0%, #fdf4ff 42%, #fffaf0 100%)",
            };

        case "ink":
            return {
                hudGradient:
                    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.96) 100%)",
                hudGlow: "rgba(17,17,17,0.025)",
                accentGradient:
                    "linear-gradient(90deg, rgba(17,17,17,0.70) 0%, rgba(17,17,17,0.12) 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(17,17,17,0.28), rgba(17,17,17,0.05) 45%, rgba(17,17,17,0.00) 78%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(17,17,17,0.025) 0%, rgba(17,17,17,0.00) 30%), " +
                    "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)",
            };

        case "dumpsterFire":
            return {
                hudGradient:
                    "linear-gradient(135deg, #160806 0%, #3b1208 34%, #7c1d12 62%, #ff6a00 100%)",
                hudGlow: "rgba(255, 106, 0, 0.30)",
                accentGradient:
                    "linear-gradient(135deg, #ef4444 0%, #ff6a00 42%, #facc15 76%, #3b1208 100%)",
                widgetBorderGradient:
                    "linear-gradient(135deg, rgba(239,68,68,0.62), rgba(255,106,0,0.42) 38%, rgba(250,204,21,0.20) 62%, rgba(255,106,0,0.00) 82%)",
                isGradientTheme: true,
                appBackground:
                    "radial-gradient(circle at top left, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.00) 34%), " +
                    "radial-gradient(circle at top right, rgba(255,106,0,0.14) 0%, rgba(255,106,0,0.00) 30%), " +
                    "radial-gradient(circle at bottom left, rgba(250,204,21,0.07) 0%, rgba(250,204,21,0.00) 28%), " +
                    "var(--ant-color-bg-layout)",
            };

        default:
            return {
                hudGradient: "",
                hudGlow: "",
                accentGradient: "",
                widgetBorderGradient: "",
                isGradientTheme: false,
                appBackground: "var(--ant-color-bg-layout)"
            };
    }
}

export function getAppSurfaceBackground(themeName: ThemeName): string {
    return getThemeSurfaceMeta(themeName).appBackground;
}