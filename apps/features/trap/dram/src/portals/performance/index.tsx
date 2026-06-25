import PerformanceAnalysisContent from './features/performance-analysis/index';
import { Tabs } from 'antd';
import { useState } from 'react';


export default function PerformanceAnalysisDashboard() {
    const [activeKey, setActiveKey] = useState<'performance-analysis'>('performance-analysis');
    // const goToDashboard = () => {
    //     setActiveKey('performance-analysis');
    // };
    // const goToAdmin = () => {
    //     setActiveKey('admin');
    // };
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
                     activeKey={activeKey}
                    onChange={(key) => setActiveKey(key as 'performance-analysis')}
                    items={components}
                    style={{ flex: 1, overflow: 'hidden' }}
                />
            </div>
        </div>
    )
}