import React from 'react';
import { Typography } from 'antd';
import styles from './DealDetailsComponents.module.scss';

const { Text } = Typography;

export function AttrPanel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.attrPanelContainer}>
            <Text className={styles.sectionLabelContainer}>{title}</Text>
            {children}
        </div>
    );
}
