import {
    HistoryOutlined,
    CloseOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import type { RecentSearch } from '../types';
import { assetTypeColor } from '../utils';
import styles from './RecentSearches.module.scss';

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

function timeAgo(timestamp?: number): string {
    if (!timestamp) return '';

    const elapsed = Math.max(0, Date.now() - timestamp);

    if (elapsed < MINUTE_MS) {
        return 'just now';
    }

    if (elapsed < HOUR_MS) {
        return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
    }

    if (elapsed < DAY_MS) {
        return `${Math.floor(elapsed / HOUR_MS)}h ago`;
    }

    return `${Math.floor(elapsed / DAY_MS)}d ago`;
}

type Lanes = 'two' | 'one' | 'multi';

type Props = {
    recents: RecentSearch[];
    onPick: (recent: RecentSearch) => void;
    onClear: () => void;
    lanes: Lanes;
};

export const RecentSearches = ({
    recents,
    onPick,
    onClear,
    lanes,
}: Props) => {
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    // Narrow stacked mode displays only the two most recent entries. Other
    // layouts retain the existing behavior and show the full stored list.
    const items = lanes === 'two'
        ? recents.slice(0, 2)
        : recents;

    const gridClass =
        lanes === 'two'
            ? styles.gridTwo
            : lanes === 'multi'
              ? styles.gridMulti
              : styles.gridOne;

    return (
        <div
            className={clsx(styles.container, {
                [styles.wealth]: isWealthTheme,
                [styles.wealthLight]: isWealthLight,
                [styles.wealthDark]: isWealthDark,
            })}
        >
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <HistoryOutlined
                        className={styles.headerIcon}
                    />

                    <span className={styles.headerText}>
                        Recent Searches
                    </span>
                </div>

                {recents.length > 0 && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        onClick={onClear}
                        aria-label="Clear recent searches"
                    >
                        <CloseOutlined
                            className={styles.clear}
                        />
                    </button>
                )}
            </div>

            {recents.length === 0 ? (
                <div className={styles.empty}>
                    Your recent lookups will appear here.
                </div>
            ) : (
                <div
                    className={clsx(
                        styles.grid,
                        gridClass,
                    )}
                >
                    {items.map((recent, index) => {
                        const badge =
                            recent.assetType ||
                            recent.collateralType ||
                            '';

                        return (
                            <button
                                key={`${recent.name}-${index}`}
                                type="button"
                                className={styles.card}
                                onClick={() => onPick(recent)}
                            >
                                <div className={styles.cardMain}>
                                    <span
                                        className={styles.cardName}
                                        title={recent.name}
                                    >
                                        {recent.name}
                                    </span>

                                    <span className={styles.cardMeta}>
                                        {recent.cusip}

                                        {recent.usedAt ? (
                                            <span
                                                className={
                                                    styles.cardTime
                                                }
                                            >
                                                {' '}
                                                · {timeAgo(recent.usedAt)}
                                            </span>
                                        ) : null}
                                    </span>
                                </div>

                                <div className={styles.cardRight}>
                                    {badge && (
                                        <Tag
                                            color={
                                                isWealthTheme
                                                    ? undefined
                                                    : assetTypeColor(badge)
                                            }
                                            className={styles.cardTag}
                                        >
                                            {badge}
                                        </Tag>
                                    )}

                                    <ArrowRightOutlined
                                        className={styles.cardArrow}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
