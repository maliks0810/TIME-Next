import { Tag } from 'antd'

export default function StatusTag({ status }: { status: string }) {
  const color = status === 'SUCCESS' ? 'green' : status === 'FAILED' ? 'red' : status === 'SKIPPED' ? 'gold' : 'blue';
  return <Tag color={color}>{status}</Tag>;
}
