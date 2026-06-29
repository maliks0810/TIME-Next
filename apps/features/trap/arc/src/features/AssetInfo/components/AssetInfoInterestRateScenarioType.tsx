import { Form, Select } from 'antd';

export const AssetInfoInterestRateScenarioType = ({
    value,
}: {
    value?: string;
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 18, fontSize: 13 }}>
                <Form.Item
                    name="interestRateScenarioType"
                    rules={[{ required: false, message: 'Please select Interest Rate Scenario type!' }]}
                    noStyle
                >
                    <Select
                        id="interestRateScenarioType"
                        style={{ width: '120px' }}
                        value={value}
                        options={[
                            { label: 'Forward', value: 'Forward' },
                            { label: 'Nominal', value: 'Nominal' }
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}> Interest Rate Scenario</div>
        </div>
    );
};
