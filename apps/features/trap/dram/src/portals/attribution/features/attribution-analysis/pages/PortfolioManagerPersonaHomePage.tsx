import { useEffect, useMemo, useState } from "react";
import { Card, Col, message, Row } from "antd";

import { api, OptionsResponse } from "../lib/services";
import { buildPortfolioOptions } from "../lib/helpers";
import { PortBenchRow, Props } from "../lib/types";
import ConnectedAlphaDashboard from "../components/AlphaDashboard/ConnectedAlphaDashboard";

/* ---------------------------------- */
/*  Component */
/* ---------------------------------- */

export default function PortfolioManagerPersonaHomePage({ }: Props) {
  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  useEffect(() => {
	Promise.all([
	  api.getEQAccounts().catch((err) => {
		console.error("getEQAccounts failed:", err);
		message.warning("getEQAccounts failed to load; showing saved selections only.");
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


  const benchmarkSelectOptions = Array.from(
	new Set(
	  portBenchRows.flatMap((r) =>
		[
		  r.PORTFOLIO_BENCHMARK_CODE,
		  r.PORTFOLIO_SECONDARY_BENCHMARK_CODE,
		].filter(Boolean)
	  )
	)
  );


  const kpis: [string, string][] =
	[
	  ["Portfolio Count", `${portfolioSelectOptions.length}`],
	  ["Benchmark Count", `${benchmarkSelectOptions.length}`],
	];

  return (
	<div style={{margin:'16px' }}>
		<Row>
		<Col xs={4} md={4} lg={4}>
				<Card size="small" title="Equity KPI Preview">
							{kpis.map(([k, v]) => (
							<div
								key={k}
								style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 16,
								}}
							>
								<span>{k}</span>
								<strong>{v}</strong>
							</div>
							))}
						</Card>
		</Col>
	  </Row>

	  <Row gutter={[16, 16]}>
		<Col xs={24} md={24} lg={24}>
		<ConnectedAlphaDashboard  />
		</Col>
		</Row>

	</div>
  );
}