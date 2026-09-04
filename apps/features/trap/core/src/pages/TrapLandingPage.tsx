/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, Space, Dropdown, Button, message } from 'antd';
import {
    AppstoreOutlined,
    EllipsisOutlined,
    HomeOutlined,
    LayoutOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

import LandingTab from '../features/landing/LandingTab';
import WorkflowTab from '../features/workflow-runtime/WorkflowTab';

import { cloneTemplate, createDraftVersion, getTemplates, TemplateSummary } from '../api/trap';

import { useGetActiveTab, useSetActiveTab, useSetTabs } from '../state/Tabs/hooks';
import { useGetUserLogin } from '../state/User/hooks';
import { TemplateVersionLite } from '../features/workflow-launcher/types/workflowLauncher.types';
import { Drawer } from '../features/landing/components/Drawer';
import WorkflowDesignerPage from '../features/workflow-designer/WorkflowDesignerPage';
import { useUserProfile } from '../context/UserPreferenceContext';
import { PROFILE_KEYS } from '../context/constants';

type WorkflowTabModel = {
    key: string;
    workflowId: string;
    title: string;
    templateId: string;
    templateVersionStatus: string;
    ownerUserId: string;
    latestPublished?: TemplateVersionLite;
    designer?: boolean;
};

type OpenWorkflowRequest = Omit<WorkflowTabModel, 'bus'>;

export type HudWorkflowSelection = {
    templateId: string;
    templateName: string;
    templateVersionStatus: string;
    ownerUserId: string;
    latestPublished?: TemplateVersionLite;
};

export type HudLandingSelection = {
    templateId: string;
    ownerUserId: string;
};

const TAB_BAR_HEIGHT = 48;

export default function TrapLandingPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const { updateProfile, profile } = useUserProfile();
    const [workflows, setWorkflows] = React.useState<WorkflowTabModel[]>([]);

    const filteredWorkflows = useMemo(() => {
        const seen = new Set();
        return workflows.filter((item) => {
            if (seen.has(item.workflowId)) return false;
            seen.add(item.workflowId);
            return true;
        });
    }, [workflows]);
    const [allTemplates, setAllTemplates] = React.useState<TemplateSummary[]>([]);
    const activeKey = useGetActiveTab();
    const activeUser = sessionStorage.getItem('okta-name');
    const [drawerState, setDrawerState] = useState<{
        isOpen: boolean;
        initialDrawerSeg?: 'workspaces' | 'widgets' | 'themes';
    }>({ isOpen: false });

    const setTabs = useSetTabs();
    const login = useGetUserLogin();
    const currentUser = localStorage.getItem('debug-user') || login;

    const setActiveKeyToState = useSetActiveTab();
    const setActiveKey = (key: string) => {
        setActiveKeyToState(key);
    };
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    const templateId = searchParams.get('template_id');

    const initTemplates = async () => {
        const templates = await getTemplates();
        setAllTemplates(templates);
    };

    useEffect(() => {
        if (!profile) return;
        setWorkflows(profile[PROFILE_KEYS.ACTIVE_WORKFLOWS] || []);
    }, [profile]);

    useEffect(() => {
        if (activeUser) {
            if (templateId) {
                setIsInitialLoading(false);
                initWorkflowFromURL(templateId);
            } else {
                initTemplates();
            }
        }
    }, [activeUser]);

    const [landingSelection, setLandingSelection] = React.useState<
        HudLandingSelection | undefined
    >();

    const saveWorkflowsToState = (workflows: WorkflowTabModel[]) => {
        setTabs(workflows);
        updateProfile(PROFILE_KEYS.ACTIVE_WORKFLOWS, workflows);
    };

    useEffect(() => {
        if (templateId && templateId !== activeKey && allTemplates.length > 0) {
            const template = allTemplates.find((el) => el.id === templateId);

            if (template) {
                const selection: HudWorkflowSelection = {
                    templateId: templateId,
                    templateName: template.name,
                    templateVersionStatus: template?.latestPublished?.status,
                    ownerUserId: template.ownerUserId!,
                    latestPublished: template.latestPublished,
                };
                addWorkflowTab({
                    key: selection.templateId,
                    workflowId: selection.templateId,
                    title: selection.templateName,
                    templateId: selection.templateId,
                    templateVersionStatus: selection.templateVersionStatus,
                    ownerUserId: selection.ownerUserId,
                    latestPublished: selection.latestPublished,
                });
            }
        }
    }, [templateId]);

    useEffect(() => {
        if (activeKey === 'landing' && !isInitialLoading) {
            setSearchParams({}, { replace: true });
        }

        const activeWf = workflows.find(({ workflowId }) => workflowId === activeKey);
        if (activeWf) {
            const newParams = new URLSearchParams();
            newParams.set('template_id', activeWf.templateId);
            setSearchParams(newParams, { replace: true });
        }
    }, [activeKey]);

    const addWorkflowTab = React.useCallback(
        (ws: OpenWorkflowRequest) => {
            const existing = workflows.find((x) => x.workflowId === ws.workflowId);
            if (existing) {
                setActiveKey(existing.workflowId);
            } else {
                //TODO: this is run too many times
                setActiveKey(ws.workflowId);
                setWorkflows((prev) => [...prev, ws]);
                saveWorkflowsToState([...workflows, ws]);
            }
        },
        [workflows]
    );

    const closeWorkflowTab = React.useCallback((workflow: string) => {
        const newWorkflows = workflows.filter((x) => x.workflowId !== workflow);

        let newActiveKey;

        if (activeKey !== workflow) {
            newActiveKey = activeKey;
        } else if (workflows.length === 0) {
            newActiveKey = 'landing';
        } else {
            const closedIdx = workflows.findIndex((x) => x.workflowId === workflow);
            const fallback =
                workflows[Math.min(closedIdx, workflows.length - 1)] ??
                workflows[workflows.length - 1];

            newActiveKey = fallback?.workflowId ?? 'landing';
        }

        setActiveKey(newActiveKey);
        setWorkflows(newWorkflows);
        saveWorkflowsToState(newWorkflows);
    }, []);

    // Open (or in-place convert) a tab to an editable DRAFT. Forking your own published
    // reuses the same workflow tab (same templateId → update it); a clone is a new tab.
    const openDraftTab = React.useCallback(
        (templateId: string, versionId: string, title?: string) => {
            const existing = workflows.find((x) => x.templateId === templateId);
            const workflowId = existing ? existing.workflowId : `wf_${templateId}_${versionId}`;
            let newWorkflows;
            const idx = workflows.findIndex((x) => x.templateId === templateId);
            if (idx >= 0) {
                const next = [...workflows];
                next[idx] = {
                    ...next[idx],
                    templateVersionStatus: 'DRAFT',
                    title: title ?? next[idx].title,
                    ownerUserId: login || '',
                    designer: true,
                };
                newWorkflows = next;
            }
            newWorkflows = [
                ...workflows,
                {
                    key: workflowId,
                    ownerUserId: login || '',
                    workflowId: workflowId,
                    title: title ?? 'Draft',
                    templateId,
                    templateVersionStatus: 'DRAFT',
                    designer: true,
                },
            ];

            setWorkflows(newWorkflows);
            saveWorkflowsToState(newWorkflows);
            setActiveKey(workflowId);
        },
        [workflows, setActiveKey]
    );
    const onEditWorkspace = React.useCallback(
        async (ws: WorkflowTabModel) => {
            try {
                const status = String(ws.templateVersionStatus ?? '').toUpperCase();
                if (status === 'DRAFT') {
                    openDraftTab(ws.templateId, 'mock', ws.title);
                    return;
                }

                const templates = await getTemplates();
                const tpl = templates.find((t) => t.id === ws.templateId);
                const owned = !!tpl && String(tpl.ownerUserId ?? '') === String(currentUser ?? '');

                if (owned) {
                    const draft = await createDraftVersion(ws.templateId);
                    openDraftTab(ws.templateId, draft.id, ws.title);
                    message.success('Draft created — you can edit it now');
                } else {
                    const cloneName = `${ws.title} (copy)`;
                    const cloneId = await cloneTemplate(ws.templateId, cloneName);
                    const draft = await createDraftVersion(cloneId);
                    openDraftTab(cloneId, draft.id, cloneName);
                    message.success('Cloned to a new draft');
                }
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to open a draft');
            }
        },
        [openDraftTab, currentUser]
    );

    const onLaunchHudWorkflow = React.useCallback(
        async (selection: HudWorkflowSelection) => {
            try {
                addWorkflowTab({
                    key: selection.templateId,
                    workflowId: selection.templateId,
                    title: selection.templateName,
                    templateId: selection.templateId,
                    templateVersionStatus: selection.templateVersionStatus,
                    ownerUserId: selection.ownerUserId,
                    latestPublished: selection.latestPublished,
                });

                const newParams = new URLSearchParams();
                newParams.set('template_id', selection.templateId);
                setSearchParams(newParams);
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to launch workflow');
            }
        },
        [addWorkflowTab]
    );

    const onActivateHudLanding = React.useCallback((selection: HudLandingSelection) => {
        updateProfile(PROFILE_KEYS.ACTIVE_LANDING, selection.templateId);
        setLandingSelection({
            templateId: selection.templateId,
            ownerUserId: selection.ownerUserId,
        });

        setActiveKey('landing');
    }, []);

    const tabLabel = (ws: WorkflowTabModel) => {
        const isPublished =
            String(ws.templateVersionStatus ?? '').toUpperCase() === 'PUBLISHED' ||
            allTemplates.find((el) => el.id === ws.templateId)?.latestPublished?.status ===
                'PUBLISHED';

        const menuItems = [
            {
                key: 'edit',
                label: 'Edit Template',
                disabled: ws.ownerUserId !== currentUser,
                onClick: (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    onEditWorkspace(ws);
                },
            },
            {
                key: 'clone',
                label: isPublished ? 'Clone Template' : 'Clone Template (disabled on Draft)',
                disabled: !isPublished,
                onClick: async (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    await onEditWorkspace(ws);
                },
            },
        ];

        return (
            <Space size={8} align="center">
                <span>{ws.title}</span>

                <Dropdown trigger={['click']} menu={{ items: menuItems as any }}>
                    <Button
                        type="text"
                        size="small"
                        aria-label={`Actions for ${ws.title}`}
                        icon={<EllipsisOutlined style={{ transform: 'rotate(90deg)' }} />}
                        onClick={(e) => e.stopPropagation()}
                        style={{ opacity: 0.72 }}
                    />
                </Dropdown>
            </Space>
        );
    };

    const items = [
        {
            key: 'landing',
            label: <HomeOutlined />,
            closable: false,
            children: null,
        },
        ...filteredWorkflows.map((ws) => ({
            key: ws.workflowId,
            label: tabLabel(ws),
            closable: true,
            children: null,
        })),
    ];

    const initWorkflowFromURL = async (templateId: string) => {
        const templates = await getTemplates();
        setAllTemplates(templates);
        const template = templates.find((el) => el.id === templateId);

        if (template) {
            const selection: HudWorkflowSelection = {
                templateId: templateId,
                templateName: template.name,
                templateVersionStatus: template?.latestPublished?.status,
                ownerUserId: template.ownerUserId!,
                latestPublished: template.latestPublished,
            };
            onLaunchHudWorkflow(selection);
        } else {
            setSearchParams({}, { replace: true });
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ width: '100%' }}>
                <div
                    style={{
                        zIndex: '99',
                        height: TAB_BAR_HEIGHT,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        top: 0,
                    }}
                >
                    <AppstoreOutlined style={{ fontSize: 16 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.04em' }}>
                        TRAP
                    </span>
                    <Tabs
                        className="trap-tabs-bar-only"
                        type="editable-card"
                        hideAdd
                        activeKey={activeKey}
                        onChange={setActiveKey}
                        onEdit={(targetKey, action) => {
                            if (action === 'remove') closeWorkflowTab(String(targetKey));
                        }}
                        items={items as any}
                        tabBarStyle={{ margin: 0 }}
                        animated={false}
                    />
                    <Button
                        aria-label="Manage workspaces, widgets, and themes"
                        style={{ marginLeft: 'auto' }}
                        size="small"
                        type={drawerState.isOpen ? 'primary' : 'text'}
                        icon={<LayoutOutlined />}
                        onClick={() =>
                            setDrawerState(({ isOpen }) => ({
                                isOpen: !isOpen,
                            }))
                        }
                    />
                </div>

                <div style={{ width: '100%' }}>
                    <div
                        style={{
                            display: activeKey === 'landing' ? 'block' : 'none',
                            width: '100%',
                        }}
                    >
                        <LandingTab
                            onOpenWorkflow={(ws) => addWorkflowTab(ws)}
                            activeLandingSelection={landingSelection}
                        />
                    </div>
                    {filteredWorkflows.map((ws) => {
                        // New shell: a Draft tab IS the editable canvas (designer embedded in place);
                        // a Published tab is the read-only runtime. No separate Designer route.
                        const isDesignerTab = !!ws.designer;
                        return (
                            <div
                                key={ws.workflowId}
                                style={{
                                    display: activeKey === ws.workflowId ? 'block' : 'none',
                                    width: '100%',
                                }}
                            >
                                {isDesignerTab ? (
                                    <WorkflowDesignerPage
                                        active={activeKey === ws.workflowId}
                                        propTemplateId={ws.templateId}
                                        onRequestAddWidget={() => {
                                            setDrawerState({
                                                isOpen: true,
                                                initialDrawerSeg: 'widgets',
                                            });
                                        }}
                                        onPublished={() => {
                                            setWorkflows((prev) =>
                                                prev.map((w) =>
                                                    w.workflowId === ws.workflowId
                                                        ? {
                                                              ...w,
                                                              templateVersionStatus: 'PUBLISHED',
                                                              designer: false,
                                                          }
                                                        : w
                                                )
                                            );
                                        }}
                                    />
                                ) : (
                                    <WorkflowTab
                                        workflowId={ws.workflowId}
                                        templateId={ws.templateId}
                                        onClose={() => closeWorkflowTab(ws.workflowId)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <Drawer
                    openDraftTab={openDraftTab}
                    templates={allTemplates}
                    drawerState={drawerState}
                    setDrawerState={setDrawerState}
                    onLaunchWorkflow={onLaunchHudWorkflow}
                    onEditWorkflow={onEditWorkspace}
                    onActivateLanding={onActivateHudLanding}
                    onCloneTemplate={onEditWorkspace}
                />
            </div>
        </div>
    );
}
