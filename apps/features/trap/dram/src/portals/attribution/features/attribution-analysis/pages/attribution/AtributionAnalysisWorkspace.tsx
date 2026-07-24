import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Segmented,
  SegmentedProps,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
  message,
} from "antd";
import AttributionPrintView from "../../components/dram-grid/AttributionPrintView";
import { BarChartOutlined, DownloadOutlined, ReloadOutlined, SettingOutlined } from "@ant-design/icons";

import {
  AnalyticResultRow,
  AnalyticsResponse,
  api,
  OptionsResponse,
} from "../../lib/services";
import {
  AssetClass,
  PortBenchRow,
} from "../../lib/types";
import {
  buildBenchmarkOptions,
  buildPortfolioOptions,
  extractGridConfig,
} from "../../lib/helpers";
import {
  buildFilterOptions,
  DramDataGrid,
  DramGridProvider,
  exportAttributionGridsToExcel,
  getEffectiveColumns,
  GridConfigResponse,
  NormalizedColumnConfig,
} from "../../components/dram-grid";
import { getKeyByAssetClass } from "../../components/WizardStateStore";
import { getLastMonthEnd } from "../../components/AlphaDashboard/utils/alphaDashboardHelpers";
import AttributionCompareView from "../../components/dram-grid/AttributionCompareView";
import AttributionSingleModeChart from "../../components/dram-grid/AttributionSingleModeChart";
import ConfigTabbedCompact, { AttribAnalysisApplyPayload, AttribAnalysisSelectionState, AttribFilterState, BreakdownChain, EMPTY_BREAKDOWN_CHAIN } from "../../components/attrib-analysis-config/ConfigTabbedCompact";
import { CompositeAttributionView } from "../../components/dram-grid/CompositeAttributionView";
import { buildCompositeAttributionData, toCompositePeriods } from "../../components/dram-grid/compositeAttributionAdapter";
import CompositeSummaryChart from "../../components/dram-grid/CompositeSummaryChart";
import CompositeMatrixChart from "../../components/dram-grid/CompositeMatrixChart";
import { AttribSavedView, createAttribSavedView, loadAttribSavedViews, loadFavoriteAttribViewId, persistAttribSavedViews, persistFavoriteAttribViewId } from "../../components/attrib-analysis-config/attribSavedViewsStorage";
import { AttribCollapsedState, attribSectionDescriptions, AttribSectionId, attribSectionLabels, AttribSectionSpan, AttribSpanState, defaultAttribCollapsedState, defaultAttribOrder, defaultAttribSpanState, loadAttribCollapsed, loadAttribOrder, loadAttribSpans, persistAttribCollapsed, persistAttribOrder, persistAttribSpans } from "./attributionLayoutStorage";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AttributionResultCard } from "./AttributionResultCard";

const { Title, Text } = Typography;

/* ----------------------------- helpers ----------------------------- */

const extractPortBenchRows = (apiResp: OptionsResponse): PortBenchRow[] => {
  const allRows = Array.isArray(apiResp.data?.grids)
    ? apiResp.data.grids.flatMap((g) => (Array.isArray(g.rows) ? g.rows : []))
    : [];

  return allRows
    .filter((r) => typeof r === "object" && r !== null)
    .map((r) => ({
      PORTFOLIO_KEY: String(r["PORTFOLIO_KEY"] ?? ""),
      PORTFOLIO_NAME: String(r["PORTFOLIO_NAME"] ?? ""),
      PORTFOLIO_BENCHMARK_CODE: r["PORTFOLIO_BENCHMARK_CODE"] ?? null,
      PORTFOLIO_BENCHMARK_NAME: r["PORTFOLIO_BENCHMARK_NAME"] ?? null,
      PORTFOLIO_SECONDARY_BENCHMARK_CODE:
        r["PORTFOLIO_SECONDARY_BENCHMARK_CODE"] ?? null,
      PORTFOLIO_SECONDARY_BENCHMARK_NAME:
        r["PORTFOLIO_SECONDARY_BENCHMARK_NAME"] ?? null,
      DATE_INCEPTION:
        r["DATE_INCEPTION"] ?? null,
    }))
    .filter((r) => r.PORTFOLIO_KEY !== "" && r.PORTFOLIO_NAME !== "");
};

type AnalysisInput = {
  assetClass: AssetClass;
  portfolio: string;
  benchmark: string;
  frequencyMode: string;
  breakdownModeId: string;
  asOfDate: string;
  startDate: string;
  endDate: string;
};

type PeriodGridMap = Record<string, AnalyticResultRow[]>;

type ResponseGrid = {
  title?: string;
  rows?: Array<Record<string, unknown>>;
};

type ResponseWithPeriodGrids = AnalyticsResponse & {
  data?: {
    metadata?: {
      page_title?: string;
      value_date?: string;
    };
    grids?: ResponseGrid[];
  };
};

