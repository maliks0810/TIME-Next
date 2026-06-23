import React from "react";
import { Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import type { DriverRow, DriverSummary, RunAudit } from "../types/unifiedDriverAttribution";
import { formatBps } from "../utils/formatting";

const { Text } = Typography;

interface DriverSummaryPanelProps {
  summary: DriverSummary;
  drivers: DriverRow[];
  runAudit: RunAudit;
  selectedDriverRowKey?: string;
  onDriverClick: (driver: DriverRow) => void;
}

export function DriverSummaryPanel({ summary, drivers, runAudit, selectedDriverRowKey, onDriverClick }: DriverSummaryPanelProps): React.ReactElement {
  const topDrivers = drivers.filter((driver) => driver.side === "top");
  const bottomDrivers = drivers.filter((driver) => driver.side === "bottom");

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small"><Statistic title="Top Total" value={summary.topTotalBps} precision={2} suffix="bps" valueStyle={{ color: "#0958d9" }} /><Text type="secondary">{summary.topCount} rows</Text></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small"><Statistic title="Bottom Total" value={summary.bottomTotalBps} precision={2} suffix="bps" valueStyle={{ color: "#a8071a" }} /><Text type="secondary">{summary.bottomCount} rows</Text></Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="Run Audit">
            <Row gutter={[12, 4]}>
              <Col span={12}><Text>Run ID: {runAudit.runId}</Text></Col>
              <Col span={12}><Text>Status: <Tag color={runAudit.status === "Completed" ? "green" : "orange"}>{runAudit.status}</Tag></Text></Col>
              <Col span={12}><Text>Metric: {runAudit.metric}</Text></Col>
              <Col span={12}><Text>Source: {runAudit.sourceType}</Text></Col>
              <Col span={12}><Text>Input Rows: {runAudit.inputRows}</Text></Col>
              <Col span={12}><Text>Duration: {runAudit.durationMs} ms</Text></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Driver Focus">
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={12}><DriverList title="Top Drivers" drivers={topDrivers} selectedDriverRowKey={selectedDriverRowKey} onDriverClick={onDriverClick} /></Col>
          <Col xs={24} lg={12}><DriverList title="Bottom Drivers" drivers={bottomDrivers} selectedDriverRowKey={selectedDriverRowKey} onDriverClick={onDriverClick} /></Col>
        </Row>
      </Card>
    </Space>
  );
}

interface DriverListProps {
  title: string;
  drivers: DriverRow[];
  selectedDriverRowKey?: string;
  onDriverClick: (driver: DriverRow) => void;
}

function DriverList({ title, drivers, selectedDriverRowKey, onDriverClick }: DriverListProps): React.ReactElement {
  return (
    <Space direction="vertical" size={6} style={{ width: "100%" }}>
      <Text strong>{title}</Text>
      {drivers.map((driver) => {
        const selected = driver.rowKey === selectedDriverRowKey;
        const isTop = driver.side === "top";
        return (
          <button key={driver.rowKey} type="button" onClick={() => onDriverClick(driver)} style={{ width: "100%", textAlign: "left", border: selected ? "1px solid #1677ff" : "1px solid #f0f0f0", background: selected ? "#e6f4ff" : "#fff", borderRadius: 6, padding: "8px 10px", cursor: "pointer" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space><Tag color={isTop ? "blue" : "red"}>#{driver.rank}</Tag><Text>{driver.groupLabel}</Text></Space>
              <Text style={{ color: isTop ? "#0958d9" : "#a8071a", fontWeight: 500 }}>{formatBps(driver.scoreBps)}</Text>
            </Space>
          </button>
        );
      })}
    </Space>
  );
}
