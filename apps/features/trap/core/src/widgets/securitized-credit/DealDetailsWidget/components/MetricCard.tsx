import clsx from 'clsx';
import { useTheme, getThemeSurfaceMeta } from '../../../../theme/ThemeContext';
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
    getThemeSurfaceMeta(themeName); // keep hook parity if used elsewhere

    return (
        <div
            className={clsx(styles.metricCardContainer, {
                [styles.metricCardAccent]: accent,
                [styles.metricCardHighlight]: highlight,
            })}
        >
            <span className={styles.metricCardLabel}>{label}</span>
            <span
                className={clsx(styles.metricCardValue, {
                    [styles.metricCardValueAccent]: accent,
                    [styles.metricCardValueHighlight]: highlight,
                })}
            >
                {value ?? '—'}
            </span>
            {sub && <span className={styles.metricCardSubText}>{sub}</span>}
        </div>
    );
}