import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Space,
  Tabs,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import "../../lib/styles.css"
import { CheckableTagGroup } from "../CheckableTagGroup";
import {
  GridConfigResponse,
  normalizeColumns,
  NormalizedColumnConfig,
} from "../dram-grid";
import { ColumnSelector } from "./ColumnSelector";
import dayjs from "dayjs";

const { Title } = Typography;

type WizardSelectionState = {
  assetClass: string;
  asOfDate: string;
  startDate: string;
  endDate: string;
  portfolio: string;
  benchmark: string;
  frequencyMode: string;
  periodIds: string[];
  breakdownModeId: string;
  selectedColumnIds: string[];
};

export type WizardApplyPayload = WizardSelectionState & {
  configuredColumns: NormalizedColumnConfig[];
};

type ColumnItem = {
  key: string;
  label: string;
};

type Option = {
  label: string;
  value: string;
};

type Props = {
  config: GridConfigResponse;
  assetClassOptions: Option[];
  portfolioOptions: Option[];
  benchmarkOptions: Option[];
  initialValues?: Partial<WizardSelectionState>;
  onAssetClassChange?: (asset: string) => void;
  onApply?: (payload: WizardApplyPayload) => void;
  onSave?: (payload: WizardApplyPayload) => void;
};

function buildConfiguredColumns(
  config: GridConfigResponse,
  selectedColumnIds: string[]
): NormalizedColumnConfig[] {
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

function createDefaultState(
  config: GridConfigResponse,
  initialValues?: Partial<WizardSelectionState>
): WizardSelectionState {
  return {
    assetClass: initialValues?.assetClass ?? "",
    asOfDate: initialValues?.asOfDate ?? "",
    startDate: initialValues?.startDate ?? "",
    endDate: initialValues?.endDate ?? "",
    portfolio: initialValues?.portfolio ?? "",
    benchmark: initialValues?.benchmark ?? "",
    frequencyMode:
      initialValues?.frequencyMode ?? config.frequencyMode[0]?.id ?? "monthly",
    periodIds: initialValues?.periodIds ?? ['MTD'],
    breakdownModeId:
      initialValues?.breakdownModeId ?? config.breakdownMode[0]?.id ?? "",
    selectedColumnIds:
      initialValues?.selectedColumnIds ??
      config.columnConfigs.all
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.id),
  };
}

