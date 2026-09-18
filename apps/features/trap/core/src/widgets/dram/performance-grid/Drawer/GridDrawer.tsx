import { CheckCircleFilled, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './GridDrawer.module.scss';
import clsx from 'clsx';
import { BreakdownTab } from './BreakdownTab';
import { useAttributionStore } from '../state/useStore';
import { ViewBar } from './ViewBar';
import { DrawerTab } from '../data/types';
import { MetricsTab } from './MetricsTab';

const TABS: [DrawerTab, string][] = [
    ['breakdown', 'Breakdown'],
    ['metrics', 'Metrics'],
];

function ConfigBody({ tab }: { tab: DrawerTab }) {
    if (tab === 'breakdown') return <BreakdownTab />;
    if (tab === 'metrics') return <MetricsTab />;
    return null;
}
export const GridDrawer = ({ onDoneCb }: { onDoneCb: () => void }) => {
    const open = useAttributionStore((store) => store.drawerOpen);
    const rawTab = useAttributionStore((store) => store.drawerTab);
    const setTab = useAttributionStore((store) => store.setDrawerTab);
    const close = useAttributionStore((store) => store.closeDrawer);
    const groups = useAttributionStore((store) => store.groups);
    const activeGroup = useAttributionStore((store) => store.activeGroup);
    const saveState = useAttributionStore((store) => store.saveState);
    const resetView = useAttributionStore((store) => store.resetView);
    const mode = useAttributionStore((store) => store.mode);

    const onDone = () => {
        onDoneCb();
        close();
    };
    // the drawer only hosts config tabs now; guard against a stale selection tab
    const tab: DrawerTab = TABS.some(([t]) => t === rawTab) ? (rawTab as DrawerTab) : 'breakdown';
    const group = groups[activeGroup];
    const quick = mode === 'quick';
    const scopeName = quick ? 'Quick run' : (group?.name ?? '');

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                aria-label="Close drawer"
                className={clsx(styles['wscrim'], { [styles['wscrim-open']]: open })}
                onClick={close}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        close();
                    }
                }}
            />
            {/* styles[`pgdrawer${open ? '-open' : ''}`] */}
            <aside
                className={clsx(styles['pgdrawer'], {
                    [styles['pgdrawer-open']]: open,
                })}
            >
                <div className={styles['pg-head']}>
                    <div className={styles['ic']}>
                        <SettingOutlined />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h2>Customize · {scopeName}</h2>
                        <div className={styles['sub']}>
                            Breakdown, metrics, periods &amp; display for this view
                        </div>
                    </div>
                    <button className={styles['x']} onClick={close} style={{ marginLeft: 'auto' }}>
                        <CloseOutlined />
                    </button>
                </div>

                <div className={styles['uni-tabs']}>
                    {TABS.map(([t, label]) => (
                        <button
                            key={t}
                            className={styles[tab === t ? 'active' : '']}
                            onClick={() => setTab(t)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className={styles['uniBody']}>
                    <div className={styles['cfg-pad']}>
                        {!quick && <ViewBar />}
                        <ConfigBody tab={tab} />
                    </div>
                </div>

                <div className={styles['pg-foot']}>
                    {quick ? (
                        <>
                            <span
                                className={styles['cfg-save']}
                                style={{ color: 'var(--ant-color-tertiary)' }}
                            >
                                Quick run — changes aren&apos;t saved. Save as a group to keep this
                                view.
                            </span>
                            <span style={{ flex: 1 }} />
                            <button
                                className={clsx(styles['btn-primary'], styles['btn'])}
                                onClick={onDone}
                            >
                                Done
                            </button>
                        </>
                    ) : (
                        <>
                            Saved to group
                            <span
                                className={clsx(styles['cfg-save'], {
                                    [styles['cfg-save']]: saveState === 'saving',
                                })}
                            >
                                {saveState === 'saving' ? (
                                    'Saving…'
                                ) : (
                                    <>
                                        <CheckCircleFilled /> Saved to {group?.name ?? 'group'}
                                    </>
                                )}
                            </span>
                            <span style={{ flex: 1 }} />
                            <Button className={styles['btn']} onClick={resetView}>
                                Reset view
                            </Button>
                            <Button
                                className={clsx(styles['btn-primary'], styles['btn'])}
                                onClick={onDone}
                            >
                                Done
                            </Button>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
};
