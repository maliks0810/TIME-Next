import styles from "../AssetStagingWidget.module.scss";

export function AssumptionSectionHeader({
    title,
    subtitle = "assumptions",
    variant = "default",
}: {
    title: string;
    subtitle?: string;
    variant?: "default" | "required";
}) {
    return (
        <div className={styles.assumptionSectionHeader}>
            <span className={variant === "required" ? styles.assumptionSectionTitleRequired : styles.assumptionSectionTitleOptional}>
                {title}
            </span>

            <span className={styles.assumptionSectionSubTitle}>
                {subtitle}
            </span>
        </div>
    );
}