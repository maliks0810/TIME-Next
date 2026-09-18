/* eslint-disable  @typescript-eslint/no-explicit-any */
import type React from 'react';
import { WidgetValueType } from '../state/Widgets/types';

export type WidgetRenderMode = 'designer' | 'workflow' | 'landing' | 'preview';

export type WidgetUIActions = {
    openWorkflow?: (input: {
        target?: {
            templateId?: string;
            title?: string;
            templateVersionStatus?: string;
        };
        context?: Record<string, any>;
    }) => void | Promise<void>;
};

export type WidgetUIData = {
    templates?: Array<{ id: string; name: string }>;
    versions?: Array<{
        id: string;
        templateId: string;
        version: number;
        status: string;
        createdAt?: string;
        updatedAt?: string;
    }>;
    themeName?: string;
    themeOptions?: Array<{ value: string; label: React.ReactNode }>;
};

export type WidgetUIState = {
    targetTemplateId?: string;
};

export type WidgetInstanceLike = {
    id?: string;
    instanceId?: string;
    composedWidgetId?: string;
    widgetDefinitionId?: string;
    composedWidgetVersion?: number;
    widgetDefinitionVersion?: number;
    variantId?: string;
    config?: {
        params?: Record<string, any>;
    };
    listensToKeys?: string[];
    emitsKeys?: string[];
    uiActions?: WidgetUIActions;
    uiData?: WidgetUIData;
    uiState?: WidgetUIState;
    [k: string]: any;
};

export type WidgetDefinitionLike = {
    id?: string;
    name?: string;
    version?: number;
    category?: string;
    datasetId?: string;
    configSchema?: Record<string, any>;
    variants?: Array<{
        id: string;
        label: string;
        sizing?: {
            resizable?: boolean;
            width?: { default: number; min?: number; max?: number; step?: number };
            height?: { default: number; min?: number; max?: number; step?: number };
        };
    }>;
    uiHints?: Record<string, any>;
    description?: string;
    [k: string]: any;
};

export type WidgetComponentProps = {
    widgetInstance: WidgetInstanceLike;
    widgetDefinition?: WidgetDefinitionLike;
    result?: Record<string, unknown>;
    loading?: boolean;
    error?: string;
    mode: WidgetRenderMode;
    uiActions?: WidgetUIActions;
    execute?: (
        variables?: Record<string, WidgetValueType>,
        params?: Record<string, string>
    ) => void;
    subscribe?: () => void;
    defaultValue?: any;
};

export type WidgetRegistryEntry = {
    id: string;
    component: React.ComponentType<WidgetComponentProps>;
    category?: string;
    visibleIn?: Array<'landing' | 'workflow' | 'designer'>;
    listensToKeys?: string[];
    emitsKeys?: string[];
};
