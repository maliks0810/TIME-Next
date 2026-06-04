import React, { useState } from "react";
import { Row, Col, Card, Button, Space, Form } from "antd";
import { DownloadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { KpiStrip, MonthlySummaryTable, MonthRow, RunBuyMaintainRequest, RunReportFormValues } from "./lib";
import { ReportInventory } from "./components/ReportInventory";
import { MonthSelector } from "./components/MonthSelector";
import { fetchNipponReportsService, fetchNipponReportSummaryService, fetchNipponWorksheetDetailsService, fetchNipponWorksheetListService, runBuyMaintainService } from "./lib/services";
import { generateMonthRange, mapMonthsToRows, toMonthEndDate, toMonthEndDateObj, toMonthName } from "./lib/monthMapper";
import RunReportModal from "./components/RunReportModal";
import { showErrorMessage, showSuccessMessage } from "./lib/notifications";
import { handleDownloadPackage, handleDownloadReport } from "./lib/serviceUtils";
import { REPORT_TYPE } from "./lib/constant";

import { Tabs, Table, Alert, Typography, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { normalizePreview, parseWorksheetNames, unwrapData, WorksheetListPayload, WorksheetPreviewResponse } from "./lib/helpers";


const getMonthEnd = (date: Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() - 1, 0);
};

const getPreviousMonthEnd = () => {
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  return getMonthEnd(prevMonth);
};

function toISODateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}
type ApiResponse = {
  months: {
    month_name: string;
    total_reports: number;
    is_validated: boolean;
  }[];
};

