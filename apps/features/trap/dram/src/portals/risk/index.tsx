import { Tabs } from 'antd';
import NipponReportMonitorPage from './features/nippon-risk-monitor/index';

export default function RiskAnalysisDashboard() {

	const components = [
		{
			key: 'nippon-report-monitor',
			label: 'Nippon Report Monitor',
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
					defaultActiveKey="nippon-report-monitor"
					items={components}
					style={{ flex: 1, overflow: 'hidden' }}
				/>
			</div>
		</div>
	)
}