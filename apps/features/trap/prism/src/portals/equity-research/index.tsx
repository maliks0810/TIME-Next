import AnalystBuyList from './features/analyst-buylist/index';
import AnalystCoverageList from "./features/analyst-coverage";
import AnalystPerformance from "./features/analyst-performance";
import { Tabs } from 'antd';

export default function EquityDashboard() {

    const components = [
        {
            key: 'buy-list',
            label: 'Analyst Buy/Drop List',
            children: (
                <AnalystBuyList />
            ),
            disabled: false,
        },
        {
            key: 'coverage-list',
            label: 'Analyst Coverage List',
            children: (
                <AnalystCoverageList />
            ),
            disabled: false,
        },
        {
            key: 'analyst-performance',
            label: 'Analyst Performance',
            children: (
                <AnalystPerformance />
            ),
            disabled: false,
        }
    ]
    return (
        <div className="equity-dashboard">
            {/* <Breadcrumb style={{ marginLeft: '12px', marginTop: '12px' }}>
                <Breadcrumb.Item>Equity Research</Breadcrumb.Item>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <a href="#" onClick={e => e.preventDefault()}>Screens</a>
                    </Dropdown>
                </Breadcrumb.Item>
            </Breadcrumb> */}
            <div style={{ marginTop: '24px' }} />
            <div className="componentHighlight">
                <Tabs
                    className="equity-dashboard-tabs"
                    defaultActiveKey="buy-list"
                    items={components}
                    style={{ flex: 1, overflow: 'auto' }}
                />
            </div>
        </div>
    )
}