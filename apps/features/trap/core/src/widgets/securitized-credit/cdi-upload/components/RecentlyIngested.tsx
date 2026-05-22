import {
    FileZipOutlined,
    CheckCircleFilled,
    CloseCircleOutlined,
    DatabaseOutlined,
    HistoryOutlined,
    ArrowRightOutlined,
    FileDoneOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { MetaRow } from './MetaRow';
import { theme, Typography, Progress, Button, Tag, Tooltip } from 'antd';
import { SectionLabel } from './SectionLabel';
import { DealFromIntex, RecentDeal, UploadState } from '../../types';
import { WidgetComponentProps } from '../../../../types/widget';
import styles from './RecentlyIngested.module.scss';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import { useSetWidgetValue } from '../../../../state/Widgets/hooks';
import {
    ANALYSIS_SESSION_ID_KEY,
    DEAL_ID_KEY,
    DEAL_NAME_KEY,
    IS_ASSET_NEW_KEY,
    TRANCHE_ID_KEY,
    TRANCHE_NAME_KEY,
} from '../../../../widgets/constants';
const { Text } = Typography;

type RecetlyIngestedProps = {
    uploadState: UploadState;
    loadedDeal: RecentDeal | null;
    recentDeals: RecentDeal[];
    fromIntex: DealFromIntex | null;
    fileName: string;
    progress: number;
    fromRecent: boolean;
    errorMsg: string;
    setLoadedDeal: React.Dispatch<React.SetStateAction<RecentDeal | null>>;
    setFromRecent: React.Dispatch<React.SetStateAction<boolean>>;
    reset: () => void;
    publishDeal: (deal: { dealId: string; dealName: string; sessionId: string }) => void;
    config: WidgetComponentProps['widgetInstance']['config'];
    handelDownload: () => void;
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
}: RecetlyIngestedProps) => {
    const { token } = theme.useToken();

    const handleLoadRecent = (deal: RecentDeal) => {
        setLoadedDeal(deal);
        setFromRecent(true);
        publishDeal(deal);
    };

    const setWidgetValueToChannel = useSetWidgetValue();

    const activeTab = useGetActiveTab();

    const channelId = config?.params?.channel;
    const handleClearRecent = () => {
        setLoadedDeal(null);
        setFromRecent(false);
        [
            DEAL_NAME_KEY,
            DEAL_ID_KEY,
            ANALYSIS_SESSION_ID_KEY,
            TRANCHE_ID_KEY,
            TRANCHE_NAME_KEY,
            IS_ASSET_NEW_KEY,
        ].forEach((key) => setWidgetValueToChannel({ key, value: null, activeTab, channelId }));
    };
    // Uploading
    if (uploadState === 'uploading') {
        return (
            <div className={styles.uploading}>
                <SectionLabel>Uploading…</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileZipOutlined style={{ color: token.colorPrimary, fontSize: 15 }} />
                    <Text
                        style={{
                            fontSize: 12,
                            fontFamily: 'monospace',
                            color: token.colorText,
                            fontWeight: 500,
                        }}
                    >
                        {fileName}
                    </Text>
                </div>
                <Progress
                    percent={progress}
                    strokeColor={progress >= 60 ? token.colorSuccess : token.colorPrimary}
                    size="small"
                    showInfo
                />
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                    {progress < 60 ? 'Reading file…' : 'Processing via PRISM → INTEX Service…'}
                </Text>
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
                    <Text style={{ fontSize: 12, fontWeight: 700, color: token.colorError }}>
                        Upload failed
                    </Text>
                    <Text style={{ fontSize: 11, color: token.colorError }}>{errorMsg}</Text>
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
                        <Text style={{ fontSize: 12, fontWeight: 700 }}>{fromIntex.dealName}</Text>
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
                        <Text style={{ fontSize: 13, fontWeight: 700, color: token.colorText }}>
                            {fromIntex.dealName}
                        </Text>
                        <DownloadOutlined onClick={handelDownload} />
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
                        <Text style={{ fontSize: 12, fontWeight: 700, color: token.colorSuccess }}>
                            CDI package loaded
                        </Text>
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
                        <Text style={{ fontSize: 13, fontWeight: 700, color: token.colorText }}>
                            {loadedDeal.dealName}
                        </Text>
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
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: token.colorTextTertiary,
                    }}
                >
                    Recently ingested
                </Text>
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
                <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                    No recently ingested deals found.
                </Text>
            ) : (
                <div
                    style={{
                        borderRadius: token.borderRadiusSM,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        overflow: 'auto',
                        width: '100%',
                        maxHeight: 200,
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
                                <Text
                                    className={styles.name}
                                    style={{
                                        color: token.colorText,
                                    }}
                                >
                                    {deal.dealName}
                                </Text>
                                <Text style={{ fontSize: 10, color: token.colorTextTertiary }}>
                                    {deal.uploadedAt} · {deal.uploadedBy}
                                </Text>
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
                                <ArrowRightOutlined
                                    style={{ fontSize: 11, color: token.colorTextQuaternary }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
