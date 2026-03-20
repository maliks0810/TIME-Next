/* eslint-disable  @typescript-eslint/no-explicit-any */
export type DesignerWidgetInstance = {
    instanceId: string;
    widgetDefinitionId: string;
    widgetDefinitionVersion?: number;
    variantId?: string;
    config?: {
        params?: Record<string, any>;
    };
    [k: string]: any;
};
