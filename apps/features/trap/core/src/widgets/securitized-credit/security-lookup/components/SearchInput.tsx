import { useState } from 'react';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Input, theme, Spin } from 'antd';

type Props = {
    query: string;
    onChange: (v: string) => void;
    onExecute: () => void;
    onClear: () => void;
    searching?: boolean;
};

const INPUT_WIDTH = 220;
const INPUT_HEIGHT = 36;

export const SearchInput = ({ query, onChange, onExecute, onClear, searching }: Props) => {
    const { token } = theme.useToken();
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ width: INPUT_WIDTH, maxWidth: '100%', flexShrink: 0 }}>
            <Input
                value={query}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                onPressEnter={() => query.trim().length >= 3 && onExecute()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="CUSIP · ISIN · FIGI · Ticker · Deal"
                variant="filled"
                prefix={
                    searching
                        ? <Spin size="small" />
                        : <SearchOutlined style={{ color: focused ? token.colorPrimary : token.colorTextQuaternary }} />
                }
                suffix={
                    query
                        ? <CloseCircleOutlined
                            onClick={onClear}
                            style={{ color: token.colorTextQuaternary, cursor: 'pointer' }} />
                        : null
                }
                style={{
                    width: '100%',
                    height: INPUT_HEIGHT,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    borderRadius: token.borderRadius,
                    background: token.colorFillTertiary,
                    // accent focus ring — theme-token driven
                    boxShadow: focused ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none',
                    borderColor: focused ? token.colorPrimary : 'transparent',
                    transition: 'box-shadow .15s ease, border-color .15s ease',
                }}
            />
        </div>
    );
};