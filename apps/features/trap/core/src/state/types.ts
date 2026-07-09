/* eslint-disable  @typescript-eslint/no-explicit-any */
export type TemplateSummary = { id: string; name: string };

export type WidgetLayout = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
};

export type EndpointBinding = {
    endpointId?: string;
    paramMap?: Record<string, string>; // contextKey -> paramName
    defaultParams?: Record<string, any>;
    fieldSelection?: string[];
    filters?: Record<string, any>;
};

export type WidgetInstance = {
    id: string;
    composedWidgetId: string;
    composedWidgetVersion: number;
    title?: string;
    variantId?: string;
    binding: EndpointBinding;
    listensToKeys?: string[];
    emitsKeys?: string[];
};

export type CompiledWorkflowView = {
    workflowId: string;
    templateVersionId: string;
    activeVariantId: string;
    theme?: Record<string, any>;
    defaultContext?: Record<string, any>;
    layout: WidgetLayout[];
    widgets: WidgetInstance[];
    etag: string;
    viewHash: string;
};

export type WidgetDefinition = {
    id: string;
    name: string;
    variants: Array<{
        id: string;
        label: string;
        sizing?: {
            resizable?: boolean;
            width?: { default: number; min?: number; max?: number; step?: number };
            height?: { default: number; min?: number; max?: number; step?: number };
        };
    }>;
    supportedEntityTypes: Array<{ domain: string; entityType: string; subtype?: string | null }>;
    preview?: { defaultDatasetId?: string | null; notes?: string | null };
};

export type PreviewDataset = {
    id: string;
    label: string;
    entity: { domain: string; entityType: string; subtype?: string | null };
    sampleContext?: any;
    sampleResult?: any;
};

export type WidgetPreviewResult = {
    widgetDefinitionId: string;
    widgetVersion?: number;
    variantId?: string;
    datasetId?: string;
    entity?: { domain: string; entityType: string; subtype?: string | null };
    contextUsed?: any;
    data?: any;
    diagnostics?: any;
};
