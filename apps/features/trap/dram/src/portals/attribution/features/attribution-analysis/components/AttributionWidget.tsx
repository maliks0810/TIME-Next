// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Button,
//   DatePicker,
//   Select,
//   message,
// } from "antd";
// import DataGrid, {
//   Column,
//   Grouping,
//   GroupPanel,
//   Scrolling,
//   SearchPanel,
//   Sorting,
// } from "devextreme-react/data-grid";
// import dayjs, { Dayjs } from "dayjs";
// import "../lib/styles.css"
// import "devextreme/dist/css/dx.light.css";
// import {  default_em_port, default_fi_port } from "../lib/constants";
// import { buildPortfolioOptions, getBusinessDates, getPreviousMonthEnd } from "../lib/helpers";
// import { PortBenchRow, WorkspaceState } from "../lib/types";
// import { EM_KEY, getWizardState } from "./WizardStateStore";
// import { PeriodCode } from "../lib/periods";
// import { MetricLabel } from "../lib/metrics";
// import { AnalyticsResponse, api, OptionsResponse } from "../lib/services";
// import { exportDataGrid } from "devextreme/excel_exporter";
// import ExcelJS from "exceljs";
// import saveAs from "file-saver";
// import { ToolbarPreparingEvent } from "devextreme/ui/data_grid";
// // type LayoutMode = "single-period" | "period-first" | "metric-first";
// type ConfigTab = "fields" | "breakdown" | "periods";


// // type AnalysisRow = {
// //   cusip?: string | null;
// //   securitydescription?: string | null;
// //   portavgweight?: number | null;
// //   benchavgweight?: number | null;
// //   benchtotalreturn?: number | null;
// //   porttotalreturn?: number | null;
// //   portcontribution?: number | null;
// //   benchcontribution?: number | null;
// //   marketvalue?: number | null;
// //   allocationeffect?: number | null;
// //   selectioneffect?: number | null;
// //   interacteffect?: number | null;
// //   securityname?: string | null;
// //   breakdown?: string | null;
// //   period?: string | null;
// //   GICS1?: string | null;
// //   gics2?: string | null;
// //   gics3?: string | null;
// //   mrkcap?: number | null;
// //   peforward?: number | null;
// //   bm_only?: string | boolean | null;
// //   [key: string]: unknown;
// // };

// type PivotRow = {
//   id: string;
//   cusip: string | null;
//   securityName: string;
//   securityDescription: string | null;
//   breakdown: string | null;
//   GICS1: string | null;
//   gics2: string | null;
//   gics3: string | null;
//   mrkcap: number | null;
//   peforward: number | null;
//   marketValue: number | null;
//   bmOnly: string | null;
//   isGrandTotal: boolean;
//   isSubtotal: boolean;
//   [key: string]: unknown;
// };

// type FieldOption = {
//   key: string;
//   label: string;
//   type: "text" | "number" | "percent";
// };

// const AVAILABLE_FIELDS: FieldOption[] = [
//   { key: "cusip", label: "Cusip", type: "text" },
//   { key: "securityName", label: "Security Name", type: "text" },
//   { key: "securityDescription", label: "Security Description", type: "text" },
//   { key: "GICS1", label: "GICS1", type: "text" },
//   { key: "gics2", label: "GICS2", type: "text" },
//   { key: "gics3", label: "GICS3", type: "text" },
//   { key:  "mrkcap", label: "Market Cap Bucket", type: "text" },
//    { key: "peforward", label: "P/E Forward", type: "text" },
//   { key: "marketValue", label: "Market Value", type: "number" },
//   { key: "portAvgWeight", label: "Port Weight", type: "percent" },
//   { key: "portTotalRet", label: "Port Total Return", type: "number" },
//   { key: "portContToRet", label: "Port Contribution", type: "number" },
//   { key: "benchAvgWeight", label: "Bench Weight", type: "percent" },
//   { key: "benchTotalRet", label: "Bench Total Return", type: "number" },
//   { key: "benchContToRet", label: "Bench Contribution", type: "number" },
//   { key: "allocationEffect", label: "Allocation Effect", type: "number" },
//   { key: "selectionEffect", label: "Security Selection", type: "number" },
//   { key: "interactEffect", label: "Interact Effect", type: "number" },
//   { key: "totalEffect", label: "Total Effect", type: "number" },
// ];
// const BREAKDOWN_OPTIONS = [
//   { key: "GICS1", label: "GICS1" },
// //   { key: "gics2", label: "GICS2" },
// //   { key: "gics3", label: "GICS3" },
//   { key: "MktCap", label: "Market Cap Bucket" },
//   { key: "PEfwd", label: "P/E Forward" },
// ] as const;

