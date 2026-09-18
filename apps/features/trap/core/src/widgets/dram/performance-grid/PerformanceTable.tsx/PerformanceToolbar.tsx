import { Button } from 'antd';

import type { ViewMode } from './types';
import { PERIOD_ORDER } from './types';

import styles from './PerformanceToolbar.module.scss';
import {
    ColumnHeightOutlined,
    RightOutlined,
    VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import { useAttributionStore } from '../state/useStore';
import { levelLabelShort } from '../data/breakdownDefaults';

interface Props {
    mode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
    onCollapseAll: () => void;
    onExpandAll: () => void;
}

export function PerformanceToolbar({ onCollapseAll, onExpandAll }: Props) {
    const levels = useAttributionStore((store) => store.levels);

    const openDrawer = useAttributionStore((store) => store.openDrawer);

    return (
        <>
            <div className={styles.performanceToolbar}>
                <div className={styles.leftSection}>
                    <div className={styles.tag} onClick={() => openDrawer('breakdown')}>
                        <div>Breakdown</div>
                        {levels.length === 0 ? (
                            <b>All securities</b>
                        ) : (
                            <>
                                {levels.map((level, i) => (
                                    <span key={i}>
                                        {i > 0 && <RightOutlined />}{' '}
                                        <b>{levelLabelShort(level)}</b>{' '}
                                    </span>
                                ))}
                                <RightOutlined /> <b>Security</b>
                            </>
                        )}{' '}
                    </div>
                    <div className={styles.tag}>
                        <div>Periods</div>
                        <div>
                            {PERIOD_ORDER.map((period) => (
                                <span key={period} className={styles.pbadge}>
                                    {period}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    <Button
                        variant="text"
                        color="default"
                        icon={<VerticalAlignMiddleOutlined />}
                        title="Collapse all rows"
                        aria-label="Collapse all rows"
                        onClick={onCollapseAll}
                    ></Button>
                    <Button
                        variant="text"
                        color="default"
                        icon={<ColumnHeightOutlined />}
                        title="Expand all rows"
                        aria-label="Expand all rows"
                        onClick={onExpandAll}
                    ></Button>
                </div>
            </div>
        </>
    );
}
