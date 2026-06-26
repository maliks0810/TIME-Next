import React from 'react';
import { Select, Form } from 'antd';

const labelStyle: React.CSSProperties = { fontWeight: 600 };

const LabeledSelect = ({
  label,
  name,
  options,
  style,
  allowClear = true,
  selectWidth = 350,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  style?: React.CSSProperties;
  allowClear?: boolean;
  selectWidth?: number | string;
}) => {
  return (
    <>
      <label htmlFor={name} style={labelStyle}>
        {label}
      </label>
      <Form.Item name={name} noStyle>
        <Select
          id={name}
          style={{ width: selectWidth, ...style }}
          allowClear={allowClear}
          options={options}
        />
      </Form.Item>
    </>
  );
};

export default LabeledSelect; 