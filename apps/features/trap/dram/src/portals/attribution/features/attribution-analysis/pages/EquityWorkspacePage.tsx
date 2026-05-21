import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";

import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

import { api, OptionsResponse } from "../lib/services";
import PathBanner from "../components/PathBanner";
import { referencePeriods } from "../lib/constants";
import {
  buildDynamicColumns,
  type DynamicGridState,
} from "../components/buildDynamicGrid";
import type { AnalyticsRow } from "../lib/attributionRowModel";
import type { PeriodCode } from "../lib/periods";
import type { MetricLabel } from "../lib/metrics";
import { getWizardState } from "../components/WizardStateStore";

/* ---------------------------------- */
/* ✅ Types */
/* ---------------------------------- */

interface WorkspaceState extends DynamicGridState {
  frequencyMode: "Monthly" | "Daily";

  asOfDate: string;
  startDate: string;
  endDate: string;

  benchmarks: string[];

  periods: PeriodCode[];
  metrics: MetricLabel[];
}

interface WorkspaceResponse {
  rows?: AnalyticsRow[];
}

/**
 * If OptionsResponse.rows is coming from your SQL join dataset,
 * each row will look like this (portfolio + benchmarks).
 */
type PortBenchRow = Readonly<{
  PORTFOLIO_KEY: string;
  PORTFOLIO_NAME: string;

  PORTFOLIO_BENCHMARK_CODE: string | null;
  PORTFOLIO_BENCHMARK_NAME: string | null;

  PORTFOLIO_SECONDARY_BENCHMARK_CODE: string | null;
  PORTFOLIO_SECONDARY_BENCHMARK_NAME: string | null;
}>;

type SelectOption = Readonly<{ value: string; label: string }>;

/* ---------------------------------- */
/* ✅ Utils */
/* ---------------------------------- */

