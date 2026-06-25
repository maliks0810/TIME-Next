import ExcelJS from 'exceljs';
import {
  DEFAULT_MISSING_COLOR,
  DEFAULT_OUTLIER_COLOR,
  buildHeatScales,
  headerDepth,
  heatRgba,
  leafColumns,
  rampRgb,
  type ColumnNode,
  type GridRow,
  type HeatRamp,
} from './types';

/**
 * Heat Map Grid "as shown" Excel export: N-tier stacked headers, pinned total,
 * frozen panes — and the heat shading painted into the workbook so it reads
 * like the screen. Styled as a clean report: gridlines OFF, hairline rules
 * only, bold ramp fills with luminance-matched text.
 */

const TITLE = 'FF1C2330';
const MUTED = 'FF667085';
const HEAD_FILL = 'FFF7F8FA';
const TOTAL_FILL = 'FFEFF1F5';
const HAIRLINE = 'FFE4E7EC'; // tier separators inside the header
const RULE = 'FFD0D5DD'; // header underline / total-row rule
const NAME_DARK = 'FF1C2330';
const ON_DARK = 'FFFFFFFF';

export interface ExportSpec {
  fileName: string;
  title: string;
  /** Up to two muted context lines under the title. */
  subtitleLines: string[];
  nameHeader: string;
  /** Recursive column tree — stacked headers export at their full depth. */
  columns: ColumnNode[];
  rows: GridRow[];
  totalRow: GridRow | null;
}

function hex2(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0').toUpperCase();
}

function chan(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance of an 0–255 rgb triple (WCAG). */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/**
 * Turn a screen heat rgba into a print-ready fill. On screen the ramp sits at
 * a low alpha over the cell; on a white sheet that washes out, so we boost the
 * opacity (capped so text stays legible) and pick a black/white font for the
 * resulting fill by luminance.
 */
function heatFill(rgba: [number, number, number, number]): { fill: string; font: string } {
  const [r, g, b, a] = rgba;
  const a2 = Math.min(0.9, a * 1.7);
  const R = r * a2 + 255 * (1 - a2);
  const G = g * a2 + 255 * (1 - a2);
  const B = b * a2 + 255 * (1 - a2);
  return {
    fill: `FF${hex2(R)}${hex2(G)}${hex2(B)}`,
    font: luminance(R, G, B) < 0.45 ? ON_DARK : NAME_DARK,
  };
}

/** Pre-normalized strength → the same print-ready fill treatment as a value cell. */
function strengthFill(strength: number, ramp: HeatRamp): { fill: string; font: string } {
  const [r, g, b] = rampRgb(strength, ramp);
  return heatFill([r, g, b, 0.55]);
}

/** Hex (#rgb/#rrggbb) → ExcelJS ARGB; opaque state-color fills (outlier / blank). */
function hexToArgb(hex: string): string {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return `FF${full.toUpperCase()}`;
}

const solidFill = (argb: string): ExcelJS.FillPattern => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb },
});

/** Black/white font for a solid ARGB fill (FFrrggbb). */
function fontForArgb(argb: string): string {
  const r = parseInt(argb.slice(2, 4), 16);
  const g = parseInt(argb.slice(4, 6), 16);
  const b = parseInt(argb.slice(6, 8), 16);
  return luminance(r, g, b) < 0.45 ? ON_DARK : NAME_DARK;
}

