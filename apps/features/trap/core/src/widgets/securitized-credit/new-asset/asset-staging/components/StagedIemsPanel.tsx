import { Input } from "antd";
import clsx from "clsx";
import type { StagingItem } from "../types";
import { StatusDot } from "./StatusDot";
import styles from "../AssetStagingWidget.module.scss";

export function StagedItemsPanel({
    items,
    doneMap,
    displayVal,
    extId,
    onExtIdChange,
}: {
    items: StagingItem[];
    doneMap: Record<string, boolean>;
    displayVal: Record<string, string | undefined>;
    extId: string;
    onExtIdChange: (value: string) => void;
}) {
    return (
        <div className={styles.stagedPanel}>
            {items.map((item, idx) => {
                const done = doneMap[item.ctxKey];
                const val = displayVal[item.ctxKey];
                const isLast = idx === items.length - 1;

                if (item.isInput) {
                    return (
                        <div
                            key={item.label}
                            className={clsx(
                                styles.stagedRowInput,
                                idx % 2 === 0 ? styles.stagedRowEven : styles.stagedRowOdd
                            )}
                        >
                            <div className={styles.stagedInputHeader}>
                                <StatusDot done={!!extId.trim()} />

                                <span className={styles.stagedLabelFlexible}>
                                    {item.label}
                                </span>

                                <span className={styles.stagedHint}>
                                    optional
                                </span>
                            </div>

                            <Input
                                size="small"
                                placeholder="Enter CUSIP / ISIN…"
                                value={extId}
                                onChange={e => onExtIdChange(e.target.value)}
                                className={styles.stagedInput}
                            />
                        </div>
                    );
                }

                return (
                    <div
                        key={item.label}
                        className={clsx(
                            styles.stagedRow,
                            !isLast && styles.stagedRowBordered,
                            idx % 2 === 0 ? styles.stagedRowEven : styles.stagedRowOdd
                        )}
                    >
                        <StatusDot done={done} />

                        <div className={styles.stagedContent}>
                            <div className={styles.stagedLabelRow}>
                                <span className={styles.stagedLabel}>
                                    {item.label}
                                </span>

                                {!item.required && (
                                    <span className={styles.stagedHint}>
                                        recommended
                                    </span>
                                )}
                            </div>

                            {done && val ? (
                                <span className={styles.stagedValue}>
                                    {val}
                                </span>
                            ) : (
                                <span className={styles.stagedAwaiting}>
                                    {item.required ? "required — awaiting…" : "awaiting…"}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}