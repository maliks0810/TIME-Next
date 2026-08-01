import React from "react";
import { AutoComplete, Input, Space, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { AttribFilterState } from "./ConfigTabbedCompact";
import type { FilterOption } from "../dram-grid";

const { Text } = Typography;

type FilterGroupId = keyof AttribFilterState;

interface UniversalFilterSearchProps {
  optionsByGroup: Record<FilterGroupId, FilterOption[]>;
  selectedByGroup: AttribFilterState;
  onAdd: (group: FilterGroupId, value: string) => void;
}

interface SearchResult {
  key: string;
  group: FilterGroupId;
  option: FilterOption;
  score: number;
  alreadySelected: boolean;
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

function scoreMatch(needle: string, haystack: string): number {
  const lowerNeedle = needle.toLowerCase();
  const lowerHaystack = haystack.toLowerCase();

  if (lowerHaystack === lowerNeedle) return 100;
  if (lowerHaystack.startsWith(lowerNeedle)) return 80;
  if (lowerHaystack.includes(lowerNeedle)) return 60;
  return 0;
}

export function UniversalFilterSearch({
  optionsByGroup,
  selectedByGroup,
  onAdd,
}: UniversalFilterSearchProps) {
  const [searchText, setSearchText] = React.useState("");

  const results = React.useMemo<SearchResult[]>(() => {
    const trimmed = searchText.trim();
    if (trimmed.length < 1) return [];

    const groups: FilterGroupId[] = ["currency", "country", "sector", "rating"];
    const matches: SearchResult[] = [];

    for (const group of groups) {
      const selectedSet = new Set(selectedByGroup[group]);

      for (const option of optionsByGroup[group] ?? []) {
        const labelScore = scoreMatch(trimmed, option.label);
        const valueScore = scoreMatch(trimmed, option.value);
        const score = Math.max(labelScore, valueScore);

        if (score > 0) {
          matches.push({
            key: `${group}-${option.value}`,
            group,
            option,
            score,
            alreadySelected: selectedSet.has(option.value),
          });
        }
      }
    }

    return matches
      .sort((a, b) => {
        // Unselected first, then by score descending
        if (a.alreadySelected !== b.alreadySelected) {
          return a.alreadySelected ? 1 : -1;
        }
        return b.score - a.score;
      })
      .slice(0, 20); // cap at 20 results for perf
  }, [searchText, optionsByGroup, selectedByGroup]);

  const autoCompleteOptions = React.useMemo(
    () =>
      results.map((r) => ({
        key: r.key,
        value: r.key,
        label: (
          <Space size={6} style={{ width: "100%" }}>
            <Tag color={groupColors[r.group]} style={{ margin: 0, fontSize: 10 }}>
              {groupLabels[r.group]}
            </Tag>
            <Text style={{ fontSize: 12 }}>{r.option.label}</Text>
            {r.alreadySelected && (
              <Text type="secondary" style={{ fontSize: 11, marginLeft: "auto" }}>
                already selected
              </Text>
            )}
          </Space>
        ),
      })),
    [results],
  );

  const handleSelect = (key: string) => {
    const match = results.find((r) => r.key === key);
    if (!match || match.alreadySelected) {
      setSearchText("");
      return;
    }
    onAdd(match.group, match.option.value);
    setSearchText("");
  };

  return (
    <AutoComplete
      size="small"
      style={{ width: "100%" }}
      value={searchText}
      onChange={setSearchText}
      onSelect={handleSelect}
      options={autoCompleteOptions}
      notFoundContent={
        searchText.trim().length > 0 ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            No matching filter values found
          </Text>
        ) : null
      }
    >
      <Input
        size="small"
        prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
        placeholder="Search filters (e.g., 'USD', 'Financials', 'BB')"
        allowClear
      />
    </AutoComplete>
  );
}