/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { message } from 'antd';

import { listTemplates, getTemplateVersion, TemplateSummary } from '../../../api/trap';
import { type WorkflowContext } from '../../../state/contextBus';

import type { LandingTabProps } from '../types/landing.types';

import { useGetUserClaims, useGetUserLogin } from '../../../state/User/hooks';
import { useUserProfile } from '../../../context/UserPreferenceContext';
import { PROFILE_KEYS } from '../../../context/constants';

export function useLanding(props: LandingTabProps) {
    const { profile } = useUserProfile();

    const defaultLanding = useMemo(
        () => profile?.[PROFILE_KEYS.ACTIVE_LANDING] || '',
        [profile?.[PROFILE_KEYS.ACTIVE_LANDING]]
    );
    const claims = useGetUserClaims();
    const login = useGetUserLogin();
    const [compiledLandingVersion, setCompiledLandingVersion] = React.useState<any>(null);
    const [targetTemplateId, setTargetTemplateId] = React.useState<string>();
    const [isLoading, setIsLoading] = React.useState(false);
    const hasLanding = Boolean(targetTemplateId);
    const activeUser = sessionStorage.getItem('okta-name');
    const [error, setError] = useState<string | null>(null);
    const initLandingFromActive = (
        templates: TemplateSummary[],
        activeLandingSelection: LandingTabProps['activeLandingSelection']
    ) => {
        const activeTemplateId = activeLandingSelection?.templateId;

        if (activeTemplateId) {
            const activeTemplate = templates.find((template) => template.id === activeTemplateId);

            if (
                activeTemplate?.id &&
                String(activeTemplate.kind ?? '').toLowerCase() === 'landing'
            ) {
                setTargetTemplateId(activeTemplate.id);

                setIsLoading(false);
                return;
            }
        }
    };

    const initFromSaved = (templates: TemplateSummary[], defaultLanding: string | null) => {
        const savedTemplateId = defaultLanding ?? undefined;

        const savedTemplate = savedTemplateId
            ? templates.find((template) => template.id === savedTemplateId)
            : undefined;

        if (savedTemplate?.id) {
            setTargetTemplateId(savedTemplate.id);

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
            (el) => el.kind === 'LANDING' && el.scopeType === 'USER' && el.ownerUserId === login
        )[0];

        return myTemplate;
    };
    const initDefaultLanding = async (
        defaultLanding: string | null,
        activeLandingSelection: LandingTabProps['activeLandingSelection']
    ) => {
        try {
            setIsLoading(true);
            const templates = await listTemplates();
            if (activeLandingSelection?.templateId) {
                initLandingFromActive(templates, activeLandingSelection);
                return;
            }
            if (defaultLanding) {
                initFromSaved(templates, defaultLanding);
                return;
            }

            const departmentLanding = findSuitableLanding(templates);
            if (departmentLanding) {
                setTargetTemplateId(departmentLanding.id);

                setIsLoading(false);
                return;
            }
            setTargetTemplateId(undefined);
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
        if (!targetTemplateId) {
            setCompiledLandingVersion(null);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const tv = await getTemplateVersion(targetTemplateId);

                if (!cancelled) {
                    setCompiledLandingVersion(tv ?? null);
                }
            } catch {
                if (!cancelled) {
                    setCompiledLandingVersion(null);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [targetTemplateId]);

    const openWorkflowFromRecent = React.useCallback(
        async (input: {
            target?: {
                templateId?: string;
                title?: string;
                templateVersionStatus?: string;
            };
            context?: Record<string, any>;
        }) => {
            const templateId = input.target?.templateId;

            if (!templateId) {
                message.error('Selected recent workflow is unavailable');
                return;
            }

            let versionStatus = input.target?.templateVersionStatus ?? 'UNKNOWN';

            const ctx: WorkflowContext = {
                ...(input.context ?? {}),
            };

            props.onOpenWorkflow({
                key: templateId,
                workflowId: templateId,
                templateId,
                templateVersionStatus: versionStatus,
                title: input.target?.title ?? 'Workflow',
                initialContext: ctx,
                // Sending empty ownerUserId, as we don't have access to it here.
                ownerUserId: '',
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
