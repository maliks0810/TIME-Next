import type { CollapseProps } from 'antd';
import { Collapse, Divider } from 'antd';
import { NIStatus } from './components/NIStatus';
import styles from './lib/styles.module.scss';

const text =
    'The status pane will constantly check if the security setup is completed.  By ways of notification will alert the Risk Analyst that it’s ready.';

const items: CollapseProps['items'] = [
    {
        key: 'newAsset',
        label: 'New Asset',
        children: <NIStatus />,
    },
    {
        key: 'modelIO',
        label: 'Model I/O',
        children: <p>{text}</p>,
    },
];

export function StatusMonitor() {
    return (
        <div className={styles.container}>
            <span className={styles.header}>Status</span>
            <Divider style={{ margin: 0 }} />
            <div className={styles['status-items-container']}>
                {items!.map((item) => (
                    <Collapse
                        key={item.key}
                        items={[item]}
                        defaultActiveKey={['newAsset', 'modelIO']}
                        bordered={false}
                        ghost
                        className={styles.collapse}
                    />
                ))}
            </div>
        </div>
    );
}
