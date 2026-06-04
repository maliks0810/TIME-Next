import { Modal, Space, Spin, Tag, Button } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

export default function CsvPreviewModal({ open, title, loading, text, onClose }: {
  open: boolean;
  title: string;
  loading: boolean;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      title={
        <Space>
          <EyeOutlined />
          CSV Preview
          <Tag color="blue">{title}</Tag>
        </Space>
      }
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <Spin spinning={loading}>
        <div
          style={{
            background: '#0b1020',
            color: '#e5e7eb',
            padding: 12,
            borderRadius: 16,
            maxHeight: 520,
            overflow: 'auto',
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 12,
            whiteSpace: 'pre',
          }}
        >
          {text || '(empty)'}
        </div>
      </Spin>
    </Modal>
  );
}
