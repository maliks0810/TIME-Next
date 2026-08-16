import React from 'react';
import { BankOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import { useIsMaximized } from '../../../components/widget-shell/WidgetMaximizeContext';
import {
    useWidgetSize,
    WidgetSizeBands,
} from '../../../components/layout/useWidgetSize';
import type { WidgetComponentProps } from '../../../types/widget';
import { useTheme } from '../../../theme/ThemeContext';
import { MetricCard } from './components/MetricCard';
import { MetricList, MetricItem } from './components/MetricList';
import { AttrPanel } from './components/AttrPanel';
import { AttrRow } from './components/AttrRow';
import {
    planDealDetails,
    PanelName,
} from './components/planLayout';
import { normaliseDeal } from './utils/helpers';
import {
    DEAL_NAME_KEY,
    ANALYSIS_SESSION_ID_KEY,
} from '../../constants';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import styles from './DealDetailsWidget.module.scss';
import { widgetPreviewResult } from './widgetPreviewResult';

const DD_BANDS: WidgetSizeBands = {
    width: { wb: 7, wc: 9 },
    height: { h2: 300, h3: 450, h4: 600 },
};

type NormalisedDeal = ReturnType<typeof normaliseDeal>;

function DealDetailsContent({
    data,
    dealName,
    sessionId,
}: {
    data: NormalisedDeal | null;
    dealName: unknown;
    sessionId: unknown;
}) {
    const { ref, cols, heightPx } = useWidgetSize(DD_BANDS);
    const maximized = useIsMaximized();
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const structure = data?.structure ?? null;
    const plan = planDealDetails(cols, heightPx, maximized);

    // Display Bloomberg deal name when available. Queries continue to use the
    // INTEX deal name carried by the channel.
    const titleName =
        (data?.bloombergDealName as string | undefined) ??
        (dealName as string | undefined);

    const metricItems: MetricItem[] = data
        ? [
              {
                  label: 'Orig deal bal',
                  value: `$${data.origDealBalance}`,
              },
              {
                  label: 'Curr deal bal',
                  value: `$${data.currDealBalance}`,
              },
              {
                  label: 'Deal factor',
                  value: data.dealBalanceFactor,
              },
              {
                  label: 'Deal age',
                  value:
                      data.dealAge != null
                          ? `${data.dealAge} mo`
                          : null,
              },
              {
                  label: 'Curr WAC',
                  value: data.currWAC,
              },
              {
                  label: 'Curr net WAC',
                  value: data.currNetWAC,
              },
              {
                  label: 'Curr WAM',
                  value: data.currWAM
                      ? `${data.currWAM} mo`
                      : null,
              },
              {
                  label: 'Curr WALA',
                  value: data.currWALA
                      ? `${data.currWALA} mo`
                      : null,
              },
              {
                  label: 'Orig collat',
                  value: `$${data.origCollatBalance}`,
              },
              {
                  label: 'Curr collat',
                  value: `$${data.currCollatBalance}`,
              },
              {
                  label: 'Collat factor',
                  value: data.collatFactor,
              },
              {
                  label: 'Collat detail',
                  value: data.collateralDetail,
                  mono: false,
              },
          ]
        : [];

    const cardDefs = [
        {
            label: 'Orig deal balance',
            value: data ? `$${data.origDealBalance}` : null,
            sub: 'Original issuance',
            accent: true,
        },
        {
            label: 'Curr deal balance',
            value: data ? `$${data.currDealBalance}` : null,
            sub: 'Current outstanding',
        },
        {
            label: 'Deal balance factor',
            value: data?.dealBalanceFactor ?? null,
            sub: 'Paydown factor',
        },
        {
            label: 'Deal age',
            value:
                data?.dealAge != null
                    ? `${data.dealAge} mo`
                    : null,
            sub: 'Months since close',
        },
        {
            label: 'Curr WAC',
            value: data?.currWAC ?? null,
            sub: 'Gross coupon',
            accent: true,
        },
        {
            label: 'Curr net WAC',
            value: data?.currNetWAC ?? null,
            sub: 'Net coupon',
        },
        {
            label: 'Curr WAM',
            value: data?.currWAM
                ? `${data.currWAM} mo`
                : null,
            sub: 'Wt avg maturity',
        },
        {
            label: 'Curr WALA',
            value: data?.currWALA
                ? `${data.currWALA} mo`
                : null,
            sub: 'Wt avg loan age',
            highlight: true,
        },
        {
            label: 'Orig collat balance',
            value: data ? `$${data.origCollatBalance}` : null,
            sub: 'Original collateral',
            accent: true,
        },
        {
            label: 'Curr collat balance',
            value: data ? `$${data.currCollatBalance}` : null,
            sub: 'Current collateral',
        },
        {
            label: 'Collat factor',
            value: data?.collatFactor ?? null,
            sub: 'Collateral paydown',
        },
        {
            label: 'Collateral detail',
            value: data?.collateralDetail ?? null,
            sub: 'Pool type',
        },
    ];

    const bodyColumns = (
        plan.panelCols === 1
            ? 3
            : plan.panelCols === 2
              ? 2
              : 1
    ) as 1 | 2 | 3;

    const renderPanel = (name: PanelName) => {
        if (!data) return null;

        switch (name) {
            case 'Identity':
                return (
                    <AttrPanel
                        key="identity"
                        title="Identity"
                        bodyColumns={bodyColumns}
                    >
                        <AttrRow
                            label="Intex deal name"
                            value={data.intexDealName}
                            mono
                        />
                        <AttrRow
                            label="Bloomberg name"
                            value={data.bloombergDealName}
                        />
                        <AttrRow
                            label="Deal type"
                            value={data.dealType}
                        />
                        <AttrRow
                            label="Collateral type"
                            value={data.collateralType}
                        />
                        <AttrRow
                            label="Country"
                            value={data.country}
                        />
                        <AttrRow
                            label="Currency"
                            value={data.currency}
                            mono
                        />
                    </AttrPanel>
                );

            case 'Structure':
                return (
                    <AttrPanel
                        key="structure"
                        title="Structure"
                        bodyColumns={bodyColumns}
                    >
                        <AttrRow
                            label="Classes"
                            value={structure?.classes}
                            mono
                        />
                        <AttrRow
                            label="Triggers"
                            value={structure?.triggerNames}
                        />
                        <AttrRow
                            label="Credit enhancement"
                            value={structure?.creditEnhancementNames}
                        />
                        <AttrRow
                            label="Calls"
                            value={structure?.callNames}
                        />
                        <AttrRow
                            label="Expenses"
                            value={
                                structure?.nExpenses != null
                                    ? String(structure.nExpenses)
                                    : null
                            }
                            mono
                        />
                        <AttrRow
                            label="Settlement"
                            value={structure?.settlementType}
                        />
                        <AttrRow
                            label="Payrule script"
                            value={structure?.hasPayruleScript}
                        />
                    </AttrPanel>
                );

            case 'Dates':
                return (
                    <AttrPanel
                        key="dates"
                        title="Dates"
                        bodyColumns={bodyColumns}
                    >
                        <AttrRow
                            label="Settle date"
                            value={data.settleDate}
                            mono
                        />
                        <AttrRow
                            label="Closing date"
                            value={data.closingDate}
                            mono
                        />
                        <AttrRow
                            label="First pay date"
                            value={data.firstPayDate}
                            mono
                        />
                        <AttrRow
                            label="Latest update"
                            value={data.latestUpdate}
                            mono
                        />
                        <AttrRow
                            label="Model timestamp"
                            value={data.modelTimestamp}
                            mono
                        />
                        <AttrRow
                            label="Next pay day"
                            value={data.nextPayDay}
                            mono
                        />
                    </AttrPanel>
                );

            case 'Parties':
                return (
                    <AttrPanel
                        key="parties"
                        title="Relevant parties"
                        bodyColumns={bodyColumns}
                    >
                        <AttrRow
                            label="Issuer"
                            value={data.issuerName}
                        />
                        <AttrRow
                            label="Trustee"
                            value={data.trustee}
                        />
                        <AttrRow
                            label="Dealer"
                            value={data.dealerName}
                        />
                        <AttrRow
                            label="Master servicer"
                            value={data.masterServicer}
                        />
                    </AttrPanel>
                );

            default:
                return null;
        }
    };

    const panelBuckets: PanelName[][] = Array.from(
        { length: plan.panelCols },
        () => [],
    );

    plan.panels.forEach((panel, index) => {
        panelBuckets[index % plan.panelCols].push(panel);
    });

    const panelsGridClass =
        plan.panelCols === 3
            ? styles.panelsThree
            : plan.panelCols === 2
              ? styles.panelsTwo
              : styles.panelsOne;

    return (
        <div className={styles.fill}>
            <div
                ref={ref}
                className={clsx(
                    styles.dealDetailsContainer,
                    {
                        [styles.wealth]: isWealthTheme,
                        [styles.wealthLight]: isWealthLight,
                        [styles.wealthDark]: isWealthDark,
                    },
                )}
            >
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <BankOutlined
                            className={styles.headerTitleIcon}
                        />

                        <span className={styles.headerTitleText}>
                            Deal details
                        </span>

                        {titleName && (
                            <span
                                className={styles.headerTitleDealName}
                            >
                                {titleName.toUpperCase()}
                            </span>
                        )}

                        {data && (
                            <span
                                className={
                                    styles.headerTitleCollateralType
                                }
                            >
                                {data.collateralType}
                            </span>
                        )}
                    </div>
                </div>

                {!data && (
                    <div className={styles.loadingContainer}>
                        <div
                            className={
                                styles.loadingInnerContainer
                            }
                        >
                            <BankOutlined
                                className={styles.loadingIcon}
                            />
                        </div>

                        <span className={styles.loadingText}>
                            Load a security or upload a CDI file to view
                            deal details
                        </span>
                    </div>
                )}

                {data && (
                    <>
                        {plan.metricCards ? (
                            Array.from({
                                length: plan.metricRows,
                            }).map((_, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={
                                        styles.dealDetailsMetricCardsContainer
                                    }
                                >
                                    {cardDefs
                                        .slice(
                                            rowIndex * plan.cardsPerRow,
                                            rowIndex * plan.cardsPerRow +
                                                plan.cardsPerRow,
                                        )
                                        .map((card) => (
                                            <MetricCard
                                                key={card.label}
                                                label={card.label}
                                                value={card.value}
                                                sub={card.sub}
                                                accent={card.accent}
                                                highlight={card.highlight}
                                            />
                                        ))}
                                </div>
                            ))
                        ) : (
                            <MetricList
                                items={metricItems}
                                columns={plan.listCols}
                            />
                        )}

                        {plan.panels.length > 0 && (
                            <div
                                className={clsx(
                                    styles.dealDetailsAttributePanels,
                                    panelsGridClass,
                                )}
                            >
                                {panelBuckets.map(
                                    (bucket, index) => (
                                        <div
                                            key={index}
                                            className={
                                                styles.panelColStack
                                            }
                                        >
                                            {bucket.map(renderPanel)}
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                        {Boolean(sessionId) && (
                            <div
                                className={
                                    styles.sessionFooterContainer
                                }
                            >
                                <div
                                    className={
                                        styles.sessionFooterIndicator
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

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

    const data =
        mode === 'preview'
            ? widgetPreviewResult
            : normaliseDeal(result);

    React.useEffect(() => {
        if (!dealName) return;

        execute?.({ dealName });

        // Execute is intentionally excluded to avoid a request/rerender loop
        // if its callback identity changes after a result update.
    }, [dealName]);

    if (loading) {
        return (
            <WidgetCardShell overflow="hidden" expandable>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    const content = (
        <DealDetailsContent
            data={data}
            dealName={dealName}
            sessionId={sessionId}
        />
    );

    return (
        <WidgetCardShell
            overflow="hidden"
            expandable
            maximizedChildren={content}
        >
            {content}
        </WidgetCardShell>
    );
}
