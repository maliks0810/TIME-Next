import { useCallback, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import type { SearchResult } from '../types';
import { assetTypeColor } from '../utils';
import styles from './SecurityInfo.module.scss';

type WealthClasses = {
    wealth: boolean;
    wealthLight: boolean;
    wealthDark: boolean;
};

function useWealthClasses(): WealthClasses {
    const { themeName } = useTheme();

    return {
        wealth:
            themeName === 'wealthLight' ||
            themeName === 'wealthDark',
        wealthLight: themeName === 'wealthLight',
        wealthDark: themeName === 'wealthDark',
    };
}

/**
 * Name and asset-class badge.
 *
 * The security name has its own line so the asset-class badge never competes
 * with or covers the primary identity.
 */
export const IdentityBadge = ({
    security,
}: {
    security: SearchResult;
}) => {
    const wealthClasses = useWealthClasses();

    return (
        <div
            className={clsx(styles.identity, {
                [styles.wealth]: wealthClasses.wealth,
                [styles.wealthLight]: wealthClasses.wealthLight,
                [styles.wealthDark]: wealthClasses.wealthDark,
            })}
        >
            <span
                className={styles.name}
                title={security.name}
            >
                {security.name}
            </span>

            {security.assetType && (
                <Tag
                    color={
                        wealthClasses.wealth
                            ? undefined
                            : assetTypeColor(security.assetType)
                    }
                    className={styles.assetTag}
                >
                    {security.assetType}
                </Tag>
            )}
        </div>
    );
};

const CopyField = ({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) => {
    const [copied, setCopied] = useState(false);

    const onCopy = useCallback(async () => {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1100);
        } catch {
            // Clipboard API may be unavailable in a non-secure context.
        }
    }, [value]);

    if (!value) return null;

    return (
        <div
            className={clsx(styles.field, {
                [styles.fieldCopied]: copied,
            })}
            role="button"
            tabIndex={0}
            aria-label={`Copy ${label}`}
            onClick={onCopy}
            onKeyDown={(event) => {
                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {
                    event.preventDefault();
                    void onCopy();
                }
            }}
        >
            <span className={styles.fieldLabel}>
                {label}
            </span>

            <span className={styles.fieldValueRow}>
                <span className={styles.fieldValue}>
                    {value}
                </span>

                <span className={styles.copyHint}>
                    {copied ? <CheckOutlined /> : '⧉'}
                </span>
            </span>
        </div>
    );
};

/**
 * Identifier fields with labels stacked above their values. The row remains
 * responsive and each identifier is independently copyable.
 */
export const IdentifierLine = ({
    security,
    showMore = false,
}: {
    security: SearchResult;
    showMore?: boolean;
}) => {
    const wealthClasses = useWealthClasses();

    return (
        <div
            className={clsx(styles.fields, {
                [styles.wealth]: wealthClasses.wealth,
                [styles.wealthLight]: wealthClasses.wealthLight,
                [styles.wealthDark]: wealthClasses.wealthDark,
            })}
        >
            <CopyField
                label="CUSIP"
                value={security.cusip}
            />

            <CopyField
                label="ISIN"
                value={security.isin}
            />

            <CopyField
                label="FIGI"
                value={security.figi}
            />

            {showMore && (
                <CopyField
                    label="Aladdin"
                    value={security.aladdinId}
                />
            )}
        </div>
    );
};
