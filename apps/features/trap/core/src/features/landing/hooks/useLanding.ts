/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { message } from 'antd';

import {
    listTemplates,
    listTemplateVersions,
    openTemplate,
    getTemplateVersion,
    TemplateSummary,
} from '../../../api/trap';
import { type WorkflowContext } from '../../../state/contextBus';

import type { LandingTabProps, TemplateVersion } from '../types/landing.types';
import { pickBestVersion } from '../utils/landing.utils';
import {
    getDefaultLandingTemplate,
    setDefaultLandingTemplate,
} from '../../../utils/userPreferences';
import { useUserInfo } from '@platform/utils';
import { useGetActiveUser } from '../../../state/User/hooks';

export function useLanding(props: LandingTabProps) {
    const defaultLanding = React.useMemo(() => getDefaultLandingTemplate(), []);

    const { claims, ...info } = useUserInfo();
    const [compiledLandingVersion, setCompiledLandingVersion] = React.useState<any>(null);
    const [targetTemplateId, setTargetTemplateId] = React.useState<string>();
    const [targetTemplateVersionId, setTargetTemplateVersionId] = React.useState<string>();
    const [loadingLandingVersion, setLoadingLandingVersion] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const hasLanding = Boolean(targetTemplateId && targetTemplateVersionId);
    const activeUser = useGetActiveUser();
    const [error, setError] = useState<string | null>(null);
    console.log(info);
    const initLandingFromActive = (
        templates: TemplateSummary[],
        activeLandingSelection: LandingTabProps['activeLandingSelection']
    ) => {
        const activeTemplateId = activeLandingSelection?.templateId;
        const activeVersionId = activeLandingSelection?.templateVersionId;

        if (activeTemplateId) {
            const activeTemplate = templates.find((template) => template.id === activeTemplateId);

            if (
                activeTemplate?.id &&
                String(activeTemplate.kind ?? '').toLowerCase() === 'landing'
            ) {
                setTargetTemplateId(activeTemplate.id);
                setTargetTemplateVersionId(activeVersionId);

                setIsLoading(false);
                return;
            }
        }
    };

    const initFromSaved = (
        templates: TemplateSummary[],
        defaultLanding: {
            templateId: string | null;
            versionId: string | null;
        } | null
    ) => {
        const savedTemplateId = defaultLanding?.templateId ?? undefined;
        const savedVersionId = defaultLanding?.versionId ?? undefined;

        const savedTemplate = savedTemplateId
            ? templates.find((template) => template.id === savedTemplateId)
            : undefined;

        if (savedTemplate?.id) {
            setTargetTemplateId(savedTemplate.id);
            setTargetTemplateVersionId(savedVersionId);

            setIsLoading(false);
            return;
        } else {
            setIsLoading(false);
            setError('Activated landing no longer available');
        }
    };

    const findSuitableLanding = (templates: TemplateSummary[]) => {
        const template = templates.find((item) => {
            if (item.kind !== 'LANDING') return false;
            if (item.scopeType !== 'AUDIENCE') return false;

            return (
                item?.scopeKey?.['OrgLevel1'] === claims.OrgLevel1 &&
                item?.scopeKey?.['OrgLevel2'] === claims.OrgLevel2
            );
        });
        if (template) return template;

        // If there are no department landings to activate, then activate first landing that belongs to user
        const myTemplate = templates.filter(
            (el) =>
                el.kind === 'LANDING' && el.scopeType === 'USER' && el.ownerUserId === info.login
        )[0];

        return myTemplate;
    };
    const initDefaultLanding = async (
        defaultLanding: {
            templateId: string | null;
            versionId: string | null;
        } | null,
        activeLandingSelection: LandingTabProps['activeLandingSelection']
    ) => {
        try {
            setIsLoading(true);
            const templates = await listTemplates();
            if (activeLandingSelection?.templateId) {
                initLandingFromActive(templates, activeLandingSelection);
                return;
            }
            if (defaultLanding?.templateId) {
                initFromSaved(templates, defaultLanding);
                return;
            }

            const departmentLanding = findSuitableLanding(templates);
            if (departmentLanding) {
                const versions = await listTemplateVersions(departmentLanding.id);

                const best = pickBestVersion(versions as TemplateVersion[]);

                setTargetTemplateId(departmentLanding.id);
                setTargetTemplateVersionId(best?.id);

                setDefaultLandingTemplate(departmentLanding.id, best?.id || '');
                setIsLoading(false);
                return;
            }
            setTargetTemplateId(undefined);
            setTargetTemplateVersionId(undefined);
            setCompiledLandingVersion(null);

            setIsLoading(false);
        } catch (e: any) {
            message.error(e?.message ?? 'Failed to load templates');
            setIsLoading(false);
        }
    };
    React.useEffect(() => {
        if (activeUser) {
            setError(null);
            initDefaultLanding(defaultLanding, props.activeLandingSelection);
        }
    }, [defaultLanding, props.activeLandingSelection, activeUser]);

    React.useEffect(() => {
        if (!targetTemplateId || !targetTemplateVersionId) {
            setCompiledLandingVersion(null);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoadingLandingVersion(true);

            try {
                const tv = await getTemplateVersion(targetTemplateId, targetTemplateVersionId);

                if (!cancelled) {
                    setCompiledLandingVersion(tv ?? null);
                }
            } catch {
                if (!cancelled) {
                    setCompiledLandingVersion(null);
                }
            } finally {
                if (!cancelled) {
                    setLoadingLandingVersion(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [targetTemplateId, targetTemplateVersionId]);

    const openWorkflowFromRecent = React.useCallback(
        async (input: {
            target?: {
                templateId?: string;
                templateVersionId?: string;
                title?: string;
                templateVersionStatus?: string;
            };
            context?: Record<string, any>;
        }) => {
            const templateId = input.target?.templateId;
            const versionId = input.target?.templateVersionId;

            if (!templateId || !versionId) {
                message.error('Selected recent workflow is unavailable');
                return;
            }

            let versionStatus = input.target?.templateVersionStatus ?? 'UNKNOWN';

            if (versionStatus === 'UNKNOWN') {
                try {
                    const vs = (await listTemplateVersions(templateId)) as TemplateVersion[];
                    const selected = vs.find((v) => v.id === versionId);
                    versionStatus = selected?.status ?? versionStatus;
                } catch {
                    // keep UNKNOWN
                }
            }

            const ctx: WorkflowContext = {
                ...(input.context ?? {}),
            };

            const resp = await openTemplate(versionId, ctx);

            props.onOpenWorkflow({
                key: resp.workflowId,
                workflowId: resp.workflowId,
                templateId,
                templateVersionId: versionId,
                templateVersionStatus: versionStatus,
                title: input.target?.title ?? 'Workflow',
                initialContext: ctx,
            });
        },
        [props]
    );

    return {
        openWorkflowFromRecent,
        compiledLandingVersion,
        hasLanding,
        isLoading,
        error,
    };
}
