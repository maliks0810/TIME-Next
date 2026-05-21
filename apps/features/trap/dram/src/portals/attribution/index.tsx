import React, { useState } from 'react';
import { Tabs } from 'antd';

import EquityWizardPage from './features/attribution-analysis/pages/EquityWizardPage';
import EquityWorkspacePage from './features/attribution-analysis/pages/EquityWorkspacePage';

export default function AttributionAnalysisDashboard() {
  const [activeKey, setActiveKey] = useState<'workspace' | 'wizard'>('workspace');

  const items = [
    {
      key: 'workspace',
      label: 'Equity Attribution Analysis',
      children: <EquityWorkspacePage />,
    },
    {
      key: 'wizard',
      label: 'Configure Entry Equity Attribution Analysis',
      children: <EquityWizardPage />, // ✅ untouched
    },
  ];

  return (
    <div className="dram-attribution-dashboard">
      <div style={{ marginTop: '24px' }} />

      <div className="componentHighlight">
        <Tabs
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key as 'workspace' | 'wizard')}
          items={items}
        />
      </div>
    </div>
  );
}