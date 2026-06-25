import React from "react";
import { Alert, Card, Col, Form, Row, Select, Space, Tag, Typography } from "antd";
import type { DriverColumnMapping, UploadedDatasetState } from "../types/unifiedDriverAttribution";
import { validateColumnMapping } from "../utils/driverValidation";

const { Text } = Typography;

interface ColumnMappingPanelProps {
  dataset?: UploadedDatasetState;
  value?: DriverColumnMapping;
  onChange: (next: DriverColumnMapping) => void;
}

const emptyMapping: DriverColumnMapping = {
  group: "",
  period: "",
  value: "",
};

export function ColumnMappingPanel({ dataset, value, onChange }: ColumnMappingPanelProps): React.ReactElement {
  const mapping = value ?? emptyMapping;
  const validation = validateColumnMapping(dataset, mapping);
  const options = (dataset?.columns ?? []).map((column) => ({ label: column, value: column }));

  function update(field: keyof DriverColumnMapping, selected: string): void {
    onChange({ ...mapping, [field]: selected });
  }

  return (
    <Card size="small" title="Column Mapping" extra={<Tag color={validation.valid ? "green" : "orange"}>{validation.valid ? "Validated" : "Not Validated"}</Tag>}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Form layout="vertical">
          <Row gutter={[16, 12]}>
            <Col xs={24} lg={8}>
              <Form.Item label="Group" required>
                <Select value={mapping.group || undefined} options={options} placeholder="sector / issuer / security" onChange={(selected) => update("group", selected)} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Period" required>
                <Select value={mapping.period || undefined} options={options} placeholder="period" onChange={(selected) => update("period", selected)} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Value" required>
                <Select value={mapping.value || undefined} options={options} placeholder="driver score / contribution" onChange={(selected) => update("value", selected)} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Allocation Effect">
                <Select allowClear value={mapping.allocation} options={options} onChange={(selected) => update("allocation", selected)} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Selection Effect">
                <Select allowClear value={mapping.selection} options={options} onChange={(selected) => update("selection", selected)} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Interaction Effect">
                <Select allowClear value={mapping.interaction} options={options} onChange={(selected) => update("interaction", selected)} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {validation.messages.length > 0 ? (
          <Alert type="warning" showIcon message="Validation messages" description={<ul style={{ marginBottom: 0 }}>{validation.messages.map((message) => <li key={message}>{message}</li>)}</ul>} />
        ) : (
          <Text type="secondary">Required fields are mapped and ready for analysis.</Text>
        )}
      </Space>
    </Card>
  );
}
