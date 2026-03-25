import { Form, Select } from 'antd';

export const AssetInfoModelFamilyOverrideType = ({
    value,
    title,
}: {
    value?: string;
    title: string;
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13 }}>
                <Form.Item
                    name="modelFamilyOverrideType"
                    rules={[{ required: false, message: 'Please select Model Family Override type!' }]}
                    noStyle
                >
                    <Select
                        id="modelFamilyOverrideType"
                        style={{ width: '120px' }}
                        value={value}
                        options={[
                            { label: 'BRS v6.5', value: 'BRS v6.5' },
                            { label: 'BRS v6.4', value: 'BRS v6.4' },
                            { label: 'BRS v2.2', value: 'BRS v2.2' },
                            { label: 'BRCLO v2.01', value: 'BRCLO v2.01' },
                            { label: 'STATIC', value: 'STATIC' }
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
