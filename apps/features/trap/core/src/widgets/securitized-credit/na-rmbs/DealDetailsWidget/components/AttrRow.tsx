import clsx from 'clsx';
import styles from './DealDetailsComponents.module.scss';

export function AttrRow({
    label,
    value,
    mono,
    accent,
}: {
    label: string;
    value: string | null;
    mono?: boolean;
    accent?: boolean;
}) {
    return (
        <div className={styles.attrRowContainer}>
            <span className={styles.attrRowLabel}>
                {label}
            </span>

            <span
                className={clsx(styles.attrRowValue, {
                    [styles.fontFamilyMono]: mono,
                    [styles.attrRowValueAccent]: accent,
                })}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}