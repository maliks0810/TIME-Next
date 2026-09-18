import { CalendarOutlined, ContainerOutlined, LineChartOutlined, SettingOutlined } from "@ant-design/icons";
import { Button } from 'antd';

import styles from './PerformanceGridHeader.module.scss';
import clsx from 'clsx';
import { useAttributionStore } from './state/useStore';

interface PerformanceGridHeaderProps {
    portfolioName: string;
    compareVsName: string;
    startDate: string;
    endDate: string;
    linkAsOf: boolean;
}

export const PerformanceGridHeader = ({
    portfolioName,
    compareVsName,
    startDate,
    endDate,
    linkAsOf,
}: PerformanceGridHeaderProps) => {
    const openDrawer = useAttributionStore((s) => s.openDrawer);
    const drawerTab = useAttributionStore((s) => s.drawerTab);
    return (
        <div className={styles.performanceGridHeader}>
            <div className={styles.titleWrap}>
                <span className={styles.title}>
                    Attribution Analysis <span className="cap">C5</span>
                </span>
                <div className={styles.context} title="What this widget is analysing">
                    {portfolioName && <>
                      <span className={styles.chip}>
                          <ContainerOutlined />
                          {portfolioName}
                      </span>
                    </>}
                    
                    {compareVsName && <>
                      <span className={styles.chip}>
                          <LineChartOutlined />
                          vs {compareVsName}
                      </span>
                    </>}
                    
                    {(startDate || endDate) && <>
                      <span className={clsx(styles.chip, linkAsOf ? '' : ' ctx-warn')}>
                        <CalendarOutlined />
                        {linkAsOf ? `as of ${startDate}` : `${startDate} vs ${endDate} · drift`}
                      </span>
                    </>}                    
                </div>
            </div>
            <div className="wg-ctrls">
                <Button
                    className="icobtn"
                    title="Customize"
                    aria-label="Customize"
                    onClick={() => openDrawer(drawerTab || 'breakdown')}
                    style={{
                        width: 30,
                        height: 30,
                        padding: 0,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 16,
                        lineHeight: 1,
                    }}
                >
                    <SettingOutlined />
                </Button>
            </div>
        </div>
    );
};
