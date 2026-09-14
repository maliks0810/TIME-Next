/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/api/trap.ts
// UI -> TRAP GraphQL only

import { getIdentityHeaders } from './getIdentityHeaders';
import { coreGlobalMessage } from '../utils/message';

type GqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

const GRAPHQL_URL = import.meta.env.VITE_APP_GRAPHQL_URL;

// Filter out cases for now:
// 1. Unsuported schemakey
// 2. No datset key found
const IGNORED_ERROR_PATTERNS = [
    'No dataset executor registered for datasetId=',
    'Unsupported schemaKey:',
];

const isErrorIgnorable = (error: string) => {
    return (
        import.meta.env.PROD || IGNORED_ERROR_PATTERNS.some((message) => error.includes(message))
    );
};
async function gql<T>(
    query: string,
    variables?: Record<string, any>,
    signal?: AbortSignal
): Promise<T> {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: getIdentityHeaders(),
        body: JSON.stringify({ query, variables: variables ?? {} }),
        signal,
    });

    const json = (await res.json()) as GqlResponse<T>;

    if (!res.ok) {
        const msg = json?.errors?.[0]?.message || `HTTP ${res.status} ${res.statusText}`;
        if (!isErrorIgnorable(msg)) coreGlobalMessage.error(msg);
        throw new Error(msg);
    }
    if (json.errors && json.errors.length) {
        if (!isErrorIgnorable(json.errors[0].message))
            coreGlobalMessage.error(json.errors[0].message);
        throw new Error(json.errors[0].message);
    }

    if (!json.data) throw new Error('No data returned from GraphQL');

    return json.data;
}

export type TemplateSummary = {
    id: string;
    name: string;
    kind: string;
    visibility: Visibility;
    ownerUserId?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    sourceTemplateId?: string | null;
    scopeType?: 'USER' | 'AUDIENCE';
    scopeKey?: Record<string, string>;
    class1?: string;
    class2?: string;
    class3?: string;
    latestDraft: any;
    latestPublished: any;
};

export async function listTemplates(): Promise<TemplateSummary[]> {
    const data = await gql<{ templates: TemplateSummary[] }>(
        `query Templates {
      templates {
        id
        name
        kind
        visibility
        ownerUserId
        createdByUserId
        updatedByUserId
        sourceTemplateId
        class1
        class2
        class3
        scopeType
        scopeKey
        isSystem
        latestDraft {
            id
            templateId
            version
            status
            defaultContext
        }
        latestPublished {
            id
            templateId
            version
            status
            defaultContext
        }
      }
    }`
    );
    return data.templates || [];
}

export const getTemplates = listTemplates;

export async function listTemplateVersions(templateId: string): Promise<any[]> {
    const data = await gql<{ templateVersions: any[] }>(
        `query TemplateVersions($templateId: String!) {
      templateVersions(templateId: $templateId) {
        id
        templateId
        version
        status
        createdByUserId
        publishedByUserId
        publishedAt
        defaultContext
        layout
        widgets
        createdAt
        updatedAt
      }
    }`,
        { templateId }
    );
    return data.templateVersions || [];
}

export enum Kind {
    WORKFLOW = 'WORKFLOW',
    LANDING = 'LANDING',
}
export enum Visibility {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
}
export async function createTemplate(input: {
    name: string;
    kind: Kind;
    visibility?: Visibility;
    class1?: string;
    class2?: string;
    class3?: string;
}): Promise<TemplateSummary> {
    const normalizedInput = {
        ...input,
        kind: String(input.kind).toUpperCase(),
        visibility: input.visibility ?? 'PRIVATE',
    };

    const data = await gql<{ createTemplate: TemplateSummary }>(
        `mutation CreateTemplate($input: CreateTemplateInput!) {
      createTemplate(input: $input) {
        id
        name
        kind
        visibility
        ownerUserId
        createdByUserId
        updatedByUserId
        sourceTemplateId
        class1
        class2
        class3
      }
    }`,
        { input: normalizedInput }
    );
    return data.createTemplate;
}

