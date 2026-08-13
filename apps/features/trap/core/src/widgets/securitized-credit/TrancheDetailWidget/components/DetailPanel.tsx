// EXISTING: apps/features/trap/core/src/widgets/securitized-credit/TrancheDetailsWidget/components/DetailPanel.tsx
//
// `bodyColumns` now supports 1 | 2 | 3 so a full-width panel can lay its rows
// out across up to 3 columns (fills width + stays short).

import React from 'react';
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
    const bodyCls =
        bodyColumns === 3 ? styles.detailBodyThree
        : bodyColumns === 2 ? styles.detailBodyTwo
        : styles.detailBodyOne;
    return (
        <div className={styles.detailPanelContainer}>
            <SectionLabel>{title}</SectionLabel>
            <div className={`${styles.detailBody} ${bodyCls}`}>{children}</div>
        </div>
    );
}
