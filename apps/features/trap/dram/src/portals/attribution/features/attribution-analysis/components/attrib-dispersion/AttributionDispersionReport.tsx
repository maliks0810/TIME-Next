import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Segmented,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

import {
  AttributionDispersionResponse,
  Primitive,
} from "../../lib/types";

import styles from "./AttributionDispersionReport.module.css";

type Props = {
  data?: AttributionDispersionResponse;
  className?: string;
};

type SourceRow = Record<string, Primitive>;

type TableRow = SourceRow & {
  __rowKey: string;
};

function formatCellValue(
  value: Primitive | undefined,
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (typeof value === "string") {
    return value;
  }

  const absoluteValue = Math.abs(value);

  return value.toLocaleString(undefined, {
    maximumFractionDigits:
      absoluteValue !== 0 && absoluteValue < 1
        ? 5
        : 2,
  });
}

function columnLabel(columnName: string): string {
  return columnName.replaceAll("_", " ");
}

function isNumericColumn(
  columnName: string,
  rows: SourceRow[],
): boolean {
  const values = rows
    .map((row) => row[columnName])
    .filter(
      (value) =>
        value !== null &&
        value !== undefined,
    );

  return (
    values.length > 0 &&
    values.every(
      (value) => typeof value === "number",
    )
  );
}

function isSummaryRow(
  row: SourceRow,
): boolean {
  return Object.values(row).some((value) => {
    if (typeof value !== "string") {
      return false;
    }

    const normalized =
      value.trim().toLowerCase();

    return (
      normalized === "total" ||
      normalized === "subtotal" ||
      normalized.endsWith(": median") ||
      normalized.endsWith("-median")
    );
  });
}

function getColumnWidth(
  columnName: string,
  rows: SourceRow[],
): number {
  const headerLength =
    columnLabel(columnName).length;

  const maximumValueLength = rows.reduce(
    (maximumLength, row) => {
      const formattedValue = formatCellValue(
        row[columnName],
      );

      return Math.max(
        maximumLength,
        formattedValue.length,
      );
    },
    headerLength,
  );

  return Math.min(
    Math.max(maximumValueLength + 2, 12),
    42,
  );
}

