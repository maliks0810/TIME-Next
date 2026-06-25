import type { ReactNode } from "react";
import { Typography } from "antd";
import styles from "../AssetStagingWidget.module.scss";

const { Text } = Typography;

export function SectionHeader({
    icon,
    title,
}: {
    icon: ReactNode;
    title: string;
}) {
    return (
        <div className={styles.headerTitleGroup}>
            {icon}
            <Text className={styles.sectionTitle}>
                {title}
            </Text>
        </div>
    );
}