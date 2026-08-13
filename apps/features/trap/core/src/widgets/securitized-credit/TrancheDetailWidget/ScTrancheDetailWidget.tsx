// EXISTING: apps/features/trap/core/src/widgets/securitized-credit/TrancheDetailWidget/ScTrancheDetailWidget.tsx
//
// Responsive "max-down" pattern (same as Deal Details), full-width panel model.
// The "Stage for asset setup" button was removed — selecting a tranche in All
// Tranches (which emits the live tranche.id / tranche.name) now auto-populates
// New Asset Staging directly, so no explicit stage step is needed here.

import React from 'react';
import { ApartmentOutlined } from '@ant-design/icons';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useIsMaximized } from '../../../components/widget-shell/WidgetMaximizeContext';
import { useWidgetSize, WidgetSizeBands } from '../../../components/layout/useWidgetSize';
import type { WidgetComponentProps } from '../../../types/widget';
import { TrancheDetail } from './utils/mockData';
import { MetricCard } from './components/MetricCard';
import { DetailRow } from './components/DetailRow';
import { DetailPanel } from './components/DetailPanel';
import { planTrancheDetail, PanelName } from './components/planLayout';
import { TRANCHE_NAME_KEY, DEAL_NAME_KEY } from '../../constants';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import styles from './TrancheDetailsWidget.module.scss';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';

const TD_BANDS: WidgetSizeBands = {
    width: { wb: 7, wc: 9 },
    height: { h2: 340, h3: 460, h4: 660 },
};

const fmt = (n: number) =>
    n?.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

/**
 * Full responsive body. Renders in the card AND (reused) in the overlay.
 * useIsMaximized() → forceMax → all 5 panels with widest bodies.
 */
