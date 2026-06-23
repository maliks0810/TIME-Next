import { useEffect, useMemo, useState } from "react";
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
  Typography,
  message,
} from "antd";
import AttributionPrintView from "../../components/dram-grid/AttributionPrintView";
import { SettingOutlined } from "@ant-design/icons";

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
  DramDataGrid,
  DramGridProvider,
  GridConfigResponse,
  normalizeColumns,
  NormalizedColumnConfig,
} from "../../components/dram-grid";
import { getKeyByAssetClass } from "../../components/WizardStateStore";
import { getLastMonthEnd } from "../../components/AlphaDashboard/utils/alphaDashboardHelpers";
import AttributionCompareView from "../../components/dram-grid/AttributionCompareView";
import AttributionSingleModeChart from "../../components/dram-grid/AttributionSingleModeChart";
import ConfigTabbedCompact, { AttribAnalysisApplyPayload } from "../../components/attrib-analysis-config/ConfigTabbedCompact";

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
  const key = String(row["SecurityGroup"] ?? row["id"] ?? idx);
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

const projectRowsToConfiguredColumns = (
  rows: AnalyticResultRow[],
  config: GridConfigResponse,
  configured: NormalizedColumnConfig[]
): AnalyticResultRow[] => {
  const activeColumns =
    configured.length > 0
      ? configured
      : normalizeColumns(config, {
          order: config.columnConfigs.all.map((c) => c.id),
          widths: {},
          visibility: {},
        });

  const visibleColumnIds = activeColumns
    .filter((c) => c.visible !== false)
    .map((c) => c.id);

  return rows.map((row, idx) => {
    const next: Record<string, unknown> = {
      id: row["id"] ?? idx,
    };

    for (const key of visibleColumnIds) {
      next[key] = row[key];
    }

    return next as AnalyticResultRow;
  });
};

function extractMetadata(resp: AnalyticsResponse) {
  const metadata = (resp as ResponseWithPeriodGrids).data?.metadata;

  return {
    pageTitle: metadata?.page_title ?? "Attribution Analysis",
    valueDate: metadata?.value_date ?? "",
  };
}

/* ----------------------------- component ----------------------------- */

