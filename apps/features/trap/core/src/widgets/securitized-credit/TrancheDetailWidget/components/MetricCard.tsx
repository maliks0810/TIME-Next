// EXISTING: apps/features/trap/core/src/widgets/securitized-credit/TrancheDetailsWidget/components/MetricCard.tsx
//
// Restyled to match Deal Details: left accent bar (no full border, no top bar).
// accent/highlight drive a colored LEFT border + colored value.

import clsx from 'clsx';
import styles from './TrancheDetailsComponents.module.scss';

export function MetricCard({
    label,
    value,
    sub,
    accent,
    highlight,
}: {
    label: string;
    value: string | null | undefined;
    sub?: string;
    accent?: boolean;
    highlight?: boolean;
}) {
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
