/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ExcelJS from 'exceljs';
import { Button } from 'antd';
import { saveAs } from 'file-saver';
import { formatDate, formatAnalystPerformanceLabel } from '../../../lib/helpers';
import ExcelIcon from '../../analyst-performance/lib/icons';

type ReturnPoint = {
  date: string;
  analystPerformance: number | null;
  benchmarkPerformance: number | null;
  excessReturn: number | null;
};

type PerformanceResult = {
  name: string;
  returns?: ReturnPoint[];
};

interface PerformanceExportProps {
  results: PerformanceResult[];
  runDate?: string;
  selectedAnalystNames?: string[];
}

type ExportRow = {
  date: string;
  analystPerformance: number | null;
  benchmarkPerformance: number | null;
  excessReturn: number | null;
};

export const PerformanceExport: React.FC<PerformanceExportProps> = ({ results, runDate, selectedAnalystNames = [], }) => {
  const [isExcelPreparing, setIsExcelPreparing] = React.useState(false);

  const safeNumber = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const safeText = (v: any): string => String(v ?? '').trim();

  const toMMDDYYYY = (value: any): string => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return safeText(value);
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  /**
   * Excel worksheet naming rules:
   * - Max length 31
   * - Cannot contain: [ ] : * ? / \
   * - Cannot begin or end with apostrophe
   * - Must be unique within workbook
   */
  const makeSafeSheetName = (
    rawName: string,
    usedNames: Set<string>
  ): string => {
    const base = safeText(rawName)
      .replace(/[\[\]\:\*\?\/\\]/g, '') // strip invalid chars
      .replace(/^'+|'+$/g, '') // trim apostrophes
      .trim()
      .slice(0, 31) || 'Sheet';

    let candidate = base;
    let i = 1;

    // Ensure uniqueness (append " (n)" while respecting 31 char max)
    while (usedNames.has(candidate)) {
      const suffix = ` (${i++})`;
      const maxBaseLen = 31 - suffix.length;
      candidate = `${base.slice(0, Math.max(0, maxBaseLen))}${suffix}`;
    }

    usedNames.add(candidate);
    return candidate;
  };

  const buildAnalystRows = (r: PerformanceResult): ExportRow[] => {
    const points = r?.returns ?? [];
    return points
      .map((p: ReturnPoint) => ({
        date: toMMDDYYYY(p?.date),
        analystPerformance: safeNumber(p?.analystPerformance),
        benchmarkPerformance: safeNumber(p?.benchmarkPerformance),
        excessReturn: safeNumber(p?.excessReturn),
      }))
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  };

  const applySheetLayoutAndStyles = (sheet: ExcelJS.Worksheet, computedRunDate: string) => {
    // ---- Header block (match your current style) ----
    sheet.mergeCells('A1:D1');
    sheet.getCell('A1').value = {
      richText: [
        {
          font: { size: 12, name: 'ScalaSansLF-Bold' },
          text: 'US Equity Research Department - Performance Returns',
        },
      ],
    };

    sheet.mergeCells('A2:D2');
    sheet.getCell('A2').value = {
      richText: [
        {
          font: { size: 9, name: 'ScalaSansLF-Regular' },
          text: `As of ${computedRunDate}`,
        },
      ],
    };

    sheet.mergeCells('A3:D3');
    sheet.getCell('A3').value = {
      richText: [
        {
          font: { size: 9, name: 'Times New Roman' },
          text: 'Performance figures are expressed as percentages.',
        },
      ],
    };

    // Divider line (row 3)
    for (let c = 1; c <= 4; c++) {
      sheet.getCell(3, c).border = { bottom: { style: 'thin' } };
    }

    // ---- Column headers ----
    const headers = [
      'Date',
      'Analyst Performance (Cum) %',
      'Benchmark Performance (Cum) %',
      'Excess Return %',
    ];

    const headerRowIndex = 4;
    const headerRow = sheet.getRow(headerRowIndex);
    headerRow.height = 45;

    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = {
        richText: [
          {
            font: {
              size: 10,
              color: { argb: 'FFFFFFFF' },
              name: 'Times New Roman',
              bold: true,
            },
            text: header,
          },
        ],
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '22425F' },
      };

      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: 'center',
      };
    });

    // ---- Column widths + keys ----
    sheet.columns = [
      { key: 'date', width: 14 }, // A
      { key: 'analystPerformance', width: 30 }, // B
      { key: 'benchmarkPerformance', width: 30 }, // C
      { key: 'excessReturn', width: 16 }, // D
    ];

    sheet.views = [{ showGridLines: false }];

    return { headers, headerRowIndex };
  };

  const populateRowsAndFormat = (
    sheet: ExcelJS.Worksheet,
    rows: ExportRow[],
    headerRowIndex: number,
    colCount: number
  ) => {
    sheet.addRows(rows);

    // Data begins right after header row
    const startRow = headerRowIndex + 1;

    for (let i = 0; i < rows.length; i++) {
      const r = startRow + i;

      // percent formats for B, C, D
      sheet.getCell(r, 2).numFmt = '0.00%';
      sheet.getCell(r, 3).numFmt = '0.00%';
      sheet.getCell(r, 4).numFmt = '0.00%';

      // Align numeric columns right
      [2, 3, 4].forEach((c) => {
        sheet.getCell(r, c).alignment = { horizontal: 'right', vertical: 'middle' };
      });

      // Date align right
      sheet.getCell(r, 1).alignment = { horizontal: 'right', vertical: 'middle' };

      // Alternating row shading — shade B..D (leave Date unshaded to mimic your "leave col A" approach)
      if (i % 2 === 0) {
        for (let c = 2; c <= colCount; c++) {
          sheet.getCell(r, c).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DEDEDE' },
          };
        }
      }
    }

    // Apply consistent body font (match your current)
    const bodyFont = { name: 'Times New Roman', size: 8 };
    for (let row = headerRowIndex; row <= sheet.rowCount; row++) {
      const rr = sheet.getRow(row);
      for (let col = 1; col <= colCount; col++) {
        rr.getCell(col).font = bodyFont;
      }
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExcelPreparing(true);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'TCW Risk and Research';
      workbook.created = new Date();

      const computedRunDate = runDate ?? formatDate(new Date().toDateString());

      // ---- Group results by analyst name (label formatted) ----
      
    const selectedSet = new Set(
      (selectedAnalystNames ?? [])
        .map((n) => formatAnalystPerformanceLabel(safeText(n)))
        .filter(Boolean)
    );

    // Decide behavior when none selected:
    // Option 1 (recommended): export ALL if none selected
    const shouldFilter = selectedSet.size > 0;

    // ---- Group results by analyst name (label formatted) ----
    const grouped = new Map<string, ExportRow[]>();

    (results ?? [])
      .filter((r: PerformanceResult) => {
        const analystLabel = formatAnalystPerformanceLabel(safeText(r?.name));
        return shouldFilter ? selectedSet.has(analystLabel) : true;
      })
      .forEach((r: PerformanceResult) => {
        const analystLabel = formatAnalystPerformanceLabel(safeText(r?.name));
        const rows = buildAnalystRows(r);

        const existing = grouped.get(analystLabel) ?? [];
        grouped.set(
          analystLabel,
          existing.concat(rows).sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
        );
      });

      // If no data, still produce a single sheet for consistency
      const usedNames = new Set<string>();

      if (grouped.size === 0) {
        const sheet = workbook.addWorksheet('Performance Returns', { views: [{ showGridLines: false }] });
        const { headers, headerRowIndex } = applySheetLayoutAndStyles(sheet, computedRunDate);
        populateRowsAndFormat(sheet, [], headerRowIndex, headers.length);
      } else {
        // ---- Create one worksheet per analyst ----
        Array.from(grouped.entries())
          .sort(([aName], [bName]) => (aName < bName ? -1 : aName > bName ? 1 : 0))
          .forEach(([analystLabel, rows]) => {
            const sheetName = makeSafeSheetName(analystLabel, usedNames);

            const sheet = workbook.addWorksheet(sheetName, {
              views: [{ showGridLines: false }],
            });

            const { headers, headerRowIndex } = applySheetLayoutAndStyles(sheet, computedRunDate);
            populateRowsAndFormat(sheet, rows, headerRowIndex, headers.length);
          });
      }

      // ---- Save file ----
      const today = formatDate(new Date().toDateString());
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `Performance Returns ${today}.xlsx`);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('An error has occurred. Please try again.', e);
      }
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