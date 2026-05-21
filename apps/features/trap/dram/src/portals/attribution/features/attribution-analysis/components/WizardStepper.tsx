import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  SelectProps,
  Space,
  Steps,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import { api, type OptionsResponse } from "../lib/services";
import { referencePeriods } from "../lib/constants";

import type { PeriodCode } from "../lib/periods";
import type { MetricLabel } from "../lib/metrics";
import { getWizardState, setWizardState } from "./WizardStateStore";
import type { PortBenchRow } from "../lib/types";

/* ---------------------------------- */
/*  Types */
/* ---------------------------------- */

type FrequencyMode = "Monthly" | "Daily";

interface WorkflowState {
  frequencyMode: FrequencyMode;
  portfolios: string[];
  benchmarks: string[];

  asOfDate: string;
  startDate: string;
  endDate: string;

  baseCurrency: string;
  carveOut: string;

  periods: PeriodCode[];
  filters: string[];

  primaryGrouping: string;
  secondaryGrouping: string;
  tertiaryGrouping: string;

  metrics: MetricLabel[];

  layoutMode: string;
  detailPanels: string[];
}

interface WizardStep {
  title: string;
  content: React.ReactNode;
}

const groupingOptions: NonNullable<SelectProps["options"]> = [
  // Equity standard groupings
  { label: "GICS Sector", value: "GICS1" },
  { label: "GICS Industry Group", value: "GICS2" },
  { label: "GICS Industry", value: "GICS3" },
  { label: "GICS Sub-Industry", value: "GICS4" },

  // { label: "Style (Russell / S&P)", value: "STYLE" },                 // Style – Russell and S&P
  { label: "Market Capitalization", value: "MKTCAP" },                  // Market Capitalization
  { label: "PE Forward", value: "PEfwd" },                              // PE Forward
  // { label: "Country", value: "COUNTRY" },                              // Country/Region groupings
  // { label: "Region", value: "REGION" },                                // Country/Region groupings
  // { label: "Currency", value: "CURRENCY" },                            // Currency

  // { label: "Long / Short", value: "LONG_SHORT" },                      // Long/Short grouping
  // { label: "Portfolio / Benchmark", value: "PORT_BENCH" },             // Portfolio/Benchmark grouping

  // { label: "Security", value: "SECURITY" },                            // Security-level grouping
];


const noneOption: NonNullable<SelectProps["options"]>[number] = {
  label: "(None)",
  value: "",
};

const groupingWithNoneOptions: NonNullable<SelectProps["options"]> = [
  noneOption,
  ...groupingOptions,
];


/* ---------------------------------- */
/*  Options */
/* ---------------------------------- */

const periodOptions: { label: string; value: PeriodCode }[] = referencePeriods.map((p) => ({
  label: p,
  value: p as PeriodCode,
}));

const metricOptions = [
  "Port. Total Contribution",
  "Bench. Total Contribution",
  "Allocation Effect",
  "Selection Effect",
  "Interaction Effect",
] as const satisfies readonly MetricLabel[];

const metricSelectOptions: { label: MetricLabel; value: MetricLabel }[] = metricOptions.map((m) => ({
  label: m,
  value: m,
}));

/* ---------------------------------- */
/* Utils */
/* ---------------------------------- */

function isMonthEnd(date: Dayjs | null | undefined): boolean {
  if (!date) return false;
  return date.date() === date.daysInMonth();
}

function normalizeWorkflowState(raw: Partial<WorkflowState>): WorkflowState {
  return {
    frequencyMode: raw.frequencyMode ?? "Daily",

    portfolios: raw.portfolios ?? [],
    benchmarks: raw.benchmarks ?? [],

    asOfDate: raw.asOfDate ?? "",
    startDate: raw.startDate ?? "",
    endDate: raw.endDate ?? "",

    baseCurrency: raw.baseCurrency ?? "",
    carveOut: raw.carveOut ?? "",

    periods: raw.periods ?? [],
    filters: raw.filters ?? [],

    primaryGrouping: raw.primaryGrouping ?? "GICS1",
    secondaryGrouping: raw.secondaryGrouping ?? "",
    tertiaryGrouping: raw.tertiaryGrouping ?? "",

    metrics: raw.metrics ?? [],

    layoutMode: raw.layoutMode ?? "Grouped Grid",
    detailPanels: raw.detailPanels ?? [],
  };
}

type SelectOption = Readonly<{ value: string; label: string }>;

/* ---------------------------------- */
/* Builders (same logic style as Workspace) */
/* ---------------------------------- */

