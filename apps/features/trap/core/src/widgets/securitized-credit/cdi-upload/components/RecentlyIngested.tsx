import type {
    Dispatch,
    SetStateAction,
} from 'react';
import {
    HistoryOutlined,
    DatabaseOutlined,
    DownloadOutlined,
    CloseCircleOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import {
    Button,
    Dropdown,
    Tag,
    Tooltip,
    theme,
} from 'antd';
import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
import type {
    DealFromIntex,
    RecentDeal,
    UploadState,
} from '../../types';
import type { WidgetComponentProps } from '../../../../types/widget';
import styles from './RecentlyIngested.module.scss';

type Lanes = 'two' | 'one' | 'multi';

type RecentlyIngestedProps = {
    lanes: Lanes;
    uploadState: UploadState;
    loadedDeal: RecentDeal | null;
    recentDeals: RecentDeal[];
    fromIntex: DealFromIntex | null;
    fileName: string;
    progress: number;
    fromRecent: boolean;
    errorMsg: string;
    setLoadedDeal: Dispatch<SetStateAction<RecentDeal | null>>;
    setFromRecent: Dispatch<SetStateAction<boolean>>;
    reset: () => void;
    publishDeal: (deal: {
        dealName: string;
        sessionId: string;
    }) => void;
    config: WidgetComponentProps['widgetInstance']['config'];
    handelDownload: (dealName: string) => void;
    onFileDelete: (dealName: string) => void;
};

export const RecetlyIngested = ({
    lanes,
    recentDeals,
    publishDeal,
    setLoadedDeal,
    setFromRecent,
    handelDownload,
    onFileDelete,
}: RecentlyIngestedProps) => {
    const { token } = theme.useToken();
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const handleLoadRecent = (deal: RecentDeal) => {
        setLoadedDeal(deal);
        setFromRecent(true);
        publishDeal(deal);
    };

    // Narrow two-lane mode displays exactly the two most recent deals. The
    // one- and multi-lane layouts retain the complete list.
    const items =
        lanes === 'two'
            ? recentDeals.slice(0, 2)
            : recentDeals;

    const gridClass =
        lanes === 'two'
            ? styles.gridTwo
            : lanes === 'multi'
              ? styles.gridMulti
              : styles.gridOne;

    const asCards =
        lanes === 'two' ||
        lanes === 'multi';

    return (
        <div
            className={clsx(styles.container, {
                [styles.wealth]: isWealthTheme,
                [styles.wealthLight]: isWealthLight,
                [styles.wealthDark]: isWealthDark,
            })}
        >
            <div className={styles.head}>
                <HistoryOutlined className={styles.headIcon} />

                <span className={styles.headText}>
                    Recently Ingested
                </span>

                <Tooltip title="Deals previously loaded">
                    <span
                        className={styles.headInfo}
                        tabIndex={0}
                        aria-label="About recently ingested deals"
                    >
                        ⓘ
                    </span>
                </Tooltip>
            </div>

            {recentDeals.length === 0 ? (
                <span className={styles.empty}>
                    No recently ingested deals found.
                </span>
            ) : (
                <div
                    className={clsx(
                        styles.list,
                        gridClass,
                    )}
                >
                    {items.map((deal, index) => {
                        const rowStyle = !asCards && !isWealthTheme
                            ? {
                                  background:
                                      index % 2 === 0
                                          ? token.colorBgContainer
                                          : token.colorFillAlter,
                                  borderBottom:
                                      index < items.length - 1
                                          ? `1px solid ${token.colorBorderSecondary}`
                                          : 'none',
                              }
                            : undefined;

                        return (
                            <div
                                key={deal.dealId}
                                role="button"
                                tabIndex={0}
                                className={clsx(
                                    styles.deal,
                                    asCards
                                        ? styles.dealCard
                                        : styles.dealRow,
                                    {
                                        [styles.dealRowBordered]:
                                            !asCards &&
                                            index < items.length - 1,
                                        [styles.dealRowEven]:
                                            !asCards && index % 2 === 0,
                                        [styles.dealRowOdd]:
                                            !asCards && index % 2 !== 0,
                                    },
                                )}
                                style={rowStyle}
                                onClick={() => handleLoadRecent(deal)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        handleLoadRecent(deal);
                                    }
                                }}
                            >
                                <DatabaseOutlined
                                    className={styles.dealIcon}
                                />

                                <div className={styles.dealMain}>
                                    <span
                                        className={styles.dealName}
                                        title={deal.dealName}
                                    >
                                        {deal.dealName}
                                    </span>

                                    <span className={styles.dealMeta}>
                                        {new Date(
                                            deal.uploadedAt,
                                        ).toLocaleDateString()}
                                        {' · '}
                                        {new Date(
                                            deal.uploadedAt,
                                        ).toLocaleTimeString()}
                                        {' · '}
                                        {deal.uploadedBy}
                                    </span>
                                </div>

                                <div className={styles.dealRight}>
                                    <Tag className={styles.tag}>
                                        .{deal.sourceType}
                                    </Tag>

                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            items: [
                                                {
                                                    key: 'download',
                                                    label: 'Download',
                                                    icon: (
                                                        <DownloadOutlined
                                                            style={{
                                                                fontSize: 12,
                                                            }}
                                                        />
                                                    ),
                                                    onClick: (event) => {
                                                        event.domEvent.stopPropagation();
                                                        handelDownload(
                                                            deal.dealName,
                                                        );
                                                    },
                                                },
                                                {
                                                    type: 'divider',
                                                },
                                                {
                                                    key: 'delete',
                                                    label: 'Delete',
                                                    icon: (
                                                        <CloseCircleOutlined
                                                            style={{
                                                                fontSize: 12,
                                                            }}
                                                        />
                                                    ),
                                                    danger: true,
                                                    onClick: (event) => {
                                                        event.domEvent.stopPropagation();
                                                        onFileDelete(
                                                            deal.dealName,
                                                        );
                                                    },
                                                },
                                            ],
                                        }}
                                    >
                                        <Button
                                            type="text"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            className={styles.more}
                                            size="small"
                                            aria-label={`Actions for ${deal.dealName}`}
                                            icon={<MoreOutlined />}
                                        />
                                    </Dropdown>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