export default function AtributionAnalysisWorkspace() {

const [screenMode, setScreenMode] = useState<"view" | "print">("view");
const [pendingPrint, setPendingPrint] = useState(false);

  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfigResponse | null>(null);

  const [pageTitle, setPageTitle] = useState<string>("Attribution Analysis");
  const [valueDate, setValueDate] = useState<string>("");

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

  const [compareMode, setCompareMode] = useState(false);
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
  const initialColumns = useMemo(() => {
    if (!gridConfig) return [];

    if (configuredColumns.length > 0) {
      return configuredColumns;
    }

    return normalizeColumns(gridConfig, {
      order: gridConfig.columnConfigs.all.map((c) => c.id),
      widths: {},
      visibility: {},
    });
  }, [gridConfig, configuredColumns]);

  const gridRowsByPeriod = useMemo<PeriodGridMap>(() => {
    if (!gridConfig) return {};

    return Object.fromEntries(
      Object.entries(rawRowsByPeriod).map(([period, rows]) => [
        period,
        projectRowsToConfiguredColumns(rows, gridConfig, configuredColumns),
      ])
    );
  }, [rawRowsByPeriod, gridConfig, configuredColumns]);

  const periodKeys = useMemo(
    () => Object.keys(rawRowsByPeriod),
    [rawRowsByPeriod]
  );

  const comparePeriodPair = useMemo<[string, string] | null>(() => {
    if (!compareMode || comparePeriods.length < 2) return null;
    return [comparePeriods[0], comparePeriods[1]];
  }, [compareMode, comparePeriods]);

  useEffect(() => {
    if (!selectedPeriod && periodKeys.length > 0) {
      setSelectedPeriod(periodKeys[0]);
    }
  }, [periodKeys, selectedPeriod]);

  useEffect(() => {
    if (!compareMode) {
      setComparePeriods([]);
    }
  }, [compareMode]);

  const handleToggleCompareMode = () => {
    setCompareMode((prev) => {
      const next = !prev;

      if (!next) {
        setComparePeriods([]);
      } else if (selectedPeriod) {
        setComparePeriods([selectedPeriod]);
      }

      setSelectedSecurityGroup(null);
      return next;
    });
  };

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

  const runAnalysis = async (payload?: AttribAnalysisApplyPayload): Promise<void> => {
    const input = buildAnalysisInput(payload);
    if (!input) return;

    setRunningAnalysis(true);

    try {
      const resp = (await api.runAnalysis(
        input.assetClass,
        input.portfolio,
        input.frequencyMode,
        input.breakdownModeId || "GICS",
        input.startDate,
        input.endDate
      )) as ResponseWithPeriodGrids;

      const meta = extractMetadata(resp);
      setPageTitle(meta.pageTitle);
      setValueDate(meta.valueDate);

      const nextGridConfig = extractGridConfig(resp);
      if (nextGridConfig) {
        setGridConfig(nextGridConfig);
      }

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

  const applySelectionToView = (payload: AttribAnalysisApplyPayload): void => {
    setViewAssetClass(payload.assetClass as AssetClass);
    setViewPortfolio(payload.portfolio);
    setViewBenchmarks(payload.benchmark);
    setViewFrequencyMode(payload.frequencyMode);
    setViewAsOfDate(payload.asOfDate);
    setViewStartDate(payload.startDate);
    setViewEndDate(payload.endDate);
    setViewBreakdown(payload.breakdownModeId);
    setConfiguredColumns(payload.configuredColumns);
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
];

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
        <ConfigTabbedCompact open={configOpen} onClose={() => setConfigOpen(false)}
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

            void loadForAssetClass(nextAsset);
          }}

          onPortfolioChange={(portfolio) => {
            setConfigDraftPortfolio(portfolio);
          }}

          onApply={(payload) => {
            applySelectionToView(payload);
            setConfigOpen(false);
            message.success("Applied");
            handleRunAnalysis(payload);
          }}
          onSave={(payload) => {
            const persistKey = getKeyByAssetClass(payload.assetClass ?? "");
            localStorage.setItem(
              persistKey,
              JSON.stringify(payload.configuredColumns)
            );

            applySelectionToView(payload);
            setConfigOpen(false);
            message.success("Configuration saved");
            handleRunAnalysis(payload);
          }}
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

                    {compareMode && comparePeriods.length > 0 && (
                      <Text type="secondary">
                        Comparing:{" "}
                        {comparePeriods
                          .map((p) => p.toUpperCase())
                          .join(" vs ")}
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

                  <Button onClick={handleToggleCompareMode}>
                      {compareMode ? "Single View" : "Compare Periods"}
                    </Button>

                    {compareMode ? (
                      <Select
                        mode="multiple"
                        value={comparePeriods}
                        maxTagCount={2}
                        style={{ minWidth: 260 }}
                        placeholder="Select 2 periods"
                        options={periodKeys.map((p) => ({
                          label: p.toUpperCase(),
                          value: p,
                        }))}
                        onChange={(values) => {
                          const next = values.slice(-2);
                          setComparePeriods(next);
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
                        options={periodKeys.map((p) => ({
                          label: p.toUpperCase(),
                          value: p,
                        }))}
                      />
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

{/* main content */}
<Col span={24}>

  {/*  PRINT MODE FIRST */}
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
          prev === sector ? null : sector
        )
      }
    />
  </div>

  ) : compareMode ? (

    /*  COMPARE MODE */
    comparePeriodPair ? (
      <Card>
        <AttributionCompareView
          leftPeriod={comparePeriodPair[0]}
          rightPeriod={comparePeriodPair[1]}
          leftRows={rawRowsByPeriod[comparePeriodPair[0]] ?? []}
          rightRows={rawRowsByPeriod[comparePeriodPair[1]] ?? []}
          selectedGroup={selectedSecurityGroup}
          onSelect={(group) =>
            setSelectedSecurityGroup((prev) =>
              prev === group ? null : group
            )
          }
        />
      </Card>
    ) : (
      <Card>
        <Empty description="Select 2 periods to compare." />
      </Card>
    )

  ) : (

    /*  SINGLE VIEW (UNCHANGED) */
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          title={
            <Row justify="space-between" align="middle">
              <span>Performance Overview</span>
              <Text type="secondary">
                {selectedPeriod.toUpperCase()}
              </Text>
            </Row>
          }
          style={{ marginBottom: 16 }}
          loading={runningAnalysis}
        >

<AttributionSingleModeChart
  data={
    (rawRowsByPeriod[selectedPeriod] ?? []).filter(
      (r) =>
        String(r["SecurityGroup"] ?? "") !== "Total" &&
        (!selectedSecurityGroup ||
          String(r["SecurityGroup"] ?? "") === selectedSecurityGroup)
    )
  }
  selectedGroup={selectedSecurityGroup}
  onSelect={(group: string) => {
    setSelectedSecurityGroup((prev) =>
      prev === group ? null : group
    );
  }}
/>

        </Card>
      </Col>

      <Col span={24}>
        <DramGridProvider
          config={gridConfig}
          storageKey={`${storageKey}-${selectedPeriod}`}
          allColumns={initialColumns}
        >
          <Card
            loading={runningAnalysis}
          >
            <DramDataGrid
              rows={
                selectedSecurityGroup
                  ? (gridRowsByPeriod[selectedPeriod] ?? []).filter(
                      (r) =>
                        String(r["SecurityGroup"] ?? "") ===
                          selectedSecurityGroup ||
                        String(r["SecurityGroup"] ?? "") === "Total"
                    )
                  : gridRowsByPeriod[selectedPeriod] ?? []
              }
              config={gridConfig}
              height={420}
              storageKey={`${storageKey}-${selectedPeriod}`}
              isConfigView={false}
            />
          </Card>
        </DramGridProvider>
      </Col>
    </Row>
  )}

</Col>
        </Row>
      )}
    </div>
  );
}
