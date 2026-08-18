import React from 'react';
import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import styles from './DealDetailsComponents.module.scss';

export function AttrPanel({
    title,
    bodyColumns = 1,
    children,
}: {
    title: string;
    bodyColumns?: 1 | 2 | 3;
    children: React.ReactNode;
}) {
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight =
        themeName === 'wealthLight';

    const isWealthDark =
        themeName === 'wealthDark';

    const bodyClass =
        bodyColumns === 3
            ? styles.attrBodyThree
            : bodyColumns === 2
              ? styles.attrBodyTwo
              : styles.attrBodyOne;

    return (
        <div
            className={clsx(
                styles.attrPanelContainer,
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
            <span className={styles.sectionLabelContainer}>
                {title}
            </span>

            <div
                className={clsx(
                    styles.attrBody,
                    bodyClass,
                )}
            >
                {children}
            </div>
        </div>
    );
}