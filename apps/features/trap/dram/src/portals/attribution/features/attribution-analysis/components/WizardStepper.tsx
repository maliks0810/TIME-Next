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
  Space,
  Steps,
  message,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import { api, type OptionsResponse } from "../lib/services";
import { default_eq_port, referencePeriods } from "../lib/constants";

import type { PeriodCode } from "../lib/periods";
import type { MetricLabel } from "../lib/metrics";
import { EQ_KEY, getWizardState, setWizardState } from "./WizardStateStore";
import type { FrequencyMode, PortBenchRow, Props, WorkspaceState } from "../lib/types";
import { groupingOptions, groupingWithNoneOptions } from "../lib/groups";
import { buildBenchmarkOptions, buildPortfolioOptions } from "../lib/helpers";
import { CheckableTagGroup } from "./CheckableTagGroup";

interface WizardStep {
  title: string;
  content: React.ReactNode;
}

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
/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function WizardStepper({ onComplete }: Props)  {

  const [current, setCurrent] = useState<number>(0);
  const [state, setSavedState] = useState<WorkspaceState | null>(null);
  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  const periodOptions: { label: string; value: PeriodCode }[] = referencePeriods.map((p) => ({
    label: p,
    value: p as PeriodCode,
  }));
  const [viewPortfolios, setViewPortfolios] = useState<string[]>([default_eq_port]);
  const asOf = useMemo(() => (state?.asOfDate ? dayjs(state.asOfDate) : null), [state?.asOfDate]);
  const start = useMemo(() => (state?.startDate ? dayjs(state.startDate) : null), [state?.startDate]);
  const end = useMemo(() => (state?.endDate ? dayjs(state.endDate) : null), [state?.endDate]);

  const isValidAsOf = isMonthEnd(asOf);

  const handleFinish = async (state: WorkspaceState) => {
    try {
      await setWizardState(state, EQ_KEY);
      onComplete?.();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  /* ---------------------------------- */
  /* Load: localStorage first, then APIs with fallback */
  /* ---------------------------------- */

  useEffect(() => {
    const s = getWizardState(EQ_KEY) as WorkspaceState;

    setSavedState({
      ...s,
      periods: (s.periods ?? []) as PeriodCode[],
      metrics: (s.metrics ?? []) as MetricLabel[],
    });
    setViewPortfolios(s.portfolios ?? [default_eq_port]);
    Promise.all([
      api.getEQOptions().catch((err) => {
        console.error("getOptions failed:", err);
        message.warning("Options failed to load; showing saved selections only.");
        return []; // fallback
      }),
    ]).then(([opts]) => {
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
                  onChange={(v: FrequencyMode) => setSavedState({ ...state, frequencyMode: v })}
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
                    const nextBenchmarkOptions = buildBenchmarkOptions(portBenchRows, nextPortfolios);
                    const validSet = new Set(nextBenchmarkOptions.map((x) => x.value));

                    setSavedState((prev) => {
                      if (!prev) return prev; // keeps return type WorkspaceState | null

                      const pruned = prev.benchmarks.filter((b) => validSet.has(b));
                      const nextBenchmarks =
                        nextPortfolios.length > 0 && pruned.length === 0 && nextBenchmarkOptions.length > 0
                          ? [nextBenchmarkOptions[0].value]
                          : pruned;

                      return {
                        ...prev,                 //  prev is WorkspaceState here
                        portfolios: nextPortfolios,
                        benchmarks: nextBenchmarks,
                      };
                    });
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
                  onChange={(nextBenchmarks: string[]) => setSavedState({ ...state, benchmarks: nextBenchmarks })}
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
                      setSavedState({
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
                        setSavedState({
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
                        setSavedState({
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
                setSavedState({ ...state, primaryGrouping: v })
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
                  setSavedState({ ...state, secondaryGrouping: v })
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
                setSavedState({ ...state, tertiaryGrouping: v })
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
            <CheckableTagGroup<PeriodCode>
              options={periodOptions}
              value={state.periods}
              onChange={(vals) =>
                setSavedState({ ...state, periods: vals })
              }
              showSelectAll
              showClear
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
              onChange={(vals: MetricLabel[]) => setSavedState({ ...state, metrics: vals })}
            />
          </Form.Item>
        ),
      },
    ];
  }, [state, portfolioSelectOptions, benchmarkSelectOptions, asOf, start, end, isValidAsOf]);

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
            await setWizardState(state,EQ_KEY);
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
               await handleFinish(state);
                }}          >
            Run Analysis
          </Button>
        )}
      </Space>
    </Card>
  );
}
