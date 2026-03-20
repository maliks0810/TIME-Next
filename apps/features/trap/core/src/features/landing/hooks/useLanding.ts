/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unused-vars */
import React from 'react';
import { message } from 'antd';

import {
    listTemplates,
    listTemplateVersions,
    openTemplate,
    getTemplateVersion,
} from '../../../api/trap';
import { createContextBus, type WorkflowContext } from '../../../state/contextBus';

import type { LandingTabProps, TemplateVersion } from '../types/landing.types';
import { pickBestVersion } from '../utils/landing.utils';
import { getDefaultLandingTemplate } from '../../../utils/userPreferences';

export function useLanding(props: LandingTabProps) {
    const bus = React.useMemo(() => createContextBus(), []);
    const defaultLanding = React.useMemo(() => getDefaultLandingTemplate(), []);

    const [snapshot, setSnapshot] = React.useState(() => bus.snapshot ?? {});
    const [compiledLandingVersion, setCompiledLandingVersion] = React.useState<any>(null);
    const [targetTemplateId, setTargetTemplateId] = React.useState<string>();
    const [targetTemplateVersionId, setTargetTemplateVersionId] = React.useState<string>();
    const [loadingLandingVersion, setLoadingLandingVersion] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const hasLanding = Boolean(targetTemplateId && targetTemplateVersionId);

    React.useEffect(() => {
        const unsub = bus.subscribe('landing_snapshot', (ctx) => setSnapshot(ctx));
        setSnapshot(bus.snapshot ?? {});
        return () => unsub();
    }, [bus]);

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const t = await listTemplates();

                const activeTemplateId = props.activeLandingSelection?.templateId;
                const activeVersionId = props.activeLandingSelection?.templateVersionId;

                if (activeTemplateId) {
                    const activeTemplate = t.find((x) => x.id === activeTemplateId);

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
                const savedTemplateId = defaultLanding?.templateId ?? undefined;
                const savedVersionId = defaultLanding?.versionId ?? undefined;

                const savedTemplate = savedTemplateId
                    ? t.find((x) => x.id === savedTemplateId)
                    : undefined;

                if (
                    savedTemplate?.id &&
                    String(savedTemplate.kind ?? '').toLowerCase() === 'landing'
                ) {
                    setTargetTemplateId(savedTemplate.id);
                    setTargetTemplateVersionId(savedVersionId);

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
        })();
    }, [defaultLanding, props.activeLandingSelection]);

    React.useEffect(() => {
        if (!targetTemplateId) {
            setTargetTemplateVersionId(undefined);
            return;
        }

        (async () => {
            try {
                const vs = await listTemplateVersions(targetTemplateId);

                const savedVersionId =
                    defaultLanding?.templateId === targetTemplateId
                        ? defaultLanding?.versionId
                        : undefined;

                const savedVersion = savedVersionId
                    ? (vs as TemplateVersion[]).find((v) => v.id === savedVersionId)
                    : undefined;

                if (savedVersion?.id) {
                    setTargetTemplateVersionId(savedVersion.id);
                    return;
                }

                const best = pickBestVersion(vs as TemplateVersion[]);
                setTargetTemplateVersionId(best?.id);
            } catch (e: any) {
                setTargetTemplateVersionId(undefined);
                message.error(e?.message ?? 'Failed to load template versions');
            }
        })();
    }, [targetTemplateId, defaultLanding, props.activeLandingSelection]);

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
                ...bus.snapshot,
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
        [bus, props]
    );

    return {
        bus,
        snapshot,
        openWorkflowFromRecent,
        compiledLandingVersion,
        hasLanding,
        isLoading,
    };
}
