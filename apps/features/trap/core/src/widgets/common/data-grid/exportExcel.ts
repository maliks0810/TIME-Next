/* eslint-disable @typescript-eslint/no-explicit-any */

import { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`; // Change configuration here
};
const rawDate = new Date().toDateString();
const today = formatDate(rawDate);

const getCellText = (value: any): string | null => {
    if (value == null) return null;

    if (typeof value === 'string') return value.trim();

    if (typeof value === 'object') {
        if ('text' in value) return String(value.text).trim();

        if ('richText' in value && Array.isArray(value.richText)) {
            return value.richText
                .map((r: any) => r.text)
                .join('')
                .trim();
        }
    }

    return null;
};

const normalize = (value: any): any => {
    if (value == null) return null;

    if (typeof value === 'object') {
        if ('text' in value) return value.text;
        if ('richText' in value) return value.richText.map((r: any) => r.text).join('');
    }

    return value;
};

const mergeIdenticalCells = (worksheet: Worksheet, fromRow: number) => {
    const columnCount = worksheet.columnCount;

    for (let col = 1; col <= columnCount; col++) {
        let startRow: number | null = null;
        let lastValue: any = undefined;

        let columnHadMerge = false;

        for (let row = fromRow + 1; row <= worksheet.rowCount; row++) {
            const cell = worksheet.getRow(row).getCell(col);
            const value = cell.value;

            const text = getCellText(value);
            const lastText = getCellText(lastValue);

            if (row === fromRow + 1) {
                startRow = row;
                lastValue = value;
                continue;
            }

            const isSame = text !== null && lastText !== null && text === lastText;

            if (!isSame) {
                if (startRow !== null && row - 1 > startRow && lastText !== null) {
                    worksheet.mergeCells(startRow, col, row - 1, col);

                    columnHadMerge = true;

                    const topCell = worksheet.getRow(startRow).getCell(col);
                    topCell.alignment = {
                        vertical: 'top',
                        horizontal: 'left',
                        wrapText: true,
                    };
                }

                startRow = row;
                lastValue = value;
            }

            // last row edge case
            if (row === worksheet.rowCount) {
                if (startRow !== null && row > startRow && lastText !== null) {
                    worksheet.mergeCells(startRow, col, row, col);

                    columnHadMerge = true;

                    const topCell = worksheet.getRow(startRow).getCell(col);
                    topCell.alignment = {
                        vertical: 'top',
                        horizontal: 'left',
                        wrapText: true,
                    };
                }
            }
        }

        // STOP merging further columns if this one had no merges
        if (!columnHadMerge) {
            break;
        }
    }
};

const getMergedColumns = (worksheet: Worksheet): Set<number> => {
    const merges = Object.values((worksheet as any)._merges || {});
    const mergedCols = new Set<number>();

    merges.forEach((merge: any) => {
        if (merge.bottom > merge.top) {
            mergedCols.add(merge.left);
        }
    });

    return mergedCols;
};

const applyRowAlternation = (worksheet: Worksheet, fromRow: number, groupRows: Set<number>) => {
    const mergedColumns = getMergedColumns(worksheet);

    let startCol = mergedColumns.size > 0 ? Math.max(...mergedColumns) + 1 : 1;

    startCol = Math.min(startCol, worksheet.columnCount);

    const endCol = worksheet.columnCount;

    let lastValue: any = undefined;
    let isAlt = false;

    for (let rowIndex = fromRow + 1; rowIndex <= worksheet.rowCount; rowIndex++) {
        if (groupRows.has(rowIndex)) continue;
        const row = worksheet.getRow(rowIndex);
        const triggerCell = row.getCell(startCol);

        const value = normalize(triggerCell.value);
        const isNewBlock = value !== lastValue;

        if (isNewBlock) {
            isAlt = !isAlt;
            lastValue = value;
        }

        if (isAlt) {
            for (let col = startCol; col <= endCol; col++) {
                row.getCell(col).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF5F5F5' },
                };
            }
        }
    }
};

const mergeGroupRows = (worksheet: Worksheet, groupRows: Set<number>) => {
    const colCount = worksheet.columnCount;

    groupRows.forEach((rowIndex) => {
        worksheet.mergeCells(rowIndex, 1, rowIndex, colCount);

        const row = worksheet.getRow(rowIndex);
        row.font = { bold: true };
        row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE7EEF7' },
        };

        const cell = row.getCell(1);
        cell.alignment = {
            vertical: 'middle',
        };
    });
};

export const handleExport = async (gridRef: any): Promise<void> => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const instance = gridRef.current.instance();
    const groupRows = new Set<number>();

    const { from } = await exportDataGrid({
        component: instance,
        worksheet,
        autoFilterEnabled: true,
        customizeCell: ({ gridCell, excelCell }) => {
            if (gridCell?.rowType === 'header') {
                excelCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1E3A5F' },
                };

                excelCell.font = {
                    bold: true,
                    color: { argb: 'FFFFFFFF' },
                };

                excelCell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                };
            }

            if (gridCell?.rowType === 'group') {
                const { value, column, groupIndex } = gridCell;
                groupRows.add(excelCell.row);

                if (value === undefined || value === null || value === '') {
                    excelCell.value = '';
                    return;
                }

                const row = worksheet.getRow(excelCell.row);

                if (groupIndex === 0) {
                    excelCell.value = `${column?.caption}: ${value}`;

                    row.font = { bold: true };
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE7EEF7' },
                    };
                } else {
                    excelCell.value = `${value}`;
                    row.font = { italic: true };
                    excelCell.alignment = {
                        indent: (groupIndex as number) + 1,
                        vertical: 'middle',
                    };
                }
            }
        },
    });

    mergeGroupRows(worksheet, groupRows);
    mergeIdenticalCells(worksheet, from?.row as number);
    applyRowAlternation(worksheet, from?.row as number, groupRows);

    const buffer = await workbook.xlsx.writeBuffer();

    // TODO Add datagrid name instead of export once title would be implemented
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `export_${today}.xlsx`);
};
