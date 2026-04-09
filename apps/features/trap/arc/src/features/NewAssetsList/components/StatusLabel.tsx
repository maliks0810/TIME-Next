import { Badge } from 'antd';

export const StatusLabel = ({ label, count }: { label: string; count: number }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span>
            <Badge count={count} color="#06b6d4" />
        </span>
    </div>
);
