import { useState } from 'react';
import {
    Button,
    ColorPicker,
    Drawer,
    Dropdown,
    Input,
    Modal,
    Select,
    Space,
    Switch,
    Tooltip,
} from 'antd';
import {
    CloseOutlined,
    DeleteOutlined,
    HolderOutlined,
    PlusOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ColumnTreeField from './ColumnTreeField';
import {
    DEFAULT_MISSING_COLOR,
    DEFAULT_OUTLIER_COLOR,
    HEAT_RAMPS,
    isRampSpec,
    type ColumnDef,
    type RampPreset,
    type RampSpec,
} from './types';
import './heatgrid.scss';
import {
    activeGrouping,
    groupingDims,
    columnAxisGroups,
    heatScales,
    setGrouping,
    setMemberSelected,
    rampRgb,
    setHeatRamp,
    setHeatOutlierColor,
    setHeatMissingColor,
} from './helpers';

const rgbToHex = ([r, g, b]: [number, number, number]) =>
    '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');

/**
 * Heat Map Grid display-settings panel: row grouping + row toggles, the column
 * axis chips, the column tree, a color-spectrum picker per heat scale, and a
 * templates footer. Renders by projecting the column catalog — no perfgrid code
 * (its own copy of the templates UI, per the SPLIT).
 */

export interface TemplatesSection<T> {
    templates: { id: string; name: string; settings: T }[];
    activeId: string | null;
    dirty: boolean;
    onApply: (id: string) => void;
    onSave: (name: string) => void;
    onUpdate: () => void;
    onDelete: (id: string) => void;
}

