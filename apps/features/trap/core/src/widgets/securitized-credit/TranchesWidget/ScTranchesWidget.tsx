import React from 'react';
import clsx from 'clsx';
import { TableOutlined } from '@ant-design/icons';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import type { WidgetComponentProps } from '../../../types/widget';
import { useTheme } from '../../../theme/ThemeContext';
import { TrancheRow } from './utils/mockData';
import { getRatingsClassname } from './utils/helpers';
import { ROW_HEIGHT_PX, TRANCHES_COLS } from './utils/constants';
import { DEAL_ID_KEY, DEAL_NAME_KEY, TRANCHE_ID_KEY, TRANCHE_NAME_KEY } from '../../constants';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import styles from './TranchesWidget.module.scss';

const normName = (value: unknown): string =>
    (value ?? '')
        .toString()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

type TranchesResult = {
    dealName?: string;
    bloombergDealName?: string;
    tranches?: TrancheRow[];
};

export function ScTranchesWidget({
    result,
    loading,
    widgetInstance,
    execute,
}: WidgetComponentProps) {
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();
    const channelId = widgetInstance?.config?.params?.channel;
    const { themeName } = useTheme();

    const isWealthTheme = themeName === 'wealthLight' || themeName === 'wealthDark';

    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const trancheId = useGetWidgetValue({
        channelId,
        key: TRANCHE_ID_KEY,
    });

    const trancheName = useGetWidgetValue({
        channelId,
        key: TRANCHE_NAME_KEY,
    });

    const dealId = useGetWidgetValue({
        channelId,
        key: DEAL_ID_KEY,
    });

    const dealName = useGetWidgetValue({
        channelId,
        key: DEAL_NAME_KEY,
    });

    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const response = result as TranchesResult | undefined;

    const tranches: TrancheRow[] | null =
        response && Array.isArray(response.tranches) ? response.tranches : null;

    const loadedDealName: string | null = response?.dealName ? String(response.dealName) : null;

    const bloombergDealName: string | undefined = response?.bloombergDealName
        ? String(response.bloombergDealName)
        : undefined;

    const displayDealName = bloombergDealName ?? (dealName as string | undefined);

    const dealMatches =
        Boolean(dealName) &&
        Boolean(loadedDealName) &&
        normName(dealName) === normName(loadedDealName);

    // Execute for the INTEX deal name and reset local selection when the deal
    // changes.
    React.useEffect(() => {
        if (dealName) {
            execute?.({ dealName });
        }

        setSelectedId(null);

        // Execute is intentionally excluded to avoid a request/rerender loop
        // when the runtime recreates the callback after a result update.
    }, [dealName]);

    // Legacy deal-id path: clear tranche selection when the deal id changes.
    React.useEffect(() => {
        setSelectedId(null);

        setWidgetValueToChannel({
            key: TRANCHE_ID_KEY,
            channelId,
            value: null,
            activeTab,
            widgetId: widgetInstance.id,
        });

        setWidgetValueToChannel({
            key: TRANCHE_NAME_KEY,
            channelId,
            value: null,
            activeTab,
            widgetId: widgetInstance.id,
        });
    }, [dealId, channelId, activeTab]);

    // Name-driven selection and auto-scroll. The selection is applied only
    // when the loaded tranche list belongs to the active deal.
    React.useEffect(() => {
        if (!tranches || !dealMatches) return;

        const selectedName = trancheName ? String(trancheName) : '';

        if (!selectedName) {
            setSelectedId(null);
            return;
        }

        const target = normName(selectedName);
        const row = tranches.find((tranche) => normName(tranche.name) === target);

        if (row) {
            setSelectedId(row.id);

            setTimeout(() => {
                const element = scrollRef.current?.querySelector(`[data-tranche-id="${row.id}"]`);

                element?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                });
            }, 50);
        } else {
            setSelectedId(null);

            setWidgetValueToChannel({
                key: TRANCHE_NAME_KEY,
                channelId,
                value: null,
                activeTab,
                widgetId: widgetInstance.id,
            });
        }
    }, [trancheName, tranches, dealMatches, channelId, activeTab]);

    // Legacy id-driven selection and auto-scroll.
    React.useEffect(() => {
        if (!trancheId || trancheId === selectedId) return;

        setSelectedId(trancheId as string);

        setTimeout(() => {
            const element = scrollRef.current?.querySelector(`[data-tranche-id="${trancheId}"]`);

            element?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }, 50);
    }, [trancheId, selectedId]);

    const ratingAgency = tranches && tranches.length > 0 ? tranches[0].ratingAgency : 'unknown';

    const handleSelect = (trancheRow: TrancheRow) => {
        setSelectedId(trancheRow.id);

        setWidgetValueToChannel({
            key: TRANCHE_ID_KEY,
            channelId,
            value: trancheRow.id,
            activeTab,
            widgetId: widgetInstance.id,
        });

        setWidgetValueToChannel({
            key: TRANCHE_NAME_KEY,
            channelId,
            value: trancheRow.name,
            activeTab,
            widgetId: widgetInstance.id,
        });
    };

    const formatNumber = (value: number) =>
        value === 0
            ? '0.00'
            : value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const renderHeaderLabel = (label: React.ReactNode) => {
        if (typeof label !== 'string') {
            return label;
        }

        const match = label.match(/^(.*?)(\s*\(.+\))$/);

        if (!match) {
            return label;
        }

        return (
            <>
                <span>{match[1]}</span>
                <span className={styles.headerColumnSubText}>{match[2].trim()}</span>
            </>
        );
    };

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
                className={clsx(styles.mainContainer, {
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
            >
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <TableOutlined className={styles.headerTitleIcon} />

                        <span className={styles.headerTitleText}>All tranches</span>

                        {tranches && <div className={styles.counterBadge}>{tranches.length}</div>}

                        {displayDealName && (
                            <span className={styles.dealName}>{displayDealName.toUpperCase()}</span>
                        )}
                    </div>
                </div>

                {!tranches && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <TableOutlined className={styles.loadingIcon} />
                        </div>

                        <span className={styles.loadingText}>Load a deal to view tranches</span>
                    </div>
                )}

                {tranches && (
                    <div className={styles.tranchesTable}>
                        <div className={styles.tranchesTableHeader}>
                            {TRANCHES_COLS.map((column, columnIndex) => (
                                <div
                                    key={column.label}
                                    className={clsx({
                                        [styles.stickyFirstCol]: columnIndex === 0,
                                    })}
                                    style={{
                                        width: column.width,
                                        flexShrink: 0,
                                        padding: '6px 4px',
                                        textAlign: column.align,
                                    }}
                                >
                                    <span className={styles.headerColumnText}>
                                        {renderHeaderLabel(
                                            column.render
                                                ? column.render({
                                                      ratingAgency,
                                                  })
                                                : column.label
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div ref={scrollRef} className={styles.tranchesTableBody}>
                            {tranches.map((tranche) => (
                                <div
                                    key={tranche.id}
                                    data-tranche-id={tranche.id}
                                    onClick={() => handleSelect(tranche)}
                                    style={{ height: ROW_HEIGHT_PX }}
                                    className={clsx(styles.tranchesTableRow, {
                                        [styles.tranchesTableRowSelected]:
                                            tranche.id === selectedId,
                                    })}
                                >
                                    <div
                                        className={styles.stickyFirstCol}
                                        style={{
                                            width: TRANCHES_COLS[0].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span
                                            className={clsx(styles.trancheColumnValue, {
                                                [styles.trancheColumnValueSelected]:
                                                    tranche.id === selectedId,
                                            })}
                                        >
                                            {tranche.name}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[1].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.defaultColValue}>
                                            {tranche.cusip}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[2].width,
                                            flexShrink: 0,
                                            textAlign: 'right',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.couponColValue}>
                                            {tranche.coupon.toFixed(4)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[3].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span
                                            className={clsx(styles.typeColValue, {
                                                [styles.typeColValueMEZ]:
                                                    tranche.type.startsWith('MEZ'),
                                                [styles.typeColValueJUN]:
                                                    tranche.type.startsWith('JUN'),
                                            })}
                                        >
                                            {tranche.type}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[4].width,
                                            flexShrink: 0,
                                            textAlign: 'center',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.currencyColValue}>
                                            {tranche.currency}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[5].width,
                                            flexShrink: 0,
                                            textAlign: 'right',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.defaultColValue}>
                                            {formatNumber(tranche.origBalance)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[6].width,
                                            flexShrink: 0,
                                            textAlign: 'right',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span
                                            className={clsx(styles.zeroableColValue, {
                                                [styles.zeroableColValueZero]:
                                                    tranche.currBalance === 0,
                                            })}
                                        >
                                            {formatNumber(tranche.currBalance)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[7].width,
                                            flexShrink: 0,
                                            textAlign: 'right',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span
                                            className={clsx(styles.zeroableColValue, {
                                                [styles.zeroableColValueZero]: tranche.factor === 0,
                                            })}
                                        >
                                            {tranche.factor.toFixed(4)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[8].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span
                                            className={clsx(
                                                styles.ratingsColValue,
                                                styles[getRatingsClassname(tranche.origRatings)]
                                            )}
                                        >
                                            {tranche.origRatings || 'NA'}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            width: TRANCHES_COLS[9].width,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <span
                                            className={clsx(
                                                styles.ratingsColValue,
                                                styles[getRatingsClassname(tranche.currRatings)]
                                            )}
                                        >
                                            {tranche.currRatings || 'NA'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tranches && (
                    <span className={styles.tranchesTableSubInfo}>
                        {tranches.length} tranches · scroll to view all ·{' '}
                        {selectedId
                            ? `selected: ${
                                  tranches.find((tranche) => tranche.id === selectedId)?.name
                              }`
                            : 'no selection'}
                    </span>
                )}
            </div>
        </WidgetCardShell>
    );
}
