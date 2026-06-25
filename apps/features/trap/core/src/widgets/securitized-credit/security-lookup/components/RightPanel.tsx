import {
    CheckCircleFilled,
    CloseCircleOutlined,
    HistoryOutlined,
    ArrowRightOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { RecentSearch, SearchResult } from '../types';
import { assetTypeColor } from '../utils';
import { FieldRow } from './FieldRow';
import { Tag, theme } from 'antd';
import styles from './RightPanel.module.scss';

type RightPanelProps = {
    selected: SearchResult | null;
    recentSearches: RecentSearch[];
    handleRecentClick: (recent: RecentSearch) => void;
    handleClear: () => void;
};

export const RightPanel = ({
    selected,
    handleClear,
}: RightPanelProps) => {
    const { token } = theme.useToken();

    if (selected) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.security}>
                    <div className={styles.text}>
                        <CheckCircleFilled style={{ fontSize: 13, color: token.colorSuccess }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: token.colorSuccess }}>
                            Security loaded
                        </span>
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
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: token.colorText,
                                display: 'block',
                            }}
                        >
                            {selected.name}
                        </span>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <Tag
                                color={assetTypeColor(selected.assetType)}
                                style={{ fontSize: 10, margin: 0 }}
                            >
                                {selected.assetType}
                            </Tag>
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
                <span
                    style={{
                        fontSize: 10,
                        lineHeight: '14px',
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: token.colorTextTertiary,
                    }}
                >
                    Recent searches
                </span>
            </div>

            <div className={styles.recentWrapper}>
                {/* Blurred placeholder list */}
                <div className={styles.recentBlurred}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={styles.placeholderRow}
                            style={{
                                background:
                                    i % 2 === 1
                                        ? token.colorBgContainer
                                        : token.colorFillAlter,
                                borderBottom:
                                    i < 3
                                        ? `1px solid ${token.colorBorderSecondary}`
                                        : 'none',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div
                                    className={styles.shimmer}
                                    style={{
                                        width: '70%',
                                        height: 12,
                                        borderRadius: 3,
                                        background: token.colorFillSecondary,
                                    }}
                                />
                                <div
                                    className={styles.shimmer}
                                    style={{
                                        width: '40%',
                                        height: 10,
                                        borderRadius: 3,
                                        marginTop: 6,
                                        background: token.colorFillSecondary,
                                    }}
                                />
                            </div>
                            <ArrowRightOutlined
                                style={{
                                    fontSize: 11,
                                    color: token.colorTextQuaternary,
                                    opacity: 0.4,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Overlay */}
                <div className={styles.recentOverlay}>
                    <ClockCircleOutlined
                        style={{
                            fontSize: 18,
                            color: token.colorTextTertiary,
                        }}
                    />
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: token.colorText,
                        }}
                    >
                        Coming soon
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            color: token.colorTextTertiary,
                            textAlign: 'center',
                            lineHeight: '16px',
                        }}
                    >
                        Search history will appear here once connected to the bond search service.
                    </span>
                </div>
            </div>
        </div>
    );
};