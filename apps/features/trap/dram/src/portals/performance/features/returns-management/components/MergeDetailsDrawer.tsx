import React, { useMemo } from 'react'
import { Badge, Card, Drawer, Row, Col, Space, Statistic, Tag, Table, Button, Tooltip } from 'antd'
import { ThunderboltOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { ErrorLogRow, ImportRow, MergeLogRow, Role } from '../lib/types'
import StatusTag from './StatusTag'
import { fmt, safeText } from '../lib/utils'
import { downloadFromUrl } from '../lib/utils'
import { URL_PERF_OVERLAY_CSV_FILE } from '../lib/services'

export default function MergeDetailsDrawer({ open, onClose, selectedMerge, errorLogs, imports }: {
  open: boolean;
  onClose: () => void;
  selectedMerge: MergeLogRow | null;
  errorLogs: ErrorLogRow[];
  imports: ImportRow[];
  role: Role;
  onPreviewCsv: (row: ImportRow) => void;
}) {
  const selectedErrors = useMemo(() => {
    if (!selectedMerge) return [];
    return errorLogs.filter(e => e.mergeLogId === selectedMerge.mergeLogId);
  }, [errorLogs, selectedMerge]);

  const relatedImports = useMemo(() => {
    if (!selectedMerge) return [];
    return imports.filter(i => i.fileName === selectedMerge.fileName);
  }, [imports, selectedMerge]);

  const importCols: ColumnsType<ImportRow> = [
    { title: 'Import ID', dataIndex: 'importId', width: 90 },
    { title: 'Portfolio', dataIndex: 'portfolio', width: 140 },
    { title: 'Begin', dataIndex: 'beginTrdDt', width: 110 },
    { title: 'End', dataIndex: 'endTrdDt', width: 110 },
    { title: 'Purpose', dataIndex: 'purpose', width: 130 },
    { title: 'Source', dataIndex: 'source', width: 100 },
    { title: 'Total Return', dataIndex: 'totalReturn', width: 130, render: (v) => (typeof v === 'number' ? v.toFixed(9) : v) },
    {
      title: 'CSV',
      key: 'csv',
      width: 110,
      render: (_, row) => (
        <Space>
          <Tooltip title="Download CSV">
            <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadFromUrl(`${URL_PERF_OVERLAY_CSV_FILE}?fileName=${encodeURIComponent(row.fileName)}`, row.fileName)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const errorCols: ColumnsType<ErrorLogRow> = [
    { title: 'Error ID', dataIndex: 'errorId', width: 100 },
    { title: 'Time (UTC)', dataIndex: 'errorTimeUtc', width: 190 },
    { title: 'Procedure', dataIndex: 'errorProcedure', width: 220, render: (v) => safeText(v) },
    { title: 'Line', dataIndex: 'errorLine', width: 80, render: (v) => fmt(v) },
    { title: 'Message', dataIndex: 'errorMessage', render: (v) => <span style={{ color: '#b91c1c' }}>{v}</span> },
  ];

  return (
    <Drawer
      open={open}
      width={980}
      onClose={onClose}
      title={
        <Space>
          <ThunderboltOutlined />
          Merge Details
          {selectedMerge && <Tag color="blue">#{selectedMerge.mergeLogId}</Tag>}
          {selectedMerge && <StatusTag status={selectedMerge.status} />}
        </Space>
      }
    >
      {selectedMerge ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card size="small" style={{ borderRadius: 16 }}>
            <Row gutter={[12, 12]}>
              <Col span={12}><Statistic title="File" value={selectedMerge.fileName} /></Col>
              <Col span={12}><Statistic title="Hash" value={safeText(selectedMerge.fileHashHex)} /></Col>
              <Col span={8}><Statistic title="Source Rows" value={fmt(selectedMerge.sourceRowCount)} /></Col>
              <Col span={8}><Statistic title="Inserted" value={fmt(selectedMerge.insertedCount)} /></Col>
              <Col span={8}><Statistic title="Updated" value={fmt(selectedMerge.updatedCount)} /></Col>
              <Col span={12}><Statistic title="Started (UTC)" value={safeText(selectedMerge.startedAtUtc)} /></Col>
              <Col span={12}><Statistic title="Completed (UTC)" value={safeText(selectedMerge.completedAtUtc)} /></Col>
            </Row>
            {selectedMerge.errorMessage && (
              <div style={{ marginTop: 12, color: '#b91c1c' }}>
                <strong>Error:</strong> {selectedMerge.errorMessage}
              </div>
            )}
          </Card>

          <Card size="small" style={{ borderRadius: 16 }} title={<Space>Related Import Rows <Badge count={relatedImports.length} size="small" /></Space>}>
            <Table rowKey="importId" size="small" columns={importCols} dataSource={relatedImports} pagination={{ pageSize: 8 }} scroll={{ x: 900 }} />
          </Card>

          <Card size="small" style={{ borderRadius: 16 }} title={<Space>Error Rows <Badge count={selectedErrors.length} size="small" /></Space>}>
            <Table rowKey="errorId" size="small" columns={errorCols} dataSource={selectedErrors} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
          </Card>
        </Space>
      ) : (
        <div>Pick a merge log row to view details.</div>
      )}
    </Drawer>
  );
}
