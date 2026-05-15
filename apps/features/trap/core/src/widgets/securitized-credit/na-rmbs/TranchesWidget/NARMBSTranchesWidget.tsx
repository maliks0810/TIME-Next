import React from 'react';
import clsx from 'clsx';
import { Typography } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../../types/widget';
import { TrancheRow } from './utils/mockData';
import { getRatingsClassname } from './utils/helpers';
import { ROW_HEIGHT_PX, TRANCHES_COLS, VISIBLE_ROWS } from './utils/constants';
import { DEAL_ID_KEY, DEAL_NAME_KEY, TRANCHE_ID_KEY, TRANCHE_NAME_KEY } from '../../../constants';
import { useGetWidgetValue, useSetWidgetValue } from '../../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import styles from './NARMBSTranchesWidget.module.scss';

const { Text } = Typography;

export function NARMBSTranchesWidget({ result, loading, widgetInstance }: WidgetComponentProps) {
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();
    const trancheId = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: TRANCHE_ID_KEY,
    });
    const dealId = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: DEAL_ID_KEY,
    });
    const dealName = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: DEAL_NAME_KEY,
    });

    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Security Lookup may have pre-selected a tranche
    React.useEffect(() => {
        if (trancheId && trancheId !== selectedId) {
            setSelectedId(trancheId as string);
            // Scroll to make selected row visible
            setTimeout(() => {
                const el = scrollRef.current?.querySelector(`[data-tranche-id="${trancheId}"]`);
                el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 50);
        }
    }, [trancheId]);

    // Clear on deal change
    React.useEffect(() => {
        setSelectedId(null);
        setWidgetValueToChannel({
            key: TRANCHE_ID_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: null,
            activeTab,
        });
        setWidgetValueToChannel({
            key: TRANCHE_NAME_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: null,
            activeTab,
        });
    }, [dealId]);

    // TODO, add Re-execute when TitleBar publishes workflow.refresh

    // tranches come from the server via the result prop
    const tranches: TrancheRow[] | null =
        result && Array.isArray(result.tranches) ? result.tranches : null;

    const handleSelect = (trancheRow: TrancheRow) => {
        setSelectedId(trancheRow.id);
        setWidgetValueToChannel({
            key: TRANCHE_ID_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: trancheRow.id,
            activeTab,
        });
        setWidgetValueToChannel({
            key: TRANCHE_NAME_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: trancheRow.name,
            activeTab,
        });
    };

    const fmt = (n: number) =>
        n === 0
            ? '0.00'
            : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <WidgetCardShell>
            <div className={styles.mainContainer}>
                {/* Header */}
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <TableOutlined className={styles.headerTitleIcon} />
                        <Text className={styles.headerTitleText}>All tranches</Text>
                        {tranches && <div className={styles.counterBadge}>{tranches.length}</div>}
                        {dealName && <Text className={styles.dealName}>{dealName as string}</Text>}
                    </div>
                </div>

                <div style={{ height: 1 }} />

                {/* {loading && Skeletor} */}

                {!loading && !tranches && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingInnerContainer}>
                            <TableOutlined className={styles.loadingIcon} />
                        </div>
                        <Text className={styles.loadingText}>Load a deal to view tranches</Text>
                    </div>
                )}

                {!loading && tranches && (
                    <div className={styles.tranchesTable}>
                        {/* Sticky column header */}
                        <div className={styles.tranchesTableHeader}>
                            {TRANCHES_COLS.map((column) => (
                                <div
                                    key={column.label}
                                    style={{
                                        width: column.width,
                                        flexShrink: 0,
                                        padding: '6px 4px',
                                        textAlign: column.align,
                                    }}
                                >
                                    <Text className={styles.headerColumnText}>{column.label}</Text>
                                </div>
                            ))}
                        </div>

                        <div
                            ref={scrollRef}
                            style={{
                                maxHeight: ROW_HEIGHT_PX * VISIBLE_ROWS,
                                overflowY: 'auto',
                            }}
                        >
                            {tranches.map((tranche) => (
                                <div
                                    key={tranche.id}
                                    data-tranche-id={tranche.id}
                                    onClick={() => handleSelect(tranche)}
                                    style={{
                                        height: ROW_HEIGHT_PX,
                                    }}
                                    className={clsx(styles.tranchesTableRow, {
                                        [styles.tranchesTableRowSelected]:
                                            tranche.id === selectedId,
                                    })}
                                >
                                    {/* Tranche name */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[0].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <Text
                                            className={clsx(styles.trancheColumnValue, {
                                                [styles.trancheColumnValueSelected]:
                                                    tranche.id === selectedId,
                                            })}
                                        >
                                            {tranche.name}
                                        </Text>
                                    </div>
                                    {/* CUSIP */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[1].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <Text className={styles.defaultColValue}>
                                            {tranche.cusip}
                                        </Text>
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
                                        <Text className={styles.couponColValue}>
                                            {tranche.coupon.toFixed(4)}
                                        </Text>
                                    </div>
                                    {/* Type */}
                                    <div
                                        style={{
                                            width: TRANCHES_COLS[3].width,
                                            flexShrink: 0,
                                            paddingRight: 4,
                                        }}
                                    >
                                        <Text
                                            className={clsx(styles.typeColValue, {
                                                [styles.typeColValueMEZ]:
                                                    tranche.type.startsWith('MEZ'),
                                                [styles.typeColValueJUN]:
                                                    tranche.type.startsWith('JUN'),
                                            })}
                                        >
                                            {tranche.type}
                                        </Text>
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
                                        <Text className={styles.currencyColValue}>
                                            {tranche.currency}
                                        </Text>
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
                                        <Text className={styles.defaultColValue}>
                                            {fmt(tranche.origBalance)}
                                        </Text>
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
                                        <Text
                                            className={clsx(styles.zeroableColValue, {
                                                [styles.zeroableColValueZero]:
                                                    tranche.currBalance === 0,
                                            })}
                                        >
                                            {fmt(tranche.currBalance)}
                                        </Text>
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
                                        <Text
                                            className={clsx(styles.zeroableColValue, {
                                                [styles.zeroableColValueZero]: tranche.factor === 0,
                                            })}
                                        >
                                            {tranche.factor.toFixed(4)}
                                        </Text>
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
                                            {tranche.origRatings}
                                        </span>
                                    </div>
                                    {/* Curr ratings */}
                                    <div style={{ width: TRANCHES_COLS[9].width, flexShrink: 0 }}>
                                        <span
                                            className={clsx(
                                                styles.ratingsColValue,
                                                styles[getRatingsClassname(tranche.currRatings)]
                                            )}
                                        >
                                            {tranche.currRatings}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tranches && (
                    <Text className={styles.tranchesTableSubInfo}>
                        {tranches.length} tranches · scroll to view all ·{' '}
                        {selectedId
                            ? `selected: ${tranches.find((t) => t.id === selectedId)?.name}`
                            : 'no selection'}
                    </Text>
                )}
            </div>
        </WidgetCardShell>
    );
}
