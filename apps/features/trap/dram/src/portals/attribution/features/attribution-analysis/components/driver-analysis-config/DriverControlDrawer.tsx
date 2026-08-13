import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import {
  ApartmentOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  HolderOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SlidersOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  ColumnMapping,
  DriverAnalysisFormState,
} from "./driverTypes";
import type { DriverColumnConfigState } from "./columnConfigTypes";
import { ColumnConfigurator } from "./ColumnConfigurator";
import { DatasetColumnMapping } from "./DatasetColumnMapping";
import { DatasetPreviewGrid } from "./DatasetPreviewGrid";
import { SavedViewsPanel } from "./SavedViewsPanel";
import {
  buildDefaultSavedViewName,
  type DriverSavedView,
} from "./savedViewsStorage";
import { uploadDriverDataset, validateDriverDataset } from "./api/datasetApi";
import {
  buildGroupedDimensionSelectOptionsFromConfig,
  getDefaultAttributionDimensionsFromConfig,
  type AttributionAssetClass,
  type DriverAnalysisConfigResponse
} from "./api/configApi";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface DriverControlDrawerProps {
  open: boolean;
  value: DriverAnalysisFormState;
  loading?: boolean;
  columnConfig: DriverColumnConfigState;
  configOptions: DriverAnalysisConfigResponse;
  savedViews: DriverSavedView[];
  activeSavedViewId?: string;
  favoriteSavedViewId?: string;
  onColumnConfigChange: (next: DriverColumnConfigState) => void;
  onSaveView: (
    name: string,
    description?: string,
    formState?: DriverAnalysisFormState,
  ) => void;
  onDeleteView: (viewId: string) => void;
  onSetFavoriteView: (viewId: string | undefined) => void;
  onClose: () => void;
  onRun: (value: DriverAnalysisFormState) => void;
  onChange: (value: DriverAnalysisFormState) => void;
  onLoadView: (viewId: string, options?: { autoRun?: boolean }) => void;
}

// Option lists are served by the configuration API and supplied via configOptions.

const compactCardStyle: React.CSSProperties = {
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #d8dee9",
};

const compactCardBodyStyle: React.CSSProperties = { padding: 10 };

type ControlSectionId =
  | "savedViews"
  | "analysisScope"
  | "datasetSource"
  | "metricRanking"
  | "attributionAnalysis"
  | "gridColumns"
  | "filters";

