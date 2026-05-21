import React from "react";
import { Select } from "antd";

const { Option } = Select;

export type MonthOption = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  options: MonthOption[];
  onChange: (value: string) => void;
};

export const MonthSelector: React.FC<Props> = ({
  value,
  options,
  onChange,
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      style={{ width: 220 }}
    >
      {options.map((opt) => (
        <Option key={opt.value} value={opt.value}>
          {opt.label}
        </Option>
      ))}
    </Select>
  );
};
