import { Button, Card, Divider } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Deal } from '../../../lib/types';
import styles from '../lib/styles.module.scss';

type ARCStatusItemType = Deal & {
    isReviewOnly?: boolean;
    openTimeline: (id: Deal['trackingId'], details: Deal['details']) => void;
};

export function StatusItem({
    fileName,
    uploadedAt,
    tranche,
    r2Identifier,
    openTimeline,
    details,
    trackingId,
    ...props
}: ARCStatusItemType) {
    const isCompleted = 'completedAt' in props;

    return (
        <Card size="small">
            <div className={styles['arc-status-item']}>
                <div className={styles['info-row']}>
                    <span className={styles['info-row']}>Deal name:</span>
                    <h4>{fileName}</h4>
                </div>
                <div className={styles['info-row']}>
                    <span className={styles['info-row']}>Date:</span>
                    <h4>{uploadedAt}</h4>
                </div>
                {isCompleted && (
                    <div className={styles['info-row']}>
                        <span className={styles['info-row']}>Completed At:</span>
                        <h4>{new Date(props.completedAt).toDateString()}</h4>
                    </div>
                )}
                <div className={styles['info-row']}>
                    <span className={styles['info-row']}>Tranche:</span>
                    <h4>{tranche}</h4>
                </div>
                <div className={styles['info-row']}>
                    <span className={styles['info-row']}>R2 ID:</span>
                    <div className={styles.copy}>
                        <h4 style={{ color: 'rgba(0, 0, 0, 0.30)' }}>{r2Identifier}</h4>
                        <CopyOutlined onClick={() => navigator.clipboard.writeText(r2Identifier)} />
                    </div>
                </div>
            </div>
            <Divider style={{ margin: 8 }} />
            <div className={styles['info-footer']}>
                <Button
                    size="small"
                    color="primary"
                    variant="filled"
                    onClick={() => openTimeline(trackingId, details)}
                >
                    Review
                </Button>
            </div>
        </Card>
    );
}
