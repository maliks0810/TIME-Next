import { Input, Button, theme } from "antd";
import { PaperClipOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useRef } from "react";
import clsx from "clsx";
import type { StagingItem } from "../types";
import type { ValidationErrors } from "../../../../../utils/validation";
import { isValidCusip } from "../../../../../utils/validation";
import { StatusDot } from "./StatusDot";
import styles from "../AssetStagingWidget.module.scss";

export function StagedItemsPanel({
    items,
    doneMap,
    displayVal,
    extId,
    onExtIdChange,
    cusipOverride,
    onCusipOverrideChange,
    trancheCusip,
    validationErrors,
    onValidationErrorChange,
    omFile,
    onOmFileChange,
}: {
    items: StagingItem[];
    doneMap: Record<string, boolean>;
    displayVal: Record<string, string | undefined>;
    extId: string;
    onExtIdChange: (value: string) => void;
    cusipOverride: string;
    onCusipOverrideChange: (value: string) => void;
    trancheCusip: string | undefined;
    validationErrors: ValidationErrors;
    onValidationErrorChange: (errors: Partial<ValidationErrors>) => void;
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

    const validateCusipOnBlur = () => {
        const trimmed = cusipOverride.trim().toUpperCase();
        if (!trimmed) {
            onValidationErrorChange({ cusip: undefined });
            return;
        }
        if (trimmed.length !== 9) {
            onValidationErrorChange({ cusip: "CUSIP must be exactly 9 characters" });
        } else if (!isValidCusip(trimmed)) {
            onValidationErrorChange({ cusip: "Invalid CUSIP" });
        } else {
            onValidationErrorChange({ cusip: undefined });
        }
    };

    const validateExtIdOnBlur = () => {
        const trimmed = extId.trim().toUpperCase();
        if (!trimmed) {
            onValidationErrorChange({ extId: undefined });
            return;
        }
        if (trimmed.length !== 9) {
            onValidationErrorChange({ extId: "CUSIP must be exactly 9 characters" });
        } else if (!isValidCusip(trimmed)) {
            onValidationErrorChange({ extId: "Invalid CUSIP" });
        } else {
            onValidationErrorChange({ extId: undefined });
        }
    };

    return (
        <div className={styles.stagedPanel}>
            {items.map((item, idx) => {
                const done = doneMap[item.ctxKey];
                const val = displayVal[item.ctxKey];
                const isLast = idx === items.length - 1;

                // CUSIP override row
                if (item.inputType === "cusip") {
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

                            <span className={item.required ? styles.stagedHintRequired : styles.stagedHintInline}>
                                {item.required ? "required" : "optional"}
                            </span>

                            {validationErrors.cusip && (
                                <span className={styles.fieldErrorInline}>
                                    {validationErrors.cusip}
                                </span>
                            )}

                            <div className={clsx(
                                styles.stagedInputInline,
                                item.required && !validationErrors.cusip && !cusipOverride.trim() && styles.requiredBorder
                            )}>
                                <Input
                                    size="small"
                                    placeholder={trancheCusip && !item.required ? trancheCusip : "Enter CUSIP"}
                                    value={cusipOverride}
                                    onChange={e => onCusipOverrideChange(e.target.value.toUpperCase())}
                                    onBlur={validateCusipOnBlur}
                                    status={validationErrors.cusip ? "error" : undefined}
                                    style={{ width: 110, fontFamily: "monospace", fontSize: 11 }}
                                />
                            </div>
                        </div>
                    );
                }

                // External ID row
                if (item.inputType === "extId") {
                    return (
                        <div
                            key={item.label}
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

                            {validationErrors.extId && (
                                <span className={styles.fieldErrorInline}>
                                    {validationErrors.extId}
                                </span>
                            )}

                            <div className={styles.stagedInputInline}>
                                <Input
                                    size="small"
                                    placeholder="Enter CUSIP"
                                    value={extId}
                                    onChange={e => onExtIdChange(e.target.value.toUpperCase())}
                                    onBlur={validateExtIdOnBlur}
                                    status={validationErrors.extId ? "error" : undefined}
                                    style={{ width: 110, fontFamily: "monospace", fontSize: 11 }}
                                />
                            </div>
                        </div>
                    );
                }

                // Standard row (Deal, Tranche)
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

                        <span className={item.required ? styles.stagedHintRequired : styles.stagedHintInline}>
                            {item.required ? "required" : "optional"}
                        </span>

                        {done && val ? (
                            <span className={styles.stagedValueInline}>
                                {val}
                            </span>
                        ) : (
                            <span className={styles.stagedAwaiting}>
                                awaiting…
                            </span>
                        )}
                    </div>
                );
            })}

            {/* OM Attachment row */}
            <div
                className={clsx(
                    styles.stagedRow,
                    styles.stagedRowEven
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