import React from 'react';
import { Form, Select } from 'antd';

const AssetTypeselect = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    required = false,
    allowClear = false,
    defaultValue,
    style = {},
}: {  
  label: string;  
  name: string;  
  value: string | null;  
  onChange: (value: string) => void;  
  options: { label: React.ReactNode; value: string }[];  
  placeholder?: string;  
  required?: boolean;  
  allowClear?: boolean;  
  defaultValue?: string | null;  
  style?: React.CSSProperties | null;  
}) => {
    return (
        <>
            <label htmlFor={name}>
                <strong>{label}{required ? '*' : ''}</strong>
            </label>
            <Form.Item name={name} required={required} noStyle>
                <Select
                    id={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    style={{
                        width: '260px',
                        padding: '4px',
                        borderRadius: '6px',
                        border: '1px solid lightgray',
                        backgroundColor: 'white',
                        ...style,
                    }}
                    options={options}
                    allowClear={allowClear}
                />
            </Form.Item>
        </>
    );
};
export default AssetTypeselect;  