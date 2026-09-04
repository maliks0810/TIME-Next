// Currently Not deploying this functionality to production. Skip code review

import { CalendarOutlined, ContainerOutlined, LineChartOutlined, SettingOutlined } from "@ant-design/icons";
import { Button } from 'antd';

import styles from './PerformanceGridHeader.module.scss';
import clsx from "clsx";

interface PerformanceGridHeaderProps {
  portfolioName: string;
  benchmarkName: string;
  startDate: string;
  endDate: string;
  linkAsOf: boolean
}

export const PerformanceGridHeader = ({
  portfolioName, benchmarkName, startDate, endDate, linkAsOf
}: PerformanceGridHeaderProps) => {
  console.log("portfolioName", portfolioName);
  return (
    <div className={styles.performanceGridHeader}>
      <div className={styles.titleWrap}>
        <span className={styles.title}>
          Attribution Analysis <span className="cap">C5</span>
        </span>
        <div className={styles.context} title="What this widget is analysing">
          <span className={styles.chip}>
            <ContainerOutlined /> 
            {portfolioName}
          </span>
          <span className={styles.chip}>
            <LineChartOutlined />
            vs {benchmarkName}
          </span>
          <span 
             className={clsx(
                styles.chip,
                linkAsOf ? "" : " ctx-warn"
              )} 
            >
            <CalendarOutlined /> 
            {linkAsOf ? `as of ${startDate}` : `${startDate} vs ${endDate} · drift`}
          </span>
        </div>
      </div>
      <div className="wg-ctrls">
        <Button
          className="icobtn"
          title="Customize"
          aria-label="Customize"
          style={{ width: 30, height: 30, padding: 0, display: "grid", placeItems: "center", fontSize: 16, lineHeight: 1 }}
        >
          <SettingOutlined />
        </Button>
      </div>
    </div>
  )
}

export default PerformanceGridHeader;