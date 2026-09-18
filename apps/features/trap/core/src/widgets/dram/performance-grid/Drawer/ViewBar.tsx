import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useAttributionStore } from '../state/useStore';
import { groupViews } from '../data/views';
import styles from './GridDrawer.module.scss';
/**
 * View manager shown atop the Customize tabs: switch between a group's saved
 * views, rename the active one inline, add a new one, or delete (when >1).
 * The active view is the one whose config the Customize tabs edit + auto-save.
 */
export function ViewBar() {
    const groups = useAttributionStore((s) => s.groups);
    const activeGroup = useAttributionStore((s) => s.activeGroup);
    const switchView = useAttributionStore((s) => s.switchView);
    const addView = useAttributionStore((s) => s.addView);
    const renameView = useAttributionStore((s) => s.renameView);
    const deleteView = useAttributionStore((s) => s.deleteView);

    const g = groups[activeGroup];
    if (!g) return null;
    const views = groupViews(g);
    const activeId = g.activeViewId ?? views[0]?.id;

    return (
        <div className={styles['viewbar']}>
            <span className={styles['vb-label']}>Views</span>
            <div className={styles['vb-tabs']}>
                {views.map((v) =>
                    v.id === activeId ? (
                        <span key={v.id} className={styles['vb-chip on']}>
                            <input
                                className={styles['vb-name']}
                                value={v.name}
                                aria-label="View name"
                                onChange={(e) => renameView(activeGroup, v.id, e.target.value)}
                                size={Math.max(6, v.name.length)}
                            />
                            {views.length > 1 && (
                                <button
                                    className={styles['vb-del']}
                                    title="Delete this view"
                                    aria-label="Delete this view"
                                    onClick={() => deleteView(activeGroup, v.id)}
                                >
                                    <CloseOutlined />
                                </button>
                            )}
                        </span>
                    ) : (
                        <button
                            key={v.id}
                            className={styles['vb-chip']}
                            onClick={() => switchView(activeGroup, v.id)}
                        >
                            {v.name}
                        </button>
                    )
                )}
                <button
                    className={styles['vb-add']}
                    title="Add a view"
                    onClick={() => addView(activeGroup)}
                >
                    <PlusOutlined /> New view
                </button>
            </div>
        </div>
    );
}
