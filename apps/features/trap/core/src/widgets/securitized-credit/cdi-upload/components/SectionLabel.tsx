import type { ReactNode } from 'react';
import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
import styles from './SectionLabel.module.scss';

export function SectionLabel({
    children,
}: {
    children: ReactNode;
}) {
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    return (
        <span
            className={clsx(styles.text, {
                [styles.wealth]: isWealthTheme,
                [styles.wealthLight]: isWealthLight,
                [styles.wealthDark]: isWealthDark,
            })}
        >
            {children}
        </span>
    );
}
