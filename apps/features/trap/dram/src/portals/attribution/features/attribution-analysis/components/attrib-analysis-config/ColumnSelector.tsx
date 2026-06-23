import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  List,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

type ColumnSelectorProps = {
  options: ColumnItem[];
  selectedKeys: string[];
  onChange: (next: string[]) => void;
};

type ColumnItem = {
  key: string;
  label: string;
};

function moveItem<T>(arr: T[], index: number, delta: number): T[] {
  const next = [...arr];
  const target = index + delta;

  if (target < 0 || target >= arr.length) {
    return arr;
  }

  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
export function ColumnSelector({ options, selectedKeys, onChange }: ColumnSelectorProps) {
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const optionMap = useMemo(() => {
    return new Map<string, ColumnItem>(options.map((item) => [item.key, item]));
  }, [options]);

  const normalizedSearch = search.trim().toLowerCase();

  const availableItems = useMemo(() => {
    return options.filter((item) => {
      if (selectedSet.has(item.key)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return item.label.toLowerCase().includes(normalizedSearch);
    });
  }, [options, selectedSet, normalizedSearch]);

  const selectedItems = useMemo(() => {
    return selectedKeys
      .map((key) => optionMap.get(key))
      .filter((item): item is ColumnItem => Boolean(item))
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return item.label.toLowerCase().includes(normalizedSearch);
      });
  }, [selectedKeys, optionMap, normalizedSearch]);

  const handleAdd = (key: string, checked: boolean) => {
    if (!checked) {
      return;
    }

    if (selectedSet.has(key)) {
      return;
    }

    onChange([...selectedKeys, key]);
  };

  const handleRemove = (key: string) => {
    onChange(selectedKeys.filter((item) => item !== key));
  };

  const handleMoveUp = (key: string) => {
    const index = selectedKeys.indexOf(key);
    if (index < 0) {
      return;
    }

    onChange(moveItem(selectedKeys, index, -1));
  };

  const handleMoveDown = (key: string) => {
    const index = selectedKeys.indexOf(key);
    if (index < 0) {
      return;
    }

    onChange(moveItem(selectedKeys, index, 1));
  };

  return (
    <Card title="Columns">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search fields"
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card size="small" title={`Available Fields (${availableItems.length})`} bodyStyle={{ padding: 0 }}>
              {availableItems.length === 0 ? (
                <div style={{ padding: 16 }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No available fields match the current search."
                  />
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  <List
                    dataSource={availableItems}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "10px 12px" }}>
                        <Checkbox
                          checked={false}
                          onChange={(e) => handleAdd(item.key, e.target.checked)}
                        >
                          {item.label}
                        </Checkbox>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card size="small" title={`Selected Fields (${selectedKeys.length})`} bodyStyle={{ padding: 0 }}>
              {selectedItems.length === 0 ? (
                <div style={{ padding: 16 }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Select at least one field."
                  />
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  <List
                    dataSource={selectedItems}
                    renderItem={(item) => {
                      const index = selectedKeys.indexOf(item.key);

                      return (
                        <List.Item
                          style={{ padding: "10px 12px" }}
                          actions={[
                            <Button
                              key="up"
                              type="text"
                              icon={<UpOutlined />}
                              disabled={index <= 0}
                              onClick={() => handleMoveUp(item.key)}
                            />,
                            <Button
                              key="down"
                              type="text"
                              icon={<DownOutlined />}
                              disabled={index === selectedKeys.length - 1}
                              onClick={() => handleMoveDown(item.key)}
                            />,
                            <Button
                              key="remove"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemove(item.key)}
                            />,
                          ]}
                        >
                          <Space size={8}>
                            <Tag color="blue">{index + 1}</Tag>
                            <span>{item.label}</span>
                          </Space>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Text type="secondary">
          Search to find fields quickly, check a field to add it, and use the arrows on the selected side to reorder columns.
        </Text>
      </Space>
    </Card>
  );
}
