import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Space, Spin, Typography } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import type { DriverModeConfig, DriverRow, UnifiedAttributionRow, WizardApplyPayload } from "../types/unifiedDriverAttribution";
import { useUnifiedDriverAttribution } from "../hooks/useUnifiedDriverAttribution";
import { buildUnifiedDriverAttributionRequest } from "../utils/requestBuilder";
import { DriverModeSettings } from "./DriverModeSettings";
import { DriverSummaryPanel } from "./DriverSummaryPanel";
import { UnifiedDriverChart } from "./UnifiedDriverChart";
import { UnifiedAttributionGrid } from "./UnifiedAttributionGrid";
import { ExportButton } from "./ExportButton";

const { Text, Title } = Typography;

interface UnifiedDriverAttributionPageProps {
  appliedConfig: WizardApplyPayload | null;
}

const defaultDriverConfig: DriverModeConfig = {
  sourceType: "attribution",
  topN: 10,
  rankingMetric: "totalEffect",
};

export function UnifiedDriverAttributionPage({ appliedConfig }: UnifiedDriverAttributionPageProps): React.ReactElement {
  const [driverConfig, setDriverConfig] = useState<DriverModeConfig>(defaultDriverConfig);
  const [selectedDriverRowKey, setSelectedDriverRowKey] = useState<string | undefined>();
  const analysis = useUnifiedDriverAttribution();

  const summary = useMemo(() => {
    if (!appliedConfig) return "No applied attribution configuration";
    return `${appliedConfig.portfolio} vs ${appliedConfig.benchmark} | ${appliedConfig.periodIds.join(", ")} | ${appliedConfig.breakdownModeId}`;
  }, [appliedConfig]);

  function canRun(): boolean {
    if (!appliedConfig) return false;
    if (driverConfig.sourceType === "manual") return Boolean(driverConfig.uploadedDataset?.validated && driverConfig.columnMapping);
    if (driverConfig.sourceType === "model") return Boolean(driverConfig.modelEndpointUrl || driverConfig.modelId);
    return true;
  }

  function handleRun(): void {
    if (!appliedConfig) return;
    const request = buildUnifiedDriverAttributionRequest(appliedConfig, driverConfig);
    void analysis.run(request);
  }

  function handleDriverClick(driver: DriverRow): void {
    setSelectedDriverRowKey(driver.rowKey);
  }

  function handleGridRowClick(row: UnifiedAttributionRow): void {
    if (row.isDriver) setSelectedDriverRowKey(row.rowKey);
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Card size="small">
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>Unified Attribution + Driver Analysis</Title>
          <Text type="secondary">{summary}</Text>
        </Space>
      </Card>

      <Card size="small" title="Driver Mode Settings" extra={<Button type="primary" icon={<PlayCircleOutlined />} disabled={!canRun()} loading={analysis.loading} onClick={handleRun}>Run</Button>}>
        <DriverModeSettings value={driverConfig} onChange={setDriverConfig} />
      </Card>

      {!appliedConfig ? <Alert type="info" showIcon message="Apply an attribution configuration before running driver analysis." /> : null}
      {analysis.error ? <Alert type="error" showIcon message={analysis.error} /> : null}
      {analysis.loading && !analysis.data ? <Spin /> : null}

      {analysis.data ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <DriverSummaryPanel
            summary={analysis.data.driverSummary}
            drivers={analysis.data.drivers}
            runAudit={analysis.data.runAudit}
            selectedDriverRowKey={selectedDriverRowKey}
            onDriverClick={handleDriverClick}
          />

          <UnifiedDriverChart drivers={analysis.data.drivers} selectedDriverRowKey={selectedDriverRowKey} onDriverClick={handleDriverClick} />

          <Card size="small" title="Attribution Grid" extra={<ExportButton rows={analysis.data.rows} />}>
            <UnifiedAttributionGrid rows={analysis.data.rows} selectedDriverRowKey={selectedDriverRowKey} onRowClick={handleGridRowClick} />
          </Card>
        </Space>
      ) : null}
    </Space>
  );
}
