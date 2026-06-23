import React from "react";
import { Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DatasetPreviewRow } from "./driverTypes";

const { Text } = Typography;

type PreviewTableRow = DatasetPreviewRow & { __key: number };

interface DatasetPreviewGridProps {
  columns: string[];
  rows: DatasetPreviewRow[];
  rowCount?: number;
}

export function DatasetPreviewGrid({ columns, rows, rowCount }: DatasetPreviewGridProps) {
  const tableColumns: ColumnsType<PreviewTableRow> = columns.slice(0, 12).map((column) => ({
    title: column,
    dataIndex: column,
    key: column,
    width: 140,
    ellipsis: true
  }));

  const dataSource: PreviewTableRow[] = rows.map((row, index) => ({
    ...row,
    __key: index
  }));

  return (
    <Card
      size="small"
      title="Dataset Preview"
      style={{ marginTop: 10 }}
      bodyStyle={{ padding: 10 }}
      extra={<Text type="secondary" style={{ fontSize: 12 }}>{rowCount ?? rows.length} rows</Text>}
    >
      <Table<PreviewTableRow>
        rowKey="__key"
        size="small"
        bordered
        columns={tableColumns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 1200, y: 220 }}
      />
    </Card>
  );
}
