import React from "react";
import { Button, Card, Col, Layout, Row, Segmented, Space, Tag, Typography, message } from "antd";
import { DownloadOutlined, FilterOutlined, GroupOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { DriverControlDrawer } from "./DriverControlDrawer";
import { DriverResultsPanel, type DriverGridViewMode } from "./DriverResultsPanel";
import { runDriverAnalysis } from "./driverMockApi";
import type { DriverAnalysisFormState, DriverAnalysisResult } from "./driverTypes";

const { Content } = Layout;
const { Text, Title } = Typography;

const defaultFormState: DriverAnalysisFormState = {
  portfolioId: "6614T",
  asOfDate: "2026-05-17",
  periods: ["MTD", "QTD", "YTD"],
  groupBy: ["sector"],
  displayNameField: "sector",
  metric: { name: "total_effect", label: "Total Effect", format: "bps" },
  top: { enabled: true, limit: 10 },
  bottom: { enabled: true, limit: 10 },
  includeComponents: ["allocation_effect", "selection_effect", "interaction_effect"],
  filters: { assetClass: [], currency: [], country: [], sector: [] },
  minimumAbsoluteValue: 0.000001,
  datasetSource: {
    type: "platform",
    endpoint: {
      url: "",
      method: "POST",
      headersJson: '{"Content-Type":"application/json"}',
      bodyJson: '{"portfolioId":"6614T","asOfDate":"2026-05-17","periods":["MTD","QTD","YTD"]}',
      authMode: "none"
    }
  }
};

export function DriverAnalysisWorkspace() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<DriverAnalysisFormState>(defaultFormState);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DriverAnalysisResult>();
  const [gridViewMode, setGridViewMode] = React.useState<DriverGridViewMode>("period");

  const handleRun = async (request: DriverAnalysisFormState) => {
    try {
      setLoading(true);
      setFormState(request);
      const response = await runDriverAnalysis(request);
      setResult(response);
      setDrawerOpen(false);
      message.success("Driver analysis completed.");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Unable to run driver analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormState(defaultFormState);
    setResult(undefined);
    message.info("Driver analysis has been reset.");
  };

  const handleExportCsv = () => {
    if (!result) {
      message.warning("Run analysis before exporting.");
      return;
    }

    const rows = [...result.topDrivers, ...result.bottomDrivers];
    const header = ["runId", "portfolioId", "asOfDate", "period", "direction", "rank", "driverName", "metricName", "metricValue", "metricDisplay"];
    const csv = [
      header.join(","),
      ...rows.map((row) => [
        result.runId,
        result.portfolioId,
        result.asOfDate,
        row.period,
        row.direction,
        row.rank,
        row.driverName,
        row.metricName,
        row.metricValue,
        row.metricDisplay
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `driver-analysis-${result.portfolioId}-${result.asOfDate}.csv`;
    element.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f3f6fb" }}>
      <Content style={{ padding: 16 }}>
        <Card size="small" className="driver-command-bar" bodyStyle={{ padding: "10px 12px" }} style={{ marginBottom: 12 }}>
          <Row align="middle" justify="space-between" gutter={[12, 8]}>
            <Col flex="auto">
              <Space direction="vertical" size={2}>
                <Space size={8} wrap>
                  <ThunderboltOutlined style={{ color: "#1d4ed8" }} />
                  <Title level={5} style={{ margin: 0 }}>Driver Analysis</Title>
                  <Tag color="blue">Portfolio {formState.portfolioId}</Tag>
                  <Tag color="purple">{formState.periods.join(", ")}</Tag>
                  <Tag color="green">{formState.metric.label}</Tag>
                </Space>
                <Space size={6} wrap>
                  <Text type="secondary">Top / bottom drivers across returns, attribution, risk, and P&L.</Text>
                  <Tag icon={<FilterOutlined />}>Dataset: {formState.datasetSource.type}</Tag>
                  <Tag>Group: {formState.groupBy.join(", ")}</Tag>
                  <Tag>As-of: {formState.asOfDate}</Tag>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space size={8}>
                <Segmented
                  size="small"
                  value={gridViewMode}
                  onChange={(value) => setGridViewMode(value as DriverGridViewMode)}
                  options={[
                    { label: "Flat", value: "flat", icon: <UnorderedListOutlined /> },
                    { label: "By Period", value: "period", icon: <GroupOutlined /> }
                  ]}
                />
                <Button size="small" icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
                <Button size="small" icon={<DownloadOutlined />} onClick={handleExportCsv}>Export</Button>
                <Button size="small" type="primary" icon={<SettingOutlined />} onClick={() => setDrawerOpen(true)}>Configure</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <DriverResultsPanel result={result} gridViewMode={gridViewMode} onGridViewModeChange={setGridViewMode} />

        <DriverControlDrawer
          open={drawerOpen}
          value={formState}
          loading={loading}
          onClose={() => setDrawerOpen(false)}
          onChange={setFormState}
          onRun={handleRun}
        />
      </Content>
    </Layout>
  );
}
