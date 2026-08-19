import {
    Popover,
    Button,
    theme,
    message,
} from 'antd';
import {
    CheckCircleFilled,
    ExclamationCircleFilled,
    CloseCircleFilled,
    InfoCircleOutlined,
    CopyOutlined,
} from '@ant-design/icons';

import { useTheme } from '../../../../../theme/ThemeContext';

/**
 * StatusLine
 * ----------
 * Single-line result banner:
 *
 * [icon] Label · summary [info] [chips]
 *
 * The summary truncates so long service messages cannot break the widget.
 * The complete message remains available through the detail popover.
 */

export type StatusTone =
    | 'success'
    | 'warning'
    | 'error';

export type ChipState =
    | 'ok'
    | 'na'
    | 'warn'
    | 'bad';

export interface StatusChip {
    label: string;
    state: ChipState;
}

export interface StatusLineProps {
    tone: StatusTone;
    label: string;
    summary: string;
    detail?: string;
    chips?: StatusChip[];
    copyable?: boolean;
    popoverTitle?: string;
}

type ToneStyle = {
    background: string;
    border: string;
    foreground: string;
    Icon:
        | typeof CheckCircleFilled
        | typeof ExclamationCircleFilled
        | typeof CloseCircleFilled;
};

type ChipStyle = {
    background: string;
    border: string;
    foreground: string;
};

const CHIP_SYMBOL: Record<ChipState, string> = {
    ok: '\u2713',
    na: '\u2013',
    warn: '\u2717',
    bad: '\u2717',
};

const WEALTH_UI_FONT =
    '"Hanken Grotesk", "Albert Sans", ui-sans-serif, system-ui, sans-serif';

const WEALTH_MONO_FONT =
    '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';

