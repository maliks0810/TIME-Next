import { Form, Select } from 'antd';

export const AssetInfoPrepaymentType = ({
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
                    name="prepaymentType"
                    rules={[{ required: false, message: 'Please select prepayment type!' }]}
                    noStyle
                >
                    <Select
                        id="prepaymentType"
                        style={{ width: '90px' }}
                        value={value}
                        options={[
                            { label: 'ABS', value: 'ABS' },
                            { label: 'CPJ', value: 'CPJ' },
                            { label: 'CPR', value: 'CPR' },
                            { label: 'HEP', value: 'HEP' },
                            { label: 'MHP', value: 'MHP' },
                            { label: 'PPC', value: 'PPC' },
                            { label: 'PSA', value: 'PSA' }
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
