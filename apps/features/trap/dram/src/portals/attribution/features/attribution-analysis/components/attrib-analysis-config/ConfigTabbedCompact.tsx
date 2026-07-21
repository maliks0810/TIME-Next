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
  Tooltip,
  Typography,
  Collapse,
  Divider,
  List,
  Input,
  Tag,
  Popconfirm,
} from "antd";
import {
  ApartmentOutlined,
  CalendarOutlined,
  HolderOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SlidersOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  FilterOutlined,
  StarFilled,
  StarOutlined,
  DeleteOutlined,
  DollarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "../../lib/styles.css";
import "./styles.scss";
import { CheckableTagGroup } from "../CheckableTagGroup";
import {
  FilterOption,
  GridConfigResponse,
  normalizeColumns,
  NormalizedColumnConfig,
  ResolvedFilterOptionsCatalog,
} from "../dram-grid";
import dayjs, { Dayjs } from "dayjs";
import { AssetClass } from "../../lib/types";
import { ColumnConfigurator } from "../driver-analysis-config/ColumnConfigurator";
import { DriverColumnConfigState } from "../driver-analysis-config/columnConfigTypes";
import { fromColumnConfigState, toColumnConfigStateFromGrid } from "./hooks/columnConfigAdapters";
import { BREAKDOWN_PRESETS } from "./breakdownPresets";
import { BreakdownChainBuilder } from "./BreakdownChainBuilder";
import { UniversalFilterSearch } from "./UniversalFilterSearch";
import { FilterChipBar } from "./FilterChipBar";
import { FilterGroupSection } from "./FilterGroupSection";
import { filterDimensionsForAssetClass, isChainValidForAssetClass } from "./breakdownScoping";

const { Text, Title } = Typography;

type FilterGroupId = keyof AttribFilterState;

const compactCardStyle: React.CSSProperties = {
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #d8dee9",
};

const compactCardBodyStyle: React.CSSProperties = { padding: 10 };
export interface BreakdownLevel {
  /** Stable ID matching a dimension in the config catalog. */
  dimensionId: string;
  /** Display label shown in chips/tags. */
  label: string;

  /**
   * Semantic grouping for visual coloring and category rollup.
   * Examples: "classification", "geo", "credit", "custom".
   * Independent of asset-class scoping.
   */
  group?: string;
  /**
   * Asset-class scope — undefined means universal (available for all).
   * When set, dimension is only offered when workspace is in that asset class.
   */
  assetClass?: AssetClass;

}

export interface BreakdownChain {
  presetId?: string;
  levels: BreakdownLevel[];
}

/**
 * Singleton empty chain — reused across defaults, clear actions,
 * and legacy view migration. Module-level to preserve reference equality
 * for downstream memoization.
 */
export const EMPTY_BREAKDOWN_CHAIN: BreakdownChain = {
  presetId: undefined,
  levels: [],
};

export interface BreakdownPreset {
  id: string;
  label: string;
  description?: string;

  /** Semantic category for organizing the preset picker menu. */
  category: "equity" | "fixedIncome" | "geo" | "classification" | "custom";
  levels: BreakdownLevel[];
  /**
   * Explicit asset-class scoping.
   * If undefined, inferred from levels: preset is available when ALL its levels
   * are available for the current asset class.
   */
  assetClass?: AssetClass;


}
export type AttribFilterState = {
  currency: string[];
  country: string[];
  sector: string[];
  rating: string[];
};

export type AttribAnalysisSelectionState = {
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
  filters: AttribFilterState;
  breakdownChain: BreakdownChain;
};

export type AttribAnalysisApplyPayload = AttribAnalysisSelectionState & {
  configuredColumns: NormalizedColumnConfig[];
};
type Option = { label: string; value: string; inceptionDate?: string };

type Props = {
  config: GridConfigResponse;
  assetClassOptions: SegmentedProps<AssetClass>["options"];
  portfolioOptions: Option[];
  benchmarkOptions: Option[];
  initialValues?: Partial<AttribAnalysisSelectionState>;
  onAssetClassChange?: (asset: string) => void;
  onApply?: (payload: AttribAnalysisApplyPayload) => void;
  onSave?: (payload: AttribAnalysisApplyPayload) => void;
  onClose: () => void;
  open: boolean;
  onPortfolioChange?: (portfolio: string) => void;

  // Saved views
  savedViews?: AttribSavedView[];
  activeSavedViewId?: string;
  favoriteSavedViewId?: string;
  onSaveView?: (name: string, description: string | undefined, state: AttribAnalysisSelectionState) => void;
  onLoadView?: (viewId: string, options?: { autoRun?: boolean }) => void;
  onDeleteView?: (viewId: string) => void;
  onSetFavoriteView?: (viewId: string | undefined) => void;

  filterOptions?: ResolvedFilterOptionsCatalog;
};

// ---------- Section machinery  ----------

type ControlSectionId =
  | "savedViews"
  | "analysisScope"
  | "dateRange"
  | "periods"
  | "breakdown"
  | "columns"
  | "filters";

interface ControlSectionDefinition {
  id: ControlSectionId;
  title: string;
  description: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}


const defaultSectionOrder: ControlSectionId[] = [
  "savedViews",
  "analysisScope",
  "dateRange",
  "periods",
  "breakdown",
  "columns",
  "filters",
];

const defaultExpandedSections: ControlSectionId[] = [
  "analysisScope",
  "dateRange",
  "periods",
  "breakdown",
];


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
                <Tooltip title="Drag to rearrange this section">
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

// ---------- Existing helpers (unchanged) ----------

function buildConfiguredColumns(
  config: GridConfigResponse,
  selectedColumnIds: string[],
): NormalizedColumnConfig[] {
  return normalizeColumns(config, {
    order: selectedColumnIds,
    widths: {},
    visibility: Object.fromEntries(
      config.columnConfigs.all.map((c) => [c.id, selectedColumnIds.includes(c.id)]),
    ),
  });
}

function createDefaultState(
  config: GridConfigResponse,
  initialValues?: Partial<AttribAnalysisSelectionState>,
): AttribAnalysisSelectionState {


  const legacyBreakdownId =
    initialValues?.breakdownModeId ?? config.breakdownMode[0]?.id ?? "";

  const breakdownChain: BreakdownChain =
    initialValues?.breakdownChain ??
    (legacyBreakdownId
      ? {
          presetId: undefined,
          levels: [
            {
              dimensionId: legacyBreakdownId,
              label:
                config.breakdownMode.find((b) => b.id === legacyBreakdownId)
                  ?.label ?? legacyBreakdownId,
            },
          ],
        }
      : EMPTY_BREAKDOWN_CHAIN);


  return {
    assetClass: initialValues?.assetClass ?? null,
    asOfDate: initialValues?.asOfDate ?? "",
    startDate: initialValues?.startDate ?? "",
    endDate: initialValues?.endDate ?? "",
    portfolio: initialValues?.portfolio ?? "",
    benchmark: initialValues?.benchmark ?? "",
    frequencyMode:
      initialValues?.frequencyMode ?? config.frequencyMode[0]?.id ?? "monthly",
    periodIds: initialValues?.periodIds ?? ["MTD"],
    selectedColumnIds:
      initialValues?.selectedColumnIds ??
      config.columnConfigs.all
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.id),
    filters: initialValues?.filters ?? {
      currency: [],
      country: [],
      sector: [],
      rating: [],
    },

    breakdownModeId: legacyBreakdownId,
    breakdownChain: breakdownChain,

  };
}
export interface AttribSavedView {
  id: string;
  name: string;
  description?: string;
  state: AttribAnalysisSelectionState;
  createdAt: string;
  updatedAt: string;
}
type Frequency = "monthly" | "daily";

