/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo } from 'react';
import { Button, Table, theme } from 'antd';
import { DownloadOutlined, TableOutlined } from '@ant-design/icons';
import { Workbook } from 'exceljs';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import { useWidgetPixels } from '../../../components/widget-shell/WidgetSizeContext';
import type { WidgetComponentProps } from '../../../types/widget';
import { useGetWidgetValue, useGetWidgetValueArray } from '../../../state/Widgets/hooks';
import { DEAL_NAME_KEY, COLLATERAL_FILTER_KEYS } from '../../constants';
import clsx from 'clsx';
import styles from './TableWidget.module.scss';

type TableColumnMeta = {
    key: string;
    title: string;
    numeric?: boolean;
    width?: number;
    format?: string;
    fixed?: 'left' | 'right';
};

interface TableResult {
    eyebrow?: string;
    columns?: TableColumnMeta[];
    rows?: Array<Record<string, any>>;
    rowKeyField?: string | null;
    totalCount?: number;
    note?: string;
}

function formatCell(value: any, format?: string): any {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value !== 'number') return value;

    switch (format) {
        case 'currency':
            return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        case 'percent':
            return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
        case 'integer':
            return Math.round(value).toLocaleString();
        case 'percent2':
            return `${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}%`;
        case 'year':
            return value.toLocaleString(undefined, {
                useGrouping: false,
                maximumFractionDigits: 0,
            });
        default:
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
}

async function exportToXlsx(
    columns: TableColumnMeta[],
    rows: Array<Record<string, any>>,
    fileName: string,
): Promise<void> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Data');

    sheet.columns = columns.map((column) => ({
        header: column.title,
        key: column.key,
        width: 18,
    }));

    for (const row of rows) {
        sheet.addRow(row);
    }

    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

type TableViewProps = {
    cols: TableColumnMeta[];
    rows: Array<Record<string, any>>;
    rowKeyField: string | null;
    eyebrow: string;
    note?: string;
    showTitle: boolean;
    exportEnabled: boolean;
    exportFileName: string;
    density: string;
    rowHover: boolean;
    zebra: boolean;
};

/**
 * Rendered INSIDE WidgetCardShell so it can read the shell's live pixel height
 * (useWidgetPixels) and give the virtual table an explicit scroll.y that tracks
 * the widget as it is resized.
 */
