import React from "react";
import { Card, Table, Tag } from "antd";
import { MatrixRow, SnapshotHorizon } from "../api/types";
import { ColumnsType } from "antd/es/table";

type Props = {
  rows: MatrixRow[];
  horizons: SnapshotHorizon[];
};

export function ReturnMatrixTable({
  rows,
  horizons,
}: Props): React.JSX.Element {
  function buildMatrixColumns(
  horizons: SnapshotHorizon[],
  ): ColumnsType<MatrixRow> {
  return [
    { title: "Metric", dataIndex: "metric", key: "metric" },
    ...horizons.map((h) => ({
    title: h.label,
    key: h.key,
    render: (_: unknown, row: MatrixRow) => {
      const val = row.values[h.key];
      if (typeof val !== "number") return <Tag>—</Tag>;

      const color = val > 0 ? "green" : val < 0 ? "red" : "default";
      return <Tag color={color}>{val.toFixed(2)}%</Tag>;
    },
    })),
  ];
  }
  return (
    <Card title="Return Matrix" size="small" style={{ marginTop: 16 }}>
      <Table<MatrixRow>
        rowKey="key"
        columns={buildMatrixColumns(horizons)}
        dataSource={rows}
        pagination={false}
        size="small"
        scroll={{ x: true }}
      />
    </Card>
  );
}
