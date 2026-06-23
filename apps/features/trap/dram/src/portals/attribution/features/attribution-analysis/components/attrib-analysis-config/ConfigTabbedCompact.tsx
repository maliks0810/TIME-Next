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
import dayjs, { Dayjs } from "dayjs";
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
  inceptionDate?: string;
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

type PeriodBoundaryInput = {
  asOfDate: Dayjs;
  inceptionDate?: Dayjs | null;
};

const DATE_FORMAT = "YYYY-MM-DD";

const normalizePeriodCode = (periodId: string): string =>
  periodId.trim().toUpperCase();

const getQuarterStart = (d: Dayjs): Dayjs => {
  const quarterStartMonth = Math.floor(d.month() / 3) * 3;
  return d.month(quarterStartMonth).startOf("month");
};

const getRollingMonthStart = (asOfDate: Dayjs, months: number): Dayjs =>
  asOfDate.subtract(months - 1, "month").startOf("month");

const clampToInception = (
  startDate: Dayjs,
  inceptionDate?: Dayjs | null
): Dayjs => {
  if (inceptionDate && startDate.isBefore(inceptionDate, "day")) {
    return inceptionDate.startOf("day");
  }

  return startDate.startOf("day");
};

const getPeriodStartDate = (
  periodId: string,
  input: PeriodBoundaryInput
): Dayjs | null => {
  const code = normalizePeriodCode(periodId);
  const { asOfDate, inceptionDate } = input;

  if (code === "MTD") {
    return clampToInception(asOfDate.startOf("month"), inceptionDate);
  }

  if (code === "QTD") {
    return clampToInception(getQuarterStart(asOfDate), inceptionDate);
  }

  if (code === "YTD") {
    return clampToInception(asOfDate.startOf("year"), inceptionDate);
  }

  if (code === "ITD" || code === "SI") {
    return inceptionDate ? inceptionDate.startOf("day") : null;
  }

  const yearMatch = /^(\d+)Y$/.exec(code);
  if (yearMatch) {
    const years = Number(yearMatch[1]);
    return clampToInception(getRollingMonthStart(asOfDate, years * 12), inceptionDate);
  }

  const monthMatch = /^(\d+)M$/.exec(code);
  if (monthMatch) {
    const months = Number(monthMatch[1]);
    return clampToInception(getRollingMonthStart(asOfDate, months), inceptionDate);
  }

  return null;
};

const getMinStartDateFromPeriods = (
  periodIds: string[],
  input: PeriodBoundaryInput
): Dayjs | null => {
  const dates = periodIds
    .map((periodId) => getPeriodStartDate(periodId, input))
    .filter((value): value is Dayjs => value !== null);

  if (!dates.length) {
    return null;
  }

  return dates.reduce((min, current) =>
    current.isBefore(min, "day") ? current : min
  );
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
    ? Boolean(state.asOfDate && state.startDate && state.endDate)
    : Boolean(state.startDate && state.endDate);

const hasItdSelected = useMemo(() => {
  return state.periodIds.some((periodId) => {
    const code = normalizePeriodCode(periodId);
    return code === "ITD" || code === "SI";
  });
}, [state.periodIds]);

const selectedPortfolioOption = useMemo(() => {
  return portfolioOptions.find((option) => option.value === state.portfolio);
}, [portfolioOptions, state.portfolio]);
const portfolioInceptionDate = useMemo(() => {
  if (!selectedPortfolioOption?.inceptionDate) {
    return null;
  }

  const parsed = dayjs(selectedPortfolioOption.inceptionDate);
  return parsed.isValid() ? parsed : null;
}, [selectedPortfolioOption?.inceptionDate]);

const hasValidItdSelection = !hasItdSelected || Boolean(portfolioInceptionDate);
const canApply =
  Boolean(state.assetClass) &&
  Boolean(state.portfolio) &&
  Boolean(state.breakdownModeId) &&
  state.selectedColumnIds.length > 0 &&
  state.periodIds.length > 0 &&
  hasValidDate &&
  hasValidItdSelection;

const { RangePicker } = DatePicker;

const monthlyAsOfValue = useMemo(() => {
  if (!state.asOfDate) {
    return null;
  }

  const parsed = dayjs(state.asOfDate);
  return parsed.isValid() ? parsed : null;
}, [state.asOfDate]);

const dailyRangeValue = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
  if (!state.startDate && !state.endDate) {
    return null;
  }

  return [
    state.startDate ? dayjs(state.startDate) : null,
    state.endDate ? dayjs(state.endDate) : null,
  ];
}, [state.startDate, state.endDate]);


