import { JSX, useMemo, useRef } from "react";
import { Button, Space, Typography } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import "./AttributionPrintView.css";

const { Title } = Typography;

type RowType = Record<string, unknown>;

interface Props {
  rows: RowType[];
  period: string;
  benchmarkName?: string;
  pageTitle?: string;
  valueDate?: string;
  selectedSector?: string | null;
  onSectorSelect?: (sector: string) => void;
  showToolbar?: boolean;
}

type TableRow = {
  key: number;
  sector: string;
  pfWeight: number;
  bmWeight: number;
  pfReturn: number;
  bmReturn: number;
  diff: number;
  alloc: number;
  select: number;
  total: number;
  isTotalRow: boolean;
};

type ChartLabelParam = {
  value?: number | string | null;
};

const DATE_FORMAT = "MM/DD/YYYY";
const ZERO_TOLERANCE = 0.0000005;

const toNum = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const toSector = (value: unknown): string => String(value ?? "").trim();

const isZero = (value: number): boolean => Math.abs(value) < ZERO_TOLERANCE;

const formatPct = (value: number): string => {
  if (isZero(value)) {
    return "-";
  }

  return (value * 100).toFixed(2);
};

const formatChartLabel = (value: unknown): string => {
  const numericValue = toNum(value);

  if (isZero(numericValue)) {
    return "0.00";
  }

  return (numericValue * 100).toFixed(2);
};

const isNegative = (value: number): boolean => value < -ZERO_TOLERANCE;

const getNumberClassName = (value: number): string => {
  if (isZero(value)) {
    return "number-cell is-zero";
  }

  if (isNegative(value)) {
    return "number-cell is-negative";
  }

  return "number-cell";
};

const isExistingTotalSector = (sector: string): boolean => {
  const normalized = sector.toLowerCase();
  return (
    normalized === "total" ||
    normalized === "total equity" ||
    normalized === "total equities"
  );
};

const isNonDataSector = (sector: string): boolean => {
  const normalized = sector.toLowerCase();
  return (
    normalized.startsWith("benchmark") ||
    normalized === "" ||
    normalized === "cash" ||
    normalized === "[cash]"
  );
};

const wrapSectorLabel = (value: string): string => {
  const overrides: Record<string, string> = {
    "Communication Services": "Communicati\non Services",
    "Consumer Discretionary": "Consumer\nDiscretionary",
    "Consumer Staples": "Consumer\nStaples",
    "Information Technology": "Information\nTechnology",
  };

  return overrides[value] ?? value;
};

const buildTableRow = (row: RowType, index: number): TableRow => {
  const sector = toSector(row["SecurityGroup"]);
  const pfReturn = toNum(row["PFTotalRet"]);
  const bmReturn = toNum(row["BMTotalRet"]);
  const alloc = toNum(row["AllocEffect"]);
  const select = toNum(row["SelectEffect"]);
  const inter = toNum(row["InterEffect"]);

  return {
    key: index,
    sector,
    pfWeight: toNum(row["PFAvgWeight"]),
    bmWeight: toNum(row["BMAvgWeight"]),
    pfReturn,
    bmReturn,
    diff: pfReturn - bmReturn,
    alloc,
    select,
    total: alloc + select + inter,
    isTotalRow: isExistingTotalSector(sector),
  };
};

const buildComputedTotalRow = (rows: TableRow[]): TableRow => {
  const alloc = rows.reduce((sum, row) => sum + row.alloc, 0);
  const select = rows.reduce((sum, row) => sum + row.select, 0);
  const total = rows.reduce((sum, row) => sum + row.total, 0);

  return {
    key: -1,
    sector: "Total Equity",
    pfWeight: 0,
    bmWeight: 0,
    pfReturn: 0,
    bmReturn: 0,
    diff: 0,
    alloc,
    select,
    total,
    isTotalRow: true,
  };
};

export default function AttributionPrintView({
  rows,
  period,
  benchmarkName,
  pageTitle,
  valueDate,
  selectedSector,
  onSectorSelect,
  showToolbar = true,
}: Props) {
  const { detailRows, totalRow } = useMemo(() => {
    const normalizedRows = rows.map(buildTableRow);

    const existingTotalRow = normalizedRows.find((row) => row.isTotalRow);

    const details = normalizedRows.filter((row) => {
      if (row.isTotalRow) {
        return false;
      }

      return !isNonDataSector(row.sector);
    });

    return {
      detailRows: details,
      totalRow: existingTotalRow ?? buildComputedTotalRow(details),
    };
  }, [rows]);

  const asOfLabel = valueDate && dayjs(valueDate).isValid()
    ? dayjs(valueDate).format(DATE_FORMAT)
    : valueDate ?? "";

  const chartRows = useMemo(() => {
    return detailRows.filter((row) => !isZero(row.alloc) || !isZero(row.select));
  }, [detailRows]);

  const chartOption = useMemo(
    () => ({
      animation: false,
      tooltip: {
        trigger: "axis",
        valueFormatter: (value: number | string) =>
          `${formatChartLabel(value)}%`,
      },
      grid: {
        left: 55,
        right: 35,
        top: 36,
        bottom: 86,
      },
      legend: {
        data: ["Asset Allocation", "Security Selection"],
        bottom: 0,
        itemWidth: 18,
        itemHeight: 10,
        textStyle: {
          fontSize: 10,
          color: "#000",
        },
      },
      xAxis: {
        type: "category",
        data: chartRows.map((row) => row.sector),
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: "#8a8a8a",
          },
        },
        axisLabel: {
          interval: 0,
          rotate: 0,
          fontSize: 10,
          color: "#000",
          formatter: (value: string) => wrapSectorLabel(value),
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `${value.toFixed(2)}%`,
          fontSize: 10,
          color: "#555",
        },
        splitLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
      },
      series: [
        {
          name: "Asset Allocation",
          type: "bar",
          data: chartRows.map((row) => row.alloc),
          barWidth: 30,
          itemStyle: {
            color: "#0b79b7",
          },
          label: {
            show: true,
            position: "top",
            fontSize: 10,
            color: "#000",
            formatter: (param: ChartLabelParam) =>
              formatChartLabel(param.value),
          },
        },
        {
          name: "Security Selection",
          type: "bar",
          data: chartRows.map((row) => row.select),
          barWidth: 30,
          itemStyle: {
            color: "#6d6e71",
          },
          label: {
            show: true,
            position: "top",
            fontSize: 10,
            color: "#000",
            formatter: (param: ChartLabelParam) =>
              formatChartLabel(param.value),
          },
        },
      ],
    }),
    [chartRows]
  );
