import React from "react";
import { Button, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { FinancingBatchDto, IngestStatus } from "../types";

const statusColor = (status: IngestStatus): string => {
  if (status === "COMPLETED") return "green";
  if (status === "COMPLETED_WITH_ERRORS") return "orange";
  if (status === "FAILED") return "red";
  return "blue";
};

const sourceColor = (source: string): string => source === "TBA" ? "blue" : "cyan";

export interface BatchStatusTableProps {
  batches: FinancingBatchDto[];
  loading: boolean;
  onViewErrors: (batch: FinancingBatchDto) => void;
  onRefresh: () => void;
}

export const BatchStatusTable: React.FC<BatchStatusTableProps> = ({
  batches,
  loading,
  onViewErrors,
  onRefresh,
}) => {
  const columns: ColumnsType<FinancingBatchDto> = [
    {
      title: "Source",
      dataIndex: "source_type",
      render: (value: string) => <Tag color={sourceColor(value)}>{value}</Tag>,
    },
    { title: "File", dataIndex: "original_file_name", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: IngestStatus) => <Tag color={statusColor(value)}>{value}</Tag>,
    },
    { title: "Sheets", dataIndex: "sheet_count", align: "right" },
    { title: "Raw", dataIndex: "raw_row_count", align: "right" },
    { title: "Valid", dataIndex: "valid_row_count", align: "right" },
    { title: "Errors", dataIndex: "error_row_count", align: "right" },
    { title: "Duplicates", dataIndex: "duplicate_row_count", align: "right" },
    {
      title: "Actions",
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => onViewErrors(row)} disabled={row.error_row_count === 0}>
            Errors
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<FinancingBatchDto>
      title={() => (
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Recent ingestion batches</strong>
          <Button size="small" onClick={onRefresh}>Refresh</Button>
        </Space>
      )}
      rowKey="batch_id"
      loading={loading}
      dataSource={batches}
      columns={columns}
      pagination={{ pageSize: 10 }}
    />
  );
};
