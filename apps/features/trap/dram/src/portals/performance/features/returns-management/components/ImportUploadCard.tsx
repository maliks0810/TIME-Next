import React, { useState } from 'react'
import { Badge, Card, Col, Input, Row, Space, Table, Tag, Upload, message } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'
import { CheckCircleOutlined, CloseCircleOutlined, CloudUploadOutlined, InboxOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import type { ImportUploadResult, Persona, Role } from '../lib/types'
import { allow, RBAC } from '../lib/rbac'
import StatusTag from './StatusTag'

import { URL_PERF_OVERLAY_BULK_CSV_UPLOAD } from '../lib/services'
import { useUserInfo } from '@platform/utils'

export default function ImportUploadCard({ persona, role, uploading, onUpload }: {
  persona: Persona;
  role: Role;
  uploading: boolean;
  onUpload: (info: string) => void
}) {

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [userBy, setUserBy] = useState('');
  const [results, setResults] = useState<ImportUploadResult[]>([]);
  const userInfo = useUserInfo();

  const onChange = (info: UploadChangeParam<UploadFile>) => {
    const { file, fileList: nextList } = info;
    console.log(persona)
    if (file.status === 'uploading') {
      uploading = true;
      setFileList(nextList);
      return;
    }

    if (file.status === 'done') {
      uploading = false;

      const resp = file.response;
      const results = Array.isArray(resp) ? resp : [resp];

      // collect results globally if needed
      setResults(prev => [...results, ...prev]);

      // remove ONLY files with business success
      const keep = nextList.filter(f => {
        if (f.uid !== file.uid) return true;
        const r = Array.isArray(f.response) ? f.response[0] : f.response;
        return r?.status !== 'SUCCESS';
      });

      setFileList(keep);
      onUpload('done');
      return;
    }

    if (file.status === 'error') {
      uploading = false;
      setFileList(nextList);
      message.error(`${file.name} upload failed`);
    }
  };

const itemRender = (
  originNode: React.ReactElement,
  file: UploadFile
) => {
  const resp = file.response
    ? Array.isArray(file.response)
      ? file.response[0]
      : file.response
    : null;

  return (
    <div style={{ width: '100%' }}>
      {originNode}

      {/* Show backend response inline */}
      {file.status === 'done' && resp && (
        <div style={{ marginLeft: 28, marginTop: 6 }}>
          {resp.status === 'SUCCESS' ? (
            <div style={{ color: '#52c41a' }}>
              <CheckCircleOutlined /> Imported {resp.rows ?? 0} rows
            </div>
          ) : (
            <div style={{ color: '#ff4d4f' }}>
              <CloseCircleOutlined /> {resp.error || 'Import failed'}
            </div>
          )}
        </div>
      )}

      {/*  Upload-level failure */}
      {file.status === 'error' && (
        <div style={{ marginLeft: 28, color: '#ff4d4f' }}>
          Upload failed
        </div>
      )}
    </div>
  );
};

  return (
    <Card
      size="small"
      style={{ borderRadius: 16 }}
      title={
        <Space>
          <CloudUploadOutlined />
          Import CSV
          <Tag color="blue">PORTFOLIO, BEGIN_TRR_DT, END_TRR_DT, PURPOSE, SOURCE, TOTAL_RETURN, RELEASED</Tag>
        </Space>
      }
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={10}>

            <Upload.Dragger
              accept=".csv,text/csv"
              multiple={false}
              name="files"
              action={`${URL_PERF_OVERLAY_BULK_CSV_UPLOAD}?user=${encodeURIComponent(
                userInfo?.name ?? ''
              )}`}
              fileList={fileList}
              showUploadList
              onChange={onChange}
              itemRender={itemRender}
              disabled={!allow(role, RBAC.actions.importUpload) || uploading}
              style={{ borderRadius: 16 }}
            >
            <p >
              <InboxOutlined />
             </p>
              <p >
                Click or drag file(s) to this area to import
              </p>
              <p >
                Accepted formats: .csv
              </p>
            </Upload.Dragger>

        </Col>
        <Col xs={24} md={14}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              value={userBy}
              onChange={(e) => setUserBy(e.target.value)}
              placeholder="userBy (audit)"
              prefix={<SafetyCertificateOutlined />}
              disabled={!allow(role, RBAC.actions.importUpload) || uploading}
            />

            {results.length > 0 && (
              <Card size="small" style={{ borderRadius: 16 }} title={<Space>Latest Import Results <Badge count={results.length} size="small" /></Space>}>
                <Table
                  rowKey={(r) => r.file}
                  size="small"
                  pagination={{ pageSize: 5 }}
                  dataSource={results}
                  columns={[
                    { title: 'File', dataIndex: 'file' },
                    { title: 'Status', dataIndex: 'status', render: (v) => <StatusTag status={v} /> },
                    { title: 'Rows', dataIndex: 'rows' },
                    { title: 'Message', render: (_, r) => (r.status === 'FAILED' ? <span style={{ color: '#b91c1c' }}>{r.error}</span> : '—') },
                  ]}
                />
              </Card>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