const chartRef = useRef<ReactECharts>(null);
const getChartImage = (): string | null => {
  try {
    const echartsInstance = chartRef.current?.getEchartsInstance();

    if (!echartsInstance) return null;

    return echartsInstance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
  } catch {
    return null;
  }
};

const handleExportPdf = (): void => {
  const printElement = document.getElementById("print-root");
  if (!printElement) return;

  const chartImage = getChartImage(); //  capture chart as image

  const cloned = printElement.cloneNode(true) as HTMLElement;

  //  replace chart with image
  if (chartImage) {
    const chartContainer = cloned.querySelector(".chart-wrap");

    if (chartContainer) {
      chartContainer.innerHTML = `
        <img
          src="${chartImage}"
          style="width:100%; height:auto;"
        />
      `;
    }
  }

  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) return;

  const styles: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = (sheet as CSSStyleSheet).cssRules;
      if (!rules) continue;

      for (const rule of Array.from(rules)) {
        styles.push(rule.cssText);
      }
    } catch {
      // ignore CORS styles
    }
  }

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Attribution Report</title>
        <style>
          ${styles.join("\n")}
          body {
            margin: 0;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${cloned.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };
};
  const renderNumberCell = (value: number): JSX.Element => (
    <td className={getNumberClassName(value)}>{formatPct(value)}</td>
  );

  return (
    <>
      {showToolbar ? (
        <div className="print-toolbar no-print">
          <Space size={6}>
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={handleExportPdf}
            >
              Export PDF
            </Button>
          </Space>
        </div>
      ) : null}

      <div className="report-page">
        <div className="report-header">
          <div className="report-logo">TCW</div>

          <div className="report-divider" />

          <div className="report-title-block">
            <div className="report-title">
              {pageTitle ?? "Attribution Analysis"}
            </div>

            {benchmarkName ? (
              <div className="report-meta">Benchmark: {benchmarkName}</div>
            ) : null}

            {asOfLabel ? (
              <div className="report-meta">As of {asOfLabel}</div>
            ) : null}
          </div>
        </div>

        <section className="report-section">
          <Title level={5} className="section-title">
            Attribution Analysis
          </Title>

          <div className="section-subtitle">Sector Returns & Attribution</div>

          <div className="section-period">{period}</div>

          <table className="report-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>
                  Avg % of Total
                  <br />
                  Equities
                </th>
                <th>
                  Benchmark Avg
                  <br />
                  Weight (%)
                </th>
                <th>
                  TCW
                  <br />
                  Return (%)
                </th>
                <th>
                  Benchmark
                  <br />
                  Return (%)
                </th>
                <th>
                  Difference
                  <br />
                  (%)
                </th>
                <th>
                  Asset
                  <br />
                  Alloc. Effect
                </th>
                <th>
                  Sec. Selection
                  <br />
                  Effect
                </th>
                <th>
                  Total
                  <br />
                  Effect
                </th>
              </tr>
            </thead>

            <tbody>
              {detailRows.map((row) => {
                const isSelected = selectedSector === row.sector;

                return (
                  <tr
                    key={row.key}
                    className={isSelected ? "selected-sector-row" : undefined}
                    onClick={() => onSectorSelect?.(row.sector)}
                  >
                    <td className="text-cell">{row.sector}</td>
                    {renderNumberCell(row.pfWeight)}
                    {renderNumberCell(row.bmWeight)}
                    {renderNumberCell(row.pfReturn)}
                    {renderNumberCell(row.bmReturn)}
                    {renderNumberCell(row.diff)}
                    {renderNumberCell(row.alloc)}
                    {renderNumberCell(row.select)}
                    {renderNumberCell(row.total)}
                  </tr>
                );
              })}

              <tr className="total-row">
                <td className="text-cell">{totalRow.sector}</td>
                <td />
                <td />
                <td />
                <td />
                <td />
                {renderNumberCell(totalRow.alloc)}
                {renderNumberCell(totalRow.select)}
                {renderNumberCell(totalRow.total)}
              </tr>

              {benchmarkName ? (
                <tr className="benchmark-row">
                  <td colSpan={9}>Benchmark: {benchmarkName}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="chart-section">
          <div className="chart-title">Sector Attribution</div>

          <div className="chart-wrap">
            <ReactECharts
              ref={chartRef}
              option={chartOption}
              style={{ height: 310, width: "100%" }}
            />
          </div>
        </section>

        <div className="report-footer">
          <span>
            *Represents performance for the Fund for the entire period. Account
            performance may differ from Fund performance depending on activity
            in your account.
          </span>

          <span>Source: TCW/Aladdin</span>
        </div>
      </div>
    </>
  );
}