import { theme, Progress } from 'antd';
import { FileZipOutlined } from '@ant-design/icons';
import styles from './Uploading.module.scss';

type Props = { progress: number; fileName?: string };

export const Uploading = ({ progress, fileName }: Props) => {
    const { token } = theme.useToken();
    return (
        <div className={styles.container}>
            <div className={styles.head}>
                <FileZipOutlined style={{ color: token.colorPrimary, fontSize: 15 }} />
                {fileName && <span className={styles.fileName}>{fileName}</span>}
            </div>
            <Progress
                percent={progress}
                strokeColor={progress >= 60 ? token.colorSuccess : token.colorPrimary}
                size="small"
                showInfo
            />
            <span className={styles.status}>
                {progress < 60 ? 'Reading file…' : 'Processing via PRISM → INTEX…'}
            </span>
        </div>
    );
};