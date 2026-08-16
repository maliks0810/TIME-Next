/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { ProfileOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import type { WidgetComponentProps } from '../../../types/widget';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { useTheme } from '../../../theme/ThemeContext';
import { DEAL_NAME_KEY } from '../../constants';
import { MetricRow } from './components/MetricRow';
import {
    planSummary,
    RowStyle,
} from './components/planLayout';
import {
    normaliseSummary,
    NormalisedSummary,
} from './utils/helpers';
import { summaryPanelPreviewResult } from './summaryPanelPreviewResult';
import styles from './SummaryPanel.module.scss';

const ROW_STYLES: RowStyle[] = [
    'stacked',
    'inline',
];

const DEFAULT_EMPTY_TEXT = 'No summary data';

function getWidgetValues(
    config: Record<string, any>,
    properties: Record<string, WidgetConfigProperty>,
): {
    rowStyle: RowStyle;
    showFooter: boolean;
    titleOverride: string | null;
    emptyText: string;
} {
    const params = config?.params ?? {};

    const propDefault = (key: string) =>
        properties?.[key]?.['default'];

    const rawRowStyle =
        params['rowStyle'] ??
        propDefault('rowStyle') ??
        'stacked';

    const rowStyle: RowStyle =
        ROW_STYLES.includes(rawRowStyle)
            ? rawRowStyle
            : 'stacked';

    const rawFooter = params['showFooter'];

    const showFooter =
        typeof rawFooter === 'boolean'
            ? rawFooter
            : typeof propDefault('showFooter') === 'boolean'
              ? Boolean(propDefault('showFooter'))
              : true;

    const rawTitle =
        params['titleText'] ??
        propDefault('titleText') ??
        '';

    const titleOverride =
        String(rawTitle).trim() || null;

    const rawEmpty =
        params['emptyStateText'] ??
        propDefault('emptyStateText') ??
        DEFAULT_EMPTY_TEXT;

    const emptyText =
        String(rawEmpty).trim() ||
        DEFAULT_EMPTY_TEXT;

    return {
        rowStyle,
        showFooter,
        titleOverride,
        emptyText,
    };
}

function useElementSize<T extends HTMLElement>() {
    const [size, setSize] = useState<{
        widthPx: number;
        heightPx: number;
    }>({
        widthPx: 0,
        heightPx: 0,
    });

    const observerRef =
        useRef<ResizeObserver | null>(null);

    const ref = useCallback(
        (node: T | null) => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            if (!node) return;

            const measure = () => {
                setSize({
                    widthPx: node.clientWidth,
                    heightPx: node.clientHeight,
                });
            };

            measure();

            const observer =
                new ResizeObserver(measure);

            observer.observe(node);
            observerRef.current = observer;
        },
        [],
    );

    return {
        ref,
        ...size,
    };
}

function Header({
    eyebrow,
    collateralType,
    showChip,
}: {
    eyebrow: string;
    collateralType: string | null;
    showChip: boolean;
}) {
    return (
        <div className={styles.header}>
            <ProfileOutlined
                className={styles.headerIcon}
            />

            <span className={styles.eyebrow}>
                {eyebrow}
            </span>

            {showChip && Boolean(collateralType) && (
                <span className={styles.chip}>
                    {collateralType}
                </span>
            )}
        </div>
    );
}

export function SummaryPanelWidget(
    props: WidgetComponentProps,
) {
    const {
        result,
        loading,
        execute,
        widgetInstance,
        widgetDefinition,
        mode,
    } = props;

    const config =
        widgetInstance?.config ?? {};

    const properties =
        widgetDefinition?.configSchema
            ?.properties ?? {};

    const {
        rowStyle,
        showFooter,
        titleOverride,
        emptyText,
    } = getWidgetValues(
        config,
        properties,
    );

    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight =
        themeName === 'wealthLight';

    const isWealthDark =
        themeName === 'wealthDark';

    const {
        ref,
        widthPx,
        heightPx,
    } = useElementSize<HTMLDivElement>();

    const plan =
        planSummary(
            widthPx,
            heightPx,
        );

    const showChip =
        plan.headerMode === 'full';

    const channelId =
        config?.params?.channel;

    const dealName =
        useGetWidgetValue({
            channelId,
            key: DEAL_NAME_KEY,
        });

    useEffect(() => {
        if (mode === 'preview') return;
        if (!dealName) return;

        execute?.({
            dealName,
        });

        // The runtime supplies execute. Excluding it avoids an execute/result
        // rerender loop if the callback identity changes after each request.
    }, [
        dealName,
        mode,
    ]);

    const data: NormalisedSummary | null =
        mode === 'preview'
            ? summaryPanelPreviewResult
            : normaliseSummary(result);

    const eyebrow =
        titleOverride ??
        data?.eyebrow ??
        '';

    const hasMetrics =
        Boolean(
            data &&
            data.metrics.length > 0,
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
                <div
                    ref={ref}
                    className={clsx(
                        styles.container,
                        {
                            [styles.wealth]:
                                isWealthTheme,

                            [styles.wealthLight]:
                                isWealthLight,

                            [styles.wealthDark]:
                                isWealthDark,
                        },
                    )}
                >
                    {Boolean(eyebrow) && (
                        <Header
                            eyebrow={eyebrow}
                            collateralType={
                                data?.collateralType ??
                                null
                            }
                            showChip={showChip}
                        />
                    )}

                    {hasMetrics ? (
                        <>
                            <div
                                className={clsx(
                                    styles.body,
                                    plan.fade &&
                                        styles.bodyFade,
                                )}
                            >
                                <div
                                    className={clsx(
                                        styles.grid,
                                        plan.gridCols === 2
                                            ? styles.gridTwo
                                            : styles.gridOne,
                                    )}
                                >
                                    {data!.metrics.map(
                                        (metric) => (
                                            <MetricRow
                                                key={
                                                    metric.key
                                                }
                                                metric={
                                                    metric
                                                }
                                                rowStyle={
                                                    rowStyle
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            </div>

                            {showFooter &&
                                plan.footer &&
                                Boolean(data!.asOf) && (
                                    <div
                                        className={
                                            styles.footer
                                        }
                                    >
                                        <span
                                            className={
                                                styles.footerDot
                                            }
                                        />

                                        <span
                                            className={
                                                styles.footerText
                                            }
                                        >
                                            as of{' '}
                                            {data!.asOf}
                                        </span>
                                    </div>
                                )}
                        </>
                    ) : (
                        <div className={styles.loading}>
                            <div
                                className={
                                    styles.loadingCircle
                                }
                            >
                                <ProfileOutlined
                                    className={
                                        styles.loadingIcon
                                    }
                                />
                            </div>

                            <span
                                className={
                                    styles.loadingText
                                }
                            >
                                {emptyText}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </WidgetCardShell>
    );
}