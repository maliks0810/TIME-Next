import { Button, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DownloadOutlined } from '@ant-design/icons'
import type { ErrorLogRow, Role } from '../lib/types'
import { allow, RBAC } from '../lib/rbac'
import { fmt, safeText } from '../lib/utils'
import { downloadCsv, toCsv } from '../lib/csv'

export default function ErrorLogTable({ role, rows }: { role: Role; rows: ErrorLogRow[] }) {
  const columns: ColumnsType<ErrorLogRow> = [
    { title: 'Error ID', dataIndex: 'errorId', width: 100 },
    { title: 'Merge Log ID', dataIndex: 'mergeLogId', width: 120 },
    { title: 'Time (UTC)', dataIndex: 'errorTimeUtc', width: 190 },
    { title: 'Procedure', dataIndex: 'errorProcedure', width: 220, render: (v) => safeText(v) },
    { title: 'Line', dataIndex: 'errorLine', width: 80, render: (v) => fmt(v) },
    { title: 'Message', dataIndex: 'errorMessage', render: (v) => <span style={{ color: '#b91c1c' }}>{v}</span> },
  ];

  const exportCols = [
    { key: 'errorId', title: 'ErrorId' },
    { key: 'mergeLogId', title: 'MergeLogId' },
    { key: 'errorTimeUtc', title: 'ErrorTimeUtc' },
    { key: 'errorNumber', title: 'ErrorNumber' },
    { key: 'errorSeverity', title: 'ErrorSeverity' },
    { key: 'errorState', title: 'ErrorState' },
    { key: 'errorProcedure', title: 'ErrorProcedure' },
    { key: 'errorLine', title: 'ErrorLine' },
    { key: 'errorMessage', title: 'ErrorMessage' },
  ];

  return (
    <>
      <div style={{ marginBottom: 8, textAlign: 'right' }}>
        <Button
          icon={<DownloadOutlined />}
          disabled={!allow(role, RBAC.actions.exportCsv)}
          onClick={() => downloadCsv(toCsv(rows, exportCols), `error_log_${new Date().toISOString().slice(0,10)}.csv`)}
        >
          Export CSV
        </Button>
      </div>
      <Table
        rowKey="errorId"
        columns={columns}
        dataSource={rows}
        size="small"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 20 }}
      />
    </>
  );
}
