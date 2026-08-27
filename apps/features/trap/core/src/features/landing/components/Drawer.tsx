/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseOutlined } from '@ant-design/icons';
import { Button, message, Segmented, Typography } from 'antd';
import React, { useEffect } from 'react';
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
import { useGetUserClaims } from '../../../state/User/hooks';

import { Kind, Visibility } from '../../../api/trap';
import { WorkflowTabModel } from '../types/landing.types';
import ThemesPanel from './shell/ThemePanel';
import WidgetsPanelWrapper from './shell/WidgetsPanelWrapper';
import { getDefaultLandingTemplate } from '../../../utils/userPreferences';

export const Drawer = ({
    onLaunchWorkflow,
    onEditWorkflow,
    drawerState,
    setDrawerState,
    onActivateLanding,
    templates,
    onCloneTemplate,
    openDraftTab,
}: {
    openDraftTab: (id: string, draftId: string, name: string) => void;
    onCloneTemplate: (ws: WorkflowTabModel) => Promise<void>;
    templates: TemplateSummary[];
    onLaunchWorkflow: (selection: HudWorkflowSelection) => Promise<void>;
    onEditWorkflow: (selection: WorkflowTabModel) => Promise<void>;
    drawerState: { isOpen: boolean; initialDrawerSeg?: 'workspaces' | 'widgets' | 'themes' };
    setDrawerState: ({
        isOpen,
        initialDrawerSeg,
    }: {
        isOpen: boolean;
        initialDrawerSeg?: 'workspaces' | 'widgets' | 'themes';
    }) => void;
    onActivateLanding: (selection: HudLandingSelection) => void;
}) => {
    const claims = useGetUserClaims();
    const [drawerSeg, setDrawerSeg] = React.useState<'workspaces' | 'widgets' | 'themes'>(
        'workspaces'
    );

    const defaultLanding = getDefaultLandingTemplate();

    useEffect(() => {
        if (drawerState.initialDrawerSeg) {
            setDrawerSeg(drawerState.initialDrawerSeg);
        }
    }, [drawerState.initialDrawerSeg]);

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
                setDrawerState({ isOpen: false });

                message.success('Workspace created');
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to create workspace');
            }
        },
        [claims]
    );
    const renderSegment = (drawerSeg: string) => {
        switch (drawerSeg) {
            case 'workspaces':
                return (
                    <WorkspacesPanel
                        templates={templates}
                        onLaunch={(selected) => {
                            onLaunchWorkflow(selected as any);
                            setDrawerState({ isOpen: false });
                        }}
                        onEdit={(ws) => {
                            onEditWorkflow(ws as any);
                            setDrawerState({ isOpen: false });
                        }}
                        onActivateLanding={(selected) => {
                            onLaunchWorkflow(selected as any);
                            setDrawerState({ isOpen: false });
                        }}
                        onSetHome={(selected) => {
                            onActivateLanding(selected as any);
                            setDrawerState({ isOpen: false });
                        }}
                        onCloneTemplate={(selected) => {
                            onCloneTemplate(selected as any);
                            setDrawerState({ isOpen: false });
                        }}
                        //TODO: implement when removing designer page
                        currentHomeId={defaultLanding?.templateId}
                        onCreateWorkspace={onCreateWorkspace}
                        //TODO: implement when removing designer page
                        onTemplateChanged={() => {}}
                    />
                );
            case 'widgets':
                return <WidgetsPanelWrapper />;
            case 'themes':
                return <ThemesPanel />;
            default:
                return null;
        }
    };
    if (!drawerState.isOpen) return null;
    return (
        <div role="dialog" aria-label="Manage" className={styles.wrapper}>
            <div className={styles.header}>
                <Typography.Text strong>Manage</Typography.Text>
                <Button
                    size="small"
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => setDrawerState({ isOpen: false })}
                />
            </div>

            <div style={{ padding: 14 }}>
                <Segmented
                    block
                    value={drawerSeg}
                    onChange={(value) => setDrawerSeg(value as any)}
                    options={[
                        { label: 'Workspaces', value: 'workspaces', title: '' },
                        { label: 'Widgets', value: 'widgets', title: '' },
                        { label: 'Themes', value: 'themes', title: '' },
                    ]}
                />
            </div>

            <div style={{ padding: '0 14px 14px', overflow: 'auto', flex: 1 }}>
                {renderSegment(drawerSeg)}
            </div>
        </div>
    );
};
