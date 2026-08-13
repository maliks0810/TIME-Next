/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { theme } from 'antd';
import { BarChartOutlined, AreaChartOutlined, LineChartOutlined, DotChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import type { WidgetComponentProps } from '../../../types/widget';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { DEAL_NAME_KEY } from '../../constants';
import { resolveEchartsTokens, EchartsRoleColors } from './utils/resolveEchartsTokens';
import styles from './ChartWidget.module.scss';

const DEFAULT_EMPTY_TEXT = 'No chart data';

interface ChartResult {
    mode?: string;
    eyebrow?: string;
    chartType?: 'bar' | 'area' | 'line' | string;
    option?: Record<string, any> | null;
}

function isColorDark(color: string): boolean {
    if (!color) return false;
    let r = 255, g = 255, b = 255;
    const hex = color.trim();
    if (hex.startsWith('#')) {
        const h = hex.slice(1);
        const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
        r = parseInt(full.slice(0, 2), 16);
        g = parseInt(full.slice(2, 4), 16);
        b = parseInt(full.slice(4, 6), 16);
    } else {
        const m = hex.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
            [r, g, b] = parts;
        }
    }
    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function ChartIcon({ chartType }: { chartType?: string }) {
    switch (chartType) {
        case 'bar':
            return <BarChartOutlined className={styles.headerIcon} style={{ transform: 'rotate(90deg)' }} />;
        case 'area':
            return <AreaChartOutlined className={styles.headerIcon} />;
        case 'line':
            return <LineChartOutlined className={styles.headerIcon} />;
        default:
            return <DotChartOutlined className={styles.headerIcon} />;
    }
}

function getWidgetValues(
    config: Record<string, any>,
    properties: Record<string, WidgetConfigProperty>
): { titleOverride: string | null; emptyText: string; showTitle: boolean } {
    const params = config?.params ?? {};
    const propDefault = (k: string) => properties?.[k]?.['default'];

    const rawTitle = params['titleText'] ?? propDefault('titleText') ?? '';
    const titleOverride = String(rawTitle).trim() || null;

    const rawEmpty = params['emptyStateText'] ?? propDefault('emptyStateText') ?? DEFAULT_EMPTY_TEXT;
    const emptyText = String(rawEmpty).trim() || DEFAULT_EMPTY_TEXT;

    const rawShow = params['showTitle'];
    const showTitle =
        typeof rawShow === 'boolean'
            ? rawShow
            : typeof propDefault('showTitle') === 'boolean'
              ? Boolean(propDefault('showTitle'))
              : true;

    return { titleOverride, emptyText, showTitle };
}

function useEchart(option: Record<string, any> | null | undefined, roles: EchartsRoleColors) {
    const chartRef = useRef<echarts.ECharts | null>(null);
    const hostRef = useRef<HTMLDivElement | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);
    const optionRef = useRef(option);
    const rolesRef = useRef(roles);
    optionRef.current = option;
    rolesRef.current = roles;

    const apply = useCallback(() => {
        const chart = chartRef.current;
        const opt = optionRef.current;
        if (!chart || !opt) return;
        chart.setOption(resolveEchartsTokens(opt, rolesRef.current), true);
    }, []);

    const setHost = useCallback(
        (node: HTMLDivElement | null) => {
            if (roRef.current) {
                roRef.current.disconnect();
                roRef.current = null;
            }
            if (chartRef.current) {
                chartRef.current.dispose();
                chartRef.current = null;
            }
            hostRef.current = node;
            if (!node) return;

            const chart = echarts.init(node);
            chartRef.current = chart;

            const ro = new ResizeObserver(() => chart.resize());
            ro.observe(node);
            roRef.current = ro;

            apply();
        },
        [apply]
    );

    useEffect(() => {
        apply();
    }, [option, roles, apply]);

    return setHost;
}

export function ChartWidget(props: WidgetComponentProps) {
    const { result, loading, execute, widgetInstance, widgetDefinition, mode } = props;

    const config = widgetInstance?.config ?? {};
    const properties = widgetDefinition?.configSchema?.properties ?? {};
    const { titleOverride, emptyText, showTitle } = getWidgetValues(config, properties);

    const { token } = theme.useToken();
    const roleColors: EchartsRoleColors = useMemo(() => {
        const isDark = isColorDark(token.colorBgContainer);

        // BASE tokens only — the resolver derives every "@<name>FadeNN" gradient
        // stop from these, so we do NOT hardcode fade variants here.
        return {
            '@primary': token.colorPrimary,

            // Performing / Current — BLUE.
            '@info': token.colorInfo,

            // Severity ramp
            '@success': isDark ? token.colorSuccessBorder : token.colorSuccess,
            '@warning': isDark ? token.colorWarningBorder : token.colorWarning,
            '@warningDark': isDark ? token.colorWarningBorderHover : token.colorWarningActive,
            '@error': isDark ? token.colorErrorBorder : token.colorError,
            '@errorDark': isDark ? token.colorErrorBorderHover : token.colorErrorActive,

            // Text + structure
            '@text': token.colorText,
            '@textSecondary': token.colorTextSecondary,
            '@textTertiary': token.colorTextTertiary,
            '@border': token.colorBorderSecondary,
            '@splitLine': token.colorFillTertiary,
        };
    }, [token]);

    // ── Context binding (KEY-AGNOSTIC) ──
    // The widget no longer hardcodes the deal key. `contextKey` says WHICH channel
    // value to read (deal name today; portfolio id, cusip, etc. tomorrow) and
    // defaults to DEAL_NAME_KEY for back-compat. The pulled value is passed to
    // execute both under the neutral `contextValue` field AND under its own key
    // name, so existing executors that read `dealName` keep working while new
    // executors can read `contextValue` (or the configured key) generically.
    const channelId = config?.params?.channel;
    const contextKey: string = config?.params?.contextKey ?? DEAL_NAME_KEY;
    const contextValue = useGetWidgetValue({ channelId, key: contextKey });

    useEffect(() => {
        if (mode === 'preview') return;
        if (contextValue == null || contextValue === '') return;

        // Neutral field + keyed field (e.g. { contextKey: 'dealName',
        // contextValue: 'exar2502', dealName: 'exar2502' }). Existing deal
        // executors resolve `dealName`; future ones resolve `contextValue`.
        execute?.({ contextKey, contextValue, [contextKey]: contextValue });
    }, [contextKey, contextValue, mode]);

    const data = (result as ChartResult | undefined) ?? null;
    const option = data?.option ?? null;
    const eyebrow = titleOverride ?? data?.eyebrow ?? 'Chart';

    const setHost = useEchart(option, roleColors);

    if (loading) {
        return (
            <WidgetCardShell overflow="hidden">
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    return (
        <WidgetCardShell overflow="hidden">
            <div className={styles.fill}>
                <div className={styles.container}>
                    {showTitle && (
                        <div className={styles.header}>
                            <ChartIcon chartType={data?.chartType} />
                            <span className={styles.eyebrow}>{eyebrow}</span>
                        </div>
                    )}

                    {option ? (
                        <div ref={setHost} className={styles.chart} />
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyCircle}>
                                <ChartIcon chartType={data?.chartType} />
                            </div>
                            <span className={styles.emptyText}>{emptyText}</span>
                        </div>
                    )}
                </div>
            </div>
        </WidgetCardShell>
    );
}
