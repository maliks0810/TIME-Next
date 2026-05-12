import { theme, Typography } from 'antd';
const { Text } = Typography;
import styles from './SectionLabel.module.scss';
export function SectionLabel({ label }: { label: string }) {
    const { token } = theme.useToken();
    return (
        <Text
            style={{
                color: token.colorTextTertiary,
            }}
            className={styles.label}
        >
            {label}
        </Text>
    );
}
