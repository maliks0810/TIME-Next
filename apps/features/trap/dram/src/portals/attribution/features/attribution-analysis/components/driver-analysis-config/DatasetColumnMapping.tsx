import React from "react";
import { Card, Col, Row, Select, Typography } from "antd";
import type { ColumnMapping } from "./driverTypes";

const { Text } = Typography;

interface DatasetColumnMappingProps {
  columns: string[];
  value?: ColumnMapping;
  onChange: (value: ColumnMapping) => void;
}

const expectedFields: Array<{
  key: keyof ColumnMapping;
  label: string;
  required?: boolean;
}> = [
  { key: "portfolioId", label: "Portfolio ID" },
  { key: "asOfDate", label: "As Of Date" },
  { key: "period", label: "Period", required: true },
  { key: "sector", label: "Sector" },
  { key: "industry", label: "Industry" },
  { key: "country", label: "Country" },
  { key: "currency", label: "Currency" },
  { key: "issuer", label: "Issuer" },
  { key: "security", label: "Security" },
  { key: "portfolioWeight", label: "Portfolio Weight" },
  { key: "benchmarkWeight", label: "Benchmark Weight" },
  { key: "portfolioReturn", label: "Portfolio Return" },
  { key: "benchmarkReturn", label: "Benchmark Return" },
  { key: "allocationEffect", label: "Allocation Effect" },
  { key: "selectionEffect", label: "Selection Effect" },
  { key: "interactionEffect", label: "Interaction Effect" },
  { key: "totalEffect", label: "Total Effect" },
  { key: "pnlContributionUsd", label: "P&L Contribution USD" },
  { key: "trackingErrorContribution", label: "Tracking Error Contribution" },
  { key: "varContribution", label: "VaR Contribution" }
];

export function DatasetColumnMapping({ columns, value, onChange }: DatasetColumnMappingProps) {
  const options = columns.map((column) => ({ label: column, value: column }));

  const updateField = (key: keyof ColumnMapping, selected?: string) => {
    onChange({
      ...value,
      [key]: selected
    });
  };

  return (
    <Card size="small" title="Column Mapping" style={{ marginTop: 10 }} bodyStyle={{ padding: 10 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Map uploaded columns to expected driver fields. Required fields depend on metric and grouping.
      </Text>
      <div style={{ height: 8 }} />
      <Row gutter={[8, 8]}>
        {expectedFields.map((field) => (
          <Col span={12} key={field.key}>
            <Text style={{ fontSize: 12 }}>
              {field.label}{field.required ? " *" : ""}
            </Text>
            <Select
              size="small"
              allowClear
              showSearch
              style={{ width: "100%", marginTop: 2 }}
              placeholder="Select column"
              options={options}
              value={value?.[field.key]}
              onChange={(selected) => updateField(field.key, selected)}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
