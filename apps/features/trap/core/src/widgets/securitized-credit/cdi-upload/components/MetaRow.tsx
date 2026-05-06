import { theme, Typography } from 'antd';
import styles from './MetaRow.module.scss';
export function MetaRow({
    label,
    value,
    mono,
    token,
    last,
}: {
    label: string;
    value: string;
    mono?: boolean;
    token: any;
    last?: boolean;
}) {
    return (
        <div
            className={styles.wrapper}
            style={{
                borderBottom: last ? 'none' : `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <Typography.Text
                className={styles.label}
                style={{
                    color: token.colorTextSecondary,
                }}
            >
                {label}
            </Typography.Text>
            <Typography.Text
                className={styles.value}
                style={{
                    fontFamily: mono ? 'monospace' : undefined,
                    color: token.colorText,
                }}
            >
                {value}
            </Typography.Text>
        </div>
    );
}
