import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, message, Row, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { api, OptionsResponse } from "../lib/services";
import { buildPortfolioOptions } from "../lib/helpers";
import { PortBenchRow, Props } from "../lib/types";

interface SavedView {
  key: string;
  name: string;
  status: string;
}

/* ---------------------------------- */
/*  Component */
/* ---------------------------------- */

export default function EquityPersonaHomePage({ onConfigure, onComplete }: Props) {
  const [portBenchRows, setPortBenchRows] = useState<PortBenchRow[]>([]);
  useEffect(() => {
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

  const savedViews: SavedView[] = [
    {
      key: "1",
      name: "Equity YTD Review",
      status: "Draft",
    },
  ];

  const columns: ColumnsType<SavedView> = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
    },
  ];

  return (
    <div style={{margin:'16px'}}>
      <Typography.Title level={2}>
        Equity Performance Analyst Persona Home
      </Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <strong>Department:</strong> Performance
          </div>
          <div>
            <strong>Group:</strong> Equity
          </div>
          <div>
            <strong>Active Persona:</strong> Equity Performance Analyst
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="KPI Preview">
            {kpis.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title="Quick Actions">
            <Button
              type="primary"
              block
              onClick={onConfigure}
            >
              Configure Workflow
            </Button>

            <div style={{ height: 8 }} />

            <Button
              block
              onClick={onComplete}
            >
              Open Latest Workspace
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Saved Views">
            <Table<SavedView>
              rowKey="key"
              size="small"
              pagination={false}
              dataSource={savedViews}
              columns={columns}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}