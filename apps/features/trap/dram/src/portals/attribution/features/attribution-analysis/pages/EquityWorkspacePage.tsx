import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Typography,
  message,
} from "antd";

import dayjs, { Dayjs } from "dayjs";
import "devextreme/dist/css/dx.light.css";
import { AnalyticResultRow, AnalyticsResponse, api, OptionsResponse } from "../lib/services";
import { buildBenchmarkOptions, buildPortfolioOptions, getBusinessDates, isMonthEnd } from "../lib/helpers";
import { EQ_KEY, getWizardState } from "../components/WizardStateStore";
import { groupingOptions } from "../lib/groups";
import type { MetricLabel } from "../lib/metrics";
import type { PeriodCode } from "../lib/periods";
import { PortBenchRow, WorkspaceState } from "../lib/types";
import { default_eq_port } from "../lib/constants";
import { AnalyticsGridDx } from "../components/AnalyticsGridDx";
import { ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import { exportDataGrid } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function EquityWorkspacePage() {

  const [savedState, setSavedState] = useState<WorkspaceState | null>(null);
  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);

  const [dataset, setDataset] = useState<AnalyticResultRow[]>([]);

  const [viewPortfolios, setViewPortfolios] = useState<string[]>([default_eq_port]);
  const [viewBenchmarks, setViewBenchmarks] = useState<string[]>([]);
  const [viewPrimaryGrouping,setViewPrimaryGrouping] = useState<string>('GICS1');
  const [viewPeriods, setViewPeriods] = useState<PeriodCode[]>([]);
  const [viewAsOfDate, setViewAsOfDate] = useState<string>("");
  const [viewStartDate, setViewStartDate] = useState<string>("");
  const [viewEndDate, setViewEndDate] = useState<string>("");
  const [viewTitle, setViewTitle] = useState<string>("Attribution by GICS1");
  // const periodOptions: { label: string; value: PeriodCode }[] = referencePeriods.map((p) => ({
  //   label: p,
  //   value: p as PeriodCode,
  // }));

  const onToolbarPreparing = (e: ToolbarPreparingEvent) => {
      const exportButton = {
        widget: "dxButton",
        location: "after",
        options: {
          icon: "export",
          text: "Export",
          onClick: () => {
            const now = new Date();
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Analytics");

            exportDataGrid({
              component: e.component,
              worksheet,
              autoFilterEnabled: true,
              topLeftCell: { row: 1, column: 1 },
            }).then(() => {
              workbook.xlsx.writeBuffer().then((buffer) => {
                const fileName = `${viewTitle}_${now.toISOString()}.xlsx`;
                saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
              });
            });
          },
        },
      };
      e.toolbarOptions.items?.unshift(exportButton);
    };

  const businessDates = getBusinessDates();
  function processAnalysisResult(apiResp: AnalyticsResponse){
    setViewTitle(apiResp.message ?? "Attribution by GICS1");
    const allRows = Array.isArray(apiResp.data?.grids)
      ? apiResp.data.grids.flatMap(g =>
          Array.isArray(g.rows) ? g.rows : []
        )
      : [];
    return allRows;
  }

  useEffect(() => {
    const s = getWizardState(EQ_KEY) as WorkspaceState;

    setSavedState({
      ...s,
      periods: (s.periods ?? []) as PeriodCode[],
      metrics: (s.metrics ?? []) as MetricLabel[],
    });

    setViewPortfolios(s.portfolios ?? [default_eq_port]);
    setViewBenchmarks(s.benchmarks ?? []);
    setViewPeriods((s.periods ?? []) as PeriodCode[]);
    setViewAsOfDate(s.asOfDate ?? "");
    setViewStartDate(s.startDate ?? businessDates.firstDayOfMonth);
    setViewEndDate(s.endDate ?? businessDates.previousBusinessDay);
    setViewPrimaryGrouping(s.primaryGrouping ?? "");

    Promise.all([
      api.getEQOptions().catch((err) => {
        console.error("getOptions failed:", err);
        message.warning("Options failed to load; showing saved selections only.");
        return []; // fallback
      }),
    ]).then(async ([opts]) => {
    const apiResp = opts as OptionsResponse;
    const allRows = Array.isArray(apiResp.data?.grids)
      ? apiResp.data.grids.flatMap(g =>
          Array.isArray(g.rows) ? g.rows : []
        )
      : [];

    const pb: PortBenchRow[] = allRows
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
      .filter((r) => r.PORTFOLIO_KEY && r.PORTFOLIO_NAME);

      setPortBenchRows(pb);
      const w = await api.runAnalysis(viewPortfolios[0] === undefined ? default_eq_port : viewPortfolios[0],
        viewPrimaryGrouping,viewStartDate === "" ? businessDates.firstDayOfMonth : viewStartDate,
        viewEndDate === "" ? businessDates.previousBusinessDay : viewEndDate);
      const data = processAnalysisResult(w);
      setDataset( data);
    });
  }, []);

  const portfolioSelectOptions = useMemo(
    () => buildPortfolioOptions(portBenchRows ?? []),
    [portBenchRows]
  );

  const benchmarkSelectOptions = useMemo(
    () => buildBenchmarkOptions(portBenchRows ?? [], viewPortfolios),
    [portBenchRows, viewPortfolios]
  );

  const viewState: WorkspaceState | null = useMemo(() => {
    if (!savedState) return null;

    return {
      ...savedState,
      portfolios: viewPortfolios,
      benchmarks: viewBenchmarks,
      periods: viewPeriods,

      primaryGrouping: savedState.primaryGrouping,
      secondaryGrouping: savedState.secondaryGrouping,
      tertiaryGrouping: savedState.tertiaryGrouping,

      metrics: savedState.metrics,
    };
  }, [savedState, viewPortfolios, viewBenchmarks, viewPeriods]);

  if (!savedState || !viewState) return <Card loading title="Workspace" />;

  const canRun = savedState.frequencyMode === "Daily" || isMonthEnd(dayjs(viewAsOfDate));

  return (
    <div style={{margin:'16px'}}>
      <Card style={{ marginBottom: 16 }}>
        <Row>
          <Col xs={24} md={4}  style={{ marginRight: 16 }}>
            <Typography.Paragraph strong>Portfolios</Typography.Paragraph>
            <Select
              mode="multiple" style={{minWidth:"300px"}}
              value={viewPortfolios}
              options={portfolioSelectOptions}
              showSearch
              optionFilterProp="label"
              onChange={(nextPortfolios) => {
                setViewPortfolios(nextPortfolios);

                // prune invalid benchmarks when portfolios change
                const valid = new Set(
                  buildBenchmarkOptions(portBenchRows, nextPortfolios).map((x) => x.value)
                );

                setViewBenchmarks((prev) => prev.filter((b) => valid.has(b)));
              }}
            />
          </Col>

          <Col xs={24} md={4}>
            <Typography.Paragraph strong>Benchmarks</Typography.Paragraph>
            <Select
              mode="multiple"
              value={viewBenchmarks}
              options={benchmarkSelectOptions}
              showSearch
              optionFilterProp="label"
              disabled={viewPortfolios.length === 0 && !portBenchRows.every((x) => typeof x === "string")}
              onChange={setViewBenchmarks}
              style={{minWidth:"200px"}}
            />
          </Col>
            <Col xs={24} md={4}>
              <Typography.Paragraph strong>Breakdown</Typography.Paragraph>
                <Select
                  value={viewPrimaryGrouping} style={{minWidth:"200px"}}
                  options={groupingOptions}
                  showSearch
                  optionFilterProp="label"
                  onChange={setViewPrimaryGrouping}
                />

            </Col>
          {/* <Col xs={24} md={4}>
            <Typography.Paragraph strong>Periods</Typography.Paragraph>
            <Select
              mode="multiple"
              value={viewPeriods}
              options={periodOptions}
              onChange={(vals: PeriodCode[]) => setViewPeriods(vals)}
            />
          </Col> */}

          {savedState.frequencyMode === "Monthly" ? (
            <Col xs={24} md={2}>
              <Typography.Paragraph strong>As Of Date</Typography.Paragraph>

              <DatePicker
                value={viewAsOfDate ? dayjs(viewAsOfDate) : null}
                disabledDate={(d: Dayjs) => d.date() !== d.daysInMonth()}
                onChange={(d) => setViewAsOfDate(d ? d.format("YYYY-MM-DD") : "")}
              />
            </Col>
          ) : (
            <>

              <Col xs={24} md={2}>
              <Typography.Paragraph strong>Start Date</Typography.Paragraph>
                <DatePicker
                  value={viewStartDate ? dayjs(viewStartDate) : null}
                  onChange={(d) => setViewStartDate(d ? d.format("YYYY-MM-DD") : "")}
                />
              </Col>

              <Col xs={24} md={2}>
              <Typography.Paragraph strong>End Date</Typography.Paragraph>
                <DatePicker
                  value={viewEndDate ? dayjs(viewEndDate) : null}
                  onChange={(d) => setViewEndDate(d ? d.format("YYYY-MM-DD") : "")}
                />
              </Col>
            </>
          )}
          <Col xs={24} md={2}>
          <Typography.Paragraph strong> </Typography.Paragraph>
          <Button
            type="primary"
            disabled={!canRun}
            onClick={async () => {
              const resp = (await api.runAnalysis(viewPortfolios[0],viewPrimaryGrouping,viewStartDate,viewEndDate)) as AnalyticsResponse;
              const result = processAnalysisResult(resp);
              setDataset(result);
              message.success("Analysis complete");
            }}
          >
            Run Analysis
          </Button>
        </Col>
        </Row>

      </Card>

              <AnalyticsGridDx
                dataset={dataset} onToolbarPreparing={onToolbarPreparing}
                breakdownField={viewPrimaryGrouping}
              />

    </div>
  );
}