/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { theme } from 'antd';
import {
    BarChartOutlined,
    AreaChartOutlined,
    LineChartOutlined,
    DotChartOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import type { WidgetComponentProps } from '../../../types/widget';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import {
    useGetWidgetValue,
    useGetWidgetValueArray,
} from '../../../state/Widgets/hooks';
import { useTheme } from '../../../theme/ThemeContext';
import { DEAL_NAME_KEY, FILTER_PREFIX } from '../../constants';
import { useTapeFilter } from '../../hooks/useTapeFilter';
import {
    resolveEchartsTokens,
    applyEchartsTypography,
    EchartsRoleColors,
    withAnalyticsChartRoles,
} from './utils/resolveEchartsTokens';
import styles from './ChartWidget.module.scss';

const DEFAULT_EMPTY_TEXT = 'No chart data';

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

interface ChartResult {
    mode?: string;
    eyebrow?: string;
    chartType?: 'bar' | 'area' | 'line' | string;
    option?: Record<string, any> | null;
}

type ChartClickCtx = {
    option: Record<string, any> | null | undefined;
    filterKey: string;
    rowFilterKey: string;
    colFilterKey: string;
    onPick: (updates: Record<string, string>) => void;
};

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
            const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
            [r, g, b] = parts;
        }
    }

    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function ChartIcon({ chartType }: { chartType?: string }) {
    switch (chartType) {
        case 'bar':
            return (
                <BarChartOutlined
                    className={styles.headerIcon}
                    style={{ transform: 'rotate(90deg)' }}
                />
            );
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

    const rawEmpty =
        params['emptyStateText'] ??
        propDefault('emptyStateText') ??
        DEFAULT_EMPTY_TEXT;
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

function firstAxis(
    option: Record<string, any> | null | undefined,
    key: 'xAxis' | 'yAxis'
): Record<string, any> {
    const axis = option?.[key];

    if (Array.isArray(axis)) return axis[0] ?? {};
    return axis ?? {};
}

function valueAtAxis(axis: Record<string, any>, index: number): string | null {
    const data = axis?.data;

    if (!Array.isArray(data)) return null;

    const value = data[index];

    if (value === null || value === undefined || value === '') return null;

    return String(value);
}

function resolveChartClick(
    params: any,
    ctx: ChartClickCtx
): Record<string, string> | null {
    const hasHeatmapKeys = Boolean(ctx.rowFilterKey && ctx.colFilterKey);

    if (hasHeatmapKeys) {
        const value = params?.value;

        if (!Array.isArray(value) || value.length < 2) return null;

        const colIndex = Number(value[0]);
        const rowIndex = Number(value[1]);

        if (!Number.isFinite(colIndex) || !Number.isFinite(rowIndex)) {
            return null;
        }

        const xAxis = firstAxis(ctx.option, 'xAxis');
        const yAxis = firstAxis(ctx.option, 'yAxis');

        const colValue = valueAtAxis(xAxis, colIndex);
        const rowValue = valueAtAxis(yAxis, rowIndex);

        if (!rowValue || !colValue) return null;

        return {
            [ctx.rowFilterKey]: rowValue,
            [ctx.colFilterKey]: colValue,
        };
    }

    if (ctx.filterKey) {
        const rawLabel = params?.name ?? params?.data?.name;

        if (rawLabel === null || rawLabel === undefined || rawLabel === '') {
            return null;
        }

        const label = String(rawLabel);

        if (label.toLowerCase() === 'other') return null;

        return {
            [ctx.filterKey]: label,
        };
    }

    return null;
}

function useEchart(
    option: Record<string, any> | null | undefined,
    roles: EchartsRoleColors,
    themeName: string,
    clickRef: MutableRefObject<ChartClickCtx>
) {
    const chartRef = useRef<echarts.ECharts | null>(null);
    const hostRef = useRef<HTMLDivElement | null>(null);
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

            hostRef.current = node;

            if (!node) return;

            const chart = echarts.init(node);
            chartRef.current = chart;

            chart.on('click', (params: any) => {
                const updates = resolveChartClick(params, clickRef.current);

                if (!updates) return;

                clickRef.current.onPick(updates);
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

const STAGED_ITEM_STYLE = {
    borderColor: '@primary',
    borderWidth: 2,
    borderType: 'dashed',
};

function firstCategoryAxis(option: any): any {
    for (const axisKey of ['xAxis', 'yAxis']) {
        const axis = option?.[axisKey];
        if (!axis) continue;

        const list = Array.isArray(axis) ? axis : [axis];

        for (const candidate of list) {
            if (
                candidate &&
                candidate.type === 'category' &&
                Array.isArray(candidate.data)
            ) {
                return candidate;
            }
        }
    }

    return null;
}

/**
 * Merge a dashed accent outline onto STAGED (pending, not-yet-applied) bars or
 * slices, so charts give the same pre-Apply feedback as the geo map. Matches on
 * the category label — which is exactly the value a click emits (see
 * resolveChartClick), so the highlighted bar is the one you clicked.
 */
function decorateChartStaged(
    option: Record<string, any> | null | undefined,
    stagedValues: string[],
): Record<string, any> | null {
    if (!option) return null;
    if (!Array.isArray(stagedValues) || stagedValues.length === 0) {
        return option;
    }

    const clone = JSON.parse(JSON.stringify(option)) as Record<string, any>;
    const series = Array.isArray(clone.series) ? clone.series[0] : null;

    if (!series || !Array.isArray(series.data)) return clone;

    const staged = new Set(stagedValues.map((value) => String(value).toUpperCase()));

    const markItem = (item: any, fallback: number) => {
        if (item !== null && typeof item === 'object') {
            item.itemStyle = { ...(item.itemStyle ?? {}), ...STAGED_ITEM_STYLE };
            return item;
        }
        return { value: item ?? fallback, itemStyle: { ...STAGED_ITEM_STYLE } };
    };

    const axis = firstCategoryAxis(clone);
    const categories: any[] | null =
        axis && Array.isArray(axis.data) ? axis.data : null;

    if (categories) {
        for (let index = 0; index < categories.length; index += 1) {
            const raw = categories[index];
            const name = raw && typeof raw === 'object' ? raw.value : raw;

            if (name != null && staged.has(String(name).toUpperCase())) {
                series.data[index] = markItem(series.data[index], 0);
            }
        }
    } else {
        series.data = series.data.map((item: any) => {
            const name = item && typeof item === 'object' ? item.name : null;

            if (name != null && staged.has(String(name).toUpperCase())) {
                return markItem(item, 0);
            }

            return item;
        });
    }

    return clone;
}

export function ChartWidget(props: WidgetComponentProps) {
    const { result, loading, execute, widgetInstance, widgetDefinition, mode } =
        props;

    const config = widgetInstance?.config ?? {};
    const params = config?.params ?? {};
    const properties = widgetDefinition?.configSchema?.properties ?? {};

    const { titleOverride, emptyText, showTitle } = getWidgetValues(
        config,
        properties
    );

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

            '@warningDark': isDark
                ? token.colorWarningBorderHover
                : token.colorWarningActive,

            '@error': isDark
                ? token.colorErrorBorder
                : token.colorError,

            '@errorDark': isDark
                ? token.colorErrorBorderHover
                : token.colorErrorActive,

            '@text': token.colorText,
            '@textSecondary': token.colorTextSecondary,
            '@textTertiary': token.colorTextTertiary,
            '@border': token.colorBorderSecondary,
            '@splitLine': token.colorFillTertiary,
        };

        return withAnalyticsChartRoles(baseRoles, themeName, isDark);
    }, [token, themeName]);

    const channelId = params.channel;
    const schemaKey = String(params.schemaKey ?? '').trim();

    const contextKey: string = params.contextKey ?? DEAL_NAME_KEY;
    const contextValue = useGetWidgetValue({ channelId, key: contextKey });

    const filterKey = String(params.filterKey ?? '').trim();
    const rowFilterKey = String(params.rowFilterKey ?? '').trim();
    const colFilterKey = String(params.colFilterKey ?? '').trim();

    const isTapeChart = schemaKey.startsWith('tape.');

    const activeFilterKeys = useMemo(
        () => (isTapeChart ? COLLATERAL_FILTER_KEYS : []),
        [isTapeChart]
    );

    const filterBag = useGetWidgetValueArray({
        channelId,
        keys: activeFilterKeys,
    }) as Record<string, any>;

    const filters = useMemo<Record<string, any>>(() => {
        const out: Record<string, any> = {};

        for (const fullKey of activeFilterKeys) {
            const value = filterBag[fullKey];

            if (value !== null && value !== undefined && value !== '') {
                out[fullKey.replace(/^filter\./, '')] = value;
            }
        }

        return out;
    }, [filterBag, activeFilterKeys.join(',')]);

    const filtersSig = JSON.stringify(filters);

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

        // Intentionally exclude execute from deps.
        // Including execute can cause an execute -> result -> rerender -> execute loop
        // if parent recreates the execute callback after each result update.
    }, [contextKey, contextValue, mode, filtersSig, schemaKey]);

    const data = (result as ChartResult | undefined) ?? null;
    const option = data?.option ?? null;
    const eyebrow = titleOverride ?? data?.eyebrow ?? 'Chart';

    const tape = useTapeFilter(channelId);

    const stagedDim = filterKey.startsWith(FILTER_PREFIX)
        ? filterKey.slice(FILTER_PREFIX.length)
        : filterKey;
    const stagedValues = tape.staged[stagedDim] ?? [];
    const stagedSig = stagedValues.join(',');
    const decoratedOption = useMemo(
        () => decorateChartStaged(option, stagedValues),
        [option, stagedSig],
    );

    const clickRef = useRef<ChartClickCtx>({
        option: null,
        filterKey: '',
        rowFilterKey: '',
        colFilterKey: '',
        onPick: () => undefined,
    });

    clickRef.current = {
        option,
        filterKey,
        rowFilterKey,
        colFilterKey,
        // Stage the clicked value(s) as a multi-select toggle instead of firing
        // filter.* directly. Nothing filters until the FilterBar's Apply commits.
        onPick: (updates: Record<string, string>) => {
            for (const [fullKey, value] of Object.entries(updates)) {
                const dimension = fullKey.startsWith(FILTER_PREFIX)
                    ? fullKey.slice(FILTER_PREFIX.length)
                    : fullKey;
                tape.toggleStage(dimension, value);
            }
        },
    };

    const setHost = useEchart(
        decoratedOption,
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
                            <span className={styles.emptyText}>
                                {emptyText}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </WidgetCardShell>
    );
}