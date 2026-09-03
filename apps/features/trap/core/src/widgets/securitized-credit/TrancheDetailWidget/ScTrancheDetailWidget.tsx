import React from 'react';
import clsx from 'clsx';
import { ApartmentOutlined } from '@ant-design/icons';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import { useIsMaximized } from '../../../components/widget-shell/WidgetMaximizeContext';
import { useWidgetSize, WidgetSizeBands } from '../../../components/layout/useWidgetSize';
import type { WidgetComponentProps } from '../../../types/widget';
import { useTheme } from '../../../theme/ThemeContext';
import { TrancheDetail } from './utils/mockData';
import { MetricCard } from './components/MetricCard';
import { DetailRow } from './components/DetailRow';
import { DetailPanel } from './components/DetailPanel';
import { planTrancheDetail, PanelName } from './components/planLayout';
import { TRANCHE_NAME_KEY, DEAL_NAME_KEY } from '../../constants';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import styles from './TrancheDetailsWidget.module.scss';

const TD_BANDS: WidgetSizeBands = {
    width: { wb: 7, wc: 9 },
    height: { h2: 340, h3: 460, h4: 660 },
};

const formatNumber = (value: number) =>
    value?.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

function TrancheDetailContent({ data, error }: { data: TrancheDetail | null; error: unknown }) {
    const { ref, cols, heightPx } = useWidgetSize(TD_BANDS);
    const maximized = useIsMaximized();
    const { themeName } = useTheme();

    const isWealthTheme = themeName === 'wealthLight' || themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const plan = planTrancheDetail(cols, heightPx, maximized);

    const cards = data
        ? [
              {
                  label: 'Curr balance',
                  value: formatNumber(data.currBalance),
                  sub: 'Outstanding',
                  accent: true,
              },
              {
                  label: 'Orig balance',
                  value: formatNumber(data.origBalance),
                  sub: 'Original',
                  accent: true,
              },
              {
                  label: 'Factor',
                  value: data.factor?.toFixed(4),
                  sub: 'Paydown factor',
              },
              {
                  label: 'Coupon',
                  value: data.coupon != null ? `${data.coupon.toFixed(4)}%` : null,
                  sub: data.reportedCoupon ? `Reported: ${data.reportedCoupon}` : 'Reported: —',
                  accent: true,
              },
              {
                  label: 'Implied balance',
                  value: data.impliedBalance,
                  sub: 'Group-directed',
              },
          ]
        : [];

    const renderPanel = (name: PanelName) => {
        if (!data) return null;

        const bodyColumns = plan.bodyCols;

        switch (name) {
            case 'Tranche info':
                return (
                    <DetailPanel key="tranche-info" title="Tranche info" bodyColumns={bodyColumns}>
                        <DetailRow label="Tranche" value={data.name} mono />
                        <DetailRow label="CUSIP" value={data.cusip} mono copyable />
                        <DetailRow label="ISIN" value={data.isin} mono copyable />
                        <DetailRow label="FIGI" value={data.figi} mono copyable />
                        <DetailRow
                            label="Bloomberg ticker"
                            value={data.bloombergTicker}
                            mono
                            copyable
                        />
                        <DetailRow label="Type" value={data.type} mono />
                        <DetailRow label="Group" value={data.group} />
                        <DetailRow label="Ground group" value={data.groundGroup} />
                        <DetailRow label="Support group" value={data.supportGroup} />
                        <DetailRow label="Curr ratings" value={data.currRatings} mono />
                        <DetailRow label="Orig ratings" value={data.origRatings} mono />
                    </DetailPanel>
                );

            case 'Cash flow':
                return (
                    <DetailPanel key="cash-flow" title="Cash flow" bodyColumns={bodyColumns}>
                        <DetailRow label="Coupon" value={data.coupon?.toFixed(4)} mono />
                        <DetailRow label="Reported coupon" value={data.reportedCoupon} mono />
                        <DetailRow label="Frequency" value={data.frequency} />
                        <DetailRow label="Daycount" value={data.daycount} />
                        <DetailRow label="Business day" value={data.businessDay} />
                        <DetailRow label="Delay" value={data.delay} mono />
                        <DetailRow label="Accrual date" value={data.accrualDate} mono />
                        <DetailRow label="Currency" value={data.currency} mono />
                        <DetailRow label="Stated maturity" value={data.statedMaturity} mono />
                    </DetailPanel>
                );

            case 'Floater info':
                return (
                    <DetailPanel key="floater-info" title="Floater info" bodyColumns={bodyColumns}>
                        <DetailRow label="Floater formula" value={data.floaterFormula} mono />
                        <DetailRow label="Floater index" value={data.floaterIndex} mono />
                        <DetailRow label="Floater spread" value={data.floaterSpread} mono accent />
                        <DetailRow label="Floater index CSA" value={data.floaterIndexCSA} mono />
                        <DetailRow label="Floater floor" value={data.floaterFloor} mono />
                        <DetailRow label="Floater cap" value={data.floaterCap} mono />
                        <DetailRow label="Margin steps" value={data.floaterMarginSteps} mono />
                        <DetailRow label="Coupon cap" value={data.couponCap} mono />
                    </DetailPanel>
                );

            case 'Credit support':
                return (
                    <DetailPanel
                        key="credit-support"
                        title="Credit support"
                        bodyColumns={bodyColumns}
                    >
                        <DetailRow label="Implied writedown" value={data.impliedWritedown} mono />
                        <DetailRow
                            label="Target enhancement"
                            value={
                                data.targetEnhancement != null ? `${data.targetEnhancement}%` : null
                            }
                            mono
                            accent
                        />
                        <DetailRow label="Crossover prin dist" value={data.crossoverPrinDist} />
                        <DetailRow label="Crossover with" value={data.crossoverPrinDistWith} />
                        <DetailRow
                            label="Credit support formula"
                            value={data.creditSupportFormula}
                            mono
                        />
                        <DetailRow label="Formula (#)" value={data.creditSupportFormulaNum} mono />
                    </DetailPanel>
                );

            case 'Accumulators':
                return (
                    <DetailPanel key="accumulators" title="Accumulators" bodyColumns={bodyColumns}>
                        <DetailRow
                            label="Accum int shortfall"
                            value={data.accumIntShortfall}
                            mono
                        />
                        <DetailRow label="Accum writedown" value={data.accumWritedown} mono />
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
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.fill}>
            <div
                ref={ref}
                className={clsx(styles.trancheDetailsContainer, {
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
            >
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

                {(!data || Boolean(error)) && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <ApartmentOutlined className={styles.loadingIcon} />
                        </div>
                        <span className={styles.loadingText}>Select a tranche to view detail</span>
                    </div>
                )}

                {data && !error && (
                    <>
                        {plan.metricCards ? (
                            <div className={styles.metricCardsContainer}>
                                {cards.map((card) => (
                                    <MetricCard
                                        key={card.label}
                                        label={card.label}
                                        value={card.value}
                                        sub={card.sub}
                                        accent={card.accent}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.metricStrip}>
                                {cards.map((card) => (
                                    <div key={card.label} className={styles.metricStripItem}>
                                        <span className={styles.metricStripLabel}>
                                            {card.label}
                                        </span>
                                        <span className={styles.metricStripValue}>
                                            {card.value ?? '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

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
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();

    const trancheName = useGetWidgetValue({
        channelId,
        key: TRANCHE_NAME_KEY,
    }) as string | undefined;

    const dealName = useGetWidgetValue({
        channelId,
        key: DEAL_NAME_KEY,
    }) as string | undefined;

    const requestKey =
        dealName && trancheName
            ? `${String(dealName).toLowerCase()}::${String(trancheName).toLowerCase()}`
            : null;

    const [visibleResultKey, setVisibleResultKey] = React.useState<string | null>(null);

    const previousDealNameRef = React.useRef<string | undefined>(dealName);
    const pendingRequestKeyRef = React.useRef<string | null>(null);
    const resultAtRequestRef = React.useRef<unknown>(result);
    const requestSawLoadingRef = React.useRef(false);

    React.useEffect(() => {
        const dealChanged = previousDealNameRef.current !== dealName;

        if (dealChanged) {
            previousDealNameRef.current = dealName;
            pendingRequestKeyRef.current = null;
            resultAtRequestRef.current = result;
            requestSawLoadingRef.current = false;
            setVisibleResultKey(null);

            setWidgetValueToChannel({
                channelId,
                key: TRANCHE_NAME_KEY,
                value: null,
                activeTab,
                widgetId: widgetInstance.id,
            });

            return;
        }

        if (!dealName || !trancheName || !requestKey) {
            pendingRequestKeyRef.current = null;
            requestSawLoadingRef.current = false;
            setVisibleResultKey(null);
            return;
        }

        pendingRequestKeyRef.current = requestKey;
        resultAtRequestRef.current = result;
        requestSawLoadingRef.current = false;
        setVisibleResultKey(null);

        execute?.({
            tranche: trancheName,
            dealName,
        });

        // execute is intentionally excluded because some widget runtimes
        // recreate it after each result update, which would cause a loop.
    }, [dealName, trancheName, requestKey, channelId, activeTab, setWidgetValueToChannel]);

    React.useEffect(() => {
        if (loading) {
            requestSawLoadingRef.current = true;
            return;
        }

        if (!requestKey || pendingRequestKeyRef.current !== requestKey) {
            return;
        }

        const resultChanged = result !== resultAtRequestRef.current;
        const requestCompleted = requestSawLoadingRef.current || resultChanged;
        const hasResult = Boolean(result) && Object.keys(result as object).length > 0;

        if (requestCompleted && hasResult && !error) {
            setVisibleResultKey(requestKey);
            pendingRequestKeyRef.current = null;
            requestSawLoadingRef.current = false;
        }
    }, [result, loading, error, requestKey]);

    const data: TrancheDetail | null =
        requestKey && visibleResultKey === requestKey && result
            ? (result as unknown as TrancheDetail)
            : null;

    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    const content = <TrancheDetailContent data={data} error={error} />;

    return (
        <WidgetCardShell overflow="hidden" expandable maximizedChildren={content}>
            {content}
        </WidgetCardShell>
    );
}
