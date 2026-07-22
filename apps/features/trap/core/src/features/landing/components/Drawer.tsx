/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { Button, message, Segmented, Typography } from 'antd';
import React from 'react';
import WorkspacesPanel from './shell/WorkspacesPanel';
import styles from './Drawer.module.scss';
import { HudLandingSelection, HudWorkflowSelection } from '../../../pages/TrapLandingPage';
import { createDraftVersion, createTemplate, listTemplateVersions, Team } from '../../../api/trap';
import { useUserInfo } from '@platform/utils';

import { useNavigate } from 'react-router-dom';
import { Kind, Visibility } from '../../../api/trap';
export const Drawer = ({
    onLaunchWorkflow,
    onEditWorkflow,
    drawerOpen,
    setDrawerOpen,
}: {
    onLaunchWorkflow: (selection: HudWorkflowSelection) => Promise<void>;
    onEditWorkflow: (selection: HudWorkflowSelection) => void;
    drawerOpen: boolean;
    setDrawerOpen: (value: boolean) => void;
    onActivateLanding: (selection: HudLandingSelection) => void;
}) => {
    const nav = useNavigate();
    const { claims } = useUserInfo();
    const [drawerSeg, setDrawerSeg] = React.useState<'workspaces' | 'widgets' | 'themes'>(
        'workspaces'
    );

    const onCreateWorkspace = React.useCallback(
        async (input: { name: string; kind: Kind; visibility: Visibility }, organization: Team) => {
            try {
                const tpl = await createTemplate({
                    name: input.name,
                    kind: input.kind,
                    visibility: input.visibility,
                    class1: organization.departmentName,
                    class2: organization.groupName,
                    class3: organization.teamName,
                });
                // createTemplate seeds an empty DRAFT version; use it (fall back to createDraftVersion).
                const versions = await listTemplateVersions(tpl.id);
                let draft = versions.find((v: any) => String(v.status).toUpperCase() === 'DRAFT');
                if (!draft) draft = await createDraftVersion(tpl.id);
                // openDraftTab(tpl.id, draft.id, input.name);
                setDrawerOpen(false);

                nav(`designer?templateId=${tpl.id}`);
                console.log(draft, tpl);
                message.success('Workspace created');
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to create workspace');
            }
        },
        [claims]
    );

    if (!drawerOpen) return null;
    return (
        <div role="dialog" aria-label="Manage" className={styles.wrapper}>
            <div className={styles.header}>
                <Typography.Text strong>Manage</Typography.Text>
                <Button
                    size="small"
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => setDrawerOpen(false)}
                />
            </div>

            <div style={{ padding: 14 }}>
                <Segmented
                    block
                    value={drawerSeg}
                    onChange={(value) => setDrawerSeg(value as any)}
                    options={[
                        { label: 'Workspaces', value: 'workspaces' },
                        { label: 'Widgets', value: 'widgets', disabled: true },
                        { label: 'Themes', value: 'themes' },
                    ]}
                />
            </div>

            <div style={{ padding: '0 14px 14px', overflow: 'auto', flex: 1 }}>
                {drawerSeg === 'workspaces' ? (
                    <WorkspacesPanel
                        onLaunch={(selected) => {
                            onLaunchWorkflow(selected as any);
                            setDrawerOpen(false);
                        }}
                        onEdit={(ws) => {
                            onEditWorkflow(ws as any);
                            setDrawerOpen(false);
                        }}
                        onActivateLanding={(selected) => {
                            onLaunchWorkflow(selected as any);
                            setDrawerOpen(false);
                        }}
                        onSetHome={() => {}}
                        currentHomeId={''}
                        onCreateWorkspace={onCreateWorkspace}
                        onTemplateChanged={() => {}}
                    />
                ) : null}
            </div>
        </div>
    );
};
