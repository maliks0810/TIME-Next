import { theme, Typography } from 'antd';
const { Text } = Typography;
import styles from './Overlay.module.scss';
export const Overlay = ({ title, description }: { title: string; description: string }) => {
    const { token } = theme.useToken();
    return (
        <div
            className={styles.container}
            style={{
                borderRadius: token.borderRadius,
            }}
        >
            <div
                className={styles.wrapper}
                style={{
                    background: token.colorBgElevated,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,

                    boxShadow: token.boxShadowSecondary,
                }}
            >
                <Text style={{ color: token.colorText }} className={styles.title}>
                    {title}
                </Text>
                <Text
                    style={{
                        color: token.colorTextSecondary,
                    }}
                    className={styles.description}
                >
                    {description}
                </Text>
            </div>
        </div>
    );
};
