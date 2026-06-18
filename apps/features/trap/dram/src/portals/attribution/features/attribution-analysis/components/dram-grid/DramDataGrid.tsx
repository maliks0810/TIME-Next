import React, { useMemo } from "react";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DownloadOutlined,
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

interface DramDataGridProps {
  config: GridConfigResponse;
  rows: Record<string, string | number | null | undefined>[];
  accessorOverrides?: Record<string, string>;
  height?: number;
  title?: string;
  storageKey?: string;
  isConfigView: boolean;
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
type TreeRow = Record<string, unknown> & {
  key?: string;
  children?: TreeRow[];
};

export const mapRowsToTreeTableRows = (
  rows: TreeRow[],
  parentKey = "row"
): TreeRow[] => {
  return rows.map((row, index) => {
    const nextKey = row.key ?? `${parentKey}-${index}`;

    const mapped: TreeRow = {
      ...row,
      key: nextKey,
    };

    if (Array.isArray(row.children) && row.children.length > 0) {
      mapped.children = mapRowsToTreeTableRows(row.children, nextKey);
    }

    return mapped;
  });
};
export const DramDataGrid: React.FC<DramDataGridProps> = ({
  config,
  rows,
  accessorOverrides,
  height = 600,
  title = "Analytics Grid",
  // isConfigView,
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
      virtual={false}
      scroll={{
        x: scrollX,
        y: height,
      }}
      expandable={{
        childrenColumnName: "children",
        defaultExpandAllRows: true,

        rowExpandable: (record) =>
          Array.isArray((record as { children?: unknown[] }).children) &&
          (record as { children?: unknown[] }).children!.length > 0,
      }}
    />
    </Card>
  );
};
