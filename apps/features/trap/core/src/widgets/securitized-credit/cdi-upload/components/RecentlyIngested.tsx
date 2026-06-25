import type { Dispatch, SetStateAction } from 'react';
import {
    FileZipOutlined,
    CheckCircleFilled,
    CloseCircleOutlined,
    DatabaseOutlined,
    HistoryOutlined,
    FileDoneOutlined,
    DownloadOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { theme, Progress, Button, Tag, Tooltip, Dropdown } from 'antd';

import { MetaRow } from './MetaRow';
import { SectionLabel } from './SectionLabel';
import { DealFromIntex, RecentDeal, UploadState } from '../../types';
import { WidgetComponentProps } from '../../../../types/widget';
import styles from './RecentlyIngested.module.scss';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import { useSetWidgetValue } from '../../../../state/Widgets/hooks';
import { ANALYSIS_SESSION_ID_KEY } from '../../../../widgets/constants';

type RecetlyIngestedProps = {
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
    fileName,
    fromRecent,
    progress,
    uploadState,
    loadedDeal,
    recentDeals,
    publishDeal,
    setLoadedDeal,
    setFromRecent,
    fromIntex,
    reset,
    errorMsg,
    config,
    handelDownload,
    onFileDelete,
}: RecetlyIngestedProps) => {
    const { token } = theme.useToken();

    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();
    const channelId = config?.params?.channel;

    const handleLoadRecent = (deal: RecentDeal) => {
        setLoadedDeal(deal);
        setFromRecent(true);
        publishDeal(deal);
    };

    const handleDelete = (dealName: string) => {
        onFileDelete(dealName);
    };

    const handleClearRecent = () => {
        setLoadedDeal(null);
        setFromRecent(false);

        setWidgetValueToChannel({
            key: ANALYSIS_SESSION_ID_KEY,
            value: null,
            activeTab,
            channelId,
        });
    };

    // Uploading
    if (uploadState === 'uploading') {
        return (
            <div className={styles.uploading}>
                <SectionLabel>Uploading…</SectionLabel>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileZipOutlined style={{ color: token.colorPrimary, fontSize: 15 }} />

                    <span
                        className={styles.uploadingFileName}
                        style={{
                            color: token.colorText,
                        }}
                    >
                        {fileName}
                    </span>
                </div>

                <Progress
                    percent={progress}
                    strokeColor={progress >= 60 ? token.colorSuccess : token.colorPrimary}
                    size="small"
                    showInfo
                />

                <span
                    className={styles.uploadingStatus}
                    style={{
                        color: token.colorTextSecondary,
                    }}
                >
                    {progress < 60 ? 'Reading file…' : 'Processing via PRISM → INTEX Service…'}
                </span>
            </div>
        );
    }

    // Error
    if (uploadState === 'error') {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <div
                    style={{
                        borderRadius: token.borderRadius,
                        background: token.colorErrorBg,
                        border: `1px solid ${token.colorErrorBorder}`,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}
                >
                    <span
                        className={styles.errorTitle}
                        style={{
                            color: token.colorError,
                        }}
                    >
                        Upload failed
                    </span>

                    <span
                        className={styles.errorMessage}
                        style={{
                            color: token.colorError,
                        }}
                    >
                        {errorMsg}
                    </span>
                </div>

                <Button size="small" onClick={reset}>
                    Try again
                </Button>
            </div>
        );
    }

    if (uploadState === 'success' && fromIntex) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={styles.loadedDealName}>{fromIntex.dealName}</span>
                    </div>

                    <CloseCircleOutlined
                        onClick={fromRecent ? handleClearRecent : reset}
                        style={{
                            fontSize: 16,
                            color: token.colorTextTertiary,
                            cursor: 'pointer',
                        }}
                    />
                </div>

                <div
                    style={{
                        borderRadius: token.borderRadius,
                        border: `1px solid ${token.colorSuccessBorder}`,
                        background: token.colorSuccessBg,
                        padding: '10px 14px',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        <FileDoneOutlined style={{ fontSize: 13, color: token.colorSuccess }} />

                        <span
                            className={styles.successDealName}
                            style={{
                                color: token.colorText,
                            }}
                        >
                            {fromIntex.dealName}
                        </span>

                        <DownloadOutlined onClick={() => handelDownload(fromIntex.dealName)} />
                    </div>

                    <MetaRow label="Uploaded" value={fromIntex.uploadedAt} />
                    <MetaRow label="Uploaded by" value={fromIntex.uploadedBy} />
                    <MetaRow label="Source" value={'.zip'} last />
                </div>
            </div>
        );
    }

    // Success / from recent — loaded deal metadata
    if ((uploadState === 'success' || fromRecent) && loadedDeal) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircleFilled style={{ fontSize: 13, color: token.colorSuccess }} />

                        <span
                            className={styles.packageLoadedText}
                            style={{
                                color: token.colorSuccess,
                            }}
                        >
                            CDI package loaded
                        </span>
                    </div>

                    <CloseCircleOutlined
                        onClick={fromRecent ? handleClearRecent : reset}
                        style={{
                            fontSize: 16,
                            color: token.colorTextTertiary,
                            cursor: 'pointer',
                        }}
                    />
                </div>

                <div
                    style={{
                        borderRadius: token.borderRadius,
                        border: `1px solid ${token.colorSuccessBorder}`,
                        background: token.colorSuccessBg,
                        padding: '10px 14px',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        <DatabaseOutlined style={{ fontSize: 13, color: token.colorSuccess }} />

                        <span
                            className={styles.successDealName}
                            style={{
                                color: token.colorText,
                            }}
                        >
                            {loadedDeal.dealName}
                        </span>

                        <Tag
                            style={{
                                fontSize: 9,
                                margin: 0,
                                lineHeight: '16px',
                                fontFamily: 'monospace',
                            }}
                        >
                            .{loadedDeal.sourceType}
                        </Tag>
                    </div>

                    <MetaRow label="Package path" value={loadedDeal.packagePath} mono />
                    <MetaRow label="Session ID" value={loadedDeal.sessionId} mono />
                    <MetaRow label="Uploaded" value={loadedDeal.uploadedAt} />
                    <MetaRow label="Uploaded by" value={loadedDeal.uploadedBy} />
                    <MetaRow label="Deal Id" value={loadedDeal.dealId} mono last />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.items}>
                <HistoryOutlined style={{ fontSize: 11, color: token.colorTextTertiary }} />

                <span
                    className={styles.sectionTitle}
                    style={{
                        color: token.colorTextTertiary,
                    }}
                >
                    Recently ingested
                </span>

                <Tooltip title="Deals previously loaded">
                    <span
                        style={{
                            fontSize: 11,
                            color: token.colorTextQuaternary,
                            cursor: 'help',
                        }}
                    >
                        ⓘ
                    </span>
                </Tooltip>
            </div>

            {recentDeals.length === 0 ? (
                <span
                    className={styles.emptyText}
                    style={{
                        color: token.colorTextTertiary,
                    }}
                >
                    No recently ingested deals found.
                </span>
            ) : (
                <div
                    style={{
                        borderRadius: token.borderRadiusSM,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        overflow: 'auto',
                        width: '100%',
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    {recentDeals.map((deal, idx) => (
                        <div
                            key={deal.dealId}
                            onClick={() => handleLoadRecent(deal)}
                            className={styles.deals}
                            style={{
                                background:
                                    idx % 2 === 0 ? token.colorBgContainer : token.colorFillAlter,
                                borderBottom:
                                    idx < recentDeals.length - 1
                                        ? `1px solid ${token.colorBorderSecondary}`
                                        : 'none',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                                token.colorPrimaryBg)
                            }
                            onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                                idx % 2 === 0 ? token.colorBgContainer : token.colorFillAlter)
                            }
                        >
                            <DatabaseOutlined
                                style={{
                                    fontSize: 12,
                                    color: token.colorPrimary,
                                    flexShrink: 0,
                                }}
                            />

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span
                                    className={styles.name}
                                    style={{
                                        color: token.colorText,
                                    }}
                                >
                                    {deal.dealName}
                                </span>

                                <span
                                    className={styles.recentDealMeta}
                                    style={{
                                        color: token.colorTextTertiary,
                                    }}
                                >
                                    {new Date(deal.uploadedAt).toLocaleDateString()} ·{' '}
                                    {new Date(deal.uploadedAt).toLocaleTimeString()} ·{' '}
                                    {deal.uploadedBy}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    flexShrink: 0,
                                }}
                            >
                                <Tag className={styles.tag}>.{deal.sourceType}</Tag>

                                <Dropdown
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
                                            {
                                                type: 'divider',
                                            },
                                            {
                                                key: 'delete',
                                                label: 'Delete',
                                                icon: <CloseCircleOutlined style={{ fontSize: 12 }} />,
                                                danger: true,
                                                onClick: (e) => {
                                                    e.domEvent.stopPropagation();
                                                    handleDelete(deal.dealName);
                                                },
                                            },
                                        ],
                                    }}
                                    trigger={['click']}
                                >
                                    <Button
                                        onClick={(e) => e.stopPropagation()}
                                        className={styles.delete}
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