interface ControlSectionDefinition {
  id: ControlSectionId;
  title: string;
  description: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// const defaultSectionOrder: ControlSectionId[] = [
//   "savedViews",
//   "analysisScope",
//   "datasetSource",
//   "metricRanking",
//   "attributionAnalysis",
//   "gridColumns",
//   "filters",
// ];

// function getDefaultExpandedSections(): ControlSectionId[] {
//   return ["savedViews", "analysisScope", "datasetSource", "metricRanking", "attributionAnalysis"];
// }

const autoMapColumn = (columns: string[], candidates: string[]) => {
  const normalized = columns.map((column) => ({
    original: column,
    normalized: column.toLowerCase().replace(/[^a-z0-9]/g, ""),
  }));

  for (const candidate of candidates) {
    const target = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = normalized.find((column) => column.normalized === target);
    if (match) return match.original;
  }

  return undefined;
};

interface SortableControlSectionProps {
  section: ControlSectionDefinition;
  expandedKeys: ControlSectionId[];
  onExpandedKeysChange: (keys: ControlSectionId[]) => void;
}

function SortableControlSection({
  section,
  expandedKeys,
  onExpandedKeysChange,
}: SortableControlSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Collapse
        size="small"
        activeKey={expandedKeys}
        onChange={(keys) =>
          onExpandedKeysChange(
            (Array.isArray(keys) ? keys : [keys]) as ControlSectionId[],
          )
        }
        items={[
          {
            key: section.id,
            label: (
              <Space size={8}>
                <Tooltip title="Drag to rearrange this control section">
                  <span
                    {...attributes}
                    {...listeners}
                    style={{
                      cursor: "grab",
                      display: "inline-flex",
                      color: "#64748b",
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <HolderOutlined />
                  </span>
                </Tooltip>
                {section.icon}
                <span>{section.title}</span>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {section.description}
                </Text>
              </Space>
            ),
            children: section.content,
          },
        ]}
        className="driver-control-section"
        style={{ marginBottom: 10 }}
      />
    </div>
  );
}

export function DriverControlDrawer({
  open,
  value,
  loading,
  columnConfig,
  configOptions,
  savedViews,
  activeSavedViewId,
  favoriteSavedViewId,
  onColumnConfigChange,
  onSaveView,
  onLoadView,
  onDeleteView,
  onSetFavoriteView,
  onClose,
  onRun,
  onChange,
}: DriverControlDrawerProps) {
  const [form] = Form.useForm<DriverAnalysisFormState>();
  const [sectionOrder, setSectionOrder] =
    React.useState<ControlSectionId[]>(configOptions.defaultControlSectionOrder as ControlSectionId[]);
  const [expandedSections, setExpandedSections] =
    React.useState<ControlSectionId[]>(configOptions.defaultExpandedControlSections as ControlSectionId[]);
  const uploadState = value.datasetSource.uploadState;
  const validationStatus = uploadState?.validationStatus ?? "NotValidated";
  const attributionAssetClass =
    Form.useWatch(["attributionAnalysis", "assetClass"], form) ??
    value.attributionAnalysis.assetClass ??
    "equity";
  const attributionDimensionOptions = React.useMemo(
    () => buildGroupedDimensionSelectOptionsFromConfig(configOptions, attributionAssetClass as AttributionAssetClass),
    [configOptions, attributionAssetClass]
  );
  const sectionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  React.useEffect(() => {
    form.setFieldsValue(value);
  }, [value, form]);

  const updateDatasetSource = (
    nextDatasetSource: DriverAnalysisFormState["datasetSource"],
  ) => {
    onChange({
      ...value,
      datasetSource: nextDatasetSource,
    });
  };

  const handleValuesChange = (
    _: unknown,
    allValues: DriverAnalysisFormState,
  ) => {
    const merged: DriverAnalysisFormState = {
      ...value,
      ...allValues,
      datasetSource: {
        ...value.datasetSource,
        ...allValues.datasetSource,
      },
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
      ...values.datasetSource,
    };

    if (
      nextDatasetSource.type === "uploaded_file" &&
      nextDatasetSource.uploadState?.validationStatus !== "Valid"
    ) {
      message.error(
        "Please upload and validate the dataset before running analysis.",
      );
      return;
    }

    const portfolioIds = values.portfolioIds?.length
      ? values.portfolioIds
      : [values.portfolioId];

    if (!portfolioIds.length) {
      message.error("Please select at least one portfolio.");
      return;
    }

    onRun({
      ...value,
      ...values,
      portfolioIds,
      portfolioId: portfolioIds[0],
      datasetSource: nextDatasetSource,
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
          fileName: response.fileName,
        },
        uploadState: {
          datasetId: response.datasetId,
          fileName: response.fileName,
          rowCount: response.rowCount,
          columns: response.columns,
          previewRows: response.previewRows,
          validationStatus: "NotValidated",
          validationErrors: [],
          validationWarnings: [],
        },
      });

      message.success({
        content: "Dataset uploaded. Review mapping and run validation.",
        key: "upload-dataset",
      });
    } catch (error) {
      message.error({
        content: error instanceof Error ? error.message : "Dataset upload failed.",
        key: "upload-dataset",
      });
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
          validationStatus: "Validating",
        },
      });

      const response = await validateDriverDataset({
        datasetId,
        metric: currentValues.metric.name,
        groupBy: currentValues.groupBy,
        periods: currentValues.periods,
        columnMapping: value.datasetSource.columnMapping,
        columns: value.datasetSource.uploadState?.columns,
        rowCount: value.datasetSource.uploadState?.rowCount,
      });

      updateDatasetSource({
        ...value.datasetSource,
        uploadState: {
          ...value.datasetSource.uploadState!,
          validationStatus: response.status,
          validationErrors: response.errors,
          validationWarnings: response.warnings,
        },
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
          validationErrors: [
            error instanceof Error ? error.message : "Dataset validation failed.",
          ],
          validationWarnings: [],
        },
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
      varContribution: autoMapColumn(columns, ["var_contribution", "varContribution"]),
    };

    updateDatasetSource({
      ...value.datasetSource,
      columnMapping,
      uploadState: {
        ...value.datasetSource.uploadState!,
        validationStatus: "NotValidated",
      },
    });

    message.success("Columns auto-mapped. Review mapping and run validation.");
  };

  const datasetType = Form.useWatch(["datasetSource", "type"], form);

  const buildCurrentFormState = () => {
    const values = form.getFieldsValue();
    const portfolioIds = values.portfolioIds?.length
      ? values.portfolioIds
      : [values.portfolioId];

    return {
      ...value,
      ...values,
      portfolioIds,
      portfolioId: portfolioIds[0],
      datasetSource: {
        ...value.datasetSource,
        ...values.datasetSource,
      },
    } as DriverAnalysisFormState;
  };

  const handleSaveView = (name: string, description?: string) => {
    onSaveView(name, description, buildCurrentFormState());
  };

  const handleQuickSave = () => {
    onSaveView(
      buildDefaultSavedViewName(buildCurrentFormState()),
      undefined,
      buildCurrentFormState(),
    );
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as ControlSectionId;
    const overId = event.over?.id as ControlSectionId | undefined;

    if (!overId || activeId === overId) return;

    setSectionOrder((currentOrder) => {
      const oldIndex = currentOrder.indexOf(activeId);
      const newIndex = currentOrder.indexOf(overId);

      if (oldIndex < 0 || newIndex < 0) return currentOrder;
      return arrayMove(currentOrder, oldIndex, newIndex);
    });
  };

  const savedViewsContent = (
    <SavedViewsPanel
      views={savedViews}
      activeViewId={activeSavedViewId} favoriteViewId={favoriteSavedViewId}
      defaultName={buildDefaultSavedViewName(buildCurrentFormState())}
      onSave={handleSaveView}
      onLoad={onLoadView}
      onDelete={onDeleteView}
      onSetFavorite={onSetFavoriteView}
    />
  );

  const analysisScopeContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item
            label="Portfolios"
            name="portfolioIds"
            rules={[
              {
                required: true,
                type: "array",
                min: 1,
                message: "Please select at least one portfolio.",
              },
            ]}
          >
            <Select
              size="small"
              mode="multiple"
              showSearch
              placeholder="Select one or more portfolios"
              options={configOptions.portfolioOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="As-of Date"
            name="asOfDate"
            rules={[{ required: true, message: "As-of date is required" }]}
            getValueProps={(date) => ({ value: date ? dayjs(date) : undefined })}
            normalize={(date) =>
              date && dayjs.isDayjs(date) ? date.format("YYYY-MM-DD") : date
            }
          >
            <DatePicker size="small" style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Periods"
            name="periods"
            rules={[
              {
                required: true,
                type: "array",
                min: 1,
                message: "Please select at least one period.",
              },
            ]}
          >
            <Select
              size="small"
              mode="multiple"
              placeholder="Select periods"
              options={configOptions.periodOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const datasetSourceContent = (
    <Card
      size="small"
      style={compactCardStyle}
      bodyStyle={compactCardBodyStyle}
      extra={
        datasetType === "platform" ? (
          <DatabaseOutlined />
        ) : datasetType === "uploaded_file" ? (
          <CloudUploadOutlined />
        ) : (
          <ApiOutlined />
        )
      }
    >
      <Form.Item name={["datasetSource", "type"]} label="Source Type">
        <Radio.Group
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={configOptions.datasetSourceOptions}
        />
      </Form.Item>

      {datasetType === "platform" && (
        <Alert
          type="info"
          showIcon
          message="Using platform analytics data"
          description="Loads from Azure SQL, Snowflake, or analytics cache."
        />
      )}

      {datasetType === "uploaded_file" && (
        <>
          <Upload
            beforeUpload={(file) => {
              void handleUploadDataset(file);
              return false;
            }}
            maxCount={1}
          >
            <Button size="small" icon={<UploadOutlined />}>
              Upload CSV / Excel / Parquet
            </Button>
          </Upload>

          {uploadState?.fileName && (
            <Alert
              style={{ marginTop: 10 }}
              type={
                validationStatus === "Valid"
                  ? "success"
                  : validationStatus === "Invalid"
                    ? "error"
                    : "info"
              }
              showIcon
              icon={
                validationStatus === "Valid" ? (
                  <CheckCircleOutlined />
                ) : validationStatus === "Invalid" ? (
                  <ExclamationCircleOutlined />
                ) : undefined
              }
              message={
                <Space wrap>
                  <span>{uploadState.fileName}</span>
                  <Tag>{uploadState.rowCount ?? 0} rows</Tag>
                  <Tag>{validationStatus}</Tag>
                </Space>
              }
              description={
                validationStatus === "Valid"
                  ? "Dataset is valid and ready for analysis."
                  : "Preview data, map columns, and run validation before analysis."
              }
            />
          )}

          {uploadState?.previewRows && uploadState.previewRows.length > 0 && (
            <DatasetPreviewGrid
              columns={uploadState.columns}
              rows={uploadState.previewRows}
              rowCount={uploadState.rowCount}
            />
          )}

          {uploadState?.columns && uploadState.columns.length > 0 && (
            <DatasetColumnMapping
              columns={uploadState.columns}
              value={value.datasetSource.columnMapping}
              onChange={(columnMapping) =>
                updateDatasetSource({
                  ...value.datasetSource,
                  columnMapping,
                  uploadState: {
                    ...value.datasetSource.uploadState!,
                    validationStatus: "NotValidated",
                  },
                })
              }
            />
          )}

          {uploadState?.columns && uploadState.columns.length > 0 && (
            <Space style={{ marginTop: 10 }}>
              <Button size="small" onClick={handleAutoMapColumns}>
                Auto Map Columns
              </Button>
              <Button
                size="small"
                type="primary"
                ghost
                loading={validationStatus === "Validating"}
                onClick={handleValidateDataset}
              >
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
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 18 }}>
                  {uploadState.validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              }
            />
          )}

          {uploadState?.validationWarnings && uploadState.validationWarnings.length > 0 && (
            <Alert
              style={{ marginTop: 10 }}
              type="warning"
              showIcon
              message="Validation Warnings"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 18 }}>
                  {uploadState.validationWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              }
            />
          )}
        </>
      )}

      {datasetType === "endpoint" && (
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              label="Endpoint URL"
              name={["datasetSource", "endpoint", "url"]}
              rules={[{ required: true, message: "Endpoint URL is required" }]}
            >
              <Input
                size="small"
                placeholder="https://analytics.company.com/api/driver-source-data"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Method" name={["datasetSource", "endpoint", "method"]}>
              <Select
                size="small"
                options={configOptions.endpointMethodOptions}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="Auth Mode" name={["datasetSource", "endpoint", "authMode"]}>
              <Select
                size="small"
                options={configOptions.endpointAuthModeOptions}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Headers JSON" name={["datasetSource", "endpoint", "headersJson"]}>
              <TextArea rows={2} placeholder='{"Content-Type":"application/json"}' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Body JSON" name={["datasetSource", "endpoint", "bodyJson"]}>
              <TextArea
                rows={3}
                placeholder='{"portfolioIds":["6614T","6614T-01"],"portfolioId":"6614T","periods":["MTD","QTD","YTD"]}'
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button size="small" icon={<ApiOutlined />}>
              Test Endpoint
            </Button>
          </Col>
        </Row>
      )}
    </Card>
  );

  const metricRankingContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item
            label="Metric"
            name={["metric", "name"]}
            rules={[{ required: true, message: "Metric is required" }]}
          >
            <Select
              size="small"
              showSearch
              placeholder="Select metric"
              options={configOptions.metricOptions.map((metric) => ({
                label: metric.label,
                value: metric.name,
              }))}
              onChange={(metricName) => {
                const selectedMetric = configOptions.metricOptions.find((x) => x.name === metricName);
                if (selectedMetric) {
                  const currentValues = form.getFieldsValue();
                  form.setFieldsValue({ ...currentValues, metric: selectedMetric });
                  onChange({
                    ...value,
                    ...currentValues,
                    datasetSource: {
                      ...value.datasetSource,
                      ...currentValues.datasetSource,
                    },
                    metric: selectedMetric,
                  });
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Format" name={["metric", "format"]}>
            <Select
              size="small"
              options={configOptions.metricFormatOptions}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Group By"
            name="groupBy"
            rules={[
              {
                required: true,
                type: "array",
                min: 1,
                message: "Please select at least one grouping.",
              },
            ]}
          >
            <Select
              size="small"
              mode="multiple"
              placeholder="Select groupings"
              options={configOptions.groupByOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Space align="baseline" size={6}>
            <Form.Item label="Top" name={["top", "enabled"]} valuePropName="checked">
              <Switch size="small" />
            </Form.Item>
            <Form.Item label="Top N" name={["top", "limit"]}>
              <InputNumber size="small" min={1} max={100} />
            </Form.Item>
          </Space>
        </Col>
        <Col span={12}>
          <Space align="baseline" size={6}>
            <Form.Item label="Bottom" name={["bottom", "enabled"]} valuePropName="checked">
              <Switch size="small" />
            </Form.Item>
            <Form.Item label="Bottom N" name={["bottom", "limit"]}>
              <InputNumber size="small" min={1} max={100} />
            </Form.Item>
          </Space>
        </Col>
        <Col span={24}>
          <Form.Item label="Components" name="includeComponents">
            <Select
              size="small"
              mode="multiple"
              placeholder="Component columns"
              options={configOptions.componentOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Min Abs Value" name="minimumAbsoluteValue">
            <InputNumber
              size="small"
              min={0}
              step={0.000001}
              style={{ width: "100%" }}
              placeholder="Optional"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const attributionAnalysisContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item
            label="Show Attribution Analysis"
            name={["attributionAnalysis", "enabled"]}
            valuePropName="checked"
          >
            <Switch size="small" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="View Mode" name={["attributionAnalysis", "viewMode"]}>
            <Select
              size="small"
              options={[
                { label: "Summary + Breakdown", value: "summary" },
                { label: "Detail", value: "detail" }
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Attribution Model / Asset Class" name={["attributionAnalysis", "assetClass"]}>
            <Select
              size="small"
              showSearch
              options={configOptions.attributionAssetClassOptions}
              onChange={(assetClass: AttributionAssetClass) => {
                const defaultDimensions = getDefaultAttributionDimensionsFromConfig(configOptions, assetClass);
                form.setFieldValue(["attributionAnalysis", "dimensions"], defaultDimensions);
                onChange({
                  ...value,
                  attributionAnalysis: {
                    ...value.attributionAnalysis,
                    assetClass,
                    dimensions: defaultDimensions
                  }
                });
              }}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Dimensions by Asset Class" name={["attributionAnalysis", "dimensions"]}>
            <Select
              size="small"
              mode="multiple"
              showSearch
              placeholder="Choose attribution dimensions"
              options={attributionDimensionOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Attribution Effects" name={["attributionAnalysis", "effects"]}>
            <Select
              size="small"
              mode="multiple"
              placeholder="Choose attribution effects"
              options={configOptions.attributionEffectOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
      </Row>
      <Alert
        type="info"
        showIcon
        message="Attribution-ready result component"
        description="Adds attribution KPIs, effects chart, and breakdown grid. Dimension catalog is grouped by selected attribution model, including Equity, Global Equity, Fixed Income, Global Fixed Income, EMFI, Alternatives, and Multi-Asset workflows."
      />
    </Card>
  );

  const gridColumnsContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <ColumnConfigurator value={columnConfig} onChange={onColumnConfigChange} />
    </Card>
  );

  const filtersContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item label="Asset Class" name={["filters", "assetClass"]}>
            <Select
              size="small"
              mode="multiple"
              allowClear
              placeholder="All"
              options={configOptions.filterOptions.assetClass}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Currency" name={["filters", "currency"]}>
            <Select
              size="small"
              mode="multiple"
              allowClear
              placeholder="All"
              options={configOptions.filterOptions.currency}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Country" name={["filters", "country"]}>
            <Select
              size="small"
              mode="multiple"
              allowClear
              placeholder="All"
              options={configOptions.filterOptions.country}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Sector" name={["filters", "sector"]}>
            <Select
              size="small"
              mode="multiple"
              allowClear
              placeholder="All"
              options={configOptions.filterOptions.sector}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider style={{ margin: "4px 0 8px" }} />
      <Alert
        type="info"
        showIcon
        message="Saved-view ready"
        description="Controls can be persisted into saved views or route state for workspace handoff."
      />
    </Card>
  );

  const sectionsById: Record<ControlSectionId, ControlSectionDefinition> = {
    savedViews: {
      id: "savedViews",
      title: "Saved Views",
      description: "Load, save, and delete reusable configurations",
      icon: <SaveOutlined />,
      content: savedViewsContent,
    },
    analysisScope: {
      id: "analysisScope",
      title: "Analysis Scope",
      description: "Portfolios, as-of date, and periods",
      icon: <SlidersOutlined />,
      content: analysisScopeContent,
    },
    datasetSource: {
      id: "datasetSource",
      title: "Dataset Source",
      description: "Platform, upload, or endpoint data",
      icon:
        datasetType === "platform" ? (
          <DatabaseOutlined />
        ) : datasetType === "uploaded_file" ? (
          <CloudUploadOutlined />
        ) : (
          <ApiOutlined />
        ),
      content: datasetSourceContent,
    },
    metricRanking: {
      id: "metricRanking",
      title: "Metric and Ranking",
      description: "Metric, grouping, components, and limits",
      icon: <PlayCircleOutlined />,
      content: metricRankingContent,
    },
    attributionAnalysis: {
      id: "attributionAnalysis",
      title: "Attribution Analysis",
      description: "Effects, dimensions, and breakdown controls",
      icon: <ApartmentOutlined />,
      content: attributionAnalysisContent,
    },
    gridColumns: {
      id: "gridColumns",
      title: "Grid Columns",
      description: "Visible columns and display order",
      icon: <HolderOutlined />,
      content: gridColumnsContent,
    },
    filters: {
      id: "filters",
      title: "Filters",
      description: "Asset class, currency, country, and sector",
      icon: <SlidersOutlined />,
      content: filtersContent,
    },
  };

  return (
    <Drawer style={{ marginTop: 65, marginBottom:40 }}
      title={
        <Space direction="vertical" size={0}>
          <Space size={6}>
            <SlidersOutlined style={{ color: "#1d4ed8" }} />
            <Title level={5} style={{ margin: 0 }}>
              Configure Driver Analysis
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Expand, collapse, and drag sections to personalize your workflow.
          </Text>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={920}
      destroyOnClose={false}
      extra={
        <Space size={6}>
          <Button size="small" onClick={() => setExpandedSections(sectionOrder)}>
            Expand All
          </Button>
          <Button size="small" onClick={() => setExpandedSections([])}>
            Collapse All
          </Button>
          <Button size="small" icon={<SaveOutlined />} onClick={handleQuickSave}>
            Save
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={loading}
            onClick={handleRun}
          >
            Run
          </Button>
        </Space>
      }
      styles={{
        header: { padding: "10px 14px", borderBottom: "1px solid #d8dee9" },
        body: { background: "#f3f6fb", padding: 12 },
        footer: { padding: "8px 12px" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={value}
        onValuesChange={handleValuesChange}
      >
        <DndContext
          sensors={sectionSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            {sectionOrder.map((sectionId) => (
              <SortableControlSection
                key={sectionId}
                section={sectionsById[sectionId]}
                expandedKeys={expandedSections}
                onExpandedKeysChange={setExpandedSections}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Form>
    </Drawer>
  );
}
