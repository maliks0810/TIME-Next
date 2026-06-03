import { DatePicker, InputNumber, Select, Segmented } from "antd";
import type { CallableType } from "../types";
import type { Dayjs } from 'dayjs';
import {
    ASSUMPTION_CONTROL_WIDTH,
    cleanupOptions,
    defaultOptions,
    prepaymentOptions,
} from "../utils/options";
import { AssumptionRow } from "./AssumptionRow";
import { AssumptionSectionHeader } from "./AssumptionSectionHeader";
import styles from "../AssetStagingWidget.module.scss";

export function InputAssumptionsPanel({
    price,
    onPriceChange,

    callable,
    onCallableChange,

    callDate,
    onCallDateChange,

    cleanupValue,
    onCleanupValueChange,

    prepaymentType,
    onPrepaymentTypeChange,
    prepaymentValue,
    onPrepaymentValueChange,

    defaultType,
    onDefaultTypeChange,
    defaultValue,
    onDefaultValueChange,

    severity,
    onSeverityChange,

    delinquency,
    onDelinquencyChange,
}: {
    price: number | null;
    onPriceChange: (value: number | null) => void;

    callable: CallableType | null;
    onCallableChange: (value: CallableType) => void;

    callDate: Dayjs | null;
    onCallDateChange: (value: Dayjs | null) => void;

    cleanupValue: string | undefined;
    onCleanupValueChange: (value: string | undefined) => void;

    prepaymentType: string | undefined;
    onPrepaymentTypeChange: (value: string | undefined) => void;
    prepaymentValue: number | null;
    onPrepaymentValueChange: (value: number | null) => void;

    defaultType: string | undefined;
    onDefaultTypeChange: (value: string | undefined) => void;
    defaultValue: number | null;
    onDefaultValueChange: (value: number | null) => void;

    severity: number | null;
    onSeverityChange: (value: number | null) => void;

    delinquency: number | null;
    onDelinquencyChange: (value: number | null) => void;
}) {
    return (
        <div className={styles.assumptionPanel}>
            <div className={styles.assumptionPanelBody}>
                <AssumptionSectionHeader title="Required" />

                <AssumptionRow label="Price">
                    <InputNumber
                        className={styles.priceInput}
                        size="small"
                        value={price}
                        onChange={(value) => onPriceChange(typeof value === "number" ? value : null)}
                        placeholder="100.000"
                        controls={false}
                        precision={3}
                        min={0}
                        max={200.0}
                        style={{
                            width: ASSUMPTION_CONTROL_WIDTH,
                        }}
                    />
                </AssumptionRow>

                <AssumptionRow label="Callable">
                    <div
                        className={styles.callableSegmentedWrapper}
                        style={{
                            width: ASSUMPTION_CONTROL_WIDTH,
                        }}
                    >
                        <Segmented
                            size="small"
                            block
                            value={callable ?? undefined}
                            onChange={(value) => onCallableChange(value as CallableType)}
                            options={[
                                { label: "Y", value: "Y" },
                                { label: "N", value: "N" },
                                { label: "C", value: "C" },
                            ]}
                            style={{
                                width: "100%",
                                background: "transparent",
                                fontSize: 10,
                            }}
                        />
                    </div>
                </AssumptionRow>

                <div className={styles.callableDetailRow}>
                    {callable === "Y" && (
                        <AssumptionRow label="Call Date" required>
                            <DatePicker
                                size="small"
                                value={callDate}
                                onChange={onCallDateChange}
                                placeholder="Date"
                                style={{
                                    width: 120,
                                    fontSize: 11,
                                }}
                            />
                        </AssumptionRow>
                    )}

                    {callable === "C" && (
                        <AssumptionRow label="Cleanup" required>
                            <Select
                                size="small"
                                value={cleanupValue}
                                onChange={onCleanupValueChange}
                                placeholder="Select"
                                options={cleanupOptions}
                                style={{
                                    width: 300,
                                    fontSize: 11,
                                }}
                            />
                        </AssumptionRow>
                    )}
                </div>

                <div className={styles.assumptionSectionDivider} />

                <AssumptionSectionHeader title="Optional" />

                <AssumptionRow label="Prepayment">
                    <div className={styles.assumptionControlGroup}>
                        <Select
                            size="small"
                            allowClear
                            value={prepaymentType}
                            onChange={onPrepaymentTypeChange}
                            placeholder="Type"
                            options={prepaymentOptions}
                            style={{
                                width: 72,
                                fontSize: 11,
                            }}
                        />

                        <InputNumber
                            className={styles.assumptionNumberInput}
                            size="small"
                            value={prepaymentValue}
                            onChange={(value) => onPrepaymentValueChange(typeof value === "number" ? value : null)}
                            placeholder="Value"
                            controls={false}
                            precision={3}
                            style={{
                                width: ASSUMPTION_CONTROL_WIDTH,
                            }}
                        />
                    </div>
                </AssumptionRow>

                <AssumptionRow label="Default">
                    <div className={styles.assumptionControlGroup}>
                        <Select
                            size="small"
                            allowClear
                            value={defaultType}
                            onChange={onDefaultTypeChange}
                            placeholder="Type"
                            options={defaultOptions}
                            style={{
                                width: 72,
                                fontSize: 11,
                            }}
                        />

                        <InputNumber
                            className={styles.assumptionNumberInput}
                            size="small"
                            value={defaultValue}
                            onChange={(value) => onDefaultValueChange(typeof value === "number" ? value : null)}
                            placeholder="Value"
                            controls={false}
                            precision={3}
                            style={{
                                width: ASSUMPTION_CONTROL_WIDTH,
                            }}
                        />
                    </div>
                </AssumptionRow>

                <AssumptionRow label="Severity">
                    <InputNumber
                        className={styles.assumptionNumberInput}
                        size="small"
                        value={severity}
                        onChange={(value) => onSeverityChange(typeof value === "number" ? value : null)}
                        placeholder="Value"
                        controls={false}
                        precision={3}
                        style={{
                            width: ASSUMPTION_CONTROL_WIDTH,
                        }}
                    />
                </AssumptionRow>

                <AssumptionRow label="Delinquency">
                    <InputNumber
                        className={styles.assumptionNumberInput}
                        size="small"
                        value={delinquency}
                        onChange={(value) => onDelinquencyChange(typeof value === "number" ? value : null)}
                        placeholder="Value"
                        controls={false}
                        precision={3}
                        style={{
                            width: ASSUMPTION_CONTROL_WIDTH,
                        }}
                    />
                </AssumptionRow>
            </div>
        </div>
    );
}
