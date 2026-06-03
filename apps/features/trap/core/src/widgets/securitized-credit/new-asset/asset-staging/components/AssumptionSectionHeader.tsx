import styles from "../AssetStagingWidget.module.scss";

export function AssumptionSectionHeader({
    title,
    subtitle = "assumptions",
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className={styles.assumptionSectionHeader}>
            <span className={styles.assumptionSectionTitle}>
                {title}
            </span>

            <span className={styles.assumptionSectionSubTitle}>
                {subtitle}
            </span>
        </div>
    );
}