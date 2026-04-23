/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { Tabs, Space, Dropdown, Button, message, Tooltip } from 'antd';
import { EllipsisOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import LandingTab from '../features/landing/LandingTab';
import WorkflowTab from '../features/workflow-runtime/WorkflowTab';
import TrapHud from '../components/common/TrapHud';

import { cloneTemplate, openTemplate } from '../api/trap';
import type { ContextBus, WorkflowContext } from '../state/contextBus';
import { createContextBus } from '../state/contextBus';

import { setDefaultLandingTemplate } from '../utils/userPreferences';
import { useGetActiveTab, useSetActiveTab } from '../state/Tabs/hooks';

type WorkflowTabModel = {
    key: string;
    workflowId: string;
    title: string;
    templateId: string;
    templateVersionId: string;
    templateVersionStatus: string;
    initialContext?: WorkflowContext;
    bus: ContextBus;
};

type OpenWorkflowRequest = Omit<WorkflowTabModel, 'bus'>;

type HudWorkflowSelection = {
    templateId: string;
    templateVersionId: string;
    templateName: string;
    templateVersionStatus: string;
    initialContext?: WorkflowContext;
};

type HudLandingSelection = {
    templateId: string;
    templateVersionId: string;
};

const TAB_BAR_HEIGHT = 48;

export default function TrapLandingPage() {
    const nav = useNavigate();

    const [workflows, setWorkflows] = React.useState<WorkflowTabModel[]>([]);
    const activeKey = useGetActiveTab();
    const setActiveKey = useSetActiveTab();

    const [landingSelection, setLandingSelection] = React.useState<
        HudLandingSelection | undefined
    >();

    const addWorkflowTab = React.useCallback((ws: OpenWorkflowRequest) => {
        setWorkflows((prev) => {
            const existing = prev.find((x) => x.workflowId === ws.workflowId);
            if (existing) return prev;

            const bus = createContextBus(ws.initialContext ?? {});
            return [...prev, { ...ws, bus }];
        });

        setActiveKey(ws.workflowId);
    }, []);

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

    const onEditTemplate = (ws: WorkflowTabModel) => {
        nav(
            `designer?templateId=${encodeURIComponent(ws.templateId)}&versionId=${encodeURIComponent(
                ws.templateVersionId
            )}`
        );
    };

    const onCloneTemplate = async (ws: WorkflowTabModel) => {
        try {
            const cloneName = `${ws.title} Copy`;

            const result: any = await cloneTemplate(ws.templateId, cloneName);
            const nextTemplate = result?.template;
            const nextVersion = result?.version;
            if (nextTemplate && nextVersion) {
                nav(
                    `designer?templateId=${encodeURIComponent(nextTemplate.id)}&versionId=${encodeURIComponent(
                        nextVersion.id
                    )}`
                );
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
                const opened = await openTemplate(
                    selection.templateVersionId,
                    selection.initialContext ?? {}
                );

                addWorkflowTab({
                    key: opened.workflowId,
                    workflowId: opened.workflowId,
                    title: selection.templateName,
                    templateId: selection.templateId,
                    templateVersionId: selection.templateVersionId,
                    templateVersionStatus: selection.templateVersionStatus,
                    initialContext: selection.initialContext ?? {},
                });
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to launch workflow');
            }
        },
        [addWorkflowTab]
    );

    const onEditHudWorkflow = React.useCallback(
        (selection: HudWorkflowSelection) => {
            nav(
                `designer?templateId=${encodeURIComponent(
                    selection.templateId
                )}&versionId=${encodeURIComponent(selection.templateVersionId)}`
            );
        },
        [nav]
    );

    const onActivateHudLanding = React.useCallback((selection: HudLandingSelection) => {
        setDefaultLandingTemplate(selection.templateId, selection.templateVersionId);

        setLandingSelection({
            templateId: selection.templateId,
            templateVersionId: selection.templateVersionId,
        });

        setActiveKey('landing');
    }, []);

    const tabLabel = (ws: WorkflowTabModel) => {
        const isPublished = String(ws.templateVersionStatus ?? '').toUpperCase() === 'PUBLISHED';

        const menuItems = [
            {
                key: 'edit',
                label: isPublished ? 'Edit (disabled on Published)' : 'Edit Template',
                disabled: isPublished,
                onClick: (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    if (!isPublished) onEditTemplate(ws);
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

    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <TrapHud
                onExport={onExport}
                onLaunchWorkflow={onLaunchHudWorkflow}
                onEditWorkflow={onEditHudWorkflow}
                onActivateLanding={onActivateHudLanding}
            />

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
                            templateVersionId={ws.templateVersionId}
                            bus={ws.bus}
                            initialContext={ws.initialContext ?? {}}
                            onClose={() => closeWorkflowTab(ws.workflowId)}
                        />
                    </div>
                ))}
            </div>
        </Space>
    );
}
