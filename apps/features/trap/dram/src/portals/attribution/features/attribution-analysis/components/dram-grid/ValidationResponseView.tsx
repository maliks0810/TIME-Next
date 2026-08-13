import React, { useMemo } from 'react';
import {
  Alert,
  Card,
  Descriptions,
  Empty,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  NumberOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Paragraph } = Typography;

/* ------------------------------------------------------------------ */
/* Types – mirror the API response shape                               */
/* ------------------------------------------------------------------ */

export interface ValidationMetadata {
  page_title: string;
  value_date: string | null;
  grid_count: number;
  request_id: string | null;
  timestamp: string | null;
}

export interface ValidationResponse {
  message: string;
  data: {
    metadata: ValidationMetadata;
    grids: unknown[];
  };
}

export interface ValidationResponseViewProps {
  /** The raw response object returned by the API. */
  response: ValidationResponse;
  /** Optional card title override. */
  title?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

interface ParsedFailure {
  key: string;
  date: string;
  value: string;
}

/** Decode HTML entities (e.g. &lt;&gt; -> <>) safely in the browser. */
function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  if (typeof document === 'undefined') {
    // SSR fallback for the common entities in this payload.
    return input
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  const el = document.createElement('textarea');
  el.innerHTML = input;
  return el.value;
}

/** Format an ISO timestamp into a readable local string. */
function formatTimestamp(ts: string | null): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString();
}

/**
 * Split the decoded page_title into a human header line and the
 * per-date validation failure rows.
 *
 * Expected line shape:
 *   "BM weight <> 100% on 2026-07-01: 0.0000"
 */
function parsePageTitle(rawTitle: string): {
  header: string;
  failures: ParsedFailure[];
} {
  const decoded = decodeHtmlEntities(rawTitle ?? '');
  const lines = decoded
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const failures: ParsedFailure[] = [];
  const headerParts: string[] = [];

  const lineRe = /on\s+(\d{4}-\d{2}-\d{2})\s*:\s*([-\d.]+)\s*$/i;

  lines.forEach((line, idx) => {
    const m = line.match(lineRe);
    if (m) {
      failures.push({ key: `${m[1]}-${idx}`, date: m[1], value: m[2] });
    } else {
      headerParts.push(line);
    }
  });

  return {
    header: headerParts.join(' ') || 'Validation failed',
    failures,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const ValidationResponseView: React.FC<ValidationResponseViewProps> = ({
  response,
  title = 'Validation Result',
}) => {
  const metadata = response?.data?.metadata;
  const grids = response?.data?.grids ?? [];

  const { header, failures } = useMemo(
    () => parsePageTitle(metadata?.page_title ?? ''),
    [metadata?.page_title]
  );

  const isError =
    (response?.message ?? '').toLowerCase() === 'error' || failures.length > 0;

  const columns: ColumnsType<ParsedFailure> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 160,
      sorter: (a, b) => a.date.localeCompare(b.date),
      defaultSortOrder: 'ascend',
      render: (d: string) => (
        <Space size={6}>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text strong>{d}</Text>
        </Space>
      ),
    },
    {
      title: 'Rule',
      key: 'rule',
      render: () => <Text type="secondary">BM weight ≠ 100%</Text>,
    },
    {
      title: 'BM Weight',
      dataIndex: 'value',
      key: 'value',
      width: 140,
      align: 'right',
      render: (v: string) => <Tag color="error">{v}</Tag>,
    },
  ];

  return (
    <Card
      title={title}
      size="small"
      styles={{ header: { fontWeight: 600 } }}
      style={{ maxWidth: 720 }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Top-level status banner */}
        <Alert
          type={isError ? 'error' : 'success'}
          showIcon
          icon={isError ? <CloseCircleOutlined /> : undefined}
          message={
            <Space>
              <Text strong>{response?.message ?? 'Unknown'}</Text>
              {failures.length > 0 && (
                <Tag color="error">{failures.length} failed check(s)</Tag>
              )}
            </Space>
          }
          description={header}
        />

        {/* Metadata */}
        <Descriptions
          size="small"
          column={1}
          bordered
          styles={{ label: { width: 140 } }}
        >
          <Descriptions.Item
            label={
              <Space size={6}>
                <CalendarOutlined /> Value Date
              </Space>
            }
          >
            {metadata?.value_date ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space size={6}>
                <NumberOutlined /> Grid Count
              </Space>
            }
          >
            {metadata?.grid_count ?? 0}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space size={6}>
                <TagsOutlined /> Request ID
              </Space>
            }
          >
            {metadata?.request_id ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space size={6}>
                <ClockCircleOutlined /> Timestamp
              </Space>
            }
          >
            {formatTimestamp(metadata?.timestamp ?? null)}
          </Descriptions.Item>
        </Descriptions>

        {/* Validation failures table */}
        {failures.length > 0 && (
          <div>
            <Paragraph strong style={{ marginBottom: 8 }}>
              Failed Benchmark Weight Checks
            </Paragraph>
            <Table<ParsedFailure>
              size="small"
              columns={columns}
              dataSource={failures}
              pagination={
                failures.length > 10 ? { pageSize: 10, showSizeChanger: false } : false
              }
              scroll={{ y: 320 }}
            />
          </div>
        )}

        {/* Grids empty state */}
        {grids.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No grids were returned for this request"
          />
        )}
      </Space>
    </Card>
  );
};

export default ValidationResponseView;

/* ------------------------------------------------------------------ */
/* Example usage                                                       */
/* ------------------------------------------------------------------ */
//
// import ValidationResponseView, { ValidationResponse } from './ValidationResponseView';
//
// const apiResponse: ValidationResponse = { message: 'Error', data: { ... } };
//
// <ValidationResponseView response={apiResponse} />
