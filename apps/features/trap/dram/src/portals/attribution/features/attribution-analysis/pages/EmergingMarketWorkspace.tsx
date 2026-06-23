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

import {
  AnalyticResultRow,
  AnalyticsResponse,
  api,
  OptionsResponse,
} from "../lib/services";
import {
  buildBenchmarkOptions,
  buildPortfolioOptions,
  extractGridConfig,
  getBusinessDates,
  isMonthEnd,
} from "../lib/helpers";
import { PortBenchRow } from "../lib/types";
import { default_em_port } from "../lib/constants";
import { DramDataGrid, DramGridProvider, GridConfigResponse, normalizeColumns } from "../components/dram-grid";

import { getKeyByAssetClass } from "../components/WizardStateStore";
import { extractAnalysisRows, toGridRows } from "../components/attrib-analysis-config/attribConfigUtils";

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



/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function EmergingMarketWorkspace() {
  const businessDates = getBusinessDates();

  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  const [dataset, setDataset] = useState<AnalyticResultRow[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfigResponse | null>(null);

  const [viewPortfolios, setViewPortfolios] = useState<string>(default_em_port);
  const [viewBenchmarks, setViewBenchmarks] = useState<string[]>([]);
//   const [viewPeriods, setViewPeriods] = useState<PeriodCode[]>([]);
  const [viewAsOfDate, setViewAsOfDate] = useState<string>("");
  const [viewStartDate, setViewStartDate] = useState<string>("");
  const [viewEndDate, setViewEndDate] = useState<string>("");
  const [viewTitle, setViewTitle] = useState<string>("Attribution");
  const [viewFrequencyMode,setViewFrequencyMode] = useState<string>("monthly");
  const assetType= 'EM';


  const portfolioSelectOptions = useMemo(
	() => buildPortfolioOptions(portBenchRows),
	[portBenchRows]
  );

  const benchmarkSelectOptions = useMemo(
	() => buildBenchmarkOptions(portBenchRows, [viewPortfolios]),
	[portBenchRows, viewPortfolios]
  );

  const initialColumns = useMemo(() => {
	if (!gridConfig) {
	  return [];
	}

	return normalizeColumns(gridConfig, {
	  order: gridConfig.columnConfigs.all.map((c) => c.id),
	  widths: {},
	  visibility: {},
	});
  }, [gridConfig]);

  const gridRows = useMemo(() => toGridRows(dataset), [dataset]);

  const canRun =
	viewFrequencyMode === "Daily" ||
	isMonthEnd(dayjs(viewAsOfDate));

  const processAnalysisResult = (apiResp: AnalyticsResponse): AnalyticResultRow[] => {
	setViewTitle(apiResp.message ?? "Attribution by GICS1");
	return extractAnalysisRows(apiResp);
  };

  useEffect(() => {

	const loadPage = async (): Promise<void> => {
	  try {
		const optsResp = (await api.getAccounts(assetType)) as OptionsResponse;
		setPortBenchRows(extractPortBenchRows(optsResp));

	  } catch (err) {
		console.error("getAccounts failed:", err);
		message.warning("Options failed to load; showing saved selections only.");
	  }
	  try{
		const configResp = (await api.getConfigs(assetType))as GridConfigResponse;
		const gridConfig = extractGridConfig(configResp);
		if (gridConfig) {
			setGridConfig(gridConfig);
		}
	  } catch (err) {
		console.error("getConfigs EM failed:", err);
		message.warning("grid configs failed to load; showing saved selections only.");
	  }

	};

	void loadPage();
  }, [businessDates.firstDayOfMonth, businessDates.previousBusinessDay]);

  return (
	<div style={{ margin: "16px" }}>
	  <Card style={{ marginBottom: 16 }}>
		<Row gutter={[16, 16]}>
		  <Col xs={24} md={6}>
			<Typography.Paragraph strong>Portfolios</Typography.Paragraph>
			<Select
			  style={{ minWidth: "300px" }}
			  value={viewPortfolios}
			  options={portfolioSelectOptions}
			  showSearch
			  optionFilterProp="label"
			  onChange={(nextPortfolios) => {
				setViewPortfolios(nextPortfolios);

				const valid = new Set(
				  buildBenchmarkOptions(portBenchRows, [nextPortfolios]).map(
					(x) => x.value
				  )
				);

				setViewBenchmarks((prev) => prev.filter((b) => valid.has(b)));
			  }}
			/>
		  </Col>

		  <Col xs={24} md={5}>
			<Typography.Paragraph strong>Benchmarks</Typography.Paragraph>
			<Select
			  mode="multiple"
			  value={viewBenchmarks}
			  options={benchmarkSelectOptions}
			  showSearch
			  optionFilterProp="label"
			  disabled={viewPortfolios.length === 0}
			  onChange={setViewBenchmarks}
			  style={{ minWidth: "220px" }}
			/>
		  </Col>

		  {/* <Col xs={24} md={4}>
			<Typography.Paragraph strong>Breakdown</Typography.Paragraph>
			<Select
			  value={viewPrimaryGrouping}
			  style={{ minWidth: "220px" }}
			  options={groupingOptions}
			  showSearch
			  optionFilterProp="label"
			  onChange={setViewPrimaryGrouping}
			/>
		  </Col> */}
		  <Col>
		  <Typography.Paragraph strong>Frequency</Typography.Paragraph>
          <Select
            value={viewFrequencyMode}
            onChange={(v) =>
              setViewFrequencyMode(v)
            }
            options={gridConfig?.frequencyMode.map((f) => ({
              value: f.id,
              label: f.label,
            }))}
            style={{ width: 240 }}
          />
          </Col>
		  {viewFrequencyMode === "monthly" ? (
			<Col xs={24} md={3}>
			  <Typography.Paragraph strong>As Of Date</Typography.Paragraph>
			  <DatePicker
				value={viewAsOfDate ? dayjs(viewAsOfDate) : null}
				disabledDate={(d: Dayjs) => d.date() !== d.daysInMonth()}
				onChange={(d) => setViewAsOfDate(d ? d.format("YYYY-MM-DD") : "")}
			  />
			</Col>
		  ) : (
			<>
			  <Col xs={24} md={3}>
				<Typography.Paragraph strong>Start Date</Typography.Paragraph>
				<DatePicker
				  value={viewStartDate ? dayjs(viewStartDate) : null}
				  onChange={(d) => setViewStartDate(d ? d.format("YYYY-MM-DD") : "")}
				/>
			  </Col>

			  <Col xs={24} md={3}>
				<Typography.Paragraph strong>End Date</Typography.Paragraph>
				<DatePicker
				  value={viewEndDate ? dayjs(viewEndDate) : null}
				  onChange={(d) => setViewEndDate(d ? d.format("YYYY-MM-DD") : "")}
				/>
			  </Col>
			</>
		  )}

		  <Col xs={24} md={3}>
			<Typography.Paragraph strong> </Typography.Paragraph>
			<Button
			  type="primary"
			  disabled={!canRun}
			  onClick={async () => {
				try {
				  const resp = (await api.runAnalysis(
					assetType,
					viewPortfolios ?? default_em_port,
					"monthly","",
					viewAsOfDate,""
				  )) as AnalyticsResponse;

				  const nextConfig = extractGridConfig(resp);
				  if (nextConfig) {
					setGridConfig(nextConfig);
				  }

				  setDataset(processAnalysisResult(resp));
				  message.success("Analysis complete");
				} catch (err) {
				  console.error("runAnalysis failed:", err);
				  message.error("Analysis failed");
				}
			  }}
			>
			  Run Analysis
			</Button>
		  </Col>
		</Row>
	  </Card>

	  {gridConfig ? (
		<DramGridProvider
		  config={gridConfig}
		  storageKey={getKeyByAssetClass(assetType)}
		  allColumns={initialColumns}
		>
		  <Card title={viewTitle}>
			<DramDataGrid
			  config={gridConfig}
			  rows={gridRows}
			  height={500} storageKey={getKeyByAssetClass(assetType)}
			  isConfigView={false}
			/>
		  </Card>
		</DramGridProvider>
	  ) : (
		<Card title={viewTitle}>
		  <Typography.Text type="secondary">
			No backend grid configuration was found in the response.
		  </Typography.Text>
		</Card>
	  )}
	</div>
  );
}
