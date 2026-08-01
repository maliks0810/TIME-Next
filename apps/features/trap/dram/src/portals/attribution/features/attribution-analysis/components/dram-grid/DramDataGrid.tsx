import React, { useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type {
  ColumnsType,
  ColumnGroupType,
  ColumnType,
} from "antd/es/table";
import {
  DownloadOutlined,
} from "@ant-design/icons";
import type { GridConfigResponse, NormalizedColumnConfig, PrimitiveCellValue } from "./types";
import {
  normalizeColumns,
  buildColumns,
  getTotalScrollWidth,
  mapRowsToTableRows,
} from "./columnBuilder";
import { formatValue } from "./formatters";
import { useDramGridContext } from "./DramGridContext";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import { ColumnTitle, ColumnTitleProps } from "antd/es/table/interface";
import "./DramDataGrid.css"

type ExcelColumn = ColumnType<TreeRow> | ColumnGroupType<TreeRow>;

interface DramDataGridProps {
  config: GridConfigResponse;
  rows: Record<string, string | number | null | undefined>[];
  accessorOverrides?: Record<string, string>;
  height?: number;
  title?: string;
  storageKey?: string;
  isConfigView: boolean;
  allColumns: NormalizedColumnConfig[];
}

interface LeafColumn {
  title: string;
  accessor: string;
  width?: number;
}

interface HeaderCell {
  title: string;
  row: number;
  startCol: number;
  endCol: number;
  isLeaf: boolean;
}

interface FlatTreeRow {
  row: TreeRow;
  level: number;
}

type TreeRow = Record<string, unknown> & {
  key?: string;
  children?: TreeRow[];
};

/**
 * One grid to be written into its own worksheet of a shared workbook.
 * `allColumns` drives both the header layout and cell formatting.
 */
export interface ExcelGridInput {
  /** Worksheet tab name (e.g. the period title "MTD: ..."). */
  sheetName: string;
  /** Flat rows for this grid (already mapped, each carrying Hierarchy_level). */
  rows: TreeRow[];
  /** Column configs used to build headers + resolve formats for this grid. */
  allColumns: NormalizedColumnConfig[];
}

/** ------------------------------------------------------------------ *
 * Hierarchy indentation config (Option A: flat rows + Hierarchy_level)
 * ------------------------------------------------------------------ */
const HIERARCHY_LEVEL_FIELD = "Hierarchy_level";
const INDENT_PER_LEVEL = 16; // px per hierarchy level (screen grid)
const EXCEL_INDENT_SPACES = 3; // leading spaces per level in Excel/CSV first column

/** Read the raw 1-based Hierarchy_level from a row (defaults to 1). */
const getHierarchyLevel = (row: Record<string, unknown>): number => {
  const level = Number(row[HIERARCHY_LEVEL_FIELD] ?? 1);
  return Number.isFinite(level) ? level : 1;
};

/** Convert a 1-based Hierarchy_level into a 0-based indent depth. */
const getIndentDepth = (row: Record<string, unknown>): number =>
  Math.max(0, getHierarchyLevel(row) - 1);

/** Deepest hierarchy level across a set of rows (>= 1). */
const getMaxHierarchyLevel = (rows: TreeRow[]): number =>
  rows.reduce((acc, row) => Math.max(acc, getHierarchyLevel(row)), 1);

const isColumnGroup = (column: ExcelColumn): column is ColumnGroupType<TreeRow> =>
  Array.isArray((column as ColumnGroupType<TreeRow>).children);

const getTitleText = (title: ColumnTitle<TreeRow>): string => {
  if (typeof title === "function") {
    const mockProps: ColumnTitleProps<TreeRow> = {
      sortOrder: null,
      sortColumn: undefined,
      filters: undefined,
    };
    const result = title(mockProps);
    if (typeof result === "string" || typeof result === "number") {
      return String(result);
    }
    return "";
  }
  if (typeof title === "string" || typeof title === "number") {
    return String(title);
  }
  return "";
};

const getColumnAccessor = (column: ExcelColumn): string => {
  const dataIndex = (column as ColumnType<TreeRow>).dataIndex;
  if (Array.isArray(dataIndex)) {
    return dataIndex.join(".");
  }
  if (typeof dataIndex === "string" || typeof dataIndex === "number") {
    return String(dataIndex);
  }
  if (typeof column.key === "string" || typeof column.key === "number") {
    return String(column.key);
  }
  return "";
};

const getNestedValue = (
  row: Record<string, unknown>,
  accessor: string
): unknown => {
  if (!accessor.includes(".")) {
    return row[accessor];
  }
  return accessor.split(".").reduce<unknown>((current, part) => {
    if (
      current !== null &&
      typeof current === "object" &&
      part in current
    ) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, row);
};

/** ------------------------------------------------------------------ *
 * Option A: indent the FIRST leaf column (the label/name column) using
 * each row's Hierarchy_level.
 *
 * Generic over the row type <T> so it preserves the exact type returned by
 * buildColumns (e.g. ColumnsType<AttributionRow>). AntD column types are
 * invariant on the row type, so casting between ColumnsType<AttributionRow>
 * and ColumnsType<TreeRow> is illegal — the generic avoids that mismatch.
 * ------------------------------------------------------------------ */
const decorateFirstColumnWithIndent = <T extends Record<string, unknown>>(
  cols: ColumnsType<T>,
  done: { value: boolean } = { value: false }
): ColumnsType<T> =>
  cols.map((col) => {
    if (done.value) return col;

    // Descend into column groups until we reach the first leaf column.
    const maybeGroup = col as ColumnGroupType<T>;
    if (Array.isArray(maybeGroup.children)) {
      return {
        ...maybeGroup,
        children: decorateFirstColumnWithIndent<T>(
          maybeGroup.children as ColumnsType<T>,
          done
        ),
      };
    }

    // First leaf column found — attach an indenting render.
    done.value = true;
    const leaf = col as ColumnType<T>;
    const accessor = getColumnAccessor(leaf as unknown as ExcelColumn);
    const prevRender = leaf.render;

    return {
      ...leaf,
      render: (value: unknown, record: T, index: number) => {
        const depth = getIndentDepth(record as Record<string, unknown>);
        const content = prevRender
          ? prevRender(value, record, index)
          : (getNestedValue(
              record as Record<string, unknown>,
              accessor
            ) as React.ReactNode);
        return (
          <span
            style={{
              paddingLeft: depth * INDENT_PER_LEVEL,
              display: "inline-block",
            }}
          >
            {content as React.ReactNode}
          </span>
        );
      },
    } as ColumnType<T>;
  });

const getMaxHeaderDepth = (columns: ExcelColumn[]): number => {
  if (columns.length === 0) return 1;
  return Math.max(
    ...columns.map((column) => {
      if (isColumnGroup(column)) {
        return 1 + getMaxHeaderDepth(column.children as ExcelColumn[]);
      }
      return 1;
    })
  );
};

const buildExcelHeaderLayout = (
  columns: ExcelColumn[],
  row = 1,
  startCol = 1,
  headerCells: HeaderCell[] = [],
  leafColumns: LeafColumn[] = []
): { headerCells: HeaderCell[]; leafColumns: LeafColumn[]; nextCol: number } => {
  let currentCol = startCol;
  columns.forEach((column) => {
    const title = getTitleText(column.title);
    const width =
      typeof (column as ColumnType<TreeRow>).width === "number"
        ? Number((column as ColumnType<TreeRow>).width)
        : undefined;
    if (isColumnGroup(column)) {
      const groupStartCol = currentCol;
      const result = buildExcelHeaderLayout(
        column.children as ExcelColumn[],
        row + 1,
        currentCol,
        headerCells,
        leafColumns
      );
      currentCol = result.nextCol;
      headerCells.push({
        title,
        row,
        startCol: groupStartCol,
        endCol: currentCol - 1,
        isLeaf: false,
      });
      return;
    }
    const accessor = getColumnAccessor(column);
    headerCells.push({
      title,
      row,
      startCol: currentCol,
      endCol: currentCol,
      isLeaf: true,
    });
    leafColumns.push({
      title,
      accessor,
      width,
    });
    currentCol += 1;
  });
  return {
    headerCells,
    leafColumns,
    nextCol: currentCol,
  };
};

const isTotalLikeRow = (row: TreeRow): boolean => {
  const explicitFlags = [
    row.isTotal,
    row.isSubtotal,
    row.isGrandTotal,
    row.total,
    row.subtotal,
    row.grandTotal,
  ];
  if (explicitFlags.some((value) => value === true)) {
    return true;
  }
  const rowType = String(row.rowType ?? row.type ?? "").toLowerCase();
  if (
    rowType === "total" ||
    rowType === "subtotal" ||
    rowType === "grandtotal" ||
    rowType === "grand_total"
  ) {
    return true;
  }
  const labelCandidate = String(
    row.label ??
      row.name ??
      row.displayName ??
      row.description ??
      row.category ??
      row.SecurityName ??
      ""
  ).toLowerCase();
  return (
    labelCandidate === "total" ||
    labelCandidate === "subtotal" ||
    labelCandidate === "grand total" ||
    labelCandidate.endsWith(" total")
  );
};

const toExcelCellValue = (
  rawValue: unknown,
  columnConfig?: NormalizedColumnConfig
): string | number | boolean | Date | null => {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }
  if (
    typeof rawValue === "number" ||
    typeof rawValue === "boolean" ||
    rawValue instanceof Date
  ) {
    return rawValue;
  }
  if (
    typeof rawValue === "string" &&
    rawValue.trim() !== "" &&
    columnConfig?.format !== "text"
  ) {
    const numericValue = Number(rawValue);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }
  return formatValue(
    rawValue as PrimitiveCellValue,
    columnConfig?.format ?? "text",
    ""
  );
};

const sanitizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_");

/**
 * Excel worksheet names are limited to 31 chars, cannot contain
 * \ / ? * [ ] : and must be unique within a workbook. This normalizes a
 * proposed name and de-duplicates against names already used.
 */
const sanitizeSheetName = (name: string, used: Set<string>): string => {
  const cleaned =
    (name || "Sheet")
      .replace(/[\\/?*[\]:]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 31) || "Sheet";
  let candidate = cleaned;
  let counter = 1;
  while (used.has(candidate.toLowerCase())) {
    const suffix = ` (${counter})`;
    candidate = `${cleaned.slice(0, 31 - suffix.length)}${suffix}`;
    counter += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
};

const escapeCsvCell = (value: string): string => {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const mapRowsToTreeTableRows = (
  rows: TreeRow[],
  parentKey = "row"
): TreeRow[] => {
  return rows.map((row, index) => {
    const nextKey = row.key ?? `${parentKey}-${index}`;
    const mapped: TreeRow = {
      ...row,
      key: nextKey,
    };
    if (Array.isArray(row.children) && row.children.length > 0) {
      mapped.children = mapRowsToTreeTableRows(row.children, nextKey);
    }
    return mapped;
  });
};

/** ------------------------------------------------------------------ *
 * Shared worksheet writer.
 *
 * Adds ONE worksheet (styled headers, indented + bold hierarchy rows,
 * number formats, column widths, autofilter, frozen header) to an
 * existing workbook. Reused for both the single-grid button and the
 * multi-grid "export all" path so styling never drifts.
 * ------------------------------------------------------------------ */
export const addAttributionWorksheet = (
  workbook: ExcelJS.Workbook,
  grid: ExcelGridInput,
  usedSheetNames: Set<string>
): void => {
  const { rows, allColumns } = grid;

  // Build the antd column tree for this grid, then flatten it for Excel.
  const displayColumns = decorateFirstColumnWithIndent(
    buildColumns({ columns: allColumns })
  ) as unknown as ColumnsType<TreeRow>;

  const maxHeaderDepth = getMaxHeaderDepth(displayColumns as ExcelColumn[]);
  const { headerCells, leafColumns } = buildExcelHeaderLayout(
    displayColumns as ExcelColumn[]
  );
  if (leafColumns.length === 0) {
    return;
  }

  const sheetName = sanitizeSheetName(grid.sheetName, usedSheetNames);
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [
      {
        state: "frozen",
        ySplit: maxHeaderDepth,
      },
    ],
  });

  const formatByAccessor = new Map<string, NormalizedColumnConfig>();
  allColumns.forEach((column) => {
    formatByAccessor.set(column.accessor, column);
  });

  // Header rows
  for (let rowIndex = 1; rowIndex <= maxHeaderDepth; rowIndex += 1) {
    worksheet.addRow([]);
    worksheet.getRow(rowIndex).height = 22;
  }
  headerCells.forEach((header) => {
    const cell = worksheet.getCell(header.row, header.startCol);
    cell.value = header.title;
    const shouldMergeHorizontal = header.endCol > header.startCol;
    const shouldMergeVertical = header.isLeaf && header.row < maxHeaderDepth;
    if (shouldMergeHorizontal) {
      worksheet.mergeCells(header.row, header.startCol, header.row, header.endCol);
    }
    if (shouldMergeVertical) {
      worksheet.mergeCells(
        header.row,
        header.startCol,
        maxHeaderDepth,
        header.startCol
      );
    }
  });

  // Header styling
  for (let rowIndex = 1; rowIndex <= maxHeaderDepth; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9E2F3" } },
        left: { style: "thin", color: { argb: "FFD9E2F3" } },
        bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
        right: { style: "thin", color: { argb: "FFD9E2F3" } },
      };
    });
  }

  // Top-level header banding (portfolio / benchmark / attribution)
  headerCells.forEach((header) => {
    if (header.row !== 1) return;
    let color = "FF1F4E78";
    const lower = header.title.toLowerCase();
    if (lower.includes("portfolio")) {
      color = "FF2F5597";
    } else if (lower.includes("bench")) {
      color = "FF5B9BD5";
    } else if (lower.includes("attribution")) {
      color = "FF8064A2";
    }
    const headerCell = worksheet.getCell(header.row, header.startCol);
    headerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: color },
    };
  });

  // Option A: derive indent depth from Hierarchy_level (flat data).
  const flatRows: FlatTreeRow[] = rows.map((row) => ({
    row,
    level: getIndentDepth(row),
  }));
  const maxHierarchyLevel = getMaxHierarchyLevel(rows);
  const isGroupRow = (row: TreeRow): boolean =>
    getHierarchyLevel(row) < maxHierarchyLevel;

  flatRows.forEach(({ row, level }) => {
    const values = leafColumns.map((column, columnIndex) => {
      const rawValue = getNestedValue(row, column.accessor);
      const columnConfig = formatByAccessor.get(column.accessor);
      const excelValue = toExcelCellValue(rawValue, columnConfig);
      if (columnIndex === 0 && typeof excelValue === "string") {
        return `${" ".repeat(level * EXCEL_INDENT_SPACES)}${excelValue}`;
      }
      return excelValue;
    });
    const excelRow = worksheet.addRow(values);
    excelRow.outlineLevel = level;
    const totalRow = isTotalLikeRow(row);
    const groupRow = isGroupRow(row);

    excelRow.eachCell((cell, columnNumber) => {
      const leafColumn = leafColumns[columnNumber - 1];
      const columnConfig = formatByAccessor.get(leafColumn.accessor);
      const colIndex = columnNumber - 1;

      cell.alignment = {
        vertical: "middle",
        horizontal:
          colIndex === 0
            ? "left"
            : typeof cell.value === "number"
            ? "right"
            : "left",
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE7E6E6" } },
        left: { style: "thin", color: { argb: "FFE7E6E6" } },
        bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
        right: { style: "thin", color: { argb: "FFE7E6E6" } },
      };

      if (typeof cell.value === "number") {
        if (
          columnConfig?.format === "percent" ||
          columnConfig?.format === "percentage"
        ) {
          cell.numFmt = "0.00%";
        } else if (
          columnConfig?.format === "currency" ||
          columnConfig?.format === "money"
        ) {
          cell.numFmt = "$#,##0.00;[Red]($#,##0.00)";
        } else {
          cell.numFmt = "#,##0.00;[Red](#,##0.00)";
        }
      }

      if (groupRow) {
        cell.font = { bold: true };
      }
      if (totalRow) {
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEDEDED" },
        };
        cell.border = {
          top: { style: "medium", color: { argb: "FF404040" } },
          bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
          left: { style: "thin", color: { argb: "FFE7E6E6" } },
          right: { style: "thin", color: { argb: "FFE7E6E6" } },
        };
      }
    });
  });

  // Column widths
  leafColumns.forEach((column, index) => {
    const excelColumn = worksheet.getColumn(index + 1);
    const widthFromScreen =
      typeof column.width === "number"
        ? Math.ceil(column.width / 7)
        : undefined;
    let maxContentLength = column.title.length;
    excelColumn.eachCell({ includeEmpty: false }, (cell) => {
      const cellText =
        cell.value === null || cell.value === undefined
          ? ""
          : String(cell.value);
      maxContentLength = Math.max(maxContentLength, cellText.length);
    });
    excelColumn.width = Math.min(
      Math.max(widthFromScreen ?? maxContentLength + 2, 12),
      45
    );
  });

  worksheet.autoFilter = {
    from: { row: maxHeaderDepth, column: 1 },
    to: { row: maxHeaderDepth, column: leafColumns.length },
  };
};