// const PERIOD_OPTIONS = [
//   { key: "MTD", label: "MTD" },
//   { key: "QTD", label: "QTD" },
//   { key: "YTD", label: "YTD" },
//   { key: "3M", label: "3-Month Rolling" },
//   { key: "6M", label: "6-Month Rolling" },
//   { key: "1Y", label: "1Y" },
//   { key: "2Y", label: "2Y" },
//   { key: "3Y", label: "3Y" },
//   { key: "5Y", label: "5Y" },
// ] as const;

// // const LAYOUT_OPTIONS = [
// //   { value: "single-period", label: "Single Period Grouped" },
// //   { value: "period-first", label: "Period First" },
// //   { value: "metric-first", label: "Metric First" },
// // ] as const;


// const sortPriority = (row: PivotRow): number => {
//   if (row.isGrandTotal) return 0;   // highest priority
//   if (row.isSubtotal) return 1;     // second
//   return 2;                         // normal rows
// };

// // function isLayoutMode(value: string): value is LayoutMode {
// //   return value === "single-period" || value === "period-first" || value === "metric-first";
// // }

// function pctText(value: unknown): string {
//   if (value === null || value === undefined || value === "") return "";
//   const n = Number(value);
//   if (Number.isNaN(n)) return "";
//   return `${(n * 100).toFixed(2)}%`;
// }

// function numberText(value: unknown): string {
//   if (value === null || value === undefined || value === "") return "";
//   const n = Number(value);
//   if (Number.isNaN(n)) return "";
//   return n.toLocaleString();
// }


// export function mapAnalyticsToPivotRows(
//   data: AnalyticsResponse,
// ): PivotRow[] {
//   const map = new Map<string, PivotRow>();
//   let idx = 0;

//   for (const grid of data.data.grids ?? []) {
//     const period = "MTD";

//     for (const r of grid.rows ?? []) {
//       const securityName =
//         typeof r.SecurityName === "string" ? r.SecurityName : "";

//       const breakdown =
//         typeof grid.title === "string" && grid.title.trim()
//           ? grid.title
//           : null;

//       const isGrandTotal =
//         securityName.toLowerCase() === "total" && breakdown == null;

//       const isSubtotal =
//         breakdown != null && securityName === breakdown;

//       const identity = isGrandTotal
//         ? "__TOTAL__"
//         : `${securityName}||${breakdown ?? ""}`;

//       // ---- dynamic fields (case-safe) ----
//       const GICS1 =
//         (r["GICS1"] as string | null) ??
//         (r["GICS1"] as string | null) ??
//         null;

//       const gics2 =
//         (r["GICS2"] as string | null) ??
//         (r["gics2"] as string | null) ??
//         null;

//       const gics3 =
//         (r["GICS3"] as string | null) ??
//         (r["gics3"] as string | null) ??
//         null;

//       const mrkcap =
//         (r["MktCap"] as number | null) ??
//         (r["mrkcap"] as number | null) ??
//         null;

//       const peforward =
//         (r["PEfwd"] as number | null) ??
//         (r["peforward"] as number | null) ??
//         null;

//       if (!map.has(identity)) {
//         map.set(identity, {
//           id: `row-${idx++}`,
//           cusip: null,
//           securityName: isGrandTotal ? "Total" : securityName,
//           securityDescription: null,
//           breakdown,

//           GICS1,
//           gics2,
//           gics3,
//           mrkcap,
//           peforward,

//           marketValue: null,
//           bmOnly: null,

//           isGrandTotal,
//           isSubtotal,
//         });
//       }

//       const row = map.get(identity)!;

//       // ---- period pivot metrics ----

//       const alloc = toNumber(r.AllocEffect);
//       const select = toNumber(r.SelectEffect);
//       const interact = toNumber(r.InterEffect);

//       row[`${period}_portAvgWeight`] = toNumber(r.PFAvgWeight);
//       row[`${period}_benchAvgWeight`] = toNumber(r.BMAvgWeight);

//       row[`${period}_portTotalRet`] = toNumber(r.PFTotalRet);
//       row[`${period}_portContToRet`] = toNumber(r.PFContToRet);
//       row[`${period}_benchTotalRet`] = toNumber(r.BMTotalRet);
//       row[`${period}_benchContToRet`] = toNumber(r.BMContToRet);
//       row[`${period}_allocationEffect`] = alloc;
//       row[`${period}_selectionEffect`] = select;
//       row[`${period}_interactEffect`] = interact;

//       row[`${period}_totalEffect`] =
//         (alloc ?? 0) + (select ?? 0) + (interact ?? 0);


//       // preserve all raw fields (optional but recommended)
//       Object.assign(row, r);
//     }
//   }

