import React from "react";
import { Button, Card, Select, Space, Tag, Tooltip, Typography } from "antd";
import {
  ClearOutlined,
  DownOutlined,
  RetweetOutlined,
  SelectOutlined,
  UpOutlined,
} from "@ant-design/icons";
import type { FilterOption } from "../dram-grid";

const { Text } = Typography;

interface FilterGroupSectionProps {
  groupId: string;
  title: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  selectedValues: string[];
  collapsed: boolean;
  onToggleCollapsed: (groupId: string) => void;
  onChange: (nextValues: string[]) => void;
}

export function FilterGroupSection({
  groupId,
  title,
  icon,
  options,
  selectedValues,
  collapsed,
  onToggleCollapsed,
  onChange,
}: FilterGroupSectionProps) {
  const allValues = React.useMemo(
    () => options.map((o) => o.value),
    [options],
  );

  const handleSelectAll = () => onChange(allValues);
  const handleClear = () => onChange([]);
  const handleInvert = () => {
    const selectedSet = new Set(selectedValues);
    onChange(allValues.filter((v) => !selectedSet.has(v)));
  };

  return (
    <Card
      size="small"
      style={{ borderRadius: 6, border: "1px solid #d8dee9", marginBottom: 6 }}
      bodyStyle={{ padding: collapsed ? "6px 10px" : "8px 10px" }}
    >
      <Space
        style={{ width: "100%", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => onToggleCollapsed(groupId)}
      >
        <Space size={6}>
          {icon}
          <Text strong style={{ fontSize: 12 }}>
            {title}
          </Text>
          {selectedValues.length > 0 && (
            <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
              {selectedValues.length}
            </Tag>
          )}
          {options.length > 0 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              of {options.length}
            </Text>
          )}
        </Space>
        <Space size={4}>
          {!collapsed && (
            <>
              <Tooltip title="Select all">
                <Button
                  size="small"
                  type="text"
                  icon={<SelectOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                />
              </Tooltip>
              <Tooltip title="Invert selection">
                <Button
                  size="small"
                  type="text"
                  icon={<RetweetOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInvert();
                  }}
                />
              </Tooltip>
              <Tooltip title="Clear selection">
                <Button
                  size="small"
                  type="text"
                  icon={<ClearOutlined />}
                  disabled={selectedValues.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              </Tooltip>
            </>
          )}
          <Button
            size="small"
            type="text"
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
          />
        </Space>
      </Space>

      {!collapsed && (
        <div style={{ marginTop: 8 }}>
          <Select
            size="small"
            mode="multiple"
            allowClear
            placeholder="All (no filter)"
            options={options}
            value={selectedValues}
            maxTagCount="responsive"
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="label"
            onChange={onChange}
          />
        </div>
      )}
    </Card>
  );
}