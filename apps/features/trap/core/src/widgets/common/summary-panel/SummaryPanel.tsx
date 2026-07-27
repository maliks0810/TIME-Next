/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProfileOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import { useIsMaximized } from '../../../components/widget-shell/WidgetMaximizeContext';
import { useWidgetSize, WidgetSizeBands } from '../../../components/layout/useWidgetSize';
import type { WidgetComponentProps } from '../../../types/widget';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import { MetricRow } from './components/MetricRow';
import { planSummary, RowStyle } from './components/planLayout';
import { normaliseSummary, NormalisedSummary } from './utils/helpers';
import { summaryPanelPreviewResult } from './summaryPanelPreviewResult';
import styles from './SummaryPanel.module.scss';

const SP_BANDS: WidgetSizeBands = {
    width: { wb: 3, wc: 4 },
    height: { h2: 240, h3: 360, h4: 480 },
};

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

function Header({ data, mode }: { data: NormalisedSummary; mode: ReturnType<typeof planSummary>['headerMode'] }) {
    return (
        <div className={styles.header}>
            <ProfileOutlined className={styles.headerIcon} />
            <span className={styles.eyebrow}>{data.eyebrow}</span>
            {(mode === 'name' || mode === 'full') && !!data.dealName && (
                <span className={styles.dealName}>{data.dealName.toUpperCase()}</span>
            )}
            {mode === 'full' && !!data.collateralType && (
                <span className={styles.chip}>{data.collateralType}</span>
            )}
        </div>
    );
}

function SummaryPanelContent({
    data,
    rowStyle,
    showFooter,
    titleOverride,
    emptyText,
}: {
    data: NormalisedSummary | null;
    rowStyle: RowStyle;
    showFooter: boolean;
    titleOverride: string | null;
    emptyText: string;
}) {
    const { ref, cols, heightPx } = useWidgetSize(SP_BANDS);
    const maximized = useIsMaximized();
    const plan = planSummary(cols, heightPx, maximized);

    return (
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
                            mode={plan.headerMode}
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
    );
}

export function SummaryPanelWidget(props: WidgetComponentProps) {
    const { result, loading, widgetInstance, widgetDefinition, mode } = props;

    const config = widgetInstance?.config ?? {};
    const properties = widgetDefinition?.configSchema?.properties ?? {};
    const { rowStyle, showFooter, titleOverride, emptyText } = getWidgetValues(config, properties);

    const data: NormalisedSummary | null =
        mode === 'preview' ? summaryPanelPreviewResult : normaliseSummary(result);

    if (loading) {
        return (
            <WidgetCardShell overflow="hidden" expandable>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    const content = (
        <SummaryPanelContent
            data={data}
            rowStyle={rowStyle}
            showFooter={showFooter}
            titleOverride={titleOverride}
            emptyText={emptyText}
        />
    );

    return (
        <WidgetCardShell overflow="hidden" expandable maximizedChildren={content}>
            {content}
        </WidgetCardShell>
    );
}