interface RangeDisabledArgs {
  frequency: Frequency;
  holidays?: Set<string>;
  startValue?: Dayjs | null;
}

const isMonthEnd = (d: Dayjs): boolean => d.isSame(d.endOf("month"), "day");
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
    if (frequency === "monthly") {
      if (!isMonthEnd(current)) return true;
      if (startValue && current.isBefore(startValue, "day")) return true;
      return false;
    }
    if (frequency === "daily") {
      if (isWeekend(current)) return true;
      if (isHoliday(current, holidays)) return true;
      if (startValue && current.isBefore(startValue, "day")) return true;
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
  inceptionDate?: Dayjs | null,
): Dayjs => {
  if (inceptionDate && startDate.isBefore(inceptionDate, "day")) {
    return inceptionDate.startOf("day");
  }
  return startDate.startOf("day");
};

const getPeriodStartDate = (
  periodId: string,
  input: PeriodBoundaryInput,
): Dayjs | null => {
  const code = normalizePeriodCode(periodId);
  const { asOfDate, inceptionDate } = input;
  if (code === "MTD") return clampToInception(asOfDate.startOf("month"), inceptionDate);
  if (code === "QTD") return clampToInception(getQuarterStart(asOfDate), inceptionDate);
  if (code === "YTD") return clampToInception(asOfDate.startOf("year"), inceptionDate);
  if (code === "ITD" || code === "SI")
    return inceptionDate ? inceptionDate.startOf("day") : null;

  const yearMatch = /^(\d+)Y$/.exec(code);
  if (yearMatch)
    return clampToInception(
      getRollingMonthStart(asOfDate, Number(yearMatch[1]) * 12),
      inceptionDate,
    );

  const monthMatch = /^(\d+)M$/.exec(code);
  if (monthMatch)
    return clampToInception(
      getRollingMonthStart(asOfDate, Number(monthMatch[1])),
      inceptionDate,
    );

  return null;
};

