import { useState } from 'react';
import { Card, Radio } from 'antd';
import { AnalyticsItem, AssumptionsItem } from './lib/types';
import { renderDescriptions } from './RenderDescriptions';

interface SpecificationsProps {
    analytics?: AnalyticsItem;
    assumptions?: AssumptionsItem;
    prevAnalytics?: AnalyticsItem;
    prevAssumptions?: AssumptionsItem;
}

export default function Specifications({
    analytics,
    assumptions,
    prevAnalytics,
    prevAssumptions,
}: SpecificationsProps) {
    const [mode, setMode] = useState<string>('assumptions');
    return (
        <Card
            size="small"
            title="Specifications"
            style={{ marginTop: 16 }}
            extra={
                <Radio.Group
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Radio.Button value="assumptions">Assumptions</Radio.Button>
                    <Radio.Button value="analytics">Analytics</Radio.Button>
                </Radio.Group>
            }
            styles={{
                header: {
                    color: '#FFFFFF',
                    background: 'linear-gradient(90deg, #013D7D 0%, rgba(105, 178, 255, 0.7) 100%)',
                }
            }}
        >
            {mode === 'assumptions'
                ? renderDescriptions(
                      { ... (assumptions as Record<string, unknown>)},
                      { ... (prevAssumptions as Record<string, unknown>)},
                  )
                : renderDescriptions(
                      { ... (analytics as Record<string, unknown>)},
                      { ... (prevAnalytics as Record<string, unknown>)},
                      4,
                  )}
        </Card>
    );
}