import React from 'react';
import styles from './SectionLabel.module.scss';

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className={styles.text}>
            {children}
        </span>
    );
}