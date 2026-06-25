import React from 'react';
import styles from './TrancheDetailsComponents.module.scss';

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className={styles.sectionLabelContainer}>
            {children}
        </span>
    );
}