import { Button, Card, DatePicker, Empty, Space, Tabs, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import AttributionABORvsIBORTable from "../../components/abor-vs-ibor/AttributionABORvsIBORTable";
import AttributionABORvsIBORDailyTable from "../../components/abor-vs-ibor/AttributionABORvsIBORDailyTable";
import {
  AborVsIborDailyRow,
  AborVsIborMtdRow,
} from "../../components/abor-vs-ibor/aborVsIbor";
import { useLoadingAggregator } from "../attribution/PMAHomePage";
import { api } from "../../lib/services";
import { AttributionDispersionResponse } from "../../lib/types";
import AttributionDispersionReport from "../../components/attrib-dispersion/AttributionDispersionReport";

type CapabilityKey = "abor-vs-ibor" | "attribution-dispersion";
type AborVsIborTabKey = "mtd" | "daily";

type RawDailyRow = {
  Portfolio_id: string;
  AsOfDate: string;
  MV: number;
  mtdIbor: number;
  dayIbor: number;
  BOD_NAV: number;
  EOD_NAV: number;
  EOD_TOT_CF: number;
  EOD_NAV_CF_ADJ: number;
  mtdAbor: number;
  dayAbor: number;
  "mtdAbor-Ibor_bp": number;
  "dayAbor-Ibor_bp": number;
};

type RawMtdRow = {
  Portfolio_id: string;
  Portfolio_name: string;
  mtdAbor: number;
  mtdAborCFadj: number;
  mtdIbor: number;
  BOM_NAV: number;
  mtdCF: number;
  tolerance: number;
  flag: number;
  "mtdCF/BOM_NAV(%)": number;
  "mtdAbor-mtdAborCFadj": number;
  "mtdAborCFadj-mtdIbor": number;
};

function isDailyRow(row: unknown): row is RawDailyRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "AsOfDate" in row &&
    "Portfolio_id" in row
  );
}

function isMtdRow(row: unknown): row is RawMtdRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "Portfolio_id" in row &&
    "Portfolio_name" in row &&
    !("AsOfDate" in row)
  );
}

