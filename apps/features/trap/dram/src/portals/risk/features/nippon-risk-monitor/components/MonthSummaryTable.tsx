import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MonthRow } from "../lib/types";

type Props = {
  data: MonthRow[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
};

export const MonthlySummaryTable: React.FC<Props> = ({
  data,
  selectedMonth,
  onSelectMonth,
}) => {
  const columns: ColumnsType<MonthRow> = [
    { title: "Month", dataIndex: "month_name" },
    { title: "Total Reports", dataIndex: "total_reports" },
    {
      title: "Status",
      render: (_, record) =>
        record.is_validated ? "✅ Validated" : "Pending",
    },
  ];

  return (
    <Table<MonthRow>
      dataSource={data}
      columns={columns}
      pagination={false}
      onRow={(record) => ({
        onClick: () => onSelectMonth(record.month_name),
      })}
      rowClassName={(record) => {
        const isSelected = record.month_name === selectedMonth;
        const isValidated = record.is_validated;

        if (isSelected && isValidated) return "row-selected-validated";
        if (isSelected) return "row-selected";
        if (isValidated) return "row-validated";
        return "";
      }}
    />
  );
};