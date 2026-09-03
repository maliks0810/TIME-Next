/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from 'react';
import { Typography, Skeleton } from 'antd';
import clsx from 'clsx';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { MethodologyPopover } from '../../../components/methodology/MethodologyPopover';
import type { WidgetMethodology } from '../../../components/methodology/types';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import {
    useGetWidgetValue,
    useGetWidgetValueArray,
    useSetWidgetValue,
} from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { useTheme } from '../../../theme/ThemeContext';
import { COUNTER_TILE_STORE_KEY, DEAL_NAME_KEY } from '../../constants';
import styles from './CounterTile.module.scss';

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

const getWidgetValues = (
    config: Record<string, any>,
    properties: Record<string, WidgetConfigProperty>
) => {
    const params = config?.params ?? {};
    const getDefault = (key: string) => properties?.[key]?.['default'];

    return {
        themeMode: params.themeMode ?? getDefault('themeMode') ?? 'theme',
        textColor: params.textColor ?? getDefault('textColor') ?? '',
        text: params.titleText ?? getDefault('titleText') ?? '',
        position: params.titlePosition ?? getDefault('titlePosition') ?? 'top',
        suffix: params.suffixText ?? getDefault('suffixText') ?? '',
        prefix: params.prefixText ?? getDefault('prefixText') ?? '',
        emptyText: params.emptyStateText ?? getDefault('emptyStateText') ?? 'No value',
    };
};

export const CounterTileWidget = (props: WidgetComponentProps) => {
    const { widgetInstance, widgetDefinition, result, loading, execute, mode } = props;
    const { config = {} } = widgetInstance;
    const params = config.params ?? {};
    const channelId = params.channel;
    const schemaKey = String(params.schemaKey ?? '').trim();
    const metricValue = params.filter ?? null;
    const isTapeKpi = schemaKey === 'tape.kpi';

    const { themeName } = useTheme();

    const isWealthTheme = themeName === 'wealthLight' || themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const contextKey: string = params.contextKey ?? DEAL_NAME_KEY;
    const contextValue = useGetWidgetValue({ channelId, key: contextKey });

    const activeFilterKeys = useMemo(() => (isTapeKpi ? COLLATERAL_FILTER_KEYS : []), [isTapeKpi]);

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
    }, [filterBag, activeFilterKeys]);

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

        // execute is intentionally excluded: an unstable execute callback can
        // create an execute/result/rerender loop.
    }, [contextKey, contextValue, mode, filtersSig, schemaKey]);

    const storeKey = COUNTER_TILE_STORE_KEY;
    const counterTileValue = useGetWidgetValue({ channelId, key: storeKey });
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();

    const properties = widgetDefinition?.configSchema?.properties ?? {};

    const {
        text,
        position,
        suffix,
        prefix,
        emptyText,
        textColor,
        themeMode,
    } = useMemo(() => getWidgetValues(config, properties), [config, properties]);

    const handleClick = () => {
        if (isTapeKpi) return;

        const clickable = params.clickable ?? true;
        if (!clickable) return;

        setWidgetValueToChannel({
            key: storeKey,
            channelId,
            value: counterTileValue === metricValue ? null : metricValue,
            activeTab,
            widgetId: widgetInstance.id,
        });
    };

    const widgetStyles = useMemo(() => {
        return {
            titlePosition: position === 'bottom' ? styles.bottom : styles.top,
        };
    }, [position]);

    const widgetColor = useMemo(() => {
        switch (params.themeMode) {
            case 'customSolid':
                return {
                    backgroundColor: params.customColor ?? '#FFFFFF',
                    background: '',
                };
            case 'customGradient':
                return {
                    background: `linear-gradient(45deg, ${params.customGradientStart ?? '#2563eb'}, ${params.customGradientEnd ?? '#60a5fa'})`,
                    backgroundColor: '',
                };
            default:
                return {
                    backgroundColor: '',
                    background: '',
                };
        }
    }, [params]);

    const content = useMemo(() => {
        if (!result) return emptyText;
        return result['counter'] ?? emptyText;
    }, [result, emptyText]);

    const widgetTextTitle = useMemo(() => {
        if (text) return text;
        return result?.['title'] ?? '';
    }, [text, result]);

    const methodology = useMemo<WidgetMethodology | undefined>(() => {
        const value = result?.['methodology'];

        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return undefined;
        }

        return value as WidgetMethodology;
    }, [result]);

    const hasDisplayData =
        !loading &&
        content !== emptyText &&
        content !== '-' &&
        content !== '—' &&
        content !== '';

    const customTextColor = useMemo(
        () => (themeMode === 'theme' ? {} : { color: textColor }),
        [themeMode, textColor]
    );

    return (
        <WidgetCardShell style={widgetColor}>
            <div
                className={clsx(styles.container, {
                    [styles.readOnly]: isTapeKpi,
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
                onClick={handleClick}
            >
                <div className={styles.titleRow}>
                    <Typography.Title
                        level={5}
                        className={clsx(widgetStyles.titlePosition, styles.cardTitle, {
                            [styles.activeTile]:
                                !isTapeKpi && metricValue === counterTileValue,
                        })}
                        style={customTextColor}
                    >
                        {widgetTextTitle}
                    </Typography.Title>

                    {methodology && hasDisplayData ? (
                        <MethodologyPopover methodology={methodology} />
                    ) : null}
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <Skeleton.Button
                            active
                            size="small"
                            style={{
                                width: '100%',
                                minWidth: 72,
                                height: 24,
                            }}
                        />
                    ) : (
                        <>
                            <Typography.Text className={styles.prefix} style={customTextColor}>
                                {prefix}
                            </Typography.Text>
                            <Typography.Text className={styles.value} style={customTextColor}>
                                {content}
                            </Typography.Text>
                            <Typography.Text className={styles.suffix} style={customTextColor}>
                                {suffix}
                            </Typography.Text>
                        </>
                    )}
                </div>
            </div>
        </WidgetCardShell>
    );
};
