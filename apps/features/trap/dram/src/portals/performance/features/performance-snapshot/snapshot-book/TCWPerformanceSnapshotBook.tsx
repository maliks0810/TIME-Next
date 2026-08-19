import { FilePdfOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Segmented, Space, Tooltip, Typography, message } from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import SnapshotBookExportDrawer from "./SnapshotBookExportDrawer";
import SnapshotBookNavigator from "./SnapshotBookNavigator";
import { REPORT_ORDER, SNAPSHOT_REPORTS, getReport } from "./reportManifest";
import { exportSnapshotBookPdf } from "./snapshotBookApi";
import type { SnapshotBookMode, SnapshotBookPdfRequest, SnapshotReportId, SnapshotReportStatus } from "./types";
import "./snapshotBook.css";

const { Title, Text } = Typography;

interface Props {
  asOfDate?: string;
}

export default function TCWPerformanceSnapshotBook({ asOfDate = dayjs().format("YYYY-MM-DD") }: Props): React.ReactElement {
  const [mode, setMode] = useState<SnapshotBookMode>("book");
  const [activeReport, setActiveReport] = useState<SnapshotReportId>("daily-flash");
  const [selectedReports, setSelectedReports] = useState<SnapshotReportId[]>([...REPORT_ORDER]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [navCollapsed, setNavCollapsed] = useState(false);

  // Replace with aggregated child status callbacks if the existing views expose them.
  const statuses = useMemo<Partial<Record<SnapshotReportId, SnapshotReportStatus>>>(() => ({}), []);
  const visibleReports = mode === "book" ? SNAPSHOT_REPORTS : [getReport(activeReport)];

  async function exportAll(request: SnapshotBookPdfRequest): Promise<void> {
    setExporting(true);
    try {
      await exportSnapshotBookPdf(request);
      message.success("Snapshot Book PDF export completed");
      setDrawerOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Combined PDF export failed");
    } finally {
      setExporting(false);
    }
  }

  function selectReport(id: SnapshotReportId): void {
    setActiveReport(id);
    if (mode === "book") document.getElementById(`snapshot-report-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="snapshot-book-shell">
      <header className="snapshot-book-header">
        <div>
          <Title level={2}>TCW Daily Performance Snapshot Book</Title>
          <Text>As of {dayjs(asOfDate).format("MMMM D, YYYY")}</Text>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => setRefreshKey((value) => value + 1)}>Refresh All</Button>
          <Button type="primary" icon={<FilePdfOutlined />} onClick={() => setDrawerOpen(true)}>Export Snapshot Book PDF</Button>
        </Space>
      </header>

      <div className={`snapshot-book-layout${navCollapsed ? " snapshot-book-layout--nav-collapsed" : ""}`}>
        <aside className="snapshot-book-nav" aria-hidden={navCollapsed}>
          <div className="snapshot-book-nav-inner">
            <SnapshotBookNavigator
              activeReport={activeReport}
              selectedReports={selectedReports}
              statuses={statuses}
              onSelect={selectReport}
              onSelectionChange={setSelectedReports}
            />
          </div>
        </aside>
        <main className="snapshot-book-main">
          <div className="snapshot-book-toolbar">
            <Tooltip title={navCollapsed ? "Show navigation" : "Hide navigation"}>
              <Button
                type="text"
                className="snapshot-book-nav-toggle"
                aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
                aria-expanded={!navCollapsed}
                icon={navCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setNavCollapsed((value) => !value)}
              />
            </Tooltip>
            <Segmented<SnapshotBookMode>
              value={mode}
              options={[{ label: "Report Book", value: "book" }, { label: "Focus View", value: "focus" }]}
              onChange={setMode}
            />
          </div>
          <div className="snapshot-book-reports" key={refreshKey}>
            {visibleReports.map((report) => {
              const ReportComponent = report.component;
              return (
                <section id={`snapshot-report-${report.id}`} className="snapshot-book-report" key={report.id}>
                  <div className="snapshot-book-report-bar">
                    <span className="snapshot-book-report-number">{report.sequence}</span>
                    <Text strong>{report.title}</Text>
                    {!report.allowStandaloneExport && <Text type="secondary">Included in book export only</Text>}
                  </div>
                  <ReportComponent {...report.componentProps} />
                </section>
              );
            })}
          </div>
        </main>
      </div>

      <SnapshotBookExportDrawer
        open={drawerOpen}
        asOfDate={asOfDate}
        selectedReports={selectedReports}
        exporting={exporting}
        onClose={() => setDrawerOpen(false)}
        onExport={exportAll}
      />
    </div>
  );
}