const EMPTY_CONFIG: GridConfigResponse = {
  columnConfigs: { all: [] },
  breakdownMode: [],
  frequencyMode: [
    {
      id: "monthly",
      label: "Monthly",
      group: "",
    },
  ],
  periods: [[]],
  metrics: [],
  holidays: new Set(new Set<string>())
};

const toRowId = (
  period: string,
  idx: number,
  row: Record<string, unknown>
): string => {
  const key = String(row["SecurityGroup"] ?? row["SecurityName"] ?? row["id"] ?? idx);
  return `${period}-${key}-${idx}`;
};

const extractRowsByPeriod = (resp: ResponseWithPeriodGrids): PeriodGridMap => {
  const grids = Array.isArray(resp.data?.grids) ? resp.data.grids : [];

  return grids.reduce<PeriodGridMap>((acc, grid, gridIndex) => {
    const period = String(grid.title ?? `grid_${gridIndex}`);
    const rows = Array.isArray(grid.rows) ? grid.rows : [];

    acc[period] = rows.map((row, idx) => ({
      id: toRowId(period, idx, row),
      ...row,
    })) as AnalyticResultRow[];

    return acc;
  }, {});
};


function extractMetadata(resp: AnalyticsResponse) {
  const metadata = (resp as ResponseWithPeriodGrids).data?.metadata;

  return {
    pageTitle: metadata?.page_title ?? "Attribution Analysis",
    valueDate: metadata?.value_date ?? "",
  };
}

type WorkspaceMode = "single" | "compare" | "composite";
/* ----------------------------- component ----------------------------- */

export default function AtributionAnalysisWorkspace() {

const [layoutOrder, setLayoutOrder] = useState<AttribSectionId[]>(
  () => loadAttribOrder(),
);
const [layoutSpans, setLayoutSpans] = useState<AttribSpanState>(
  () => loadAttribSpans(),
);
const [layoutCollapsed, setLayoutCollapsed] = useState<AttribCollapsedState>(
  () => loadAttribCollapsed(),
);

const sortableSensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);



const handleExportAllPeriods = async () => {
  const grids = periodKeys.map((period) => ({
    sheetName: period,
    rows: gridRowsByPeriod[period] ?? [],
    allColumns: effectiveColumns,
  }));
  const ok = await exportAttributionGridsToExcel(grids, { fileName: pageTitle });
  if (ok) {
    message.success("Exported all periods.");
  } else {
    message.warning("Nothing to export.");
  }
};

const handleLayoutDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const activeId = String(active.id) as AttribSectionId;
  const overId = String(over.id) as AttribSectionId;
  const oldIndex = layoutOrder.indexOf(activeId);
  const newIndex = layoutOrder.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0) return;
  const next = arrayMove(layoutOrder, oldIndex, newIndex);
  setLayoutOrder(next);
  persistAttribOrder(next);
};

const handleToggleCollapsed = (sectionId: string) => {
  const next: AttribCollapsedState = {
    ...layoutCollapsed,
    [sectionId as AttribSectionId]: !layoutCollapsed[sectionId as AttribSectionId],
  };
  setLayoutCollapsed(next);
  persistAttribCollapsed(next);
  window.dispatchEvent(new Event("resize"));
};

const handleToggleSpan = (sectionId: string) => {
  const id = sectionId as AttribSectionId;
  const newValue: AttribSectionSpan =
    layoutSpans[id] === "full" ? "half" : "full";

  const next: AttribSpanState = Object.assign({}, layoutSpans, {
    newValue,
  });

  setLayoutSpans(next);
  persistAttribSpans(next);
  window.dispatchEvent(new Event("resize"));
};

const handleExpandAll = () => {
  setLayoutCollapsed(defaultAttribCollapsedState);
  persistAttribCollapsed(defaultAttribCollapsedState);
  window.dispatchEvent(new Event("resize"));
};

const handleCollapseAll = () => {
  const next = Object.keys(defaultAttribCollapsedState).reduce<AttribCollapsedState>(
    (state, sectionId) => ({ ...state, [sectionId as AttribSectionId]: true }),
    { ...defaultAttribCollapsedState },
  );
  setLayoutCollapsed(next);
  persistAttribCollapsed(next);
  window.dispatchEvent(new Event("resize"));
};

