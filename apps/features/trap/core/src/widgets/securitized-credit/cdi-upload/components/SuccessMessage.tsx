import { Typography, theme, Button } from 'antd';
import styles from './SuccessMessage.module.scss';
import { CheckCircleFilled, ReloadOutlined } from '@ant-design/icons';
const { Text } = Typography;
export const SuccessMessage = ({ reset }: { reset: () => void }) => {
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
            <Text style={{ color: token.colorSuccess }} className={styles.text}>
                Package ingested
            </Text>
            <Button size="small" icon={<ReloadOutlined />} onClick={reset}>
                Re-upload
            </Button>
        </div>
    );
};
