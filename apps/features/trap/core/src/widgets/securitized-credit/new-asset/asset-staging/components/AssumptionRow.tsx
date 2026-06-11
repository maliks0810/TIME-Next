import type { ReactNode } from "react";
import styles from "../AssetStagingWidget.module.scss";

export function AssumptionRow({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className={styles.assumptionRow}>
            <div className={styles.assumptionLabelGroup}>
                <span className={styles.assumptionLabel}>
                    {label}
                </span>

                {required && (
                    <span className={styles.stagedHintRequired}>
                        required
                    </span>
                )}
            </div>

            {children}

            {error && (
                <span className={styles.fieldError}>
                    {error}
                </span>
            )}
        </div>
    );
}