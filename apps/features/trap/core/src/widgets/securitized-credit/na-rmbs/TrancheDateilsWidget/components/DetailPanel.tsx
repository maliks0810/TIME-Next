import React from 'react';
import { SectionLabel } from './SectionLabel';
import styles from './TrancheDetailsComponents.module.scss';

export function DetailPanel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.detailPanelContainer}>
            <SectionLabel>{title}</SectionLabel>
            {children}
        </div>
    );
}
