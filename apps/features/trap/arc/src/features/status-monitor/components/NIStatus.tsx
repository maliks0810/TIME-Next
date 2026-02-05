import { Badge, Button, Collapse, Modal } from 'antd';
import { useMemo } from 'react';
import { CompletedDeal, FailedDeal, ProcessingDeal } from '../../../lib/types';
import { useCheckStatus } from './useCheckStatus';
import { TimelineMonitor } from '../../timeline-monitor';
import styles from '../lib/styles.module.scss';
import { useSignalRConnection } from './useSignalRConnection';
import { StatusItem } from './StatusItem';

export function NIStatus() {
    const {
        niStatusData,
        activeKey,
        handleKeyChange,
        openTimeline,
        timelineOpen,
        timeline,
        closeTimeline,
        contextHolder,
        onHandleDownload: handleFileDownload,
    } = useCheckStatus();

    const onStatusUpdate = () => {
        console.log('check');
    };

    const { start } = useSignalRConnection({ statusUpdateCallback: onStatusUpdate });

    const processingItems = useMemo(
        () =>
            niStatusData.processing.length === 0
                ? 'No processing files'
                : niStatusData.processing.map((item: ProcessingDeal) => (
                      <StatusItem
                          isReviewOnly={false}
                          key={item.r2Identifier}
                          openTimeline={openTimeline}
                          {...item}
                      />
                  )),
        [niStatusData.processing, openTimeline]
    );

    const failed = useMemo(
        () =>
            niStatusData.failed.length === 0
                ? 'No failed files'
                : niStatusData.failed.map((item: FailedDeal) => (
                      <StatusItem
                          isReviewOnly={false}
                          key={item.r2Identifier}
                          openTimeline={openTimeline}
                          {...item}
                      />
                  )),
        [niStatusData.failed, openTimeline]
    );

    const completed = useMemo(
        () =>
            niStatusData.completed.length === 0
                ? 'No completed files'
                : niStatusData.completed.map((item: CompletedDeal) => (
                      <StatusItem
                          isReviewOnly={false}
                          key={item.r2Identifier}
                          openTimeline={openTimeline}
                          {...item}
                      />
                  )),
        [niStatusData.completed, openTimeline]
    );

    const newAssetItems = useMemo(
        () => [
            {
                key: 'processing',
                label: (
                    <div className={styles['processing-container']}>
                        <span>Processing</span>
                        <Badge
                            showZero
                            count={niStatusData.processing.length}
                            style={{ backgroundColor: 'gold' }}
                        />
                    </div>
                ),
                children: <div className={styles['processing']}>{processingItems}</div>,
            },
            {
                key: 'completed',
                label: (
                    <div className={styles['processing-container']}>
                        <span>Setup Completed (T-15 days)</span>
                        <Badge
                            showZero
                            count={niStatusData.completed.length}
                            style={{ backgroundColor: '#52c41a' }}
                        />
                    </div>
                ),
                children: <div className={styles['processing']}>{completed}</div>,
            },
            {
                key: 'incomplete',
                label: (
                    <div className={styles['processing-container']}>
                        <span>Incomplete/Rejected</span>
                        <Badge showZero count={niStatusData.failed.length} />
                    </div>
                ),
                children: <div className={styles['processing']}>{failed}</div>,
            },
        ],
        [
            completed,
            failed,
            niStatusData.completed.length,
            niStatusData.failed.length,
            niStatusData.processing.length,
            processingItems,
        ]
    );

    return (
        <div className={styles.container}>
            <Button onClick={start}>start</Button>
            {contextHolder}
            {newAssetItems!.map((item) => (
                <Collapse
                    key={item.key}
                    items={[item]}
                    onChange={handleKeyChange}
                    activeKey={activeKey}
                />
            ))}
            <Modal
                open={timelineOpen}
                onOk={closeTimeline}
                onCancel={closeTimeline}
                footer={[
                    <Button className={styles.download} key="download" onClick={handleFileDownload}>
                        Download File
                    </Button>,
                    <Button key="submit" onClick={closeTimeline}>
                        Close
                    </Button>,
                ]}
            >
                <TimelineMonitor timeline={timeline} />
            </Modal>
        </div>
    );
}
