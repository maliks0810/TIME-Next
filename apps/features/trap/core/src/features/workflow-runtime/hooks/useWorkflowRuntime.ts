/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { message } from 'antd';

import { getCompiledWorkflowView, listWidgetDefinitions } from '../../../api/trap';
import { createContextBus } from '../../../state/contextBus';

import type { WorkflowTabProps } from '../types/workflowRuntime.types';
import {
    extractLayout,
    extractWidgetsArray,
    resolveWidgetId,
    safeParseJson,
    widgetsMapById,
} from '../utils/workflowRuntime.utils';

export function useWorkflowRuntime(props: WorkflowTabProps) {
    const bus = React.useMemo(
        () => props.bus ?? createContextBus(props.initialContext),
        [props.bus, props.initialContext]
    );

    const [loadingWorkflow, setLoadingWorkflow] = React.useState(false);
    const [compiled, setCompiled] = React.useState<any>(null);
    const [widgetDefs, setWidgetDefs] = React.useState<any[]>([]);

    const [snapshot, setSnapshot] = React.useState(() => bus.snapshot ?? {});

    React.useEffect(() => {
        const unsub = bus.subscribe(`workflow_snapshot_${props.workflowId}`, (ctx) =>
            setSnapshot(ctx)
        );
        setSnapshot(bus.snapshot ?? {});
        return () => unsub();
    }, [props.workflowId, bus]);

    React.useEffect(() => {
        (async () => {
            try {
                const defs = await listWidgetDefinitions();
                setWidgetDefs(defs);
            } catch (e: any) {
                message.error(e?.message ?? 'Failed to load widget catalog');
            }
        })();
    }, []);

    React.useEffect(() => {
        (async () => {
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
        })();
    }, [props.workflowId]);

    const widgetDefById = React.useMemo(() => {
        const m: Record<string, any> = {};
        for (const d of widgetDefs) m[String(d.id)] = d;
        return m;
    }, [widgetDefs]);

    const layoutFromCompiled = React.useMemo(() => extractLayout(compiled), [compiled]);
    const widgetsArr = React.useMemo(() => extractWidgetsArray(compiled), [compiled]);
    const widgetsById = React.useMemo(() => widgetsMapById(widgetsArr), [widgetsArr]);

    const runtimeItems = React.useMemo(() => {
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
        bus,
        snapshot,
        compiled,
        loadingWorkflow,
        layoutFromCompiled,
        runtimeItems,
        workflowInfo,
    };
}
