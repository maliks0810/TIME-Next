import { Input, Button, theme } from "antd";
import { PaperClipOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useRef } from "react";
import clsx from "clsx";
import type { StagingItem } from "../types";
import type { ValidationErrors } from "../../../../../utils/validation";
import { StatusDot } from "./StatusDot";
import styles from "../AssetStagingWidget.module.scss";

export function StagedItemsPanel({
    items,
    doneMap,
    displayVal,
    extId,
    onExtIdChange,
    validationErrors,
    omFile,
    onOmFileChange,
}: {
    items: StagingItem[];
    doneMap: Record<string, boolean>;
    displayVal: Record<string, string | undefined>;
    extId: string;
    onExtIdChange: (value: string) => void;
    validationErrors: ValidationErrors;
    omFile: File | null;
    onOmFileChange: (file: File | null) => void;
}) {
    const { token } = theme.useToken();
    const omInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={styles.stagedPanel}>
            {items.map((item, idx) => {
                const done = doneMap[item.ctxKey];
                const val = displayVal[item.ctxKey];
                const isLast = idx === items.length - 1;

                if (item.isInput) {
                    return (
                        <div key={item.label}>
                            <div
                                className={clsx(
                                    styles.stagedRow,
                                    idx % 2 === 0 ? styles.stagedRowEven : styles.stagedRowOdd
                                )}
                            >
                                <StatusDot done={!!extId.trim()} />

                                <span className={styles.stagedLabel}>
                                    {item.label}
                                </span>

                                <span className={styles.stagedHintInline}>
                                    optional
                                </span>

                                <div className={styles.stagedInputInline}>
                                    <Input
                                        size="small"
                                        placeholder="CUSIP"
                                        value={extId}
                                        onChange={e => onExtIdChange(e.target.value.toUpperCase())}
                                        status={validationErrors.extId ? "error" : undefined}
                                        style={{ width: 110, fontFamily: "monospace", fontSize: 11 }}
                                    />
                                </div>
                            </div>

                            {validationErrors.extId && (
                                <div className={styles.fieldErrorRow}>
                                    {validationErrors.extId}
                                </div>
                            )}
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

                        <span className={styles.stagedLabel}>
                            {item.label}
                        </span>

                        {done && val ? (
                            <span className={styles.stagedValueInline}>
                                {val}
                            </span>
                        ) : (
                            <span className={styles.stagedAwaiting}>
                                {item.required ? "awaiting…" : "optional"}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* OM Attachment row */}
            <div
                className={clsx(
                    styles.stagedRow,
                    styles.stagedRowOdd
                )}
            >
                <StatusDot done={!!omFile} />

                <span className={styles.stagedLabel}>
                    OM
                </span>

                <span className={styles.stagedHintInline}>
                    optional
                </span>

                <input
                    ref={omInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onOmFileChange(file);
                        e.target.value = '';
                    }}
                />

                <div className={styles.stagedRightAligned}>
                    {omFile ? (
                        <div className={styles.omFileRow}>
                            <PaperClipOutlined
                                style={{
                                    fontSize: 11,
                                    color: token.colorSuccess,
                                    flexShrink: 0,
                                }}
                            />

                            <span
                                className={styles.omFileName}
                                style={{ color: token.colorText }}
                            >
                                {omFile.name}
                            </span>

                            <span
                                className={styles.omFileSize}
                                style={{ color: token.colorTextQuaternary }}
                            >
                                {formatFileSize(omFile.size)}
                            </span>

                            <CloseCircleOutlined
                                onClick={() => onOmFileChange(null)}
                                style={{
                                    fontSize: 11,
                                    color: token.colorTextTertiary,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            />
                        </div>
                    ) : (
                        <Button
                            size="small"
                            icon={<PaperClipOutlined />}
                            onClick={() => omInputRef.current?.click()}
                            style={{ fontSize: 10, height: 22 }}
                        >
                            Attach
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}