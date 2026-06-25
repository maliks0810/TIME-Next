import { Popover, theme } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import styles from "../AssetStagingWidget.module.scss";

type PayloadField = {
    key: string;
    value: string | number | boolean | null | undefined;
};

export function PayloadPreview({
    fields,
    title = "Payload Preview",
}: {
    fields: PayloadField[];
    title?: string;
}) {
    const { token } = theme.useToken();

    const content = (
        <div className={styles.payloadPreviewContainer}>
            <span className={styles.payloadPreviewTitle}>
                {title}
            </span>

            <div className={styles.payloadPreviewList}>
                {fields.map((field) => (
                    <div key={field.key} className={styles.payloadPreviewRow}>
                        <span
                            className={styles.payloadPreviewKey}
                            style={{ color: token.colorTextSecondary }}
                        >
                            {field.key}
                        </span>

                        <span
                            className={styles.payloadPreviewValue}
                            style={{
                                color: field.value != null && field.value !== ""
                                    ? token.colorText
                                    : token.colorTextQuaternary,
                            }}
                        >
                            {field.value != null && field.value !== ""
                                ? String(field.value)
                                : "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="hover"
            placement="bottomRight"
            overlayStyle={{ maxWidth: 420 }}
        >
            <InfoCircleOutlined
                style={{
                    fontSize: 12,
                    color: token.colorTextTertiary,
                    cursor: 'pointer',
                }}
            />
        </Popover>
    );
}