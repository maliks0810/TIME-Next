import { HistoryOutlined, CloseOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type { RecentSearch } from '../types';
import { assetTypeColor } from '../utils';
import styles from './RecentSearches.module.scss';

const MIN = 60000, HR = 3600000, DAY = 86400000;
function timeAgo(ts?: number): string {
    if (!ts) return '';
    const s = Math.max(0, Date.now() - ts);
    if (s < MIN) return 'just now';
    if (s < HR) return `${Math.floor(s / MIN)}m ago`;
    if (s < DAY) return `${Math.floor(s / HR)}h ago`;
    return `${Math.floor(s / DAY)}d ago`;
}

type Lanes = 'two' | 'one' | 'multi';

type Props = {
    recents: RecentSearch[];
    onPick: (r: RecentSearch) => void;
    onClear: () => void;
    lanes: Lanes;
};

export const RecentSearches = ({ recents, onPick, onClear, lanes }: Props) => {
    // 'two' (narrow stacked) shows exactly the 2 most recent; others show all.
    const items = lanes === 'two' ? recents.slice(0, 2) : recents;
    const gridCls =
        lanes === 'two' ? styles.gridTwo : lanes === 'multi' ? styles.gridMulti : styles.gridOne;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <HistoryOutlined className={styles.headerIcon} />
                    <span className={styles.headerText}>Recent Searches</span>
                </div>
                {recents.length > 0 && (
                    <CloseOutlined className={styles.clear} onClick={onClear} aria-label="Clear recent" />
                )}
            </div>

            {recents.length === 0 ? (
                <div className={styles.empty}>Your recent lookups will appear here.</div>
            ) : (
                <div className={`${styles.grid} ${gridCls}`}>
                    {items.map((r, i) => {
                        const badge = r.assetType || r.collateralType || '';
                        return (
                            <button
                                key={`${r.name}-${i}`}
                                type="button"
                                className={styles.card}
                                onClick={() => onPick(r)}
                            >
                                <div className={styles.cardMain}>
                                    <span className={styles.cardName} title={r.name}>{r.name}</span>
                                    <span className={styles.cardMeta}>
                                        {r.cusip}
                                        {r.usedAt ? <span className={styles.cardTime}>· {timeAgo(r.usedAt)}</span> : null}
                                    </span>
                                </div>
                                <div className={styles.cardRight}>
                                    {badge && (
                                        <Tag color={assetTypeColor(badge)} className={styles.cardTag}>
                                            {badge}
                                        </Tag>
                                    )}
                                    <ArrowRightOutlined className={styles.cardArrow} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};