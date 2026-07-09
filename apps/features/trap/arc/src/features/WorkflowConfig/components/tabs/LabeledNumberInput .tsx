/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Form, InputNumber } from 'antd';

const labelStyle: React.CSSProperties = { fontWeight: 600 };

const LabeledNumberInput = ({ label, name, inputProps = {}, labelStyleOverride = {} }: {
    label: string;
    name: string;
    inputProps?: any; // Props passed to InputNumber component  
    labelStyleOverride?: React.CSSProperties;
}) => {
    return (
        <>
            <label htmlFor={name} style={{ ...labelStyle, ...labelStyleOverride }}>
                {label}
            </label>
            <Form.Item name={name} noStyle>
                <InputNumber id={name} controls={false} {...inputProps} />
            </Form.Item>
        </>
    );
};

export default LabeledNumberInput;  