import clsx from 'clsx';
import styles from './MetaRow.module.scss';

export function MetaRow({
    label,
    value,
    mono,
    last,
}: {
    label: string;
    value: string | null | undefined;
    mono?: boolean;
    last?: boolean;
}) {
    return (
        <div
            className={clsx(styles.wrapper, {
                [styles.wrapperBordered]: !last,
            })}
        >
            <span className={styles.label}>
                {label}
            </span>

            <span
                className={clsx(styles.value, {
                    [styles.mono]: mono,
                })}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}