//   return Array.from(map.values()).sort((a, b) => {
//     if (a.isGrandTotal) return -1;
//     if (b.isGrandTotal) return 1;
//     if (a.isSubtotal && !b.isSubtotal) return -1;
//     if (!a.isSubtotal && b.isSubtotal) return 1;
//     return String(a.securityName).localeCompare(
//       String(b.securityName)
//     );
//   });
// }

// function getPeriods(rows: PivotRow[]): string[] {
//   const periods = new Set<string>();
//   for (const row of rows) {
//     Object.keys(row).forEach((k) => {
//       const m = k.match(/^(.+?)_(portAvgWeight|benchAvgWeight|allocationEffect|selectionEffect|interactEffect|totalEffect)$/);
//       if (m) periods.add(m[1]);
//     });
//   }
//   return Array.from(periods);
// }

// function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
//   const next = [...items];
//   const target = index + direction;
//   if (target < 0 || target >= next.length) return next;
//   [next[index], next[target]] = [next[target], next[index]];
//   return next;
// }

// function ConfigPanel(props: {
//   selectedFields: string[];
//   setSelectedFields: (keys: string[]) => void;
//   selectedBreakdown: string;
//   setSelectedBreakdown: (key: string) => void;
//   selectedPeriods: string[];
//   setSelectedPeriods: (keys: string[]) => void;
//   onClose: () => void;
// }) {
//   const { selectedFields, setSelectedFields, selectedBreakdown, setSelectedBreakdown, selectedPeriods, setSelectedPeriods, onClose } = props;
//   const [tab, setTab] = useState<ConfigTab>("fields");
//   const [leftPick, setLeftPick] = useState<string | null>(null);
//   const [rightPick, setRightPick] = useState<string | null>(null);

//   const availableLeft = AVAILABLE_FIELDS.filter((f) => !selectedFields.includes(f.key));
//   const selectedRight = selectedFields.map((k) => AVAILABLE_FIELDS.find((f) => f.key === k)).filter(Boolean) as FieldOption[];

//   return (
//     <div className="config-shell">
//       <div className="config-header">
//         <div>
//           <div className="config-title">Configure Attribution Widget</div>
//           <div className="summary-line">Choose display fields, order, breakdown, and periods.</div>
//         </div>
//         <button onClick={onClose}>Close</button>
//       </div>

//       <div className="config-tabs">
//         <button className={`config-tab ${tab === "fields" ? "active" : ""}`} onClick={() => setTab("fields")}>Display Fields</button>
//         <button className={`config-tab ${tab === "breakdown" ? "active" : ""}`} onClick={() => setTab("breakdown")}>Breakdown</button>
//         <button className={`config-tab ${tab === "periods" ? "active" : ""}`} onClick={() => setTab("periods")}>Periods</button>
//       </div>

//       <div className="config-body">
//         {tab === "fields" && (
//           <div className="dual-list">
//             <div className="list-panel">
//               <div className="list-panel-header">Available Fields</div>
//               <div className="list-panel-body">
//                 {availableLeft.map((field) => (
//                   <div key={field.key} className={`list-item ${leftPick === field.key ? "selected" : ""}`} onClick={() => setLeftPick(field.key)}>
//                     {field.label}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="middle-actions">
//               <button onClick={() => { if (!leftPick) return; setSelectedFields([...selectedFields, leftPick]); setLeftPick(null); }}>Add →</button>
//               <button onClick={() => { if (!rightPick) return; setSelectedFields(selectedFields.filter((k) => k !== rightPick)); setRightPick(null); }}>← Remove</button>
//             </div>

//             <div className="list-panel">
//               <div className="list-panel-header">Selected Fields</div>
//               <div className="list-panel-body">
//                 {selectedRight.map((field) => (
//                   <div key={field.key} className={`list-item ${rightPick === field.key ? "selected" : ""}`} onClick={() => setRightPick(field.key)}>
//                     {field.label}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="order-actions">
//               <button onClick={() => { if (!rightPick) return; const index = selectedFields.indexOf(rightPick); setSelectedFields(moveItem(selectedFields, index, -1)); }}>Up</button>
//               <button onClick={() => { if (!rightPick) return; const index = selectedFields.indexOf(rightPick); setSelectedFields(moveItem(selectedFields, index, 1)); }}>Down</button>
//             </div>
//           </div>
//         )}

