import React, { useState } from 'react'
import { Card, Col,  Row, Space,  Tag, Upload, message } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'
import { CheckCircleOutlined, CloseCircleOutlined, CloudUploadOutlined, InboxOutlined, SafetyCertificateOutlined } from '@ant-design/icons'


import { useUserInfo } from '@platform/utils'

export default function UploadCard({ uploading, onUpload, destinationLink,formatMessage,importTitle }: {
  uploading: boolean;
  onUpload: (info: string) => void;
  destinationLink: string;
  formatMessage: string;
  importTitle: string;
}) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const userInfo = useUserInfo();

  const onChange = (info: UploadChangeParam<UploadFile>) => {
	const { file, fileList: nextList } = info;
	if (file.status === 'uploading') {
	  uploading = true;
	  setFileList(nextList);
	  return;
	}

	if (file.status === 'done') {
	  uploading = false;

	  const resp = file.response;
	  const results = Array.isArray(resp) ? resp : [resp];
		console.log(results);
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
			{importTitle} <SafetyCertificateOutlined />Current User: {userInfo?.name }
			<Tag color="blue">{formatMessage}</Tag>
		</Space>}
	>
	  <Row align="middle">
		<Col xs={24} md={10}>
			<Upload.Dragger
			  accept=".csv,text/csv"
			  multiple={true}
			  name="files"
			  action={`${destinationLink}?user=${encodeURIComponent(
				userInfo?.name ?? ''
			  )}`}
			  fileList={fileList}
			  showUploadList
			  onChange={onChange}
			  itemRender={itemRender}
			  disabled={uploading}
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
	  </Row>
	</Card>
  );
}
