import React from "react";
import { Alert, Button, Card, Space, Table, Tag, Typography, Upload } from "antd";
import type { RcFile } from "antd/es/upload";
import { UploadOutlined } from "@ant-design/icons";
import type { GridRow, UploadedDatasetState } from "../types/unifiedDriverAttribution";
import { parseCsv } from "../utils/csv";
import { buildDatasetState } from "../utils/driverValidation";

const { Text } = Typography;

interface ManualDatasetUploadProps {
  value?: UploadedDatasetState;
  onChange: (dataset: UploadedDatasetState) => void;
}

function datasetIdFromFile(file: RcFile): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function ManualDatasetUpload({ value, onChange }: ManualDatasetUploadProps): React.ReactElement {
  async function beforeUpload(file: RcFile): Promise<boolean> {
    const text = await file.text();
    const parsed = parseCsv(text);
    onChange(buildDatasetState(datasetIdFromFile(file), file.name, parsed.columns, parsed.rows));
    return false;
  }

  const previewColumns = (value?.columns ?? []).slice(0, 8).map((column) => ({
    title: column,
    dataIndex: column,
    key: column,
    width: 140,
    ellipsis: true,
  }));

  const previewRows = (value?.rows ?? []).slice(0, 20).map((row: GridRow, index) => ({ key: String(index), ...row }));

  return (
    <Card size="small" title="Dataset Source">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Upload beforeUpload={beforeUpload} maxCount={1} accept=".csv,text/csv" showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload CSV</Button>
        </Upload>

        {value ? (
          <Alert
            type={value.validated ? "success" : "info"}
            showIcon
            message={
              <Space>
                <Text>{value.fileName}</Text>
                <Tag>{value.rowCount} rows</Tag>
                <Tag color={value.validated ? "green" : "orange"}>{value.validated ? "Validated" : "Not Validated"}</Tag>
              </Space>
            }
            description="Preview data, map columns, and run validation before analysis."
          />
        ) : null}

        {value ? (
          <Card size="small" title="Dataset Preview" extra={`${value.rowCount} rows`}>
            <Table size="small" columns={previewColumns} dataSource={previewRows} pagination={false} scroll={{ x: true, y: 220 }} />
          </Card>
        ) : null}
      </Space>
    </Card>
  );
}