function isMonthEnd(date: Dayjs | null | undefined): boolean {
  if (!date) return false;
  return date.date() === date.daysInMonth();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPortBenchRow(v: unknown): v is PortBenchRow {
  if (!isRecord(v)) return false;
  return (
    typeof v["PORTFOLIO_KEY"] === "string" &&
    typeof v["PORTFOLIO_NAME"] === "string"
  );
}

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Build Portfolio options that work whether options.rows is:
 * - string[]  (legacy)
 * - PortBenchRow[] (dataset-driven)
 */
function buildPortfolioOptions(rows: unknown[]): SelectOption[] {
  const map = new Map<string, SelectOption>();

  for (const r of rows) {
    if (typeof r === "string") {
      // legacy string option
      if (!map.has(r)) map.set(r, { value: r, label: r });
      continue;
    }

    if (isPortBenchRow(r)) {
      const key = r.PORTFOLIO_KEY;
      if (!map.has(key)) {
        map.set(key, { value: key, label: `${r.PORTFOLIO_NAME} (${key})` });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Build Benchmark options dependent on selected portfolios.
 * Works whether options.rows is:
 * - string[] (legacy)
 * - PortBenchRow[] (dataset-driven)
 */
function buildBenchmarkOptions(rows: unknown[], selectedPortfolios: string[]): SelectOption[] {
  // legacy: if rows are strings, we can only show them directly (no dependency)
  const allStrings = rows.every((x) => typeof x === "string");
  if (allStrings) {
    const uniq = Array.from(new Set(rows as string[]));
    return uniq.map((v) => ({ value: v, label: v }));
  }

  if (selectedPortfolios.length === 0) return [];

  const selected = new Set(selectedPortfolios);
  const map = new Map<string, SelectOption>();

  for (const r of rows) {
    if (!isPortBenchRow(r)) continue;
    if (!selected.has(r.PORTFOLIO_KEY)) continue;

    const add = (code: string | null, name: string | null) => {
      const value = code ?? name;
      if (!value) return;
      const label = name ? `${name}${code ? ` (${code})` : ""}` : value;
      if (!map.has(value)) map.set(value, { value, label });
    };

    add(r.PORTFOLIO_BENCHMARK_CODE, r.PORTFOLIO_BENCHMARK_NAME);
    add(r.PORTFOLIO_SECONDARY_BENCHMARK_CODE, r.PORTFOLIO_SECONDARY_BENCHMARK_NAME);
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/* ---------------------------------- */
/* ✅ Component */
/* ---------------------------------- */

export default function EquityWorkspacePage() {
  const navigate = useNavigate();

  const [savedState, setSavedState] = useState<WorkspaceState | null>(null);
  const [options, setOptions] = useState<OptionsResponse>({
    rows: [],
  });

  const [dataset, setDataset] = useState<AnalyticsRow[]>([]);

  const [viewPortfolios, setViewPortfolios] = useState<string[]>([]);
  const [viewBenchmarks, setViewBenchmarks] = useState<string[]>([]);
  const [viewPeriods, setViewPeriods] = useState<PeriodCode[]>([]);
  const [viewAsOfDate, setViewAsOfDate] = useState<string>("");
  const [viewStartDate, setViewStartDate] = useState<string>("");
  const [viewEndDate, setViewEndDate] = useState<string>("");

  const periodOptions: { label: string; value: PeriodCode }[] = referencePeriods.map((p) => ({
    label: p,
    value: p as PeriodCode,
  }));

  useEffect(() => {
    const s = getWizardState() as WorkspaceState;

    setSavedState({
      ...s,
      periods: (s.periods ?? []) as PeriodCode[],
      metrics: (s.metrics ?? []) as MetricLabel[],
    });

    setViewPortfolios(s.portfolios ?? []);
    setViewBenchmarks(s.benchmarks ?? []);
    setViewPeriods((s.periods ?? []) as PeriodCode[]);
    setViewAsOfDate(s.asOfDate ?? "");
    setViewStartDate(s.startDate ?? "");
    setViewEndDate(s.endDate ?? "");

    Promise.all([
      api.getOptions().catch((err) => {
        console.error("getOptions failed:", err);
        message.warning("Options failed to load; showing saved selections only.");
        return { rows: [] } as OptionsResponse; // fallback
      }),
      api.getWorkspace("6614T").catch((err) => {
        console.error("getWorkspace failed:", err);
        message.warning("Workspace failed to load; dataset is empty.");
        return { rows: [] } as WorkspaceResponse; // fallback
      }),
    ]).then(([opts, ws]) => {
      // ✅ Normalize and protect against missing/invalid shapes
      const safeRows = safeArray<unknown>((opts as OptionsResponse | undefined)?.rows);
      setOptions({ rows: safeRows } as OptionsResponse);

      const w = ws as WorkspaceResponse;
      setDataset(Array.isArray(w?.rows) ? (w.rows as AnalyticsRow[]) : []);
    });
  }, []);

  // ✅ Derived safe options (never crashes even if rows are empty)
  const rawRows = useMemo(() => safeArray<unknown>(options?.rows), [options]);

  const portfolioSelectOptions = useMemo<SelectOption[]>(
    () => buildPortfolioOptions(rawRows),
    [rawRows]
  );

  const benchmarkSelectOptions = useMemo<SelectOption[]>(
    () => buildBenchmarkOptions(rawRows, viewPortfolios),
    [rawRows, viewPortfolios]
  );

  const viewState: DynamicGridState | null = useMemo(() => {
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

  const columns = buildDynamicColumns(viewState);

  const canRun = savedState.frequencyMode === "Daily" || isMonthEnd(dayjs(viewAsOfDate));

  return (
    <div>
      <Typography.Title level={2}>Equity Workspace</Typography.Title>

      <PathBanner text="Grid groups by portfolio → period → metric." />

      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Button onClick={() => navigate("/equity/configure?source=workspace")}>
          Reconfigure
        </Button>
        <Button>Save as Preset</Button>
        <Button>Export</Button>
      </Space>

      <Card title="View Mode Selection" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Typography.Paragraph strong>Portfolios</Typography.Paragraph>
            <Select
              mode="multiple"
              value={viewPortfolios}
              options={portfolioSelectOptions}
              showSearch
              optionFilterProp="label"
              onChange={(nextPortfolios) => {
                setViewPortfolios(nextPortfolios);

                // ✅ prune invalid benchmarks when portfolios change
                const valid = new Set(
                  buildBenchmarkOptions(rawRows, nextPortfolios).map((x) => x.value)
                );

                setViewBenchmarks((prev) => prev.filter((b) => valid.has(b)));
              }}
            />
          </Col>

          <Col xs={24} md={8}>
            <Typography.Paragraph strong>Benchmarks</Typography.Paragraph>
            <Select
              mode="multiple"
              value={viewBenchmarks}
              options={benchmarkSelectOptions}
              showSearch
              optionFilterProp="label"
              disabled={viewPortfolios.length === 0 && !rawRows.every((x) => typeof x === "string")}
              onChange={setViewBenchmarks}
            />
          </Col>

          <Col xs={24} md={8}>
            <Typography.Paragraph strong>Periods</Typography.Paragraph>
            <Select
              mode="multiple"
              value={viewPeriods}
              options={periodOptions}
              onChange={(vals: PeriodCode[]) => setViewPeriods(vals)}
            />
          </Col>

          {savedState.frequencyMode === "Monthly" ? (
            <Col xs={24} md={8}>
              <Typography.Paragraph strong>As Of Date</Typography.Paragraph>

              <DatePicker
                value={viewAsOfDate ? dayjs(viewAsOfDate) : null}
                disabledDate={(d: Dayjs) => d.date() !== d.daysInMonth()}
                onChange={(d) => setViewAsOfDate(d ? d.format("YYYY-MM-DD") : "")}
              />
            </Col>
          ) : (
            <>
              <Col xs={24} md={4}>
                <DatePicker
                  value={viewStartDate ? dayjs(viewStartDate) : null}
                  onChange={(d) => setViewStartDate(d ? d.format("YYYY-MM-DD") : "")}
                />
              </Col>

              <Col xs={24} md={4}>
                <DatePicker
                  value={viewEndDate ? dayjs(viewEndDate) : null}
                  onChange={(d) => setViewEndDate(d ? d.format("YYYY-MM-DD") : "")}
                />
              </Col>
            </>
          )}
        </Row>

        <Space style={{ marginTop: 16 }}>
          <Button
            type="primary"
            disabled={!canRun}
            onClick={async () => {
              const resp = (await api.runAnalysis(viewState)) as WorkspaceResponse;

              setDataset(Array.isArray(resp?.rows) ? resp.rows : []);
              message.success("Analysis complete");
            }}
          >
            Run Analysis
          </Button>
        </Space>
      </Card>

      <Table<AnalyticsRow>
        rowKey={(row, idx) =>
          typeof row.key !== "undefined" ? String(row.key) : String(idx)
        }
        dataSource={Array.isArray(dataset) ? dataset : []}
        columns={columns}
        pagination={false}
        scroll={{ x: 3200 }}
      />
    </div>
  );
}