interface Props {
    view: 'drawer' | 'modal';
    open: boolean;
    onClose: () => void;
    columns: ColumnDef[];
    onColumnsChange: (next: ColumnDef[]) => void;
    showLeaves: boolean;
    onShowLeavesChange: (v: boolean) => void;
    leafRows?: { title: string; sub?: string };
    /** Blank in-tree rollup rows. Omit the handler to hide the toggle. */
    blankGroupRows?: boolean;
    onBlankGroupRowsChange?: (v: boolean) => void;
    /** Show the pinned total row. Omit the handler to hide the toggle. */
    showTotal?: boolean;
    onShowTotalChange?: (v: boolean) => void;
    /** Show the dimension column header label. Omit the handler to hide the toggle. */
    showNameHeader?: boolean;
    onShowNameHeaderChange?: (v: boolean) => void;
    /** Heading for the column-tree block. Default "Columns". */
    seriesLabel?: string;
    onReset: () => void;
    /** Omit to hide the templates footer. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    templatesSection?: TemplatesSection<any>;
}

function SortableLevel({
    id,
    index,
    label,
    onRemove,
}: {
    id: string;
    index: number;
    label: string;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });
    return (
        <div
            ref={setNodeRef}
            className={`level-item${isDragging ? ' dragging' : ''}`}
            style={{ transform: CSS.Transform.toString(transform), transition }}
        >
            <span className="level-handle" {...attributes} {...listeners}>
                <HolderOutlined />
            </span>
            <span className="level-index">{index + 1}</span>
            <span className="level-label">{label}</span>
            <Button
                type="text"
                size="small"
                className="level-remove"
                icon={<CloseOutlined />}
                onClick={onRemove}
                aria-label={`Remove ${label}`}
            />
        </div>
    );
}

function ToggleRow({
    title,
    sub,
    checked,
    disabled,
    disabledHint,
    onChange,
}: {
    title: string;
    sub?: string;
    checked: boolean;
    disabled?: boolean;
    disabledHint?: string;
    onChange: (v: boolean) => void;
}) {
    const toggle = (
        <Switch size="small" checked={checked} disabled={disabled} onChange={onChange} />
    );
    return (
        <div className="toggle-row">
            <div>
                <div className="toggle-title">{title}</div>
                {sub && <div className="toggle-sub">{sub}</div>}
            </div>
            {disabled && disabledHint ? <Tooltip title={disabledHint}>{toggle}</Tooltip> : toggle}
        </div>
    );
}

export default function HeatSettingsPanel({
    open,
    view,
    onClose,
    columns,
    onColumnsChange,
    showLeaves,
    onShowLeavesChange,
    leafRows,
    blankGroupRows = false,
    onBlankGroupRowsChange,
    showTotal = true,
    onShowTotalChange,
    showNameHeader = true,
    onShowNameHeaderChange,
    seriesLabel = 'Columns',
    onReset,
    templatesSection,
}: Props) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    const [newTemplateName, setNewTemplateName] = useState('');

    const active = activeGrouping(columns);
    const groupKeys = active.map((d) => d.key);
    const available = groupingDims(columns).filter((d) => !groupKeys.includes(d.key));
    const axes = columnAxisGroups(columns);
    const scales = heatScales(columns);

    const applyGrouping = (keys: string[]) => onColumnsChange(setGrouping(columns, keys));

    const onDragEnd = (e: DragEndEvent) => {
        const { active: a, over } = e;
        if (!over || a.id === over.id) return;
        const oldIndex = groupKeys.indexOf(a.id as string);
        const newIndex = groupKeys.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return;
        applyGrouping(arrayMove(groupKeys, oldIndex, newIndex));
    };

    const saveNew = () => {
        const name = newTemplateName.trim();
        if (!name) return;
        templatesSection?.onSave(name);
        setNewTemplateName('');
    };

    const activeTemplate = templatesSection?.templates.find(
        (t) => t.id === templatesSection.activeId
    );

    const footer = templatesSection ? (
        <div className="tpl-footer">
            <div className="sec-title">Templates</div>
            {templatesSection.templates.length === 0 && (
                <div className="sec-caption">
                    Save the current configuration — grouping, quarters, columns, spectrum — and
                    switch setups instantly.
                </div>
            )}
            {templatesSection.templates.length > 0 && (
                <div className="tpl-list">
                    {templatesSection.templates.map((t) => (
                        <div
                            key={t.id}
                            className={`tpl-row${t.id === templatesSection.activeId ? ' active' : ''}`}
                        >
                            <button
                                className="tpl-apply"
                                onClick={() => templatesSection.onApply(t.id)}
                            >
                                <span className="tpl-name">{t.name}</span>
                                {t.id === templatesSection.activeId && (
                                    <span
                                        className={`tpl-state${templatesSection.dirty ? ' dirty' : ''}`}
                                    >
                                        {templatesSection.dirty ? 'modified' : 'active'}
                                    </span>
                                )}
                            </button>
                            <Button
                                type="text"
                                size="small"
                                className="level-remove"
                                icon={<DeleteOutlined />}
                                onClick={() => templatesSection.onDelete(t.id)}
                                aria-label={`Delete template ${t.name}`}
                            />
                        </div>
                    ))}
                </div>
            )}
            {activeTemplate && templatesSection.dirty && (
                <Button
                    block
                    size="small"
                    style={{ marginBottom: 8 }}
                    onClick={templatesSection.onUpdate}
                >
                    Update “{activeTemplate.name}”
                </Button>
            )}
            <div className="tpl-save">
                <Input
                    size="small"
                    placeholder="New template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    onPressEnter={saveNew}
                    maxLength={40}
                />
                <Button size="small" onClick={saveNew} disabled={!newTemplateName.trim()}>
                    Save
                </Button>
            </div>
        </div>
    ) : undefined;

    const content = (
        <div className="settings-wrapper">
            <div className="ds-sec first">Rows</div>
            <div className="sec-caption">Drag to reorder — rows nest in this order.</div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={groupKeys} strategy={verticalListSortingStrategy}>
                    {active.map((d, i) => (
                        <SortableLevel
                            key={d.key}
                            id={d.key}
                            index={i}
                            label={d.label}
                            onRemove={() => applyGrouping(groupKeys.filter((k) => k !== d.key))}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <Dropdown
                trigger={['click']}
                disabled={available.length === 0}
                menu={{
                    items: available.map((d) => ({ key: d.key, label: d.label })),
                    onClick: ({ key }) => applyGrouping([...groupKeys, key]),
                }}
            >
                <Button block type="dashed" icon={<PlusOutlined />}>
                    Add grouping level
                </Button>
            </Dropdown>
            {leafRows && (
                <ToggleRow
                    title={leafRows.title}
                    sub={leafRows.sub}
                    checked={showLeaves}
                    disabled={groupKeys.length === 0 || blankGroupRows}
                    disabledHint={
                        blankGroupRows
                            ? "Turn off 'Blank rollup rows' first"
                            : 'Add a grouping level first'
                    }
                    onChange={onShowLeavesChange}
                />
            )}
            {onBlankGroupRowsChange && (
                <ToggleRow
                    title="Blank rollup rows"
                    sub="Group rows show labels only — no values or color"
                    checked={blankGroupRows}
                    disabled={!showLeaves}
                    disabledHint="Show detail rows first — otherwise nothing would render"
                    onChange={onBlankGroupRowsChange}
                />
            )}
            {onShowTotalChange && (
                <ToggleRow
                    title="Show total row"
                    sub="The pinned summary row above the grid"
                    checked={showTotal}
                    onChange={onShowTotalChange}
                />
            )}
            {onShowNameHeaderChange && (
                <ToggleRow
                    title="Column header"
                    sub="Title above the dimension column"
                    checked={showNameHeader}
                    onChange={onShowNameHeaderChange}
                />
            )}

            {axes.length > 0 && (
                <>
                    <div className="ds-sec">{axes.length === 1 ? axes[0].label : 'Stacks'}</div>
                    {axes.map((axis) => {
                        const members = (axis.children ?? []).filter(
                            (m) => m.role === 'group' && m.selectable
                        );
                        return (
                            <div key={axis.key} className="pg-block hg-block">
                                {axes.length > 1 && <div className="pg-label">{axis.label}</div>}
                                <div className="freq-grid">
                                    {members.map((m) => {
                                        const on = !!m.selected;
                                        return (
                                            <Tooltip key={m.key} title={m.tooltip}>
                                                <button
                                                    type="button"
                                                    className={`freq-chip${on ? ' on' : ''}`}
                                                    onClick={() =>
                                                        onColumnsChange(
                                                            setMemberSelected(columns, m.key, !on)
                                                        )
                                                    }
                                                >
                                                    {m.label}
                                                </button>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            <ColumnTreeField
                columns={columns}
                onColumnsChange={onColumnsChange}
                label={seriesLabel}
            />

            {scales.length > 0 && (
                <>
                    <div className="ds-sec">Color spectrum</div>
                    <div className="sec-caption">
                        Spectrum, outliers, and no-data — per heat scale.
                    </div>
                    {scales.map((s) => {
                        const custom = isRampSpec(s.ramp);
                        const fromHex = custom
                            ? (s.ramp as RampSpec).from
                            : rgbToHex(rampRgb(0, s.ramp));
                        const midHex = custom
                            ? ((s.ramp as RampSpec).mid ?? rgbToHex(rampRgb(0.5, s.ramp)))
                            : rgbToHex(rampRgb(0.5, s.ramp));
                        const toHex = custom
                            ? (s.ramp as RampSpec).to
                            : rgbToHex(rampRgb(1, s.ramp));
                        return (
                            <div key={s.scale} className="ds-color">
                                {scales.length > 1 && <div className="pg-label">{s.label}</div>}
                                <div className="toggle-row">
                                    <div className="toggle-title">Spectrum</div>
                                    <Select
                                        size="small"
                                        value={custom ? 'custom' : (s.ramp as RampPreset)}
                                        style={{ width: 132 }}
                                        popupMatchSelectWidth={false}
                                        options={[
                                            ...HEAT_RAMPS.map((r) => ({
                                                value: r.key,
                                                label: r.label,
                                            })),
                                            { value: 'custom', label: 'Custom…' },
                                        ]}
                                        onChange={(v: string) =>
                                            onColumnsChange(
                                                setHeatRamp(
                                                    columns,
                                                    s.scale,
                                                    v === 'custom'
                                                        ? {
                                                              from: fromHex,
                                                              mid: midHex,
                                                              to: toHex,
                                                          }
                                                        : (v as RampPreset)
                                                )
                                            )
                                        }
                                    />
                                </div>
                                {custom && (
                                    <div className="ds-color-pair">
                                        <span>Begin</span>
                                        <ColorPicker
                                            size="small"
                                            disabledAlpha
                                            value={fromHex}
                                            onChange={(c) =>
                                                onColumnsChange(
                                                    setHeatRamp(columns, s.scale, {
                                                        ...(s.ramp as RampSpec),
                                                        from: c.toHexString(),
                                                    })
                                                )
                                            }
                                        />
                                        <span>Mid</span>
                                        <ColorPicker
                                            size="small"
                                            disabledAlpha
                                            value={midHex}
                                            onChange={(c) =>
                                                onColumnsChange(
                                                    setHeatRamp(columns, s.scale, {
                                                        ...(s.ramp as RampSpec),
                                                        mid: c.toHexString(),
                                                    })
                                                )
                                            }
                                        />
                                        <span>End</span>
                                        <ColorPicker
                                            size="small"
                                            disabledAlpha
                                            value={toHex}
                                            onChange={(c) =>
                                                onColumnsChange(
                                                    setHeatRamp(columns, s.scale, {
                                                        ...(s.ramp as RampSpec),
                                                        to: c.toHexString(),
                                                    })
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                <div className="toggle-row">
                                    <div className="toggle-title">Outlier</div>
                                    <ColorPicker
                                        size="small"
                                        disabledAlpha
                                        value={s.outlierColor ?? DEFAULT_OUTLIER_COLOR}
                                        onChange={(c) =>
                                            onColumnsChange(
                                                setHeatOutlierColor(
                                                    columns,
                                                    s.scale,
                                                    c.toHexString()
                                                )
                                            )
                                        }
                                    />
                                </div>
                                <div className="toggle-row">
                                    <div className="toggle-title">No data</div>
                                    <ColorPicker
                                        size="small"
                                        disabledAlpha
                                        value={s.missingColor ?? DEFAULT_MISSING_COLOR}
                                        onChange={(c) =>
                                            onColumnsChange(
                                                setHeatMissingColor(
                                                    columns,
                                                    s.scale,
                                                    c.toHexString()
                                                )
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
            {footer}
        </div>
    );
    if (view === 'drawer') {
        return (
            <Drawer
                title="Display settings"
                open={open}
                onClose={onClose}
                width={376}
                getContainer={false}
                rootStyle={{ position: 'absolute' }}
                rootClassName="hg-panel"
                extra={
                    <Button type="text" size="small" icon={<UndoOutlined />} onClick={onReset}>
                        Reset
                    </Button>
                }
            >
                {content}
            </Drawer>
        );
    }

    return (
        <Modal
            title="Display settings"
            open={open}
            onCancel={onClose}
            rootClassName="hg-panel"
            footer={
                <Space>
                    <Button type="text" size="small" icon={<UndoOutlined />} onClick={onReset}>
                        Reset
                    </Button>
                    <Button type={'primary'} onClick={onClose}>
                        Ok
                    </Button>
                </Space>
            }
        >
            {content}
        </Modal>
    );
}
