import { Button, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DownloadOutlined } from '@ant-design/icons'
import type { RecomputeResultRow, Role } from '../lib/types'
import StatusTag from './StatusTag'
import { allow, RBAC } from '../lib/rbac'
import { msToHuman, safeText } from '../lib/utils'
import { downloadCsv, toCsv } from '../lib/csv'

export default function RecomputeResultsTable({ role, rows }: { role: Role; rows: RecomputeResultRow[] }) {
  const columns: ColumnsType<RecomputeResultRow> = [
    { title: 'Portfolio', dataIndex: 'portfolio', width: 160 },
    { title: 'As Of', dataIndex: 'asOfDate', width: 120 },
    { title: 'Period', dataIndex: 'period', width: 120 },
    { title: 'Extended Return', dataIndex: 'extendedReturn', width: 160, render: (v) => (typeof v === 'number' ? v.toFixed(9) : v) },
    { title: 'Benchmark', dataIndex: 'benchmarkReturn', width: 140, render: (v) => (typeof v === 'number' ? v.toFixed(9) : '—') },
    { title: 'Alpha', dataIndex: 'alpha', width: 120, render: (v) => (typeof v === 'number' ? v.toFixed(9) : '—') },
    { title: 'Status', dataIndex: 'status', width: 120, render: (v) => <StatusTag status={v} /> },
    { title: 'Recomputed (UTC)', dataIndex: 'recomputedAtUtc', width: 190 },
    { title: 'Duration', dataIndex: 'durationMs', width: 120, render: (v) => msToHuman(v) },
    { title: 'Notes', dataIndex: 'notes', ellipsis: true, render: (v) => safeText(v) },
  ];

  const exportCols = [
    { key: 'portfolio', title: 'Portfolio' },
    { key: 'asOfDate', title: 'AsOfDate' },
    { key: 'period', title: 'Period' },
    { key: 'extendedReturn', title: 'ExtendedReturn' },
    { key: 'benchmarkReturn', title: 'BenchmarkReturn' },
    { key: 'alpha', title: 'Alpha' },
    { key: 'status', title: 'Status' },
    { key: 'recomputedAtUtc', title: 'RecomputedAtUtc' },
    { key: 'durationMs', title: 'DurationMs' },
    { key: 'notes', title: 'Notes' },
  ];

  return (
    <>
      <div style={{ marginBottom: 8, textAlign: 'right' }}>
        <Button
          icon={<DownloadOutlined />}
          disabled={!allow(role, RBAC.actions.exportCsv)}
          onClick={() => downloadCsv(toCsv(rows, exportCols), `recompute_results_${new Date().toISOString().slice(0,10)}.csv`)}
        >
          Export CSV
        </Button>
      </div>
      <Table
        rowKey={(r) => `${r.portfolio}-${r.asOfDate}-${r.period}`}
        columns={columns}
        dataSource={rows}
        size="small"
        scroll={{ x: 1500 }}
        pagination={{ pageSize: 20 }}
      />
    </>
  );
}