/** ------------------------------------------------------------------ *
 * Public: export MULTIPLE grids into a SINGLE workbook, one sheet each.
 * Empty grids (no leaf columns) are skipped. If nothing is written the
 * function returns false so the caller can warn the user.
 * ------------------------------------------------------------------ */
export const exportAttributionGridsToExcel = async (
  grids: ExcelGridInput[],
  options?: { fileName?: string }
): Promise<boolean> => {
  if (!grids.length) {
    return false;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DRAM";
  workbook.created = new Date();

  const usedSheetNames = new Set<string>();
  grids.forEach((grid) => {
    addAttributionWorksheet(workbook, grid, usedSheetNames);
  });

  if (workbook.worksheets.length === 0) {
    return false;
  }

  const baseName = options?.fileName ?? "Attribution";
  const fileName = `${sanitizeFileName(baseName)}_${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, "-")}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName
  );
  return true;
};

export const DramDataGrid: React.FC<DramDataGridProps> = ({
  config,
  rows,
  accessorOverrides,
  height = 600,
  title = "Analytics Grid",
  allColumns,
}) => {
  const ctx = useDramGridContext();
  const normalized = useMemo(
    () => normalizeColumns(config, ctx.state, accessorOverrides),
    [config, ctx.state, accessorOverrides]
  );

  // Option A: wrap buildColumns so the first leaf column indents by Hierarchy_level.
  const columns = useMemo(
    () => decorateFirstColumnWithIndent(buildColumns({ columns: allColumns })),
    [allColumns]
  );

  const scrollX = useMemo(
    () => getTotalScrollWidth(normalized),
    [normalized]
  );
  const dataSource = useMemo(
    () => mapRowsToTableRows(rows),
    [rows]
  );
  const visibleColumns = useMemo(
    () => normalized.filter((c) => c.visible),
    [normalized]
  );

  // Deepest hierarchy level — used to bold non-leaf (group) rows in the grid.
  const maxHierarchyLevel = useMemo(
    () => getMaxHierarchyLevel(dataSource as TreeRow[]),
    [dataSource]
  );

  const getRowClassName = (record: TreeRow): string => {
    if (isTotalLikeRow(record)) {
      return "dram-grid-total-row";
    }
    if (getHierarchyLevel(record) < maxHierarchyLevel) {
      return "dram-grid-group-row";
    }
    return "";
  };

  const handleExportCsv = (): void => {
    if (visibleColumns.length === 0) {
      message.warning("There are no visible columns to export.");
      return;
    }
    const headerLine = visibleColumns
      .map((col) => escapeCsvCell(col.label))
      .join(",");
    const lines = dataSource.map((row) => {
      const depth = getIndentDepth(row as Record<string, unknown>);
      return visibleColumns
        .map((col, colIndex) => {
          const rawValue = row[col.accessor] as PrimitiveCellValue;
          const formatted = formatValue(rawValue, col.format, "");
          if (colIndex === 0 && depth > 0) {
            return escapeCsvCell(
              `${" ".repeat(depth * EXCEL_INDENT_SPACES)}${formatted}`
            );
          }
          return escapeCsvCell(formatted);
        })
        .join(",");
    });
    const csv = [`\uFEFF${headerLine}`, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fileName = `${sanitizeFileName(title)}_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    message.success("CSV export complete.");
  };

  // Single-grid export now delegates to the shared multi-grid utility.
  const handleExportExcel = async (): Promise<void> => {
    if (columns.length === 0) {
      message.warning("There are no columns to export.");
      return;
    }
    const ok = await exportAttributionGridsToExcel(
      [
        {
          sheetName: title,
          rows: dataSource as TreeRow[],
          allColumns,
        },
      ],
      { fileName: title }
    );
    if (ok) {
      message.success("Excel export complete.");
    } else {
      message.warning("There are no visible columns to export.");
    }
  };

  useEffect(() => {
    console.log(
      "ALL COLUMNS IN GRID",
      allColumns.map((c) => ({
        id: c.id,
        format: c.format,
        metricType: c.metricType,
      }))
    );
  }, [allColumns]);

  return (
    <Card
      size="small"
      styles={{ body: { paddingTop: 12 } }}
      title={
        <Space size="middle" align="center">
          <Typography.Text strong>{title}</Typography.Text>
          <Tag color="blue">{dataSource.length} rows</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => void handleExportExcel()}
          >
            Export Excel
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="key"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        sticky
        virtual={false}
        rowClassName={(record) => getRowClassName(record as TreeRow)}
        scroll={{ x: scrollX, y: height }}
      />
    </Card>
  );
};
