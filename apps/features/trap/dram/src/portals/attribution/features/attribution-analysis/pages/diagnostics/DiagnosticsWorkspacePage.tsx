import { Button, Card, DatePicker, Space, Tabs, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import AttributionABORvsIBORTable from "../../components/abor-vs-ibor/AttributionABORvsIBORTable";
import AttributionABORvsIBORDailyTable from "../../components/abor-vs-ibor/AttributionABORvsIBORDailyTable";

import { useLoadingAggregator } from "../attribution/PMAHomePage";
import { api } from "../../lib/services";

import { AttributionDispersionResponse } from "../../lib/types";
import { AborVsIborDailyRow, AborVsIborMtdRow } from "../../components/abor-vs-ibor/aborVsIbor";


//  Strong type guard
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

function isDailyRow(row: unknown): row is RawDailyRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "AsOfDate" in row &&
    "Portfolio_id" in row
  );
}

export function DiagnosticsWorkspacePage() {
  const { runWithLoading } = useLoadingAggregator();

  const [viewAsOfDate, setViewAsOfDate] = useState<string>("");
  const [aborVsIborResponse, setAborVsIborResponse] =
    useState<AttributionDispersionResponse | null>(null);

  const [activeTabKey, setActiveTabKey] = useState<string>("mtd");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);

  //  API load
  useEffect(() => {
    let cancelled = false;

    runWithLoading(async () => {
      try {
        const resp = !viewAsOfDate
          ? await api.requestAborvsIborReportService()
          : await api.requestByDateAborvsIborReportService(viewAsOfDate);

        if (!cancelled) {
          setAborVsIborResponse(resp as AttributionDispersionResponse);
        }
      } catch {
        if (!cancelled) {
          setAborVsIborResponse(null);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [runWithLoading, viewAsOfDate]);

  // SPLIT + TYPED (NO ANY)
  const { mtdRows, dailyRows } = useMemo(() => {
    const grids = aborVsIborResponse?.data?.grids ?? [];

    const mtd: AborVsIborMtdRow[] = [];
    const daily: AborVsIborDailyRow[] = [];

    grids.forEach((grid) => {
      grid.rows?.forEach((row) => {
        if (isDailyRow(row)) {
          // DAILY
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
        } else {
          //  MTD
          const r = row as {
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

          mtd.push({
            portfolioId: r.Portfolio_id,
            portfolioName: r.Portfolio_name,
            mtdAbor: r.mtdAbor,
            mtdAborCfAdj: r.mtdAborCFadj,
            mtdIbor: r.mtdIbor,
            bomNav: r.BOM_NAV,
            mtdCf: r.mtdCF,
            mtdCfBomNavPct: r["mtdCF/BOM_NAV(%)"],
            mtdAborMinusMtdAborCfAdj: r["mtdAbor-mtdAborCFadj"],
            mtdAborCfAdjMinusMtdIbor: r["mtdAborCFadj-mtdIbor"],
            tolerance: r.tolerance,
            flag: r.flag,
            gridTitle: grid.title,
          });
        }
      });
    });

    return { mtdRows: mtd, dailyRows: daily };
  }, [aborVsIborResponse]);

  //  FILTER DAILY
  const filteredDailyRows = useMemo(() => {
    if (!selectedPortfolioId) return dailyRows;

    return dailyRows.filter(
      (row) => row.portfolioId === selectedPortfolioId
    );
  }, [dailyRows, selectedPortfolioId]);

  // DRILLDOWN
  const handleDrillDown = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
    setActiveTabKey("daily");
  };

  const clearDailyFilter = () => {
    setSelectedPortfolioId(null);
  };

  return (
  <div style={{margin:'16px' }}>
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Paragraph strong>As Of Date</Typography.Paragraph>

      <DatePicker
        value={viewAsOfDate ? dayjs(viewAsOfDate) : null}
        onChange={(d) => {
          setViewAsOfDate(d ? d.format("YYYY-MM-DD") : "");
          setSelectedPortfolioId(null);
        }}
      />

      {selectedPortfolioId && (
        <Space>
          <Typography.Text>
            Daily filter: <strong>{selectedPortfolioId}</strong>
          </Typography.Text>
          <Button size="small" onClick={clearDailyFilter}>
            Clear Filter
          </Button>
        </Space>
      )}

      <Tabs
        destroyInactiveTabPane={false}
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
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
    </div>
  );
}