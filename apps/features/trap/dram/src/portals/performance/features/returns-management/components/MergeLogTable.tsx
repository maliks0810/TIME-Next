import React, { useMemo } from 'react'
import { Badge, Button, Space, Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DownloadOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { MergeLogRow, Persona, Role } from '../lib/types'
import StatusTag from './StatusTag'
import { allow, RBAC } from '../lib/rbac'
import { msToHuman, tryIsoDiffMs } from '../lib/utils'
import { downloadCsv, toCsv } from '../lib/csv'

export default function MergeLogTable({ role, persona, rows, onDrill }: {
  role: Role;
  persona: Persona;
  rows: MergeLogRow[];
  onDrill: (row: MergeLogRow) => void;
}) {
  const columns = useMemo((): ColumnsType<MergeLogRow> => {
    const cols: ColumnsType<MergeLogRow> = [
      { title: 'Merge Log ID', dataIndex: 'mergeLogId', width: 120, sorter: (a, b) => a.mergeLogId - b.mergeLogId },
      { title: 'File', dataIndex: 'fileName', ellipsis: true },
      { title: 'Started', dataIndex: 'startedAtUtc', width: 190 },
      { title: 'Completed', dataIndex: 'completedAtUtc', width: 190 },
      { title: 'Duration', key: 'duration', width: 120, render: (_, r) => msToHuman(tryIsoDiffMs(r.startedAtUtc, r.completedAtUtc)) },
      { title: 'Status', dataIndex: 'status', width: 120, render: (v) => <StatusTag status={v} /> },
      { title: 'Inserted', dataIndex: 'insertedCount', width: 100 },
      { title: 'Updated', dataIndex: 'updatedCount', width: 100 },
      { title: 'No Change', dataIndex: 'noChangeCount', width: 110 },
      { title: 'Short-circuit', dataIndex: 'isShortCircuited', width: 130, render: (v) => (v ? <Tag color="gold">Yes</Tag> : <Tag>—</Tag>) },
      {
        title: 'Drill',
        key: 'drill',
        width: 90,
        fixed: 'right',
        render: (_, row) => (
          <Tooltip title="View details / related imports & errors">
            <Button size="small" icon={<ThunderboltOutlined />} onClick={() => onDrill(row)} />
          </Tooltip>
        ),
      },
    ];

    // Persona-specific: ClientService should not see hashes
    if (persona !== 'ClientService') {
      cols.splice(2, 0, { title: 'Hash', dataIndex: 'fileHashHex', width: 220, render: (v) => v || '—' });
    }

    // Engineering can see errorMessage column directly
    if (role === 'R2-Developer-ReadWrite') {
      cols.splice(cols.length - 1, 0, { title: 'Error', dataIndex: 'errorMessage', ellipsis: true });
    }

    return cols;
  }, [persona, role, onDrill]);

  const exportCols = [
    { key: 'mergeLogId', title: 'MergeLogId' },
    { key: 'fileName', title: 'FileName' },
    { key: 'fileHashHex', title: 'FileHashHex' },
    { key: 'startedAtUtc', title: 'StartedAtUtc' },
    { key: 'completedAtUtc', title: 'CompletedAtUtc' },
    { key: 'sourceRowCount', title: 'SourceRowCount' },
    { key: 'insertedCount', title: 'InsertedCount' },
    { key: 'updatedCount', title: 'UpdatedCount' },
    { key: 'noChangeCount', title: 'NoChangeCount' },
    { key: 'status', title: 'Status' },
    { key: 'isShortCircuited', title: 'IsShortCircuited' },
    { key: 'errorMessage', title: 'ErrorMessage' },
  ];

  return (
    <>
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Badge count={rows.length} showZero />
        </Space>
        <Button
          icon={<DownloadOutlined />}
          disabled={!allow(role, RBAC.actions.exportCsv)}
          onClick={() => downloadCsv(toCsv(rows, exportCols), `merge_log_${new Date().toISOString().slice(0,10)}.csv`)}
        >
          Export CSV
        </Button>
      </div>

      <Table
        rowKey="mergeLogId"
        columns={columns}
        dataSource={rows}
        size="small"
        scroll={{ x: 1800 }}
        pagination={{ pageSize: 20 }}
        onRow={(record) => ({ onDoubleClick: () => onDrill(record) })}
      />
    </>
  );
}