//         {tab === "breakdown" && (
//           <div className="breakdown-grid">
//             <div className="breakdown-card">
//               <h4>Choose Breakdown (Group By)</h4>
//               {BREAKDOWN_OPTIONS.map((opt) => (
//                 <label key={opt.key} className="breakdown-option">
//                   <input type="radio" checked={selectedBreakdown === opt.key} onChange={() => setSelectedBreakdown(opt.key)} />
//                   <span>{opt.label}</span>
//                 </label>
//               ))}
//               <label className="breakdown-option">
//                 <input type="radio" checked={selectedBreakdown === "flat"} onChange={() => setSelectedBreakdown("flat")} />
//                 <span>No Breakdown (Flat)</span>
//               </label>
//             </div>

//             <div className="breakdown-card">
//               <h4>Applied Summary</h4>
//               <div className="summary-line">Current breakdown: {selectedBreakdown}</div>
//               <div className="summary-line">Examples: GICS1, GICS2, GICS3, Market Cap Bucket, P/E Forward</div>
//             </div>
//           </div>
//         )}

//         {tab === "periods" && (
//           <div className="breakdown-grid">
//             <div className="breakdown-card">
//               <h4>Choose Periods</h4>
//               {PERIOD_OPTIONS.map((opt) => (
//                 <label key={opt.key} className="breakdown-option">
//                   <input
//                     type="checkbox"
//                     checked={selectedPeriods.includes(opt.key)}
//                     onChange={() => {
//                       if (selectedPeriods.includes(opt.key)) {
//                         setSelectedPeriods(selectedPeriods.filter((p) => p !== opt.key));
//                       } else {
//                         setSelectedPeriods([...selectedPeriods, opt.key]);
//                       }
//                     }}
//                   />
//                   <span>{opt.label}</span>
//                 </label>
//               ))}
//             </div>

//             <div className="breakdown-card">
//               <h4>Applied Summary</h4>
//               <div className="summary-line">Selected periods: {selectedPeriods.join(", ") || "None"}</div>
//               <div className="summary-line">Examples: MTD, QTD, YTD, 3-Month Rolling, 6-Month Rolling, 1Y, 2Y</div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="config-footer">
//         <button onClick={onClose}>Done</button>
//       </div>
//     </div>
//   );
// }

// const toNumber = (v: unknown): number | null => {
//   if (typeof v === "number") return v;
//   if (typeof v === "string" && v.trim() !== "") {
//     const n = Number(v);
//     return Number.isFinite(n) ? n : null;
//   }
//   return null;
// };

// // const withTotalSort = (dataField: string) => (rowData: PivotRow) => {
// //   const val = rowData[dataField];

// //   if (typeof val === "number") {
// //     return [sortPriority(rowData), val];
// //   }

// //   return `${sortPriority(rowData)}_${String(val ?? "")}`;
// // };

// const PERIOD = "MTD";

// const df = (metric: string) => `${PERIOD}_${metric}`;

// const metricFormat = (type: "text" | "number" | "percent") => (e: { value?: unknown }) =>
//   type === "percent" ? pctText(e.value) : numberText(e.value);

// const withTotalSortDf = (dataField: string) => (rowData: PivotRow) => {
//   const val = rowData[dataField];
//   if (typeof val === "number") return [sortPriority(rowData), val];
//   return `${sortPriority(rowData)}_${String(val ?? "")}`;
// };

