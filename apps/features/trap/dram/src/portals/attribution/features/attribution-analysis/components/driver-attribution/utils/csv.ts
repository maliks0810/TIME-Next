import type { GridRow, GridCellPrimitive } from "../types/unifiedDriverAttribution";

export interface ParsedCsv {
  columns: string[];
  rows: GridRow[];
}

function parseCell(raw: string): GridCellPrimitive {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  const numeric = Number(trimmed.replace(/,/g, ""));
  if (Number.isFinite(numeric) && /^-?[0-9,]+(\.[0-9]+)?$/.test(trimmed)) return numeric;
  return trimmed;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

export function parseCsv(text: string): ParsedCsv {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };

  const columns = splitCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(columns.map((column, index) => [column, parseCell(cells[index] ?? "")])) as GridRow;
  });

  return { columns, rows };
}
