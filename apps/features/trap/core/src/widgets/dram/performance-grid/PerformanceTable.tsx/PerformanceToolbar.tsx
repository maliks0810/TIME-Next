// Currently Not deploying this functionality to production. Skip code review

import { Button } from 'antd';

import type { ViewMode } from './types';
import { PERIOD_ORDER } from './types';

import styles from './PerformanceToolbar.module.scss';
import { ColumnHeightOutlined, FileExcelOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons';

interface Props {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onExportToExcel: () => void;
}

export function PerformanceToolbar({ mode, onModeChange, onCollapseAll, onExpandAll, onExportToExcel }: Props) {
  const breakdown = 'GICS Sector';

  const handleModeChange = () => {
    const nextMode: ViewMode = mode === 'security' ? 'breakdown' : 'security';
    onModeChange(nextMode)
  }

  return (<>
    <div className={styles.performanceToolbar}>
      <div className={styles.leftSection}>
        <div className={styles.tag} onClick={handleModeChange}>
          <div>Breakdown</div>
          { mode === 'security' 
            ? <span><b>All Securities</b></span> 
            : <span><b>{breakdown} &gt; Security</b></span>
          }
          
        </div>
        <div className={styles.tag}>
          <div>Periods</div>
          <div>{PERIOD_ORDER.map(period => (
            <span key={period} className={styles.pbadge}>{period}</span>
          ))}</div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <Button variant='text' color='default' 
          icon={<VerticalAlignMiddleOutlined />}
          title="Collapse all rows"
          aria-label="Collapse all rows"
          onClick={onCollapseAll}>  
        </Button>
        <Button variant='text' color='default' 
          icon={<ColumnHeightOutlined />}
          
          title="Expand all rows"
          aria-label="Expand all rows"
          onClick={onExpandAll}>  
        </Button>
        <Button variant='text' color='default' 
          icon={<FileExcelOutlined />}
          title="Export to Excel"
          aria-label="Export to Excel"
          onClick={onExportToExcel}>  
        </Button>
      </div>
    </div>
  </>);
}