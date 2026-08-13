import React from 'react';
import clsx from 'clsx';
import { TableOutlined } from '@ant-design/icons';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../types/widget';
import { TrancheRow } from './utils/mockData';
import { getRatingsClassname } from './utils/helpers';
import { ROW_HEIGHT_PX, TRANCHES_COLS } from './utils/constants';
import { DEAL_ID_KEY, DEAL_NAME_KEY, TRANCHE_ID_KEY, TRANCHE_NAME_KEY } from '../../constants';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import styles from './TranchesWidget.module.scss';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';

const normName = (s: unknown): string =>
    (s ?? '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');

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

    const trancheId = useGetWidgetValue({ channelId, key: TRANCHE_ID_KEY });
    const trancheName = useGetWidgetValue({ channelId, key: TRANCHE_NAME_KEY });
    const dealId = useGetWidgetValue({ channelId, key: DEAL_ID_KEY });
    const dealName = useGetWidgetValue({ channelId, key: DEAL_NAME_KEY });

    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const r = result as TranchesResult | undefined;

    const tranches: TrancheRow[] | null =
        r && Array.isArray(r.tranches) ? r.tranches : null;

    const loadedDealName: string | null =
        r?.dealName ? String(r.dealName) : null;

    const bloombergDealName: string | undefined =
        r?.bloombergDealName ? String(r.bloombergDealName) : undefined;
    const displayDealName = bloombergDealName ?? (dealName as string | undefined);

    const dealMatches =
        !!dealName && !!loadedDealName &&
        normName(dealName) === normName(loadedDealName);

    // Execute for the deal (INTEX name) + reset LOCAL selection when deal changes.
    React.useEffect(() => {
        if (dealName) {
            execute?.({ dealName });
        }
        setSelectedId(null);
    }, [dealName]);

    // Legacy id-path clear.
    React.useEffect(() => {
        setSelectedId(null);
        setWidgetValueToChannel({ key: TRANCHE_ID_KEY, channelId, value: null, activeTab });
        setWidgetValueToChannel({ key: TRANCHE_NAME_KEY, channelId, value: null, activeTab });
    }, [dealId, setWidgetValueToChannel, channelId, activeTab]);

    // NAME-driven select + auto-scroll — gated on the loaded list belonging to
    // the current deal (INTEX match), so Security Lookup's tranche signal
    // survives the load window and selects on the FIRST search.
    React.useEffect(() => {
        if (!tranches || !dealMatches) return;
        const tn = trancheName ? String(trancheName) : '';
        if (!tn) {
            setSelectedId(null);
            return;
        }
        const target = normName(tn);
        const row = tranches.find((t) => normName(t.name) === target);
        if (row) {
            setSelectedId(row.id);
            setTimeout(() => {
                const el = scrollRef.current?.querySelector(`[data-tranche-id="${row.id}"]`);
                el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 50);
        } else {
            setSelectedId(null);
            setWidgetValueToChannel({ key: TRANCHE_NAME_KEY, channelId, value: null, activeTab });
        }
    }, [trancheName, tranches, dealMatches]);

    // Legacy id-driven select/scroll.
    React.useEffect(() => {
        if (trancheId && trancheId !== selectedId) {
            setSelectedId(trancheId as string);
            setTimeout(() => {
                const el = scrollRef.current?.querySelector(`[data-tranche-id="${trancheId}"]`);
                el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 50);
        }
    }, [trancheId]);

    const ratingAgency = tranches && tranches.length > 0 ? tranches[0].ratingAgency : 'unknown';

    const handleSelect = (trancheRow: TrancheRow) => {
        setSelectedId(trancheRow.id);
        setWidgetValueToChannel({ key: TRANCHE_ID_KEY, channelId, value: trancheRow.id, activeTab });
        setWidgetValueToChannel({ key: TRANCHE_NAME_KEY, channelId, value: trancheRow.name, activeTab });
    };

    const fmt = (n: number) =>
        n === 0
            ? '0.00'
            : n.toLocaleString('en-US', {
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
            <div className={styles.mainContainer}>
                {/* Header — always visible */}
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <TableOutlined className={styles.headerTitleIcon} />

                        <span className={styles.headerTitleText}>All tranches</span>

                        {tranches && (
                            <div className={styles.counterBadge}>{tranches.length}</div>
                        )}

                        {displayDealName && (
                            <span className={styles.dealName}>
                                {displayDealName.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                {!loading && !tranches && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <TableOutlined className={styles.loadingIcon} />
                        </div>

                        <span className={styles.loadingText}>Load a deal to view tranches</span>
                    </div>
                )}

                {!loading && tranches && (
                    <div className={styles.tranchesTable}>
                        {/* Sticky column header */}
                        <div className={styles.tranchesTableHeader}>
                            {TRANCHES_COLS.map((column, colIdx) => (
                                <div
                                    key={column.label}
                                    className={clsx({
                                        [styles.stickyFirstCol]: colIdx === 0,
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
                                                ? column.render?.({ ratingAgency })
                                                : column.label
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Body — fills remaining widget height and scrolls */}
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
                                    {/* Tranche name — pinned first column */}
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

                                    {/* CUSIP */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[1].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.defaultColValue}>{tranche.cusip}</span>
                                    </div>

                                    {/* Coupon */}
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

                                    {/* Type */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[3].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span
                                            className={clsx(styles.typeColValue, {
                                                [styles.typeColValueMEZ]: tranche.type.startsWith('MEZ'),
                                                [styles.typeColValueJUN]: tranche.type.startsWith('JUN'),
                                            })}
                                        >
                                            {tranche.type}
                                        </span>
                                    </div>

                                    {/* Currency */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[4].width,
                                            flexShrink: 0,
                                            textAlign: 'center',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.currencyColValue}>{tranche.currency}</span>
                                    </div>

                                    {/* Orig balance */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[5].width,
                                            flexShrink: 0,
                                            textAlign: 'right',
                                            paddingRight: 4,
                                        }}
                                    >
                                        <span className={styles.defaultColValue}>
                                            {fmt(tranche.origBalance)}
                                        </span>
                                    </div>

                                    {/* Curr balance */}
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
                                                [styles.zeroableColValueZero]: tranche.currBalance === 0,
                                            })}
                                        >
                                            {fmt(tranche.currBalance)}
                                        </span>
                                    </div>

                                    {/* Factor */}
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

                                    {/* Orig ratings */}
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

                                    {/* Curr ratings */}
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
                            ? `selected: ${tranches.find((t) => t.id === selectedId)?.name}`
                            : 'no selection'}
                    </span>
                )}
            </div>
        </WidgetCardShell>
    );
}