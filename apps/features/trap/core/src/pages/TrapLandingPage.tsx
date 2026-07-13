/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Tabs, Space, Dropdown, Button, message, Tooltip } from 'antd';
import { EllipsisOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useUserInfo } from '@platform/utils';

import LandingTab from '../features/landing/LandingTab';
import WorkflowTab from '../features/workflow-runtime/WorkflowTab';
import TrapHud from '../components/common/TrapHud';

import { cloneTemplate, createDraftVersion, getTemplates } from '../api/trap';

import { setDefaultLandingTemplate } from '../utils/userPreferences';
import { useGetActiveTab, useSetActiveTab } from '../state/Tabs/hooks';
import { useGetActiveUser } from '../state/User/hooks';

type WorkflowTabModel = {
    key: string;
    workflowId: string;
    title: string;
    templateId: string;
    templateVersionStatus: string;
    ownerUserId: string;
};

type OpenWorkflowRequest = Omit<WorkflowTabModel, 'bus'>;

type HudWorkflowSelection = {
    templateId: string;
    templateName: string;
    templateVersionStatus: string;
    ownerUserId: string;
};

type HudLandingSelection = {
    templateId: string;
    ownerUserId: string;
};

const TAB_BAR_HEIGHT = 48;
const WORKFLOWS_STORAGE_KEY = 'activeWorkflows';

const saveTabsToStorage = (workflows: WorkflowTabModel[]) => {
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
};
const loadTabsFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(WORKFLOWS_STORAGE_KEY) as string) ?? [];
    } catch {
        return [];
    }
};

export default function TrapLandingPage() {
    const nav = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [workflows, setWorkflows] = React.useState<WorkflowTabModel[]>(loadTabsFromStorage());
    const activeKey = useGetActiveTab();
    const activeUser = useGetActiveUser();

    const { login } = useUserInfo();
    const currentUser = localStorage.getItem('debug-user') || login;

    const setActiveKey = useSetActiveTab();
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    useEffect(() => {
        const templateId = searchParams.get('template_id');

        if (templateId && activeUser) {
            setIsInitialLoading(false);
            initWorkflowFromURL(templateId);
        }
    }, [activeUser]);

    const [landingSelection, setLandingSelection] = React.useState<
        HudLandingSelection | undefined
    >();

    useEffect(() => {
        saveTabsToStorage(workflows);
    }, [workflows]);

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
            const existing = workflows.find((x) => x.templateId === ws.templateId);
            if (existing) {
                setActiveKey(existing.workflowId);
            } else {
                setWorkflows((prev) => {
                    const existingWorkflow = prev.find((p) => p.title === ws.title);
                    if (existingWorkflow) {
                        setActiveKey(existingWorkflow.workflowId);
                        return [...prev];
                    }
                    setActiveKey(ws.workflowId);
                    return [...prev, ws];
                });
            }
        },
        [workflows]
    );

    const closeWorkflowTab = React.useCallback((workflow: string) => {
        setWorkflows((prev) => {
            const next = prev.filter((x) => x.workflowId !== workflow);

            let newActiveKey;

            if (activeKey !== workflow) {
                newActiveKey = activeKey;
            } else if (next.length === 0) {
                newActiveKey = 'landing';
            } else {
                const closedIdx = prev.findIndex((x) => x.workflowId === workflow);
                const fallback =
                    next[Math.min(closedIdx, next.length - 1)] ?? next[next.length - 1];

                newActiveKey = fallback?.workflowId ?? 'landing';
            }

            setActiveKey(newActiveKey);

            return next;
        });
    }, []);

    const showTabs = workflows.length > 0;

    const onEditTemplate = async (ws: WorkflowTabModel) => {
        if (ws.templateVersionStatus === 'PUBLISHED' || ws.templateVersionStatus === '') {
            await createDraftVersion(ws.templateId);
            nav(`designer?templateId=${ws.templateId}`);

            return;
        }
        nav(`designer?templateId=${ws.templateId}`);
    };

    const onCloneTemplate = async (ws: WorkflowTabModel) => {
        try {
            const cloneName = `${ws.title} Copy`;

            const result: any = await cloneTemplate(ws.templateId, cloneName);
            const nextTemplate = result?.template;
            const nextVersion = result?.version;
            if (nextTemplate && nextVersion) {
                nav(`designer?templateId=${nextTemplate.id}`);
            }
        } catch (e: any) {
            message.error(e?.message ?? 'Failed to clone template');
        }
    };

    const onExport = () => {
        message.info('Export is not wired yet');
    };

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

    const onEditHudWorkflow = React.useCallback(
        (selection: HudWorkflowSelection) => {
            nav(`designer?templateId=${selection.templateId}`);
        },
        [nav]
    );

    const onActivateHudLanding = React.useCallback((selection: HudLandingSelection) => {
        setDefaultLandingTemplate(selection.templateId);

        setLandingSelection({
            templateId: selection.templateId,
            ownerUserId: selection.ownerUserId,
        });

        setActiveKey('landing');
    }, []);

    const tabLabel = (ws: WorkflowTabModel) => {
        const isPublished = String(ws.templateVersionStatus ?? '').toUpperCase() === 'PUBLISHED';

        const menuItems = [
            {
                key: 'edit',
                label: 'Edit Template',
                disabled: ws.ownerUserId !== currentUser,
                onClick: (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    onEditTemplate(ws);
                },
            },
            {
                key: 'clone',
                label: isPublished ? 'Clone Template' : 'Clone Template (disabled on Draft)',
                disabled: !isPublished,
                onClick: async (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    await onCloneTemplate(ws);
                },
            },
        ];

        return (
            <Space size={8} align="center">
                <span>{ws.title}</span>

                <Dropdown trigger={['click']} menu={{ items: menuItems as any }}>
                    <Tooltip title="Actions">
                        <Button
                            type="text"
                            size="small"
                            icon={<EllipsisOutlined style={{ transform: 'rotate(90deg)' }} />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ opacity: 0.72 }}
                        />
                    </Tooltip>
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
        ...workflows.map((ws) => ({
            key: ws.workflowId,
            label: tabLabel(ws),
            closable: true,
            children: null,
        })),
    ];

    const initWorkflowFromURL = async (templateId: string) => {
        const templates = await getTemplates();
        const template = templates.find((el) => el.id === templateId);
        if (template) {
            const selection: HudWorkflowSelection = {
                templateId: templateId,
                templateName: template.name,
                templateVersionStatus: '', //TODO: currently not needed but need to implement
                ownerUserId: template.ownerUserId!,
            };
            onLaunchHudWorkflow(selection);
        } else {
            setSearchParams({}, { replace: true });
        }
    };

    return (
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <TrapHud
                onExport={onExport}
                onLaunchWorkflow={onLaunchHudWorkflow}
                onEditWorkflow={onEditHudWorkflow}
                onActivateLanding={onActivateHudLanding}
            />
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
                {showTabs && (
                    <div style={{ height: TAB_BAR_HEIGHT, overflow: 'hidden' }}>
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
                    </div>
                )}

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

                    {workflows.map((ws) => (
                        <div
                            key={ws.workflowId}
                            style={{
                                display: activeKey === ws.workflowId ? 'block' : 'none',
                                width: '100%',
                            }}
                        >
                            <WorkflowTab
                                workflowId={ws.workflowId}
                                templateId={ws.templateId}
                                onClose={() => closeWorkflowTab(ws.workflowId)}
                            />
                        </div>
                    ))}
                </div>
            </Space>
        </Space>
    );
}
