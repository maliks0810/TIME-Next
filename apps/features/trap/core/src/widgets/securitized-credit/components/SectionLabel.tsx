import { theme, Typography } from 'antd';
import styles from './SectionLabel.module.scss';
export function SectionLabel({ children }: { children: React.ReactNode }) {
    const { token } = theme.useToken();
    return (
        <Typography.Text
            className={styles.text}
            style={{
                color: token.colorTextTertiary,
            }}
        >
            {children}
        </Typography.Text>
    );
}
