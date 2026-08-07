import React, { useMemo } from 'react';
import { Button, Divider, Input, Typography } from 'antd';

import { SearchOutlined } from '@ant-design/icons';
import type { WidgetDefinitionLike } from '../../../../types/widget';
import styles from './WidgetsPanel.module.scss';
import { useActiveCanvas } from '../shell/activeCanvas';
import { WidgetCard } from './WidgetCard';
import { WidgetRequiredFieldsContainer } from './WidgetRequiredFieldsContainer';

// In-drawer widget catalogue for the active draft. Click a row (or the + on hover)
// to drop the widget onto the canvas; the drawer stays open so you can add several.
export default function WidgetsPanel() {
    const [search, setSearch] = React.useState('');
    // Each category shows a short preview (2 rows) then a "Show all N →" expander — the same
    // language as the Workspaces list, so the whole drawer reads as one system.
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const PREVIEW_COUNT = 4; // 2 rows × 2 cards

    const activeCanvas = useActiveCanvas();

    const selectedWidgetRequiredFields = activeCanvas?.selectedWidgetDef?.configSchema?.required;

    const hasAllRequiredParams = useMemo(
        () =>
            selectedWidgetRequiredFields
                ? selectedWidgetRequiredFields.every(
                      (key: string) => !!activeCanvas?.selectedWidgetParams[key]
                  )
                : true,
        [activeCanvas?.selectedWidgetParams, selectedWidgetRequiredFields]
    );

    const addWidgetDisabled =
        !activeCanvas?.selectedWidgetDef || !activeCanvas?.isDraft || !hasAllRequiredParams;

    const query = search.trim().toLowerCase();
    const filtered = activeCanvas?.filteredWidgetDefs.filter(
        (widgetDef) =>
            !query ||
            widgetDef?.name?.toLowerCase().includes(query) ||
            (widgetDef?.description || '').toLowerCase().includes(query) ||
            widgetDef?.uiHints?.category.toLowerCase().includes(query)
    );

    // Group by category, deduped case-insensitively (defs mix "common"/"Common"/"COMMON").
    const groups: Record<string, { label: string; items: WidgetDefinitionLike[] }> = {};
    filtered?.forEach((widgetDef) => {
        const rawCategory = (widgetDef?.uiHints?.category || 'Other').trim();
        const categoryKey = rawCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!groups[categoryKey]) groups[categoryKey] = { label: rawCategory, items: [] };
        groups[categoryKey].items.push(widgetDef);
    });
    // "Common" leads (the default-open category, per concept); the rest are alphabetical.
    const groupNames = Object.keys(groups).sort((a, b) => {
        const ca = groups[a].label.toLowerCase() === 'common';
        const cb = groups[b].label.toLowerCase() === 'common';
        if (ca !== cb) return ca ? -1 : 1;
        return groups[a].label.localeCompare(groups[b].label);
    });

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
            }}
        >
            <Input
                allowClear
                size="small"
                prefix={<SearchOutlined />}
                placeholder={`Search ${activeCanvas?.filteredWidgetDefs.length} widgets…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 2 }}
            />

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                }}
            >
                <div
                    style={{
                        flex: 1,
                        maxHeight: 'calc(100vh - 400px)',
                        minHeight: 200,
                        overflowY: 'auto',
                    }}
                >
                    {groupNames.map((group) => {
                        const list = groups[group].items;
                        // A search shows every match; otherwise preview 2 rows until "Show all".
                        const isExpanded = !!query || !!expanded[group];
                        const shown = isExpanded ? list : list.slice(0, PREVIEW_COUNT);
                        const overflow = list.length - shown.length;
                        return (
                            <div key={group}>
                                <div className={styles.sec}>
                                    <span>{groups[group].label}</span>
                                    <span className={styles.ct}>{list.length}</span>
                                    <span className={styles.ln} />
                                </div>
                                <div className={styles.grid}>
                                    {shown.map((widgetDef) => (
                                        <WidgetCard key={widgetDef.id} widgetDef={widgetDef} />
                                    ))}
                                </div>
                                {overflow > 0 ? (
                                    <div
                                        className={styles.showall}
                                        onClick={() =>
                                            setExpanded((p) => ({
                                                ...p,
                                                [group]: true,
                                            }))
                                        }
                                    >
                                        Show all {list.length} →
                                    </div>
                                ) : !query && expanded[group] && list.length > PREVIEW_COUNT ? (
                                    <div
                                        className={styles.showall}
                                        onClick={() =>
                                            setExpanded((p) => ({
                                                ...p,
                                                [group]: false,
                                            }))
                                        }
                                    >
                                        Show less
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}

                    {!filtered?.length ? (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            No widgets match “{search}”.
                        </Typography.Text>
                    ) : null}
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 175,
                }}
            >
                <div>
                    <Divider style={{ margin: 8 }} />
                    <WidgetRequiredFieldsContainer />
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'end',
                    }}
                >
                    <Button
                        type="primary"
                        onClick={() => activeCanvas?.addWidget()}
                        disabled={addWidgetDisabled}
                        loading={activeCanvas?.loading}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
