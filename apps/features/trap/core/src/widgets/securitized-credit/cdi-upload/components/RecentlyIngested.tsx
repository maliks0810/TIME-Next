import type { Dispatch, SetStateAction } from 'react';
import {
    HistoryOutlined,
    DatabaseOutlined,
    DownloadOutlined,
    CloseCircleOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { theme, Tag, Dropdown, Button, Tooltip } from 'antd';

import { DealFromIntex, RecentDeal, UploadState } from '../../types';
import { WidgetComponentProps } from '../../../../types/widget';
import styles from './RecentlyIngested.module.scss';

type Lanes = 'two' | 'one' | 'multi';

type RecetlyIngestedProps = {
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
    publishDeal: (deal: { dealName: string; sessionId: string }) => void;
    config: WidgetComponentProps['widgetInstance']['config'];
    handelDownload: (dealName: string) => void;
    onFileDelete: (id: string) => void;
};

export const RecetlyIngested = ({
    lanes,
    recentDeals,
    publishDeal,
    setLoadedDeal,
    setFromRecent,
    handelDownload,
    onFileDelete,
}: RecetlyIngestedProps) => {
    const { token } = theme.useToken();
    const handleLoadRecent = (deal: RecentDeal) => {
        setLoadedDeal(deal);
        setFromRecent(true);
        publishDeal(deal);
    };

    // 'two' → exactly 2 most recent, side by side. 'one'/'multi' → all items.
    const items = lanes === 'two' ? recentDeals.slice(0, 2) : recentDeals;
    const gridCls =
        lanes === 'two' ? styles.gridTwo : lanes === 'multi' ? styles.gridMulti : styles.gridOne;
    const asCards = lanes === 'two' || lanes === 'multi'; // bordered cards vs list rows

    return (
        <div className={styles.container}>
            <div className={styles.head}>
                <HistoryOutlined className={styles.headIcon} />
                <span className={styles.headText}>Recently Ingested</span>
                <Tooltip title="Deals previously loaded">
                    <span className={styles.headInfo}>ⓘ</span>
                </Tooltip>
            </div>

            {recentDeals.length === 0 ? (
                <span className={styles.empty}>No recently ingested deals found.</span>
            ) : (
                <div className={`${styles.list} ${gridCls}`}>
                    {items.map((deal, idx) => (
                        <div
                            key={deal.dealId}
                            className={`${styles.deal} ${asCards ? styles.dealCard : styles.dealRow}`}
                            style={
                                !asCards
                                    ? {
                                          background: idx % 2 === 0 ? token.colorBgContainer : token.colorFillAlter,
                                          borderBottom:
                                              idx < items.length - 1
                                                  ? `1px solid ${token.colorBorderSecondary}`
                                                  : 'none',
                                      }
                                    : undefined
                            }
                            onClick={() => handleLoadRecent(deal)}
                        >
                            <DatabaseOutlined className={styles.dealIcon} />

                            <div className={styles.dealMain}>
                                <span className={styles.dealName}>{deal.dealName}</span>
                                <span className={styles.dealMeta}>
                                    {new Date(deal.uploadedAt).toLocaleDateString()} ·{' '}
                                    {new Date(deal.uploadedAt).toLocaleTimeString()} · {deal.uploadedBy}
                                </span>
                            </div>

                            <div className={styles.dealRight}>
                                <Tag className={styles.tag}>.{deal.sourceType}</Tag>
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            {
                                                key: 'download',
                                                label: 'Download',
                                                icon: <DownloadOutlined style={{ fontSize: 12 }} />,
                                                onClick: (e) => {
                                                    e.domEvent.stopPropagation();
                                                    handelDownload(deal.dealName);
                                                },
                                            },
                                            { type: 'divider' },
                                            {
                                                key: 'delete',
                                                label: 'Delete',
                                                icon: <CloseCircleOutlined style={{ fontSize: 12 }} />,
                                                danger: true,
                                                onClick: (e) => {
                                                    e.domEvent.stopPropagation();
                                                    onFileDelete(deal.dealName);
                                                },
                                            },
                                        ],
                                    }}
                                >
                                    <Button
                                        onClick={(e) => e.stopPropagation()}
                                        className={styles.more}
                                        size="small"
                                        icon={<MoreOutlined />}
                                    />
                                </Dropdown>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};