import { theme } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import styles from './Uploading.module.scss';

export const Uploading = ({ progress }: { progress: number }) => {
    const { token } = theme.useToken();

    return (
        <div className={styles.container}>
            <CloudUploadOutlined style={{ fontSize: 32, color: token.colorPrimary }} />

            <span
                className={styles.text}
                style={{ color: token.colorTextSecondary }}
            >
                {progress < 60 ? 'Reading file…' : 'Processing…'}
            </span>
        </div>
    );
};