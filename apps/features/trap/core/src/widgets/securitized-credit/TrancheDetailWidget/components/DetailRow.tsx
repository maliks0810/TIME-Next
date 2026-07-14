import { useState } from 'react';
import clsx from 'clsx';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import styles from './TrancheDetailsComponents.module.scss';

export function DetailRow({
    label,
    value,
    mono,
    accent,
    copyable,
}: {
    label: string;
    value: string | null | undefined;
    mono?: boolean;
    accent?: boolean;
    copyable?: boolean;
}) {
    const { token } = theme.useToken();
    const [copied, setCopied] = useState(false);
    const [iconHovered, setIconHovered] = useState(false);

    const canCopy = copyable && value != null && value !== '—' && value !== '';

    const handleCopy = async () => {
        if (!canCopy) return;
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // Clipboard API unavailable (non-secure context) — silently no-op.
        }
    };

    return (
        <div className={styles.detailRowContainer}>
            <span className={styles.detailRowLabel}>
                {label}
            </span>

            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 0,
                }}
            >
                <span
                    className={clsx(styles.detailRowValue, {
                        [styles.fontFamilyMono]: mono,
                        [styles.detailRowValueAccent]: accent,
                    })}
                >
                    {value ?? '—'}
                </span>

                {canCopy && (
                    <CopyIcon
                        copied={copied}
                        hovered={iconHovered}
                        successColor={token.colorSuccess}
                        idleColor={token.colorTextTertiary}
                        hoverColor={token.colorPrimary}
                        label={label}
                        onCopy={handleCopy}
                        onEnter={() => setIconHovered(true)}
                        onLeave={() => setIconHovered(false)}
                    />
                )}
            </span>
        </div>
    );
}

function CopyIcon({
    copied,
    hovered,
    successColor,
    idleColor,
    hoverColor,
    label,
    onCopy,
    onEnter,
    onLeave,
}: {
    copied: boolean;
    hovered: boolean;
    successColor: string;
    idleColor: string;
    hoverColor: string;
    label: string;
    onCopy: () => void;
    onEnter: () => void;
    onLeave: () => void;
}) {
    const color = copied ? successColor : hovered ? hoverColor : idleColor;

    return (
        <span
            role="button"
            aria-label={`Copy ${label}`}
            title={copied ? 'Copied' : 'Copy'}
            onClick={onCopy}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 11,
                lineHeight: 1,
                width: 14,
                flexShrink: 0,
                color,
                transition: 'color 0.15s ease',
            }}
        >
            {copied ? <CheckOutlined /> : <CopyOutlined />}
        </span>
    );
}