function sanitizeWorksheetName(
  value: string,
): string {
  const sanitized = value
    .replace(/[\\/*?:[\]]/g, " ")
    .trim();

  return sanitized.slice(0, 31) ||
    "Attribution Dispersion";
}

function sanitizeFileName(
  value: string,
): string {
  return value
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export default function AttributionDispersionReport({
  data,
  className,
}: Props) {
  const grids = data?.data?.grids ?? [];

  const [
    activeGridIndex,
    setActiveGridIndex,
  ] = useState(0);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const activeGrid =
    grids[activeGridIndex];

  const {
    page_title: pageTitle,
    value_date: valueDate,
  } = data?.data?.metadata ?? {};

  useEffect(() => {
    if (
      grids.length === 0 ||
      activeGridIndex >= grids.length
    ) {
      setActiveGridIndex(0);
    }
  }, [
    activeGridIndex,
    grids.length,
  ]);

  const rows = useMemo<SourceRow[]>(
    () => activeGrid?.rows ?? [],
    [activeGrid],
  );

  const columnNames = useMemo(() => {
    const keys = new Set<string>();

    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        keys.add(key);
      });
    });

    return Array.from(keys);
  }, [rows]);

  const numericColumns = useMemo(
    () =>
      new Set(
        columnNames.filter((columnName) =>
          isNumericColumn(
            columnName,
            rows,
          ),
        ),
      ),
    [columnNames, rows],
  );

  const dataSource =
    useMemo<TableRow[]>(
      () =>
        rows.map((row, rowIndex) => ({
          ...row,
          __rowKey:
            `${activeGridIndex}-${rowIndex}`,
        })),
      [activeGridIndex, rows],
    );

  const columns =
    useMemo<ColumnsType<TableRow>>(
      () =>
        columnNames.map(
          (columnName) => {
            const numeric =
              numericColumns.has(columnName);

            const normalizedName =
              columnName.toLowerCase();

            return {
              title: columnLabel(
                columnName,
              ),
              dataIndex: columnName,
              key: columnName,
              align: numeric
                ? "right"
                : "left",
              width: numeric
                ? 115
                : normalizedName.includes(
                      "account",
                    )
                  ? 210
                  : normalizedName.includes(
                        "strategy",
                      )
                    ? 190
                    : 150,
              sorter: (
                leftRow,
                rightRow,
              ) => {
                const leftValue =
                  leftRow[columnName];

                const rightValue =
                  rightRow[columnName];

                if (
                  typeof leftValue ===
                    "number" &&
                  typeof rightValue ===
                    "number"
                ) {
                  return (
                    leftValue -
                    rightValue
                  );
                }

                return String(
                  leftValue ?? "",
                ).localeCompare(
                  String(
                    rightValue ?? "",
                  ),
                  undefined,
                  {
                    numeric: true,
                    sensitivity: "base",
                  },
                );
              },
              render: (
                value: Primitive,
                row: TableRow,
              ) => (
                <span
                  className={
                    typeof value ===
                      "number" &&
                    value < 0
                      ? styles.negativeValue
                      : undefined
                  }
                  style={{
                    fontWeight:
                      isSummaryRow(row)
                        ? 600
                        : undefined,
                  }}
                >
                  {formatCellValue(
                    value,
                  )}
                </span>
              ),
            };
          },
        ),
      [
        columnNames,
        numericColumns,
      ],
    );

  const handleExportExcel =
    async (): Promise<void> => {
      if (
        !activeGrid ||
        rows.length === 0
      ) {
        message.warning(
          "There are no Attribution Dispersion rows to export.",
        );

        return;
      }

      setExporting(true);

      try {
        const workbook =
          new ExcelJS.Workbook();

        workbook.creator = "DRAM 2.0";
        workbook.created =
          new Date();
        workbook.modified =
          new Date();

        const worksheet =
          workbook.addWorksheet(
            sanitizeWorksheetName(
              activeGrid.title ||
                "Attribution Dispersion",
            ),
            {
              views: [
                {
                  state: "frozen",
                  ySplit: 1,
                },
              ],
            },
          );

        worksheet.columns =
          columnNames.map(
            (columnName) => ({
              key: columnName,
              header:
                columnLabel(
                  columnName,
                ),
              width: getColumnWidth(
                columnName,
                rows,
              ),
            }),
          );

        rows.forEach((row) => {
          worksheet.addRow(
            columnNames.map(
              (columnName) =>
                row[columnName] ??
                null,
            ),
          );
        });

        const headerRow =
          worksheet.getRow(1);

        headerRow.height = 28;

        headerRow.font = {
          bold: true,
          color: {
            argb: "FFFFFFFF",
          },
        };

        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FF1F4E78",
          },
        };

        headerRow.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };

        headerRow.eachCell(
          (cell) => {
            cell.border = {
              bottom: {
                style: "thin",
                color: {
                  argb:
                    "FFB4C6E7",
                },
              },
            };
          },
        );

        if (
          columnNames.length > 0
        ) {
          worksheet.autoFilter = {
            from: {
              row: 1,
              column: 1,
            },
            to: {
              row: 1,
              column:
                columnNames.length,
            },
          };
        }

        rows.forEach(
          (
            sourceRow,
            sourceRowIndex,
          ) => {
            const excelRow =
              worksheet.getRow(
                sourceRowIndex + 2,
              );

            const summaryRow =
              isSummaryRow(
                sourceRow,
              );

            excelRow.height = 20;

            columnNames.forEach(
              (
                columnName,
                columnIndex,
              ) => {
                const value =
                  sourceRow[
                    columnName
                  ];

                const cell =
                  excelRow.getCell(
                    columnIndex + 1,
                  );

                if (
                  typeof value ===
                  "number"
                ) {
                  cell.alignment = {
                    vertical:
                      "middle",
                    horizontal:
                      "right",
                  };

                  cell.numFmt =
                    '#,##0.#####;#,##0.#####;-';

                  cell.font = {
                    ...cell.font,
                    bold: summaryRow,
                    color:
                      value < 0
                        ? {
                            argb:
                              "FFCF1322",
                          }
                        : undefined,
                  };
                } else if (
                  typeof value ===
                  "boolean"
                ) {
                  cell.value = value
                    ? "True"
                    : "False";

                  cell.alignment = {
                    vertical:
                      "middle",
                    horizontal:
                      "center",
                  };
                } else {
                  cell.alignment = {
                    vertical:
                      "middle",
                    horizontal:
                      "left",
                  };
                }
              },
            );

            if (summaryRow) {
              excelRow.font = {
                ...excelRow.font,
                bold: true,
              };

              excelRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb:
                    "FFF2F2F2",
                },
              };

              excelRow.eachCell(
                (cell) => {
                  cell.border = {
                    top: {
                      style: "thin",
                      color: {
                        argb:
                          "FFD9D9D9",
                      },
                    },
                  };
                },
              );
            }
          },
        );

        const workbookBuffer =
          await workbook.xlsx.writeBuffer();

        const titlePart =
          sanitizeFileName(
            activeGrid.title ||
              "attribution-dispersion",
          );

        const datePart =
          valueDate ||
          new Date()
            .toISOString()
            .slice(0, 10);

        const fileName =
          `${titlePart}-${datePart}.xlsx`;

        saveAs(
          new Blob(
            [workbookBuffer],
            {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ),
          fileName,
        );

        message.success(
          "Attribution Dispersion exported to Excel.",
        );
      } catch (error) {
        console.error(
          "Unable to export Attribution Dispersion",
          error,
        );

        message.error(
          "Unable to export Attribution Dispersion to Excel.",
        );
      } finally {
        setExporting(false);
      }
    };

  return (
    <div
      className={[
        styles.report,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.header}>
        <Typography.Title
          level={4}
          className={styles.title}
        >
          {pageTitle ??
            "Attribution Dispersion Report"}
        </Typography.Title>

        <Typography.Text
          type="secondary"
          className={styles.description}
        >
          Select an attribution style
          to update the report results
          below.
        </Typography.Text>
      </div>

      {grids.length > 1 && (
        <div
          className={
            styles.gridSelector
          }
        >
          <Typography.Text
            strong
            className={
              styles.gridSelectorLabel
            }
          >
            Attribution style
          </Typography.Text>

          <Segmented<number>
            block
            size="large"
            value={activeGridIndex}
            onChange={
              setActiveGridIndex
            }
            options={grids.map(
              (grid, index) => ({
                value: index,
                label:
                  grid.title ||
                  `Style ${index + 1}`,
              }),
            )}
          />
        </div>
      )}

      {!activeGrid ? (
        <Empty
          image={
            Empty.PRESENTED_IMAGE_SIMPLE
          }
          description="No attribution dispersion grids are available"
        />
      ) : (
        <Space
          direction="vertical"
          size={10}
          className={
            styles.reportContent
          }
        >
          <div
            className={
              styles.activeGridHeader
            }
          >
            <div>
              <Typography.Text
                type="secondary"
                className={
                  styles.showingLabel
                }
              >
                Showing
              </Typography.Text>

              <Typography.Title
                level={5}
                className={
                  styles.activeGridTitle
                }
              >
                {activeGrid.title}
              </Typography.Title>
            </div>

            <Space
              size={12}
              wrap
            >
              <Typography.Text
                type="secondary"
              >
                {rows.length.toLocaleString()}{" "}
                {rows.length === 1
                  ? "row"
                  : "rows"}
              </Typography.Text>

              <Button
                icon={
                  <DownloadOutlined />
                }
                loading={exporting}
                disabled={
                  rows.length === 0
                }
                onClick={() =>
                  void handleExportExcel()
                }
              >
                Export Excel
              </Button>
            </Space>
          </div>

          <Table<TableRow>
            rowKey="__rowKey"
            columns={columns}
            dataSource={dataSource}
            size="small"
            sticky
            pagination={{
              defaultPageSize: 50,
              showSizeChanger: true,
              pageSizeOptions: [
                "25",
                "50",
                "100",
                "200",
              ],
              showTotal: (total) =>
                `${total.toLocaleString()} rows`,
            }}
            scroll={{
              x: "max-content",
              y: 600,
            }}
            rowClassName={(row) =>
              isSummaryRow(row)
                ? styles.summaryRow
                : ""
            }
            locale={{
              emptyText: (
                <Empty
                  image={
                    Empty.PRESENTED_IMAGE_SIMPLE
                  }
                  description="No rows are available for the selected style"
                />
              ),
            }}
          />
        </Space>
      )}
    </div>
  );
}