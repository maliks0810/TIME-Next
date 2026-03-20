/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { DesignerWidgetInstance } from '../types/workflowDesigner.types';

export function uid(prefix = 'w'): string {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function safeJsonParse(text: string, fallback: any) {
    try {
        return JSON.parse(text || '');
    } catch {
        return fallback;
    }
}

export function coreWidgetToDesigner(w: any): DesignerWidgetInstance {
    const instanceId = String(w?.id ?? w?.instanceId ?? uid('wi'));
    return {
        instanceId,
        widgetDefinitionId: String(w?.composedWidgetId ?? w?.widgetDefinitionId ?? ''),
        widgetDefinitionVersion:
            Number(w?.composedWidgetVersion ?? w?.widgetDefinitionVersion ?? 1) || 1,
        variantId: w?.variantId,
        config: w?.config && typeof w.config === 'object' ? w.config : { params: {} },
    };
}

export function designerWidgetToCore(w: DesignerWidgetInstance): any {
    return {
        id: w.instanceId,
        composedWidgetId: w.widgetDefinitionId,
        composedWidgetVersion: w.widgetDefinitionVersion ?? 1,
        variantId: w.variantId ?? '',
        config: w.config ?? { params: {} },
    };
}

export function getRequiredFields(widgetDef: any): string[] {
    const schema = widgetDef?.configSchema;
    const req = schema?.required;
    return Array.isArray(req) ? req.map(String) : [];
}

export function isConfigured(widgetDef: any, config: any): boolean {
    const required = getRequiredFields(widgetDef);
    if (required.length === 0) return true;
    const dp = config?.params ?? {};
    return required.every((k) => dp[k] !== undefined && dp[k] !== null && String(dp[k]).length > 0);
}

export function hasConfigurableSchema(widgetDef: any): boolean {
    const schema = widgetDef?.configSchema;
    if (!schema || typeof schema !== 'object') return false;

    const properties = schema?.properties;
    if (properties && typeof properties === 'object' && Object.keys(properties).length > 0) {
        return true;
    }

    const required = schema?.required;
    return Array.isArray(required) && required.length > 0;
}
