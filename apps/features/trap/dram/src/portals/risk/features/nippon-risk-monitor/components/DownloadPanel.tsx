import { Card, Button, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { NipponDownloadModel } from '../lib/types';

const { Text } = Typography;

export function DownloadPanel({ model }: { model: NipponDownloadModel }) {
  return (
    <Card title="Download Full Package" size="small">
      {model.url ? (
        <>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8, wordBreak: 'break-all' }}>
            {model.url}
          </Text>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => window.open(model.url, '_blank', 'noopener,noreferrer')}>
            Download ZIP
          </Button>
        </>
      ) : (
        <Text type="secondary">No download link available.</Text>
      )}
    </Card>
  );
}
