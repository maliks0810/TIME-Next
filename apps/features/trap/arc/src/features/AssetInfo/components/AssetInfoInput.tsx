import { Form, Input as BaseInput, InputNumber } from 'antd';
import { CSSProperties } from 'react';

const getInputType = (inputType?: 'input' | 'number' | 'textArea') => {
    switch (inputType) {
        case 'textArea':
            return BaseInput.TextArea;
        case 'number':
            return InputNumber;
        default:
            return BaseInput;
    }
};

export const AssetInfoInput = ({
    title,
    value,
    titleColor,
    disabled,
    valueColor,
    inputType,
    formItemName,
    style,
    required,
    controls = true,
}: {
    title: string;
    value?: string | number | null;
    titleColor?: string;
    valueColor?: string;
    disabled?: boolean;
    inputType?: 'input' | 'number' | 'textArea';
    formItemName: string;
    style?: CSSProperties;
    required?: boolean,
    controls?:boolean
}) => {
    const Input = getInputType(inputType);

    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13, color: valueColor }}>
                <Form.Item
                    noStyle
                    name={formItemName}
                    rules={[{ required: required, message: `Please Provide ${title}` }]}
                >
                    <Input
                        style={{ minWidth: '90px', ...style }}
                        value={value ?? ''}
                        disabled={disabled}
                        size="small"
                        type={inputType}
                        controls={controls}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9, color: titleColor }}>{title}{required && '*'}</div>
        </div>
    );
};
