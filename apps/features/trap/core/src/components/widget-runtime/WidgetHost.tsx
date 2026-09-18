/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { executeWidget } from '../../api/trap';
import { subscribeWidget } from '../../api/realtime';
import WidgetRenderer from '../../components/widget-runtime/WidgetRenderer';
import type { WidgetRenderMode } from '../../types/widget';
import type { WidgetValueType } from '../../state/Widgets/types';
import { useDebounced } from '../../utils/useDebounced';
import { DEBOUNCED_WIDGET_PARAM_KEYS } from '../../utils/constants';

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

function isAbortError(error: any): boolean {
    return (
        error?.name === 'AbortError' ||
        String(error?.message ?? '')
            .toLowerCase()
            .includes('abort') ||
        String(error?.message ?? '')
            .toLowerCase()
            .includes('signal')
    );
}

export default function WidgetHost(props: {
    widgetInstance: any;
    widgetDefinition: any;
    mode: WidgetRenderMode;
    uiActions?: Record<string, (...args: any[]) => any>;
    defaultValue?: any;
}) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [result, setResult] = React.useState<Record<string, unknown> | undefined>(undefined);

    const abortControllerRef = React.useRef<AbortController | null>(null);
    const requestSequenceRef = React.useRef(0);

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
        return DEBOUNCED_WIDGET_PARAM_KEYS.some((key) => key in params);
    }, [params]);

    const paramsToExecute = shouldDebounce ? debouncedParams : params;

    const isIdentity = widgetDefinitionId === 'cwd_identity';

    const requestKey = React.useMemo(() => {
        return [
            widgetDefinitionId,
            String(variantId ?? ''),
            props.mode === 'designer' ? 'MOCK' : 'LIVE',
            stableStringify(paramsToExecute),
        ].join('::');
    }, [widgetDefinitionId, variantId, props.mode, paramsToExecute]);

    /**
     * Initial/configuration-driven execution.
     *
     * The previous result is cleared before loading begins so a widget never
     * presents data from an obsolete configuration while the next request is
     * running. Request sequencing prevents an older response from replacing a
     * newer result.
     */
    React.useEffect(() => {
        if (!widgetDefinitionId || isIdentity || props.mode === 'preview') {
            return;
        }

        const requestSequence = ++requestSequenceRef.current;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setResult(undefined);
        setLoading(true);
        setError(undefined);

        const run = async () => {
            try {
                const response = await executeWidget(
                    {
                        widgetDefinitionId,
                        variantId,
                        params: paramsToExecute,
                        mode: props.mode === 'designer' ? 'MOCK' : 'LIVE',
                    },
                    controller.signal
                );

                if (controller.signal.aborted || requestSequence !== requestSequenceRef.current) {
                    return;
                }

                setResult(response?.result ?? {});
            } catch (executionError: any) {
                if (
                    controller.signal.aborted ||
                    requestSequence !== requestSequenceRef.current ||
                    isAbortError(executionError)
                ) {
                    return;
                }

                setError(executionError?.message ?? 'Widget execution failed');
            } finally {
                if (!controller.signal.aborted && requestSequence === requestSequenceRef.current) {
                    setLoading(false);

                    if (abortControllerRef.current === controller) {
                        abortControllerRef.current = null;
                    }
                }
            }
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [requestKey, widgetDefinitionId, variantId, paramsToExecute, props.mode, isIdentity]);

    /**
     * Context-driven execution used by Chart, Geo, KPI, and other widgets.
     *
     * Starting a new execution immediately clears the previous result, causing
     * each widget to render its existing loading state rather than stale data.
     * The active request is cancelled, and only the newest response may update
     * result/loading/error state.
     */
    const execute = React.useCallback(
        async (
            variables?: Record<string, WidgetValueType>,
            passedParams?: Record<string, WidgetValueType>
        ) => {
            const requestSequence = ++requestSequenceRef.current;

            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setResult(undefined);
            setLoading(true);
            setError(undefined);

            try {
                const response = await executeWidget(
                    {
                        widgetDefinitionId,
                        variantId,
                        params: {
                            ...params,
                            ...passedParams,
                        },
                        context: {
                            ...variables,
                        },
                        mode: props.mode === 'designer' ? 'MOCK' : 'LIVE',
                    },
                    controller.signal
                );

                if (controller.signal.aborted || requestSequence !== requestSequenceRef.current) {
                    return;
                }

                setResult(response?.result ?? {});
                return response?.result;
            } catch (executionError: any) {
                if (
                    controller.signal.aborted ||
                    requestSequence !== requestSequenceRef.current ||
                    isAbortError(executionError)
                ) {
                    return;
                }

                setError(executionError?.message ?? 'Widget execution failed');
            } finally {
                if (!controller.signal.aborted && requestSequence === requestSequenceRef.current) {
                    setLoading(false);

                    if (abortControllerRef.current === controller) {
                        abortControllerRef.current = null;
                    }
                }
            }
        },
        [widgetDefinitionId, variantId, params, props.mode]
    );

    const subscribe = React.useCallback(() => {
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
    }, [widgetDefinitionId, variantId, params, props.mode]);

    React.useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
            requestSequenceRef.current += 1;
        };
    }, []);

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
            defaultValue={props.defaultValue}
        />
    );
}