// export default function AttributionWidget() {
// 	const [savedState, setSavedState] = useState<WorkspaceState | null>(null);
// 	const [viewPortfolios, setViewPortfolios] = useState<string>(default_fi_port);
// //	const [viewBenchmarks, setViewBenchmarks] = useState<string[]>([]);
// 	const [viewFrequencyMode, setViewFrequencyMode] = useState<string>('Monthly');
// 	const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
// 	const [viewAsOfDate, setViewAsOfDate] = useState<string>("");
//  	const [viewStartDate, setViewStartDate] = useState<string>("");
//  	const [viewEndDate, setViewEndDate] = useState<string>("");
// //	const [layoutMode, setLayoutMode] = useState<LayoutMode>("period-first");
// 	// const [searchText, setSearchText] = useState("");
// 	const [configOpen, setConfigOpen] = useState(false);
// 	const [selectedFields, setSelectedFields] = useState<string[]>([
//     "securityName",
//     "GICS1",
//     "marketValue",
//     "portAvgWeight",
//     "portTotalRet",
//     "portContToRet",
//     "benchAvgWeight",
//     "benchTotalRet",
//     "benchContToRet",
//     "allocationEffect",
//     "selectionEffect",
//     "interactEffect",
//     "totalEffect",
//   ]);
//   const [selectedBreakdown, setSelectedBreakdown] = useState<string>("GICS1");
//   const [selectedPeriods, setSelectedPeriods] = useState<string[]>(["MTD", "QTD", "YTD"]);
//   const [rows, setRows] = useState<PivotRow[]>([]);
//   const [viewTitle, setViewTitle] = useState<string>("Attribution by GICS1");
//   const allPeriods = useMemo(() => getPeriods(rows), [rows]);
//   const periods = useMemo(() => allPeriods.filter((p) => selectedPeriods.includes(p)), [allPeriods, selectedPeriods]);
// //  const firstPeriod = periods[0] ?? allPeriods[0] ?? "MTD";
//   const gridGroupBy = selectedBreakdown === "flat" ? "flat" : selectedBreakdown;
//   const businessDates = getBusinessDates();
//   // const filteredRows = useMemo(() => {
//   //   const q = searchText.trim().toLowerCase();
//   //   if (!q) return rows;
//   //   return rows.filter((r) =>
//   //     [r.securityName, r.securityDescription, r.breakdown, r.GICS1, r.gics2, r.gics3, r.mrkcap, r.peforward]
//   //       .filter((v) => v !== null && v !== undefined)
//   //       .some((v) => String(v).toLowerCase().includes(q))
//   //   );
//   // }, [rows, searchText]);
//   function processAnalysisResult(apiResp: AnalyticsResponse){
//     setRows(mapAnalyticsToPivotRows(apiResp));
//     setViewTitle(apiResp.message ?? "Attribution by GICS1");
// 	const allRows = Array.isArray(apiResp.data?.grids)
// 	  ? apiResp.data.grids.flatMap(g =>
// 		  Array.isArray(g.rows) ? g.rows : []
// 		)
// 	  : [];
// 	return allRows;
//   }
//   const selectedFieldDefs = selectedFields
//     .map((k) => AVAILABLE_FIELDS.find((f) => f.key === k))
//     .filter(Boolean) as FieldOption[];

// 	useEffect(() => {
// 		const s = getWizardState(EM_KEY) as WorkspaceState;

// 		setSavedState({
// 		...s,
// 		periods: (s.periods ?? []) as PeriodCode[],
// 		metrics: (s.metrics ?? []) as MetricLabel[],
// 		});

// 		setViewPortfolios(s.portfolios[0] ?? default_em_port);
// //		setViewBenchmarks(s.benchmarks ?? []);
// 		// setViewPeriods((s.periods ?? []) as PeriodCode[]);
// 		setViewAsOfDate(s.asOfDate ?? getPreviousMonthEnd());
// 		setViewStartDate(s.startDate ?? businessDates.firstDayOfMonth);
// 		setViewEndDate(s.endDate ?? businessDates.previousBusinessDay);
// 		// setViewPrimaryGrouping(s.primaryGrouping ?? "");
//     console.log(savedState);
// 	Promise.all([
// 	  api.getEMAccounts().catch((err) => {
// 		console.error("getOptions failed:", err);
// 		message.warning("Options failed to load; showing saved selections only.");
// 		return []; // fallback
// 	  }),
// 	]).then(async ([opts]) => {
// 	const apiResp = opts as OptionsResponse;
// 	const allRows = Array.isArray(apiResp.data?.grids)
// 	  ? apiResp.data.grids.flatMap(g =>
// 		  Array.isArray(g.rows) ? g.rows : []
// 		)
// 	  : [];

// 	const pb: PortBenchRow[] = allRows
// 	  .filter((r) => typeof r === "object" && r !== null)
// 	  .map((r) => ({
// 		PORTFOLIO_KEY: String(r["PORTFOLIO_KEY"] ?? ""),
// 		PORTFOLIO_NAME: String(r["PORTFOLIO_NAME"] ?? ""),

// 		PORTFOLIO_BENCHMARK_CODE: r["PORTFOLIO_BENCHMARK_CODE"] ?? null,
// 		PORTFOLIO_BENCHMARK_NAME: r["PORTFOLIO_BENCHMARK_NAME"] ?? null,
// 		PORTFOLIO_SECONDARY_BENCHMARK_CODE:
// 		  r["PORTFOLIO_SECONDARY_BENCHMARK_CODE"] ?? null,
// 		PORTFOLIO_SECONDARY_BENCHMARK_NAME:
// 		  r["PORTFOLIO_SECONDARY_BENCHMARK_NAME"] ?? null,
// 	  }))
// 	  .filter((r) => r.PORTFOLIO_KEY && r.PORTFOLIO_NAME);

// 	  setPortBenchRows(pb);
// 	  // const w = await api.runAnalysis(viewPortfolios[0] === undefined ? default_em_port : viewPortfolios[0],
// 		// viewPrimaryGrouping,viewStartDate === "" ? businessDates.firstDayOfMonth : viewStartDate,
// 		// viewEndDate === "" ? businessDates.previousBusinessDay : viewEndDate);
// 	  //const data = processAnalysisResult(w);
// 	  //setDataset( data);
// 	});
//   }, []);

