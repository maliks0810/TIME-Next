import { SearchOutlined, CloseCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { assetTypeColor } from '../utils';
import { SectionLabel } from './SectionLabel';
import { Space, Select, Input, theme, Typography, Spin, Tag } from 'antd';
import { SearchResult, SearchType } from '../types';
import { PLACEHOLDERS } from '../constants';
import styles from './Search.module.scss';
import { useCallback } from 'react';
const { Text } = Typography;

const { Option } = Select;
type SearchProps = {
    setSearchType: React.Dispatch<React.SetStateAction<SearchType>>;
    handleClear: () => void;
    handleQueryChange: (value: string) => void;
    searchType: SearchType;
    query: string;
    searching: boolean;
    open: boolean;
    options: SearchResult[];
    handleSelect: (result: SearchResult) => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Search = ({
    open,
    options,
    searching,
    searchType,
    query,
    handleClear,
    setSearchType,
    handleQueryChange,
    handleSelect,
    setOpen,
}: SearchProps) => {
    const { token } = theme.useToken();
    const renderOption = useCallback(
        (option: SearchResult, index: number) => (
            <div
                key={option.key}
                className={styles.option}
                onMouseDown={() => handleSelect(option)}
                style={{
                    background: index % 2 === 0 ? token.colorBgElevated : token.colorFillAlter,
                    borderBottom:
                        index < options.length - 1
                            ? `1px solid ${token.colorBorderSecondary}`
                            : 'none',
                }}
                onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = token.colorPrimaryBg)
                }
                onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                        index % 2 === 0 ? token.colorBgElevated : token.colorFillAlter)
                }
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        className={styles.name}
                        style={{
                            color: token.colorText,
                        }}
                    >
                        {option.name}
                    </Text>
                    <Text
                        style={{
                            fontSize: 10,
                            fontFamily: 'monospace',
                            color: token.colorTextTertiary,
                        }}
                    >
                        {option.cusip}
                    </Text>
                </div>
                <Tag color={assetTypeColor(option.assetType)} className={styles.tag}>
                    {option.assetType}
                </Tag>
                <LineChartOutlined
                    style={{
                        fontSize: 12,
                        color: token.colorTextQuaternary,
                        flexShrink: 0,
                    }}
                />
            </div>
        ),
        []
    );

    const renderDropdown = useCallback(
        () => (
            <div
                className={styles.dropdown}
                style={{
                    background: token.colorBgElevated,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,
                    boxShadow: token.boxShadowSecondary,
                }}
            >
                {options.map((option, index) => renderOption(option, index))}
            </div>
        ),
        [options]
    );
    return (
        <div className={styles.container}>
            <SectionLabel label="Security lookup" />
            <div style={{ position: 'relative' }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Select
                        value={searchType}
                        onChange={(v: SearchType) => {
                            setSearchType(v);
                            handleClear();
                        }}
                        style={{ width: 88 }}
                    >
                        <Option value="CUSIP">CUSIP</Option>
                        <Option value="ISIN">ISIN</Option>
                        <Option value="TICKER">Ticker</Option>
                        <Option value="NAME">Name</Option>
                    </Select>
                    <Input
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => {
                            if (options.length > 0) setOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setOpen(false), 180)}
                        placeholder={PLACEHOLDERS[searchType]}
                        prefix={
                            searching ? (
                                <Spin size="small" />
                            ) : (
                                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                            )
                        }
                        suffix={
                            query ? (
                                <CloseCircleOutlined
                                    style={{
                                        color: token.colorTextQuaternary,
                                        cursor: 'pointer',
                                    }}
                                    onClick={handleClear}
                                />
                            ) : null
                        }
                        style={{ fontFamily: 'monospace', fontSize: 12 }}
                    />
                </Space.Compact>
                {open && options.length > 0 && renderDropdown()}
            </div>

            <Text style={{ fontSize: 10, color: token.colorTextTertiary }}>
                Type 3+ characters to search · results appear as you type
            </Text>
        </div>
    );
};
