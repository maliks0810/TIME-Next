import { useState, useCallback } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type { SearchResult } from '../types';
import { assetTypeColor } from '../utils';
import styles from './SecurityInfo.module.scss';

/* Name + asset-class badge — the hero identity.
   Name sits on its own line (full width, ellipsis only if truly long); the
   asset-class chip sits BELOW it as a sub-label, so the two never compete for
   horizontal space and the deal name is never covered by the chip. */
export const IdentityBadge = ({ security }: { security: SearchResult }) => (
    <div className={styles.identity}>
        <span className={styles.name} title={security.name}>
            {security.name}
        </span>
        {security.assetType && (
            <Tag color={assetTypeColor(security.assetType)} className={styles.assetTag}>
                {security.assetType}
            </Tag>
        )}
    </div>
);

const CopyField = ({ label, value }: { label: string; value: string | null | undefined }) => {
    const [copied, setCopied] = useState(false);
    const onCopy = useCallback(async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1100);
        } catch { /* non-secure ctx */ }
    }, [value]);
    if (!value) return null;
    return (
        <div
            className={`${styles.field} ${copied ? styles.fieldCopied : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`Copy ${label}`}
            onClick={onCopy}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCopy()}
        >
            <span className={styles.fieldLabel}>{label}</span>
            <span className={styles.fieldValueRow}>
                <span className={styles.fieldValue}>{value}</span>
                <span className={styles.copyHint}>
                    {copied ? <CheckOutlined /> : '⧉'}
                </span>
            </span>
        </div>
    );
};

/* Identifier fields — label stacked OVER value, flowing in a responsive row. */
export const IdentifierLine = ({
    security,
    showMore = false,
}: {
    security: SearchResult;
    showMore?: boolean;
}) => (
    <div className={styles.fields}>
        <CopyField label="CUSIP" value={security.cusip} />
        <CopyField label="ISIN" value={security.isin} />
        <CopyField label="FIGI" value={security.figi} />
        {showMore && <CopyField label="Aladdin" value={security.aladdinId} />}
    </div>
);