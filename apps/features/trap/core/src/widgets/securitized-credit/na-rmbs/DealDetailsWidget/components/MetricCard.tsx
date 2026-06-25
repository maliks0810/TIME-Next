import clsx from 'clsx';

import { useTheme, getThemeSurfaceMeta } from '../../../../../theme/ThemeContext';
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
    const surfaceMeta = getThemeSurfaceMeta(themeName);

    return (
        <div className={styles.metricCardContainer}>
            {accent && (
                <div
                    className={styles.metricCardAccentHighlight}
                    style={{
                        background: surfaceMeta.isGradientTheme
                            ? surfaceMeta.accentGradient
                            : undefined,
                    }}
                />
            )}

            <span className={styles.metricCardLabel}>
                {label}
            </span>

            <span
                className={clsx(styles.metricCardValue, {
                    [styles.metricCardValueAccent]: accent,
                    [styles.metricCardValueHighlight]: highlight,
                })}
            >
                {value ?? '—'}
            </span>

            {sub && (
                <span className={styles.metricCardSubText}>
                    {sub}
                </span>
            )}
        </div>
    );
}