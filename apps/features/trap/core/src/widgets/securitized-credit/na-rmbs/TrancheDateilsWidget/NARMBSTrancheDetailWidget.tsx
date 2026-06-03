import { useEffect } from 'react';
import { Button, Space } from 'antd';
import { ApartmentOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';

import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../../types/widget';
import { TrancheDetail } from './utils/mockData';
import { MetricCard } from './components/MetricCard';
import { DetailRow } from './components/DetailRow';
import { DetailPanel } from './components/DetailPanel';
import {
    IS_ASSET_NEW_KEY,
    ASSET_STAGED_TRANCHE_ID,
    ASSET_STAGED_TRANCHE_NAME,
    TRANCHE_ID_KEY,
    TRANCHE_NAME_KEY,
    DEAL_NAME_KEY,
} from '../../../constants';
import { useGetWidgetValue, useSetWidgetValue } from '../../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import styles from './TrancheDetailsWidget.module.scss';
import WidgetLoadingState from '../../../../components/widget-shell/WidgetLoadingState';

export function NARMBSTrancheDetailWidget({
    result,
    loading,
    widgetInstance,
    execute,
    error,
}: WidgetComponentProps) {
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();
    const channelId = widgetInstance?.config?.params?.channel;

    const trancheId = useGetWidgetValue({
        channelId,
        key: TRANCHE_ID_KEY,
    });

    const trancheName = useGetWidgetValue({
        channelId,
        key: TRANCHE_NAME_KEY,
    });

    const dealName = useGetWidgetValue({
        channelId,
        key: DEAL_NAME_KEY,
    });

    const data: TrancheDetail | null =
        result && Object.keys(result).length > 0 ? (result as unknown as TrancheDetail) : null;

    useEffect(() => {
        if (!dealName || !trancheName) {
            return;
        }

        execute?.({
            tranche: trancheName as string,
            dealName: dealName as string,
        });
    }, [dealName, trancheName]);


    const handleAddToStaging = () => {
        if (!trancheId) return;

        // Publish to the dedicated staging keys — does not disturb tranche.id
        // which TranchesWidget uses for exploration/row-highlighting
        setWidgetValueToChannel({
            key: ASSET_STAGED_TRANCHE_ID,
            channelId,
            value: trancheId,
            activeTab,
        });

        setWidgetValueToChannel({
            key: ASSET_STAGED_TRANCHE_NAME,
            channelId,
            value: trancheName,
            activeTab,
        });

        // Signal that a new asset needs staging
        setWidgetValueToChannel({
            key: IS_ASSET_NEW_KEY,
            channelId,
            value: 'true',
            activeTab,
        });
    };

    // TODO Re-execute when TitleBar publishes workflow.refresh

    const fmt = (n: number) =>
        n?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    return (
        <WidgetCardShell>
            <div className={styles.trancheDetailsContainer}>
                {/* Header */}
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <ApartmentOutlined className={styles.headerTitleIcon} />

                        <span className={styles.headerTitleText}>
                            Tranche detail
                        </span>

                        {data && !error && (
                            <>
                                <span className={styles.headerTitleDataName}>
                                    {data.name}
                                </span>

                                <span className={styles.headerTitleDataCusip}>
                                    {data.cusip}
                                </span>

                                <span className={styles.headerTitleDataType}>
                                    {data.type}
                                </span>
                            </>
                        )}
                    </div>

                    <Space size={6} wrap>
                        <Button
                            type="primary"
                            size="small"
                            icon={<RightOutlined />}
                            disabled={!data || !!error}
                        >
                            Run scenario analysis
                        </Button>

                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            disabled={!data || !!error}
                            onClick={handleAddToStaging}
                        >
                            Add to staging
                        </Button>
                    </Space>
                </div>

                <div style={{ height: 1 }} />

                {((!loading && !data) || error) && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <ApartmentOutlined className={styles.loadingIcon} />
                        </div>

                        <span className={styles.loadingText}>
                            Select a tranche to view detail
                        </span>
                    </div>
                )}

                {!error && !loading && data && (
                    <>
                        {/* ── Headline metrics ── */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <MetricCard
                                label="Curr balance"
                                value={fmt(data.currBalance)}
                                sub="Outstanding"
                                accent
                            />

                            <MetricCard
                                label="Orig balance"
                                value={fmt(data.origBalance)}
                                sub="Original"
                            />

                            <MetricCard
                                label="Factor"
                                value={data.factor?.toFixed(4)}
                                sub="Paydown factor"
                            />

                            <MetricCard
                                label="Coupon"
                                value={data.coupon?.toFixed(4) + '%'}
                                sub={'Reported: ' + data.reportedCoupon}
                            />

                            <MetricCard
                                label="Implied balance"
                                value={data.impliedBalance}
                                sub="Group-directed"
                            />
                        </div>

                        {/* ── Two-column detail panels ── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {/* Left column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <DetailPanel title="Tranche info">
                                    <DetailRow label="Tranche" value={data.name} />
                                    <DetailRow label="CUSIP" value={data.cusip} mono />
                                    <DetailRow label="FIGI" value={data.figi} mono />
                                    <DetailRow
                                        label="Bloomberg ticker"
                                        value={data.bloombergTicker}
                                    />
                                    <DetailRow label="Type" value={data.type} mono />
                                    <DetailRow label="Group" value={data.group} />
                                    <DetailRow label="Ground group" value={data.groundGroup} />
                                    <DetailRow label="Support group" value={data.supportGroup} />
                                    <DetailRow label="Curr ratings" value={data.currRatings} />
                                    <DetailRow label="Orig ratings" value={data.origRatings} />
                                </DetailPanel>

                                <DetailPanel title="Cash flow">
                                    <DetailRow
                                        label="Coupon"
                                        value={data.coupon?.toFixed(4)}
                                        mono
                                    />
                                    <DetailRow
                                        label="Reported coupon"
                                        value={data.reportedCoupon}
                                        mono
                                    />
                                    <DetailRow label="Frequency" value={data.frequency} />
                                    <DetailRow label="Daycount" value={data.daycount} />
                                    <DetailRow label="Business day" value={data.businessDay} />
                                    <DetailRow label="Delay" value={data.delay} />
                                    <DetailRow label="Accrual date" value={data.accrualDate} />
                                    <DetailRow label="Currency" value={data.currency} />
                                    <DetailRow
                                        label="Stated maturity"
                                        value={data.statedMaturity}
                                    />
                                </DetailPanel>
                            </div>

                            {/* Right column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <DetailPanel title="Floater info">
                                    <DetailRow
                                        label="Floater formula"
                                        value={data.floaterFormula}
                                        mono
                                    />
                                    <DetailRow
                                        label="Floater index"
                                        value={data.floaterIndex}
                                        mono
                                    />
                                    <DetailRow
                                        label="Floater spread"
                                        value={data.floaterSpread}
                                        mono
                                        accent
                                    />
                                    <DetailRow
                                        label="Floater index CSA"
                                        value={data.floaterIndexCSA}
                                        mono
                                    />
                                    <DetailRow
                                        label="Floater floor"
                                        value={data.floaterFloor}
                                        mono
                                    />
                                    <DetailRow label="Floater cap" value={data.floaterCap} mono />
                                    <DetailRow
                                        label="Margin steps"
                                        value={data.floaterMarginSteps}
                                        mono
                                    />
                                    <DetailRow label="Coupon cap" value={data.couponCap} />
                                </DetailPanel>

                                <DetailPanel title="Credit support">
                                    <DetailRow
                                        label="Implied writedown"
                                        value={data.impliedWritedown}
                                    />
                                    <DetailRow
                                        label="Target enhancement"
                                        value={`${data.targetEnhancement}%`}
                                        accent
                                    />
                                    <DetailRow
                                        label="Crossover prin dist"
                                        value={data.crossoverPrinDist}
                                    />
                                    <DetailRow
                                        label="Crossover with"
                                        value={data.crossoverPrinDistWith}
                                    />
                                    <DetailRow
                                        label="Credit support formula"
                                        value={data.creditSupportFormula}
                                        mono
                                    />
                                    <DetailRow
                                        label="Formula (#)"
                                        value={data.creditSupportFormulaNum}
                                        mono
                                    />
                                </DetailPanel>

                                <DetailPanel title="Accumulators">
                                    <DetailRow
                                        label="Accum int shortfall"
                                        value={data.accumIntShortfall}
                                        mono
                                    />
                                    <DetailRow
                                        label="Accum writedown"
                                        value={data.accumWritedown}
                                        mono
                                    />
                                    <DetailRow
                                        label="Accum unreal WD"
                                        value={data.accumUnrealizedWritedown}
                                        mono
                                    />
                                    <DetailRow
                                        label="Accum group-dir unr WD"
                                        value={data.accumGroupDirUnrWD}
                                        mono
                                    />
                                    <DetailRow
                                        label="Accum coup cap shortfall"
                                        value={data.accumCoupCapShortfall}
                                        mono
                                        accent
                                    />
                                </DetailPanel>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </WidgetCardShell>
    );
}