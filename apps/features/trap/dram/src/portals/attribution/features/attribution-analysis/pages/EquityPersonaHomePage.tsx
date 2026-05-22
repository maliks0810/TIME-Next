import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

import PathBanner from "../components/PathBanner";
import { api } from "../lib/services";

/* ---------------------------------- */
/*  Types */
/* ---------------------------------- */

interface WorkspaceData {
  kpis?: [string, string][];
}

interface SavedView {
  key: string;
  name: string;
  status: string;
}

/* ---------------------------------- */
/*  Component */
/* ---------------------------------- */

export default function EquityPersonaHomePage() {
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);

  useEffect(() => {
    api.getWorkspace('6614T').then(setWorkspace);
  }, []);

  const kpis: [string, string][] =
    workspace?.kpis ?? [
      ["Portfolio Count", "2"],
      ["Benchmark Count", "1"],
      ["Total Effect View", "0.38%"],
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
    <div>
      <Typography.Title level={2}>
        Equity Persona Home
      </Typography.Title>

      <PathBanner text="Path A starts here: Persona Home -> Configure Workflow -> Wizard -> FastAPI-backed workspace." />

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

        <div style={{ marginTop: 12 }}>
          {[
            "view_landing",
            "save_draft",
            "view_workspace",
            "manage_presets",
          ].map((c) => (
            <Tag key={c} color="blue">
              {c}
            </Tag>
          ))}
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
              onClick={() =>
                navigate("/equity/configure?source=landing")
              }
            >
              Configure Workflow
            </Button>

            <div style={{ height: 8 }} />

            <Button
              block
              onClick={() => navigate("/equity/workspace")}
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