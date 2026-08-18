import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import styles from './DealDetailsComponents.module.scss';

export function MetricCard({
    label,
    value,
    sub,
    accent,
    highlight,
}: {
    label: string;
    value: string | null;
    sub?: string;
    accent?: boolean;
    highlight?: boolean;
}) {
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight =
        themeName === 'wealthLight';

    const isWealthDark =
        themeName === 'wealthDark';

    return (
        <div
            className={clsx(
                styles.metricCardContainer,
                {
                    [styles.metricCardAccent]:
                        accent,

                    [styles.metricCardHighlight]:
                        highlight,

                    [styles.wealth]:
                        isWealthTheme,

                    [styles.wealthLight]:
                        isWealthLight,

                    [styles.wealthDark]:
                        isWealthDark,
                },
            )}
        >
            <span className={styles.metricCardLabel}>
                {label}
            </span>

            <span
                className={clsx(
                    styles.metricCardValue,
                    {
                        [styles.metricCardValueAccent]:
                            accent,

                        [styles.metricCardValueHighlight]:
                            highlight,
                    },
                )}
            >
                {value ?? '—'}
            </span>

            {sub && (
                <span
                    className={
                        styles.metricCardSubText
                    }
                >
                    {sub}
                </span>
            )}
        </div>
    );
}