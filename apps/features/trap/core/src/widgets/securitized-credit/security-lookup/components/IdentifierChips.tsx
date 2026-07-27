import { useState } from 'react';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import type { SearchResult } from '../types';

type Props = { security: SearchResult; wrap?: boolean };

const Chip = ({ label, value }: { label: string; value: string | null | undefined }) => {
    const { token } = theme.useToken();
    const [copied, setCopied] = useState(false);
    const [hover, setHover] = useState(false);
    if (!value) return null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { /* non-secure context */ }
    };

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                borderRadius: token.borderRadius,
                background: token.colorFillTertiary,
                minWidth: 0,
            }}
        >
            <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: token.colorTextTertiary,
                flexShrink: 0,
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: token.colorText,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
            }}>
                {value}
            </span>
            <span
                role="button"
                aria-label={`Copy ${label}`}
                onClick={copy}
                style={{
                    display: 'inline-flex',
                    cursor: 'pointer',
                    fontSize: 11,
                    flexShrink: 0,
                    color: copied ? token.colorSuccess : hover ? token.colorPrimary : token.colorTextQuaternary,
                    transition: 'color 0.15s ease',
                }}
            >
                {copied ? <CheckOutlined /> : <CopyOutlined />}
            </span>
        </div>
    );
};

export const IdentifierChips = ({ security, wrap }: Props) => (
    <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 6, minWidth: 0 }}>
        <Chip label="CUSIP" value={security.cusip} />
        <Chip label="ISIN" value={security.isin} />
        <Chip label="FIGI" value={security.figi} />
    </div>
);