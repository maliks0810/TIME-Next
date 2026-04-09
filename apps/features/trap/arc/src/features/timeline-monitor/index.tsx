import { Timeline } from 'antd';
import { Deal } from '../../lib/types';
import styles from './lib/styles.module.scss';

export function TimelineMonitor({ timeline }: { timeline: Deal['details'] }) {
    return (
        <div className={styles.timeline}>
            <Timeline
                mode={'left'}
                pending="Continuing..."
                items={timeline.map((el) => ({
                    label: el.timestamp,
                    children: (
                        <div className={styles.item}>
                            <span className={styles.operation}>{el.operation}</span>
                            <span className={styles.message}>{el.message}</span>
                        </div>
                    ),
                }))}
            />
        </div>
    );
}
