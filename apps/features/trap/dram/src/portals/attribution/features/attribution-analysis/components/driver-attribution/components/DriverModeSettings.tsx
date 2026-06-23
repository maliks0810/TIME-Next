import React from "react";
import { Alert, Col, Form, Input, InputNumber, Row, Segmented, Select, Space, Typography } from "antd";
import type { DriverModeConfig, DriverSourceType, UploadedDatasetState } from "../types/unifiedDriverAttribution";
import { ManualDatasetUpload } from "./ManualDatasetUpload";
import { ColumnMappingPanel } from "./ColumnMappingPanel";
import { validateColumnMapping } from "../utils/driverValidation";

const { Text } = Typography;

interface DriverModeSettingsProps {
  value: DriverModeConfig;
  onChange: (next: DriverModeConfig) => void;
}

const sourceOptions: Array<{ label: string; value: DriverSourceType }> = [
  { label: "Attribution", value: "attribution" },
  { label: "Manual Upload", value: "manual" },
  { label: "Model", value: "model" },
];

export function DriverModeSettings({ value, onChange }: DriverModeSettingsProps): React.ReactElement {
  function update(patch: Partial<DriverModeConfig>): void {
    onChange({ ...value, ...patch });
  }

  function handleDatasetChange(dataset: UploadedDatasetState): void {
    const validation = validateColumnMapping(dataset, value.columnMapping);
    update({
      uploadedDataset: {
        ...dataset,
        validated: validation.valid,
        validationMessages: validation.messages,
      },
    });
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Form layout="vertical">
        <Row gutter={[16, 12]}>
          <Col xs={24} lg={8}>
            <Form.Item label="Driver Source">
              <Segmented<DriverSourceType>
                block
                value={value.sourceType}
                options={sourceOptions}
                onChange={(sourceType) => update({ sourceType })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} lg={8}>
            <Form.Item label="Ranking Metric">
              <Select
                value={value.rankingMetric}
                options={[
                  { label: "Total Effect", value: "totalEffect" },
                  { label: "Allocation Effect", value: "allocationEffect" },
                  { label: "Selection Effect", value: "selectionEffect" },
                  { label: "Interaction Effect", value: "interactionEffect" },
                  { label: "Manual Value", value: "manualValue" },
                ]}
                onChange={(rankingMetric) => update({ rankingMetric })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} lg={8}>
            <Form.Item label="Top / Bottom N">
              <InputNumber min={1} max={50} value={value.topN} onChange={(topN) => update({ topN: topN ?? 10 })} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {value.sourceType === "attribution" ? (
        <Alert type="info" showIcon message="Attribution source uses the system attribution result set and derives top/bottom drivers from the selected ranking metric." />
      ) : null}

      {value.sourceType === "manual" ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <ManualDatasetUpload value={value.uploadedDataset} onChange={handleDatasetChange} />
          <ColumnMappingPanel
            dataset={value.uploadedDataset}
            value={value.columnMapping}
            onChange={(columnMapping) => {
              const validation = validateColumnMapping(value.uploadedDataset, columnMapping);
              update({
                columnMapping,
                uploadedDataset: value.uploadedDataset
                  ? { ...value.uploadedDataset, validated: validation.valid, validationMessages: validation.messages }
                  : value.uploadedDataset,
              });
            }}
          />
        </Space>
      ) : null}

      {value.sourceType === "model" ? (
        <Form layout="vertical">
          <Row gutter={[16, 12]}>
            <Col xs={24} lg={12}>
              <Form.Item label="Model ID">
                <Input value={value.modelId} onChange={(event) => update({ modelId: event.target.value })} placeholder="e.g. factor-driver-v1" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label="Model Endpoint URL">
                <Input value={value.modelEndpointUrl} onChange={(event) => update({ modelEndpointUrl: event.target.value })} placeholder="Configured service endpoint" />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary">Model source is future-ready and uses the same unified response contract.</Text>
        </Form>
      ) : null}
    </Space>
  );
}