export function DiagnosticsWorkspacePage() {
  const { runWithLoading } = useLoadingAggregator();

  const [activeCapability, setActiveCapability] =
    useState<CapabilityKey>("abor-vs-ibor");
  const [viewAsOfDate, setViewAsOfDate] = useState<string>("");

  const [aborVsIborResponse, setAborVsIborResponse] =
    useState<AttributionDispersionResponse | null>(null);
  const [attributionDispersionResponse, setAttributionDispersionResponse] =
    useState<AttributionDispersionResponse | null>(null);

  const [activeAborVsIborTab, setActiveAborVsIborTab] =
    useState<AborVsIborTabKey>("mtd");
  const [selectedPortfolioId, setSelectedPortfolioId] =
    useState<string | null>(null);

  const loadAborVsIborReport = useCallback(
    (asOfDate: string) =>
      runWithLoading(async () => {
        try {
          const response = !asOfDate
            ? await api.requestAborvsIborReportService()
            : await api.requestByDateAborvsIborReportService(asOfDate);

          setAborVsIborResponse(
            response as AttributionDispersionResponse,
          );
        } catch (error) {
          console.error("Unable to load ABOR vs. IBOR report", error);
          setAborVsIborResponse(null);
        }
      }),
    [runWithLoading],
  );

  const loadAttributionDispersionReport = useCallback(
    (asOfDate: string) =>
      runWithLoading(async () => {
        try {
          const response = !asOfDate
            ? await api.requestCorePlusAttributionDispersonReportService()
            : await api.requestByDateCorePlusAttributionDispersonReportService(
                asOfDate,
              );

          setAttributionDispersionResponse(response);
        } catch (error) {
          console.error("Unable to load Attribution Dispersion", error);
          setAttributionDispersionResponse(null);
        }
      }),
    [runWithLoading],
  );

  useEffect(() => {
    void loadAborVsIborReport("");
  }, [loadAborVsIborReport]);

  useEffect(() => {
    if (
      activeCapability === "attribution-dispersion" &&
      attributionDispersionResponse === null
    ) {
      void loadAttributionDispersionReport(viewAsOfDate);
    }
  }, [
    activeCapability,
    attributionDispersionResponse,
    loadAttributionDispersionReport,
    viewAsOfDate,
  ]);

  const { mtdRows, dailyRows } = useMemo(() => {
    const grids = aborVsIborResponse?.data?.grids ?? [];
    const mtd: AborVsIborMtdRow[] = [];
    const daily: AborVsIborDailyRow[] = [];

    grids.forEach((grid) => {
      grid.rows?.forEach((row) => {
        if (isDailyRow(row)) {
          daily.push({
            portfolioId: row.Portfolio_id,
            asOfDate: row.AsOfDate,
            mv: row.MV,
            mtdIbor: row.mtdIbor,
            dayIbor: row.dayIbor,
            bodNav: row.BOD_NAV,
            eodNav: row.EOD_NAV,
            eodTotCf: row.EOD_TOT_CF,
            eodNavCfAdj: row.EOD_NAV_CF_ADJ,
            mtdAbor: row.mtdAbor,
            dayAbor: row.dayAbor,
            mtdAborMinusIborBp: row["mtdAbor-Ibor_bp"],
            dayAborMinusIborBp: row["dayAbor-Ibor_bp"],
            gridTitle: grid.title,
          });
          return;
        }

        if (isMtdRow(row)) {
          mtd.push({
            portfolioId: row.Portfolio_id,
            portfolioName: row.Portfolio_name,
            mtdAbor: row.mtdAbor,
            mtdAborCfAdj: row.mtdAborCFadj,
            mtdIbor: row.mtdIbor,
            bomNav: row.BOM_NAV,
            mtdCf: row.mtdCF,
            mtdCfBomNavPct: row["mtdCF/BOM_NAV(%)"],
            mtdAborMinusMtdAborCfAdj:
              row["mtdAbor-mtdAborCFadj"],
            mtdAborCfAdjMinusMtdIbor:
              row["mtdAborCFadj-mtdIbor"],
            tolerance: row.tolerance,
            flag: row.flag,
            gridTitle: grid.title,
          });
        }
      });
    });

    return { mtdRows: mtd, dailyRows: daily };
  }, [aborVsIborResponse]);

  const filteredDailyRows = useMemo(() => {
    if (!selectedPortfolioId) {
      return dailyRows;
    }

    return dailyRows.filter(
      (row) => row.portfolioId === selectedPortfolioId,
    );
  }, [dailyRows, selectedPortfolioId]);

  const handleDrillDown = (portfolioId: string): void => {
    setSelectedPortfolioId(portfolioId);
    setActiveAborVsIborTab("daily");
  };

  const handleDateChange = (asOfDate: string): void => {
    setViewAsOfDate(asOfDate);
    setSelectedPortfolioId(null);

    if (activeCapability === "abor-vs-ibor") {
      void loadAborVsIborReport(asOfDate);
      return;
    }

    void loadAttributionDispersionReport(asOfDate);
  };

  return (
    <div style={{ margin: 16 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space direction="vertical" size={6}>
          <Typography.Text strong>As Of Date</Typography.Text>
          <DatePicker
            allowClear
            value={viewAsOfDate ? dayjs(viewAsOfDate) : null}
            onChange={(date) =>
              handleDateChange(date ? date.format("YYYY-MM-DD") : "")
            }
          />
        </Space>

        <Tabs
          activeKey={activeCapability}
          onChange={(key) => setActiveCapability(key as CapabilityKey)}
          destroyInactiveTabPane={false}
          items={[
            {
              key: "abor-vs-ibor",
              label: "ABOR vs. IBOR",
              children: (
                <Space
                  direction="vertical"
                  size={12}
                  style={{ width: "100%" }}
                >
                  {selectedPortfolioId && (
                    <Space>
                      <Typography.Text>
                        Daily filter: <strong>{selectedPortfolioId}</strong>
                      </Typography.Text>
                      <Button
                        size="small"
                        onClick={() => setSelectedPortfolioId(null)}
                      >
                        Clear Filter
                      </Button>
                    </Space>
                  )}

                  <Tabs
                    activeKey={activeAborVsIborTab}
                    onChange={(key) =>
                      setActiveAborVsIborTab(key as AborVsIborTabKey)
                    }
                    destroyInactiveTabPane={false}
                    items={[
                      {
                        key: "mtd",
                        label: "ABOR vs IBOR MTD",
                        children: (
                          <Card>
                            <AttributionABORvsIBORTable
                              data={mtdRows}
                              onDrillDown={handleDrillDown}
                            />
                          </Card>
                        ),
                      },
                      {
                        key: "daily",
                        label: "ABOR vs IBOR Daily",
                        children: (
                          <Card>
                            <AttributionABORvsIBORDailyTable
                              data={filteredDailyRows}
                              selectedPortfolioId={selectedPortfolioId}
                            />
                          </Card>
                        ),
                      },
                    ]}
                  />
                </Space>
              ),
            },
            {
              key: "attribution-dispersion",
              label: "Attribution Dispersion",
              children: (
                <Card>
                  {attributionDispersionResponse ? (
                    <AttributionDispersionReport
                      data={attributionDispersionResponse}
                    />
                  ) : (
                    <Empty description="No Attribution Dispersion results available">
                      <Button
                        type="primary"
                        onClick={() =>
                          void loadAttributionDispersionReport(viewAsOfDate)
                        }
                      >
                        Reload Attribution Dispersion
                      </Button>
                    </Empty>
                  )}
                </Card>
              ),
            },
          ]}
        />
      </Space>
    </div>
  );
}
