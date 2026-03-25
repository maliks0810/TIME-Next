import { Form, Select } from 'antd';

export const AssetInfoPrepaymentType = ({
    value,
    title,
    options
}: {
    value?: string;
    title: string;
    options: { label: string; value: string; }[]
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
                        options={options}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
