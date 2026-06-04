import DataGrid, {
  Column,
  Paging,
  Pager,
  Sorting,
  Scrolling,
} from 'devextreme-react/data-grid';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import type { ImportRow, Persona, Role } from '../lib/types';
import { allow, RBAC } from '../lib/rbac';
import { downloadCsv, toCsv } from '../lib/csv';

export default function ImportTable({
  role,
  persona,
  rows,
}: {
  role: Role;
  persona: Persona;
  rows: ImportRow[];
}) {
  const showExtended = persona !== 'ClientService';
  const exportCols = [
    { key: 'importId', title: 'ImportId' },
    { key: 'fileName', title: 'FileName' },
    { key: 'portfolio', title: 'PORTFOLIO' },
    { key: 'beginTrdDt', title: 'BEGIN_TRR_DT' },
    { key: 'endTrdDt', title: 'END_TRR_DT' },
    { key: 'purpose', title: 'PURPOSE' },
    { key: 'source', title: 'SOURCE' },
    { key: 'totalReturn', title: 'TOTAL_RETURN' },
    { key: 'released', title: 'RELEASED' },
    { key: 'ingestedAtUtc', title: 'IngestedAtUtc' },
  ];

  return (
    <>
      {/* Toolbar */}
      <div style={{ marginBottom: 8, textAlign: 'right' }}>
        <Button
          icon={<DownloadOutlined />}
          disabled={!allow(role, RBAC.actions.exportCsv)}
          onClick={() => {
            const csv = toCsv(rows, exportCols);
            downloadCsv(
              csv,
              `import_data_${new Date().toISOString().slice(0, 10)}.csv`
            );
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* Grid */}
      <DataGrid
        dataSource={rows}
        keyExpr="importId"
        showBorders
        columnAutoWidth={false}
        wordWrapEnabled={false}
        height="50vh"
      >
        <Sorting mode="multiple" />
        <Paging defaultPageSize={20} />
        <Pager showPageSizeSelector />
        <Scrolling mode="virtual"
          rowRenderingMode="virtual"
          columnRenderingMode="virtual"
          showScrollbar="always"/>
        <Column
          dataField="importId"
          caption="Import ID"
          width={90}
          dataType="number"
        />

        <Column
          dataField="fileName"
          caption="File"
          minWidth={180}
        />

        {showExtended && (
          <Column
            dataField="uploadedBy"
            caption="Uploaded By"
            width={160}
            cellRender={({ value }) => value || '—'}
          />
        )}

        <Column
          dataField="portfolio"
          caption="Portfolio"
          width={140}
        />

        <Column dataField="beginTrdDt" caption="Begin" width={110} />
        <Column dataField="endTrdDt" caption="End" width={110} />

        <Column
          dataField="purpose"
          caption="Purpose"
          width={140}
        />

        <Column
          dataField="source"
          caption="Source"
          width={110}
        />

        <Column
          dataField="totalReturn"
          caption="Total Return"
          width={130}
          cellRender={({ value }) =>
            typeof value === 'number' ? value.toFixed(9) : value
          }
        />

        <Column
          dataField="released"
          caption="Released"
          width={90}
        />

        <Column
          dataField="ingestedAtUtc"
          caption="Ingested (UTC)"
          width={180}
        />
      </DataGrid>
    </>
  );
}