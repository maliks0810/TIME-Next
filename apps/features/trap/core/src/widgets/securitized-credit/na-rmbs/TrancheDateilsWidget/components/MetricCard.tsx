import clsx from 'clsx';

import { useTheme, getThemeSurfaceMeta } from '../../../../../theme/ThemeContext';
import styles from './TrancheDetailsComponents.module.scss';

export function MetricCard({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: string | null | undefined;
    sub?: string;
    accent?: boolean;
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