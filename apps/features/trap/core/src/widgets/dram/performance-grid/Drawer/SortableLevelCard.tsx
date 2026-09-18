import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined, CloseOutlined } from '@ant-design/icons';
import { levelLabelShort, levelSummary } from '../data/breakdownDefaults';
import { BreakdownLevel } from '../types';
import styles from './SortableLevelCard.module.scss';
import clsx from 'clsx';
interface Props {
    id: string;
    index: number;
    level: BreakdownLevel;
    editing: boolean;
    canRemove: boolean;
    onSelect: () => void;
    onRemove: () => void;
}

/** One reorderable level card (dnd-kit sortable). The grip is the drag handle;
 *  clicking elsewhere on the card selects it for editing. */
export function SortableLevelCard({
    id,
    index,
    level,
    editing,
    canRemove,
    onSelect,
    onRemove,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const handleSelect = () => {
        onSelect();
    };

    return (
        <div
            ref={setNodeRef}
            role="button"
            tabIndex={0}
            className={clsx(styles['lvlcard'], {
                [styles['editing']]: editing,
                [styles['dragging']]: isDragging,
            })}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            onClick={(e) => {
                if (
                    (e.target as HTMLElement).closest('.acts') ||
                    (e.target as HTMLElement).closest('.grip')
                )
                    return;
                handleSelect();
            }}
            onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                if (
                    (e.target as HTMLElement).closest('.acts') ||
                    (e.target as HTMLElement).closest('.grip')
                )
                    return;

                e.preventDefault();
                handleSelect();
            }}
        >
            <div className={styles['lvlcard-lh']}>
                <span
                    className={styles['grip']}
                    title="Drag to reorder"
                    {...attributes}
                    {...listeners}
                >
                    <HolderOutlined />
                </span>

                <span className={styles['ix']}>{index + 1}</span>

                <div style={{ minWidth: 0 }}>
                    <div className={styles['lt']}>{levelLabelShort(level)}</div>
                    <div className={styles['lc']}>{levelSummary(level)}</div>
                </div>

                <div className={styles['acts']}>
                    {canRemove && (
                        <button
                            type="button"
                            title="Remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                        >
                            <CloseOutlined />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
