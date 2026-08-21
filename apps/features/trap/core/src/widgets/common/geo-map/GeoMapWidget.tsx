/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { theme } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import type { WidgetComponentProps } from '../../../types/widget';
import {
    useGetWidgetValue,
    useGetWidgetValueArray,
} from '../../../state/Widgets/hooks';
import { useTheme } from '../../../theme/ThemeContext';
import { DEAL_NAME_KEY } from '../../constants';
import { useTapeFilter } from '../../hooks/useTapeFilter';
import {
    resolveEchartsTokens,
    applyEchartsTypography,
    EchartsRoleColors,
    withAnalyticsChartRoles,
} from '../chart/utils/resolveEchartsTokens';
import { ensureUsaMap } from './usaMap';
import styles from './GeoMapWidget.module.scss';

const DEFAULT_EMPTY_TEXT = 'No geographic data';

const COLLATERAL_FILTER_KEYS = [
    'filter.state',
    'filter.fico',
    'filter.dti',
    'filter.ltv',
    'filter.coupon',
    'filter.days_arr',
    'filter.age',
    'filter.model_year',
    'filter.manufacturer',
    'filter.model',
    'filter.originator',
    'filter.servicer',
    'filter.new_used',
    'filter.vehicle_type',
    'filter.zero_balance_reason',
];

interface GeoResult {
    mode?: string;
    eyebrow?: string;
    chartType?: string;
    mapName?: string;
    option?: Record<string, any> | null;
}

function isColorDark(color: string): boolean {
    if (!color) return false;

    let r = 255;
    let g = 255;
    let b = 255;

    const hex = color.trim();

    if (hex.startsWith('#')) {
        const h = hex.slice(1);
        const full = h.length === 3
            ? h.split('').map((c) => c + c).join('')
            : h;

        r = parseInt(full.slice(0, 2), 16);
        g = parseInt(full.slice(2, 4), 16);
        b = parseInt(full.slice(4, 6), 16);
    } else {
        const m = hex.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            [r, g, b] = m[1].split(',').map((s) => parseFloat(s.trim()));
        }
    }

    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/**
 * Region-click handler payload. Kept in a ref so ECharts' persistent click
 * listener always sees the current channel/filter without re-binding.
 */
type ClickCtx = {
    onPick: (code: string) => void;
};

/**
 * Merge a dashed accent outline onto STAGED (pending, not-yet-applied) states so
 * clicking the map gives immediate feedback before Apply. Staged states are
 * always present in the server data (the universe is locked to the applied set,
 * and everything is present pre-apply), so we only decorate existing items.
 */
function decorateStaged(
    option: Record<string, any> | null | undefined,
    stagedCodes: string[],
): Record<string, any> | null {
    if (!option) return null;
    if (!Array.isArray(stagedCodes) || stagedCodes.length === 0) {
        return option;
    }

    const clone = JSON.parse(JSON.stringify(option)) as Record<string, any>;
    const series = Array.isArray(clone.series) ? clone.series[0] : null;

    if (!series || !Array.isArray(series.data)) return clone;

    const staged = new Set(stagedCodes);

    for (const item of series.data) {
        if (item && staged.has(item.code)) {
            item.itemStyle = {
                ...(item.itemStyle ?? {}),
                borderColor: '@primary',
                borderWidth: 2.5,
                borderType: 'dashed',
            };
        }
    }

    return clone;
}

function useGeoEchart(
    option: Record<string, any> | null | undefined,
    roles: EchartsRoleColors,
    themeName: string,
    clickRef: RefObject<ClickCtx>
) {
    const chartRef = useRef<echarts.ECharts | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);
    const optionRef = useRef(option);
    const rolesRef = useRef(roles);
    const themeNameRef = useRef(themeName);

    optionRef.current = option;
    rolesRef.current = roles;
    themeNameRef.current = themeName;

    const apply = useCallback(() => {
        const chart = chartRef.current;
        const opt = optionRef.current;

        if (!chart || !opt) return;

        const resolvedOption = resolveEchartsTokens(
            opt,
            rolesRef.current,
        );

        const styledOption = applyEchartsTypography(
            resolvedOption,
            themeNameRef.current,
        );

        chart.setOption(styledOption, true);
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

            if (!node) return;

            ensureUsaMap();

            const chart = echarts.init(node);
            chartRef.current = chart;

            chart.on('click', (params: any) => {
                const code = params?.data?.code ?? null;
                if (!code) return;
                clickRef.current.onPick(code);
            });

            const ro = new ResizeObserver(() => chart.resize());
            ro.observe(node);
            roRef.current = ro;

            apply();
        },
        [apply, clickRef]
    );

    useEffect(() => {
        apply();
    }, [option, roles, themeName, apply]);

    return setHost;
}

