import { SearchOutlined, CloseCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { assetTypeColor } from '../utils';
import { Space, Select, Input, theme, Spin, Tag } from 'antd';
import { SearchResult, SearchType } from '../types';
import { PLACEHOLDERS } from '../constants';
import { isValidCusip, isValidIsin, isValidFigi } from '../../../../utils/validation';
import styles from './Search.module.scss';
import { useCallback, useMemo } from 'react';

const SEARCH_TYPE_HINTS: Record<SearchType, { format: string; example: string }> = {
    CUSIP: { format: '9 alphanumeric characters', example: '007036QT6' },
    ISIN: { format: '2-letter country + 9 chars + check digit', example: 'US007036QT65' },
    TICKER: { format: 'Free text', example: 'ARMT 2005-8' },
    FIGI: { format: '12 chars · starts with provider + G', example: 'BBG000BLNQ16' },
};

const SUPPORTED_ASSET_TYPES = ['NA-RMBS', 'CMBS', 'CLO', 'ABS'];

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
    onExecute: () => void;
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
    onExecute,
}: SearchProps) => {
    const { token } = theme.useToken();

    const hint = SEARCH_TYPE_HINTS[searchType];

    const validationError = useMemo(() => {
        const trimmed = query.trim().toUpperCase();
        if (!trimmed) return undefined;

        if (searchType === 'CUSIP') {
            if (trimmed.length < 9) return undefined;
            if (trimmed.length !== 9) return 'CUSIP must be exactly 9 characters';
            if (!isValidCusip(trimmed)) return 'This doesn\'t look like a valid CUSIP';
        }

        if (searchType === 'ISIN') {
            if (trimmed.length < 12) return undefined;
            if (trimmed.length !== 12) return 'ISIN must be exactly 12 characters';
            if (!isValidIsin(trimmed)) return 'This doesn\'t look like a valid ISIN';
        }

        if (searchType === 'FIGI') {
            if (trimmed.length < 12) return undefined;
            if (trimmed.length !== 12) return 'FIGI must be exactly 12 characters';
            if (trimmed.charAt(2) !== 'G') return 'FIGI must have G as the 3rd character';
            if (!isValidFigi(trimmed)) return 'This doesn\'t look like a valid FIGI';
        }

        return undefined;
    }, [query, searchType]);

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
                    <span
                        className={styles.name}
                        style={{
                            color: token.colorText,
                        }}
                    >
                        {option.name}
                    </span>
                    <span
                        style={{
                            display: 'block',
                            fontSize: 10,
                            fontFamily: 'monospace',
                            color: token.colorTextTertiary,
                        }}
                    >
                        {option.cusip}
                    </span>
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
        [handleSelect, token, options.length]
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
        [options, renderOption, token]
    );

    return (
        <div className={styles.container}>
            <span
                style={{
                    display: 'block',
                    fontSize: 10,
                    lineHeight: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: token.colorTextTertiary,
                }}
            >
                Security lookup
            </span>

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
                        <Select.Option value="CUSIP">CUSIP</Select.Option>
                        <Select.Option value="ISIN">ISIN</Select.Option>
                        <Select.Option value="TICKER">Ticker</Select.Option>
                        <Select.Option value="FIGI">FIGI</Select.Option>
                    </Select>

                    <Input
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value.toUpperCase())}
                        onPressEnter={() => {
                            if (query.trim().length >= 3 && !validationError) onExecute();
                        }}
                        onFocus={() => {
                            if (options.length > 0) setOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setOpen(false), 180)}
                        placeholder={PLACEHOLDERS[searchType]}
                        status={validationError ? 'error' : undefined}
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

                    <Space.Addon
                        onClick={() => {
                            if (query.trim().length >= 3 && !validationError) onExecute();
                        }}
                        style={{
                            cursor:
                                query.trim().length >= 3 && !validationError
                                    ? 'pointer'
                                    : 'not-allowed',
                        }}
                    >
                        <SearchOutlined />
                    </Space.Addon>
                </Space.Compact>

                {open && options.length > 0 && renderDropdown()}
            </div>

            {validationError && (
                <span className={styles.validationError}>{validationError}</span>
            )}

            {/* Search type hint */}
            <div className={styles.hintSection}>
                <span
                    className={styles.hintLabel}
                    style={{ color: token.colorTextTertiary }}
                >
                    Search by {searchType}
                </span>
                <span
                    className={styles.hintDetail}
                    style={{ color: token.colorTextQuaternary }}
                >
                    Format: {hint.format} · Example:{' '}
                    <span
                        style={{
                            fontFamily: 'monospace',
                            color: token.colorPrimary,
                        }}
                    >
                        {hint.example}
                    </span>
                </span>
            </div>

            {/* Supported asset types */}
            <div className={styles.assetTypesSection}>
                <span
                    className={styles.hintLabel}
                    style={{ color: token.colorTextTertiary }}
                >
                    Supported asset types
                </span>
                <div className={styles.assetTypeTags}>
                    {SUPPORTED_ASSET_TYPES.map((type) => (
                        <Tag
                            key={type}
                            color={assetTypeColor(type)}
                            className={styles.assetTypeTag}
                        >
                            {type}
                        </Tag>
                    ))}
                </div>
            </div>
        </div>
    );
};