import { EditOutlined, LinkOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import React, { useCallback, useState } from 'react';
import styles from './CreateNewSection.module.scss';
import { Kind, Visibility } from '../../../../api/trap';
import clsx from 'clsx';
import { DepartmentTree } from './WorkspacesPanel';
export const CreateNewSection = ({
    onCreateWorkspace,
    org1,
    org2,
    myTeam,
    setShowNew,
    orgTree,
}: {
    orgTree?: DepartmentTree | null;
    org1: string;
    org2: string;
    myTeam: string;
    onCreateWorkspace: (input: {
        name: string;
        kind: Kind;
        visibility: Visibility;
    }) => void | Promise<void>;
    setShowNew: (value: boolean) => void;
}) => {
    const [newName, setNewName] = React.useState('');
    const [newKind, setNewKind] = React.useState<Kind>(Kind.WORKFLOW);
    const [newVis, setNewVis] = React.useState<Visibility>(Visibility.PRIVATE);
    const [creating, setCreating] = React.useState(false);

    const [entitlment, setEntitlement] = React.useState({
        org1,
        org2,
        myTeam,
    });
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const landing = newKind === Kind.LANDING;
    const submitNew = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            await onCreateWorkspace({
                name: newName.trim(),
                kind: newKind,
                visibility: landing ? Visibility.PRIVATE : newVis,
            });
            // On success the parent opens the new draft tab and closes the drawer.
        } finally {
            setCreating(false);
        }
    };

    const fieldLabel = {
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ant-color-text-secondary)',
        marginBottom: 4,
    };
    const handleChangeTeam = () => {
        setIsEditingTeam((prev) => !prev);
    };
    const renderTeamChange = useCallback(() => {
        const departments = [...(orgTree?.keys() || [])].map((el) => ({ label: el, value: el }));

        const groups = [...(orgTree?.get(entitlment.org1)?.keys() || [])].map((el) => ({
            label: el,
            value: el,
        }));

        const teams = [...(orgTree?.get(entitlment.org1)?.get(entitlment.org2)?.keys() || [])].map(
            (el) => ({
                label: el,
                value: el,
            })
        );
        return (
            <div className={styles.teams}>
                <Select
                    defaultValue={entitlment.org1}
                    options={departments}
                    style={{ width: `100%` }}
                    onSelect={(value) => {
                        const group = [...(orgTree?.get(value)?.keys() || [])][0] || '';

                        const team = [...(orgTree?.get(value)?.get(group)?.keys() || [])][0];

                        setEntitlement((prev) => ({
                            ...prev,
                            org1: value,
                            org2: group,
                            myTeam: team,
                        }));
                    }}
                ></Select>
                <Select
                    value={entitlment.org2}
                    options={groups}
                    style={{ flex: 1 }}
                    onSelect={(value) => {
                        const team = [...(orgTree?.get(entitlment.org1)?.get(value) || [])][0];

                        setEntitlement((prev) => ({ ...prev, org2: value, myTeam: team }));
                    }}
                ></Select>
                <Select
                    defaultValue={entitlment.myTeam}
                    options={teams}
                    style={{ flex: 1 }}
                    onSelect={(value) => {
                        setEntitlement((prev) => ({ ...prev, myTeam: value }));
                    }}
                ></Select>
                <Button type="dashed" onClick={handleChangeTeam} style={{ marginBottom: 6 }}>
                    Save
                </Button>
            </div>
        );
    }, [orgTree, entitlment.org1, entitlment.org2, entitlment.myTeam]);
    return (
        <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>New workspace</div>

            <label style={fieldLabel}>Workspace name</label>
            <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Q3 RMBS Watchlist"
                onPressEnter={submitNew}
                style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <div>
                    <label style={fieldLabel}>Type</label>
                    <div className={styles['nf-seg']}>
                        <button
                            type="button"
                            className={clsx(styles[`nf-opt`], {
                                [styles['nf-opt-chosen']]: newKind === Kind.WORKFLOW,
                            })}
                            onClick={() => setNewKind(Kind.WORKFLOW)}
                        >
                            Workflow
                        </button>
                        <button
                            type="button"
                            className={clsx(styles[`nf-opt`], {
                                [styles['nf-opt-chosen']]: newKind === Kind.LANDING,
                            })}
                            onClick={() => {
                                setNewKind(Kind.LANDING);
                                setNewVis(Visibility.PRIVATE);
                            }}
                        >
                            Landing
                        </button>
                    </div>
                </div>
                <div>
                    <label style={fieldLabel}>Visibility</label>
                    <div className={styles['nf-seg']}>
                        <button
                            type="button"
                            className={clsx(styles[`nf-opt`], {
                                [styles['nf-opt-chosen']]:
                                    (landing ? Visibility.PRIVATE : newVis) === Visibility.PRIVATE,
                            })}
                            onClick={() => setNewVis(Visibility.PRIVATE)}
                        >
                            Private
                        </button>
                        <button
                            type="button"
                            className={clsx(styles[`nf-opt`], {
                                [styles['nf-opt-chosen']]: !landing && newVis === Visibility.PUBLIC,
                            })}
                            disabled={landing}
                            onClick={() => {
                                if (!landing) setNewVis(Visibility.PUBLIC);
                            }}
                        >
                            Public
                        </button>
                    </div>
                </div>
            </div>

            {/* Always reserve this row so toggling Workflow/Landing doesn't shift the
                        org chips + buttons below — just fade the hint in/out. */}
            <div
                style={{
                    fontSize: 10.5,
                    color: 'var(--ant-color-text-tertiary)',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    minHeight: 16,
                    visibility: landing ? 'visible' : 'hidden',
                }}
            >
                <LockOutlined /> Landings are always private.
            </div>

            <label style={{ ...fieldLabel, display: 'flex', alignItems: 'center', gap: 5 }}>
                <LockOutlined style={{ opacity: 0.65 }} /> Organization — from your profile
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {isEditingTeam ? (
                    renderTeamChange()
                ) : (
                    <>
                        <span className={styles['nf-chip']}>
                            <LinkOutlined />
                            {entitlment.org1 || '—'}
                        </span>
                        <span className={styles['nf-chip']}>
                            <LinkOutlined />
                            {entitlment.org2 || '—'}
                        </span>
                        <span className={styles['nf-chip']}>
                            <LinkOutlined />
                            {entitlment.myTeam || '—'}
                        </span>
                        <Button type="dashed" onClick={handleChangeTeam} style={{ height: '26px' }}>
                            <EditOutlined /> Change
                        </Button>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <Button
                    type="primary"
                    style={{ flex: 1 }}
                    disabled={!newName.trim()}
                    loading={creating}
                    onClick={submitNew}
                >
                    Create &amp; open
                </Button>
                <Button onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
        </div>
    );
};
