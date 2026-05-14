import PerformanceAnalysisContent from './features/performance-analysis/index';
import { Tabs } from 'antd';


export default function PerformanceAnalysisDashboard() {

    const components = [
        {
            key: 'performance-analysis',
            label: 'Performance Returns',
            children: (
                <PerformanceAnalysisContent />
            ),
            disabled: false,
        }
    ]
    return (
        <div className="dram-performance-dashboard">
            <div style={{ marginTop: '24px' }} />
            <div className="componentHighlight">
                <Tabs
                    className="performance-dashboard-tabs"
                    defaultActiveKey="performance-analysis"
                    items={components}
                    style={{ flex: 1, overflow: 'hidden' }}
                />
            </div>
        </div>
    )
}