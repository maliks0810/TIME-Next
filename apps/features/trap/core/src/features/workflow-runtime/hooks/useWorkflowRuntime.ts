/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';

import { getCompiledWorkflowView, listWidgetDefinitions } from '../../../api/trap';

import type { WorkflowTabProps } from '../types/workflowRuntime.types';
import {
    extractLayout,
    extractWidgetsArray,
    resolveWidgetId,
    safeParseJson,
    widgetsMapById,
} from '../utils/workflowRuntime.utils';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

export function useWorkflowRuntime(props: WorkflowTabProps) {
    const [loadingWorkflow, setLoadingWorkflow] = useState(false);
    const [compiled, setCompiled] = useState<any>(null);
    const [widgetDefs, setWidgetDefs] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const activeTab = useGetActiveTab();

    const getWidgetDefinitions = async () => {
        try {
            const defs = await listWidgetDefinitions();
            setWidgetDefs(defs);
        } catch (e: any) {
            message.error(e?.message ?? 'Failed to load widget catalog');
        }
    };
    const getCompiledWorkflow = async () => {
        setLoadingWorkflow(true);
        try {
            const resp = await getCompiledWorkflowView(props.workflowId);
            const view = resp?.view ?? resp;
            const parsed = safeParseJson(view) ?? view;
            setCompiled(parsed);
        } catch (e: any) {
            setCompiled(null);
            message.error(e?.message ?? 'Failed to load compiled workflow view');
        } finally {
            setLoadingWorkflow(false);
        }
    };

    useEffect(() => {
        if (activeTab === props.workflowId && isInitialLoading) {
            getWidgetDefinitions();
            getCompiledWorkflow();
            setIsInitialLoading(false);
        }
    }, [activeTab, isInitialLoading]);

    const widgetDefById = useMemo(() => {
        const m: Record<string, any> = {};
        for (const d of widgetDefs) m[String(d.id)] = d;
        return m;
    }, [widgetDefs]);

    const layoutFromCompiled = useMemo(() => extractLayout(compiled), [compiled]);
    const widgetsArr = useMemo(() => extractWidgetsArray(compiled), [compiled]);
    const widgetsById = useMemo(() => widgetsMapById(widgetsArr), [widgetsArr]);

    const runtimeItems = useMemo(() => {
        return layoutFromCompiled
            .filter((it: any) => !!widgetsById[it.i])
            .map((it: any) => {
                const widgetInstance = widgetsById[it.i];
                const defId = resolveWidgetId(widgetInstance);
                const widgetDefinition = widgetDefById[defId];

                return {
                    item: it,
                    widgetInstance,
                    widgetDefinition,
                };
            });
    }, [layoutFromCompiled, widgetsById, widgetDefById]);

    const workflowInfo = {
        compiledView: compiled,
    };

    return {
        compiled,
        loadingWorkflow,
        layoutFromCompiled,
        runtimeItems,
        workflowInfo,
    };
}
