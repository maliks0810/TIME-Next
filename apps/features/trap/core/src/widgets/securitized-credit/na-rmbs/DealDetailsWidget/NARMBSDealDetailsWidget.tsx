import React from 'react';
import { BankOutlined } from '@ant-design/icons';
import clsx from 'clsx';

import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../../types/widget';
import { MetricCard } from './components/MetricCard';
import { AttrPanel } from './components/AttrPanel';
import { AttrRow } from './components/AttrRow';
import { normaliseDeal } from './utils/helpers';
import { DEAL_NAME_KEY, ANALYSIS_SESSION_ID_KEY } from '../../../constants';
import { useGetWidgetValue } from '../../../../state/Widgets/hooks';
import styles from './DealDetailsWidget.module.scss';
import { widgetPreviewResult } from './widgetPreviewResult';
import WidgetLoadingState from '../../../../components/widget-shell/WidgetLoadingState';

export function NARMBSDealDetailsWidget({
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

                        <span className={styles.headerTitleText}>
                            Deal details
                        </span>

                        {dealName && (
                            <span className={styles.headerTitleDealName}>
                                {dealName as string}
                            </span>
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
                                label="Curr WAS"
                                value={data.currWAS}
                                sub="Wt avg spread"
                                highlight
                            />
                            <MetricCard
                                label="Curr WAM"
                                value={`${data.currWAM} mo`}
                                sub="Wt avg maturity"
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
                            {/* Identity */}
                            <AttrPanel title="Identity">
                                <AttrRow label="Intex deal name" value={data.intexDealName} mono />
                                <AttrRow label="Bloomberg name" value={data.bloombergDealName} />
                                <AttrRow label="Deal type" value={data.dealType} />
                                <AttrRow label="Collateral type" value={data.collateralType} />
                                <AttrRow label="Country" value={data.country} />
                                <AttrRow label="Currency" value={data.dealCurrency} />
                                <AttrRow label="Business center" value={data.businessCenter} />
                            </AttrPanel>

                            {/* Dates */}
                            <AttrPanel title="Dates">
                                <AttrRow label="Settle date" value={data.settleDate} />
                                <AttrRow label="Closing date" value={data.closingDate} />
                                <AttrRow label="First pay date" value={data.firstPayDate} />
                                <AttrRow label="Stepdown date req" value={data.stepdownDateReq} />
                                <AttrRow label="Latest update" value={data.latestUpdate} />
                                <AttrRow label="Model timestamp" value={data.dealModelTimestamp} />
                                <AttrRow label="Next pay day" value={data.nextPayDay} />
                            </AttrPanel>

                            {/* Counterparties & traits */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <AttrPanel title="Relevant parties">
                                    <AttrRow label="Issuer" value={data.issuer} />
                                    <AttrRow label="Trustee" value={data.trustee} />
                                    <AttrRow label="Dealer" value={data.dealer} />
                                    <AttrRow label="Master servicer" value={data.masterServicer} />
                                </AttrPanel>

                                <AttrPanel title="Deal traits">
                                    <AttrRow label="Grp 7 structure" value={data.grp7Structure} />
                                    <AttrRow
                                        label="Grp CROSS structure"
                                        value={data.grpCROSSStructure}
                                    />
                                    <AttrRow
                                        label="Grp 72 pricing spd"
                                        value={data.grp72PricingSpeed}
                                    />
                                    <AttrRow
                                        label="Forbearance adj WAC"
                                        value={data.currForbAdjWAC}
                                        accent
                                    />
                                    <AttrRow
                                        label="Forb adj net WAC"
                                        value={data.currForbAdjNetWAC}
                                        accent
                                    />
                                </AttrPanel>
                            </div>
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