export async function updateTemplate(input: {
    templateId: string;
    name?: string;
    visibility?: Visibility;
    class1?: string;
    class2?: string;
    class3?: string;
}): Promise<TemplateSummary> {
    const data = await gql<{ updateTemplate: TemplateSummary }>(
        `mutation UpdateTemplate($input: UpdateTemplateInput!) {
      updateTemplate(input: $input) {
        id
        name
        kind
        visibility
        ownerUserId
        createdByUserId
        updatedByUserId
        sourceTemplateId
        class1
        class2
        class3
      }
    }`,
        { input }
    );
    return data.updateTemplate;
}

export async function cloneTemplate(templateId: string, name?: string): Promise<any> {
    const data = await gql<{ cloneTemplate: any }>(
        `mutation CloneTemplate($input: CloneTemplateInput!) {
      cloneTemplate(input: $input)
    }`,
        { input: { templateId, name } }
    );
    return data.cloneTemplate;
}

export async function createDraftVersion(templateId: string, baseVersionId?: string): Promise<any> {
    const data = await gql<{ createDraftVersion: any }>(
        `mutation CreateDraftVersion($input: CreateDraftVersionInput!) {
      createDraftVersion(input: $input) {
        id
        templateId
        version
        status
        createdByUserId
        defaultContext
        layout
        widgets
        createdAt
        updatedAt
      }
    }`,
        { input: { templateId, baseVersionId } }
    );
    return data.createDraftVersion;
}

export async function getTemplateVersion(
    templateId: string,
    versionId = 'mockVersionId'
): Promise<any> {
    const data = await gql<{ templateVersion: any }>(
        `query TemplateVersion($templateId: String!, $versionId: String!) {
      templateVersion(templateId: $templateId, versionId: $versionId) {
        id
        templateId
        version
        status
        createdByUserId
        publishedByUserId
        publishedAt
        defaultContext
        layout
        widgets
        createdAt
        updatedAt
      }
    }`,
        { templateId, versionId }
    );
    return data.templateVersion;
}

export async function updateDraftVersion(templateId: string, payload: any): Promise<any> {
    const data = await gql<{ updateDraftVersion: any }>(
        `mutation UpdateDraftVersion($input: UpdateDraftVersionInput!) {
      updateDraftVersion(input: $input) {
        id
        templateId
        version
        status
        createdByUserId
        publishedByUserId
        publishedAt
        defaultContext
        layout
        widgets
        createdAt
        updatedAt
      }
    }`,
        { input: { templateId, versionId: 'mockVersionId', payload } }
    );
    return data.updateDraftVersion;
}

export async function publishTemplateVersion(
    templateId: string,
    versionId = 'mockVersionId'
): Promise<any> {
    const data = await gql<{ publishTemplateVersion: any }>(
        `mutation PublishTemplateVersion($input: PublishVersionInput!) {
      publishTemplateVersion(input: $input) {
        id
        templateId
        version
        status
        createdByUserId
        publishedByUserId
        publishedAt
        defaultContext
        layout
        widgets
        createdAt
        updatedAt
      }
    }`,
        { input: { templateId, versionId } }
    );
    return data.publishTemplateVersion;
}

export async function deleteTemplate(templateId: string): Promise<any> {
    const data = await gql<{ deleteTemplate: any }>(
        `mutation DeleteTemplate($input: DeleteTemplateInput!) {
      deleteTemplate(input: $input)
    }`,
        { input: { templateId } }
    );
    return data.deleteTemplate;
}

export async function listWidgetDefinitions(): Promise<any[]> {
    const data = await gql<{ widgetDefinitions: any[] }>(
        `query WidgetDefinitions {
      widgetDefinitions {
        id
        name
        version
        description
        tags
        category
        datasetId
        listensToKeys
        emitsKeys
        configSchema
        uiHints
        variants {
          id
          label
          sizing {
            resizable
            width { default min max step }
            height { default min max step }
          }
        }
      }
    }`
    );
    return data.widgetDefinitions || [];
}

