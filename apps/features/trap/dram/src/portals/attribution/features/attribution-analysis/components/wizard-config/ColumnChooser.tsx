import { useMemo, useState } from "react";
import { ColumnChooserItem, reorderSelectedIds } from "./wizardConfigUtils";
import { Space, Button, List, Card, Typography } from "antd";

interface ColumnChooserProps {
  items: ColumnChooserItem[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
}

export default function ColumnChooser({
  items,
  selectedIds,
  onChange,
}: ColumnChooserProps) {
  const [activeAvailableId, setActiveAvailableId] = useState<string | null>(null);
  const [activeSelectedId, setActiveSelectedId] = useState<string | null>(null);

  const availableItems = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return items.filter((item) => !selectedSet.has(item.id));
  }, [items, selectedIds]);

  const selectedItems = useMemo(() => {
    const byId = new Map<string, ColumnChooserItem>(
      items.map((item) => [item.id, item])
    );

    return selectedIds
      .map((id) => byId.get(id))
      .filter((item): item is ColumnChooserItem => Boolean(item));
  }, [items, selectedIds]);

  const handleAdd = (): void => {
    if (!activeAvailableId) {
      return;
    }

    if (selectedIds.includes(activeAvailableId)) {
      return;
    }

    onChange([...selectedIds, activeAvailableId]);
    setActiveAvailableId(null);
  };

  const handleRemove = (): void => {
    if (!activeSelectedId) {
      return;
    }

    onChange(selectedIds.filter((id) => id !== activeSelectedId));
    setActiveSelectedId(null);
  };

  const handleMoveUp = (): void => {
    onChange(reorderSelectedIds(selectedIds, activeSelectedId, "up"));
  };

  const handleMoveDown = (): void => {
    onChange(reorderSelectedIds(selectedIds, activeSelectedId, "down"));
  };

  return (
    <Space align="start" size={16} style={{ width: "100%" }}>
      <Card title="Available Metrics" style={{ width: 360 }}>
        <List
          size="small"
          dataSource={availableItems}
          locale={{ emptyText: "No available metrics" }}
          renderItem={(item) => (
            <List.Item
              onClick={() => setActiveAvailableId(item.id)}
              style={{
                cursor: "pointer",
                borderRadius: 6,
                paddingInline: 8,
                background:
                  activeAvailableId === item.id ? "#e6f4ff" : "transparent",
              }}
            >
              <Space direction="vertical" size={0}>
                <Typography.Text>{item.label}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {item.columnGroupLabel || item.columnGroupKey}
                </Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      <Space direction="vertical" style={{ paddingTop: 84 }}>
        <Button onClick={handleAdd} disabled={!activeAvailableId}>
          Add →
        </Button>
        <Button onClick={handleRemove} disabled={!activeSelectedId}>
          ← Remove
        </Button>
      </Space>

      <Card
        title="Selected Metrics"
        extra={
          <Space>
            <Button onClick={handleMoveUp} disabled={!activeSelectedId}>
              Up
            </Button>
            <Button onClick={handleMoveDown} disabled={!activeSelectedId}>
              Down
            </Button>
          </Space>
        }
        style={{ width: 360 }}
      >
        <List
          size="small"
          dataSource={selectedItems}
          locale={{ emptyText: "No selected metrics" }}
          renderItem={(item, index) => (
            <List.Item
              onClick={() => setActiveSelectedId(item.id)}
              style={{
                cursor: "pointer",
                borderRadius: 6,
                paddingInline: 8,
                background:
                  activeSelectedId === item.id ? "#e6f4ff" : "transparent",
              }}
            >
              <Space direction="vertical" size={0}>
                <Typography.Text>
                  {index + 1}. {item.label}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {item.columnGroupLabel || item.columnGroupKey}
                </Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
