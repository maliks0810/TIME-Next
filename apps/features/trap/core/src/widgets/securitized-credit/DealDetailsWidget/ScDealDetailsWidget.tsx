import React from 'react';
import { BankOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../types/widget';
import { MetricCard } from './components/MetricCard';
import { AttrPanel } from './components/AttrPanel';
import { AttrRow } from './components/AttrRow';
import { normaliseDeal } from './utils/helpers';
import { DEAL_NAME_KEY, ANALYSIS_SESSION_ID_KEY } from '../../constants';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import styles from './DealDetailsWidget.module.scss';
import { widgetPreviewResult } from './widgetPreviewResult';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';

export function ScDealDetailsWidget({
    result,
    loading,
    execute,
    widgetInstance,
    mode,
}: WidgetComponentProps) {
    const channelId = widgetInstance?.config?.params?.channel;

    const sessionId = useGetWidgetValue({
        channelId,
        key: ANALYSIS_SESSION_ID_KEY,
    });

    const dealName = useGetWidgetValue({
        channelId,
        key: DEAL_NAME_KEY,
    });

    const data = mode === 'preview' ? widgetPreviewResult : normaliseDeal(result);

    React.useEffect(() => {
        if (dealName) {
            execute?.({ dealName });
        }
    }, [dealName]);

    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    const structure = data?.structure ?? null;

    return (
        <WidgetCardShell>
            <div
                className={clsx(styles.dealDetailsContainer, {
                    [styles.previewContainer]: mode === 'preview',
                })}
            >
                {/* Header */}
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <BankOutlined className={styles.headerTitleIcon} />

                        <span className={styles.headerTitleText}>Deal details</span>

                        {dealName && (
                            <span className={styles.headerTitleDealName}>{dealName as string}</span>
                        )}

                        {data && (
                            <span className={styles.headerTitleCollateralType}>
                                {data.collateralType}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ height: 1 }} />

                {!loading && !data && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <BankOutlined className={styles.loadingIcon} />
                        </div>

                        <span className={styles.loadingText}>
                            Load a security or upload a CDI file to view deal details
                        </span>
                    </div>
                )}

                {!loading && data && (
                    <>
                        {/* ── Row 1: headline balance metrics ── */}
                        <div className={styles.dealDetailsMetricCardsContainer}>
                            <MetricCard
                                label="Orig deal balance"
                                value={`$${data.origDealBalance}`}
                                sub="Original issuance"
                                accent
                            />
                            <MetricCard
                                label="Curr deal balance"
                                value={`$${data.currDealBalance}`}
                                sub="Current outstanding"
                            />
                            <MetricCard
                                label="Deal balance factor"
                                value={data.dealBalanceFactor}
                                sub="Paydown factor"
                            />
                            <MetricCard
                                label="Deal age"
                                value={`${data.dealAge} mo`}
                                sub="Months since close"
                            />
                        </div>

                        {/* ── Row 2: collateral + rate metrics ── */}
                        <div className={styles.dealDetailsMetricCardsContainer}>
                            <MetricCard
                                label="Curr WAC"
                                value={data.currWAC}
                                sub="Gross coupon"
                                accent
                            />
                            <MetricCard
                                label="Curr net WAC"
                                value={data.currNetWAC}
                                sub="Net coupon"
                            />
                            <MetricCard
                                label="Curr WAM"
                                value={data.currWAM ? `${data.currWAM} mo` : null}
                                sub="Wt avg maturity"
                            />
                            <MetricCard
                                label="Curr WALA"
                                value={data.currWALA ? `${data.currWALA} mo` : null}
                                sub="Wt avg loan age"
                                highlight
                            />
                        </div>

                        {/* ── Row 3: collateral balances ── */}
                        <div className={styles.dealDetailsMetricCardsContainer}>
                            <MetricCard
                                label="Orig collat balance"
                                value={`$${data.origCollatBalance}`}
                                sub="Original collateral"
                                accent
                            />
                            <MetricCard
                                label="Curr collat balance"
                                value={`$${data.currCollatBalance}`}
                                sub="Current collateral"
                            />
                            <MetricCard
                                label="Collat factor"
                                value={data.collatFactor}
                                sub="Collateral paydown"
                            />
                            <MetricCard
                                label="Collateral detail"
                                value={data.collateralDetail}
                                sub="Pool type"
                            />
                        </div>

                        {/* ── Three-column attribute panels ── */}
                        <div className={styles.dealDetailsAttributePanels}>
                            {/* Col 1: Identity + Relevant parties stacked */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <AttrPanel title="Identity">
                                    <AttrRow label="Intex deal name" value={data.intexDealName} mono />
                                    <AttrRow label="Bloomberg name" value={data.bloombergDealName} />
                                    <AttrRow label="Deal type" value={data.dealType} />
                                    <AttrRow label="Collateral type" value={data.collateralType} />
                                    <AttrRow label="Country" value={data.country} />
                                    <AttrRow label="Currency" value={data.currency} />
                                </AttrPanel>

                                <AttrPanel title="Relevant parties">
                                    <AttrRow label="Issuer" value={data.issuerName} />
                                    <AttrRow label="Trustee" value={data.trustee} />
                                    <AttrRow label="Dealer" value={data.dealerName} />
                                    <AttrRow label="Master servicer" value={data.masterServicer} />
                                </AttrPanel>
                            </div>

                            {/* Col 2: Dates */}
                            <AttrPanel title="Dates">
                                <AttrRow label="Settle date" value={data.settleDate} />
                                <AttrRow label="Closing date" value={data.closingDate} />
                                <AttrRow label="First pay date" value={data.firstPayDate} />
                                <AttrRow label="Latest update" value={data.latestUpdate} />
                                <AttrRow label="Model timestamp" value={data.modelTimestamp} />
                                <AttrRow label="Next pay day" value={data.nextPayDay} />
                            </AttrPanel>

                            {/* Col 3: Structure (replaces Deal traits) */}
                            <AttrPanel title="Structure">
                                <AttrRow label="Classes" value={structure?.classes} />
                                <AttrRow label="Triggers" value={structure?.triggerNames} />
                                <AttrRow
                                    label="Credit enhancement"
                                    value={structure?.creditEnhancementNames}
                                />
                                <AttrRow label="Calls" value={structure?.callNames} />
                                <AttrRow
                                    label="Expenses"
                                    value={
                                        structure?.nExpenses != null
                                            ? String(structure.nExpenses)
                                            : null
                                    }
                                />
                                <AttrRow label="Settlement" value={structure?.settlementType} />
                                <AttrRow label="Payrule script" value={structure?.hasPayruleScript} />
                            </AttrPanel>
                        </div>

                        {/* Session footer */}
                        {sessionId && (
                            <div className={styles.sessionFooterContainer}>
                                <div className={styles.sessionFooterIndicator} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </WidgetCardShell>
    );
}