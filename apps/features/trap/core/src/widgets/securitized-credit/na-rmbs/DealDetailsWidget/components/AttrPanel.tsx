import React from 'react';
import styles from './DealDetailsComponents.module.scss';

export function AttrPanel({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.attrPanelContainer}>
            <span className={styles.sectionLabelContainer}>
                {title}
            </span>

            {children}
        </div>
    );
}