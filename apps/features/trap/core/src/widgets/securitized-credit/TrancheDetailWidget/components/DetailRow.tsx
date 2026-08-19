import { useState } from 'react';
import clsx from 'clsx';
import {
    CopyOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import { theme } from 'antd';
import { useTheme } from '../../../../theme/ThemeContext';
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
    const { themeName } = useTheme();

    const [copied, setCopied] = useState(false);
    const [iconHovered, setIconHovered] = useState(false);

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight =
        themeName === 'wealthLight';

    const isWealthDark =
        themeName === 'wealthDark';

    const canCopy =
        Boolean(copyable) &&
        value !== null &&
        value !== undefined &&
        value !== '—' &&
        value !== '';

    const handleCopy = async () => {
        if (!canCopy) return;

        try {
            await navigator.clipboard.writeText(
                String(value),
            );

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1200);
        } catch {
            // Clipboard API may be unavailable in a non-secure context.
        }
    };

    return (
        <div
            className={clsx(
                styles.detailRowContainer,
                {
                    [styles.wealth]:
                        isWealthTheme,

                    [styles.wealthLight]:
                        isWealthLight,

                    [styles.wealthDark]:
                        isWealthDark,
                },
            )}
        >
            <span className={styles.detailRowLabel}>
                {label}
            </span>

            <span className={styles.detailRowValueContainer}>
                <span
                    className={clsx(
                        styles.detailRowValue,
                        {
                            [styles.fontFamilyMono]:
                                mono,

                            [styles.detailRowValueAccent]:
                                accent,
                        },
                    )}
                >
                    {value ?? '—'}
                </span>

                {canCopy && (
                    <CopyIcon
                        copied={copied}
                        hovered={iconHovered}
                        successColor={
                            token.colorSuccess
                        }
                        idleColor={
                            token.colorTextTertiary
                        }
                        hoverColor={
                            token.colorPrimary
                        }
                        label={label}
                        onCopy={handleCopy}
                        onEnter={() =>
                            setIconHovered(true)
                        }
                        onLeave={() =>
                            setIconHovered(false)
                        }
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
    const color = copied
        ? successColor
        : hovered
          ? hoverColor
          : idleColor;

    return (
        <span
            role="button"
            tabIndex={0}
            aria-label={`Copy ${label}`}
            title={copied ? 'Copied' : 'Copy'}
            onClick={onCopy}
            onKeyDown={(event) => {
                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {
                    event.preventDefault();
                    onCopy();
                }
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className={styles.copyIcon}
            style={{ color }}
        >
            {copied
                ? <CheckOutlined />
                : <CopyOutlined />}
        </span>
    );
}