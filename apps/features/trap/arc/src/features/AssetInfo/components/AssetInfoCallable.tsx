import { CALLABLE_OPTIONS } from '../../../shared/constants';
import { Form, Select } from 'antd';

export const AssetInfoCallable = ({
    value,
    title,
    required,
}: {
    value?: string;
    title: string;
    required: boolean;
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13 }}>
                <Form.Item
                    name="callable"
                    rules={[{ required: required, message: 'Please state if the bond is callable!' }]}
                    noStyle
                >
                    <Select
                        id="callable"
                        style={{ width: '120px' }}
                        value={value}
                        options={CALLABLE_OPTIONS}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}{required && '*'}</div>
        </div>
    );
};
