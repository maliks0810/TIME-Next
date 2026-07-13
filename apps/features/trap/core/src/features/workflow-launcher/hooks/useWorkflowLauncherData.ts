/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { message } from 'antd';

import {
    cloneTemplate,
    createDraftVersion,
    deleteTemplate,
    listTemplates,
    publishTemplateVersion,
    updateTemplate,
} from '../../../api/trap';

import { useUserInfo } from '@platform/utils';
import type {
    MineFilter,
    TemplateRecord,
    WorkflowLauncherItem,
    WorkflowLaunchSelection,
} from '../types/workflowLauncher.types';

type Args = {
    mineFilter: MineFilter;
    search: string;
    selectedClass1: string;
    selectedClass2: string;
    selectedClass3: string;
    onEditWorkflow?: (selection: WorkflowLaunchSelection) => void;
    onLaunchWorkflow?: (selection: WorkflowLaunchSelection) => Promise<void> | void;
    closeModal: () => void;
};

function normalizeClassValue(value?: string) {
    return (value ?? '').trim() || 'Unclassified';
}

function extractErrorMessage(err: any, fallback: string) {
    return err?.response?.body?.error || err?.response?.data?.error || err?.message || fallback;
}

function toFriendlyTemplateError(err: any, fallback: string) {
    const raw = String(extractErrorMessage(err, fallback));

    if (raw.toLowerCase().includes('already exists')) {
        return 'That workspace name is already taken for this Class-1 / Class-2 / Class-3 combination.';
    }

    return raw;
}

