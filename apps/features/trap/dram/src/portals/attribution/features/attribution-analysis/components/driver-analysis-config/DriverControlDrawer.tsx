import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message
} from "antd";
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SlidersOutlined,
  UploadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnMapping, DriverAnalysisFormState, DriverMetric } from "./driverTypes";
import { DatasetColumnMapping } from "./DatasetColumnMapping";
import { DatasetPreviewGrid } from "./DatasetPreviewGrid";
import { uploadDriverDataset, validateDriverDataset } from "./api/datasetApi";

const { Text, Title } = Typography;

interface DriverControlDrawerProps {
  open: boolean;
  value: DriverAnalysisFormState;
  loading?: boolean;
  onClose: () => void;
  onRun: (value: DriverAnalysisFormState) => void;
  onChange: (value: DriverAnalysisFormState) => void;
}

const periodOptions = ["DTD", "MTD", "QTD", "YTD", "FYTD", "1Y", "3Y", "5Y", "10Y", "SI"].map((value) => ({ label: value, value }));

const groupByOptions = [
  { label: "Asset Class", value: "assetClass" },
  { label: "Sector", value: "sector" },
  { label: "Industry", value: "industry" },
  { label: "Country", value: "country" },
  { label: "Currency", value: "currency" },
  { label: "Issuer", value: "issuer" },
  { label: "Security", value: "security" },
  { label: "Rating", value: "rating" },
  { label: "Maturity Bucket", value: "maturityBucket" },
  { label: "Factor", value: "factor" }
];

const metricOptions: DriverMetric[] = [
  { name: "portfolio_contribution", label: "Portfolio Contribution", format: "bps" },
  { name: "benchmark_contribution", label: "Benchmark Contribution", format: "bps" },
  { name: "active_contribution", label: "Active Contribution", format: "bps" },
  { name: "allocation_effect", label: "Allocation Effect", format: "bps" },
  { name: "selection_effect", label: "Selection Effect", format: "bps" },
  { name: "interaction_effect", label: "Interaction Effect", format: "bps" },
  { name: "total_effect", label: "Total Effect", format: "bps" },
  { name: "pnl_contribution_usd", label: "P&L Contribution USD", format: "usd" },
  { name: "tracking_error_contribution", label: "Tracking Error Contribution", format: "percent" },
  { name: "var_contribution", label: "VaR Contribution", format: "usd" }
];

const componentOptions = [
  { label: "Allocation Effect", value: "allocation_effect" },
  { label: "Selection Effect", value: "selection_effect" },
  { label: "Interaction Effect", value: "interaction_effect" },
  { label: "Portfolio Contribution", value: "portfolio_contribution" },
  { label: "Benchmark Contribution", value: "benchmark_contribution" },
  { label: "Active Contribution", value: "active_contribution" },
  { label: "Currency Effect", value: "currency_effect" },
  { label: "Duration Effect", value: "duration_effect" },
  { label: "Spread Effect", value: "spread_effect" }
];

const compactCardStyle: React.CSSProperties = {
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #d8dee9"
};

const compactCardBodyStyle: React.CSSProperties = { padding: 10 };

const autoMapColumn = (columns: string[], candidates: string[]) => {
  const normalized = columns.map((column) => ({
    original: column,
    normalized: column.toLowerCase().replace(/[^a-z0-9]/g, "")
  }));

  for (const candidate of candidates) {
    const target = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = normalized.find((column) => column.normalized === target);
    if (match) return match.original;
  }

  return undefined;
};

