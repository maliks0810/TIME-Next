import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { HolderOutlined } from '@ant-design/icons';
import { SortableLevelCard } from './SortableLevelCard';
import { ClassEditor } from './ClassEditor';
import { useAttributionStore } from '../state/useStore';
import styles from './BreakdownTab.module.scss';

/** Breakdown tab — ordered levels (drag to reorder) + the class editor. */
export function BreakdownTab() {
    const levels = useAttributionStore((store) => store.levels);
    const editLevel = useAttributionStore((store) => store.editLevel);
    const setEditLevel = useAttributionStore((store) => store.setEditLevel);
    const addLevel = useAttributionStore((store) => store.addLevel);
    const removeLevel = useAttributionStore((store) => store.removeLevel);
    const moveLevel = useAttributionStore((store) => store.moveLevel);

    // 4px activation distance → clicks still select; only a real drag reorders.
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    // Stable per-level ids that travel with the item, so a dropped reorder commits
    // (index ids would make SortableContext think nothing changed → snap-back).
    const ids = levels.map((l, i) => l.id ?? String(i));

    const onDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const from = ids.indexOf(active.id as string);
        const to = ids.indexOf(over.id as string);
        if (from < 0 || to < 0) return;
        moveLevel(from, to);
    };

    const flat = levels.length === 0;
    const editIdx = Math.max(0, Math.min(editLevel, levels.length - 1));
    const l = levels[editIdx];

    return (
        <div className={`${styles['cfg-cols']}  ${styles['cfg-breakdown']}`}>
            <div>
                <div className={styles['subhead']}>Breakdown levels</div>
                <div className={styles['cfg-hint']}>
                    {flat ? (
                        'No grouping — the grid lists every security flat. Add a level to group them.'
                    ) : (
                        <>
                            Drag <HolderOutlined /> to reorder · click a level to edit · groups
                            top-down, then Security.
                        </>
                    )}
                </div>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        {levels.map((lvl, i) => (
                            <SortableLevelCard
                                key={ids[i]}
                                id={ids[i]}
                                index={i}
                                level={lvl}
                                editing={i === editIdx}
                                canRemove
                                onSelect={() => setEditLevel(i)}
                                onRemove={() => removeLevel(i)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                {flat && (
                    <div className={styles['flat-note']}>
                        <span className={styles['flat-tag']}>Flat</span> All securities · no
                        grouping
                    </div>
                )}
                <button
                    className={styles['addband']}
                    id="addLevel"
                    style={{ height: 34, fontSize: 12 }}
                    onClick={addLevel}
                >
                    + Add breakdown level
                </button>
            </div>
            <div>
                {flat ? (
                    <div className={`${styles['cfg-editor']} ${styles['cfg-editor-empty']}`}>
                        <div className={styles['cfg-editor-h']}>No grouping</div>
                        <p className={styles['flat-empty']}>
                            The grid is showing a <b>flat list of every security</b> — no roll-ups.
                            Add a breakdown level on the left to group holdings (by sector, region,
                            bands or rules).
                        </p>
                    </div>
                ) : (
                    <div className={styles['cfg-editor']}>
                        <div className={styles['cfg-editor-h']}>
                            Editing <b>Level {editIdx + 1}</b> — choose how positions in this level
                            are grouped
                        </div>
                        <ClassEditor level={l} index={editIdx} />
                    </div>
                )}
            </div>
        </div>
    );
}
