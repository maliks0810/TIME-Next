import clsx from 'clsx';
import styles from './TrancheDetailsComponents.module.scss';

export function DetailRow({
    label,
    value,
    mono,
    accent,
}: {
    label: string;
    value: string | null | undefined;
    mono?: boolean;
    accent?: boolean;
}) {
    return (
        <div className={styles.detailRowContainer}>
            <span className={styles.detailRowLabel}>
                {label}
            </span>

            <span
                className={clsx(styles.detailRowValue, {
                    [styles.fontFamilyMono]: mono,
                    [styles.detailRowValueAccent]: accent,
                })}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}