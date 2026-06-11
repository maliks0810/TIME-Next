import React, { useMemo } from "react";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  DownloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { GridConfigResponse, PrimitiveCellValue } from "./types";
import {
  normalizeColumns,
  buildColumns,
  getTotalScrollWidth,
  mapRowsToTableRows,
} from "./columnBuilder";
import { formatValue } from "./formatters";
import { useDramGridContext } from "./DramGridContext";
import { HeaderCell } from "./HeaderCell";

interface DramDataGridProps {
  config: GridConfigResponse;
  rows: Record<string, string | number | null | undefined>[];
  accessorOverrides?: Record<string, string>;
  height?: number;
  title?: string;
  storageKey?: string;
  isConfigView: boolean;
}

interface ColumnChooserGroup {
  groupKey: string;
  groupLabel: string;
  groupOrder: number;
  groupStyleToken: string;
  firstColumnServerIndex: number;
  columns: ReturnType<typeof normalizeColumns>;
}

const sanitizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_");

const escapeCsvCell = (value: string): string => {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const DramDataGrid: React.FC<DramDataGridProps> = ({
  config,
  rows,
  accessorOverrides,
  height = 600,
  title = "Analytics Grid",
  isConfigView,
}) => {
  const ctx = useDramGridContext();

  const normalized = useMemo(
    () => normalizeColumns(config, ctx.state, accessorOverrides),
    [config, ctx.state, accessorOverrides]
  );

  const columns = useMemo(
    () => buildColumns({ columns: normalized }),
    [normalized]
  );

  const scrollX = useMemo(
    () => getTotalScrollWidth(normalized),
    [normalized]
  );

  const dataSource = useMemo(
    () => mapRowsToTableRows(rows),
    [rows]
  );

  const visibleColumns = useMemo(
    () => normalized.filter((c) => c.visible),
    [normalized]
  );

  const groupedChooserColumns = useMemo<ColumnChooserGroup[]>(() => {
    const buckets = new Map<string, ColumnChooserGroup>();

    for (const col of normalized) {
      const existing = buckets.get(col.groupKey);

      if (existing) {
        existing.columns.push(col);
        existing.groupOrder = Math.min(existing.groupOrder, col.groupOrder);
        existing.firstColumnServerIndex = Math.min(
          existing.firstColumnServerIndex,
          col.serverIndex
        );

        if (existing.groupLabel === "" && col.groupLabel !== "") {
          existing.groupLabel = col.groupLabel;
        }

        if (
          existing.groupStyleToken === "default" &&
          col.groupStyleToken !== "default"
        ) {
          existing.groupStyleToken = col.groupStyleToken;
        }

        continue;
      }

      buckets.set(col.groupKey, {
        groupKey: col.groupKey,
        groupLabel: col.groupLabel,
        groupOrder: col.groupOrder,
        groupStyleToken: col.groupStyleToken,
        firstColumnServerIndex: col.serverIndex,
        columns: [col],
      });
    }

    return Array.from(buckets.values()).sort((a, b) => {
      if (a.groupOrder !== b.groupOrder) {
        return a.groupOrder - b.groupOrder;
      }
      return a.firstColumnServerIndex - b.firstColumnServerIndex;
    });
  }, [normalized]);

  const handleExportCsv = (): void => {
    if (visibleColumns.length === 0) {
      message.warning("There are no visible columns to export.");
      return;
    }

    const headerLine = visibleColumns
      .map((col) => escapeCsvCell(col.label))
      .join(",");

    const lines = dataSource.map((row) => {
      return visibleColumns
        .map((col) => {
          const rawValue = row[col.accessor] as PrimitiveCellValue;
          const formatted = formatValue(rawValue, col.format, "");
          return escapeCsvCell(formatted);
        })
        .join(",");
    });

    const csv = [`\uFEFF${headerLine}`, ...lines].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const fileName = `${sanitizeFileName(title)}_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message.success("CSV export complete.");
  };

  const columnMenuItems: MenuProps["items"] = [
    {
      key: "columns",
      label: (
        <div style={{ maxHeight: 420, overflowY: "auto", padding: 8, minWidth: 280 }}>
          <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
            Columns
          </Typography.Text>

          {groupedChooserColumns.map((group, groupIndex) => (
            <div key={group.groupKey} style={{ marginBottom: 12 }}>
              {group.groupLabel !== "" ? (
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 6, fontSize: 12 }}
                >
                  {group.groupLabel}
                </Typography.Text>
              ) : null}

              {group.columns.map((col) => {
                const checked =
                  ctx.state.visibility[col.id] !== undefined
                    ? ctx.state.visibility[col.id]
                    : col.visible;

                return (
                  <div key={col.id} style={{ marginBottom: 4 }}>
                    <Checkbox
                      checked={checked}
                      onChange={(e) =>
                        ctx.setColumnVisibility(col.id, e.target.checked)
                      }
                    >
                      {col.label}
                    </Checkbox>
                  </div>
                );
              })}

              {groupIndex < groupedChooserColumns.length - 1 ? (
                <Divider style={{ margin: "8px 0" }} />
              ) : null}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card
      size="small"
      styles={{
        body: {
          paddingTop: 12,
        },
      }}
      title={
        <Space size="middle" align="center">
          <Typography.Text strong>{title}</Typography.Text>
          <Tag color="blue">{dataSource.length} rows</Tag>
        </Space>
      }
      extra={
        <Space>
          <Dropdown trigger={["click"]} menu={{ items: columnMenuItems }} disabled={isConfigView}>
            <Button icon={<SettingOutlined />}>Columns</Button>
          </Dropdown>

          <Divider type="vertical" />

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="key"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        sticky
        virtual
        scroll={{
          x: scrollX,
          y: height,
        }}
        components={{
          header: {
            cell: HeaderCell,
          },
        }}
      />
    </Card>
  );
};
