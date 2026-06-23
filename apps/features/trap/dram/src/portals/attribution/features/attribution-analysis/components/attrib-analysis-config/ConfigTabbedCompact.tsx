import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Row,
  Segmented,
  SegmentedProps,
  Select,
  Space,
  Tabs,
  Typography,
} from "antd";

import {
  PlayCircleOutlined,
  SaveOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import "../../lib/styles.css"
import "./styles.scss"
import { CheckableTagGroup } from "../CheckableTagGroup";
import {
  GridConfigResponse,
  normalizeColumns,
  NormalizedColumnConfig,
} from "../dram-grid";
import { ColumnSelector } from "./ColumnSelector";
import { Dayjs } from "dayjs";
import { AssetClass } from "../../lib/types";
const { Text, Title } = Typography;

const compactCardStyle: React.CSSProperties = {
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #d8dee9"
};

const compactCardBodyStyle: React.CSSProperties = { padding: 10 };

type AttribAnalysisSelectionState = {
  assetClass: AssetClass | null;
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

export type AttribAnalysisApplyPayload = AttribAnalysisSelectionState & {
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
  assetClassOptions:  SegmentedProps<AssetClass>["options"];
  portfolioOptions: Option[];
  benchmarkOptions: Option[];
  initialValues?: Partial<AttribAnalysisSelectionState>;
  onAssetClassChange?: (asset: string) => void;
  onApply?: (payload: AttribAnalysisApplyPayload) => void;
  onSave?: (payload: AttribAnalysisApplyPayload) => void;
  onClose: () => void;
  open: boolean;
  onPortfolioChange?: (portfolio: string) => void;
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
  initialValues?: Partial<AttribAnalysisSelectionState>
): AttribAnalysisSelectionState {
  return {
    assetClass: initialValues?.assetClass ?? null,
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

type Frequency = "monthly" | "daily";
interface RangeDisabledArgs {
  frequency: Frequency;
  holidays?: Set<string>;
  startValue?: Dayjs | null; // for range dependency
}

const isMonthEnd = (d: Dayjs): boolean =>
  d.isSame(d.endOf("month"), "day");

const isWeekend = (d: Dayjs): boolean => {
  const day = d.day();
  return day === 0 || day === 6;
};

const isHoliday = (d: Dayjs, holidays: Set<string>): boolean =>
  holidays.has(d.format("YYYY-MM-DD"));
export const createRangeDisabledDate = ({
  frequency,
  holidays = new Set<string>(),
  startValue,
}: RangeDisabledArgs) => {
  return (current: Dayjs): boolean => {
    if (!current) return false;

    // --- MONTHLY ---
    if (frequency === "monthly") {
      // only allow month-end
      if (!isMonthEnd(current)) return true;

      // enforce end >= start
      if (startValue && current.isBefore(startValue, "day")) {
        return true;
      }

      return false;
    }

    // --- DAILY ---
    if (frequency === "daily") {
      // disable non-business days
      if (isWeekend(current)) return true;
      if (isHoliday(current, holidays)) return true;

      // enforce end >= start
      if (startValue && current.isBefore(startValue, "day")) {
        return true;
      }

      return false;
    }

    return false;
  };
};

export default function ConfigTabbedCompact({
  config,
  assetClassOptions,
  portfolioOptions,
  benchmarkOptions,
  initialValues,
  onAssetClassChange,
  onApply,
  onSave,
  open,
  onClose,
  onPortfolioChange,
}: Props) {
  const [state, setState] = useState<AttribAnalysisSelectionState>(() =>
    createDefaultState(config, initialValues)
  );

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setState(createDefaultState(config, initialValues));
    }

    wasOpenRef.current = open;
  }, [open, config, initialValues]);

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

  useEffect(() => {
    if (!state.portfolio) return;
    if (!benchmarkOptions.length) return;

    const isValid = benchmarkOptions.some(
      (b) => b.value === state.benchmark
    );

    if (!isValid) {
      setState((prev) => ({
        ...prev,
        benchmark: benchmarkOptions[0].value,
      }));
    }
  }, [state.portfolio, benchmarkOptions]);

  const benchmarkValue =
    state.benchmark &&
    benchmarkOptions.some((o) => o.value === state.benchmark)
      ? state.benchmark
      : undefined;

   const hasValidDate =
    state.frequencyMode.toLowerCase() === "monthly"
      ? Boolean(state.endDate)
      : Boolean(state.startDate && state.endDate);

  const canApply =
    Boolean(state.assetClass) &&
    Boolean(state.portfolio) &&
    Boolean(state.breakdownModeId) &&
    state.selectedColumnIds.length > 0 &&
    state.periodIds.length > 0 &&
    hasValidDate;

const { RangePicker } = DatePicker;

const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);

const handleChange = (vals: [Dayjs | null, Dayjs | null] | null) => {
  if (!vals) {
    setDates(null);
    setState((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    return;
  }

  const [start, end] = vals;

  const normalizedStart =
    state.frequencyMode === "monthly" && start
      ? start.endOf("month")
      : start;

  const normalizedEnd =
    state.frequencyMode === "monthly" && end
      ? end.endOf("month")
      : end;

  const normalized: [Dayjs | null, Dayjs | null] = [
    normalizedStart,
    normalizedEnd,
  ];

  setDates(normalized);

      setState((prev) => ({
        ...prev,
        startDate: normalizedStart ? normalizedStart.format("YYYY-MM-DD") : "",
        endDate: normalizedEnd ? normalizedEnd.format("YYYY-MM-DD") : "",
      }));

};
const disabledDate = useMemo(
  () =>
    createRangeDisabledDate({
      frequency: state.frequencyMode === "monthly" ? "monthly" : "daily",
      startValue: dates?.[0] ?? null,
    }),
  [state.frequencyMode, dates]
);

const portfolioValue =
  state.portfolio &&
  portfolioOptions.some((o) => o.value === state.portfolio)
    ? state.portfolio
    : undefined;

  return (
          <Drawer
          open={open}
          onClose={onClose}
            width={500}

          style={{ marginTop: 65, marginBottom:40 }}
          title={
            <Space direction="vertical" size={0}>
              <Space size={6}>
                <SlidersOutlined style={{ color: "#1d4ed8" }} />
                <Title level={5} style={{ margin: 0 }}>Configure Attribution Analysis</Title>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>Scope, metric, grouping, filters, and ranking.</Text>
            </Space>
          }
          destroyOnClose={false}
          extra={
            <Space size={6}>
              <Button size="small" icon={<SaveOutlined />}onClick={handleSave} >Save</Button>
              <Button size="small" type="primary" icon={<PlayCircleOutlined />}disabled={!canApply} onClick={handleApply}>Apply</Button>
            </Space>
          }
          styles={{
            header: { padding: "10px 14px", borderBottom: "1px solid #d8dee9" },
            body: { background: "#f3f6fb", padding: 12 },
            footer: { padding: "8px 12px" }
          }}
        >


    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: "general",
            label: "General",
            children: (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Card size="small"  title="Analysis Scope" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
                  <Form layout="vertical">
                    <Row gutter={10}>
                      <Col span={24}>
                        <Form.Item label="Asset Class" rules={[{ required: true, message: "Asset Class is required" }]}>
                              <Segmented<AssetClass>  className="blue-segmented"
                                block
                                value={state.assetClass ?? undefined}
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

                      <Col span={12}>
                        <Form.Item label="Portfolio" rules={[{ required: true, message: "Portfolio is required" }]}>
                          <Select size="small" placeholder="Select portfolio"
                            value={portfolioValue}
                            options={portfolioOptions}
                            showSearch
                            optionFilterProp="label"
                            disabled={!state.assetClass}

                            onChange={(val) => {
                              setState((prev) => ({
                                ...prev,
                                portfolio: val,
                                benchmark: "",
                              }));

                              onPortfolioChange?.(val);

                            }}

                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label="Benchmark">
                          <Select size="small"
                            value={benchmarkValue}
                            options={benchmarkOptions}
                            showSearch
                            optionFilterProp="label"
                             disabled={!portfolioValue || !benchmarkOptions.length}
                            onChange={(val) =>
                              setState((prev) => ({
                                ...prev,
                                benchmark: val,
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={6}>
                        <Form.Item label="Frequency">
                          <Select size="small"
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
                        <Col span={18}>
                          <Form.Item label="Start Date - End Date">

                            <RangePicker
                              value={dates}
                              onChange={handleChange}
                              disabledDate={disabledDate}
                            />

                          </Form.Item>

                        </Col>
                      </Row>
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
                      <Select size="small"
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
    </Drawer>
  );
}