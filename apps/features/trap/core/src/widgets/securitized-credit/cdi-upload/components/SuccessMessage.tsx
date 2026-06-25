import { theme, Button } from 'antd';
import { CheckCircleFilled, ReloadOutlined } from '@ant-design/icons';
import styles from './SuccessMessage.module.scss';

export const SuccessMessage = ({ reset, text }: { text: string; reset: () => void }) => {
    const { token } = theme.useToken();

    return (
        <div className={styles.container}>
            <div
                style={{
                    background: token.colorSuccessBg,
                    border: `2px solid ${token.colorSuccessBorder}`,
                }}
                className={styles.wrapper}
            >
                <CheckCircleFilled style={{ fontSize: 20, color: token.colorSuccess }} />
            </div>

            <span
                style={{ color: token.colorSuccess }}
                className={styles.text}
            >
                {text}
            </span>

            <Button size="small" icon={<ReloadOutlined />} onClick={reset}>
                Re-upload
            </Button>
        </div>
    );
};