function buildPortfolioOptions(rows: ReadonlyArray<PortBenchRow>): SelectOption[] {
  const map = new Map<string, SelectOption>();

  for (const r of rows) {
    if (!map.has(r.PORTFOLIO_KEY)) {
      map.set(r.PORTFOLIO_KEY, {
        value: r.PORTFOLIO_KEY,
        label: `${r.PORTFOLIO_NAME} (${r.PORTFOLIO_KEY})`,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function buildBenchmarkOptionsForPortfolios(
  rows: ReadonlyArray<PortBenchRow>,
  selectedPortfolioKeys: ReadonlyArray<string>
): SelectOption[] {
  if (selectedPortfolioKeys.length === 0) return [];

  const selected = new Set(selectedPortfolioKeys);
  const map = new Map<string, SelectOption>();

  for (const r of rows) {
    if (!selected.has(r.PORTFOLIO_KEY)) continue;

    const add = (code: string | null, name: string | null) => {
      const value = code ?? name;
      if (!value) return;

      const label = name ? `${name}${code ? ` (${code})` : ""}` : value;
      map.set(value, { value, label });
    };

    add(r.PORTFOLIO_BENCHMARK_CODE, r.PORTFOLIO_BENCHMARK_NAME);
    add(r.PORTFOLIO_SECONDARY_BENCHMARK_CODE, r.PORTFOLIO_SECONDARY_BENCHMARK_NAME);
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function WizardStepper({
  sourcePath,
}: {
  sourcePath: "landing" | "workspace";
}) {
  const navigate = useNavigate();

  const [current, setCurrent] = useState<number>(0);
  const [state, setState] = useState<WorkflowState | null>(null);

  //  OptionsResponse is typed: { rows: PortBenchRow[] }
  const [options, setOptions] = useState<OptionsResponse>({ rows: [] });

  // convenient alias
  const rows = options.rows;

  const portfolioSelectOptions = useMemo<SelectOption[]>(
    () => buildPortfolioOptions(rows),
    [rows]
  );

  const benchmarkSelectOptions = useMemo<SelectOption[]>(
    () => buildBenchmarkOptionsForPortfolios(rows, state?.portfolios ?? []),
    [rows, state?.portfolios]
  );

  const asOf = useMemo(() => (state?.asOfDate ? dayjs(state.asOfDate) : null), [state?.asOfDate]);
  const start = useMemo(() => (state?.startDate ? dayjs(state.startDate) : null), [state?.startDate]);
  const end = useMemo(() => (state?.endDate ? dayjs(state.endDate) : null), [state?.endDate]);

  const isValidAsOf = isMonthEnd(asOf);

  /* ---------------------------------- */
  /* Load: localStorage first, then APIs with fallback */
  /* ---------------------------------- */

  useEffect(() => {
    // 1) Always hydrate from localStorage first so UI never blanks
    const local = getWizardState() as Partial<WorkflowState>;
    setState(normalizeWorkflowState(local));

    // 2) Fetch options + (optionally) workflow state
    Promise.all([
      api.getOptions().catch((err) => {
        console.error("getOptions failed:", err);
        message.warning("Options failed to load; showing saved selections only.");
        return { rows: [] } as OptionsResponse;
      }),
      api.getWorkflowState().catch((err) => {
        console.error("getWorkflowState failed:", err);
        message.warning("Workflow state failed to load; using saved state.");
        return null as Partial<WorkflowState> | null;
      }),
    ]).then(([opts, remote]) => {
      // options normalization
      setOptions({
        rows: Array.isArray(opts?.rows) ? opts.rows : [],
      });

      // state source selection:
      // - if opened from workspace: keep local storage edits
      // - if opened from landing: prefer backend state when available
      if (sourcePath === "landing" && remote) {
        setState(normalizeWorkflowState(remote));
      }
    });
  }, [sourcePath]);

  const steps: WizardStep[] = useMemo(() => {
    if (!state) return [];

    return [
      {
        title: "Scope",
        content: (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item label="Frequency Mode">
                <Select
                  value={state.frequencyMode}
                  options={[{ value: "Monthly" }, { value: "Daily" }]}
                  onChange={(v: FrequencyMode) => setState({ ...state, frequencyMode: v })}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Portfolios">
                <Select
                  mode="multiple"
                  value={state.portfolios}
                  options={portfolioSelectOptions}
                  showSearch
                  optionFilterProp="label"
                  onChange={(nextPortfolios: string[]) => {
                    // derive valid benchmarks for selected portfolios
                    const nextBenchmarkOptions = buildBenchmarkOptionsForPortfolios(rows, nextPortfolios);
                    const valid = new Set(nextBenchmarkOptions.map((x) => x.value));

                    // prune current benchmarks to valid set
                    const prunedBenchmarks = state.benchmarks.filter((b) => valid.has(b));

                    setState({
                      ...state,
                      portfolios: nextPortfolios,
                      benchmarks: prunedBenchmarks,
                    });

                    // optional: if portfolio selected but no benchmark selected, auto pick first
                    if (nextPortfolios.length > 0 && prunedBenchmarks.length === 0 && nextBenchmarkOptions.length > 0) {
                      setState((prev) =>
                        prev ? { ...prev, benchmarks: [nextBenchmarkOptions[0].value] } : prev
                      );
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Benchmarks">
                <Select
                  mode="multiple"
                  value={state.benchmarks}
                  options={benchmarkSelectOptions}
                  showSearch
                  optionFilterProp="label"
                  disabled={state.portfolios.length === 0}
                  onChange={(nextBenchmarks: string[]) => setState({ ...state, benchmarks: nextBenchmarks })}
                />
              </Form.Item>
            </Col>

            {state.frequencyMode === "Monthly" ? (
              <Col xs={24} md={12}>
                <Form.Item
                  label="As Of Date (Month-End Only)"
                  validateStatus={isValidAsOf ? undefined : "error"}
                  help={isValidAsOf ? undefined : "Please choose a month-end date."}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    value={asOf}
                    disabledDate={(d) => !isMonthEnd(d)}
                    onChange={(d) =>
                      setState({
                        ...state,
                        asOfDate: d ? d.format("YYYY-MM-DD") : "",
                      })
                    }
                  />
                </Form.Item>
              </Col>
            ) : (
              <>
                <Col xs={24} md={6}>
                  <Form.Item label="Start Date">
                    <DatePicker
                      value={start}
                      style={{ width: "100%" }}
                      onChange={(d) =>
                        setState({
                          ...state,
                          startDate: d ? d.format("YYYY-MM-DD") : "",
                        })
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label="End Date">
                    <DatePicker
                      value={end}
                      style={{ width: "100%" }}
                      onChange={(d) =>
                        setState({
                          ...state,
                          endDate: d ? d.format("YYYY-MM-DD") : "",
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        ),
      },
      {
  title: "Grouping",
  content: (
    <>
      <Alert
        type="info"
        showIcon
        message="Choose the grouping hierarchy used to roll up attribution rows."
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item label="Primary Grouping">
            <Select
              value={state.primaryGrouping}
              options={groupingOptions}
              showSearch
              optionFilterProp="label"
              onChange={(v: string) =>
                setState({ ...state, primaryGrouping: v })
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Secondary Grouping">

              <Select
                value={state.secondaryGrouping}
                options={groupingWithNoneOptions}
                showSearch
                optionFilterProp="label"
                onChange={(v: string) =>
                  setState({ ...state, secondaryGrouping: v })
                }
              />

          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Tertiary Grouping">
            <Select
              value={state.tertiaryGrouping}
              options={[{ label: "(None)", value: "" }, ...groupingOptions]}
              showSearch
              optionFilterProp="label"
              onChange={(v: string) =>
                setState({ ...state, tertiaryGrouping: v })
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  ),
},
      {
        title: "Periods",
        content: (
          <>
            <Alert
              type="info"
              showIcon
              message="Select one or more periods"
              style={{ marginBottom: 16 }}
            />
            <Form.Item label="Periods">
              <Select
                mode="multiple"
                value={state.periods}
                options={periodOptions}
                onChange={(vals: PeriodCode[]) => setState({ ...state, periods: vals })}
              />
            </Form.Item>
          </>
        ),
      },

      {
        title: "Metrics",
        content: (
          <Form.Item label="Metrics">
            <Select
              mode="multiple"
              value={state.metrics}
              options={metricSelectOptions}
              onChange={(vals: MetricLabel[]) => setState({ ...state, metrics: vals })}
            />
          </Form.Item>
        ),
      },
    ];
  }, [state, rows, portfolioSelectOptions, benchmarkSelectOptions, asOf, start, end, isValidAsOf]);

  if (!state) return <Card loading title="Configure Workflow Wizard" />;

  const canRun = state.frequencyMode === "Daily" || isValidAsOf;

  return (
    <Card title="Configure Workflow Wizard">
      <Steps current={current} items={steps.map((s) => ({ title: s.title }))} />

      <Form layout="vertical">{steps[current]?.content}</Form>

      <Space style={{ marginTop: 24 }}>
        <Button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Back
        </Button>

        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => setCurrent((c) => c + 1)}>
            Next
          </Button>
        )}

        <Button
          onClick={async () => {
            await setWizardState(state);
            message.success("Workflow saved");
          }}
        >
          Save
        </Button>

        {current === steps.length - 1 && (
          <Button
            type="primary"
            disabled={!canRun}
            onClick={async () => {
              await api.runAnalysis(state);
              navigate("/equity/workspace");
            }}
          >
            Run Analysis
          </Button>
        )}
      </Space>
    </Card>
  );
}