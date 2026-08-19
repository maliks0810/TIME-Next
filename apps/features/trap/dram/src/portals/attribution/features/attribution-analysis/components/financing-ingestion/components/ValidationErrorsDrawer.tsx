import React from "react";
import { Drawer, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { FinancingErrorDto } from "../types";

export interface ValidationErrorsDrawerProps {
  open: boolean;
  loading: boolean;
  errors: FinancingErrorDto[];
  onClose: () => void;
}

export const ValidationErrorsDrawer: React.FC<ValidationErrorsDrawerProps> = ({
  open,
  loading,
  errors,
  onClose,
}) => {
  const columns: ColumnsType<FinancingErrorDto> = [
    { title: "Sheet", dataIndex: "sheet_name", width: 140 },
    { title: "Excel row", dataIndex: "excel_row_number", width: 100, align: "right" },
    { title: "Portfolio", dataIndex: "portfolio_key", width: 120 },
    {
      title: "Code",
      dataIndex: "error_code",
      width: 180,
      render: (value: string) => <Tag color="red">{value}</Tag>,
    },
    { title: "Message", dataIndex: "error_message" },
  ];

  return (
    <Drawer title="Validation errors" open={open} onClose={onClose} width={900}>
      <Table<FinancingErrorDto>
        rowKey="error_id"
        dataSource={errors}
        loading={loading}
        columns={columns}
        pagination={{ pageSize: 20 }}
      />
    </Drawer>
  );
};
