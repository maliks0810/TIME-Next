/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { Typography } from 'antd';

export default function JsonViewer({ value, maxHeight }: { value: any; maxHeight?: number }) {
    const text = React.useMemo(() => {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }, [value]);
    return (
        <pre
            style={{
                margin: 0,
                padding: 12,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                maxHeight: maxHeight ?? 360,
                overflow: 'auto',
                fontSize: 12,
                lineHeight: 1.35,
            }}
        >
            <Typography.Text style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</Typography.Text>
        </pre>
    );
}
