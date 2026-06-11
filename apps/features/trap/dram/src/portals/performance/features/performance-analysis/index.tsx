import React from "react";
import Button from "devextreme-react/button";
import { Tabs } from "antd";

import { exportDataGrid } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

import SplitPane from "./components/SplitPane";
import {
  ExclusionAccountRow,
  HistoryRow,
  HistorySummaryRow,
  PerformanceReturnsResultResponse,
  PortfolioRow,
} from "./lib/types";

import {
  fetchExclusionAccountsService,
  fetchOfficalPerformanceReturnsService,
  fetchPortfolioListService,
  fetchPortfolioSummaryService,
} from "./lib/services";
import SummaryReportView from "./components/summary/SummaryReportView";
import SummaryListReport from "./components/summary/SummaryListView";
import DetailHistory from "./components/detail/DetailHistory";
import BMDetailHistory from "./components/detail/BMDetailHistory";
import { DateBox } from "devextreme-react";
import FeeDetailHistory from "./components/detail/FeeDetailHistory";
import { SelectionChangedEvent, ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import ExclusionAccountsView from "./components/summary/ExclusionAccountsView";
import PortfolioTree from "./components/tree/PortfolioTree";

/** Tabs */
type TabKey = "portfolioHistory"  | "portfolioNetHistory" | "benchmarkHistory" | "secondBenchmarkHistory"  ;

/** Summary view type */
type SummaryView = "summaryReport" | "summaryList" | "exclusionAccounts";

/** Right-pane mode */
type Mode = "summary" | "detail";

const getMonthEnd = (date: Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

const getPreviousMonthEnd = () => {
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  return getMonthEnd(prevMonth);
};


/** best-effort format */
function formatMMDDYYYY(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function toISODateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function fetchPortfolioHistory(data: PerformanceReturnsResultResponse | undefined, tabKey: TabKey): Promise<HistoryRow[]> {
  if (!data) return [];
  if (tabKey === "portfolioHistory") return data?.portfolioGrossRows ?? [];
  if (tabKey === "portfolioNetHistory") return data?.portfolioNetRows ?? [];
  if (tabKey === "benchmarkHistory") return data?.benchmarkRows ?? [];
  if (tabKey === "secondBenchmarkHistory" ) return data?.secondaryBenchmarkRows ?? [];
  return [];
}

export default function PerformanceAnalysisContent() {
  // LEFT state
  const [portfolioList, setPortfolioList] = React.useState<PortfolioRow[]>([]);
  const [portfolioSummaryList, setPortfolioSummaryList] = React.useState<HistorySummaryRow[]>([]);
  const [rows, setRows] = React.useState<PortfolioRow[]>([]);

  // RIGHT mode state
  const [mode, setMode] = React.useState<Mode>("summary");
  const [summaryView, setSummaryView] = React.useState<SummaryView>("summaryList");

  // Summary state
  const [asOfDate, setAsOfDate] = React.useState<Date>(getPreviousMonthEnd());
  const asOfDateISO = React.useMemo(() => toISODateOnly(asOfDate), [asOfDate]);
  const [summaryRows, setSummaryRows] = React.useState<HistorySummaryRow[]>([]);

  // Detail state
  const [selectedPortId, setSelectedPortId] = React.useState<string | null>('');
  const [selectedPortfolio, setSelectedPortfolio] = React.useState<PortfolioRow | null>(null);
  const [detailHeader, setDetailHeader] = React.useState<PortfolioRow | null>(null);
  const [detailRows, setDetailRows] = React.useState<HistoryRow[]>([]);
  const [detailBMRows, setDetailBMRows] = React.useState<HistoryRow[]>([]);
  const [detailSeccondBMRows, setDetailSeccondBMRows] = React.useState<HistoryRow[]>([]);
  const [detailNetRows, setDetailNetRows] = React.useState<HistoryRow[]>([]);
  const [tabKey, setTabKey] = React.useState<TabKey>("portfolioHistory");
  const [allDataResult, setAllDataResult] = React.useState<PerformanceReturnsResultResponse | undefined>(undefined);


  const [exclusionRows, setExclusionRows] = React.useState<ExclusionAccountRow[]>([]);

  const isMonthEnd = (date: Date) => {
    const d = new Date(date);
    return d.getDate() === getMonthEnd(d).getDate();
  };

  // -------- Load portfolio list (once) + apply search for tree items --------
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Load list once
        const resp = await fetchPortfolioListService();
          const list = resp?.data?.results ?? [];
          if (!cancelled) {
            setPortfolioList(list);
            setRows(list);
          }
        if (portfolioSummaryList.length == 0){
          const respSummary = await fetchPortfolioSummaryService('');
          const summaryList = respSummary?.data?.results ?? [];
          if(!cancelled) {
            setPortfolioSummaryList(summaryList);
            setSummaryRows(summaryList);
          }
        }
      } finally {
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------- Load summary whenever view is summary + asOf changes --------
  React.useEffect(() => {
  if (mode !== "summary") return;
  if (summaryView === "exclusionAccounts") return

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetchPortfolioSummaryService(asOfDateISO);
        const data = resp?.data?.results ?? [];
        if (!cancelled) {
          setSummaryRows(data);
          setPortfolioSummaryList(data);
        }
      } finally {
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, asOfDateISO]);

React.useEffect(() => {
  if (mode !== "summary") return;
  if (summaryView !== "exclusionAccounts") return; //  only when tab active

  let cancelled = false;

  (async () => {
    try {
      const exclusion_resp = await fetchExclusionAccountsService();

      const payload = exclusion_resp?.data;

      //  correct path (your API shape)
      const grids = payload?.data?.grids ?? payload?.grids ?? [];
      const apiRows = grids?.[0]?.rows ?? [];

      //  minimal mapping (no mapper file needed)
      const mapped: ExclusionAccountRow[] = Array.isArray(apiRows)
        ? apiRows.map((r) => ({
            portfolioNumber: r.PORTFOLIO_NUMBER,
            portfolioName: r.PORTFOLIO_NAME,
          }))
        : [];

      if (!cancelled) {
        setExclusionRows(mapped);
      }
    } finally {}
  })();

  return () => { cancelled = true; };
}, [mode, summaryView, asOfDateISO]);

  // -------- Open details from ANY source (tree or summary grids) --------
  const openPortfolio = React.useCallback(
    async (portId: string) => {
      const p =
        rows.find((x) => x.portId === portId) ??
        portfolioList.find((x) => x.portId === portId) ??
        null;

      setSelectedPortId(portId);
      setSelectedPortfolio(p);
      setMode("detail"); // switch to Details History

      try {
        const resp = await fetchOfficalPerformanceReturnsService(portId);
        const hist = await fetchPortfolioHistory(resp?.data, "portfolioHistory");
        const netRows = await fetchPortfolioHistory(resp?.data, "portfolioNetHistory");
        const bmRows = await fetchPortfolioHistory(resp?.data, "benchmarkHistory");
        const secondbmRows = await fetchPortfolioHistory(resp?.data, "secondBenchmarkHistory");
        setDetailHeader(p);
        setDetailRows(hist);
        setDetailNetRows(netRows);
        setDetailBMRows(bmRows);
        setDetailSeccondBMRows(secondbmRows);
        setAllDataResult(resp?.data ?? null);
      } finally {

      }
    },
    [rows, portfolioList, tabKey]
  );

  // -------- Reload detail rows when tab changes (uses cached detail payload) --------
  React.useEffect(() => {
    if (mode !== "detail") return;
    if (!selectedPortId) return;

    let cancelled = false;
    (async () => {

      try {
        const hist = await fetchPortfolioHistory(allDataResult, tabKey);
        if (!cancelled) setDetailRows(hist);
      } finally {

      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, selectedPortId, tabKey]);

  // Summary grid selection → Details
  const onSummarySelectionChanged = React.useCallback(
    (e: SelectionChangedEvent) => {
      const selected = e.selectedRowsData?.[0];
      if (!selected) return;
      const portId = selected.portfolioNumber ?? selected.portId;
      if (portId != null) openPortfolio(String(portId));
    },
    [openPortfolio]
  );

  const onGridSelectionChanged = React.useCallback((e: SelectionChangedEvent) => {
    const selected = e.selectedRowsData?.[0];
    if (selected?.portId) openPortfolio(selected.portId);
  }, [openPortfolio]);

  // Toolbar export for detail grid
  const onDetailToolbarPreparing = (e: ToolbarPreparingEvent) => {
    const exportButton = {
      widget: "dxButton",
      location: "after",
      options: {
        icon: "export",
        text: "Export",
        onClick: () => {
          const now = new Date();
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet(`${tabKey}`);

          exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
            topLeftCell: { row: 1, column: 1 },
          }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
              const fileName = `${tabKey}_${now.toISOString()}.xlsx`;
              saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
            });
          });
        },
      },
    };
    e.toolbarOptions.items?.unshift(exportButton);
  };

  // Toolbar export for summary grid
  const onSummaryToolbarPreparing = (e: ToolbarPreparingEvent) => {
    const exportButton = {
      widget: "dxButton",
      location: "after",
      options: {
        icon: "export",
        text: "Export",
        onClick: () => {
          const now = new Date();
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet(`${summaryView}`);

          exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
            topLeftCell: { row: 1, column: 1 },
          }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
              const fileName = `${summaryView}_${asOfDateISO}_${now.toISOString()}.xlsx`;
              saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
            });
          });
        },
      },
    };
    e.toolbarOptions.items?.unshift(exportButton);
  };

  // Back from details → returns to summary (report/list preserved)
  const backToSummary = React.useCallback(() => {
    setMode("summary");
    // keep selectedPortId if you want (for highlighting), but clear detail payload
    setSelectedPortId(null);
    setSelectedPortfolio(null);
    setDetailHeader(null);
    setDetailRows([]);
    setDetailBMRows([]);
    setDetailNetRows([]);
    setAllDataResult(undefined);
  }, []);

  return (
    <div style={styles.page}>
      <div>
        <span><b>Disclaimer:</b> For questions regarding separately managed account performance,
        please contact the Performance Team .
        For inquiries related to mutual fund performance, please reach out to the Mutual Funds Team .
        For LP performance questions, please contact the Client and Fund Reporting Team.</span>
      </div>
      <SplitPane leftWidth={300}>
        {/* LEFT PANE */}
        <div style={styles.leftPane}>
          <div style={styles.leftBody}>
          <PortfolioTree
            onSelect={(portfolioId) => {
              // call API / load detail / drilldown
              console.log("Selected portfolio:", portfolioId);
              openPortfolio(String(portfolioId));
            }}
          />
          </div>
        </div>

        {/* RIGHT PANE */}
        <div style={styles.rightPane}>
          {/* <LoadPanel visible={loadingDetail || loadingSummary} showPane={true} /> */}

          {/* SUMMARY MODE */}
          {mode === "summary" && (
            <>
            <div style={{height: '100%', display: 'flex', flexDirection: 'column', minHeight:0}}>
              <div style={styles.gridTitleBar}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* <div style={{ fontWeight: 700 }}>
                    {summaryView === "summaryReport" ? "Summary Report" : "Summary List"}
                  </div> */}

                  <Tabs
                    activeKey={summaryView}
                    onChange={(key) => setSummaryView(key as SummaryView)}
                    items={[
                      { key: "summaryReport", label: "Summary Report" },
                      { key: "summaryList", label: "Summary List" },
                      { key: "exclusionAccounts", label: "Exclusion Accounts" },
                    ]}
                  />

                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "right", gap: 8 }}>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop:"10px" }}>As of</div>

                      <DateBox
                        value={asOfDate}
                        type="date"
                        displayFormat="yyyy-MM-dd"
                        width={120}

                        //  prevent non-month-end selection in UI
                        disabledDates={(args) => {
                          const date = args.date;
                          return date ? !isMonthEnd(date) : false;
                        }}

                        //  enforce again on change (defensive)
                        onValueChanged={(e) => {
                          if (!e.value) return;

                          const selected = new Date(e.value);
                          if (isMonthEnd(selected)) {
                            setAsOfDate(selected);
                          } else {
                            // snap to that month's end (optional stricter behavior)
                            setAsOfDate(getMonthEnd(selected));
                          }
                        }}
                      />

                  </div>
                </div>
              </div>

              <div style={styles.gridWrap}>
                {summaryView === "summaryReport" ? (
                  <SummaryReportView
                    asOfDate={asOfDate}
                    rows={summaryRows}
                    onSelect={onSummarySelectionChanged}
                    onToolbarPreparing={onSummaryToolbarPreparing}
                  />
                ) : summaryView === "summaryList" ? (
                  <SummaryListReport
                    asOfDate={asOfDate}
                    rows={rows}
                    onSelect={onGridSelectionChanged}
                    onToolbarPreparing={onSummaryToolbarPreparing}
                  />
                ) : (
                  <ExclusionAccountsView
                    asOfDate={asOfDate}
                    rows={exclusionRows}
                    onToolbarPreparing={onSummaryToolbarPreparing}
                  />
                )}
              </div>
              </div>
            </>
          )}

          {/* DETAIL MODE */}
          {mode === "detail" && (
            <>
              <div style={styles.detailTopBar}>
                <Button
                  text="Back"
                  icon="chevronleft"
                  stylingMode="outlined"
                  style={{ background: "#9BB8DD" }}
                  onClick={backToSummary}
                />
                <div style={styles.detailTitle}>
                  {selectedPortfolio
                    ? `${selectedPortfolio.portId} - ${selectedPortfolio.portfolioName}`
                    : `Portfolio ${selectedPortId}`}
                </div>
              </div>

              <div style={styles.detailHeaderStrip}>
                <div style={styles.headerField}>
                  <div style={styles.headerLabel}>Inception Dt</div>
                  <div style={styles.headerValue}>{formatMMDDYYYY(detailHeader?.inceptionDate)}</div>
                </div>
                <div style={styles.headerField}>
                  <div style={styles.headerLabel}>Perf Start Dt</div>
                  <div style={styles.headerValue}>{formatMMDDYYYY(detailHeader?.perfStartDate)}</div>
                </div>
                <div style={styles.headerField}>
                  <div style={{width:"650px"}} >All returns for periods of one year or longer are <b>annualized</b> unless otherwise stated.</div>
                </div>
              </div>

              <div style={styles.tabsRow}>
                <Tabs
                  className="performance-dashboard-tabs"
                  activeKey={tabKey}
                  onChange={(key) => setTabKey(key as TabKey)}
                  destroyInactiveTabPane
                  tabBarStyle={{ marginBottom: 0 }}
                  items={[
                    {
                      key: "portfolioHistory",
                      label: "Portfolio Gross History",
                      children: (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                          <DetailHistory
                            portfolioId={selectedPortId ?? ''}
                            rows={detailRows}
                            onToolbarPreparing={onDetailToolbarPreparing}
                          />
                        </div>
                      ),
                    },
                    {
                      key: "portfolioNetHistory",
                      label: "Portfolio Net History",
                      children: (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                          <FeeDetailHistory
                            portfolioId={selectedPortId ?? ''}
                            rows={detailNetRows}
                            onToolbarPreparing={onDetailToolbarPreparing}
                          />
                        </div>
                      ),
                    },
                    {
                      key: "benchmarkHistory",
                      label: "Benchmark History",
                      children: (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                          <BMDetailHistory
                            portfolioId={selectedPortId ?? ''}
                            isSecondary={false}
                            rows={detailBMRows}
                            onToolbarPreparing={onDetailToolbarPreparing}
                          />
                        </div>
                      ),
                    },
                    {
                      key: "secondBenchmarkHistory",
                      label: "Secondary Benchmark History",
                      children: (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                          <BMDetailHistory
                            portfolioId={selectedPortId ?? ''}
                            rows={detailSeccondBMRows}  isSecondary={true}
                            onToolbarPreparing={onDetailToolbarPreparing}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

            </>
          )}
        </div>
      </SplitPane>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: "100%",
    width: "100%",
    padding: 8,
    background: "#f3f3f3",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  leftPane: {
    height: "calc(100vh - 100px)",
    background: "#fff",
    border: "1px solid #cfcfcf",
    display: "flex",
    flexDirection: "column",
  },
  leftHeader: {
    padding: "8px 10px",
    borderBottom: "1px solid #cfcfcf",
    background: "#efefef",
    fontWeight: 600,
  },
  leftSearchStrip: {
    padding: "6px 8px",
    borderBottom: "1px solid #cfcfcf",
    background: "#f7f7f7",
  },
  leftBody: {
    padding: 6,
    overflow: "auto",
    flex: 1,
  },
  rightPane: {
    overflow: "hidden",
    background: "#fff",
    border: "1px solid #cfcfcf",
    display: "flex",
    flexDirection: "column",
    marginLeft: 8,
    marginRight: 20,
    minWidth: 0,
    minHeight:"calc(100vh - 100px)",
    flex: 1,
    height: "calc(100vh - 100px)",
  },
  gridTitleBar: {
    padding: "6px 10px",
    borderBottom: "1px solid #cfcfcf",
    background: "#E7F3FC",
    fontWeight: 600,
  },
  gridWrap: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
},

  detailTopBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderBottom: "1px solid #cfcfcf",
  },
  detailTitle: { fontWeight: 700, fontSize: 13 },
  tabsRow: {
    borderBottom: "1px solid #cfcfcf",
    background: "#f7f7f7",
    paddingLeft: 6,
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  detailHeaderStrip: {
    display: "grid",
    gridTemplateColumns: "180px 150px 150px 1fr 160px 160px 1fr",
    gap: 8,
    padding: "8px 10px",
    borderBottom: "1px solid #cfcfcf",
    background: "#E7F3FC",
    alignItems: "center",
  },
  headerField: { display: "flex", flexDirection: "column", minWidth: 0 },
  headerLabel: { fontSize: 11, opacity: 0.75 },
  headerValue: {
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};