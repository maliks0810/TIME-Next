/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ExcelJS from "exceljs";
import { Button } from "antd";
import { saveAs } from "file-saver";
import { formatDate } from "../../../lib/helpers";
import { Coverage } from "../../../lib/types";
import ExcelIcon from "../../analyst-performance/lib/icons";

interface CoverageExportProps {
  data: Coverage[];
  runDate?: string;
}

type ExportRow = {
  analystName: string;
  sectorName: string;
  industryName: string;
  companyName: string;
  ticker: string;
  isin: string;
  benchmarkWeight: number | null;
  onBuyList: string;
  marketCap: string;
  mtd: number | null;
  qtd: number | null;
  ytd: number | null;
  coverageDate: string;
};

export const CoverageExport: React.FC<CoverageExportProps> = ({ data, runDate }) => {
  const [isExcelPreparing, setIsExcelPreparing] = React.useState(false);

  const safeNumber = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const safeText = (v: any): string => String(v ?? "").trim();

  const toMMDDYYYY = (value: any): string => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return safeText(value);
    return formatDate(d.toString());
  };

  const mergeVerticalRange = (
    sheet: ExcelJS.Worksheet,
    colLetter: string,
    startRow: number,
    endRow: number
  ) => {
    if (endRow <= startRow) return;
    sheet.mergeCells(`${colLetter}${startRow}:${colLetter}${endRow}`);
    sheet.getCell(`${colLetter}${endRow}`).alignment = { vertical: "middle", horizontal: "left" };
  };

  const applyThinBottomBorderRow = (sheet: ExcelJS.Worksheet, rowIndex: number, colCount: number) => {
    for (let col = 1; col <= colCount; col++) {
      sheet.getCell(rowIndex, col).border = { bottom: { style: "thin" } };
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExcelPreparing(true);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "TCW Risk and Research";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Coverage List", { views: [{ showGridLines: false }] });

      sheet.mergeCells("A1:E1");
      sheet.getCell("A1").value = {
        richText: [{ font: { size: 12, name: "ScalaSansLF-Bold" }, text: "US Equity Research Department - Analyst Coverage List" }],
      };

      const computedRunDate = runDate ?? formatDate(new Date().toDateString());

      sheet.mergeCells("A2:E2");
      sheet.getCell("A2").value = {
        richText: [{ font: { size: 9, name: "ScalaSansLF-Regular" }, text: `As of ${computedRunDate}` }],
      };

      sheet.mergeCells("F3:M3");
      sheet.getCell("F3").value = {
        richText: [{ font: { size: 9, name: "Times New Roman" }, text: "Benchmark Weight and performance figures are expressed as percentages." }],
      };

      sheet.getCell("A3").border = { bottom: { style: "thin" } };

      const headers = [
        "Analyst",
        "Sector",
        "Industry",
        "Company Name",
        "Ticker",
        "ISIN",
        "Benchmark Weight %",
        "On Buy List",
        "Market Cap ($MM)",
        "MTD %",
        "QTD %",
        "YTD %",
        "Coverage Date",
      ];

      const headerRowIndex = 4;
      const headerRow = sheet.getRow(headerRowIndex);
      headerRow.height = 45;

      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = {
          richText: [
            {
              font: { size: 10, color: { argb: "FFFFFFFF" }, name: "Times New Roman", bold: true },
              text: header,
            },
          ],
        };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "22425F" } };
        cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
      });

      sheet.columns = [
        { key: "analystName", width: 16 },
        { key: "sectorName", width: 20 },
        { key: "industryName", width: 22 },
        { key: "companyName", width: 30 },
        { key: "ticker", width: 10 },
        { key: "isin", width: 14 },
        { key: "benchmarkWeight", width: 12 },
        { key: "onBuyList", width: 10 },
        { key: "marketCap", width: 12 },
        { key: "mtd", width: 8 },
        { key: "qtd", width: 8 },
        { key: "ytd", width: 8 },
        { key: "coverageDate", width: 12 },
      ];

      const normalized: ExportRow[] = [...data]
        .map((item: any) => ({
          analystName: safeText(item.analystName),
          sectorName: safeText(item.sectorName),
          industryName: safeText(item.industryName),
          companyName: safeText(item.companyName),
          ticker: safeText(item.ticker).toUpperCase(),
          isin: safeText(item.isin).toUpperCase(),
          benchmarkWeight: safeNumber(item.benchmarkWeight),
          onBuyList: item.onBuyList ? "Yes" : "",
          marketCap:
            item.marketCap != null && item.marketCap !== ""
              ? Number(item.marketCap).toLocaleString(undefined, { maximumFractionDigits: 0 })
              : "",
          mtd: safeNumber(item.mtd),
          qtd: safeNumber(item.qtd),
          ytd: safeNumber(item.ytd),
          coverageDate: toMMDDYYYY(item.coverageDate),
        }))
        .sort((a, b) => {
          const keys: Array<keyof ExportRow> = ["analystName", "sectorName", "industryName", "companyName", "ticker"];
          for (const k of keys) {
            const av = String(a[k] ?? "");
            const bv = String(b[k] ?? "");
            if (av < bv) return -1;
            if (av > bv) return 1;
          }
          return 0;
        });

      sheet.addRows(normalized);

      const startRow = 5;
      const rowCount = normalized.length;
      const colCount = headers.length;

      for (let i = 0; i < rowCount; i++) {
        const r = startRow + i;

        sheet.getCell(r, 7).numFmt = "0.00%";
        sheet.getCell(r, 10).numFmt = "0.00%";
        sheet.getCell(r, 11).numFmt = "0.00%";
        sheet.getCell(r, 12).numFmt = "0.00%";

        [6, 7, 9, 10, 11, 12, 13].forEach((c) => {
          sheet.getCell(r, c).alignment = { horizontal: "right", vertical: "middle" };
        });

        if (i % 2 === 0) {
          for (let c = 4; c <= colCount; c++) {
            sheet.getCell(r, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DEDEDE" } };
          }
        }
      }

      let analystStart = startRow;
      let sectorStart = startRow;
      let industryStart = startRow;

      const flushIndustry = (endRow: number) => {
        mergeVerticalRange(sheet, "C", industryStart, endRow);
        industryStart = endRow + 1;
      };

      const flushSector = (endRow: number) => {
        flushIndustry(endRow);
        mergeVerticalRange(sheet, "B", sectorStart, endRow);
        sectorStart = endRow + 1;
      };

      const flushAnalyst = (endRow: number) => {
        flushSector(endRow);
        mergeVerticalRange(sheet, "A", analystStart, endRow);
        analystStart = endRow + 1;
      };

      for (let i = 0; i < rowCount; i++) {
        const currentRow = startRow + i;
        const isLast = i === rowCount - 1;
        const cur = normalized[i];
        const next = !isLast ? normalized[i + 1] : null;

        const analystChanged = isLast || (next && cur.analystName !== next.analystName);
        const sectorChanged = isLast || (next && (cur.analystName !== next.analystName || cur.sectorName !== next.sectorName));
        const industryChanged =
          isLast ||
          (next &&
            (cur.analystName !== next.analystName ||
              cur.sectorName !== next.sectorName ||
              cur.industryName !== next.industryName));

        if (industryChanged) flushIndustry(currentRow);
        if (sectorChanged) flushSector(currentRow);
        if (analystChanged) {
          flushAnalyst(currentRow);
          applyThinBottomBorderRow(sheet, currentRow, colCount);
        }
      }

      const bodyFont = { name: "Times New Roman", size: 8 };
      for (let row = headerRowIndex; row <= sheet.rowCount; row++) {
        const rr = sheet.getRow(row);
        for (let col = 1; col <= colCount; col++) rr.getCell(col).font = bodyFont;
      }

      const today = formatDate(new Date().toDateString());
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Analyst Coverage List ${today}.xlsx`);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.warn("An error has occurred. Please try again.", e);
    } finally {
      setIsExcelPreparing(false);
    }
  };

  return (
    <div>
      <Button icon={<ExcelIcon />} loading={isExcelPreparing} onClick={exportToExcel} />
    </div>
  );
};