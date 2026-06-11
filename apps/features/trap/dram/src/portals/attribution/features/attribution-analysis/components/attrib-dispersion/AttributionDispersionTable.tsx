// DevExtreme
import DataGrid, {
  Column,
  DataGridTypes,
  Paging,
  Pager,
  Scrolling,
  HeaderFilter,
  SearchPanel,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { exportDataGrid } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

import 'devextreme/dist/css/dx.light.css';

import React from 'react';
import { formatTimestampLA } from './dramDateTime';
import { AttributionDispersionResponse } from '../../lib/types';

type Primitive = string | number | boolean | null;
type GridRow = Record<string, Primitive>;

function formatCellValue(v: Primitive | undefined) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return v;

  const abs = Math.abs(v);
  if (abs !== 0 && abs < 1) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function columnLabel(col: string) {
  return col.replaceAll('_', ' ');
}

function isNumeric(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

type Props = {
  data?: AttributionDispersionResponse;
};

export default function AttributionDispersionTable({ data }: Props) {
  const grids = data?.data.grids ?? [];
  const [activeGridIdx, setActiveGridIdx] = React.useState(0);
  const { page_title, value_date, grid_count, request_id ,timestamp} = data?.data.metadata ?? {};

  // reset active grid when a new response arrives
  React.useEffect(() => {
    setActiveGridIdx(0);
  }, [request_id, timestamp, value_date]);

  const activeGrid = grids[activeGridIdx];
  const rows: GridRow[] = React.useMemo(() => activeGrid?.rows ?? [], [activeGrid]);

  // union of keys across rows
  const columnsList = React.useMemo(() => {
    if (!rows.length) return [];
    const keySet = new Set<string>();
    for (const r of rows) Object.keys(r).forEach((k) => keySet.add(k));
    return Array.from(keySet);
  }, [rows]);

  // stable row keys
  const dataSource = React.useMemo(() => rows.map((r, idx) => ({ __key: idx, ...r })), [rows]);

  // infer type per column
  const colMeta = React.useMemo(() => {
    const map: Record<
      string,
      { dataType: 'string' | 'number' | 'boolean'; alignment: 'left' | 'right' }
    > = {};
    for (const c of columnsList) {
      const sample = rows
        .map((r) => r[c])
        .filter((v) => v !== null && v !== undefined)
        .slice(0, 25);

      const allNumbers = sample.length > 0 && sample.every((v) => isNumeric(v));
      const allBooleans = sample.length > 0 && sample.every((v) => typeof v === 'boolean');

      const dataType: 'string' | 'number' | 'boolean' =
        allNumbers ? 'number' : allBooleans ? 'boolean' : 'string';

      map[c] = { dataType, alignment: dataType === 'number' ? 'right' : 'left' };
    }
    return map;
  }, [columnsList, rows]);

  // -----------------------------
  // On-demand filtering (popup)
  // -----------------------------
  const gridWrapRef = React.useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // Formatting rules
  // -----------------------------
  const onCellPrepared = React.useCallback((e:  DataGridTypes.CellPreparedEvent) => {
    if (e?.rowType !== 'data') return;
    const val = e?.value;

    //  cell-level negative numeric formatting only
    if (typeof val === 'number' && Number.isFinite(val) && val < 0) {
      e.cellElement?.classList?.add('dispersion-cell-negative');
    }
  }, []);

  const onRowPrepared = React.useCallback(
    (e: DataGridTypes.RowPreparedEvent) => {
      if (e?.rowType !== 'data') return;

      const joined = columnsList
        .map((c) => e?.data?.[c])
        .filter((v) => typeof v === 'string')
        .join(' ')
        .toLowerCase();

      const looksLikeTotal = joined.includes('total') || joined.includes('subtotal');
      if (looksLikeTotal) e.rowElement?.classList?.add('dispersion-row-total');
    },
    [columnsList],
  );

const onToolbarPreparing = (e: DataGridTypes.ToolbarPreparingEvent) => {
        const columnChooserButton = {
        widget: 'dxButton',
              location: 'after',
              options: {
                  icon: 'eye',
                  text: 'Show/Hide Columns',
                  onClick: () => {
                    e.component.showColumnChooser();
                  }
          }
        };
        // export excel
        const exportButton = {
            widget: 'dxButton',
            location: 'after',
            options: {
                icon: 'export',
                text: 'Export',
                onClick: () => {
                    const now = new Date();
                    // export show look similar to UI with label and period
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('attrib_dispersion');
                    exportDataGrid({
                        component: e.component,
                        worksheet,
                        autoFilterEnabled: true,
                        topLeftCell: { row: 1, column: 1 }
                    }).then(() => {
                        worksheet.eachRow({ includeEmpty: true }, () => { });
                        workbook.xlsx.writeBuffer().then((buffer) => {
                            const fileName = `attribution_dispersion_${now.toISOString()}.xlsx`;
                            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
                        });
                    });
                }
            }
        };

        e.toolbarOptions?.items?.unshift(exportButton,columnChooserButton);
    };
  return (
    <div style={{ width: '100%' }}>
      {/* metadata */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{page_title ?? 'Report'}</h2>
        <div
          style={{
            color: '#666',
            fontSize: 13,
            marginTop: 8,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {value_date && (
            <span>
              <strong>Value Date:</strong> {value_date}
            </span>
          )}
          {timestamp && (
            <span>
            <strong>Timestamp:</strong>{" "}
               {timestamp ? formatTimestampLA(timestamp) : "—"}
            </span>
          )}
          {typeof grid_count === 'number' && (
            <span>
              <strong>Grids:</strong> {grid_count}
            </span>
          )}
          {request_id && (
            <span>
              <strong>Request ID:</strong> {request_id}
            </span>
          )}
        </div>
      </div>

      {/* grid selector */}
      {grids.length > 1 && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {grids.map((g, idx) => (
            <Button
              key={`${g.title}-${idx}`}
              text={g.title}
              type={idx === activeGridIdx ? 'default' : 'normal'}
              stylingMode={idx === activeGridIdx ? 'contained' : 'outlined'}
              onClick={() => setActiveGridIdx(idx)}
            />
          ))}
        </div>
      )}

      {!activeGrid ? (
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          No grids available.
        </div>
      ) : (
        <div ref={gridWrapRef}>
          <h3 style={{ margin: '8px 0' }}>{activeGrid.title}</h3>

          <DataGrid
            dataSource={dataSource}
            keyExpr="__key"
            showBorders
            hoverStateEnabled
            allowColumnResizing
            columnResizingMode="widget"
            height={650}
            onCellPrepared={onCellPrepared}
            onRowPrepared={onRowPrepared}
            onToolbarPreparing={onToolbarPreparing}
          >
            {/* Pagination controls */}
            <Paging defaultPageSize={50} />
            <Pager
              visible
              showPageSizeSelector
              allowedPageSizes={[25, 50, 100, 200]}
              showInfo
              showNavigationButtons
            />

            {/* Scrolling */}
            <Scrolling mode="virtual" useNative />
            <HeaderFilter visible />
            <SearchPanel visible highlightCaseSensitive={false} />
            {/* Dynamic columns */}
            {columnsList.map((c) => (
              <Column
                key={c}
                dataField={c}
                caption={columnLabel(c)}
                dataType={colMeta[c]?.dataType}
                alignment={colMeta[c]?.alignment}
                allowSorting
                customizeText={(cellInfo) => formatCellValue(cellInfo?.value as Primitive)}
              />
            ))}
          </DataGrid>

       </div>
      )}

      {/* styles */}
      <style>
        {`
          /* cell-level negative numeric formatting */
          .dispersion-cell-negative {
            color: #cf1322;
            font-weight: 500;
          }

          /* keep your total row formatting */
          .dispersion-row-total td {
            background: #f6ffed !important;
            font-weight: 600;
          }

          /* header layout */
          .hdr {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            width: 100%;
          }
          .hdr-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .hdr-filter-btn {
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 6px;
            width: 26px;
            height: 22px;
            line-height: 20px;
            cursor: pointer;
            color: #666;
          }
          .hdr-filter-btn:hover {
            border-color: #aaa;
          }
          .hdr-filter-btn.active {
            border-color: #1677ff;
            color: #1677ff;
            font-weight: 700;
          }
        `}
      </style>
    </div>
  );
}