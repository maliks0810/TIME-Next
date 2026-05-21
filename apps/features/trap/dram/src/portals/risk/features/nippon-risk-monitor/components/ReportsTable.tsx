import { useMemo } from 'react';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { NipponReportsModel, NipponReportsRow } from '../lib/types';

type Row = NipponReportsRow & { key: string; typeLabel: 'Report' | 'Validation' };

export function ReportsTable({ model }: { model: NipponReportsModel }) {
  const dataSource = useMemo<Row[]>(
    () => model.reports.map((r, i) => ({
      ...r,
      key: String(i),
      typeLabel: r.isValidation ? 'Validation' : 'Report'
    })),
    [model.reports]
  );

  const columns = useMemo<ColumnsType<Row>>(
    () => [
      { title: 'File', dataIndex: 'fileName', key: 'fileName' },
      {
        title: 'Type',
        dataIndex: 'typeLabel',
        key: 'typeLabel',
        render: (t: Row['typeLabel']) => (t === 'Validation' ? <Tag color="orange">Validation</Tag> : <Tag color="blue">Report</Tag>)
      }
    ],
    []
  );

  return (
    <Card title={`Reports${model.folderName ? ` (${model.folderName})` : ''}`} size="small">
      <Table<Row> columns={columns} dataSource={dataSource} pagination={false} size="small" />
    </Card>
  );
}
