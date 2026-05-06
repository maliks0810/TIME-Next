import {
    FileZipOutlined,
    CheckCircleFilled,
    CloseCircleOutlined,
    DatabaseOutlined,
    HistoryOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { MetaRow } from './MetaRow';
import { theme, Typography, Progress, Button, Tag, Tooltip } from 'antd';
import { SectionLabel } from './SectionLabel';
import { RecentDeal, UploadState } from '../../types';
import { WidgetComponentProps } from '../../../../types/widget';

const { Text } = Typography;

type RecetlyIngestedProps = {
    uploadState: UploadState;
    loadedDeal: RecentDeal | null;
    recentDeals: RecentDeal[];
    fileName: string;
    progress: number;
    fromRecent: boolean;
    errorMsg: string;
    setLoadedDeal: React.Dispatch<React.SetStateAction<RecentDeal | null>>;
    setFromRecent: React.Dispatch<React.SetStateAction<boolean>>;
    reset: () => void;
    publishDeal: (deal: { dealId: string; dealName: string; sessionId: string }) => void;
    onPublishContext: WidgetComponentProps['onPublishContext'];
    widgetId?: string;
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
    reset,
    errorMsg,
    onPublishContext,
    widgetId,
}: RecetlyIngestedProps) => {
    const { token } = theme.useToken();

    const handleLoadRecent = (deal: RecentDeal) => {
        setLoadedDeal(deal);
        setFromRecent(true);
        publishDeal(deal);
    };

    const handleClearRecent = () => {
        setLoadedDeal(null);
        setFromRecent(false);
        [
            'deal.id',
            'deal.name',
            'analysis.sessionId',
            'tranche.id',
            'tranche.name',
            'asset.isNew',
        ].forEach((k) => onPublishContext?.(k, undefined, widgetId));
    };
    // Uploading
    if (uploadState === 'uploading') {
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
                    <MetaRow
                        label="Package path"
                        value={loadedDeal.packagePath}
                        mono
                        token={token}
                    />
                    <MetaRow label="Session ID" value={loadedDeal.sessionId} mono token={token} />
                    <MetaRow label="Uploaded" value={loadedDeal.uploadedAt} token={token} />
                    <MetaRow label="Uploaded by" value={loadedDeal.uploadedBy} token={token} />
                    <MetaRow label="deal.id" value={loadedDeal.dealId} mono token={token} last />
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 0,
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                        overflow: 'hidden',
                        width: '100%',
                    }}
                >
                    {recentDeals.map((deal, idx) => (
                        <div
                            key={deal.dealId}
                            onClick={() => handleLoadRecent(deal)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 12px',
                                cursor: 'pointer',
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
                                    style={{
                                        display: 'block',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: token.colorText,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
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
                                <Tag
                                    style={{
                                        fontSize: 9,
                                        margin: 0,
                                        fontFamily: 'monospace',
                                        lineHeight: '16px',
                                    }}
                                >
                                    .{deal.sourceType}
                                </Tag>
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
