import React from "react";
import { Alert, Button, Card, Col, Form, Row, Select, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
import type { FinancingSourceType } from "../types";

export interface IngestUploadCardProps {
  sourceType: FinancingSourceType;
  fileList: UploadFile[];
  loading: boolean;
  onSourceTypeChange: (value: FinancingSourceType) => void;
  onFileListChange: (files: UploadFile[]) => void;
  onUpload: () => void;
}

export const IngestUploadCard: React.FC<IngestUploadCardProps> = ({
  sourceType,
  fileList,
  loading,
  onSourceTypeChange,
  onFileListChange,
  onUpload,
}) => {
  return (
    <Card title="Financing Data Ingestion">
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Upload monthly TBA or Futures financing workbooks and ingest them into the normalized financing monthly table."
      />
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form layout="vertical">
            <Form.Item label="Source type">
              <Select<FinancingSourceType>
                value={sourceType}
                onChange={onSourceTypeChange}
                options={[
                  { value: "TBA", label: "TBA Financing" },
                  { value: "FUTURES", label: "Futures Financing" },
                ]}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col xs={24} md={16}>
          <Upload.Dragger
            accept=".xlsx"
            maxCount={1}
            fileList={fileList}
            beforeUpload={(file) => {
              if (!file.name.toLowerCase().endsWith(".xlsx")) {
                message.error("Only .xlsx files are supported.");
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
            onChange={({ fileList: next }) => onFileListChange(next)}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Drop financing workbook here</p>
            <p className="ant-upload-hint">Select TBA or Futures before ingesting.</p>
          </Upload.Dragger>
        </Col>
      </Row>
      <Button
        type="primary"
        loading={loading}
        disabled={fileList.length === 0}
        onClick={onUpload}
        style={{ marginTop: 16 }}
      >
        Validate and ingest
      </Button>
    </Card>
  );
};
