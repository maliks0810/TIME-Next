import { Form, Select } from 'antd';

export const AssetInfoDefaultType = ({
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
                    name="defaultType"
                    rules={[{ required: false, message: 'Please select default type!' }]}
                    noStyle
                >
                    <Select
                        id="defaultType"
                        style={{ width: '90px' }}
                        value={value}
                        options={[
                            { label: 'CDR', value: 'CDR' },
                            { label: 'SDA', value: 'SDA' }
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