//   const portfolioSelectOptions = useMemo(
// 	() => buildPortfolioOptions(portBenchRows ?? []),
// 	[portBenchRows]
//   );

//   // const benchmarkSelectOptions = useMemo(
// 	// () => buildBenchmarkOptions(portBenchRows ?? [], viewPortfolios),
// 	// [portBenchRows, viewPortfolios]
//   // );
//   const onToolbarPreparing = (e: ToolbarPreparingEvent) => {
//       const exportButton = {
//         widget: "dxButton",
//         location: "after",
//         options: {
//           icon: "export",
//           text: "Export",
//           onClick: () => {
//             const now = new Date();
//             const workbook = new ExcelJS.Workbook();
//             const worksheet = workbook.addWorksheet("Analytics");

//             exportDataGrid({
//               component: e.component,
//               worksheet,
//               autoFilterEnabled: true,
//               topLeftCell: { row: 1, column: 1 },
//             }).then(() => {
//               workbook.xlsx.writeBuffer().then((buffer) => {
//                 const fileName = `${viewTitle}_${now.toISOString()}.xlsx`;
//                 saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
//               });
//             });
//           },
//         },
//       };
//       e.toolbarOptions.items?.unshift(exportButton);
//     };

//   return (
//     <div className="app-shell">
//       <div className="main-area">
//         <div className="viewport-middle">
//           <div className="tab-page">
//             <div className="card">
//               {/* <p className="subtitle">
//                 Request #{response.metadata.requestId} · {filteredRows.length} rows · Breakdown {gridGroupBy.toUpperCase()} · {layoutMode}
//               </p>

//               <div className="badges">
//                 <span className="badge">Configurable display fields</span>
//                 <span className="badge">Configurable breakdown</span>
//                 <span className="badge">Configurable periods</span>
//                 <span className="badge">Viewport-safe shell</span>
//               </div> */}

//               <div className="toolbar">
//                 {/* <div className="control">
//                   <label>Layout</label>
//                   <select value={layoutMode} onChange={(e) => setLayoutMode(isLayoutMode(e.target.value) ? e.target.value : "period-first")}>
//                     {LAYOUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
//                   </select>
//                 </div>

//                 <div className="control">
//                   <label>Search</label>
//                   <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search security, GICS, market value" />
//                 </div> */}
// 				<div className="control">
// 					<label>Portfolios</label>
// 						<Select
// 						 style={{minWidth:"300px"}}
// 						value={viewPortfolios}
// 						options={portfolioSelectOptions}
// 						showSearch
// 						optionFilterProp="label"
// 						onChange={(nextPortfolios) => {
// 							setViewPortfolios(nextPortfolios);
// 							// const valid = new Set(
// 							// buildBenchmarkOptions(portBenchRows, nextPortfolios).map((x) => x.value)
// 							// );

// 							//setViewBenchmarks((prev) => prev.filter((b) => valid.has(b)));
// 						}}
// 						/>
// 				</div>
// 				<div className="control">
// 					<label>Frequency Mode</label>
// 					<Select
// 						value={viewFrequencyMode}
// 						options={[{ value: "Monthly" }]}
// 						onChange={setViewFrequencyMode}
// 					/>
// 				</div>
// 						  {viewFrequencyMode=== "Monthly" ? (
// 							<div className="control">
// 							  <label>As Of Date</label>

// 							  <DatePicker
// 								value={viewAsOfDate ? dayjs(viewAsOfDate) : null}
// 								disabledDate={(d: Dayjs) => d.date() !== d.daysInMonth()}
// 								onChange={(d) => setViewAsOfDate(d ? d.format("YYYY-MM-DD") : "")}
// 							  />
// 							</div>
// 						  ) : (
// 							<>

// 							 <div className="control">
// 							   <label>Start Date</label>
// 								<DatePicker
// 								  value={viewStartDate ? dayjs(viewStartDate) : null}
// 								  onChange={(d) => setViewStartDate(d ? d.format("YYYY-MM-DD") : "")}
// 								/>
// 							  </div>

// 							  <div className="control">
// 							   <label>End Date</label>
// 								<DatePicker
// 								  value={viewEndDate ? dayjs(viewEndDate) : null}
// 								  onChange={(d) => setViewEndDate(d ? d.format("YYYY-MM-DD") : "")}
// 								/>
// 							  </div>
// 							</>
// 						  )}
// 				<div>
// 							  <Button
// 								type="primary"
// 								onClick={async () => {
// 								  const resp = (await api.runMonthlyAssetAnalyis('EM',viewPortfolios ?? '3730T',viewAsOfDate)) as AnalyticsResponse;
// 								  processAnalysisResult(resp);
// 								 // setDataset(result);
// 								  message.success("Analysis complete");
// 								}}
// 							  >
// 								Run Analysis
// 							  </Button>
// 				</div>
//                 <div className="control">
//                   <label>Widget Config</label>
//                   <button onClick={() => setConfigOpen(true)}>Configure Widget</button>
//                 </div>
//               </div>