export function GeoMapWidget(props: WidgetComponentProps) {
    const { result, loading, execute, widgetInstance, widgetDefinition, mode } = props;

    const config = widgetInstance?.config ?? {};
    const params = config?.params ?? {};
    const properties = widgetDefinition?.configSchema?.properties ?? {};
    const propDefault = (k: string) => (properties as any)?.[k]?.['default'];

    const showTitle =
        typeof params['showTitle'] === 'boolean'
            ? params['showTitle']
            : typeof propDefault('showTitle') === 'boolean'
                ? Boolean(propDefault('showTitle'))
                : true;

    const titleOverride =
        String(params['titleText'] ?? propDefault('titleText') ?? '').trim() || null;

    const emptyText =
        String(params['emptyStateText'] ?? propDefault('emptyStateText') ?? DEFAULT_EMPTY_TEXT).trim() ||
        DEFAULT_EMPTY_TEXT;

    const { themeName } = useTheme();
    const { token } = theme.useToken();

    const roleColors: EchartsRoleColors = useMemo(() => {
        const isDark = isColorDark(token.colorBgContainer);

        const baseRoles: EchartsRoleColors = {
            '@primary': token.colorPrimary,
            '@info': token.colorInfo,

            '@success': isDark
                ? token.colorSuccessBorder
                : token.colorSuccess,

            '@warning': isDark
                ? token.colorWarningBorder
                : token.colorWarning,

            '@error': isDark
                ? token.colorErrorBorder
                : token.colorError,

            '@text': token.colorText,
            '@textSecondary': token.colorTextSecondary,
            '@textTertiary': token.colorTextTertiary,
            '@border': token.colorBorderSecondary,
            '@splitLine': token.colorFillTertiary,
        };

        return withAnalyticsChartRoles(baseRoles, themeName, isDark);
    }, [token, themeName]);

    const channelId = params.channel;
    const contextKey: string = params.contextKey ?? DEAL_NAME_KEY;
    const contextValue = useGetWidgetValue({ channelId, key: contextKey });

    const filterBag = useGetWidgetValueArray({
        channelId,
        keys: COLLATERAL_FILTER_KEYS,
    }) as Record<string, any>;

    const filters = useMemo<Record<string, any>>(() => {
        const out: Record<string, any> = {};

        for (const fullKey of COLLATERAL_FILTER_KEYS) {
            const value = filterBag[fullKey];

            if (value !== null && value !== undefined && value !== '') {
                out[fullKey.replace(/^filter\./, '')] = value;
            }
        }

        return out;
    }, [filterBag]);

    const filtersSig = JSON.stringify(filters);

    const tape = useTapeFilter(channelId);
    const stagedStates = tape.staged.state;
    const stagedSig = stagedStates.join(',');

    const clickRef = useRef<ClickCtx>({ onPick: () => undefined });
    clickRef.current = {
        onPick: (code) => tape.toggleStage('state', code),
    };

    useEffect(() => {
        if (mode === 'preview') return;
        if (contextValue == null || contextValue === '') return;

        const executeContext: Record<string, any> = {
            contextKey,
            contextValue,
            filters,
            ...filters,
        };

        executeContext[contextKey] = contextValue;

        execute?.(executeContext);

        // Intentionally exclude execute from deps to avoid execute-result-rerender loops.
    }, [contextKey, contextValue, mode, filtersSig]);

    const data = (result as GeoResult | undefined) ?? null;
    const serverOption = data?.option ?? null;
    const eyebrow = titleOverride ?? data?.eyebrow ?? 'Geographic Concentration';

    const option = useMemo(
        () => decorateStaged(serverOption, stagedStates),
        [serverOption, stagedSig],
    );

    const setHost = useGeoEchart(
        option,
        roleColors,
        themeName,
        clickRef,
    );

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
                            <GlobalOutlined className={styles.headerIcon} />
                            <span className={styles.eyebrow}>{eyebrow}</span>
                        </div>
                    )}

                    {option ? (
                        <div ref={setHost} className={styles.chart} />
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyCircle}>
                                <GlobalOutlined className={styles.headerIcon} />
                            </div>
                            <span className={styles.emptyText}>{emptyText}</span>
                        </div>
                    )}
                </div>
            </div>
        </WidgetCardShell>
    );
}

export default GeoMapWidget;