/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { theme } from "antd";
import * as echarts from "echarts";
import { useTheme } from "../../../../../theme/ThemeContext";
import {
    resolveEchartsTokens,
    applyEchartsTypography,
    withAnalyticsChartRoles,
    type EchartsRoleColors,
} from "../../../../common/chart/utils/resolveEchartsTokens";
import { pastel } from "../constants";
import type { CashflowPeriod, Scenario } from "../types";

type Props = {
    scenario: Scenario | null;
    /** Sampled periods (already downsampled by the parent CashFlowZone). */
    rows: CashflowPeriod[] | null;
};

/** Perceived-luminance dark check — mirrors ChartWidget's isColorDark. */
function isColorDark(color: string): boolean {
    if (!color) return false;
    let r = 255;
    let g = 255;
    let b = 255;
    const hex = color.trim();
    if (hex.startsWith("#")) {
        const h = hex.slice(1);
        const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
        r = parseInt(full.slice(0, 2), 16);
        g = parseInt(full.slice(2, 4), 16);
        b = parseInt(full.slice(4, 6), 16);
    } else {
        const m = hex.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
            [r, g, b] = parts;
        }
    }
    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/** Compact axis label: 1.2M / 340k / 900. */
function compact(v: number): string {
    const a = Math.abs(v);
    if (a >= 1_000_000) return `${round1(v / 1_000_000)}M`;
    if (a >= 1_000) return `${Math.round(v / 1_000)}k`;
    return `${Math.round(v)}`;
}
function round1(n: number): number {
    return Math.round(n * 10) / 10;
}

/**
 * Cash-flow chart — an amortization combo:
 *   • Stacked bars per period: Principal (bottom) + Interest (top); the stack
 *     height equals the period Cashflow (principal + interest), so no separate
 *     Cashflow series is drawn.
 *   • Balance as a line on a SECOND (right) Y axis — the declining pool/tranche
 *     balance sweeping to zero.
 *
 * Rendered through the shared analytics ECharts pipeline (resolveEchartsTokens +
 * typography) so it themes identically to the CGL/collateral charts. Bars use the
 * live scenario identity color (a literal, passed through the resolver untouched);
 * the balance line and all chrome use @role tokens.
 */
export default function CashFlowChart({ scenario, rows }: Props) {
    const { themeName } = useTheme();
    const { token } = theme.useToken();

    // Same role-map construction ChartWidget uses, so colors match app-wide.
    const roleColors: EchartsRoleColors = React.useMemo(() => {
        const isDark = isColorDark(token.colorBgContainer);
        const baseRoles: EchartsRoleColors = {
            "@primary": token.colorPrimary,
            "@info": token.colorInfo,
            "@success": isDark ? token.colorSuccessBorder : token.colorSuccess,
            "@warning": isDark ? token.colorWarningBorder : token.colorWarning,
            "@warningDark": isDark ? token.colorWarningBorderHover : token.colorWarningActive,
            "@error": isDark ? token.colorErrorBorder : token.colorError,
            "@errorDark": isDark ? token.colorErrorBorderHover : token.colorErrorActive,
            "@text": token.colorText,
            "@textSecondary": token.colorTextSecondary,
            "@textTertiary": token.colorTextTertiary,
            "@border": token.colorBorderSecondary,
            "@splitLine": token.colorFillTertiary,
            "@surface": token.colorBgElevated,
        };
        return withAnalyticsChartRoles(baseRoles, themeName, isDark);
    }, [token, themeName]);

    // Bar fill = scenario identity color (literal hex/rgb; resolver ignores it).
    const fill = scenario ? pastel(scenario.color) : "@primary";

    const option = React.useMemo(() => {
        const periods = rows ?? [];
        return {
            animationDuration: 250,
            grid: { top: 14, right: 14, bottom: 30, left: 12, containLabel: true },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                backgroundColor: "@surface",
                borderColor: "@border",
                borderWidth: 1,
                textStyle: { color: "@text", fontSize: 11 },
                extraCssText: "box-shadow: 0 4px 16px rgba(0,0,0,0.16); border-radius: 6px;",
                valueFormatter: (v: number) =>
                    typeof v === "number"
                        ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : v,
            },
            legend: {
                bottom: 0,
                itemWidth: 10,
                itemHeight: 10,
                textStyle: { color: "@textTertiary", fontSize: 10 },
                data: ["Principal", "Interest", "Balance"],
            },
            xAxis: {
                type: "category",
                data: periods.map((p) => p.date ?? String(p.period)),
                axisTick: { show: false },
                axisLine: { lineStyle: { color: "@splitLine" } },
                axisLabel: { color: "@textTertiary", fontSize: 8, interval: "auto", hideOverlap: true },
            },
            yAxis: [
                {
                    // Left: period cash flows (bars).
                    type: "value",
                    splitLine: { lineStyle: { color: "@splitLine" } },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: "@textTertiary", fontSize: 9, formatter: (v: number) => compact(v) },
                },
                {
                    // Right: remaining balance (line).
                    type: "value",
                    position: "right",
                    splitLine: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: "@textTertiary", fontSize: 9, formatter: (v: number) => compact(v) },
                },
            ],
            series: [
                {
                    name: "Principal",
                    type: "bar",
                    stack: "cf",
                    yAxisIndex: 0,
                    barMaxWidth: 22,
                    emphasis: { focus: "series" },
                    itemStyle: { color: fill },
                    data: periods.map((p) => p.principal),
                },
                {
                    name: "Interest",
                    type: "bar",
                    stack: "cf",
                    yAxisIndex: 0,
                    barMaxWidth: 22,
                    emphasis: { focus: "series" },
                    itemStyle: { color: fill, opacity: 0.45 },
                    data: periods.map((p) => p.interest),
                },
                {
                    name: "Balance",
                    type: "line",
                    yAxisIndex: 1,
                    smooth: true,
                    symbol: "none",
                    z: 3,
                    lineStyle: { width: 2, color: "@primary" },
                    itemStyle: { color: "@primary" },
                    emphasis: { focus: "series" },
                    data: periods.map((p) => p.balance ?? p.endBal),
                },
            ],
        };
    }, [rows, fill]);

    // ── ECharts lifecycle (callback ref + ResizeObserver + dispose) ──
    const chartRef = React.useRef<echarts.ECharts | null>(null);
    const roRef = React.useRef<ResizeObserver | null>(null);
    const optionRef = React.useRef(option);
    const rolesRef = React.useRef(roleColors);
    const themeNameRef = React.useRef(themeName);
    optionRef.current = option;
    rolesRef.current = roleColors;
    themeNameRef.current = themeName;

    const apply = React.useCallback(() => {
        const chart = chartRef.current;
        if (!chart) return;
        const resolved = resolveEchartsTokens(optionRef.current, rolesRef.current);
        const styled = applyEchartsTypography(resolved, themeNameRef.current);
        chart.setOption(styled as any, true);
    }, []);

    const setHost = React.useCallback(
        (node: HTMLDivElement | null) => {
            roRef.current?.disconnect();
            roRef.current = null;
            if (chartRef.current) {
                chartRef.current.dispose();
                chartRef.current = null;
            }
            if (!node) return;
            const chart = echarts.init(node);
            chartRef.current = chart;
            const ro = new ResizeObserver(() => chart.resize());
            ro.observe(node);
            roRef.current = ro;
            apply();
        },
        [apply],
    );

    React.useEffect(() => {
        apply();
    }, [option, roleColors, themeName, apply]);

    return <div ref={setHost} style={{ width: "100%", height: "100%", minHeight: 140 }} />;
}
