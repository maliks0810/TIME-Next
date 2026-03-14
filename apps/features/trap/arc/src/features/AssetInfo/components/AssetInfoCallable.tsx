import { Form, Select } from 'antd';

export const AssetInfoCallable = ({
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
                    name="callable"
                    rules={[{ required: false, message: 'Please state if the bond is callable!' }]}
                    noStyle
                >
                    <Select
                        id="callable"
                        style={{ width: '120px' }}
                        value={value}
                        options={[
                            { label: 'Yes (Y)', value: 'Y' },
                            { label: 'No (N)', value: 'N' },
                            { label: 'Clean up (C)', value: 'C' }
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
