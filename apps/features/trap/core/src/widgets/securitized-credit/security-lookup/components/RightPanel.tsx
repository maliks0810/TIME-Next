import {
    CheckCircleFilled,
    CloseCircleOutlined,
    HistoryOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { RECENT_SEARCHES } from '../mock';
import { RecentSearch, SearchResult } from '../types';
import { assetTypeColor } from '../utils';
import { FieldRow } from './FieldRow';
import { Tag, Typography, theme } from 'antd';
const { Text } = Typography;
import styles from './RightPanel.module.scss';
type RightPanelProps = {
    selected: SearchResult | null;
    handleRecentClick: (recent: RecentSearch) => void;
    handleClear: () => void;
};
export const RightPanel = ({ selected, handleRecentClick, handleClear }: RightPanelProps) => {
    const { token } = theme.useToken();
    if (selected) {
        const hasTrancheCtx = !!selected.context['tranche.id'];
        return (
            <div className={styles.wrapper}>
                <div className={styles.security}>
                    <div className={styles.text}>
                        <CheckCircleFilled style={{ fontSize: 13, color: token.colorSuccess }} />
                        <Text style={{ fontSize: 12, fontWeight: 700, color: token.colorSuccess }}>
                            Security loaded
                        </Text>
                    </div>
                    <CloseCircleOutlined
                        onClick={handleClear}
                        style={{
                            fontSize: 14,
                            color: token.colorTextTertiary,
                            cursor: 'pointer',
                        }}
                    />
                </div>

                <div
                    className={styles.tranche}
                    style={{
                        borderRadius: token.borderRadius,
                        border: `1px solid ${token.colorSuccessBorder}`,
                        background: token.colorSuccessBg,
                    }}
                >
                    <div style={{ marginBottom: 8 }}>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: token.colorText,
                                display: 'block',
                            }}
                        >
                            {selected.name}
                        </Text>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <Tag
                                color={assetTypeColor(selected.assetType)}
                                style={{ fontSize: 10, margin: 0 }}
                            >
                                {selected.assetType}
                            </Tag>
                            {hasTrancheCtx && (
                                <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                                    Tranche
                                </Tag>
                            )}
                        </div>
                    </div>
                    <FieldRow label="CUSIP" value={selected.cusip} mono />
                    <FieldRow label="ISIN" value={selected.isin} mono />
                    <FieldRow label="Aladdin ID" value={selected.aladdinId} mono />
                    <FieldRow label="FIGI" value={selected.figi} mono last />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <HistoryOutlined style={{ fontSize: 11, color: token.colorTextTertiary }} />
                <Text
                    className={styles.label}
                    style={{
                        color: token.colorTextTertiary,
                    }}
                >
                    Recent searches
                </Text>
            </div>
            <div
                style={{
                    borderRadius: token.borderRadiusSM,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    overflow: 'hidden',
                    width: '100%',
                }}
            >
                {RECENT_SEARCHES.map((result, idx) => (
                    <div
                        key={result.cusip}
                        onClick={() => handleRecentClick(result)}
                        className={styles.result}
                        style={{
                            background:
                                idx % 2 === 0 ? token.colorBgContainer : token.colorFillAlter,
                            borderBottom:
                                idx < RECENT_SEARCHES.length - 1
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text
                                className={styles.name}
                                style={{
                                    color: token.colorText,
                                }}
                            >
                                {result.name}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontFamily: 'monospace',
                                    color: token.colorTextTertiary,
                                }}
                            >
                                {result.cusip}
                            </Text>
                        </div>
                        <Tag color="default" className={styles.tag}>
                            {result.collateralType}
                        </Tag>
                        <ArrowRightOutlined
                            style={{
                                fontSize: 11,
                                color: token.colorTextQuaternary,
                                flexShrink: 0,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