export default function StatusLine({
    tone,
    label,
    summary,
    detail,
    chips,
    copyable = false,
    popoverTitle,
}: StatusLineProps) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();

    const isWealthLight =
        themeName === 'wealthLight';

    const isWealthDark =
        themeName === 'wealthDark';

    const isWealth =
        isWealthLight || isWealthDark;

    const toneStyle: ToneStyle = (() => {
        if (isWealthLight) {
            switch (tone) {
                case 'success':
                    return {
                        background:
                            'rgba(63,125,79,0.08)',
                        border:
                            'rgba(63,125,79,0.34)',
                        foreground:
                            '#3f7d4f',
                        Icon:
                            CheckCircleFilled,
                    };

                case 'warning':
                    return {
                        background:
                            'rgba(194,134,26,0.08)',
                        border:
                            'rgba(194,134,26,0.34)',
                        foreground:
                            '#a96416',
                        Icon:
                            ExclamationCircleFilled,
                    };

                case 'error':
                    return {
                        background:
                            'rgba(178,58,46,0.08)',
                        border:
                            'rgba(178,58,46,0.34)',
                        foreground:
                            '#b23a2e',
                        Icon:
                            CloseCircleFilled,
                    };
            }
        }

        if (isWealthDark) {
            switch (tone) {
                case 'success':
                    return {
                        background:
                            'rgba(111,174,106,0.10)',
                        border:
                            'rgba(111,174,106,0.38)',
                        foreground:
                            '#6fae6a',
                        Icon:
                            CheckCircleFilled,
                    };

                case 'warning':
                    return {
                        background:
                            'rgba(224,169,62,0.10)',
                        border:
                            'rgba(224,169,62,0.38)',
                        foreground:
                            '#e0a93e',
                        Icon:
                            ExclamationCircleFilled,
                    };

                case 'error':
                    return {
                        background:
                            'rgba(210,104,90,0.10)',
                        border:
                            'rgba(210,104,90,0.38)',
                        foreground:
                            '#d2685a',
                        Icon:
                            CloseCircleFilled,
                    };
            }
        }

        switch (tone) {
            case 'success':
                return {
                    background:
                        token.colorSuccessBg,
                    border:
                        token.colorSuccessBorder,
                    foreground:
                        token.colorSuccess,
                    Icon:
                        CheckCircleFilled,
                };

            case 'warning':
                return {
                    background:
                        token.colorWarningBg,
                    border:
                        token.colorWarningBorder,
                    foreground:
                        token.colorWarning,
                    Icon:
                        ExclamationCircleFilled,
                };

            case 'error':
                return {
                    background:
                        token.colorErrorBg,
                    border:
                        token.colorErrorBorder,
                    foreground:
                        token.colorError,
                    Icon:
                        CloseCircleFilled,
                };
        }
    })();

    const chipStyle = (
        state: ChipState,
    ): ChipStyle => {
        if (isWealthLight) {
            switch (state) {
                case 'ok':
                    return {
                        background:
                            'rgba(63,125,79,0.08)',
                        border:
                            'rgba(63,125,79,0.28)',
                        foreground:
                            '#3f7d4f',
                    };

                case 'na':
                    return {
                        background:
                            'rgba(120,84,24,0.04)',
                        border:
                            'rgba(120,84,24,0.18)',
                        foreground:
                            'rgba(33,26,15,0.42)',
                    };

                case 'warn':
                    return {
                        background:
                            'rgba(194,134,26,0.08)',
                        border:
                            'rgba(194,134,26,0.28)',
                        foreground:
                            '#a96416',
                    };

                case 'bad':
                    return {
                        background:
                            'rgba(178,58,46,0.08)',
                        border:
                            'rgba(178,58,46,0.28)',
                        foreground:
                            '#b23a2e',
                    };
            }
        }

        if (isWealthDark) {
            switch (state) {
                case 'ok':
                    return {
                        background:
                            'rgba(111,174,106,0.10)',
                        border:
                            'rgba(111,174,106,0.30)',
                        foreground:
                            '#6fae6a',
                    };

                case 'na':
                    return {
                        background:
                            'rgba(230,180,90,0.035)',
                        border:
                            'rgba(230,180,90,0.14)',
                        foreground:
                            'rgba(241,231,212,0.34)',
                    };

                case 'warn':
                    return {
                        background:
                            'rgba(224,169,62,0.10)',
                        border:
                            'rgba(224,169,62,0.30)',
                        foreground:
                            '#e0a93e',
                    };

                case 'bad':
                    return {
                        background:
                            'rgba(210,104,90,0.10)',
                        border:
                            'rgba(210,104,90,0.30)',
                        foreground:
                            '#d2685a',
                    };
            }
        }

        switch (state) {
            case 'ok':
                return {
                    background:
                        token.colorSuccessBg,
                    border:
                        token.colorSuccessBorder,
                    foreground:
                        token.colorSuccess,
                };

            case 'na':
                return {
                    background:
                        token.colorFillTertiary,
                    border:
                        token.colorBorderSecondary,
                    foreground:
                        token.colorTextTertiary,
                };

            case 'warn':
                return {
                    background:
                        token.colorWarningBg,
                    border:
                        token.colorWarningBorder,
                    foreground:
                        token.colorWarning,
                };

            case 'bad':
                return {
                    background:
                        token.colorErrorBg,
                    border:
                        token.colorErrorBorder,
                    foreground:
                        token.colorError,
                };
        }
    };

    const handleCopy = async () => {
        if (!detail) return;

        try {
            await navigator.clipboard.writeText(
                detail,
            );

            message.success(
                'Copied to clipboard',
            );
        } catch {
            message.error(
                'Copy failed',
            );
        }
    };

    const detailTextColor = isWealthLight
        ? '#211a0f'
        : isWealthDark
          ? '#f1e7d4'
          : token.colorText;

    const secondaryTextColor =
        isWealthLight
            ? '#6a5e47'
            : isWealthDark
              ? 'rgba(241,231,212,0.58)'
              : token.colorTextSecondary;

    const popoverContent = detail ? (
        <div
            style={{
                maxWidth: 320,
                fontFamily: isWealth
                    ? WEALTH_UI_FONT
                    : token.fontFamily,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    lineHeight: '17px',
                    color:
                        detailTextColor,
                    whiteSpace:
                        'pre-wrap',
                }}
            >
                {detail}
            </div>

            {copyable && (
                <div
                    style={{
                        marginTop: 8,
                        textAlign: 'right',
                    }}
                >
                    <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                        style={
                            isWealth
                                ? {
                                      borderRadius: 2,
                                      fontFamily:
                                          WEALTH_UI_FONT,
                                      fontSize: 10,
                                  }
                                : undefined
                        }
                    >
                        Copy
                    </Button>
                </div>
            )}
        </div>
    ) : null;

    const { Icon } = toneStyle;

    return (
        <div
            role="status"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 34,
                padding: '7px 12px',
                border:
                    `1px solid ${toneStyle.border}`,
                borderRadius:
                    isWealth
                        ? 2
                        : token.borderRadius,
                background:
                    toneStyle.background,
                fontFamily:
                    isWealth
                        ? WEALTH_UI_FONT
                        : token.fontFamily,
            }}
        >
            <Icon
                style={{
                    flex: '0 0 auto',
                    fontSize: 14,
                    color:
                        toneStyle.foreground,
                }}
            />

            <span
                style={{
                    flex: '0 0 auto',
                    fontSize:
                        isWealth ? 11 : 12,
                    fontWeight:
                        isWealth ? 600 : 700,
                    color:
                        toneStyle.foreground,
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </span>

            <span
                style={{
                    flex: '0 0 auto',
                    color:
                        isWealth
                            ? secondaryTextColor
                            : token.colorTextQuaternary,
                }}
            >
                &middot;
            </span>

            <span
                title={summary}
                style={{
                    flex: '1 1 auto',
                    minWidth: 0,
                    overflow: 'hidden',
                    fontFamily:
                        isWealth
                            ? WEALTH_UI_FONT
                            : token.fontFamily,
                    fontSize:
                        isWealth ? 11 : 12,
                    fontWeight: 400,
                    color:
                        toneStyle.foreground,
                    textOverflow:
                        'ellipsis',
                    whiteSpace:
                        'nowrap',
                }}
            >
                {summary}
            </span>

            {detail && (
                <Popover
                    content={popoverContent}
                    title={
                        popoverTitle ? (
                            <span
                                style={{
                                    fontFamily:
                                        isWealth
                                            ? WEALTH_UI_FONT
                                            : token.fontFamily,
                                    fontSize:
                                        isWealth
                                            ? 11
                                            : 12,
                                    fontWeight: 600,
                                    color:
                                        toneStyle.foreground,
                                }}
                            >
                                {popoverTitle}
                            </span>
                        ) : undefined
                    }
                    trigger={[
                        'hover',
                        'focus',
                        'click',
                    ]}
                    placement="topRight"
                >
                    <InfoCircleOutlined
                        tabIndex={0}
                        aria-label="Show full details"
                        style={{
                            flex: '0 0 auto',
                            outline: 'none',
                            fontSize: 13,
                            color:
                                toneStyle.foreground,
                            cursor: 'pointer',
                        }}
                    />
                </Popover>
            )}

            {chips &&
                chips.length > 0 && (
                    <span
                        style={{
                            display: 'flex',
                            flex: '0 0 auto',
                            gap: 6,
                        }}
                    >
                        {chips.map(
                            (chip) => {
                                const colors =
                                    chipStyle(
                                        chip.state,
                                    );

                                return (
                                    <span
                                        key={
                                            chip.label
                                        }
                                        style={{
                                            display:
                                                'inline-flex',
                                            alignItems:
                                                'center',
                                            gap: 3,
                                            padding:
                                                '1px 7px',
                                            border:
                                                `1px solid ${colors.border}`,
                                            borderRadius:
                                                isWealth
                                                    ? 2
                                                    : 10,
                                            background:
                                                colors.background,
                                            color:
                                                colors.foreground,
                                            fontFamily:
                                                isWealth
                                                    ? WEALTH_MONO_FONT
                                                    : token.fontFamily,
                                            fontSize:
                                                isWealth
                                                    ? 9
                                                    : 11,
                                            fontWeight:
                                                isWealth
                                                    ? 500
                                                    : 600,
                                            letterSpacing:
                                                isWealth
                                                    ? '0.04em'
                                                    : undefined,
                                            whiteSpace:
                                                'nowrap',
                                        }}
                                    >
                                        {
                                            chip.label
                                        }{' '}
                                        {
                                            CHIP_SYMBOL[
                                                chip
                                                    .state
                                            ]
                                        }
                                    </span>
                                );
                            },
                        )}
                    </span>
                )}
        </div>
    );
}