//               <div className="grid-region">
//                 <div className="grid-host">
//                   <DataGrid
//                     dataSource={rows}
//                     keyExpr="id"
//                     height="100%"
//                     width="100%"
//                     showBorders
//                     columnAutoWidth={false}
//                     allowColumnResizing
//                     rowAlternationEnabled
//                     onToolbarPreparing={onToolbarPreparing}
//                     onRowPrepared={(e) => {
//                       if (e.rowType !== "data") return;
//                       if (e.data?.isGrandTotal) e.rowElement.classList.add("total-row");
//                       if (e.data?.isSubtotal) e.rowElement.classList.add("subtotal-row");
//                     }}
//                   >
//                     <SearchPanel visible={false} />
//                     {/* <FilterRow visible />
//                     <HeaderFilter visible /> */}
//                     <Sorting mode="multiple" />
//                     <Grouping autoExpandAll />
//                     <GroupPanel visible />
//                     <Scrolling mode="virtual" rowRenderingMode="virtual" columnRenderingMode="virtual" />

//                     {/* {gridGroupBy !== "flat" ? <Column dataField={gridGroupBy} groupIndex={0} visible={false} /> : null}

//                     {selectedFieldDefs.map((field) => {
//                       if (field.key === "securityName") {
//                         return (
//                           <Column
//                             key={field.key}
//                             dataField="securityName"
//                             caption={field.label}
//                             fixed
//                             fixedPosition="left"
//                             width={220}
//                             cellRender={(cell) => {
//                               const data = cell.data as PivotRow;
//                               const cls = !data.isGrandTotal && !data.isSubtotal ? "child-security" : "";
//                               return <div className={cls}>{String(cell.value ?? "")}</div>;
//                             }}
//                             calculateSortValue={withTotalSort(field.key)}
//                           />
//                         );
//                       }

//                       if (field.key === "securityDescription") return <Column key={field.key} dataField="securityDescription" caption={field.label} width={220} calculateSortValue={withTotalSort(field.key)}/>;
//                       if (field.key === "cusip") return <Column key={field.key} dataField="cusip" caption={field.label} width={130 } calculateSortValue={withTotalSort(field.key)}/>;
//                       if (field.key === "GICS1") return <Column key={field.key} dataField="GICS1" caption={field.label} width={150} calculateSortValue={withTotalSort(field.key)}/>;
//                       if (field.key === "gics2") return <Column key={field.key} dataField="gics2" caption={field.label} width={150} calculateSortValue={withTotalSort(field.key)}/>;
//                       if (field.key === "gics3") return <Column key={field.key} dataField="gics3" caption={field.label} width={160} calculateSortValue={withTotalSort(field.key)}/>;
//                       if (field.key === "marketValue") return <Column key={field.key} dataField="marketValue" caption={field.label} alignment="right" customizeText={(e) => numberText(e.value)} width={140} />;

//                       const mk = (p: string, key: string) => `${p}_${key}`;

//                       if (layoutMode === "single-period") {
//                         const fieldKeyMap: Record<string, string> = {
//                           portAvgWeight: mk('MTD', "portAvgWeight"),
//                           portTotalRet:mk('MTD',"portTotalRet"),
//                           portContToRet:mk('MTD',"portContToRet"),
//                           benchAvgWeight: mk('MTD', "benchAvgWeight"),
//                           benchTotalRet:mk('MTD',"benchTotalRet"),
//                           benchContToRet:mk('MTD',"benchContToRet"),
//                           allocationEffect: mk('MTD', "allocationEffect"),
//                           selectionEffect: mk('MTD', "selectionEffect"),
//                           interactEffect: mk('MTD', "interactEffect"),
//                           totalEffect: mk('MTD', "totalEffect"),
//                         };
//                         return (
//                           <Column
//                             key={field.key}
//                             dataField={fieldKeyMap[field.key]}
//                             caption={field.label}
//                             alignment="right"
//                             customizeText={(e) => field.type === "number" ? numberText(e.value) : pctText(e.value)}
//                             width={130} calculateSortValue={withTotalSort(field.key)}
//                           />
//                         );
//                       }

