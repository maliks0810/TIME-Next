/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { executeWidget } from '../../api/trap';
import WidgetRenderer from '../../components/widget-runtime/WidgetRenderer';
import { widgetRegistry } from '../../registry/widgetRegistry';
import type { WidgetRenderMode } from '../../types/widget';
import { WidgetValueType } from '../../state/Widgets/types';

function stableStringify(value: unknown): string {
    try {
        if (value === null || value === undefined) return '';
        if (typeof value !== 'object') return JSON.stringify(value);

        const sortDeep = (input: any): any => {
            if (Array.isArray(input)) return input.map(sortDeep);
            if (input && typeof input === 'object') {
                return Object.keys(input)
                    .sort()
                    .reduce((acc: Record<string, any>, key) => {
                        acc[key] = sortDeep(input[key]);
                        return acc;
                    }, {});
            }
            return input;
        };

        return JSON.stringify(sortDeep(value));
    } catch {
        return '';
    }
}

function pickContextSubset(
    snapshot: Record<string, any> | undefined,
    listensToKeys: string[] | undefined
): Record<string, any> | undefined {
    if (!snapshot) return undefined;
    if (!Array.isArray(listensToKeys) || listensToKeys.length === 0) return undefined;

    if (listensToKeys.includes('*')) {
        return snapshot;
    }

    const entries = listensToKeys
        .filter((key) => snapshot[key] !== undefined)
        .map((key) => [key, snapshot[key]] as const);

    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
}

export default function WidgetHost(props: {
    widgetInstance: any;
    widgetDefinition: any;
    contextSnapshot?: Record<string, any>;
    mode: WidgetRenderMode;
    onPublishContext?: (key: string, value: any, sourceWidgetId?: string) => void;
    uiActions?: Record<string, (...args: any[]) => any>;
}) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [result, setResult] = React.useState<Record<string, unknown> | undefined>(undefined);

    const widgetDefinitionId = String(
        props.widgetInstance?.composedWidgetId ??
            props.widgetInstance?.widgetDefinitionId ??
            props.widgetDefinition?.id ??
            ''
    );

    const variantId = props.widgetInstance?.variantId;

    const registryEntry = React.useMemo(() => {
        return widgetRegistry[widgetDefinitionId];
    }, [widgetDefinitionId]);

    const params = React.useMemo(() => {
        return props.widgetInstance?.config?.params &&
            typeof props.widgetInstance.config.params === 'object'
            ? props.widgetInstance.config.params
            : {};
    }, [props.widgetInstance?.config?.params]);

    const listensToKeys = React.useMemo(() => {
        const definitionKeys = props.widgetDefinition?.listensToKeys;
        if (Array.isArray(definitionKeys) && definitionKeys.length > 0) {
            return definitionKeys.map(String);
        }

        const registryKeys = registryEntry?.listensToKeys;
        if (Array.isArray(registryKeys) && registryKeys.length > 0) {
            return registryKeys.map(String);
        }

        return [];
    }, [props.widgetDefinition?.listensToKeys, registryEntry?.listensToKeys]);

    const isIdentity = widgetDefinitionId === 'cwd_identity';

    const context = React.useMemo(() => {
        return pickContextSubset(props.contextSnapshot, listensToKeys);
    }, [props.contextSnapshot, listensToKeys]);

    const requestKey = React.useMemo(() => {
        return [
            widgetDefinitionId,
            String(variantId ?? ''),
            props.mode === 'designer' ? 'MOCK' : 'LIVE',
            stableStringify(params),
            stableStringify(context),
        ].join('::');
    }, [widgetDefinitionId, variantId, props.mode, params, context]);

    React.useEffect(() => {
        if (!widgetDefinitionId || isIdentity) return;

        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(undefined);

            try {
                const out = await executeWidget({
                    widgetDefinitionId,
                    variantId,
                    params,
                    context,
                    mode: props.mode === 'designer' ? 'MOCK' : 'LIVE',
                });

                if (cancelled) return;
                setResult(out?.result ?? {});
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? 'Widget execution failed');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [requestKey, widgetDefinitionId, variantId, params, context, props.mode, isIdentity]);
    const execute = async (
        variables?: Record<string, WidgetValueType>,
        passedParams?: Record<string, WidgetValueType>
    ) => {
        const response = await executeWidget({
            widgetDefinitionId,
            variantId,
            params: { ...params, ...passedParams },
            context: {
                ...context,
                ...variables,
            },
            mode: props.mode === 'designer' ? 'MOCK' : 'LIVE',
        });

        setResult(response?.result ?? {});
    };
    return (
        <WidgetRenderer
            widgetInstance={props.widgetInstance}
            widgetDefinition={props.widgetDefinition}
            result={result}
            loading={loading}
            error={error}
            contextSnapshot={props.contextSnapshot}
            mode={props.mode}
            onPublishContext={props.onPublishContext}
            uiActions={props.uiActions}
            execute={execute}
        />
    );
}
