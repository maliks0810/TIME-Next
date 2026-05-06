import { Typography, theme } from 'antd';
import styles from './Uploading.module.scss';
import { CloudUploadOutlined } from '@ant-design/icons';
const { Text } = Typography;
export const Uploading = ({ progress }: { progress: number }) => {
    const { token } = theme.useToken();
    return (
        <div className={styles.container}>
            <CloudUploadOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                {progress < 60 ? 'Reading file…' : 'Processing…'}
            </Text>
        </div>
    );
};
