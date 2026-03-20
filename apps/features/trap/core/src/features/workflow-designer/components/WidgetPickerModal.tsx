/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Empty, Input, Modal, Select, Space, Tag, Typography, theme } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import JsonInfoModal from '../../../components/common/JsonInfoModal';
import { useTheme, getThemeSurfaceMeta } from '../../../theme/ThemeContext';

type WidgetPickerModalProps = {
    open: boolean;
    isPublished: boolean;
    templateId: string;
    widgetSearch: string;
    selectedCategory: string;
    widgetCategories: string[];
    filteredWidgetDefs: any[];
    selectedWidgetDefId: string;
    selectedWidgetVariantId?: string;
    selectedWidgetDef?: any;
    onClose: () => void;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSelectWidget: (widgetId: string) => void;
    onSelectVariant: (variantId?: string) => void;
    onAddWidget: () => void;
};

export default function WidgetPickerModal(props: WidgetPickerModalProps) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName);

    const isDarkHud =
        themeName === 'dark' ||
        themeName === 'neonMint' ||
        themeName === 'vaporwave' ||
        themeName === 'neonGlow' ||
        themeName === 'solarizedDark' ||
        themeName === 'plumGradient' ||
        themeName === 'goldGradient' ||
        themeName === 'greenGradient' ||
        themeName === 'blueGradient' ||
        themeName === 'cyberpunk' ||
        themeName === 'tron' ||
        themeName === 'matrix' ||
        themeName === 'bladeRunner';

    const modalPanelBackground = surfaceMeta.isGradientTheme
        ? 'rgba(0,0,0,0.32)' // stronger overlay so modal edges are clearer
        : token.colorBgElevated;

    const sidebarBackground = surfaceMeta.isGradientTheme
        ? 'rgba(255,255,255,0.03)'
        : isDarkHud
          ? 'rgba(255,255,255,0.03)'
          : token.colorBgContainer;

    const tileBackground = surfaceMeta.isGradientTheme
        ? 'rgba(255,255,255,0.04)'
        : isDarkHud
          ? 'rgba(255,255,255,0.03)'
          : token.colorBgContainer;

    const tileSelectedBackground = surfaceMeta.isGradientTheme
        ? 'rgba(255,255,255,0.08)'
        : isDarkHud
          ? 'rgba(255,255,255,0.06)'
          : token.colorPrimaryBg;

    const tileBorder = surfaceMeta.isGradientTheme
        ? '1px solid rgba(255,255,255,0.10)'
        : `1px solid ${token.colorBorderSecondary}`;

    const tileSelectedBorder = surfaceMeta.isGradientTheme
        ? '1px solid rgba(255,255,255,0.20)'
        : `1px solid ${token.colorPrimaryBorder}`;

    const iconBg = surfaceMeta.isGradientTheme
        ? 'rgba(255,255,255,0.10)'
        : isDarkHud
          ? 'rgba(255,255,255,0.08)'
          : token.colorFillSecondary;

    const iconSelectedBg = surfaceMeta.isGradientTheme
        ? 'rgba(255,255,255,0.18)'
        : isDarkHud
          ? 'rgba(255,255,255,0.14)'
          : token.colorPrimaryBg;

    const titleColor = isDarkHud ? '#fff' : token.colorText;
    const secondaryColor = isDarkHud ? 'rgba(255,255,255,0.72)' : token.colorTextSecondary;

    function getWidgetIconStyle(selected: boolean): React.CSSProperties {
        return {
            width: 44,
            height: 44,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: selected ? iconSelectedBg : iconBg,
            color: selected ? titleColor : secondaryColor,
            flexShrink: 0,
            border: surfaceMeta.isGradientTheme ? '1px solid rgba(255,255,255,0.10)' : 'none',
        };
    }

    return (
        <Modal
            title={null}
            open={props.open}
            onCancel={props.onClose}
            footer={null}
            width={1080}
            centered
            destroyOnHidden
            styles={{
                body: {
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: 20,
                    background: modalPanelBackground,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                },
                content: {
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: 20,
                    background: modalPanelBackground,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                    border: surfaceMeta.isGradientTheme
                        ? '1px solid rgba(255,255,255,0.14)'
                        : `1px solid ${token.colorBorderSecondary}`,
                },
                header: {
                    display: 'none',
                },
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '240px minmax(0, 1fr)',
                    minHeight: 640,
                    maxHeight: '78vh',
                }}
            >
                <div
                    style={{
                        borderRight: surfaceMeta.isGradientTheme
                            ? '1px solid rgba(255,255,255,0.10)'
                            : `1px solid ${token.colorBorderSecondary}`,
                        background: sidebarBackground,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 18,
                        overflowY: 'auto',
                    }}
                >
                    <div>
                        <Typography.Title level={4} style={{ margin: 0, color: titleColor }}>
                            Browse Widgets
                        </Typography.Title>
                        <Typography.Text style={{ fontSize: 12, color: secondaryColor }}>
                            Explore widget types and add one to the canvas.
                        </Typography.Text>
                    </div>

                    <div>
                        <Typography.Text strong style={{ fontSize: 12, color: titleColor }}>
                            Search
                        </Typography.Text>
                        <Input.Search
                            placeholder="Search widgets"
                            value={props.widgetSearch}
                            onChange={(e) => props.onSearchChange(e.target.value)}
                            allowClear
                            style={{ marginTop: 8 }}
                        />
                    </div>

                    <div>
                        <Typography.Text strong style={{ fontSize: 12, color: titleColor }}>
                            Categories
                        </Typography.Text>
                        <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 10 }}>
                            {props.widgetCategories.map((cat) => {
                                const active = props.selectedCategory === cat;
                                return (
                                    <Button
                                        key={cat}
                                        size="small"
                                        type={active ? 'primary' : 'default'}
                                        onClick={() => props.onCategoryChange(cat)}
                                        style={{ borderRadius: 999 }}
                                    >
                                        {cat}
                                    </Button>
                                );
                            })}
                        </Space>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        {props.selectedWidgetDef ? (
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <div>
                                    <Typography.Text
                                        strong
                                        style={{ fontSize: 12, color: titleColor }}
                                    >
                                        Selected
                                    </Typography.Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                                            {props.selectedWidgetDef.name}
                                        </Tag>
                                    </div>
                                </div>

                                <div>
                                    <Typography.Text
                                        strong
                                        style={{ fontSize: 12, color: titleColor }}
                                    >
                                        Variant
                                    </Typography.Text>
                                    <Select
                                        value={props.selectedWidgetVariantId}
                                        onChange={props.onSelectVariant}
                                        placeholder="Widget variant"
                                        style={{ width: '100%', marginTop: 8 }}
                                        options={(props.selectedWidgetDef?.variants ?? []).map(
                                            (v: any) => ({
                                                value: v.id,
                                                label: v.label,
                                            })
                                        )}
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    onClick={props.onAddWidget}
                                    disabled={
                                        !props.selectedWidgetDef ||
                                        props.isPublished ||
                                        !props.templateId
                                    }
                                >
                                    Add Widget to Canvas
                                </Button>
                            </Space>
                        ) : (
                            <Typography.Text style={{ fontSize: 12, color: secondaryColor }}>
                                Select a widget to choose a variant and add it to the canvas.
                            </Typography.Text>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden',
                        background: 'transparent',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                            gap: 14,
                            overflowY: 'auto',
                            paddingRight: 4,
                        }}
                    >
                        {props.filteredWidgetDefs.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', paddingTop: 40 }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No widgets found"
                                />
                            </div>
                        ) : (
                            props.filteredWidgetDefs.map((d: any) => {
                                const isSelected = d.id === props.selectedWidgetDefId;

                                return (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => props.onSelectWidget(d.id)}
                                        style={{
                                            textAlign: 'left',
                                            borderRadius: 18,
                                            border: isSelected ? tileSelectedBorder : tileBorder,
                                            background: isSelected
                                                ? tileSelectedBackground
                                                : tileBackground,
                                            padding: 14,
                                            cursor: 'pointer',
                                            minHeight: 136,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            boxShadow: isSelected
                                                ? surfaceMeta.isGradientTheme
                                                    ? `0 10px 28px ${surfaceMeta.hudGlow}`
                                                    : `0 8px 24px ${token.colorPrimaryBorder}`
                                                : 'none',
                                            backdropFilter: surfaceMeta.isGradientTheme
                                                ? 'blur(6px)'
                                                : undefined,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 12,
                                                minWidth: 0,
                                            }}
                                        >
                                            <div style={getWidgetIconStyle(isSelected)}>
                                                <AppstoreOutlined style={{ fontSize: 18 }} />
                                            </div>

                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 14,
                                                        lineHeight: '18px',
                                                        color: titleColor,
                                                    }}
                                                    title={d.name}
                                                >
                                                    {d.name}
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: 4,
                                                        fontSize: 12,
                                                        lineHeight: '16px',
                                                        color: secondaryColor,
                                                        minHeight: 32,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {d.description ||
                                                        'Reusable widget for workflow composition.'}
                                                </div>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                <JsonInfoModal
                                                    title={`${d.name} Definition`}
                                                    tooltip="Widget Definition JSON"
                                                    data={{
                                                        id: d.id,
                                                        name: d.name,
                                                        description: d.description,
                                                        category:
                                                            d?.category ?? d?.uiHints?.category,
                                                        datasetId: d?.datasetId,
                                                        variants: Array.isArray(d?.variants)
                                                            ? d.variants.map((v: any) => ({
                                                                  id: v.id,
                                                                  label: v.label,
                                                              }))
                                                            : [],
                                                        listensToKeys: d?.listensToKeys,
                                                        emitsKeys: d?.emitsKeys,
                                                        configSchema: d?.configSchema,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                marginTop: 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Tag style={{ marginInlineEnd: 0 }}>
                                                {d?.category ?? d?.uiHints?.category ?? 'Other'}
                                            </Tag>
                                            {Array.isArray(d?.variants) && d.variants.length > 0 ? (
                                                <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                                                    {d.variants.length} variant
                                                    {d.variants.length > 1 ? 's' : ''}
                                                </Tag>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
