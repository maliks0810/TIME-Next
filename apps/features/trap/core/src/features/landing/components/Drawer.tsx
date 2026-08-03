/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { Button, message, Segmented, Space, Typography } from 'antd';
import React from 'react';
import WorkspacesPanel from './shell/WorkspacesPanel';
import styles from './Drawer.module.scss';
import { HudLandingSelection, HudWorkflowSelection } from '../../../pages/TrapLandingPage';
import {
    createDraftVersion,
    createTemplate,
    listTemplateVersions,
    Team,
    TemplateSummary,
} from '../../../api/trap';
import { useUserInfo } from '@platform/utils';

import { Kind, Visibility } from '../../../api/trap';
import WidgetsPanel from './shell/WidgetsPanel';
import { useActiveCanvas } from './shell/activeCanvas';
import { WorkflowTabModel } from '../types/landing.types';
export const Drawer = ({
    onLaunchWorkflow,
    onEditWorkflow,
    drawerOpen,
    setDrawerOpen,
    onActivateLanding,
    templates,
    onCloneTemplate,
    openDraftTab,
    activeWorkflow,
}: {
    activeWorkflow?: WorkflowTabModel;
    openDraftTab: (id: string, draftId: string, name: string) => void;
    onCloneTemplate: (ws: WorkflowTabModel) => Promise<void>;
    templates: TemplateSummary[];
    onLaunchWorkflow: (selection: HudWorkflowSelection) => Promise<void>;
    onEditWorkflow: (selection: WorkflowTabModel) => Promise<void>;
    drawerOpen: boolean;
    setDrawerOpen: (value: boolean) => void;
    onActivateLanding: (selection: HudLandingSelection) => void;
}) => {
    const { claims } = useUserInfo();
    const [drawerSeg, setDrawerSeg] = React.useState<'workspaces' | 'widgets' | 'themes'>(
        'workspaces'
    );

    const activeCanvas = useActiveCanvas();
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
                openDraftTab(tpl.id, draft.id, input.name);
                setDrawerOpen(false);

                message.success('Workspace created');
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to create workspace');
            }
        },
        [claims]
    );
    const activeIsDraft =
        String(activeWorkflow?.templateVersionStatus ?? '').toUpperCase() === 'DRAFT';
    const renderSegment = (drawerSeg: string) => {
        switch (drawerSeg) {
            case 'workspaces':
                return (
                    <WorkspacesPanel
                        templates={templates}
                        onLaunch={(selected) => {
                            onLaunchWorkflow(selected as any);
                            setDrawerOpen(false);
                        }}
                        onEdit={(ws) => {
                            console.log(ws);
                            onEditWorkflow(ws as any);
                            setDrawerOpen(false);
                        }}
                        onActivateLanding={(selected) => {
                            onLaunchWorkflow(selected as any);
                            setDrawerOpen(false);
                        }}
                        onSetHome={(selected) => {
                            onActivateLanding(selected as any);
                            setDrawerOpen(false);
                        }}
                        onCloneTemplate={(selected) => {
                            onCloneTemplate(selected as any);
                            setDrawerOpen(false);
                        }}
                        //TODO: implement when removing designer page
                        currentHomeId={''}
                        onCreateWorkspace={onCreateWorkspace}
                        //TODO: implement when removing designer page
                        onTemplateChanged={() => {}}
                    />
                );
            case 'widgets':
                return activeIsDraft ? (
                    activeCanvas?.widgets ? (
                        <WidgetsPanel
                            widgets={activeCanvas.widgets}
                            onAdd={activeCanvas.addWidget}
                        />
                    ) : (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Loading widgets…
                        </Typography.Text>
                    )
                ) : (
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Widgets can only be added to a Draft.
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            Open a draft — or “Edit — create a draft” on a published tab — to add
                            widgets.
                        </Typography.Text>
                    </Space>
                );
            default:
                return null;
        }
    };
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
                        { label: 'Widgets', value: 'widgets', disabled: !activeIsDraft },
                        { label: 'Themes', value: 'themes' },
                    ]}
                />
            </div>

            <div style={{ padding: '0 14px 14px', overflow: 'auto', flex: 1 }}>
                {renderSegment(drawerSeg)}
            </div>
        </div>
    );
};