export function DriverControlDrawer({ open, value, loading, onClose, onRun, onChange }: DriverControlDrawerProps) {
  const [form] = Form.useForm<DriverAnalysisFormState>();
  const uploadState = value.datasetSource.uploadState;
  const validationStatus = uploadState?.validationStatus ?? "NotValidated";

  React.useEffect(() => {
    form.setFieldsValue(value);
  }, [value, form]);

  const updateDatasetSource = (nextDatasetSource: DriverAnalysisFormState["datasetSource"]) => {
    onChange({
      ...value,
      datasetSource: nextDatasetSource
    });
  };

  const handleValuesChange = (_: unknown, allValues: DriverAnalysisFormState) => {
    const merged: DriverAnalysisFormState = {
      ...value,
      ...allValues,
      datasetSource: {
        ...value.datasetSource,
        ...allValues.datasetSource
      }
    };
    onChange(merged);
  };

  const handleRun = async () => {
    const values = await form.validateFields();
    if (!values.periods || values.periods.length === 0) {
      message.error("Please select at least one period.");
      return;
    }

    const nextDatasetSource = {
      ...value.datasetSource,
      ...values.datasetSource
    };

    if (nextDatasetSource.type === "uploaded_file" && nextDatasetSource.uploadState?.validationStatus !== "Valid") {
      message.error("Please upload and validate the dataset before running analysis.");
      return;
    }

    onRun({
      ...value,
      ...values,
      datasetSource: nextDatasetSource
    });
  };

  const handleUploadDataset = async (file: File) => {
    try {
      message.loading({ content: "Uploading dataset...", key: "upload-dataset" });

      const response = await uploadDriverDataset(file);

      updateDatasetSource({
        ...value.datasetSource,
        type: "uploaded_file",
        uploadedFile: {
          datasetId: response.datasetId,
          fileName: response.fileName
        },
        uploadState: {
          datasetId: response.datasetId,
          fileName: response.fileName,
          rowCount: response.rowCount,
          columns: response.columns,
          previewRows: response.previewRows,
          validationStatus: "NotValidated",
          validationErrors: [],
          validationWarnings: []
        }
      });

      message.success({ content: "Dataset uploaded. Review mapping and run validation.", key: "upload-dataset" });
    } catch (error) {
      message.error({ content: error instanceof Error ? error.message : "Dataset upload failed.", key: "upload-dataset" });
    }
  };

  const handleValidateDataset = async () => {
    const currentValues = form.getFieldsValue();
    const datasetId = value.datasetSource.uploadState?.datasetId;

    if (!datasetId) {
      message.error("Upload a dataset before validation.");
      return;
    }

    try {
      updateDatasetSource({
        ...value.datasetSource,
        uploadState: {
          ...value.datasetSource.uploadState!,
          validationStatus: "Validating"
        }
      });

      const response = await validateDriverDataset({
        datasetId,
        metric: currentValues.metric.name,
        groupBy: currentValues.groupBy,
        periods: currentValues.periods,
        columnMapping: value.datasetSource.columnMapping,
        columns: value.datasetSource.uploadState?.columns,
        rowCount: value.datasetSource.uploadState?.rowCount
      });

      updateDatasetSource({
        ...value.datasetSource,
        uploadState: {
          ...value.datasetSource.uploadState!,
          validationStatus: response.status,
          validationErrors: response.errors,
          validationWarnings: response.warnings
        }
      });

      if (response.status === "Valid") {
        message.success("Dataset validation passed.");
      } else {
        message.error("Dataset validation failed.");
      }
    } catch (error) {
      updateDatasetSource({
        ...value.datasetSource,
        uploadState: {
          ...value.datasetSource.uploadState!,
          validationStatus: "Invalid",
          validationErrors: [error instanceof Error ? error.message : "Dataset validation failed."],
          validationWarnings: []
        }
      });
      message.error(error instanceof Error ? error.message : "Dataset validation failed.");
    }
  };

  const handleAutoMapColumns = () => {
    const columns = value.datasetSource.uploadState?.columns ?? [];

    const columnMapping: ColumnMapping = {
      portfolioId: autoMapColumn(columns, ["portfolio_id", "portfolioId", "portfolio"]),
      asOfDate: autoMapColumn(columns, ["as_of_date", "asOfDate", "asofdate"]),
      period: autoMapColumn(columns, ["period"]),
      sector: autoMapColumn(columns, ["sector", "gics_sector"]),
      industry: autoMapColumn(columns, ["industry", "gics_industry"]),
      country: autoMapColumn(columns, ["country"]),
      currency: autoMapColumn(columns, ["currency", "ccy"]),
      issuer: autoMapColumn(columns, ["issuer", "issuer_name"]),
      security: autoMapColumn(columns, ["security", "security_name", "securityName"]),
      portfolioWeight: autoMapColumn(columns, ["portfolio_weight", "portfolioWeight", "port_weight", "portfolio_wt"]),
      benchmarkWeight: autoMapColumn(columns, ["benchmark_weight", "benchmarkWeight", "bench_weight", "benchmark_wt"]),
      portfolioReturn: autoMapColumn(columns, ["portfolio_return", "portfolioReturn", "port_return"]),
      benchmarkReturn: autoMapColumn(columns, ["benchmark_return", "benchmarkReturn", "bench_return"]),
      allocationEffect: autoMapColumn(columns, ["allocation_effect", "allocationEffect"]),
      selectionEffect: autoMapColumn(columns, ["selection_effect", "selectionEffect"]),
      interactionEffect: autoMapColumn(columns, ["interaction_effect", "interactionEffect"]),
      totalEffect: autoMapColumn(columns, ["total_effect", "totalEffect"]),
      pnlContributionUsd: autoMapColumn(columns, ["pnl_contribution_usd", "pnlContributionUsd"]),
      trackingErrorContribution: autoMapColumn(columns, ["tracking_error_contribution", "trackingErrorContribution"]),
      varContribution: autoMapColumn(columns, ["var_contribution", "varContribution"])
    };

    updateDatasetSource({
      ...value.datasetSource,
      columnMapping,
      uploadState: {
        ...value.datasetSource.uploadState!,
        validationStatus: "NotValidated"
      }
    });

    message.success("Columns auto-mapped. Review mapping and run validation.");
  };

  const datasetType = Form.useWatch(["datasetSource", "type"], form);

  return (
    <Drawer  style={{ marginTop: 65, marginBottom:40 }}
      title={
        <Space direction="vertical" size={0}>
          <Space size={6}>
            <SlidersOutlined style={{ color: "#1d4ed8" }} />
            <Title level={5} style={{ margin: 0 }}>Configure Driver Analysis</Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>Scope, dataset, metric, grouping, filters, and ranking.</Text>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={680}
      destroyOnClose={false}
      extra={
        <Space size={6}>
          <Button size="small" icon={<SaveOutlined />}>Save</Button>
          <Button size="small" type="primary" icon={<PlayCircleOutlined />} loading={loading} onClick={handleRun}>Run</Button>
        </Space>
      }
      styles={{
        header: { padding: "10px 14px", borderBottom: "1px solid #d8dee9" },
        body: { background: "#f3f6fb", padding: 12 },
        footer: { padding: "8px 12px" }
      }}
    >
      <Form form={form} layout="vertical" initialValues={value} onValuesChange={handleValuesChange}>
        <Card title="Analysis Scope" size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item label="Portfolio" name="portfolioId" rules={[{ required: true, message: "Portfolio is required" }]}>
                <Select size="small" showSearch placeholder="Select portfolio" options={[
                  { label: "6614T — Core Balanced", value: "6614T" },
                  { label: "6614T-01 — Equity Sleeve", value: "6614T-01" },
                  { label: "6614T-02 — FI Sleeve", value: "6614T-02" }
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="As-of Date"
                name="asOfDate"
                rules={[{ required: true, message: "As-of date is required" }]}
                getValueProps={(date) => ({ value: date ? dayjs(date) : undefined })}
                normalize={(date) => (date && dayjs.isDayjs(date) ? date.format("YYYY-MM-DD") : date)}
              >
                <DatePicker size="small" style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Periods" name="periods" rules={[{ required: true, type: "array", min: 1, message: "Please select at least one period." }]}>
                <Select size="small" mode="multiple" placeholder="Select periods" options={periodOptions} maxTagCount="responsive" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Dataset Source"
          size="small"
          style={compactCardStyle}
          bodyStyle={compactCardBodyStyle}
          extra={datasetType === "platform" ? <DatabaseOutlined /> : datasetType === "uploaded_file" ? <CloudUploadOutlined /> : <ApiOutlined />}
        >
          <Form.Item name={["datasetSource", "type"]} label="Source Type">
            <Radio.Group size="small" optionType="button" buttonStyle="solid" options={[
              { label: "System", value: "platform" },
              { label: "Upload", value: "uploaded_file" }
            ]} />
          </Form.Item>

          {datasetType === "platform" && <Alert type="info" showIcon message="Using system analytics data" description="Loads from Azure SQL, Snowflake, or analytics cache." />}

          {datasetType === "uploaded_file" && (
            <>
              <Upload
                beforeUpload={(file) => {
                  void handleUploadDataset(file);
                  return false;
                }}
                maxCount={1}
              >
                <Button size="small" icon={<UploadOutlined />}>Upload CSV / Excel / Parquet</Button>
              </Upload>

              {uploadState?.fileName && (
                <Alert
                  style={{ marginTop: 10 }}
                  type={validationStatus === "Valid" ? "success" : validationStatus === "Invalid" ? "error" : "info"}
                  showIcon
                  icon={validationStatus === "Valid" ? <CheckCircleOutlined /> : validationStatus === "Invalid" ? <ExclamationCircleOutlined /> : undefined}
                  message={
                    <Space wrap>
                      <span>{uploadState.fileName}</span>
                      <Tag>{uploadState.rowCount ?? 0} rows</Tag>
                      <Tag>{validationStatus}</Tag>
                    </Space>
                  }
                  description={validationStatus === "Valid" ? "Dataset is valid and ready for analysis." : "Preview data, map columns, and run validation before analysis."}
                />
              )}

              {uploadState?.previewRows && uploadState.previewRows.length > 0 && (
                <DatasetPreviewGrid columns={uploadState.columns} rows={uploadState.previewRows} rowCount={uploadState.rowCount} />
              )}

              {uploadState?.columns && uploadState.columns.length > 0 && (
                <DatasetColumnMapping
                  columns={uploadState.columns}
                  value={value.datasetSource.columnMapping}
                  onChange={(columnMapping) => updateDatasetSource({
                    ...value.datasetSource,
                    columnMapping,
                    uploadState: {
                      ...value.datasetSource.uploadState!,
                      validationStatus: "NotValidated"
                    }
                  })}
                />
              )}

              {uploadState?.columns && uploadState.columns.length > 0 && (
                <Space style={{ marginTop: 10 }}>
                  <Button size="small" onClick={handleAutoMapColumns}>Auto Map Columns</Button>
                  <Button size="small" type="primary" ghost loading={validationStatus === "Validating"} onClick={handleValidateDataset}>
                    Run Validate
                  </Button>
                </Space>
              )}

              {uploadState?.validationErrors && uploadState.validationErrors.length > 0 && (
                <Alert
                  style={{ marginTop: 10 }}
                  type="error"
                  showIcon
                  message="Validation Errors"
                  description={<ul style={{ marginBottom: 0, paddingLeft: 18 }}>{uploadState.validationErrors.map((error) => <li key={error}>{error}</li>)}</ul>}
                />
              )}

              {uploadState?.validationWarnings && uploadState.validationWarnings.length > 0 && (
                <Alert
                  style={{ marginTop: 10 }}
                  type="warning"
                  showIcon
                  message="Validation Warnings"
                  description={<ul style={{ marginBottom: 0, paddingLeft: 18 }}>{uploadState.validationWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
                />
              )}
            </>
          )}

        </Card>

        <Card title="Metric and Ranking" size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item label="Metric" name={["metric", "name"]} rules={[{ required: true, message: "Metric is required" }]}>
                <Select size="small" showSearch placeholder="Select metric" options={metricOptions.map((metric) => ({ label: metric.label, value: metric.name }))} onChange={(metricName) => {
                  const selectedMetric = metricOptions.find((x) => x.name === metricName);
                  if (selectedMetric) {
                    const currentValues = form.getFieldsValue();
                    form.setFieldsValue({ ...currentValues, metric: selectedMetric });
                    onChange({ ...value, ...currentValues, datasetSource: { ...value.datasetSource, ...currentValues.datasetSource }, metric: selectedMetric });
                  }
                }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Format" name={["metric", "format"]}>
                <Select size="small" options={[{ label: "Bps", value: "bps" }, { label: "%", value: "percent" }, { label: "USD", value: "usd" }, { label: "Number", value: "number" }]} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Group By" name="groupBy" rules={[{ required: true, type: "array", min: 1, message: "Please select at least one grouping." }]}>
                <Select size="small" mode="multiple" placeholder="Select groupings" options={groupByOptions} maxTagCount="responsive" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Space align="baseline" size={6}>
                <Form.Item label="Top" name={["top", "enabled"]} valuePropName="checked"><Switch size="small" /></Form.Item>
                <Form.Item label="Top N" name={["top", "limit"]}><InputNumber size="small" min={1} max={100} /></Form.Item>
              </Space>
            </Col>
            <Col span={12}>
              <Space align="baseline" size={6}>
                <Form.Item label="Bottom" name={["bottom", "enabled"]} valuePropName="checked"><Switch size="small" /></Form.Item>
                <Form.Item label="Bottom N" name={["bottom", "limit"]}><InputNumber size="small" min={1} max={100} /></Form.Item>
              </Space>
            </Col>
            <Col span={24}>
              <Form.Item label="Components" name="includeComponents">
                <Select size="small" mode="multiple" placeholder="Component columns" options={componentOptions} maxTagCount="responsive" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Min Abs Value" name="minimumAbsoluteValue">
                <InputNumber size="small" min={0} step={0.000001} style={{ width: "100%" }} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Filters" size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item label="Asset Class" name={["filters", "assetClass"]}>
                <Select size="small" mode="multiple" allowClear placeholder="All" options={["Equity", "Fixed Income", "EMFI", "Cash", "FX Overlay"].map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Currency" name={["filters", "currency"]}>
                <Select size="small" mode="multiple" allowClear placeholder="All" options={["USD", "EUR", "MXN", "BRL"].map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Country" name={["filters", "country"]}>
                <Select size="small" mode="multiple" allowClear placeholder="All" options={["United States", "Mexico", "Brazil", "Germany"].map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Sector" name={["filters", "sector"]}>
                <Select size="small" mode="multiple" allowClear placeholder="All" options={["Technology", "Energy", "Financials", "Health Care"].map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "4px 0 8px" }} />
          <Alert type="info" showIcon message="Saved-view ready" description="Controls can be persisted into saved views or route state for workspace handoff." />
        </Card>
      </Form>
    </Drawer>
  );
}
