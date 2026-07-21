import React from "react";
import { Button, Space, Tag, Typography } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import type { AttribFilterState } from "./ConfigTabbedCompact";

const { Text } = Typography;

type FilterGroupId = keyof AttribFilterState;

interface FilterOptionLookup {
  currency: Map<string, string>;
  country: Map<string, string>;
  sector: Map<string, string>;
  rating: Map<string, string>;
}

interface FilterChipBarProps {
  filters: AttribFilterState;
  optionLookup: FilterOptionLookup;
  onRemoveOne: (group: FilterGroupId, value: string) => void;
  onClearGroup: (group: FilterGroupId) => void;
  onClearAll: () => void;
}

const groupLabels: Record<FilterGroupId, string> = {
  currency: "Currency",
  country: "Country",
  sector: "Sector",
  rating: "Rating",
};

const groupColors: Record<FilterGroupId, string> = {
  currency: "gold",
  country: "green",
  sector: "blue",
  rating: "purple",
};

export function FilterChipBar({
  filters,
  optionLookup,
  onRemoveOne,
  onClearAll,
}: FilterChipBarProps) {
  const groups: FilterGroupId[] = ["currency", "country", "sector", "rating"];

  const totalActive = groups.reduce(
    (sum, group) => sum + filters[group].length,
    0,
  );

  if (totalActive === 0) {
    return (
      <Text type="secondary" style={{ fontSize: 12 }}>
        No filters applied — all portfolio securities are included.
      </Text>
    );
  }

  return (
    <Space direction="vertical" size={6} style={{ width: "100%" }}>
      <Space size={4} style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Space size={4}>
          <Text strong style={{ fontSize: 12 }}>
            Active filters
          </Text>
          <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
            {totalActive}
          </Tag>
        </Space>
        <Button
          size="small"
          type="link"
          danger
          icon={<CloseCircleOutlined />}
          onClick={onClearAll}
          style={{ padding: 0 }}
        >
          Clear all
        </Button>
      </Space>

      <Space size={[4, 4]} wrap>
        {groups.map((group) => {
          const values = filters[group];
          if (values.length === 0) return null;

          return values.map((value) => {
            const label = optionLookup[group].get(value) ?? value;
            return (
              <Tag
                key={`${group}-${value}`}
                closable
                color={groupColors[group]}
                onClose={(e) => {
                  e.preventDefault();
                  onRemoveOne(group, value);
                }}
                style={{ margin: 0 }}
              >
                <Text style={{ fontSize: 11 }}>
                  <strong>{groupLabels[group]}:</strong> {label}
                </Text>
              </Tag>
            );
          });
        })}
      </Space>
    </Space>
  );
}