/** Build the styled workbook (pure — no browser APIs, so it's unit-testable). */
export function buildWorkbook(spec: ExportSpec): ExcelJS.Workbook {
  const flatCols = leafColumns(spec.columns);
  const depth = headerDepth(spec.columns);
  const numColCount = flatCols.length;
  const lastCol = 1 + numColCount;

  // Heat scales over everything being exported, total row included.
  const scaleRows = spec.totalRow ? [spec.totalRow, ...spec.rows] : spec.rows;
  const heatScales = buildHeatScales(flatCols, scaleRows);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Heat Map Grid';
  const HEADER_TOP = 5;
  const HEADER_BOTTOM = HEADER_TOP + depth - 1;
  const TOTAL_ROW = HEADER_TOP + depth;
  const ws = wb.addWorksheet('Data', {
    views: [
      {
        state: 'frozen',
        xSplit: 1,
        ySplit: spec.totalRow ? TOTAL_ROW : TOTAL_ROW - 1,
        showGridLines: false,
      },
    ],
  });

  ws.getColumn(1).width = 46;
  for (let i = 0; i < numColCount; i++) ws.getColumn(2 + i).width = 9.5;

  ws.getCell('A1').value = spec.title;
  ws.getCell('A1').font = { bold: true, size: 13, color: { argb: TITLE } };
  spec.subtitleLines.slice(0, 2).forEach((line, i) => {
    const cell = ws.getCell(`A${2 + i}`);
    cell.value = line;
    cell.font = { size: 10, color: { argb: MUTED } };
  });

  // N-tier stacked header mirroring the grid
  if (depth > 1) ws.mergeCells(HEADER_TOP, 1, HEADER_BOTTOM, 1);
  ws.getCell(HEADER_TOP, 1).value = spec.nameHeader;
  const countLeaves = (n: ColumnNode): number =>
    n.children?.length ? n.children.reduce((acc, c) => acc + countLeaves(c), 0) : 1;
  let col = 2;
  const walk = (node: ColumnNode, level: number) => {
    const row = HEADER_TOP + level;
    if (node.children?.length) {
      const span = countLeaves(node);
      if (span > 1) ws.mergeCells(row, col, row, col + span - 1);
      ws.getCell(row, col).value = node.label;
      for (const child of node.children) walk(child, level + 1);
    } else {
      if (depth - level > 1) ws.mergeCells(row, col, HEADER_BOTTOM, col);
      ws.getCell(row, col).value = node.label;
      col++;
    }
  };
  for (const node of spec.columns) walk(node, 0);
  for (let r = HEADER_TOP; r <= HEADER_BOTTOM; r++) {
    ws.getRow(r).height = 17;
    const lastRow = r === HEADER_BOTTOM;
    for (let c = 1; c <= lastCol; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD_FILL } };
      cell.font = { bold: true, size: 9.5, color: { argb: TITLE } };
      cell.alignment = { horizontal: c === 1 ? 'left' : 'center', vertical: 'middle' };
      // Hairline tier separators; a firmer rule under the whole header block.
      cell.border = { bottom: { style: lastRow ? 'thin' : 'hair', color: { argb: lastRow ? RULE : HAIRLINE } } };
    }
  }

  const writeRow = (rowIdx: number, row: GridRow, opts: { total?: boolean } = {}) => {
    const isGroup = !row.isLeaf;
    const bold = opts.total ?? isGroup;
    ws.getRow(rowIdx).height = 16.5;

    const nameCell = ws.getCell(rowIdx, 1);
    nameCell.value = isGroup && row.leafCount > 0 ? `${row.label} (${row.leafCount})` : row.label;
    nameCell.alignment = { indent: row.depth, vertical: 'middle' };
    nameCell.font = { size: 10, bold, color: isGroup || opts.total ? { argb: NAME_DARK } : { argb: MUTED } };

    let c = 2;
    for (const colDef of flatCols) {
      const v = row.values[colDef.key] ?? null;
      const dp = row.decimals ?? colDef.decimals ?? 1; // per-row precision wins
      const int = colDef.thousands ? '#,##0' : '0';
      const cell = ws.getCell(rowIdx, c);
      const hd = colDef.heat ? row.heatCells?.[colDef.key] : undefined;

      let fontColor = NAME_DARK;
      let showValue = true;
      if (hd?.kind === 'blank') {
        // no data → the configured (or default) no-data color, no value
        cell.fill = solidFill(hexToArgb(colDef.heatMissing ?? DEFAULT_MISSING_COLOR));
        showValue = false;
      } else if (hd?.kind === 'outlier') {
        const fill = hexToArgb(colDef.heatOutlier ?? DEFAULT_OUTLIER_COLOR);
        cell.fill = solidFill(fill);
        fontColor = fontForArgb(fill);
      } else if (hd?.kind === 'spectrum' && hd.strength != null) {
        const { fill, font } = strengthFill(hd.strength, colDef.heatRamp ?? 'ryg');
        cell.fill = solidFill(fill);
        fontColor = font;
      } else if (colDef.heat && v != null) {
        // value-vs-shared-scale shading (e.g. AQI)
        const rgba = heatRgba(v, heatScales[colDef.heat]);
        if (rgba) {
          const { fill, font } = heatFill(rgba);
          cell.fill = solidFill(fill);
          fontColor = font;
        }
      }

      if (showValue && v != null) cell.value = Math.round(v * 10 ** (dp + 1)) / 10 ** (dp + 1);
      cell.numFmt = dp > 0 ? int + '.' + '0'.repeat(dp) : int;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.font = { size: 10, bold, color: { argb: fontColor } };
      c++;
    }

    if (opts.total) {
      // A firm rule above the pinned total separates it from the body.
      for (let cc = 1; cc <= lastCol; cc++) {
        const cell = ws.getCell(rowIdx, cc);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL_FILL } };
        cell.border = { top: { style: 'thin', color: { argb: RULE } } };
      }
    }
  };

  let r = TOTAL_ROW;
  if (spec.totalRow) {
    writeRow(r, { ...spec.totalRow, isLeaf: true, depth: 0 }, { total: true });
    r++;
  }
  for (const row of spec.rows) {
    writeRow(r, row);
    r++;
  }

  return wb;
}

export async function exportToExcel(spec: ExportSpec): Promise<void> {
  const wb = buildWorkbook(spec);
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = spec.fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