function TableView(props: TableViewProps) {
    const {
        cols, rows, rowKeyField, eyebrow, note,
        showTitle, exportEnabled, exportFileName, density, rowHover, zebra,
    } = props;

    const { token } = theme.useToken();
    const { heightPx } = useWidgetPixels();

    const antdColumns = useMemo(
        () =>
            cols.map((column) => ({
                title: column.title,
                dataIndex: column.key,
                key: column.key,
                width: column.width ?? (column.numeric ? 120 : 150),
                align: (column.numeric ? 'right' : 'left') as 'right' | 'left',
                ellipsis: true,
                fixed: column.fixed,
                render: (value: any) => formatCell(value, column.format),
            })),
        [cols],
    );

    const scrollX = useMemo(
        () => antdColumns.reduce((sum, column) => sum + (column.width ?? 140), 0),
        [antdColumns],
    );

    const dataSource = useMemo(() => {
        if (rowKeyField) return rows;
        return rows.map((row, index) => ({ ...row, __rk: index }));
    }, [rows, rowKeyField]);
    const rowKey = rowKeyField ?? '__rk';

    const onExport = useCallback(() => {
        void exportToXlsx(cols, rows, exportFileName);
    }, [cols, rows, exportFileName]);

    // heightPx is the card's content area; subtract this widget's title row and
    // the table's own header so the virtual body fills to the bottom.
    const titleRowH = showTitle || exportEnabled ? 34 : 0;
    const tableHeaderH = density === 'compact' ? 28 : 38;
    const scrollY = Math.max(80, heightPx - titleRowH - tableHeaderH);

    return (
        <div className={styles.fill}>
            <div className={styles.container}>
                {(showTitle || exportEnabled) && (
                    <div className={styles.header}>
                        {showTitle ? (
                            <div className={styles.titleWrap}>
                                <TableOutlined className={styles.icon} />
                                <span className={styles.eyebrow}>{eyebrow}</span>
                                {rows.length > 0 && (
                                    <span className={styles.count}>
                                        {rows.length.toLocaleString()} rows
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span />
                        )}

                        {exportEnabled && (
                            <Button
                                size="small"
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={onExport}
                                disabled={rows.length === 0}
                            >
                                Export
                            </Button>
                        )}
                    </div>
                )}

                <div
                    className={clsx(
                        styles.body,
                        density === 'compact' && styles.dense,
                        rowHover && styles.hoverable,
                    )}
                >
                    {cols.length === 0 ? (
                        <div className={styles.empty}>{note ?? 'No data'}</div>
                    ) : (
                        <Table
                            virtual
                            size="small"
                            columns={antdColumns as any}
                            dataSource={dataSource}
                            rowKey={rowKey}
                            rowClassName={
                                zebra
                                    ? (_record: any, index: number) =>
                                        index % 2 === 1 ? styles.zebraRow : ''
                                    : undefined
                            }
                            pagination={false}
                            scroll={{ x: scrollX, y: scrollY }}
                            style={{ background: token.colorBgContainer }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export function TableWidget(props: WidgetComponentProps) {
    const { result, loading, error, execute, widgetInstance, widgetDefinition, mode } = props;

    const config = widgetInstance?.config ?? {};
    const params = config?.params ?? {};
    const properties = widgetDefinition?.configSchema?.properties ?? {};
    const propDefault = (key: string) => (properties as any)?.[key]?.['default'];

    const showTitle =
        typeof params['showTitle'] === 'boolean'
            ? params['showTitle']
            : typeof propDefault('showTitle') === 'boolean'
                ? Boolean(propDefault('showTitle'))
                : true;
    const titleOverride =
        String(params['titleText'] ?? propDefault('titleText') ?? '').trim() || null;
    const exportEnabled =
        typeof params['exportEnabled'] === 'boolean'
            ? params['exportEnabled']
            : typeof propDefault('exportEnabled') === 'boolean'
                ? Boolean(propDefault('exportEnabled'))
                : true;
    const exportFileName = String(params['exportFileName'] ?? propDefault('exportFileName') ?? 'loan-tape');
    const density = String(params['density'] ?? propDefault('density') ?? 'compact');
    const rowHover =
        typeof params['rowHover'] === 'boolean'
            ? params['rowHover']
            : typeof propDefault('rowHover') === 'boolean'
                ? Boolean(propDefault('rowHover'))
                : true;
    const zebra =
        typeof params['zebra'] === 'boolean'
            ? params['zebra']
            : typeof propDefault('zebra') === 'boolean'
                ? Boolean(propDefault('zebra'))
                : false;

    // ── Context + filter binding (LISTEN ONLY — the table never emits) ──
    const channelId = params.channel;
    const contextKey: string = params.contextKey ?? DEAL_NAME_KEY;
    const contextValue = useGetWidgetValue({ channelId, key: contextKey });

    const listenKeys: string[] = Array.isArray(params.listensToKeys) && params.listensToKeys.length
        ? params.listensToKeys.map(String)
        : COLLATERAL_FILTER_KEYS;

    const filterBag = useGetWidgetValueArray({ channelId, keys: listenKeys }) as Record<string, any>;

    const filters = useMemo<Record<string, any>>(() => {
        const out: Record<string, any> = {};
        for (const fullKey of listenKeys) {
            const value = filterBag[fullKey];
            if (value !== null && value !== undefined && value !== '') {
                out[fullKey.replace(/^filter\./, '')] = value;
            }
        }
        return out;
    }, [filterBag, listenKeys.join(',')]);

    const filtersSig = JSON.stringify(filters);

    useEffect(() => {
        if (mode === 'preview') return;
        if (contextValue == null || contextValue === '') return;

        const executeContext: Record<string, any> = { contextKey, contextValue, filters, ...filters };
        executeContext[contextKey] = contextValue;
        execute?.(executeContext);
        // Intentionally exclude execute from deps to avoid re-execute loops.
    }, [contextKey, contextValue, mode, filtersSig]);

    const data = (result as TableResult | undefined) ?? null;
    const cols = data?.columns ?? [];
    const rows = data?.rows ?? [];
    const rowKeyField = data?.rowKeyField ?? null;
    const eyebrow = titleOverride ?? data?.eyebrow ?? 'Loan Tape';

    if (loading) {
        return (
            <WidgetCardShell overflow="hidden">
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    if (error) {
        return (
            <WidgetCardShell overflow="hidden">
                <WidgetErrorState message={error} />
            </WidgetCardShell>
        );
    }

    return (
        <WidgetCardShell overflow="hidden">
            <TableView
                cols={cols}
                rows={rows}
                rowKeyField={rowKeyField}
                eyebrow={eyebrow}
                note={data?.note}
                showTitle={showTitle}
                exportEnabled={exportEnabled}
                exportFileName={exportFileName}
                density={density}
                rowHover={rowHover}
                zebra={zebra}
            />
        </WidgetCardShell>
    );
}

export default TableWidget;