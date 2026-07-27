import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './StateRow.module.scss';

type Props = {
    kind: 'success' | 'error';
    rich: boolean;             // rich box (button below) vs compact inline row
    title: string;
    detail?: string;
    onAction: () => void;      // reset / try-again
};

export const StateRow = ({ kind, rich, title, detail, onAction }: Props) => {
    const isOk = kind === 'success';
    const Icon = isOk ? CheckCircleFilled : CloseCircleFilled;
    const actionLabel = isOk ? 'Re-upload' : 'Try again';

    if (rich) {
        return (
            <div className={`${styles.box} ${isOk ? styles.okBox : styles.errBox}`}>
                <div className={styles.boxHead}>
                    <Icon className={styles.boxIcon} />
                    <span className={styles.boxTitle}>{title}</span>
                </div>
                {detail && <span className={styles.boxMsg} title={detail}>{detail}</span>}
                <Button size="small" icon={<ReloadOutlined />} onClick={onAction} style={{ alignSelf: 'flex-start' }}>
                    {actionLabel}
                </Button>
            </div>
        );
    }

    // compact single line
    return (
        <div className={`${styles.row} ${isOk ? styles.ok : styles.err}`}>
            <Icon className={styles.rowIcon} />
            <span className={styles.rowText} title={detail || title}>{title}</span>
            <button className={styles.iconBtn} onClick={onAction} title={actionLabel}>
                <ReloadOutlined />
            </button>
        </div>
    );
};