import React from 'react';
import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import { SectionLabel } from './SectionLabel';
import styles from './TrancheDetailsComponents.module.scss';

export function DetailPanel({
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
            ? styles.detailBodyThree
            : bodyColumns === 2
              ? styles.detailBodyTwo
              : styles.detailBodyOne;

    return (
        <div
            className={clsx(
                styles.detailPanelContainer,
                {
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                },
            )}
        >
            <SectionLabel>
                {title}
            </SectionLabel>

            <div
                className={clsx(
                    styles.detailBody,
                    bodyClass,
                )}
            >
                {children}
            </div>
        </div>
    );
}