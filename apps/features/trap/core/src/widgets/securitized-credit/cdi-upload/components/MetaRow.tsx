import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
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
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    return (
        <div
            className={clsx(styles.wrapper, {
                [styles.wrapperBordered]: !last,
                [styles.wealth]: isWealthTheme,
                [styles.wealthLight]: isWealthLight,
                [styles.wealthDark]: isWealthDark,
            })}
        >
            <span className={styles.label}>
                {label}
            </span>

            <span
                className={clsx(styles.value, {
                    [styles.mono]: mono,
                })}
                title={value ?? undefined}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}