export default function NipponReportMonitorPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRunReport = () => setIsModalVisible(true);
  const handleModalCancel = () => setIsModalVisible(false);

  const handleModalRun = async (values: RunBuyMaintainRequest) => {
    const response = await runBuyMaintainService(values);
    const result = response.data || response;
    showSuccessMessage('Report generated successfully!');
    setIsModalVisible(false);
    return result;
  };
  const [monthRows, setMonthRows] = React.useState<MonthRow[]>([]);
  const [reportRows, setReportRows] = React.useState<string[]>([]);
  const [validationReportRows, setValidatedReportRows] = React.useState<string[]>([]);
  const [asOfDate, setAsOfDate] = React.useState<Date>(getPreviousMonthEnd());
  const asOfDateISO = React.useMemo(() => toISODateOnly(asOfDate), [asOfDate]);
  const monthNames = generateMonthRange("2026-01");
  const [form] = Form.useForm<RunReportFormValues>();
  const latestMonth =
    [...monthNames].reverse().find((m) => m.length > 0) ?? toMonthName(asOfDateISO);

  const [selectedMonth, setSelectedMonth] = useState<string>(latestMonth);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const totalReports = monthRows.reduce((a, b) => a + b.total_reports, 0);
  const validatedMonths = monthRows.filter((m) => m.is_validated).length;
  const validationRate = Math.round(
    (validatedMonths / monthRows.length) * 100
  );
  const [worksheetNames, setWorksheetNames] = useState<string[]>([]);
  const [activeWorksheet, setActiveWorksheet] = useState<string>("");
  const [worksheetPreview, setWorksheetPreview] = useState<WorksheetPreviewResponse | null>(null);

  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

    const clearWorksheetViewer = () => {
    setWorksheetNames([]);
    setActiveWorksheet("");
    setWorksheetPreview(null);
  };

  const handleMonthChange = async (month: string) => {
      setSelectedMonth(month);
      clearWorksheetViewer();

    try {
      setAsOfDate(toMonthEndDateObj(month));

      const resp = await fetchNipponReportsService(toMonthEndDate(month));

      const data = resp?.data ?? [];

      const reports : string[] = await data?.reports;
      const validatedReports : string[] = await data?.validationReports;

      setReportRows(reports);
      setValidatedReportRows(validatedReports);

    } catch {
      showErrorMessage("Failed to load month data");
    } finally {
    }
  };
  const onDownloadPackage = async () => {
    try{
      await handleDownloadPackage(selectedMonth,REPORT_TYPE);
    } catch {
      showErrorMessage("Failed to load package data");
    } finally {
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const resp = await fetchNipponReportSummaryService();

        const json: ApiResponse = await resp?.data;
        const rows = mapMonthsToRows(json);

        const filteredMonths = rows.filter((m) =>
          monthNames.includes(m.month_name)
        );

        setMonthRows(filteredMonths);

        //  ONLY set initial selection once
        if (!selectedMonth && filteredMonths.length > 0) {
          const latest =
            [...filteredMonths]
              .reverse()
              .find((m) => m.total_reports > 0)?.month_name;

          if (latest) {
            handleMonthChange(latest);
          }
        }

      } finally {}
    })();
  }, []);


  const onDownload = (name: string) => {
    try{
      handleDownloadReport(name,selectedMonth,REPORT_TYPE);
    } catch {
      showErrorMessage("Failed to load month data");
    } finally {
    }
  };

  /** View report -> load worksheet list (and auto-load first sheet) */
  const onViewReport = async (name: string) => {
    try {
      setSelectedFileName(name);
      setWorksheetPreview(null);
      setWorksheetNames([]);
      setActiveWorksheet("");
      setLoadingSheets(true);

      const resp = await fetchNipponWorksheetListService(toMonthEndDate(selectedMonth), name);
      const payload = unwrapData<WorksheetListPayload>(resp);
      const sheets = parseWorksheetNames(payload);

      setWorksheetNames(sheets);

      if (sheets.length > 0) {
        const first = sheets[0];
        setActiveWorksheet(first);
        await onViewSheetData(first, name);
      }
    } catch {
      showErrorMessage("Failed to get worksheet list");
    } finally {
      setLoadingSheets(false);
    }
  };

 /** Click tab -> load worksheet preview */
  const onViewSheetData = async (sheetName: string, fileNameOverride?: string) => {
    const file = fileNameOverride ?? selectedFileName;
    if (!file) return;

    try {
      setActiveWorksheet(sheetName);
      setLoadingPreview(true);

      const resp = await fetchNipponWorksheetDetailsService(toMonthEndDate(selectedMonth), file, sheetName);
      const raw = unwrapData<WorksheetPreviewResponse>(resp);

      // Ensure worksheetName is set
      const preview: WorksheetPreviewResponse = {
        worksheetName: raw.worksheetName ?? sheetName,
        rowCount: raw.rowCount ?? (raw.rows?.length ?? 0),
        columnCount: raw.columnCount ?? (raw.columns?.length ?? 0),
        columns: raw.columns ?? [],
        rows: raw.rows ?? [],
        truncated: raw.truncated ?? false,
      };

      setWorksheetPreview(normalizePreview(preview));
    } catch {
      showErrorMessage("Failed to load worksheet preview");
    } finally {
      setLoadingPreview(false);
    }
  };


  const monthOptions = monthNames.map((m) => ({
    label:
      m,
    value: m,
  }));

  return (
    <>

      <div style={{ marginBottom: 16 }}>
        <span><b>Month</b>  </span>
        <MonthSelector
          value={selectedMonth}
          options={monthOptions}
          onChange={handleMonthChange}
        />
      </div>
      <KpiStrip
        items={[
          { title: "Total Reports", value: totalReports },
          { title: "Validated Months", value: validatedMonths, highlight: "green" },
          { title: "Validation Rate", value: validationRate, suffix: "%" },
        ]}
      />

      <Card title="Monthly Summary"  style={{ marginTop: 16 }}>
        <MonthlySummaryTable
          data={monthRows}
          selectedMonth={selectedMonth}
          onSelectMonth={handleMonthChange}
        />
      </Card>
      <Card  title="Selected Report Inventory" extra={<Space><Button icon={<PlayCircleOutlined />} onClick={handleRunReport} type="primary">Run Report</Button>
      <Button icon={<DownloadOutlined/>} onClick={onDownloadPackage} type="primary">Download package</Button></Space>}>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <ReportInventory
            title="All Reports"
            reports={reportRows}
            onDownload={onDownload}
            onViewReport={onViewReport}
          />
        </Col>

        <Col span={12}>
          <ReportInventory
            title="Validation Reports"
            reports={validationReportRows}
            onDownload={onDownload}
            onViewReport={onViewReport}
            highlight
          />
        </Col>
      </Row>
      </Card>

  {/* Inline Worksheet Viewer */}
        <div style={{ marginTop: 16 }}>
          <Card
            size="small"
            title="Worksheet Viewer"
            extra={
              selectedFileName ? (
                <Typography.Text type="secondary">
                  Report: <strong>{selectedFileName}</strong>
                </Typography.Text>
              ) : null
            }
          >
            {!selectedFileName ? (
              <Alert type="info" showIcon message="Click View on a report to load its worksheets." />
            ) : loadingSheets ? (
              <Spin />
            ) : worksheetNames.length === 0 ? (
              <Alert type="warning" showIcon message="No worksheets found for this report." />
            ) : (
              <>
                <Tabs
                  items={worksheetNames.map((s) => ({ key: s, label: s }))}
                  activeKey={activeWorksheet || worksheetNames[0]}
                  onChange={(k) => void onViewSheetData(k)}
                />

                {loadingPreview ? (
                  <Spin />
                ) : worksheetPreview ? (
                  <>
                    {worksheetPreview.truncated ? (
                      <Alert
                        style={{ marginBottom: 12 }}
                        type="warning"
                        showIcon
                        message="Preview truncated"
                        description="Only the first N rows were loaded. Increase limit or add paging if needed."
                      />
                    ) : null}

                    <Table<Record<string, unknown>>
                      size="small"
                      columns={worksheetPreview.columns as ColumnsType<Record<string, unknown>>}
                      dataSource={worksheetPreview.rows.map((r, idx) => ({ key: idx, ...r }))}
                      pagination={{ pageSize: 25 }}
                      scroll={{ x: "max-content" }}
                    />
                  </>
                ) : (
                  <Alert type="info" showIcon message="Select a worksheet tab to load preview." />
                )}
              </>
            )}
          </Card>
        </div>


        <RunReportModal   form={form}
              visible={isModalVisible}
              onCancel={handleModalCancel}
              onRun={handleModalRun}
          />
    </>
  );
}