const getMinStartDateFromPeriods = (
  periodIds: string[],
  input: PeriodBoundaryInput,
): Dayjs | null => {
  const dates = periodIds
    .map((periodId) => getPeriodStartDate(periodId, input))
    .filter((value): value is Dayjs => value !== null);
  if (!dates.length) return null;
  return dates.reduce((min, current) =>
    current.isBefore(min, "day") ? current : min,
  );
};

// ---------- Component ----------

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
  savedViews,
  activeSavedViewId,
  favoriteSavedViewId,
  onSaveView,
  onLoadView,
  onDeleteView,
  onSetFavoriteView,
  filterOptions,
}: Props) {
  const [state, setState] = useState<AttribAnalysisSelectionState>(() =>
    createDefaultState(config, initialValues),
  );
  const wasOpenRef = useRef(false);

const initialValuesRef = useRef(initialValues);
useEffect(() => {
  initialValuesRef.current = initialValues;
}, [initialValues]);

useEffect(() => {
  if (open && !wasOpenRef.current) {
    setState(createDefaultState(config, initialValuesRef.current));
  }
  wasOpenRef.current = open;
}, [open, config]);

 const prevActiveViewRef = useRef(activeSavedViewId);
  useEffect(() => {    if (
          open &&
                activeSavedViewId &&
                     activeSavedViewId !== prevActiveViewRef.current
                        ) {
                                setState(createDefaultState(config, initialValuesRef.current));
                                  }
                                      prevActiveViewRef.current = activeSavedViewId;
                                      }, [open, activeSavedViewId, config]);

  const [sectionOrder, setSectionOrder] =
    useState<ControlSectionId[]>(defaultSectionOrder);
  const [expandedSections, setExpandedSections] =
    useState<ControlSectionId[]>(defaultExpandedSections);

  const sectionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

const availableBreakdownDimensions = useMemo<BreakdownLevel[]>(
  () =>
    config.breakdownMode.map((b) => ({
      dimensionId: b.id,
      label: b.label,
      group: (b as { group?: string }).group,
      assetClass: (b as { assetClass?: AssetClass }).assetClass,

    })),
  [config.breakdownMode],
);

const breakdownContent = (
  <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
    <BreakdownChainBuilder
      value={state.breakdownChain}
      onChange={(next) => {
        setState((prev) => ({
          ...prev,
          breakdownChain: next,
          breakdownModeId: next.levels[0]?.dimensionId ?? "",
        }));
      }}
      availableDimensions={availableBreakdownDimensions}
      presets={BREAKDOWN_PRESETS}
      assetClass={state.assetClass}
    />
  </Card>
);

// Effect: prune invalid breakdown levels when asset class changes
useEffect(() => {
  if (!state.assetClass) return;
  if (isChainValidForAssetClass(state.breakdownChain, state.assetClass)) return;

  // Chain has invalid levels — strip them
  const validLevels = filterDimensionsForAssetClass(
    state.breakdownChain.levels,
    state.assetClass,
  );

  setState((prev) => ({
    ...prev,
    breakdownChain: {
      // Clear presetId since the preset may no longer be intact
      presetId: undefined,
      levels: validLevels,
    },
    breakdownModeId: validLevels[0]?.dimensionId ?? "",
  }));
}, [state.assetClass, state.breakdownChain]);

  const periods = useMemo(() => {
    return (config.periods[0] ?? [])
      .filter((p) => p.visible && p.frequency_mode === state.frequencyMode)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [config, state.frequencyMode]);

  const configuredColumns = useMemo(() => {
    return buildConfiguredColumns(config, state.selectedColumnIds);
  }, [config, state.selectedColumnIds]);

  const handleApply = () => {
    onApply?.({ ...state, configuredColumns });
  };

  const handleSave = () => {
    onSave?.({ ...state, configuredColumns });
  };

  useEffect(() => {
    if (!state.portfolio) return;
    if (!benchmarkOptions.length) return;
    const isValid = benchmarkOptions.some((b) => b.value === state.benchmark);
    if (!isValid) {
      setState((prev) => ({ ...prev, benchmark: benchmarkOptions[0].value }));
    }
  }, [state.portfolio, benchmarkOptions]);

  const benchmarkValue =
    state.benchmark && benchmarkOptions.some((o) => o.value === state.benchmark)
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
    if (!selectedPortfolioOption?.inceptionDate) return null;
    const parsed = dayjs(selectedPortfolioOption.inceptionDate);
    return parsed.isValid() ? parsed : null;
  }, [selectedPortfolioOption?.inceptionDate]);

  const hasValidItdSelection =
    !hasItdSelected || Boolean(portfolioInceptionDate);

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
    if (!state.asOfDate) return null;
    const parsed = dayjs(state.asOfDate);
    return parsed.isValid() ? parsed : null;
  }, [state.asOfDate]);

  const dailyRangeValue = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
    if (!state.startDate && !state.endDate) return null;
    return [
      state.startDate ? dayjs(state.startDate) : null,
      state.endDate ? dayjs(state.endDate) : null,
    ];
  }, [state.startDate, state.endDate]);

  const handleMonthlyAsOfChange = (value: Dayjs | null): void => {
    if (!value) {
      setState((prev) => ({ ...prev, asOfDate: "", startDate: "", endDate: "" }));
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
    vals: [Dayjs | null, Dayjs | null] | null,
  ): void => {
    if (!vals) {
      setState((prev) => ({ ...prev, asOfDate: "", startDate: "", endDate: "" }));
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
    if (!current) return false;
    return !isMonthEnd(current);
  };

  const dailyDisabledDate = useMemo(
    () =>
      createRangeDisabledDate({
        frequency: "daily",
        startValue: dailyRangeValue?.[0] ?? null,
      }),
    [dailyRangeValue],
  );

  useEffect(() => {
    if (state.frequencyMode !== "monthly") return;
    if (!state.asOfDate) return;
    const parsedAsOfDate = dayjs(state.asOfDate);
    if (!parsedAsOfDate.isValid()) return;

    const minStartDate = getMinStartDateFromPeriods(state.periodIds, {
      asOfDate: parsedAsOfDate,
      inceptionDate: portfolioInceptionDate,
    });
    const nextStartDate = minStartDate ? minStartDate.format(DATE_FORMAT) : "";
    const nextEndDate = parsedAsOfDate.format(DATE_FORMAT);

    if (state.startDate === nextStartDate && state.endDate === nextEndDate) return;

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
    state.portfolio && portfolioOptions.some((o) => o.value === state.portfolio)
      ? state.portfolio
      : undefined;

  // ---------- Section content ----------

  const analysisScopeContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Form layout="vertical">
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item label="Asset Class" required>
              <Segmented<AssetClass>
                className="blue-segmented"
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
            <Form.Item label="Portfolio" required>
              <Select
                size="small"
                placeholder="Select portfolio"
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
              <Select
                size="small"
                value={benchmarkValue}
                options={benchmarkOptions}
                showSearch
                optionFilterProp="label"
                disabled={!portfolioValue || !benchmarkOptions.length}
                onChange={(val) =>
                  setState((prev) => ({ ...prev, benchmark: val }))
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const dateRangeContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Form layout="vertical">
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label="Frequency">
              <Select
                size="small"
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
          <Col span={16}>
            {state.frequencyMode === "monthly" ? (
              <Form.Item label="As Of Date">
                <DatePicker
                  size="small"
                  value={monthlyAsOfValue}
                  onChange={handleMonthlyAsOfChange}
                  disabledDate={monthlyDisabledDate}
                  style={{ width: "100%" }}
                />
                {state.startDate && state.endDate ? (
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 12, marginTop: 4 }}
                  >
                    Run analysis range: {state.startDate} → {state.endDate}
                  </Text>
                ) : null}
                {hasItdSelected && !portfolioInceptionDate ? (
                  <Text
                    type="warning"
                    style={{ display: "block", fontSize: 12, marginTop: 4 }}
                  >
                    ITD requires portfolio inception date to calculate the min
                    start date.
                  </Text>
                ) : null}
              </Form.Item>
            ) : (
              <Form.Item label="Start Date - End Date">
                <RangePicker
                  size="small"
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
  );

  const periodsContent = (
    <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
      <Form layout="vertical">
        <Form.Item label="Periods" style={{ marginBottom: 0 }}>
          <CheckableTagGroup
            value={state.periodIds}
            onChange={(value) =>
              setState((prev) => ({ ...prev, periodIds: value as string[] }))
            }
            options={periods.map((p) => ({
              label: p.label,
              value: p.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Card>
  );

const columnConfiguratorValue = useMemo<DriverColumnConfigState>(
  () => toColumnConfigStateFromGrid(config, state.selectedColumnIds),
  [config, state.selectedColumnIds],
);

const handleColumnConfigChange = (next: DriverColumnConfigState) => {
  setState((prev) => ({
    ...prev,
    selectedColumnIds: fromColumnConfigState(next),
  }));
};
function buildDefaultSavedViewName(state: AttribAnalysisSelectionState): string {
  const parts = [
    state.assetClass ?? "AssetClass",
    state.portfolio || "Portfolio",
    state.periodIds.slice(0, 2).join("/") || "Periods",
  ];
  return `${parts.join(" • ")} — ${dayjs().format("YYYY-MM-DD HH:mm")}`;
}
// ...in the section content:
const columnsContent = (
  <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
    <ColumnConfigurator
      value={columnConfiguratorValue}
      onChange={handleColumnConfigChange}
    />
  </Card>
);
// ---------- Saved Views content ----------

const [savedViewName, setSavedViewName] = useState("");
const [savedViewDescription, setSavedViewDescription] = useState("");

const handleQuickSaveView = () => {
  const name = savedViewName.trim() || buildDefaultSavedViewName(state);
  onSaveView?.(name, savedViewDescription.trim() || undefined, state);
  setSavedViewName("");
  setSavedViewDescription("");
};

const savedViewsContent = (
  <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Space size={6} style={{ width: "100%" }}>
        <Input
          size="small"
          placeholder="View name"
          value={savedViewName}
          onChange={(e) => setSavedViewName(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          size="small"
          type="primary"
          ghost
          icon={<SaveOutlined />}
          onClick={handleQuickSaveView}
          disabled={!onSaveView}
        >
          Save
        </Button>
      </Space>
      <Input
        size="small"
        placeholder="Description (optional)"
        value={savedViewDescription}
        onChange={(e) => setSavedViewDescription(e.target.value)}
      />

      {(savedViews ?? []).length === 0 ? (
        <Text type="secondary" style={{ fontSize: 12 }}>
          No saved views yet. Save the current configuration to reuse it later.
        </Text>
      ) : (
        <List
          size="small"
          dataSource={savedViews}
          renderItem={(view) => (
            <List.Item
              style={{
                background:
                  view.id === activeSavedViewId ? "#eff6ff" : undefined,
                borderRadius: 6,
                padding: "6px 8px",
              }}
              actions={[
                <Tooltip
                  key="favorite"
                  title={
                    favoriteSavedViewId === view.id
                      ? "Unset as favorite"
                      : "Set as favorite"
                  }
                >
                  <Button
                    size="small"
                    type="text"
                    icon={
                      favoriteSavedViewId === view.id ? (
                        <StarFilled style={{ color: "#f59e0b" }} />
                      ) : (
                        <StarOutlined />
                      )
                    }
                    onClick={() =>
                      onSetFavoriteView?.(
                        favoriteSavedViewId === view.id ? undefined : view.id,
                      )
                    }
                  />
                </Tooltip>,
                <Button
                  key="load"
                  size="small"
                  onClick={() => onLoadView?.(view.id)}
                >
                  Load
                </Button>,
                <Button
                  key="loadRun"
                  size="small"
                  type="primary"
                  ghost
                  icon={<PlayCircleOutlined />}
                  onClick={() => onLoadView?.(view.id, { autoRun: true })}
                >
                  Load & Run
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this saved view?"
                  onConfirm={() => onDeleteView?.(view.id)}
                >
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space size={6}>
                    <span>{view.name}</span>
                    {view.id === activeSavedViewId && (
                      <Tag color="blue">Active</Tag>
                    )}
                    {view.id === favoriteSavedViewId && (
                      <Tag color="gold">Favorite</Tag>
                    )}
                  </Space>
                }
                description={
                  view.description ? (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {view.description}
                    </Text>
                  ) : null
                }
              />
            </List.Item>
          )}
        />
      )}
    </Space>
  </Card>
);

// ---------- Filters content ----------

const filterCatalog = filterOptions ?? {
  currency: [],
  country: [],
  sector: [],
  rating: [],
};
const [filterGroupsCollapsed, setFilterGroupsCollapsed] = useState<
  Record<FilterGroupId, boolean>
>({
  currency: false,
  country: false,
  sector: true,   // collapse less-used ones by default
  rating: true,
});

const handleToggleFilterGroup = (groupId: string) => {
  const id = groupId as FilterGroupId;
  const next = { ...filterGroupsCollapsed };
  next[id] = !next[id];
  setFilterGroupsCollapsed(next);
};
const filterOptionLookup = useMemo(() => {
  const build = (opts: FilterOption[]) =>
    new Map(opts.map((o) => [o.value, o.label]));
  return {
    currency: build(filterCatalog.currency ?? []),
    country: build(filterCatalog.country ?? []),
    sector: build(filterCatalog.sector ?? []),
    rating: build(filterCatalog.rating ?? []),
  };
}, [filterCatalog]);

const optionsByGroup = useMemo(
  () => ({
    currency: filterCatalog.currency ?? [],
    country: filterCatalog.country ?? [],
    sector: filterCatalog.sector ?? [],
    rating: filterCatalog.rating ?? [],
  }),
  [filterCatalog],
);
const handleFilterGroupChange = (group: FilterGroupId, values: string[]) => {
  setState((prev) => {
    const nextFilters: AttribFilterState = { ...prev.filters };
    nextFilters[group] = values;
    return { ...prev, filters: nextFilters };
  });
};

const handleRemoveOneFilter = (group: FilterGroupId, value: string) => {
  setState((prev) => {
    const nextFilters: AttribFilterState = { ...prev.filters };
    nextFilters[group] = prev.filters[group].filter((v) => v !== value);
    return { ...prev, filters: nextFilters };
  });
};

const handleClearFilterGroup = (group: FilterGroupId) => {
  setState((prev) => {
    const nextFilters: AttribFilterState = { ...prev.filters };
    nextFilters[group] = [];
    return { ...prev, filters: nextFilters };
  });
};

const handleClearAllFilters = () => {
  setState((prev) => ({
    ...prev,
    filters: { currency: [], country: [], sector: [], rating: [] },
  }));
};

const handleAddFilterFromSearch = (group: FilterGroupId, value: string) => {
  setState((prev) => {
    if (prev.filters[group].includes(value)) return prev; // already present
    const nextFilters: AttribFilterState = { ...prev.filters };
    nextFilters[group] = [...prev.filters[group], value];
    return { ...prev, filters: nextFilters };
  });
};

const filtersContent = (
  <Card size="small" style={compactCardStyle} bodyStyle={compactCardBodyStyle}>
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {/* Universal search */}
      <UniversalFilterSearch
        optionsByGroup={optionsByGroup}
        selectedByGroup={state.filters}
        onAdd={handleAddFilterFromSearch}
      />

      {/* Active-filter chips */}
      <FilterChipBar
        filters={state.filters}
        optionLookup={filterOptionLookup}
        onRemoveOne={handleRemoveOneFilter}
        onClearGroup={handleClearFilterGroup}
        onClearAll={handleClearAllFilters}
      />

      <Divider style={{ margin: "0" }} />

      {/* Collapsible group sections */}
      <div>
        <FilterGroupSection
          groupId="currency"
          title="Currency"
          icon={<DollarOutlined style={{ color: "#f59e0b" }} />}
          options={optionsByGroup.currency}
          selectedValues={state.filters.currency}
          collapsed={filterGroupsCollapsed.currency}
          onToggleCollapsed={handleToggleFilterGroup}
          onChange={(values) => handleFilterGroupChange("currency", values)}
        />
        <FilterGroupSection
          groupId="country"
          title="Country"
          icon={<GlobalOutlined style={{ color: "#10b981" }} />}
          options={optionsByGroup.country}
          selectedValues={state.filters.country}
          collapsed={filterGroupsCollapsed.country}
          onToggleCollapsed={handleToggleFilterGroup}
          onChange={(values) => handleFilterGroupChange("country", values)}
        />
        <FilterGroupSection
          groupId="sector"
          title="Sector"
          icon={<ApartmentOutlined style={{ color: "#3b82f6" }} />}
          options={optionsByGroup.sector}
          selectedValues={state.filters.sector}
          collapsed={filterGroupsCollapsed.sector}
          onToggleCollapsed={handleToggleFilterGroup}
          onChange={(values) => handleFilterGroupChange("sector", values)}
        />
        <FilterGroupSection
          groupId="rating"
          title="Rating"
          icon={<StarOutlined style={{ color: "#8b5cf6" }} />}
          options={optionsByGroup.rating}
          selectedValues={state.filters.rating}
          collapsed={filterGroupsCollapsed.rating}
          onToggleCollapsed={handleToggleFilterGroup}
          onChange={(values) => handleFilterGroupChange("rating", values)}
        />
      </div>
    </Space>
  </Card>
);
  // ---------- Section registry ----------
 const sectionsById: Record<ControlSectionId, ControlSectionDefinition> = {
  savedViews: {
    id: "savedViews",
    title: "Saved Views",
    description: "Load, save, and favorite reusable configurations",
    icon: <SaveOutlined />,
    content: savedViewsContent,
  },
    analysisScope: {
      id: "analysisScope",
      title: "Portfolio Selection",
      description: "Asset class, portfolio, and benchmark",
      icon: <SlidersOutlined />,
      content: analysisScopeContent,
    },
    dateRange: {
      id: "dateRange",
      title: "Frequency & Date",
      description: "Frequency mode and as-of / range dates",
      icon: <CalendarOutlined />,
      content: dateRangeContent,
    },
    periods: {
      id: "periods",
      title: "Periods",
      description: "MTD, QTD, YTD, ITD, and rolling periods",
      icon: <AppstoreOutlined />,
      content: periodsContent,
    },
    breakdown: {
      id: "breakdown",
      title: "Breakdown",
      description: "Grouping mode for attribution breakdown",
      icon: <ApartmentOutlined />,
      content: breakdownContent,
    },
    columns: {
      id: "columns",
      title: `Columns (${state.selectedColumnIds.length})`,
      description: "Visible columns and display order",
      icon: <UnorderedListOutlined />,
      content: columnsContent,
    },
  filters: {
    id: "filters",
    title: "Filters",
    description: "Currency, country, sector, and rating",
    icon: <FilterOutlined />,
    content: filtersContent,
  },
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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose={false}
      style={{ marginTop: 65, marginBottom: 40 }}
      title={
        <Space direction="vertical" size={0}>
          <Space size={6}>
            <SlidersOutlined style={{ color: "#1d4ed8" }} />
            <Title level={5} style={{ margin: 0 }}>
              Configure Attribution Analysis
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Expand, collapse, and drag sections to personalize your workflow.
          </Text>
        </Space>
      }
      extra={
        <Space size={6}>
          <Button
            size="small"
            onClick={() => setExpandedSections(sectionOrder)}
          >
            Expand All
          </Button>
          <Button size="small" onClick={() => setExpandedSections([])}>
            Collapse All
          </Button>
          <Button size="small" icon={<SaveOutlined />} onClick={handleSave}>
            Save
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<PlayCircleOutlined />}
            disabled={!canApply}
            onClick={handleApply}
          >
            Apply
          </Button>
        </Space>
      }
      styles={{
        header: { padding: "10px 14px", borderBottom: "1px solid #d8dee9" },
        body: { background: "#f3f6fb", padding: 12 },
        footer: { padding: "8px 12px" },
      }}
    >
      <DndContext
        sensors={sectionSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
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
    </Drawer>
  );
}