import styles from './DealDetailsComponents.module.scss';

export type MetricItem = {
    label: string;
    value: string | null;
    mono?: boolean;
};

export function MetricList({ items, columns }: { items: MetricItem[]; columns: number }) {
    const cls =
        columns === 3 ? styles.metricListThree
        : columns === 2 ? styles.metricListTwo
        : styles.metricListOne;
    return (
        <div className={`${styles.metricList} ${cls}`}>
            {items.map((m) => (
                <div key={m.label} className={styles.metricListRow}>
                    <span className={styles.metricListLabel}>{m.label}</span>
                    <span className={styles.metricListValue}>{m.value ?? '—'}</span>
                </div>
            ))}
        </div>
    );
}