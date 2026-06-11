import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import { WizardSelectionState } from "./wizardConfigTypes";
import { buildBenchmarkOptions, buildPortfolioOptions, isMonthEnd } from "../../lib/helpers";
import { PortBenchRow } from "../../lib/types";
import {
  AnalyticResultRow,
  AnalyticsResponse,
  api,
  OptionsResponse,
} from "../../lib/services";
import {
  ApiColumnConfig,
  DramDataGrid,
  DramGridProvider,
  GridConfigResponse,
  normalizeColumns,
} from "../dram-grid";
import { CheckableTagGroup } from "../CheckableTagGroup";
import { extractAnalysisRows, toGridRows } from "./wizardConfigUtils";
import { getKeyByAssetClass } from "../WizardStateStore";

const { Title, Text } = Typography;

type Props = {
  config: GridConfigResponse;
  onComplete?: (payload: WizardSelectionState & { configuredColumns: ApiColumnConfig[] }) => void;
  assetClass: string;
  isConfigView: boolean;
};

type ColumnItem = {
  key: string;
  label: string;
};

function moveItem<T>(arr: T[], index: number, delta: number): T[] {
  const next = [...arr];
  const target = index + delta;

  if (target < 0 || target >= arr.length) {
    return arr;
  }

  [next[index], next[target]] = [next[target], next[index]];
  return next;
}


function buildConfiguredColumns(
  config: GridConfigResponse,
  selectedColumnIds: string[]
) {
  return normalizeColumns(config, {
    order: selectedColumnIds,
    widths: {},
    visibility: Object.fromEntries(
      config.columnConfigs.all.map((c) => [
        c.id,
        selectedColumnIds.includes(c.id),
      ])
    ),
  });
}

function getLabelFromOptions(
  options: Array<{ value: string; label: unknown }>,
  value: string
): string {
  const found = options.find((item) => item.value === value)?.label;

  if (typeof found === "string") {
    return found;
  }

  if (found == null) {
    return "";
  }

  return String(found);
}

type SummaryPanelProps = {
  state: WizardSelectionState;
  portfolioLabel: string;
  benchmarkLabel: string;
  frequencyLabel: string;
  breakdownLabel: string;
  periodLabels: string[];
  selectedColumnLabels: string[];
  canRun: boolean;
  isMonthlyMode: boolean;
  validAsOf: boolean;
  validDateRange: boolean;
};