export function useWorkflowLauncherData(args: Args) {
    const {
        mineFilter,
        search,
        selectedClass1,
        selectedClass2,
        selectedClass3,
        onEditWorkflow,
        onLaunchWorkflow,
        closeModal,
    } = args;

    const { login } = useUserInfo();

    const [loading, setLoading] = React.useState(false);
    const [items, setItems] = React.useState<WorkflowLauncherItem[]>([]);

    const currentUser = localStorage.getItem('debug-user') || login;

    const refreshLauncherData = React.useCallback(async () => {
        setLoading(true);
        try {
            const templates = (await listTemplates()) as TemplateRecord[];
            setItems(
                templates.map(
                    (template) =>
                        ({
                            ...template,
                            templateId: template.id,
                            templateName: template.name,
                        }) as WorkflowLauncherItem
                )
            );
        } catch (err: any) {
            message.error(extractErrorMessage(err, 'Failed to load workflows'));
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const publicClass1Options = React.useMemo(() => {
        return [
            'All',
            ...Array.from(
                new Set(
                    items
                        .filter((item) => item.visibility === 'PUBLIC' && item.latestPublished)
                        .map((item) => normalizeClassValue(item.class1))
                )
            ).sort((a, b) => a.localeCompare(b)),
        ];
    }, [items]);

    const publicClass2Options = React.useMemo(() => {
        const base = items.filter((item) => {
            if (item.visibility !== 'PUBLIC' || !item.latestPublished) return false;
            if (selectedClass1 !== 'All' && normalizeClassValue(item.class1) !== selectedClass1)
                return false;
            return true;
        });

        return [
            'All',
            ...Array.from(new Set(base.map((item) => normalizeClassValue(item.class2)))).sort(
                (a, b) => a.localeCompare(b)
            ),
        ];
    }, [items, selectedClass1]);

    const publicClass3Options = React.useMemo(() => {
        const base = items.filter((item) => {
            if (item.visibility !== 'PUBLIC' || !item.latestPublished) return false;
            if (selectedClass1 !== 'All' && normalizeClassValue(item.class1) !== selectedClass1)
                return false;
            if (selectedClass2 !== 'All' && normalizeClassValue(item.class2) !== selectedClass2)
                return false;
            return true;
        });

        return [
            'All',
            ...Array.from(new Set(base.map((item) => normalizeClassValue(item.class3)))).sort(
                (a, b) => a.localeCompare(b)
            ),
        ];
    }, [items, selectedClass1, selectedClass2]);

    const publicItems = React.useMemo(() => {
        const q = search.trim().toLowerCase();

        return items.filter((item) => {
            const isDepartmentLanding =
                String(item.kind ?? '').toLowerCase() === 'landing' &&
                item.scopeType === 'AUDIENCE';

            const matchesVisibility =
                item.visibility === 'PUBLIC' && !!item.latestPublished && !isDepartmentLanding;

            const matchesClass1 =
                selectedClass1 === 'All' || normalizeClassValue(item.class1) === selectedClass1;
            const matchesClass2 =
                selectedClass2 === 'All' || normalizeClassValue(item.class2) === selectedClass2;
            const matchesClass3 =
                selectedClass3 === 'All' || normalizeClassValue(item.class3) === selectedClass3;

            const matchesSearch =
                q.length === 0 ||
                item.templateName.toLowerCase().includes(q) ||
                normalizeClassValue(item.class1).toLowerCase().includes(q) ||
                normalizeClassValue(item.class2).toLowerCase().includes(q) ||
                normalizeClassValue(item.class3).toLowerCase().includes(q);

            return (
                matchesVisibility &&
                matchesClass1 &&
                matchesClass2 &&
                matchesClass3 &&
                matchesSearch
            );
        });
    }, [items, search, selectedClass1, selectedClass2, selectedClass3]);

    const mineItems = React.useMemo(() => {
        const q = search.trim().toLowerCase();

        return items.filter((item) => {
            const isOwnedByUser =
                String(item.ownerUserId ?? '')
                    .trim()
                    .toLowerCase() === String(currentUser).trim().toLowerCase();

            const isDepartmentLanding =
                String(item.kind ?? '').toLowerCase() === 'landing' &&
                item.scopeType === 'AUDIENCE';

            if (!isOwnedByUser && !isDepartmentLanding) {
                return false;
            }

            const matchesSearch =
                q.length === 0 ||
                item.templateName.toLowerCase().includes(q) ||
                normalizeClassValue(item.class1).toLowerCase().includes(q) ||
                normalizeClassValue(item.class2).toLowerCase().includes(q) ||
                normalizeClassValue(item.class3).toLowerCase().includes(q);

            if (!matchesSearch) return false;

            if (isDepartmentLanding) {
                return true;
            }

            switch (mineFilter) {
                case 'DRAFT':
                    return !!item.latestDraft;
                case 'PUBLISHED':
                    return !!item.latestPublished;
                case 'PUBLIC':
                    return item.visibility === 'PUBLIC';
                case 'PRIVATE':
                    return item.visibility === 'PRIVATE';
                default:
                    return true;
            }
        });
    }, [items, search, mineFilter, currentUser]);

    const launchItem = React.useCallback(
        async (item: WorkflowLauncherItem, mode: 'public' | 'mine') => {
            const version =
                mode === 'public'
                    ? item.latestPublished
                    : (item.latestDraft ?? item.latestPublished);
            if (!version) {
                message.warning('No launchable version found');
                return;
            }

            await onLaunchWorkflow?.({
                templateId: item.templateId,
                templateName: item.templateName,
                templateVersionStatus: version.status,
                initialContext: version.defaultContext ?? {},
                ownerUserId: item.ownerUserId!
            });

            closeModal();
        },
        [onLaunchWorkflow, closeModal]
    );

    const editItem = React.useCallback(
        async (item: WorkflowLauncherItem) => {
            try {
                let version = item.latestDraft;

                if (!version && item.latestPublished) {
                    const created = await createDraftVersion(
                        item.templateId,
                        item.latestPublished.id
                    );
                    await refreshLauncherData();
                    version = created;
                }

                if (!version) {
                    message.warning('No editable version available');
                    return;
                }

                onEditWorkflow?.({
                    templateId: item.templateId,
                    templateName: item.templateName,
                    templateVersionStatus: version.status,
                    initialContext: version.defaultContext ?? {},
                    ownerUserId: item.ownerUserId!
                });

                closeModal();
            } catch (err: any) {
                message.error(extractErrorMessage(err, 'Failed to open workflow for editing'));
            }
        },
        [onEditWorkflow, refreshLauncherData, closeModal]
    );

    const cloneItem = React.useCallback(
        async (item: WorkflowLauncherItem) => {
            try {
                const cloneName = `${item.templateName} Copy`;
                const result: any = await cloneTemplate(item.templateId, cloneName);
                const nextTemplate = result?.template;
                const nextVersion = result?.version;

                await refreshLauncherData();

                if (nextTemplate?.id && nextVersion?.id) {
                    onEditWorkflow?.({
                        templateId: nextTemplate.id,
                        templateName: nextTemplate.name ?? cloneName,
                        templateVersionStatus: nextVersion.status ?? 'DRAFT',
                        initialContext: nextVersion.defaultContext ?? {},
                        ownerUserId: item.ownerUserId!
                    });
                    closeModal();
                    return;
                }

                message.success('Workflow cloned');
            } catch (err: any) {
                message.error(toFriendlyTemplateError(err, 'Failed to clone workflow'));
            }
        },
        [onEditWorkflow, refreshLauncherData, closeModal]
    );

    const renameItem = React.useCallback(
        async (item: WorkflowLauncherItem) => {
            const nextName = window.prompt('Rename workflow', item.templateName)?.trim();
            if (!nextName || nextName === item.templateName) return;

            try {
                await updateTemplate({ templateId: item.templateId, name: nextName });
                await refreshLauncherData();
                message.success('Workflow renamed');
            } catch (err: any) {
                message.error(toFriendlyTemplateError(err, 'Failed to rename workflow'));
            }
        },
        [refreshLauncherData]
    );

    const publishItem = React.useCallback(
        async (item: WorkflowLauncherItem) => {
            if (!item.latestDraft) return;

            try {
                await publishTemplateVersion(item.templateId, item.latestDraft.id);
                await refreshLauncherData();
                message.success('Workflow published');
            } catch (err: any) {
                message.error(extractErrorMessage(err, 'Failed to publish workflow'));
            }
        },
        [refreshLauncherData]
    );

    const toggleVisibility = React.useCallback(
        async (item: WorkflowLauncherItem) => {
            try {
                await updateTemplate({
                    templateId: item.templateId,
                    visibility: item.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC',
                });
                await refreshLauncherData();
                message.success(
                    item.visibility === 'PUBLIC'
                        ? 'Workflow is now private'
                        : 'Workflow is now public'
                );
            } catch (err: any) {
                message.error(toFriendlyTemplateError(err, 'Failed to update visibility'));
            }
        },
        [refreshLauncherData]
    );

    const deleteItem = React.useCallback(
        async (item: WorkflowLauncherItem) => {
            try {
                await deleteTemplate(item.templateId);
                await refreshLauncherData();
                message.success('Workflow deleted');
            } catch (err: any) {
                message.error(extractErrorMessage(err, 'Failed to delete workflow'));
            }
        },
        [refreshLauncherData]
    );

    return {
        loading,
        refreshLauncherData,
        publicClass1Options,
        publicClass2Options,
        publicClass3Options,
        publicItems,
        mineItems,
        launchItem,
        editItem,
        cloneItem,
        renameItem,
        publishItem,
        toggleVisibility,
        deleteItem,
    };
}