const handleMonthlyAsOfChange = (value: Dayjs | null): void => {
  if (!value) {
    setState((prev) => ({
      ...prev,
      asOfDate: "",
      startDate: "",
      endDate: "",
    }));
    return;
  }

  const normalizedAsOf = value.endOf("month");
  const minStartDate = getMinStartDateFromPeriods(state.periodIds, {
    asOfDate: normalizedAsOf,
    inceptionDate: portfolioInceptionDate,
  });

  setState((prev) => ({
    ...prev,
    asOfDate: normalizedAsOf.format(DATE_FORMAT),
    startDate: minStartDate ? minStartDate.format(DATE_FORMAT) : "",
    endDate: normalizedAsOf.format(DATE_FORMAT),
  }));
};

const handleDailyRangeChange = (
  vals: [Dayjs | null, Dayjs | null] | null
): void => {
  if (!vals) {
    setState((prev) => ({
      ...prev,
      asOfDate: "",
      startDate: "",
      endDate: "",
    }));
    return;
  }

  const [start, end] = vals;

  setState((prev) => ({
    ...prev,
    asOfDate: end ? end.format(DATE_FORMAT) : "",
    startDate: start ? start.format(DATE_FORMAT) : "",
    endDate: end ? end.format(DATE_FORMAT) : "",
  }));
};

const monthlyDisabledDate = (current: Dayjs): boolean => {
  if (!current) {
    return false;
  }

  return !isMonthEnd(current);
};

const dailyDisabledDate = useMemo(
  () =>
    createRangeDisabledDate({
      frequency: "daily",
      startValue: dailyRangeValue?.[0] ?? null,
    }),
  [dailyRangeValue]
);

useEffect(() => {
  if (state.frequencyMode !== "monthly") {
    return;
  }

  if (!state.asOfDate) {
    return;
  }

  const parsedAsOfDate = dayjs(state.asOfDate);
  if (!parsedAsOfDate.isValid()) {
    return;
  }

  const minStartDate = getMinStartDateFromPeriods(state.periodIds, {
    asOfDate: parsedAsOfDate,
    inceptionDate: portfolioInceptionDate,
  });

  const nextStartDate = minStartDate ? minStartDate.format(DATE_FORMAT) : "";
  const nextEndDate = parsedAsOfDate.format(DATE_FORMAT);

  if (state.startDate === nextStartDate && state.endDate === nextEndDate) {
    return;
  }

  setState((prev) => ({
    ...prev,
    startDate: nextStartDate,
    endDate: nextEndDate,
  }));
}, [
  state.frequencyMode,
  state.asOfDate,
  state.periodIds,
  state.startDate,
  state.endDate,
  portfolioInceptionDate,
]);

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
                                periodIds: val === "daily" ? ["1D"] : ["MTD"],
                              }))
                            }

                          />
                        </Form.Item>
                      </Col>
                        <Col span={18}>
                            {state.frequencyMode === "monthly" ? (
                              <Form.Item label="As Of Date">
                                <DatePicker
                                  value={monthlyAsOfValue}
                                  onChange={handleMonthlyAsOfChange}
                                  disabledDate={monthlyDisabledDate}
                                  style={{ width: "100%" }}
                                />

                                {state.startDate && state.endDate ? (
                                  <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                                    Run analysis range: {state.startDate} → {state.endDate}
                                  </Text>
                                ) : null}

                                {hasItdSelected && !portfolioInceptionDate ? (
                                  <Text type="warning" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                                    ITD requires portfolio inceptionDate to calculate the min start date.
                                  </Text>
                                ) : null}
                              </Form.Item>
                            ) : (
                              <Form.Item label="Start Date - End Date">
                                <RangePicker
                                  value={dailyRangeValue}
                                  onChange={handleDailyRangeChange}
                                  disabledDate={dailyDisabledDate}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            )}
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