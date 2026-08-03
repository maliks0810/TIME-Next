import React from 'react';
import { Input, Typography, message } from 'antd';
import {
    SearchOutlined,
    AppstoreOutlined,
    TableOutlined,
    BarChartOutlined,
    BankOutlined,
    UploadOutlined,
    ControlOutlined,
    PieChartOutlined,
    DashboardOutlined,
    FontSizeOutlined,
    SlidersOutlined,
} from '@ant-design/icons';
import type { WidgetOption } from './activeCanvas';
import styles from './WidgetsPanel.module.scss';
// A representative icon per widget, inferred from its name/category — visual anchor
// for each catalogue row (mirrors the concept's widget cards).
function iconFor(widget: WidgetOption): React.ReactNode {
    const n = widget.name.toLowerCase();
    const c = widget.category.toLowerCase();
    if (/grid|table|tranche/.test(n)) return <TableOutlined />;
    if (/chart|performance/.test(n)) return <BarChartOutlined />;
    if (/deal|bank|capital|asset/.test(n)) return <BankOutlined />;
    if (/cdi|upload|extract|staging/.test(n)) return <UploadOutlined />;
    if (/text|comment|dynamic/.test(n)) return <FontSizeOutlined />;
    if (/radio|checkbox|select|control|button|tabs|date|time/.test(n)) return <ControlOutlined />;
    if (/kpi|counter/.test(n)) return <SlidersOutlined />;
    if (c.includes('portfolio')) return <PieChartOutlined />;
    if (c.includes('arc')) return <DashboardOutlined />;
    return <AppstoreOutlined />;
}

type Props = {
    widgets: WidgetOption[];
    onAdd: (id: string) => void;
};

// In-drawer widget catalogue for the active draft. Click a row (or the + on hover)
// to drop the widget onto the canvas; the drawer stays open so you can add several.
export default function WidgetsPanel({ widgets, onAdd }: Props) {
    const [search, setSearch] = React.useState('');
    // Each category shows a short preview (2 rows) then a "Show all N →" expander — the same
    // language as the Workspaces list, so the whole drawer reads as one system.
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const PREVIEW_COUNT = 4; // 2 rows × 2 cards

    const q = search.trim().toLowerCase();
    const filtered = widgets.filter(
        (widget) =>
            !q ||
            widget.name.toLowerCase().includes(q) ||
            (widget.description || '').toLowerCase().includes(q) ||
            widget.category.toLowerCase().includes(q)
    );

    // Group by category, deduped case-insensitively (defs mix "common"/"Common"/"COMMON").
    const groups: Record<string, { label: string; items: WidgetOption[] }> = {};
    filtered.forEach((widget) => {
        const raw = (widget.category || 'Other').trim();
        const key = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!groups[key]) groups[key] = { label: raw, items: [] };
        groups[key].items.push(widget);
    });
    // "Common" leads (the default-open category, per concept); the rest are alphabetical.
    const groupNames = Object.keys(groups).sort((a, b) => {
        const ca = groups[a].label.toLowerCase() === 'common';
        const cb = groups[b].label.toLowerCase() === 'common';
        if (ca !== cb) return ca ? -1 : 1;
        return groups[a].label.localeCompare(groups[b].label);
    });

    const add = (widget: WidgetOption) => {
        onAdd(widget.id);
        message.success(`Added ${widget.name}`);
    };

    const card = (widget: WidgetOption) => (
        <div
            key={widget.id}
            className={styles['wg-card']}
            onClick={() => add(widget)}
            title={widget.description || widget.name}
        >
            <span className={styles['wg-ic']}>{iconFor(widget)}</span>
            <span className={styles['wg-tx']}>
                <div className={styles['wg-name']}>{widget.name}</div>
                <div className={styles['wg-desc']}>{widget.description || widget.category}</div>
            </span>
        </div>
    );

    return (
        <div>
            <Input
                allowClear
                size="small"
                prefix={<SearchOutlined />}
                placeholder={`Search ${widgets.length} widgets…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 2 }}
            />

            {groupNames.map((g) => {
                const list = groups[g].items;
                // A search shows every match; otherwise preview 2 rows until "Show all".
                const isExpanded = !!q || !!expanded[g];
                const shown = isExpanded ? list : list.slice(0, PREVIEW_COUNT);
                const overflow = list.length - shown.length;
                return (
                    <div key={g}>
                        <div className={styles['wg-sec']}>
                            <span>{groups[g].label}</span>
                            <span className={styles['ct']}>{list.length}</span>
                            <span className={styles['ln']} />
                        </div>
                        <div className={styles['wg-grid']}>{shown.map(card)}</div>
                        {overflow > 0 ? (
                            <div
                                className={styles['wg-showall']}
                                onClick={() => setExpanded((p) => ({ ...p, [g]: true }))}
                            >
                                Show all {list.length} →
                            </div>
                        ) : !q && expanded[g] && list.length > PREVIEW_COUNT ? (
                            <div
                                className={styles['wg-showall']}
                                onClick={() => setExpanded((p) => ({ ...p, [g]: false }))}
                            >
                                Show less
                            </div>
                        ) : null}
                    </div>
                );
            })}

            {!filtered.length ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    No widgets match “{search}”.
                </Typography.Text>
            ) : null}
        </div>
    );
}