function TrancheDetailContent({
    data,
    error,
}: {
    data: TrancheDetail | null;
    error: unknown;
}) {
    const { ref, cols, heightPx } = useWidgetSize(TD_BANDS);
    const maximized = useIsMaximized();

    const plan = planTrancheDetail(cols, heightPx, maximized);

    const cards = data
        ? [
              { label: 'Curr balance', value: fmt(data.currBalance), sub: 'Outstanding', accent: true },
              { label: 'Orig balance', value: fmt(data.origBalance), sub: 'Original', accent: true },
              { label: 'Factor', value: data.factor?.toFixed(4), sub: 'Paydown factor' },
              {
                  label: 'Coupon',
                  value: data.coupon != null ? `${data.coupon.toFixed(4)}%` : null,
                  sub: data.reportedCoupon ? `Reported: ${data.reportedCoupon}` : 'Reported: —',
                  accent: true,
              },
              { label: 'Implied balance', value: data.impliedBalance, sub: 'Group-directed' },
          ]
        : [];

    const renderPanel = (name: PanelName) => {
        if (!data) return null;
        const bodyCols = plan.bodyCols;
        switch (name) {
            case 'Tranche info':
                return (
                    <DetailPanel key="ti" title="Tranche info" bodyColumns={bodyCols}>
                        <DetailRow label="Tranche" value={data.name} />
                        <DetailRow label="CUSIP" value={data.cusip} mono copyable />
                        <DetailRow label="ISIN" value={data.isin} mono copyable />
                        <DetailRow label="FIGI" value={data.figi} mono copyable />
                        <DetailRow label="Bloomberg ticker" value={data.bloombergTicker} copyable />
                        <DetailRow label="Type" value={data.type} mono />
                        <DetailRow label="Group" value={data.group} />
                        <DetailRow label="Ground group" value={data.groundGroup} />
                        <DetailRow label="Support group" value={data.supportGroup} />
                        <DetailRow label="Curr ratings" value={data.currRatings} />
                        <DetailRow label="Orig ratings" value={data.origRatings} />
                    </DetailPanel>
                );
            case 'Cash flow':
                return (
                    <DetailPanel key="cf" title="Cash flow" bodyColumns={bodyCols}>
                        <DetailRow label="Coupon" value={data.coupon?.toFixed(4)} mono />
                        <DetailRow label="Reported coupon" value={data.reportedCoupon} mono />
                        <DetailRow label="Frequency" value={data.frequency} />
                        <DetailRow label="Daycount" value={data.daycount} />
                        <DetailRow label="Business day" value={data.businessDay} />
                        <DetailRow label="Delay" value={data.delay} />
                        <DetailRow label="Accrual date" value={data.accrualDate} />
                        <DetailRow label="Currency" value={data.currency} />
                        <DetailRow label="Stated maturity" value={data.statedMaturity} />
                    </DetailPanel>
                );
            case 'Floater info':
                return (
                    <DetailPanel key="fl" title="Floater info" bodyColumns={bodyCols}>
                        <DetailRow label="Floater formula" value={data.floaterFormula} mono />
                        <DetailRow label="Floater index" value={data.floaterIndex} mono />
                        <DetailRow label="Floater spread" value={data.floaterSpread} mono accent />
                        <DetailRow label="Floater index CSA" value={data.floaterIndexCSA} mono />
                        <DetailRow label="Floater floor" value={data.floaterFloor} mono />
                        <DetailRow label="Floater cap" value={data.floaterCap} mono />
                        <DetailRow label="Margin steps" value={data.floaterMarginSteps} mono />
                        <DetailRow label="Coupon cap" value={data.couponCap} />
                    </DetailPanel>
                );
            case 'Credit support':
                return (
                    <DetailPanel key="cs" title="Credit support" bodyColumns={bodyCols}>
                        <DetailRow label="Implied writedown" value={data.impliedWritedown} />
                        <DetailRow
                            label="Target enhancement"
                            value={data.targetEnhancement != null ? `${data.targetEnhancement}%` : null}
                            accent
                        />
                        <DetailRow label="Crossover prin dist" value={data.crossoverPrinDist} />
                        <DetailRow label="Crossover with" value={data.crossoverPrinDistWith} />
                        <DetailRow label="Credit support formula" value={data.creditSupportFormula} mono />
                        <DetailRow label="Formula (#)" value={data.creditSupportFormulaNum} mono />
                    </DetailPanel>
                );
            case 'Accumulators':
                return (
                    <DetailPanel key="ac" title="Accumulators" bodyColumns={bodyCols}>
                        <DetailRow label="Accum int shortfall" value={data.accumIntShortfall} mono />
                        <DetailRow label="Accum writedown" value={data.accumWritedown} mono />
                        <DetailRow label="Accum unreal WD" value={data.accumUnrealizedWritedown} mono />
                        <DetailRow label="Accum group-dir unr WD" value={data.accumGroupDirUnrWD} mono />
                        <DetailRow label="Accum coup cap shortfall" value={data.accumCoupCapShortfall} mono accent />
                    </DetailPanel>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.fill}>
            <div ref={ref} className={styles.trancheDetailsContainer}>
                {/* Header */}
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <ApartmentOutlined className={styles.headerTitleIcon} />
                        <span className={styles.headerTitleText}>Tranche detail</span>

                        {data && !error && (
                            <>
                                <span className={styles.headerTitleDataName}>{data.name}</span>
                                <span className={styles.headerTitleDataCusip}>{data.cusip}</span>
                                <span className={styles.headerTitleDataType}>{data.type}</span>
                            </>
                        )}
                    </div>
                </div>

                {(!data || !!error) && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <ApartmentOutlined className={styles.loadingIcon} />
                        </div>
                        <span className={styles.loadingText}>Select a tranche to view detail</span>
                    </div>
                )}

                {data && !error && (
                    <>
                        {/* Metrics — cards (tall) or compact strip (short) */}
                        {plan.metricCards ? (
                            <div className={styles.metricCardsContainer}>
                                {cards.map((c) => (
                                    <MetricCard
                                        key={c.label}
                                        label={c.label}
                                        value={c.value}
                                        sub={c.sub}
                                        accent={c.accent}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.metricStrip}>
                                {cards.map((c) => (
                                    <div key={c.label} className={styles.metricStripItem}>
                                        <span className={styles.metricStripLabel}>{c.label}</span>
                                        <span className={styles.metricStripValue}>{c.value ?? '—'}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Panels — full-width, stacked; only those that fit render */}
                        {plan.panels.length > 0 && (
                            <div className={styles.attributePanels}>
                                {plan.panels.map(renderPanel)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export function ScTrancheDetailWidget({
    result,
    loading,
    widgetInstance,
    execute,
    error,
}: WidgetComponentProps) {
    const channelId = widgetInstance?.config?.params?.channel;

    const trancheName = useGetWidgetValue({ channelId, key: TRANCHE_NAME_KEY });
    const dealName = useGetWidgetValue({ channelId, key: DEAL_NAME_KEY });

    const data: TrancheDetail | null =
        result && Object.keys(result).length > 0 ? (result as unknown as TrancheDetail) : null;

    React.useEffect(() => {
        if (!dealName || !trancheName) return;
        execute?.({ tranche: trancheName as string, dealName: dealName as string });
    }, [dealName, trancheName]);

    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    // Single element reused in the card and the overlay (each gets its own hooks).
    const content = <TrancheDetailContent data={data} error={error} />;

    return (
        <WidgetCardShell overflow="hidden" expandable maximizedChildren={content}>
            {content}
        </WidgetCardShell>
    );
}