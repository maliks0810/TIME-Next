import { Tabs } from 'antd';
import NipponReportMonitorPage from './features/nippon-risk-monitor/index';

export default function RiskAnalysisDashboard() {

	const components = [
		{
			key: 'nippon-risk-monitor',
			label: 'Nippon Risk Monitor',
			children: (
				<NipponReportMonitorPage />
			),
			disabled: false,
		}
	]
	return (
		<div className="dram-risk-dashboard">
			<div style={{ marginTop: '24px' }} />
			<div className="componentHighlight">
				<Tabs
					className="risk-dashboard-tabs"
					defaultActiveKey="nippon-risk-monitor"
					items={components}
					style={{ flex: 1, overflow: 'hidden' }}
				/>
			</div>
		</div>
	)
}