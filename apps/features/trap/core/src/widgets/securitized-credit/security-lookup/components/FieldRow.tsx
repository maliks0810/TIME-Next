import { Typography, theme } from 'antd';
const { Text } = Typography;
import styles from './FieldRow.module.scss';

export function FieldRow({
    label,
    value,
    mono,
    last,
}: {
    label: string;
    value: string;
    mono?: boolean;
    last?: boolean;
}) {
    const { token } = theme.useToken();
    return (
        <div
            className={styles.wrapper}
            style={{
                borderBottom: last ? 'none' : `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <Text
                style={{
                    color: token.colorTextSecondary,
                }}
                className={styles.label}
            >
                {label}
            </Text>
            <Text
                style={{
                    color: token.colorText,
                    fontFamily: mono ? 'monospace' : undefined,
                }}
                className={styles.value}
            >
                {value}
            </Text>
        </div>
    );
}
