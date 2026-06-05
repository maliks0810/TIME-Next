import type { ReactNode } from "react";
import styles from "../AssetStagingWidget.module.scss";

export function AssumptionRow({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className={styles.assumptionRow}>
            <div className={styles.assumptionLabelGroup}>
                <span className={styles.assumptionLabel}>
                    {label}
                </span>

                {required && (
                    <span className={styles.assumptionRequired}>
                        required
                    </span>
                )}
            </div>

            {children}
        </div>
    );
}
