import { useState } from 'react';
import {
    SearchOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import {
    Input,
    Spin,
    theme,
} from 'antd';
import { useTheme } from '../../../../theme/ThemeContext';

type Props = {
    query: string;
    onChange: (value: string) => void;
    onExecute: () => void;
    onClear: () => void;
    searching?: boolean;
};

const INPUT_WIDTH = 220;
const INPUT_HEIGHT = 36;

const WEALTH_MONO_FONT =
    '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';

export const SearchInput = ({
    query,
    onChange,
    onExecute,
    onClear,
    searching,
}: Props) => {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const [focused, setFocused] = useState(false);

    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';
    const isWealth = isWealthLight || isWealthDark;

    const background = isWealthLight
        ? 'rgba(120,84,24,0.045)'
        : isWealthDark
          ? 'rgba(230,180,90,0.05)'
          : token.colorFillTertiary;

    const borderColor = focused
        ? token.colorPrimary
        : isWealthLight
          ? 'rgba(120,84,24,0.24)'
          : isWealthDark
            ? 'rgba(230,180,90,0.16)'
            : 'transparent';

    const focusShadow = focused
        ? isWealthLight
            ? '0 0 0 2px rgba(154,107,34,0.10)'
            : isWealthDark
              ? '0 0 0 2px rgba(230,180,90,0.10)'
              : `0 0 0 2px ${token.colorPrimaryBg}`
        : 'none';

    const iconColor = focused
        ? token.colorPrimary
        : token.colorTextQuaternary;

    return (
        <div
            style={{
                width: INPUT_WIDTH,
                maxWidth: '100%',
                flexShrink: 0,
            }}
        >
            <Input
                value={query}
                onChange={(event) =>
                    onChange(event.target.value.toUpperCase())
                }
                onPressEnter={() => {
                    if (query.trim().length >= 3) {
                        onExecute();
                    }
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="CUSIP · ISIN · FIGI · Ticker · Deal"
                variant="filled"
                prefix={
                    searching ? (
                        <Spin size="small" />
                    ) : (
                        <SearchOutlined
                            style={{
                                color: iconColor,
                            }}
                        />
                    )
                }
                suffix={
                    query ? (
                        <CloseCircleOutlined
                            role="button"
                            tabIndex={0}
                            aria-label="Clear security lookup"
                            onClick={onClear}
                            onKeyDown={(event) => {
                                if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                ) {
                                    event.preventDefault();
                                    onClear();
                                }
                            }}
                            style={{
                                color: token.colorTextQuaternary,
                                cursor: 'pointer',
                            }}
                        />
                    ) : null
                }
                style={{
                    width: '100%',
                    height: INPUT_HEIGHT,
                    borderRadius: isWealth
                        ? 2
                        : token.borderRadius,
                    borderColor,
                    background,
                    boxShadow: focusShadow,
                    color: token.colorText,
                    fontFamily: isWealth
                        ? WEALTH_MONO_FONT
                        : 'monospace',
                    fontSize: isWealth ? 11 : 13,
                    fontWeight: isWealth ? 400 : undefined,
                    letterSpacing: isWealth ? '0.01em' : undefined,
                    fontVariantNumeric: 'tabular-nums',
                    transition:
                        'box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease',
                }}
            />
        </div>
    );
};