export default function WizardTabbedCompact({
  config,
  assetClassOptions,
  portfolioOptions,
  benchmarkOptions,
  initialValues,
  onAssetClassChange,
  onApply,
  onSave,
}: Props) {
  const defaultState = useMemo<WizardSelectionState>(
    () => createDefaultState(config, initialValues),
    [config, initialValues]
  );

  const [state, setState] = useState<WizardSelectionState>(defaultState);

  const breakdownOptions = useMemo(
    () =>
      config.breakdownMode.map((b) => ({
        value: b.id,
        label: b.label,
      })),
    [config]
  );

  const periods = useMemo(() => {
    return (config.periods[0] ?? [])
      .filter((p) => p.visible && p.frequency_mode === state.frequencyMode)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [config, state.frequencyMode]);

  const allColumnOptions = useMemo<ColumnItem[]>(() => {
    return [...config.columnConfigs.all]
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        key: c.id,
        label: c.label,
      }));
  }, [config]);

  useEffect(() => {
    setState(defaultState);
  }, [defaultState]);

  const configuredColumns = useMemo(() => {
    return buildConfiguredColumns(config, state.selectedColumnIds);
  }, [config, state.selectedColumnIds]);

  const handleApply = () => {
    onApply?.({
      ...state,
      configuredColumns,
    });
  };

  const handleSave = () => {
    onSave?.({
      ...state,
      configuredColumns,
    });
  };

  const handleReset = () => {
    setState(defaultState);
  };

  const hasValidDate =
    state.frequencyMode.toLowerCase() === "monthly"
      ? Boolean(state.asOfDate)
      : Boolean(state.startDate && state.endDate);

  const canApply =
    Boolean(state.assetClass) &&
    Boolean(state.portfolio) &&
    Boolean(state.breakdownModeId) &&
    state.selectedColumnIds.length > 0 &&
    state.periodIds.length > 0 &&
    hasValidDate;

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Title level={4} style={{ margin: 0 }}>
          Analysis Config
        </Title>

        <Space>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button type="primary" disabled={!canApply} onClick={handleApply}>
            Apply
          </Button>
        </Space>
      </Row>

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: "general",
            label: "General",
            children: (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Card size="small" title="Filters">
                  <Form layout="vertical">
                    <Row gutter={12}>
                      <Col span={6}>
                        <Form.Item label="Asset Class">
                          <Select
                            value={state.assetClass || undefined}
                            options={assetClassOptions}
                            onChange={(val) => {
                              setState((prev) => ({
                                ...prev,
                                assetClass: val,
                                portfolio: "",
                                benchmark: "",
                              }));
                              onAssetClassChange?.(val);
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="Portfolio">
                          <Select
                            value={state.portfolio || undefined}
                            options={portfolioOptions}
                            showSearch
                            optionFilterProp="label"
                            disabled={!state.assetClass}
                            onChange={(val) =>
                              setState((prev) => ({
                                ...prev,
                                portfolio: val,
                                benchmark: "",
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="Benchmark">
                          <Select
                            value={state.benchmark || undefined}
                            options={benchmarkOptions}
                            showSearch
                            optionFilterProp="label"
                            disabled={!state.portfolio}
                            onChange={(val) =>
                              setState((prev) => ({
                                ...prev,
                                benchmark: val,
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="Frequency">
                          <Select
                            value={state.frequencyMode}
                            options={config.frequencyMode.map((f) => ({
                              value: f.id,
                              label: f.label,
                            }))}
                            onChange={(val) =>
                              setState((prev) => ({
                                ...prev,
                                frequencyMode: val,
                                asOfDate: "",
                                startDate: "",
                                endDate: "",
                                periodIds: val === 'daily' ? ['1D']:['MTD'],
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {state.frequencyMode.toLowerCase() === "monthly" ? (
                      <Form.Item label="As Of Date">
                        <DatePicker
                          style={{ width: 220 }}
                          value={state.asOfDate ? dayjs(state.asOfDate) : null}
                          onChange={(d) =>
                            setState((prev) => ({
                              ...prev,
                              asOfDate: d ? d.format("YYYY-MM-DD") : "",
                            }))
                          }
                        />
                      </Form.Item>
                    ) : (
                      <Row gutter={12}>
                        <Col>
                          <Form.Item label="Start">
                            <DatePicker
                              value={
                                state.startDate ? dayjs(state.startDate) : null
                              }
                              onChange={(d) =>
                                setState((prev) => ({
                                  ...prev,
                                  startDate: d ? d.format("YYYY-MM-DD") : "",
                                }))
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col>
                          <Form.Item label="End">
                            <DatePicker
                              value={
                                state.endDate ? dayjs(state.endDate) : null
                              }
                              onChange={(d) =>
                                setState((prev) => ({
                                  ...prev,
                                  endDate: d ? d.format("YYYY-MM-DD") : "",
                                }))
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </Form>
                </Card>

                <Card size="small" title="Options">
                  <Form layout="vertical">
                    <Form.Item label="Periods">
                      <CheckableTagGroup
                        value={state.periodIds}
                        onChange={(value) =>
                          setState((prev) => ({
                            ...prev,
                            periodIds: value as string[],
                          }))
                        }
                        options={periods.map((p) => ({
                          label: p.label,
                          value: p.id,
                        }))}
                      />
                    </Form.Item>

                    <Form.Item label="Breakdown">
                      <Select
                        value={state.breakdownModeId || undefined}
                        options={breakdownOptions}
                        onChange={(value) =>
                          setState((prev) => ({
                            ...prev,
                            breakdownModeId: value,
                          }))
                        }
                        style={{ maxWidth: 280 }}
                      />
                    </Form.Item>
                  </Form>
                </Card>
              </Space>
            ),
          },
          {
            key: "columns",
            label: `Columns (${state.selectedColumnIds.length})`,
            children: (
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
            ),
          },
        ]}
      />
    </Space>
  );
}