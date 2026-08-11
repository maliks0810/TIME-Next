import React from 'react';
import { BRAND_GROUPS, isBrandColor } from '../brandPalette';
import { Tooltip, Popover } from 'antd';
export function BrandSwatchPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (hex: string) => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const cur = String(value ?? '').toLowerCase();
    const content = (
        <div style={{ width: 224 }}>
            {BRAND_GROUPS.map((group) => (
                <div key={group.title} style={{ marginBottom: 8 }}>
                    <div
                        style={{
                            fontSize: 9,
                            letterSpacing: '.05em',
                            textTransform: 'uppercase',
                            color: 'var(--ant-color-text-quaternary)',
                            fontWeight: 700,
                            marginBottom: 4,
                        }}
                    >
                        {group.title}
                    </div>
                    {group.rows.map((row, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                gap: 4,
                                marginBottom: 4,
                                alignItems: 'center',
                            }}
                        >
                            {row.name ? (
                                <span
                                    style={{
                                        width: 34,
                                        fontSize: 9.5,
                                        color: 'var(--ant-color-text-tertiary)',
                                    }}
                                >
                                    {row.name}
                                </span>
                            ) : null}
                            {row.hexes.map((hex) => (
                                <Tooltip key={hex} title={hex} mouseEnterDelay={0.3}>
                                    <span
                                        role="button"
                                        onClick={() => {
                                            onChange(hex);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: 4,
                                            background: hex,
                                            cursor: 'pointer',
                                            boxShadow:
                                                cur === hex.toLowerCase()
                                                    ? '0 0 0 2px var(--ant-color-primary)'
                                                    : 'inset 0 0 0 1px rgba(128,128,128,.35)',
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
    return (
        <Popover
            content={content}
            trigger="click"
            open={isOpen}
            onOpenChange={setIsOpen}
            placement="rightTop"
        >
            <span
                role="button"
                title={isBrandColor(value) ? String(value) : `${value} (off-brand)`}
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: value,
                    cursor: 'pointer',
                    display: 'inline-block',
                    flex: '0 0 auto',
                    boxShadow: isBrandColor(value)
                        ? 'inset 0 0 0 1px rgba(128,128,128,.35)'
                        : 'inset 0 0 0 1px var(--ant-color-warning), 0 0 0 1px var(--ant-color-warning)',
                }}
            />
        </Popover>
    );
}
