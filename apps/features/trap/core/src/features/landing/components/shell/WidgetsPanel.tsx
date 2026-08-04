/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Divider, Input, Select, Typography } from 'antd';

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
import clsx from 'clsx';
import type { WidgetDefinitionLike } from '../../../../types/widget';
import styles from './WidgetsPanel.module.scss';
import { useActiveCanvas } from '../shell/activeCanvas';

// A representative icon per widget, inferred from its name/category — visual anchor
// for each catalogue row (mirrors the concept's widget cards).
function iconFor(widgetDef: WidgetDefinitionLike): React.ReactNode {
    const widgetName = widgetDef?.name?.toLowerCase() || '';
    const widgetCategory = widgetDef?.category?.toLowerCase() || '';
    if (/grid|table|tranche/.test(widgetName)) return <TableOutlined />;
    if (/chart|performance/.test(widgetName)) return <BarChartOutlined />;
    if (/deal|bank|capital|asset/.test(widgetName)) return <BankOutlined />;
    if (/cdi|upload|extract|staging/.test(widgetName)) return <UploadOutlined />;
    if (/text|comment|dynamic/.test(widgetName)) return <FontSizeOutlined />;
    if (/radio|checkbox|select|control|button|tabs|date|time/.test(widgetName))
        return <ControlOutlined />;
    if (/kpi|counter/.test(widgetName)) return <SlidersOutlined />;
    if (widgetCategory.includes('portfolio')) return <PieChartOutlined />;
    if (widgetCategory.includes('arc')) return <DashboardOutlined />;
    return <AppstoreOutlined />;
}

// In-drawer widget catalogue for the active draft. Click a row (or the + on hover)
// to drop the widget onto the canvas; the drawer stays open so you can add several.
export default function WidgetsPanel() {
    const [search, setSearch] = React.useState('');
    // Each category shows a short preview (2 rows) then a "Show all N →" expander — the same
    // language as the Workspaces list, so the whole drawer reads as one system.
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const [paramToUpdate, setParamToUpdate] = useState({ requiredField: '', value: '' });
    const PREVIEW_COUNT = 4; // 2 rows × 2 cards

    const activeCanvas = useActiveCanvas();

    useEffect(() => {
        activeCanvas?.onWidgetParamsSelect((params: { [key: string]: string }) => ({
            ...params,
            [paramToUpdate.requiredField]: paramToUpdate.value,
        }));
    }, [paramToUpdate]);

    const selectedWidgetRequiredFields = activeCanvas?.selectedWidgetDef?.configSchema?.required;
    const isSelectedWidgetHasRequiredFields = selectedWidgetRequiredFields?.length > 0;

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

    const getOptions = (field: any) => {
        // If the property has options field then it depends on another field.
        if (field.options) {
            const selectedOption = field.options.find((option: any) => {
                return (
                    activeCanvas?.selectedWidgetParams[option.condition.key] ===
                    option.condition.value
                );
            });

            if (selectedOption) return selectedOption.options;
        }
        return undefined;
    };

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

    const selectWidget = (widgetDef: WidgetDefinitionLike) => {
        activeCanvas?.setSelectedWidgetDefId(widgetDef?.id as string);
    };

    const card = (widgetDef: WidgetDefinitionLike) => (
        <div
            key={widgetDef?.id}
            className={clsx(styles.card, [
                {
                    [styles.activeCard]: activeCanvas?.selectedWidgetDef?.id === widgetDef?.id,
                },
            ])}
            onClick={() => selectWidget(widgetDef)}
            title={widgetDef?.description || widgetDef?.name}
        >
            <span className={styles.ic}>{iconFor(widgetDef)}</span>
            <span className={styles.tx}>
                <div className={styles.name}>{widgetDef?.name}</div>
                <div className={styles.desc}>
                    {widgetDef?.description || widgetDef?.uiHints?.category}
                </div>
            </span>
        </div>
    );
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
                <div style={{ flex: 1 }}>
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
                                <div className={styles.grid}>{shown.map(card)}</div>
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
                <div
                    style={{
                        height: '20%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <div>
                        <Divider />
                        {/* TODO move out of JSX */}
                        {isSelectedWidgetHasRequiredFields
                            ? selectedWidgetRequiredFields?.map((requiredField: string) => {
                                  let inputComponent;
                                  if (
                                      activeCanvas?.selectedWidgetDef?.configSchema?.properties[
                                          requiredField
                                      ]?.enum
                                  ) {
                                      const selectValue =
                                          activeCanvas?.selectedWidgetParams[requiredField];
                                      const selectOptions =
                                          (getOptions(
                                              activeCanvas?.selectedWidgetDef?.configSchema
                                                  .properties[requiredField]
                                          ) ||
                                              activeCanvas?.selectedWidgetDef?.configSchema
                                                  .properties[requiredField]?.enum) ??
                                          [];
                                      inputComponent = (
                                          <Select
                                              value={selectValue}
                                              onChange={(fieldName) =>
                                                  activeCanvas?.onWidgetParamsSelect(
                                                      (params: { [key: string]: string }) => ({
                                                          ...params,
                                                          [requiredField]: fieldName,
                                                      })
                                                  )
                                              }
                                              placeholder={
                                                  activeCanvas?.selectedWidgetDef?.configSchema
                                                      .properties[requiredField]?.title
                                              }
                                              style={{
                                                  width: '100%',
                                                  marginTop: 8,
                                              }}
                                              options={selectOptions.map((fieldName: string) => ({
                                                  value: fieldName,
                                                  label: fieldName,
                                              }))}
                                          />
                                      );
                                  } else {
                                      const inputValue =
                                          activeCanvas?.selectedWidgetParams[requiredField];

                                      inputComponent = (
                                          <Input
                                              value={inputValue}
                                              style={{
                                                  width: '100%',
                                                  marginTop: 8,
                                              }}
                                              onChange={(e) =>
                                                  setParamToUpdate({
                                                      requiredField,
                                                      value: e.target.value,
                                                  })
                                              }
                                              placeholder={
                                                  activeCanvas?.selectedWidgetDef?.configSchema
                                                      ?.properties[requiredField]?.title
                                              }
                                          />
                                      );
                                  }

                                  return (
                                      <div key={requiredField}>
                                          <Typography.Text strong style={{ fontSize: 12 }}>
                                              {
                                                  activeCanvas?.selectedWidgetDef?.configSchema
                                                      ?.properties[requiredField]?.title
                                              }
                                              *
                                          </Typography.Text>
                                          {inputComponent}
                                      </div>
                                  );
                              })
                            : null}
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
        </div>
    );
}
