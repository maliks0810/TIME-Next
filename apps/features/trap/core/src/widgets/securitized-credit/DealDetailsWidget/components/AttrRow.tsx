import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import styles from './DealDetailsComponents.module.scss';

export function AttrRow({
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
                styles.attrRowContainer,
                {
                    [styles.wealth]:
                        isWealthTheme,

                    [styles.wealthLight]:
                        isWealthLight,

                    [styles.wealthDark]:
                        isWealthDark,
                },
            )}
        >
            <span className={styles.attrRowLabel}>
                {label}
            </span>

            <span
                className={clsx(
                    styles.attrRowValue,
                    {
                        [styles.fontFamilyMono]:
                            mono,

                        [styles.attrRowValueAccent]:
                            accent,
                    },
                )}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}