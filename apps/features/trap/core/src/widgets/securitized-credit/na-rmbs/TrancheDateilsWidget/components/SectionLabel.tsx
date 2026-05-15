import React from 'react';
import { Typography } from 'antd';
import styles from './TrancheDetailsComponents.module.scss';

const { Text } = Typography;

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return <Text className={styles.sectionLabelContainer}>{children}</Text>;
}
