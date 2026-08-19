import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FinancingIngestionApi } from "../FinancingIngestionApi";
import type { FinancingMonthlyRow, FinancingSourceType } from "../types";

const money = (value: string): string => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
const bps = (value: string): string => Number(value).toFixed(3);

export const FinancingMonthlyPreview: React.FC = () => {
  const [sourceType, setSourceType] = useState<FinancingSourceType | undefined>();
  const [portfolioKey, setPortfolioKey] = useState<string>("");
  const [rows, setRows] = useState<FinancingMonthlyRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await FinancingIngestionApi.getMonthly({
        sourceType,
        portfolioKey: portfolioKey || undefined,
        limit: 500,
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [sourceType]);

  const columns: ColumnsType<FinancingMonthlyRow> = [
    { title: "Source", dataIndex: "source_type", width: 100 },
    { title: "Portfolio", dataIndex: "portfolio_key", width: 120 },
    { title: "Month End", dataIndex: "month_end_date", width: 120 },
    { title: "Basis", dataIndex: "value_basis", width: 140 },
    { title: "Base Value", dataIndex: "total_base_value", align: "right", render: money },
    { title: "Financing Amount", dataIndex: "financing_amount", align: "right", render: money },
    { title: "Financing Bps", dataIndex: "financing_bps", align: "right", render: bps },
  ];

  return (
    <Card title="Monthly financing preview">
      <Space style={{ marginBottom: 16 }} wrap>
        <Form.Item label="Source" style={{ marginBottom: 0 }}>
          <Select<FinancingSourceType | undefined>
            allowClear
            style={{ width: 180 }}
            value={sourceType}
            onChange={setSourceType}
            options={[
              { value: "TBA", label: "TBA" },
              { value: "FUTURES", label: "Futures" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Portfolio" style={{ marginBottom: 0 }}>
          <Input.Search
            allowClear
            style={{ width: 220 }}
            value={portfolioKey}
            onChange={(event) => setPortfolioKey(event.target.value)}
            onSearch={() => void load()}
            placeholder="e.g. 702T"
          />
        </Form.Item>
      </Space>
      <Table<FinancingMonthlyRow>
        rowKey={(row) => `${row.source_type}-${row.portfolio_key}-${row.month_end_date}`}
        dataSource={rows}
        loading={loading}
        columns={columns}
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );
};