function SummaryPanel({
  state,
  portfolioLabel,
  benchmarkLabel,
  frequencyLabel,
  breakdownLabel,
  periodLabels,
  selectedColumnLabels,
  canRun,
  isMonthlyMode,
  validAsOf,
  validDateRange,
}: SummaryPanelProps) {
  return (
    <div style={{ position: "sticky", top: 16 }}>
      <Card
        title="Analysis Summary"
        extra={canRun ? <Tag color="success">Ready</Tag> : <Tag color="warning">Needs input</Tag>}
      >
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div>
            <Text type="secondary">Portfolio</Text>
            <div>{portfolioLabel || "Not selected"}</div>
          </div>

          <div>
            <Text type="secondary">Benchmark</Text>
            <div>{benchmarkLabel || "Not selected"}</div>
          </div>

          <div>
            <Text type="secondary">Frequency</Text>
            <div>{frequencyLabel || "Not selected"}</div>
          </div>

          <div>
            <Text type="secondary">Date selection</Text>
            <div>
              {isMonthlyMode ? (
                state.asOfDate ? (
                  <>
                    {state.asOfDate}{" "}
                    {validAsOf ? <Tag color="success">Month-end</Tag> : <Tag color="error">Invalid</Tag>}
                  </>
                ) : (
                  "As of date required"
                )
              ) : state.startDate && state.endDate ? (
                <>
                  {state.startDate} → {state.endDate}{" "}
                  {validDateRange ? (
                    <Tag color="success">Valid range</Tag>
                  ) : (
                    <Tag color="error">End before start</Tag>
                  )}
                </>
              ) : (
                "Start and end dates required"
              )}
            </div>
          </div>

          <div>
            <Text type="secondary">Breakdown</Text>
            <div>{breakdownLabel || "Not selected"}</div>
          </div>

          <div>
            <Text type="secondary">Periods</Text>
            <div style={{ marginTop: 4 }}>
              {periodLabels.length > 0 ? (
                <Space wrap size={[6, 6]}>
                  {periodLabels.map((label) => (
                    <Tag key={label}>{label}</Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">No periods selected</Text>
              )}
            </div>
          </div>

          <div>
            <Text type="secondary">Columns</Text>
            <div style={{ marginTop: 4 }}>
              {selectedColumnLabels.length > 0 ? (
                <>
                  <div style={{ marginBottom: 8 }}>{selectedColumnLabels.length} selected</div>
                  <Space wrap size={[6, 6]}>
                    {selectedColumnLabels.slice(0, 8).map((label) => (
                      <Tag key={label}>{label}</Tag>
                    ))}
                    {selectedColumnLabels.length > 8 ? (
                      <Tag>+{selectedColumnLabels.length - 8} more</Tag>
                    ) : null}
                  </Space>
                </>
              ) : (
                <Text type="secondary">No columns selected</Text>
              )}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}

type ColumnSelectorProps = {
  options: ColumnItem[];
  selectedKeys: string[];
  onChange: (next: string[]) => void;
};

function ColumnSelector({ options, selectedKeys, onChange }: ColumnSelectorProps) {
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const optionMap = useMemo(() => {
    return new Map<string, ColumnItem>(options.map((item) => [item.key, item]));
  }, [options]);

  const normalizedSearch = search.trim().toLowerCase();

  const availableItems = useMemo(() => {
    return options.filter((item) => {
      if (selectedSet.has(item.key)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return item.label.toLowerCase().includes(normalizedSearch);
    });
  }, [options, selectedSet, normalizedSearch]);

  const selectedItems = useMemo(() => {
    return selectedKeys
      .map((key) => optionMap.get(key))
      .filter((item): item is ColumnItem => Boolean(item))
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return item.label.toLowerCase().includes(normalizedSearch);
      });
  }, [selectedKeys, optionMap, normalizedSearch]);

  const handleAdd = (key: string, checked: boolean) => {
    if (!checked) {
      return;
    }

    if (selectedSet.has(key)) {
      return;
    }

    onChange([...selectedKeys, key]);
  };

  const handleRemove = (key: string) => {
    onChange(selectedKeys.filter((item) => item !== key));
  };

  const handleMoveUp = (key: string) => {
    const index = selectedKeys.indexOf(key);
    if (index < 0) {
      return;
    }

    onChange(moveItem(selectedKeys, index, -1));
  };

  const handleMoveDown = (key: string) => {
    const index = selectedKeys.indexOf(key);
    if (index < 0) {
      return;
    }

    onChange(moveItem(selectedKeys, index, 1));
  };

  return (
    <Card title="Columns">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search fields"
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card size="small" title={`Available Fields (${availableItems.length})`} bodyStyle={{ padding: 0 }}>
              {availableItems.length === 0 ? (
                <div style={{ padding: 16 }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No available fields match the current search."
                  />
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  <List
                    dataSource={availableItems}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "10px 12px" }}>
                        <Checkbox
                          checked={false}
                          onChange={(e) => handleAdd(item.key, e.target.checked)}
                        >
                          {item.label}
                        </Checkbox>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card size="small" title={`Selected Fields (${selectedKeys.length})`} bodyStyle={{ padding: 0 }}>
              {selectedItems.length === 0 ? (
                <div style={{ padding: 16 }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Select at least one field."
                  />
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  <List
                    dataSource={selectedItems}
                    renderItem={(item) => {
                      const index = selectedKeys.indexOf(item.key);

                      return (
                        <List.Item
                          style={{ padding: "10px 12px" }}
                          actions={[
                            <Button
                              key="up"
                              type="text"
                              icon={<UpOutlined />}
                              disabled={index <= 0}
                              onClick={() => handleMoveUp(item.key)}
                            />,
                            <Button
                              key="down"
                              type="text"
                              icon={<DownOutlined />}
                              disabled={index === selectedKeys.length - 1}
                              onClick={() => handleMoveDown(item.key)}
                            />,
                            <Button
                              key="remove"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemove(item.key)}
                            />,
                          ]}
                        >
                          <Space size={8}>
                            <Tag color="blue">{index + 1}</Tag>
                            <span>{item.label}</span>
                          </Space>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Text type="secondary">
          Search to find fields quickly, check a field to add it, and use the arrows on the selected side to reorder columns.
        </Text>
      </Space>
    </Card>
  );
}

export default function WizardStepper({
  config,
  assetClass,
  isConfigView,
  onComplete,
}: Props) {
  const defaultState = useMemo<WizardSelectionState>(
    () => ({
      asOfDate: "",
      startDate: "",
      endDate: "",
      portfolio: "",
      benchmark: "",
      frequencyMode: config.frequencyMode[0]?.id ?? "monthly",
      periodIds: [],
      breakdownModeId: config.breakdownMode[0]?.id ?? "",
      selectedColumnIds: config.metrics.filter((m) => m.visible).map((m) => m.id),
    }),
    [config]
  );

  const [state, setState] = useState<WizardSelectionState>(defaultState);
  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  const [dataset, setDataset] = useState<AnalyticResultRow[]>([]);
  const [viewTitle, setViewTitle] = useState<string>("Attribution");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [running, setRunning] = useState(false);
  const [autoBenchmarkApplied, setAutoBenchmarkApplied] = useState(false);

  useEffect(() => {
    setState(defaultState);
  }, [defaultState]);

  useEffect(() => {
    let active = true;

    setLoadingOptions(true);
    setAutoBenchmarkApplied(false);

    api
      .getAccounts(assetClass)
      .then((opts) => {
        if (!active) {
          return;
        }

        const apiResp = opts as OptionsResponse;
        const allRows = Array.isArray(apiResp.data?.grids)
          ? apiResp.data.grids.flatMap((grid) =>
              Array.isArray(grid.rows) ? grid.rows : []
            )
          : [];

        const pb: PortBenchRow[] = allRows
          .filter((row) => typeof row === "object" && row !== null)
          .map((row) => ({
            PORTFOLIO_KEY: String(row["PORTFOLIO_KEY"] ?? ""),
            PORTFOLIO_NAME: String(row["PORTFOLIO_NAME"] ?? ""),
            PORTFOLIO_BENCHMARK_CODE: row["PORTFOLIO_BENCHMARK_CODE"] ?? null,
            PORTFOLIO_BENCHMARK_NAME: row["PORTFOLIO_BENCHMARK_NAME"] ?? null,
            PORTFOLIO_SECONDARY_BENCHMARK_CODE:
              row["PORTFOLIO_SECONDARY_BENCHMARK_CODE"] ?? null,
            PORTFOLIO_SECONDARY_BENCHMARK_NAME:
              row["PORTFOLIO_SECONDARY_BENCHMARK_NAME"] ?? null,
          }))
          .filter((row) => row.PORTFOLIO_KEY && row.PORTFOLIO_NAME);

        setPortBenchRows(pb);
      })
      .catch((err) => {
        console.error("getAccounts failed:", err);
        message.warning("Options failed to load; showing defaults only.");
      })
      .finally(() => {
        if (active) {
          setLoadingOptions(false);
        }
      });

    return () => {
      active = false;
    };
  }, [assetClass]);

  const processAnalysisResult = (apiResp: AnalyticsResponse): AnalyticResultRow[] => {
    setViewTitle(apiResp.message ?? "Attribution");
    return extractAnalysisRows(apiResp);
  };

  const portfolioSelectOptions = useMemo(
    () => buildPortfolioOptions(portBenchRows ?? []),
    [portBenchRows]
  );

  const benchmarkSelectOptions = useMemo(
    () => buildBenchmarkOptions(portBenchRows ?? [], [state.portfolio]),
    [portBenchRows, state.portfolio]
  );

  const frequencyOptions = useMemo(
    () =>
      config.frequencyMode.map((item) => ({
        value: item.id,
        label: item.label,
      })),
    [config]
  );

  const breakdownOptions = useMemo(
    () =>
      config.breakdownMode.map((item) => ({
        value: item.id,
        label: item.label,
      })),
    [config]
  );

  const periods = useMemo(() => {
    return (config.periods[0] ?? [])
      .filter((period) => period.visible && period.frequency_mode === state.frequencyMode)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [config, state.frequencyMode]);

  const allColumnOptions = useMemo<ColumnItem[]>(() => {
    return config.columnConfigs.all
      .filter((column) => column.visible)
      .sort((a, b) => a.order - b.order)
      .map((column) => ({
        key: column.id,
        label: column.label,
      }));
  }, [config]);

  const configuredColumns = useMemo(() => {
    return buildConfiguredColumns(config, state.selectedColumnIds);
  }, [config, state.selectedColumnIds]);

  const gridRows = useMemo(() => toGridRows(dataset), [dataset]);

  const portfolioLabel = useMemo(
    () => getLabelFromOptions(portfolioSelectOptions as Array<{ value: string; label: unknown }>, state.portfolio),
    [portfolioSelectOptions, state.portfolio]
  );

  const benchmarkLabel = useMemo(
    () => getLabelFromOptions(benchmarkSelectOptions as Array<{ value: string; label: unknown }>, state.benchmark),
    [benchmarkSelectOptions, state.benchmark]
  );

  const frequencyLabel = useMemo(
    () => getLabelFromOptions(frequencyOptions, state.frequencyMode),
    [frequencyOptions, state.frequencyMode]
  );

  const breakdownLabel = useMemo(
    () => getLabelFromOptions(breakdownOptions, state.breakdownModeId ?? ""),
    [breakdownOptions, state.breakdownModeId]
  );

  const periodLabels = useMemo(() => {
    return state.periodIds
      .map((id) => periods.find((period) => period.id === id)?.label)
      .filter((label): label is string => Boolean(label));
  }, [periods, state.periodIds]);

  const selectedColumnLabels = useMemo(() => {
    return state.selectedColumnIds
      .map((id) => allColumnOptions.find((item) => item.key === id)?.label)
      .filter((label): label is string => Boolean(label));
  }, [state.selectedColumnIds, allColumnOptions]);

  const asOf: Dayjs | null = useMemo(
    () => (state.asOfDate ? dayjs(state.asOfDate) : null),
    [state.asOfDate]
  );

  const start: Dayjs | null = useMemo(
    () => (state.startDate ? dayjs(state.startDate) : null),
    [state.startDate]
  );

  const end: Dayjs | null = useMemo(
    () => (state.endDate ? dayjs(state.endDate) : null),
    [state.endDate]
  );

  const isMonthlyMode = state.frequencyMode === "monthly";

  const validAsOf = isMonthlyMode ? Boolean(asOf && isMonthEnd(asOf)) : true;
  const hasRequiredRangeDates = !isMonthlyMode ? Boolean(start && end) : true;
  const validDateRange =
    !isMonthlyMode && start && end ? !end.isBefore(start, "day") : true;

  const validScope = Boolean(state.portfolio) && Boolean(state.benchmark);
  const validBreakdown = Boolean(state.breakdownModeId);
  const validPeriods = state.periodIds.length > 0;
  const validColumns = state.selectedColumnIds.length > 0;

  const canRun =
    validScope &&
    validBreakdown &&
    validPeriods &&
    validColumns &&
    validAsOf &&
    hasRequiredRangeDates &&
    validDateRange;

  const handlePortfolioChange = (nextPortfolio: string) => {
    const nextBenchmarkOptions = buildBenchmarkOptions(portBenchRows, [nextPortfolio]);
    const currentBenchmarkStillValid = nextBenchmarkOptions.some(
      (option) => String(option.value) === state.benchmark
    );

    const fallbackBenchmark =
      nextBenchmarkOptions.length > 0 ? String(nextBenchmarkOptions[0].value) : "";

    const nextBenchmark = currentBenchmarkStillValid
      ? state.benchmark
      : fallbackBenchmark;

    setState((prev) => ({
      ...prev,
      portfolio: nextPortfolio,
      benchmark: nextBenchmark,
    }));

    setAutoBenchmarkApplied(!currentBenchmarkStillValid && Boolean(nextBenchmark));
  };

  const handleReset = () => {
    setState(defaultState);
    setDataset([]);
    setViewTitle("Attribution");
    setAutoBenchmarkApplied(false);
  };

  const handleRun = async () => {
    if (!canRun) {
      message.error("Please complete all required fields before running analysis.");
      return;
    }

    if (!state.portfolio) {
      message.error("Portfolio is required.");
      return;
    }

    setRunning(true);

    try {
      const response =
        state.frequencyMode === "monthly"
          ? await api.runMonthlyAssetAnalyis(
              assetClass,
              state.portfolio,
              state.asOfDate
            )
          : await api.runAnalysis(
              state.portfolio,
              assetClass,
              state.startDate,
              state.endDate
            );

      const rows = processAnalysisResult(response);
      setDataset(rows);

      if (onComplete) {
        onComplete({
          ...state,
          configuredColumns,
        });
      }

      message.success("Analysis complete.");
    } catch (err) {
      console.error(err);
      message.error("Analysis failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ paddingBottom: 96 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Configure Analysis
          </Title>
          <Text type="secondary">
            Choose scope, dates, analysis options, and columns in one place. Review your summary on the right, then run the analysis.
          </Text>
        </div>

        <Row gutter={[16, 16]} align="top">
          <Col xs={24} xl={17}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card title="Scope" loading={loadingOptions}>
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Portfolio"
                        required
                        validateStatus={!state.portfolio ? "error" : undefined}
                        help={!state.portfolio ? "Please select a portfolio." : undefined}
                      >
                        <Select
                          value={state.portfolio || undefined}
                          options={portfolioSelectOptions}
                          showSearch
                          optionFilterProp="label"
                          placeholder="Select portfolio"
                          onChange={handlePortfolioChange}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Benchmark"
                        required
                        validateStatus={!state.benchmark ? "error" : undefined}
                        help={!state.benchmark ? "Please select a benchmark." : undefined}
                      >
                        <Select
                          value={state.benchmark || undefined}
                          options={benchmarkSelectOptions}
                          showSearch
                          optionFilterProp="label"
                          placeholder="Select benchmark"
                          disabled={!state.portfolio}
                          onChange={(nextBenchmark: string) =>
                            setState((prev) => ({
                              ...prev,
                              benchmark: nextBenchmark ?? "",
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {autoBenchmarkApplied ? (
                    <Alert
                      showIcon
                      type="info"
                      message="Default benchmark selected based on portfolio mapping."
                    />
                  ) : null}
                </Form>
              </Card>

              <Card title="Date & Frequency">
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item label="Frequency" required>
                        <Select
                          value={state.frequencyMode}
                          options={frequencyOptions}

                          onChange={(value: WizardSelectionState["frequencyMode"]) =>
                            setState((prev) => ({
                              ...prev,
                              frequencyMode: value,
                              periodIds: [],
                              asOfDate: value === "monthly" ? prev.asOfDate : "",
                              startDate: value === "monthly" ? "" : prev.startDate,
                              endDate: value === "monthly" ? "" : prev.endDate,
                            }))
                          }

                        />
                      </Form.Item>
                    </Col>

                    {isMonthlyMode ? (
                      <Col xs={24} md={16}>
                        <Form.Item
                          label="As Of Date (Month-End Only)"
                          required
                          validateStatus={
                            !state.asOfDate ? "error" : validAsOf ? undefined : "error"
                          }
                          help={
                            !state.asOfDate
                              ? "Please choose an as of date."
                              : validAsOf
                              ? "Month-end date selected."
                              : "Please choose a month-end date."
                          }
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            value={asOf}
                            disabledDate={(date) => !isMonthEnd(date)}
                            onChange={(date) =>
                              setState((prev) => ({
                                ...prev,
                                asOfDate: date ? date.format("YYYY-MM-DD") : "",
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>
                    ) : (
                      <>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label="Start Date"
                            required
                            validateStatus={!state.startDate ? "error" : undefined}
                            help={!state.startDate ? "Please choose a start date." : undefined}
                          >
                            <DatePicker
                              value={start}
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                setState((prev) => ({
                                  ...prev,
                                  startDate: date ? date.format("YYYY-MM-DD") : "",
                                }))
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            label="End Date"
                            required
                            validateStatus={
                              !state.endDate
                                ? "error"
                                : validDateRange
                                ? undefined
                                : "error"
                            }
                            help={
                              !state.endDate
                                ? "Please choose an end date."
                                : validDateRange
                                ? undefined
                                : "End date must be on or after start date."
                            }
                          >
                            <DatePicker
                              value={end}
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                setState((prev) => ({
                                  ...prev,
                                  endDate: date ? date.format("YYYY-MM-DD") : "",
                                }))
                              }
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                  </Row>
                </Form>
              </Card>

              <Card title="Analysis Options">
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                  <div>
                    <Form layout="vertical">
                      <Form.Item
                        label="Periods"
                        required
                        validateStatus={!validPeriods ? "error" : undefined}
                        help={!validPeriods ? "Select at least one period." : undefined}
                        style={{ marginBottom: 8 }}
                      >
                        {periods.length > 0 ? (
                          <CheckableTagGroup
                            value={state.periodIds}
                            onChange={(value) =>
                              setState((prev) => ({
                                ...prev,
                                periodIds: value as string[],
                              }))
                            }
                            options={periods.map((period) => ({
                              label: period.label,
                              value: period.id,
                            }))}
                          />
                        ) : (
                          <Alert
                            showIcon
                            type="warning"
                            message="No periods are available for the selected frequency."
                          />
                        )}
                      </Form.Item>
                    </Form>

                    {state.periodIds.length > 0 ? (
                      <Text type="secondary">
                        Selected: {periodLabels.join(", ")}
                      </Text>
                    ) : null}
                  </div>

                  <Divider style={{ margin: 0 }} />

                  <Form layout="vertical">
                    <Form.Item
                      label="Breakdown"
                      required
                      validateStatus={!validBreakdown ? "error" : undefined}
                      help={!validBreakdown ? "Please select a breakdown." : undefined}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        value={state.breakdownModeId || undefined}
                        onChange={(value: string) =>
                          setState((prev) => ({
                            ...prev,
                            breakdownModeId: value,
                          }))
                        }
                        options={breakdownOptions}
                        style={{ maxWidth: 320 }}
                        placeholder="Select breakdown"
                      />
                    </Form.Item>
                  </Form>
                </Space>
              </Card>

              <ColumnSelector
                options={allColumnOptions}
                selectedKeys={state.selectedColumnIds}
                onChange={(next) =>
                  setState((prev) => ({
                    ...prev,
                    selectedColumnIds: next,
                  }))
                }
              />

              {dataset.length > 0 ? (
                <Card title="Results">
                  {config ? (
                    <DramGridProvider
                      config={config}
                      storageKey={getKeyByAssetClass(assetClass)}
                      allColumns={configuredColumns}
                    >
                      <Card title={viewTitle}>
                        <DramDataGrid
                          config={config}
                          rows={gridRows}
                          storageKey={getKeyByAssetClass(assetClass)}
                          height={500}
                          isConfigView={isConfigView}
                        />
                      </Card>
                    </DramGridProvider>
                  ) : (
                    <Card title={viewTitle}>
                      <Text type="secondary">
                        No backend grid configuration was found in the response.
                      </Text>
                    </Card>
                  )}
                </Card>
              ) : (
                <Card title="Results">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Run analysis to see results here."
                  />
                </Card>
              )}
            </Space>
          </Col>

          <Col xs={24} xl={7}>
            <SummaryPanel
              state={state}
              portfolioLabel={portfolioLabel}
              benchmarkLabel={benchmarkLabel}
              frequencyLabel={frequencyLabel}
              breakdownLabel={breakdownLabel}
              periodLabels={periodLabels}
              selectedColumnLabels={selectedColumnLabels}
              canRun={canRun}
              isMonthlyMode={isMonthlyMode}
              validAsOf={validAsOf}
              validDateRange={validDateRange}
            />
          </Col>
        </Row>
      </Space>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          padding: "12px 16px",
          marginTop: 16,
        }}
      >
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space wrap>
              <Tag color={validScope ? "success" : "default"}>Scope</Tag>
              <Tag color={isMonthlyMode ? (validAsOf ? "success" : "default") : hasRequiredRangeDates && validDateRange ? "success" : "default"}>
                Dates
              </Tag>
              <Tag color={validPeriods ? "success" : "default"}>Periods</Tag>
              <Tag color={validBreakdown ? "success" : "default"}>Breakdown</Tag>
              <Tag color={validColumns ? "success" : "default"}>Columns</Tag>
            </Space>
          </Col>

          <Col>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset
              </Button>
              <Button
                type="primary"
                loading={running}
                disabled={!canRun}
                onClick={handleRun}
              >
                Run Analysis
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
}