export async function executeWidget(
    input: {
        widgetDefinitionId: string;
        variantId?: string;
        params?: Record<string, any>;
        context?: Record<string, any>;
        mode?: 'MOCK' | 'LIVE';
    },
    signal?: AbortSignal
): Promise<any> {
    const data = await gql<{ executeWidget: any }>(
        `mutation ExecuteWidget($input: ExecuteWidgetInput!) {
      executeWidget(input: $input) {
        widgetDefinitionId
        datasetId
        variantId
        result
      }
    }`,
        { input },
        signal
    );

    return data.executeWidget;
}

export async function widgetPreview(input: {
    widgetDefinitionId: string;
    variantId?: string;
    params?: Record<string, any>;
    context?: Record<string, any>;
    mode?: 'MOCK' | 'LIVE';
}): Promise<any> {
    return executeWidget(input);
}

export type Team = {
    departmentName: string;
    groupName: string;

    teamName: string;
};
export async function getTeams(): Promise<Team[]> {
    const data = await gql<{ getTeams: Team[] }>(`query GetTeams { getTeams {
        departmentName
        groupName
        id  
        teamName }
    }`);
    return data.getTeams || [];
}

// ---- Custom themes -----------------------------------------------------------
// User-authored themes persisted via the Core API → Cosmos "themes" container. tokens is a
// JSON blob so new token keys don't require a per-field schema change across the 4 layers.
export type ThemeRecord = {
    id: string;
    name: string;
    base: string;
    mode: 'light' | 'dark';
    tokens: Record<string, string | number>;
    ownerUserId?: string;
    scopeType?: 'USER' | 'AUDIENCE';
    scopeKey?: Record<string, string>;
};

export async function listThemes(): Promise<ThemeRecord[]> {
    const data = await gql<{ themes: ThemeRecord[] }>(
        `query Themes {
      themes {
        id
        name
        base
        mode
        tokens
        ownerUserId
        scopeType
        scopeKey
      }
    }`
    );
    return data.themes || [];
}

export async function saveTheme(input: {
    id: string;
    name: string;
    base: string;
    mode: 'light' | 'dark';
    tokens: Record<string, string | number>;
}): Promise<ThemeRecord> {
    const data = await gql<{ saveTheme: ThemeRecord }>(
        `mutation SaveTheme($input: ThemeInput!) {
      saveTheme(input: $input) {
        id
        name
        base
        mode
        tokens
        ownerUserId
        scopeType
        scopeKey
      }
    }`,
        { input }
    );
    return data.saveTheme;
}

export async function deleteTheme(id: string): Promise<boolean> {
    const data = await gql<{ deleteTheme: boolean }>(
        `mutation DeleteTheme($input: DeleteThemeInput!) {
      deleteTheme(input: $input)
    }`,
        { input: { id } }
    );
    return data.deleteTheme;
}

export type UserPreferences = {
    id: string;
    category: string;
    userId: string;
    application: string;
    profile: Record<string, any>;
};

export async function getUserPreferenceByApplication(
    application: string
): Promise<Record<string, any>> {
    const data = await gql<{ profileByApplication: any }>(
        `query profileByApplication($application: String!) { profileByApplication(application: $application) {
        id, 
        category,
        userId,
        application,
        profile }
    }`,
        { application }
    );

    return data.profileByApplication || {};
}

export async function getUserPreferenceById(userId: string): Promise<UserPreferences[]> {
    const data = await gql<{ profiles: any[] }>(
        `query Profiles($userId: String!) { profiles(userId: $userId) {
        id, 
        category,
        userId,
        application,
        profile }
    }`,
        { userId }
    );

    return data.profiles || [];
}

export async function upsertPreference(input: any): Promise<boolean> {
    await gql<{ preferences: any[] }>(
        `mutation UpsertProfile($input: CreateProfile!) { upsertProfile(input: $input) 
    }`,
        { input }
    );

    return true;
}

export async function overridePreference(input: any, userId: string): Promise<boolean> {
    await gql<{ preferences: any[] }>(
        `mutation UpdatePreference($input: UpdatePreference!, $userId: String!) { updatePreference(input: $input, userId: $userId)
    }`,
        { input, userId }
    );

    return true;
}
