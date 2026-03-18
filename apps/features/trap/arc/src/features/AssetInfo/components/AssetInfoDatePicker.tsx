import { TRAPDatePicker } from '../../../lib/helpers';
import { Form } from 'antd';

export const AssetInfoDatePicker = ({
    value,
    title,
    isDisabled,
    required,
    formItemName,
}: {
    value?: string;
    title: string;
    isDisabled?: boolean;
    formItemName: string;
    required?: boolean;
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13 }}>
                <Form.Item noStyle name={formItemName} rules={[{ required: required, message: `Please Provide ${title}` }]}>
                    <TRAPDatePicker
                        style={{ minWidth: '120px' }}
                        placeholder="Select Date"
                        format="YYYY-MM-DD"
                        value={value || null}
                        disabled={isDisabled}
                        allowClear
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}{required && '*'}</div>
        </div>
    );
};
