/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import {
    getTemplateVersion,
    listTemplates,
    listWidgetDefinitions,
    publishTemplateVersion,
    updateDraftVersion,
} from '../../../api/trap';
import type { WidgetDefinition, WidgetLayout } from '../../../state/types';
import { widgetRegistry } from '../../../registry/widgetRegistry';

import type { DesignerWidgetInstance } from '../types/workflowDesigner.types';
import {
    coreWidgetToDesigner,
    designerWidgetToCore,
    safeJsonParse,
    uid,
} from '../utils/workflowDesigner.utils';
import { createDefaultConfigFromDefinition } from '../../widget-studio/helpers/helpers';

export type AddWidgetOptions = {
    keepPickerOpen?: boolean;
};

export function useWorkflowDesigner() {
    const nav = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = React.useState(false);
    const [loaded, setLoaded] = React.useState<any>(null);

    const [widgetDefs, setWidgetDefs] = React.useState<WidgetDefinition[]>([]);
    const [selectedWidgetDefId, setSelectedWidgetDefId] = React.useState<string>('');
    const [selectedWidgetVariantId, setSelectedWidgetVariantId] = React.useState<
        string | undefined
    >(undefined);
    const [selectedWidgetParams, setSelectedWidgetParams] = React.useState<{
        [key: string]: string | number;
    }>({});

    const [widgetSearch, setWidgetSearch] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

    const [layout, setLayout] = React.useState<WidgetLayout[]>([]);
    const [widgetsById, setWidgetsById] = React.useState<Record<string, DesignerWidgetInstance>>(
        {}
    );

    const [defaultContextJson, setDefaultContextJson] = React.useState<string>('{}');
    const [isDraftSaved, setIsDraftSaved] = React.useState(true);
    const [widgetPickerOpen, setWidgetPickerOpen] = React.useState(false);

    const removingIdsRef = React.useRef<Set<string>>(new Set());

    const params = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
    const routeTemplateId = params.get('templateId') ?? '';

    const [templateId, setTemplateId] = React.useState(routeTemplateId);

    const [messageApi, contextHolder] = message.useMessage();

    React.useEffect(() => {
        if (!isDraftSaved) {
            saveDraft();
        }
    }, [isDraftSaved]);

    React.useEffect(() => {
        setTemplateId(routeTemplateId);
    }, [routeTemplateId]);

    const loadTemplateMeta = React.useCallback(async (tid: string) => {
        const templates = await listTemplates();
        return templates.find((t: any) => t.id === tid) ?? null;
    }, []);

    const loadedStatus = String(loaded?.status ?? '').toUpperCase();
    const isPublished = loadedStatus === 'PUBLISHED';
    const isDraft = loadedStatus === 'DRAFT';
    const hasWidgets = layout.length > 0 && Object.keys(widgetsById ?? {}).length > 0;

    const saveDisabledReason = !templateId
        ? 'Create or load a draft first'
        : isPublished
          ? 'Published versions are immutable'
          : !hasWidgets
            ? 'Add at least one widget before saving'
            : undefined;

    const publishDisabledReason = !templateId
        ? 'Create or load a draft first'
        : isPublished
          ? 'This version is already published'
          : !isDraft
            ? 'Only draft versions can be published'
            : !hasWidgets
              ? 'Add at least one widget before publishing'
              : !isDraftSaved
                ? 'Save draft before publishing'
                : undefined;

    const designerWidgetDefs = React.useMemo(() => {
        const kind = String(loaded?.kind ?? '').toLowerCase();

        return (widgetDefs as any[]).filter((d: any) => {
            const entry = widgetRegistry[String(d?.id ?? '')];
            if (!entry) return false;

            const visibleIn = entry.visibleIn ?? [];

            if (kind === 'landing') return visibleIn.includes('landing');
            if (kind === 'workflow') return visibleIn.includes('workflow');

            return true;
        });
    }, [widgetDefs, loaded]);

    const widgetDefById = React.useMemo(() => {
        console.log(designerWidgetDefs);
        const m: Record<string, any> = {};
        for (const d of designerWidgetDefs as any[]) m[String(d.id)] = d;
        return m;
    }, [designerWidgetDefs]);

    const selectedWidgetDef = React.useMemo(
        () => (designerWidgetDefs as any[]).find((d: any) => d.id === selectedWidgetDefId),
        [designerWidgetDefs, selectedWidgetDefId]
    );

    const widgetCategories = React.useMemo(() => {
        const set = new Set<string>();

        for (const d of designerWidgetDefs as any[]) {
            const entry = widgetRegistry[String(d?.id ?? '')];
            const category = String(
                d?.uiHints?.category ?? d?.category ?? entry?.category ?? 'Other'
            );
            set.add(category);
        }

        return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [designerWidgetDefs]);

    const filteredWidgetDefs = React.useMemo(() => {
        const q = widgetSearch.trim().toLowerCase();
        return (designerWidgetDefs as any[])
            .filter((d: any) => {
                const entry = widgetRegistry[String(d?.id ?? '')];
                const category = String(
                    d?.uiHints?.category ?? d?.category ?? entry?.category ?? 'Other'
                );

                if (selectedCategory !== 'All' && category !== selectedCategory) return false;

                if (!q) return true;

                const hay = [
                    d?.name,
                    d?.description,
                    d?.category,
                    d?.uiHints?.category,
                    ...(Array.isArray(d?.tags) ? d.tags : []),
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return hay.includes(q);
            })
            .sort((a: any, b: any) => String(a?.name ?? '').localeCompare(String(b?.name ?? '')));
    }, [designerWidgetDefs, widgetSearch, selectedCategory]);

    React.useEffect(() => {
        if (!widgetCategories.includes(selectedCategory)) {
            setSelectedCategory('All');
        }

        // Logic to change the widget based on category change
        // If previously selected widget is present in changed category, then keep the existing widget selection.
        // If previously selected widget is not present in changed category, then select the first widget. Also clear the variant & params.
        const isWidgetPresentInCategory = filteredWidgetDefs.some(
            (widget) => widget.id === selectedWidgetDefId
        );
        if (!isWidgetPresentInCategory) {
            setSelectedWidgetDefId(filteredWidgetDefs?.[0]?.id);
            setSelectedWidgetVariantId(undefined);
            setSelectedWidgetParams({});
        }
    }, [widgetCategories, selectedCategory]);

    const hydrateFromTemplateVersion = React.useCallback((tv: any) => {
        const w = tv?.widgets;
        const nextMap: Record<string, DesignerWidgetInstance> = {};

        if (Array.isArray(w) && w.length) {
            w.forEach((it: any) => {
                const dw = coreWidgetToDesigner(it);
                nextMap[dw.instanceId] = dw;
            });
        }

        setWidgetsById(nextMap);
        setLayout(Array.isArray(tv?.layout) ? tv.layout : []);

        if (tv?.defaultContext !== undefined) {
            setDefaultContextJson(JSON.stringify(tv?.defaultContext ?? {}, null, 2));
        } else {
            setDefaultContextJson('{}');
        }

        setIsDraftSaved(true);
    }, []);

    const updateWidgetConfig = (widget: DesignerWidgetInstance) => {
        const { id } = widget;
        const newWidget = { ...widgetsById[id], ...widget };
        setWidgetsById((prev) => ({ ...prev, [id]: newWidget }));
    };

    React.useEffect(() => {
        (async () => {
            try {
                const defs = await listWidgetDefinitions();
                setWidgetDefs(defs);
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to load widget definitions');
            }
        })();
    }, []);

    React.useEffect(() => {
        if (!templateId) return;

        (async () => {
            try {
                const tv = await getTemplateVersion(templateId);
                const templateMeta = await loadTemplateMeta(templateId);

                const enriched = {
                    ...tv,
                    name: templateMeta?.name,
                    kind: templateMeta?.kind,
                    templateName: templateMeta?.name,
                    templateKind: templateMeta?.kind,
                };

                setLoaded(enriched);
                hydrateFromTemplateVersion(enriched);
            } catch {
                try {
                    nav(`designer?templateId=${templateId}`, { replace: true });

                    const tv = await getTemplateVersion(templateId);
                    const templateMeta = await loadTemplateMeta(templateId);

                    const enriched = {
                        ...tv,
                        name: templateMeta?.name ?? tv?.name,
                        kind: templateMeta?.kind ?? tv?.kind,
                        templateName: templateMeta?.name,
                        templateKind: templateMeta?.kind,
                    };

                    setLoaded(enriched);
                    hydrateFromTemplateVersion(enriched);
                } catch {
                    // ignore
                }
            }
        })();
    }, [templateId, nav, hydrateFromTemplateVersion, loadTemplateMeta]);

    const getParams = React.useCallback(() => {
        switch (true) {
            case Object.keys(selectedWidgetParams).length ===
                selectedWidgetDef.configSchema.required.length:
                return selectedWidgetParams;
            case selectedWidgetDef.configSchema.required.length > 0:
                return selectedWidgetDef.configSchema.required.reduce(
                    (acc: { [key: string]: string | number }, requiredField: string) => {
                        const value =
                            selectedWidgetParams[requiredField] ||
                            selectedWidgetDef.configSchema.properties[requiredField].enum?.[0] ||
                            selectedWidgetDef.configSchema.properties[requiredField].default;
                        return {
                            ...acc,
                            [requiredField]: value,
                        };
                    },
                    {}
                );
            default:
                return selectedWidgetParams;
        }
    }, [selectedWidgetParams, selectedWidgetDef]);

    const addWidget = React.useCallback(
        async ({ keepPickerOpen = false }: AddWidgetOptions = {}) => {
            if (!selectedWidgetDef) {
                message.error('Pick a widget definition first');
                return;
            }

            const variant =
                (selectedWidgetDef.variants ?? []).find(
                    (v: any) => v.id === selectedWidgetVariantId
                ) ?? selectedWidgetDef.variants?.[0];

            const params = getParams();

            // Initial footprint comes from the selected variant's `sizing`.
            const fromDefintionDefault = createDefaultConfigFromDefinition(
                selectedWidgetDef.configSchema.properties
            );
            const sizing = (variant as any)?.sizing;
            const w = sizing?.width?.default ?? 4;
            const h = sizing?.height?.default ?? 3;
            const instanceId = uid('wi');
            const nextY =
                (layout.reduce((m, it) => Math.max(m, (it.y ?? 0) + (it.h ?? 1)), 0) ?? 0) + 1;

            const item: WidgetLayout = {
                i: instanceId,
                x: 0,
                y: nextY,
                w,
                h,
                minW: sizing?.width?.min,
                minH: sizing?.height?.min,
                maxW: sizing?.width?.max,
                maxH: sizing?.height?.max,
            };

            setLayout((prev) => [...prev, item]);

            setWidgetsById((prev) => ({
                ...prev,
                [instanceId]: {
                    instanceId,
                    widgetDefinitionId: selectedWidgetDef.id,
                    widgetDefinitionVersion: (selectedWidgetDef as any).version ?? 1,
                    variantId: variant?.id,
                    config: { params: { ...fromDefintionDefault, ...params } },
                },
            }));

            setIsDraftSaved(false);
            setWidgetPickerOpen(keepPickerOpen);
            messageApi.success('Widget added successfully.');
        },
        [layout, selectedWidgetDef, selectedWidgetVariantId, selectedWidgetParams]
    );

    const removeWidget = React.useCallback((instanceId: string) => {
        removingIdsRef.current.add(instanceId);
        setIsDraftSaved(false);

        setLayout((prev) => prev.filter((x) => x.i !== instanceId));
        setWidgetsById((prev) => {
            const next = { ...prev };
            delete next[instanceId];
            return next;
        });

        setTimeout(() => removingIdsRef.current.delete(instanceId), 0);
    }, []);

    const onLayoutChange = React.useCallback((current: any[]) => {
        const removed = removingIdsRef.current;
        const next = (current as any[]).filter((it) => !removed.has(it.i));
        setLayout(next as any);
        setIsDraftSaved(false);
    }, []);

    const saveDraft = React.useCallback(async () => {
        if (!templateId) {
            message.error('templateId is required');
            return;
        }

        if (saveDisabledReason) {
            message.warning(saveDisabledReason);
            // Although this is not 100% correct logic (cannot save empty layout),
            //  the flag needs to be toggled back to true so that useEffect can be retriggered again.
            // This behavoiur needs to be refactored because there are too many useEffects
            setIsDraftSaved(true);
            return;
        }

        setLoading(true);
        try {
            const defaultContext = safeJsonParse(defaultContextJson, {});

            const cleanLayout = (layout ?? []).map((it: any) => ({
                i: it.i,
                x: Number(it.x ?? 0),
                y: Number(it.y ?? 0),
                w: Number(it.w ?? 0),
                h: Number(it.h ?? 0),
                minW: it.minW != null ? Number(it.minW) : undefined,
                minH: it.minH != null ? Number(it.minH) : undefined,
                maxW: it.maxW != null ? Number(it.maxW) : undefined,
                maxH: it.maxH != null ? Number(it.maxH) : undefined,
            }));

            const widgetsCore = Object.values(widgetsById ?? {}).map(designerWidgetToCore);

            //TODO Remove 'mockVersionId' from publishTemplateVersion
            const payload = {
                id: 'mockVersionId',
                templateId,
                defaultContext,
                layout: cleanLayout,
                widgets: widgetsCore,
            };

            const updated = await updateDraftVersion(templateId, payload);
            const templateMeta = await loadTemplateMeta(templateId);

            const enriched = {
                ...updated,
                name: templateMeta?.name ?? updated?.name,
                kind: templateMeta?.kind ?? updated?.kind,
                templateName: templateMeta?.name,
                templateKind: templateMeta?.kind,
            };

            setLoaded(enriched);
            hydrateFromTemplateVersion(enriched);
            setIsDraftSaved(true);

            nav(`?templateId=${templateId}`, { replace: true });

            message.success('Draft saved');
        } catch (e: any) {
            message.error(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [
        templateId,
        saveDisabledReason,
        defaultContextJson,
        layout,
        widgetsById,
        nav,
        hydrateFromTemplateVersion,
        loadTemplateMeta,
    ]);

    const publish = React.useCallback(async () => {
        if (!templateId) {
            message.error('templateId is required');
            return;
        }

        if (publishDisabledReason) {
            message.warning(publishDisabledReason);
            return;
        }

        setLoading(true);
        try {
            const published = await publishTemplateVersion(templateId);
            const templateMeta = await loadTemplateMeta(templateId);

            const enriched = {
                ...published,
                name: templateMeta?.name ?? published?.name,
                kind: templateMeta?.kind ?? published?.kind,
                templateName: templateMeta?.name,
                templateKind: templateMeta?.kind,
            };

            setLoaded(enriched);
            hydrateFromTemplateVersion(enriched);
            message.success('Published');
            nav(`/trap?template_id=${templateId}`);
        } catch (e: any) {
            message.error(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, [templateId, publishDisabledReason, nav, hydrateFromTemplateVersion, loadTemplateMeta]);

    return {
        nav,

        loading,
        loaded,

        templateId,

        widgetSearch,
        selectedCategory,
        selectedWidgetDefId,
        selectedWidgetVariantId,
        selectedWidgetParams,

        layout,
        widgetsById,
        defaultContextJson,
        isDraftSaved,
        widgetPickerOpen,

        loadedStatus,
        isPublished,
        isDraft,
        hasWidgets,
        saveDisabledReason,
        publishDisabledReason,

        designerWidgetDefs,
        widgetDefById,
        selectedWidgetDef,
        widgetCategories,
        filteredWidgetDefs,
        removingIdsRef,

        setWidgetSearch,
        setSelectedCategory,
        setSelectedWidgetDefId,
        setSelectedWidgetVariantId,
        setSelectedWidgetParams,
        setLayout,
        setDefaultContextJson,
        setWidgetPickerOpen,

        addWidget,
        removeWidget,
        onLayoutChange,
        saveDraft,
        publish,

        updateWidgetConfig,

        contextHolder,
    };
}