//                       return (
//                         <Column key={field.key} caption={field.label}>
//                           {periods.map((p) => {
//                             const fieldKeyMap: Record<string, string> = {
//                               portAvgWeight: mk('MTD', "portAvgWeight"),
//                               portTotalRet:mk('MTD',"portTotalRet"),
//                               portContToRet:mk('MTD',"portContToRet"),
//                               benchAvgWeight: mk('MTD', "benchAvgWeight"),
//                               benchTotalRet:mk('MTD',"benchTotalRet"),
//                               benchContToRet:mk('MTD',"benchContToRet"),
//                               allocationEffect: mk('MTD', "allocationEffect"),
//                               selectionEffect: mk('MTD', "selectionEffect"),
//                               interactEffect: mk('MTD', "interactEffect"),
//                               totalEffect: mk('MTD', "totalEffect"),
//                             };
//                             return (
//                               <Column
//                                 key={`${field.key}_${p}`}
//                                 dataField={fieldKeyMap[field.key]}
//                                 caption={p}
//                                 alignment="right"
//                                 customizeText={(e) => field.type === "number" ? numberText(e.value) : pctText(e.value)}
//                                 width={120} calculateSortValue={withTotalSort(field.key)}
//                               />
//                             );
//                           })}
//                         </Column>
//                       );
//                     })} */}

// {/* Group by breakdown if selected */}
// {gridGroupBy !== "flat" ? (
//   <Column dataField={gridGroupBy} groupIndex={0} visible={false} />
// ) : null}

// {/* SECURITY band */}
// <Column caption="Security">
//   <Column
//     dataField="securityName"
//     caption="Security"
//     fixed
//     fixedPosition="left"
//     width={260}
//     calculateSortValue={withTotalSortDf("securityName")}
//     cellRender={(cell) => {
//       const data = cell.data as PivotRow;
//       const cls = !data.isGrandTotal && !data.isSubtotal ? "child-security" : "";
//       return <div className={cls}>{String(cell.value ?? "")}</div>;
//     }}
//   />
//   {/* Optional: show GICS1 under Security */}
//   {selectedFields.includes("GICS1") ? (
//     <Column
//       dataField="GICS1"
//       caption="GICS1"
//       width={180}
//       calculateSortValue={withTotalSortDf("GICS1")}
//     />
//   ) : null}
// </Column>

// {/* PORTFOLIO band */}
// <Column caption="Portfolio">
//   <Column
//     dataField={df("portAvgWeight")}
//     caption="PFAvg Weight"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("percent")}
//     calculateSortValue={withTotalSortDf(df("portAvgWeight"))}
//   />
//   <Column
//     dataField={df("portTotalRet")}
//     caption="PFTotal Ret"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("portTotalRet"))}
//   />
//   <Column
//     dataField={df("portContToRet")}
//     caption="PFCont To Ret"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("portContToRet"))}
//   />
// </Column>

// {/* BENCHMARK band */}
// <Column caption="Benchmark">
//   <Column
//     dataField={df("benchAvgWeight")}
//     caption="BMAvg Weight"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("percent")}
//     calculateSortValue={withTotalSortDf(df("benchAvgWeight"))}
//   />
//   <Column
//     dataField={df("benchTotalRet")}
//     caption="BMTotal Ret"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("benchTotalRet"))}
//   />
//   <Column
//     dataField={df("benchContToRet")}
//     caption="BMCont To Ret"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("benchContToRet"))}
//   />
// </Column>

// {/* EFFECTS band */}
// <Column caption="Effects">
//   <Column
//     dataField={df("allocationEffect")}
//     caption="Alloc Effect"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("allocationEffect"))}
//   />
//   <Column
//     dataField={df("selectionEffect")}
//     caption="Select Effect"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("selectionEffect"))}
//   />
//   <Column
//     dataField={df("interactEffect")}
//     caption="Inter Effect"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("interactEffect"))}
//   />
//   <Column
//     dataField={df("totalEffect")}
//     caption="Total Effect"
//     alignment="right"
//     width={140}
//     customizeText={metricFormat("number")}
//     calculateSortValue={withTotalSortDf(df("totalEffect"))}
//   />
// </Column>

//                   </DataGrid>
//                 </div>
//               </div>

//               <div className="summary-line" style={{ marginTop: 10 }}>
//                 Selected fields: {selectedFieldDefs.map((f) => f.label).join(", ")} | Breakdown: {selectedBreakdown} | Periods: {periods.join(", ") || "None"}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {configOpen && (
//         <ConfigPanel
//           selectedFields={selectedFields}
//           setSelectedFields={setSelectedFields}
//           selectedBreakdown={selectedBreakdown}
//           setSelectedBreakdown={setSelectedBreakdown}
//           selectedPeriods={selectedPeriods}
//           setSelectedPeriods={setSelectedPeriods}
//           onClose={() => setConfigOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
