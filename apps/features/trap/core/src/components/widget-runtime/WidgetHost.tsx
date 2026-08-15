/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { executeWidget } from '../../api/trap';
import { subscribeWidget } from '../../api/realtime';
import WidgetRenderer from '../../components/widget-runtime/WidgetRenderer';
import type { WidgetRenderMode } from '../../types/widget';
import { WidgetValueType } from '../../state/Widgets/types';
import { useDebounced } from '../../utils/useDebounced';
import { DEBOUNCED_WIDGET_PARAM_KEYS } from "../../utils/constants";

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

export default function WidgetHost(props: {
    widgetInstance: any;
    widgetDefinition: any;
    mode: WidgetRenderMode;
    uiActions?: Record<string, (...args: any[]) => any>;
}) {
    const [abortController, setAbortController] = React.useState<AbortController | undefined>();
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

    const params = React.useMemo(() => {
        return props.widgetInstance?.config?.params &&
            typeof props.widgetInstance.config.params === 'object'
            ? props.widgetInstance.config.params
            : {};
    }, [props.widgetInstance?.config?.params]);

    const debouncedParams = useDebounced(params, 500);

    const shouldDebounce = React.useMemo(() => {
        return DEBOUNCED_WIDGET_PARAM_KEYS.some(key => key in params)
    }, [params]);

    const paramsToExecute = shouldDebounce ? debouncedParams : params;

    // TODO implement configuration based listensToKeys handlers
    // const registryEntry = React.useMemo(() => {
    //     return widgetRegistry[widgetDefinitionId];
    // }, [widgetDefinitionId]);

    // const listensToKeys = React.useMemo(() => {
    //     const definitionKeys = props.widgetDefinition?.listensToKeys;
    //     if (Array.isArray(definitionKeys) && definitionKeys.length > 0) {
    //         return definitionKeys.map(String);
    //     }

    //     const registryKeys = registryEntry?.listensToKeys;
    //     if (Array.isArray(registryKeys) && registryKeys.length > 0) {
    //         return registryKeys.map(String);
    //     }

    //     return [];
    // }, [props.widgetDefinition?.listensToKeys, registryEntry?.listensToKeys]);

    const isIdentity = widgetDefinitionId === 'cwd_identity';

    const requestKey = React.useMemo(() => {
        return [
            widgetDefinitionId,
            String(variantId ?? ''),
            props.mode === 'designer' ? 'MOCK' : 'LIVE',
            stableStringify(params),
        ].join('::');
    }, [widgetDefinitionId, variantId, props.mode, debouncedParams]);

    React.useEffect(() => {
        if (!widgetDefinitionId || isIdentity || props.mode === 'preview') return;

        let cancelled = false;
        // Cleanup result in case of shared WidgetHost between different schemaKeys
        setResult(undefined);

        const run = async () => {
            setLoading(true);
            setError(undefined);

            try {
                const out = await executeWidget({
                    widgetDefinitionId,
                    variantId,
                    params: paramsToExecute,
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
    }, [requestKey, widgetDefinitionId, variantId, paramsToExecute, props.mode, isIdentity]);

    const execute = async (
        variables?: Record<string, WidgetValueType>,
        passedParams?: Record<string, WidgetValueType>
    ) => {
        setLoading(true);
        try {
            if (abortController) {
                abortController.abort();
            }

            // Create a new AbortController for this request
            const controller = new AbortController();
            const signal = controller.signal;
            setAbortController(controller);
            const response = await executeWidget(
                {
                    widgetDefinitionId,
                    variantId,
                    params: { ...params, ...passedParams },
                    context: {
                        ...variables,
                    },
                    mode: props.mode === 'designer' ? 'MOCK' : 'LIVE',
                },
                signal
            );
            setError(undefined);
            setResult(response?.result ?? {});
        } catch (e: any) {
            if (!e?.message.includes('signal')) setError(e?.message ?? 'Widget execution failed');
        } finally {
            setLoading(false);
            setAbortController(undefined);
        }
    };

    const subscribe = () => {
        if (props.mode === 'designer') {
            return;
        }
        const dispose = subscribeWidget(
            {
                widgetDefinitionId,
                variantId,
                params: { ...params },
                context: {},
                mode: 'LIVE',
            },
            (frame) => {
                setResult(frame?.result);
            }
        );

        return dispose;
    };
    return (
        <WidgetRenderer
            widgetInstance={props.widgetInstance}
            widgetDefinition={props.widgetDefinition}
            result={result}
            loading={loading}
            error={error}
            mode={props.mode}
            uiActions={props.uiActions}
            execute={execute}
            subscribe={subscribe}
        />
    );
}
