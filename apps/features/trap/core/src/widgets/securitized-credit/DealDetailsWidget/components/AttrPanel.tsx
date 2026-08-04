import React from 'react';
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
    const bodyCls =
        bodyColumns === 3 ? styles.attrBodyThree
        : bodyColumns === 2 ? styles.attrBodyTwo
        : styles.attrBodyOne;
    return (
        <div className={styles.attrPanelContainer}>
            <span className={styles.sectionLabelContainer}>{title}</span>
            <div className={`${styles.attrBody} ${bodyCls}`}>{children}</div>
        </div>
    );
}