const handleResetLayout = () => {
  setLayoutOrder(defaultAttribOrder);
  persistAttribOrder(defaultAttribOrder);
  setLayoutSpans(defaultAttribSpanState);
  persistAttribSpans(defaultAttribSpanState);
  setLayoutCollapsed(defaultAttribCollapsedState);
  persistAttribCollapsed(defaultAttribCollapsedState);
  window.dispatchEvent(new Event("resize"));
  message.info("Layout reset to default.");
};
const [attribSavedViews, setAttribSavedViews] = useState<AttribSavedView[]>(
  () => loadAttribSavedViews(),
);
const [activeAttribViewId, setActiveAttribViewId] = useState<string | undefined>();
const [favoriteAttribViewId, setFavoriteAttribViewId] = useState<string | undefined>(
  () => loadFavoriteAttribViewId(),
);
const [viewFilters, setViewFilters] = useState<AttribFilterState>({
  currency: [],
  country: [],
  sector: [],
  rating: [],
});
const hasBootstrappedRef = useRef(false);

const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("single");
const [compositePeriods, setCompositePeriods] = useState<string[]>([]);
const isCompareMode = workspaceMode === "compare";
const isCompositeMode = workspaceMode === "composite";
const [screenMode, setScreenMode] = useState<"view" | "print">("view");
const [pendingPrint, setPendingPrint] = useState(false);

  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfigResponse | null>(null);

  const [pageTitle, setPageTitle] = useState<string>("Attribution Analysis");
  const [valueDate, setValueDate] = useState<string>("");
  const [viewPeriodIds, setViewPeriodIds] = useState<string[]>(["MTD"]);
  const [viewPortfolio, setViewPortfolio] = useState<string>("");
  const [viewBenchmarks, setViewBenchmarks] = useState<string>("");
  const [viewAsOfDate, setViewAsOfDate] = useState<string>(getLastMonthEnd());
  const [viewStartDate, setViewStartDate] = useState<string>("");
  const [viewEndDate, setViewEndDate] = useState<string>("");
  const [viewFrequencyMode, setViewFrequencyMode] =
    useState<string>("monthly");
  const [viewAssetClass, setViewAssetClass] = useState<AssetClass | null>("EQ");
  const [viewBreakdown, setViewBreakdown] = useState<string>("");

  const [selectedSecurityGroup, setSelectedSecurityGroup] = useState<
    string | null
  >(null);

  const [configOpen, setConfigOpen] = useState(false);
  const [configuredColumns, setConfiguredColumns] = useState<
    NormalizedColumnConfig[]
  >([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  const [rawRowsByPeriod, setRawRowsByPeriod] = useState<PeriodGridMap>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const [comparePeriods, setComparePeriods] = useState<string[]>([]);

  const storageKey = getKeyByAssetClass(viewAssetClass ?? "");
  const [configDraftPortfolio, setConfigDraftPortfolio] = useState<string>("");

  const portfolioSelectOptions = useMemo(
    () => buildPortfolioOptions(portBenchRows),
    [portBenchRows]
  );

  const benchmarkSelectOptions = useMemo(() => {
    const activePortfolio = configOpen ? configDraftPortfolio : viewPortfolio;

    return buildBenchmarkOptions(
      portBenchRows,
      activePortfolio ? [activePortfolio] : []
    );
  }, [portBenchRows, configOpen, configDraftPortfolio, viewPortfolio]);

  useEffect(() => {
    if (configOpen) {
      setConfigDraftPortfolio(viewPortfolio);
    }
  }, [configOpen, viewPortfolio]);

const effectiveColumns = useMemo(() => {
  if (!gridConfig) return [];

  return getEffectiveColumns(
    gridConfig,
    configuredColumns,
    viewBreakdown,
    viewFrequencyMode
  );
}, [gridConfig, configuredColumns, viewBreakdown, viewFrequencyMode]);


const gridRowsByPeriod = useMemo<PeriodGridMap>(() => {
  return rawRowsByPeriod;
}, [rawRowsByPeriod]);

  const periodKeys = useMemo(
    () => Object.keys(rawRowsByPeriod),
    [rawRowsByPeriod]
  );

const comparePeriodPair = useMemo<[string, string] | null>(() => {
  if (!isCompareMode || comparePeriods.length < 2) return null;
  return [comparePeriods[0], comparePeriods[1]];
}, [isCompareMode, comparePeriods]);

useEffect(() => {
  if (!isCompareMode) {
    setComparePeriods([]);
  }

  if (!isCompositeMode) {
    setCompositePeriods([]);
  }
}, [isCompareMode, isCompositeMode]);

  useEffect(() => {
    if (!selectedPeriod && periodKeys.length > 0) {
      setSelectedPeriod(periodKeys[0]);
    }
  }, [periodKeys, selectedPeriod]);

const compositePeriodOptions = useMemo(
  () =>
    periodKeys.map((period) => ({
      label: period.toUpperCase(),
      value: period,
    })),
  [periodKeys]
);

const compositeViewData = useMemo(() => {
  if (!gridConfig || compositePeriods.length === 0) {
    return null;
  }

  const selectedRowsByPeriod = Object.fromEntries(
    compositePeriods.map((period) => [
      period,
      rawRowsByPeriod[period] ?? [],
    ])
  ) as PeriodGridMap;

  return buildCompositeAttributionData({
    pageTitle,
    valueDate,
    portfolioName: viewPortfolio,
    benchmarkName: viewBenchmarks,
    periods: toCompositePeriods(compositePeriods, gridConfig),
    rowsByPeriod: selectedRowsByPeriod,
  });
}, [
  compositePeriods,
  gridConfig,
  pageTitle,
  rawRowsByPeriod,
  valueDate,
  viewBenchmarks,
  viewPortfolio,
]);

  const loadForAssetClass = async (asset: AssetClass): Promise<void> => {
    setLoadingConfig(true);

    try {
      const optsResp = (await api.getAccounts(asset)) as OptionsResponse;
      setPortBenchRows(extractPortBenchRows(optsResp));
    } catch (err) {
      console.error("getAccounts failed:", err);
      setPortBenchRows([]);
      message.warning("Options failed to load");
    }

    try {
      const configResp = (await api.getConfigs(asset)) as GridConfigResponse;
      const nextGridConfig = extractGridConfig(configResp);
      setGridConfig(nextGridConfig ?? null);
    } catch (err) {
      console.error("getConfigs failed:", err);
      setGridConfig(null);
      message.warning("Grid configs failed to load");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (!viewAssetClass) return;
    void loadForAssetClass(viewAssetClass);
  }, [viewAssetClass]);

  const buildAnalysisInput = (
    payload?: AttribAnalysisApplyPayload
  ): AnalysisInput | null => {
    const assetClass = (payload?.assetClass ?? viewAssetClass) as
      | AssetClass
      | null;
    const portfolio = payload?.portfolio ?? viewPortfolio;
    const benchmark = payload?.benchmark ?? viewBenchmarks;
    const frequencyMode = payload?.frequencyMode ?? viewFrequencyMode;
    const breakdownModeId = payload?.breakdownModeId ?? viewBreakdown;
    const asOfDate = payload?.asOfDate ?? viewAsOfDate;
    const startDate = payload?.startDate ?? viewStartDate;
    const endDate = payload?.endDate ?? viewEndDate;

    if (!assetClass || !portfolio) {
      message.warning(
        "Please select asset class and portfolio before running analysis."
      );
      return null;
    }

    if (frequencyMode.toLowerCase() !== "daily" && !endDate) {
      message.warning("Please select at lease end date.");
      return null;
    }

    if (
      frequencyMode.toLowerCase() === "daily" &&
      (!startDate || !endDate)
    ) {
      message.warning("Please select start and end dates.");
      return null;
    }

    return {
      assetClass,
      portfolio,
      benchmark,
      frequencyMode,
      breakdownModeId,
      asOfDate,
      startDate,
      endDate,
    };
  };

// Add local state for the chain (if not already present):
const [viewBreakdownChain, setViewBreakdownChain] = useState<BreakdownChain>(
  EMPTY_BREAKDOWN_CHAIN,
);

const buildCurrentAttribState = (): AttribAnalysisSelectionState => ({
  assetClass: viewAssetClass,
  portfolio: viewPortfolio,
  benchmark: viewBenchmarks,
  frequencyMode: viewFrequencyMode,
  asOfDate: viewAsOfDate,
  startDate: viewStartDate,
  endDate: viewEndDate,
  breakdownModeId: viewBreakdown,
  breakdownChain: viewBreakdownChain,
  periodIds: viewPeriodIds,
  selectedColumnIds: configuredColumns.map((c) => c.id ?? c.id).filter(Boolean),
  filters: viewFilters,
});


const handleSaveAttribView = (
  name: string,
  description: string | undefined,
  state: AttribAnalysisSelectionState,
) => {
  const finalState = state ?? buildCurrentAttribState();
  const existing = attribSavedViews.find(
    (v) => v.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );

  const nextView: AttribSavedView = existing
    ? {
        ...existing,
        name: name.trim(),
        description: description?.trim() || undefined,
        state: finalState,
        updatedAt: new Date().toISOString(),
      }
    : createAttribSavedView({ name, description, state: finalState });

  const nextViews = existing
    ? attribSavedViews.map((v) => (v.id === existing.id ? nextView : v))
    : [nextView, ...attribSavedViews];

  setAttribSavedViews(nextViews);
  persistAttribSavedViews(nextViews);
  setActiveAttribViewId(nextView.id);
  message.success(`Saved view: ${nextView.name}`);
};


const applyStateToWorkspace = (state: AttribAnalysisSelectionState): void => {
  setViewAssetClass(state.assetClass as AssetClass);
  setViewPortfolio(state.portfolio);
  setViewBenchmarks(state.benchmark);
  setViewFrequencyMode(state.frequencyMode);
  setViewAsOfDate(state.asOfDate);
  setViewStartDate(state.startDate);
  setViewEndDate(state.endDate);
  setViewBreakdown(state.breakdownModeId);
  setViewBreakdownChain(state.breakdownChain ?? EMPTY_BREAKDOWN_CHAIN);
  setViewPeriodIds(state.periodIds ?? []);
  setViewFilters(state.filters);
};


const handleLoadAttribView = (
  viewId: string,
  options?: { autoRun?: boolean },
) => {
  const view = attribSavedViews.find((v) => v.id === viewId);
  if (!view) {
    message.error("Saved view was not found.");
    return;
  }
  applyStateToWorkspace(view.state);
  setActiveAttribViewId(view.id);

  if (options?.autoRun) {
    message.success(`Loaded view: ${view.name}. Running analysis...`);
    void executeAttribAnalysis(view.state, { silent: true });
  } else {
    message.success(`Loaded view: ${view.name}`);
  }
};

const handleDeleteAttribView = (viewId: string) => {
  const view = attribSavedViews.find((v) => v.id === viewId);
  const nextViews = attribSavedViews.filter((v) => v.id !== viewId);
  setAttribSavedViews(nextViews);
  persistAttribSavedViews(nextViews);
  if (activeAttribViewId === viewId) setActiveAttribViewId(undefined);
  if (favoriteAttribViewId === viewId) {
    setFavoriteAttribViewId(undefined);
    persistFavoriteAttribViewId(undefined);
  }
  message.success(view ? `Deleted view: ${view.name}` : "Deleted saved view.");
};

const handleSetFavoriteAttribView = (viewId: string | undefined) => {
  if (viewId && !attribSavedViews.some((v) => v.id === viewId)) {
    message.error("Saved view was not found.");
    return;
  }
  setFavoriteAttribViewId(viewId);
  persistFavoriteAttribViewId(viewId);
  if (viewId) {
    const view = attribSavedViews.find((v) => v.id === viewId);
    message.success(view ? `Favorite view set: ${view.name}` : "Favorite view set.");
  } else {
    message.info("Favorite view cleared.");
  }
};
const executeAttribAnalysis = async (
  state: AttribAnalysisSelectionState,
  options?: { silent?: boolean },
): Promise<void> => {
  await runAnalysis({
    assetClass: state.assetClass,
    portfolio: state.portfolio,
    benchmark: state.benchmark,
    frequencyMode: state.frequencyMode,
    breakdownModeId: state.breakdownModeId,
    asOfDate: state.asOfDate,
    startDate: state.startDate,
    endDate: state.endDate,
    configuredColumns,
    periodIds: state.periodIds,
    selectedColumnIds: state.selectedColumnIds,
    filters: state.filters,
  } as AttribAnalysisApplyPayload);
  if (!options?.silent) message.success("Analysis complete");
};
  const runAnalysis = async (payload?: AttribAnalysisApplyPayload): Promise<void> => {
    const input = buildAnalysisInput(payload);
    if (!input) return;

    setRunningAnalysis(true);

    try {
      const inputGrouping = input.breakdownModeId === "Type_2" ? encodeURIComponent("Type 2")
      : input.breakdownModeId === "GICS" ? "GICS1"
      : input.breakdownModeId === "Mag_7" ? encodeURIComponent("Mag 7")
      : input.breakdownModeId === "Russell_Style" ? encodeURIComponent("Russell Style")
       : encodeURIComponent(input.breakdownModeId);
      const resp = input.breakdownModeId === 'MktCap' ||
      input.breakdownModeId === 'PEfwd' ? (await api.runEQ5AttributionAnalysis(
        input.portfolio,
        input.endDate,
        inputGrouping
      )) :
      input.frequencyMode === "daily" && input.assetClass === "EQ" ? (await api.runEQ5AttributionAnalysis(
        input.portfolio,
        input.endDate,
        inputGrouping
      )) : input.frequencyMode === "monthly" && input.assetClass === "EQ" ? (await api.runSecurityGrainAnalysis(input.assetClass,
        input.portfolio,input.frequencyMode,
        inputGrouping  || "GICS1",
        input.startDate,
        input.endDate
      )) :  (await api.runSecurityGrainAnalysis(
        input.assetClass,
        input.portfolio,
        input.frequencyMode,
        inputGrouping  || "GICS1",
        input.startDate,
        input.endDate
      )) as ResponseWithPeriodGrids;

      const meta = extractMetadata(resp);
      setPageTitle(meta.pageTitle);
      setValueDate(meta.valueDate);

      const rowsByPeriod = extractRowsByPeriod(resp);
      setRawRowsByPeriod(rowsByPeriod);

      const firstPeriod = Object.keys(rowsByPeriod)[0] ?? "";
      setSelectedPeriod(firstPeriod);
      setSelectedSecurityGroup(null);

      message.success("Analysis complete");
    } catch (err) {
      console.error("Analysis failed:", err);
      message.error("Analysis failed");
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleRunAnalysis = (payload?: AttribAnalysisApplyPayload): void => {
    void runAnalysis(payload);
  };



useEffect(() => {
  if (!pendingPrint || screenMode !== "print") return;

  // wait one paint so print layout is visible before opening browser print dialog
  const id = requestAnimationFrame(() => {
    window.print();
    setPendingPrint(false);
  });

  return () => cancelAnimationFrame(id);
}, [pendingPrint, screenMode]);

const assetClassOptions: SegmentedProps<AssetClass>["options"] = [
  // { label: "FI", value: "FI" },
  { label: "EQ", value: "EQ" },
  { label: "EM", value: "EM" },
  { label: "BL", value: "BL" },
  { label: "HY", value: "HY" },
];


useEffect(() => {
  if (hasBootstrappedRef.current) return;
  if (!gridConfig) return;
  if (!favoriteAttribViewId) {
    hasBootstrappedRef.current = true;
    return;
  }
  const favorite = attribSavedViews.find((v) => v.id === favoriteAttribViewId);
  if (!favorite) {
    hasBootstrappedRef.current = true;
    persistFavoriteAttribViewId(undefined);
    setFavoriteAttribViewId(undefined);
    return;
  }

  hasBootstrappedRef.current = true;
  applyStateToWorkspace(favorite.state);
  setActiveAttribViewId(favorite.id);
  message.success(`Loaded favorite view: ${favorite.name}`);
  void executeAttribAnalysis(favorite.state, { silent: true });
}, [gridConfig, favoriteAttribViewId, attribSavedViews]);


const applySelectionToView = (payload: AttribAnalysisApplyPayload): void => {
  setViewAssetClass(payload.assetClass as AssetClass);
  setViewPortfolio(payload.portfolio);
  setViewBenchmarks(payload.benchmark);
  setViewFrequencyMode(payload.frequencyMode);
  setViewAsOfDate(payload.asOfDate);
  setViewStartDate(payload.startDate);
  setViewEndDate(payload.endDate);
  setViewBreakdown(payload.breakdownModeId);
  setViewBreakdownChain(payload.breakdownChain ?? EMPTY_BREAKDOWN_CHAIN);
  setViewPeriodIds(payload.periodIds ?? []);
  setConfiguredColumns(payload.configuredColumns);
  setViewFilters(payload.filters);
};

const filterOptions = useMemo(
  () => buildFilterOptions(gridConfig),
  [gridConfig],
);
const sections: Partial<Record<AttribSectionId, React.ReactNode>> = {};

if (screenMode !== "print" && gridConfig) {
  if (workspaceMode === "single") {
    sections.attribGrid = (
      <DramGridProvider
        config={gridConfig}
        storageKey={`${storageKey}-${selectedPeriod}`}
        allColumns={effectiveColumns}
      >
        <DramDataGrid
          rows={
            selectedSecurityGroup
              ? (gridRowsByPeriod[selectedPeriod] ?? []).filter(
                  (r) =>
                    String(r["SecurityGroup"] ?? "") === selectedSecurityGroup ||
                    String(r["SecurityGroup"] ?? "") === "Total",
                )
              : gridRowsByPeriod[selectedPeriod] ?? []
          }
          config={gridConfig}
          height={420}
          storageKey={`${storageKey}-${selectedPeriod}`}
          isConfigView={false}
          allColumns={effectiveColumns}
        />
      </DramGridProvider>
    );

    sections.attribChart = (
      <AttributionSingleModeChart
        breakdown={viewBreakdown}
        data={
          (rawRowsByPeriod[selectedPeriod] ?? []).filter(
            (r) =>
              String(r["SecurityGroup"] ?? "") !== "Total" &&
              (!selectedSecurityGroup ||
                String(r["SecurityGroup"] ?? "") === selectedSecurityGroup),
          )
        }
        selectedGroup={selectedSecurityGroup}
        onSelect={(group: string) => {
          setSelectedSecurityGroup((prev) => (prev === group ? null : group));
        }}
      />
    );
  }

  if (workspaceMode === "compare" && comparePeriodPair) {
    sections.compareGrid = (
      <AttributionCompareView
        leftPeriod={comparePeriodPair[0]}
        rightPeriod={comparePeriodPair[1]}
        leftRows={rawRowsByPeriod[comparePeriodPair[0]] ?? []}
        rightRows={rawRowsByPeriod[comparePeriodPair[1]] ?? []}
        selectedGroup={selectedSecurityGroup}
        onSelect={(group) =>
          setSelectedSecurityGroup((prev) => (prev === group ? null : group))
        }
      />
    );
  }

  if (workspaceMode === "composite" && compositeViewData) {
    sections.compositeSummary = (
      <CompositeSummaryChart data={compositeViewData} decimalPlaces={2} />
    );
    sections.compositeAttribution = (
      <CompositeMatrixChart
        title="Attribution of Gross Out/Underperformance"
        subtitle="bps by period"
        periods={compositeViewData.periods}
        rows={compositeViewData.attributionRows}
      />
    );
    sections.compositeContribution = (
      <CompositeMatrixChart
        title="Contribution to Total Return"
        subtitle="bps by period"
        periods={compositeViewData.periods}
        rows={compositeViewData.contributionRows}
      />
    );
    sections.compositeGrid = (
      <CompositeAttributionView data={compositeViewData} />
    );
  }
}

const activeOrderedIds = layoutOrder.filter(
  (sectionId) => sections[sectionId] !== undefined,
);
//main component
  return (
    <div style={{ margin: "16px" }}>
      <Row justify="end" style={{ marginBottom: 12 }}>
        <Button
          icon={<SettingOutlined />}
          loading={loadingConfig}
          onClick={() => setConfigOpen(true)}
        >
          Configure
        </Button>
      </Row>
        <ConfigTabbedCompact
            open={configOpen}
            onClose={() => setConfigOpen(false)}
            config={gridConfig ?? EMPTY_CONFIG}
            assetClassOptions={assetClassOptions}
            portfolioOptions={portfolioSelectOptions}
            benchmarkOptions={benchmarkSelectOptions}
            initialValues={{
              assetClass: viewAssetClass ?? null,
              portfolio: viewPortfolio,
              benchmark: viewBenchmarks,
              frequencyMode: viewFrequencyMode,
              asOfDate: viewAsOfDate,
              startDate: viewStartDate,
              endDate: viewEndDate,
              breakdownModeId: viewBreakdown,
              filters: viewFilters,
              periodIds: viewPeriodIds,
            }}
            onAssetClassChange={(asset) => {
              const nextAsset = asset as AssetClass;
              setViewAssetClass(nextAsset);
              setViewPortfolio("");
              setConfigDraftPortfolio("");
              setViewBenchmarks("");
              setViewBreakdown("");
              setConfiguredColumns([]);
              setGridConfig(null);
              setRawRowsByPeriod({});
              setSelectedPeriod("");
              setSelectedSecurityGroup(null);
              setComparePeriods([]);
              setWorkspaceMode("single");
              setCompositePeriods([]);
              void loadForAssetClass(nextAsset);
            }}
            onPortfolioChange={(portfolio) => setConfigDraftPortfolio(portfolio)}
            onApply={(payload) => {
              applySelectionToView(payload);
              setConfigOpen(false);
              message.success("Applied");
              handleRunAnalysis(payload);
            }}
            onSave={(payload) => {
              const persistKey = getKeyByAssetClass(payload.assetClass ?? "");
              localStorage.setItem(persistKey, JSON.stringify(payload.configuredColumns));
              applySelectionToView(payload);
              setConfigOpen(false);
              message.success("Configuration saved");
              handleRunAnalysis(payload);
            }}
            savedViews={attribSavedViews}
            activeSavedViewId={activeAttribViewId}
            favoriteSavedViewId={favoriteAttribViewId}
            onSaveView={handleSaveAttribView}
            onLoadView={handleLoadAttribView}
            onDeleteView={handleDeleteAttribView}
            onSetFavoriteView={handleSetFavoriteAttribView}
            filterOptions={filterOptions}
          />

      {!viewAssetClass ? (
        <Card style={{ marginTop: 16 }}>
          <Empty description="Click Configure to select asset class and run analysis." />
        </Card>
      ) : !gridConfig ? (
        <Card style={{ marginTop: 16 }}>
          <Spin />
        </Card>
      ) : periodKeys.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <Empty description="Run analysis to view period grids." />
        </Card>
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* workspace header */}
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {pageTitle}
                    </Title>

                    {valueDate && (
                      <div>
                        <Text type="secondary">As of Date: {valueDate}</Text>
                      </div>
                    )}


                    {isCompareMode && comparePeriods.length > 0 && (
                      <Text type="secondary">
                        Comparing: {comparePeriods.map((p) => p.toUpperCase()).join(" vs ")}
                      </Text>
                    )}

                    {isCompositeMode && compositePeriods.length > 0 && (
                      <Text type="secondary">
                        Composite Periods: {compositePeriods.map((p) => p.toUpperCase()).join(", ")}
                      </Text>
                    )}

                  </div>
                </Col>

                <Col>
                  <Space>

                  <Segmented
                    value={screenMode}
                    onChange={(v) => setScreenMode(v as "view" | "print")}
                    options={[
                      { label: "View", value: "view" },
                      { label: "Print", value: "print" },
                    ]}
                  />

                <Segmented<WorkspaceMode>
                  value={workspaceMode}
                  onChange={(value) => {
                    const nextMode = value as WorkspaceMode;

                    setWorkspaceMode(nextMode);
                    setSelectedSecurityGroup(null);

                    if (nextMode === "single") {
                      setComparePeriods([]);
                      setCompositePeriods([]);
                    }

                    if (nextMode === "compare") {
                      setCompositePeriods([]);

                      if (selectedPeriod) {
                        setComparePeriods([selectedPeriod]);
                      }
                    }

                    if (nextMode === "composite") {
                      setComparePeriods([]);

                      if (compositePeriods.length === 0) {
                        setCompositePeriods(periodKeys.slice(0, Math.min(periodKeys.length, 6)));
                      }
                    }
                  }}
                  options={[
                    { label: "Single", value: "single" },
                    { label: "Compare", value: "compare" },
                    { label: "Composite", value: "composite" },
                  ]}
                />

                {isCompareMode ? (
                  <Select
                    mode="multiple"
                    value={comparePeriods}
                    maxTagCount={2}
                    style={{ minWidth: 260 }}
                    placeholder="Select 2 periods"
                    options={compositePeriodOptions}
                    onChange={(values) => {
                      const next = values.slice(-2);
                      setComparePeriods(next);
                      setSelectedSecurityGroup(null);
                    }}
                  />
                ) : isCompositeMode ? (
                  <Select
                    mode="multiple"
                    value={compositePeriods}
                    maxTagCount={4}
                    style={{ minWidth: 340 }}
                    placeholder="Select periods for composite view"
                    options={compositePeriodOptions}
                    onChange={(values) => {
                      setCompositePeriods(values);
                      setSelectedSecurityGroup(null);
                    }}
                  />
                ) : (
                  <Segmented
                    value={selectedPeriod}
                    onChange={(val) => {
                      setSelectedPeriod(val as string);
                      setSelectedSecurityGroup(null);
                    }}
                    options={compositePeriodOptions}
                  />
                )}
                <Button type="primary" icon={<DownloadOutlined />} onClick={() => void handleExportAllPeriods()}>
                  Export All Periods
                </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

{/* main content */}
<Col span={24}>
{screenMode === "print" ? (
  <div id="print-root">
    <AttributionPrintView
      rows={rawRowsByPeriod[selectedPeriod] ?? []}
      period={selectedPeriod}
      pageTitle={pageTitle}
      valueDate={valueDate}
      benchmarkName={viewBenchmarks}
      selectedSector={selectedSecurityGroup}
      onSectorSelect={(sector: string) =>
        setSelectedSecurityGroup((prev) =>
          prev === sector ? null : sector,
        )
      }
    />
  </div>
) : activeOrderedIds.length === 0 ? (
  <Card>
    <Empty
      description={
        isCompareMode
          ? "Select 2 periods to compare."
          : isCompositeMode
            ? "Select multiple periods to view composite attribution."
            : "No sections to display."
      }
    />
  </Card>
) : (
  <Space direction="vertical" size={10} style={{ width: "100%" }}>
    {/* Layout toolbar */}
    <Card size="small" style={{ borderRadius: 8, border: "1px solid #d8dee9" }} bodyStyle={{ padding: "6px 10px" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Space size={6} wrap>
          <BarChartOutlined style={{ color: "#1d4ed8" }} />
          <Text strong>Result Layout</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Drag card headers to reorder · toggle half/full width · collapse to
            title-only rows.
          </Text>
        </Space>
        <Space size={6} wrap>
          <Button size="small" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button size="small" onClick={handleCollapseAll}>
            Collapse All
          </Button>
          <Tooltip title="Restore default order, widths, and expanded state">
            <Button size="small" icon={<ReloadOutlined />} onClick={handleResetLayout}>
              Reset Layout
            </Button>
          </Tooltip>
        </Space>
      </Space>
    </Card>

    {/* Sortable grid */}
    <Card loading={runningAnalysis} bodyStyle={{ padding: 8 }}>
      <DndContext
        sensors={sortableSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleLayoutDragEnd}
      >
        <SortableContext items={activeOrderedIds} strategy={rectSortingStrategy}>
          <Row gutter={[10, 10]} align="stretch">
            {activeOrderedIds.map((sectionId) => (
              <AttributionResultCard
                key={sectionId}
                id={sectionId}
                title={attribSectionLabels[sectionId]}
                description={attribSectionDescriptions[sectionId]}
                span={layoutSpans[sectionId]}
                collapsed={layoutCollapsed[sectionId]}
                onToggleCollapsed={handleToggleCollapsed}
                onToggleSpan={handleToggleSpan}
              >
                {sections[sectionId]}
              </AttributionResultCard>
            ))}
          </Row>
        </SortableContext>
      </DndContext>
    </Card>
  </Space>
)}

</Col>
        </Row>
      )}
    </div>
  );
}
