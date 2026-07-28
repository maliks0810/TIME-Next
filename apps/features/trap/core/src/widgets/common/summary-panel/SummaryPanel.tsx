/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfileOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import type { WidgetComponentProps } from '../../../types/widget';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { DEAL_NAME_KEY } from '../../constants';
import { MetricRow } from './components/MetricRow';
import { planSummary, RowStyle } from './components/planLayout';
import { normaliseSummary, NormalisedSummary } from './utils/helpers';
import { summaryPanelPreviewResult } from './summaryPanelPreviewResult';
import styles from './SummaryPanel.module.scss';

const ROW_STYLES: RowStyle[] = ['stacked', 'inline'];
const DEFAULT_EMPTY_TEXT = 'No summary data';

function getWidgetValues(
    config: Record<string, any>,
    properties: Record<string, WidgetConfigProperty>
): { rowStyle: RowStyle; showFooter: boolean; titleOverride: string | null; emptyText: string } {
    const params = config?.params ?? {};
    const propDefault = (k: string) => properties?.[k]?.['default'];

    const rawRowStyle = params['rowStyle'] ?? propDefault('rowStyle') ?? 'stacked';
    const rowStyle: RowStyle = ROW_STYLES.includes(rawRowStyle) ? rawRowStyle : 'stacked';

    const rawFooter = params['showFooter'];
    const showFooter =
        typeof rawFooter === 'boolean'
            ? rawFooter
            : typeof propDefault('showFooter') === 'boolean'
              ? Boolean(propDefault('showFooter'))
              : true;

    const rawTitle = params['titleText'] ?? propDefault('titleText') ?? '';
    const titleOverride = String(rawTitle).trim() || null;

    const rawEmpty = params['emptyStateText'] ?? propDefault('emptyStateText') ?? DEFAULT_EMPTY_TEXT;
    const emptyText = String(rawEmpty).trim() || DEFAULT_EMPTY_TEXT;

    return { rowStyle, showFooter, titleOverride, emptyText };
}

/**
 * Measure a container's pixel width/height via ResizeObserver, using a CALLBACK
 * REF (not useLayoutEffect + useRef).
 *
 * Why a callback ref: the widget has a `loading` early-return, so the measured
 * .container mounts AFTER the first render. An effect with [] deps runs once while
 * ref.current is still null (during loading) and never re-attaches when the real
 * node mounts — leaving the size stuck at 0×0 (which forced permanent 1-column).
 * A callback ref fires exactly when the node attaches/detaches, so the observer is
 * always wired to the live DOM regardless of loading transitions.
 */
function useElementSize<T extends HTMLElement>() {
    const [size, setSize] = useState<{ widthPx: number; heightPx: number }>({ widthPx: 0, heightPx: 0 });
    const roRef = useRef<ResizeObserver | null>(null);

    const ref = useCallback((node: T | null) => {
        // Tear down any previous observer (node changed or unmounted).
        if (roRef.current) {
            roRef.current.disconnect();
            roRef.current = null;
        }
        if (!node) return;

        const measure = () => setSize({ widthPx: node.clientWidth, heightPx: node.clientHeight });
        measure(); // initial synchronous read

        const ro = new ResizeObserver(measure);
        ro.observe(node);
        roRef.current = ro;
    }, []);

    return { ref, ...size };
}

/* #1: title row = icon + eyebrow + (optional) collateral chip. NO deal name. */
function Header({ data, showChip }: { data: NormalisedSummary; showChip: boolean }) {
    return (
        <div className={styles.header}>
            <ProfileOutlined className={styles.headerIcon} />
            <span className={styles.eyebrow}>{data.eyebrow}</span>
            {showChip && !!data.collateralType && (
                <span className={styles.chip}>{data.collateralType}</span>
            )}
        </div>
    );
}

export function SummaryPanelWidget(props: WidgetComponentProps) {
    const { result, loading, execute, widgetInstance, widgetDefinition, mode } = props;

    const config = widgetInstance?.config ?? {};
    const properties = widgetDefinition?.configSchema?.properties ?? {};
    const { rowStyle, showFooter, titleOverride, emptyText } = getWidgetValues(config, properties);

    // Real-pixel measurement drives the layout plan (see file header for why).
    const { ref, widthPx, heightPx } = useElementSize<HTMLDivElement>();
    const plan = planSummary(widthPx, heightPx);
    const showChip = plan.headerMode === 'full';

    // #3: read the deal name off the shared channel and fire execute when it changes.
    const channelId = config?.params?.channel;
    const dealName = useGetWidgetValue({ channelId, key: DEAL_NAME_KEY });

    useEffect(() => {
        if (mode === 'preview') return;
        if (dealName) execute?.({ dealName });
    }, [dealName, mode]);

    const data: NormalisedSummary | null =
        mode === 'preview' ? summaryPanelPreviewResult : normaliseSummary(result);

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
                <div ref={ref} className={styles.container}>
                    {!data && (
                        <div className={styles.loading}>
                            <div className={styles.loadingCircle}>
                                <ProfileOutlined className={styles.loadingIcon} />
                            </div>
                            <span className={styles.loadingText}>{emptyText}</span>
                        </div>
                    )}

                    {data && (
                        <>
                            <Header
                                data={titleOverride ? { ...data, eyebrow: titleOverride } : data}
                                showChip={showChip}
                            />

                            <div className={clsx(styles.body, plan.fade && styles.bodyFade)}>
                                <div
                                    className={clsx(
                                        styles.grid,
                                        plan.gridCols === 2 ? styles.gridTwo : styles.gridOne
                                    )}
                                >
                                    {data.metrics.map((m) => (
                                        <MetricRow key={m.key} metric={m} rowStyle={rowStyle} />
                                    ))}
                                </div>
                            </div>

                            {showFooter && plan.footer && !!data.asOf && (
                                <div className={styles.footer}>
                                    <span className={styles.footerDot} />
                                    <span className={styles.footerText}>as of {data.asOf}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </WidgetCardShell>
    );
}