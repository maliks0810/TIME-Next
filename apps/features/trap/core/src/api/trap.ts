/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/api/trap.ts
// UI -> TRAP GraphQL only

type GqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

const GRAPHQL_URL = import.meta.env.VITE_APP_GRAPHQL_URL;

function getBearerToken(): string {
    const STORAGE_KEY = 'okta-token-storage';
    const rawData = localStorage.getItem(STORAGE_KEY);
    
    if (!rawData) return '';

    try {
        const parsed = JSON.parse(rawData);
        return parsed?.idToken?.idToken || '';
    } catch (err) {
        console.error('Error parsing auth token:', err);
        return '';
    }
}

function getIdentityHeaders(): Record<string, string> {
    const token = getBearerToken();
    const debugUser = localStorage.getItem('debug-user');
    const debugLogin = debugUser;
    const debugUserId = debugUser;
    const debugEmail = debugUser ? `${debugUser}@test.local` : null;
    const debugname = debugUser === 'jane' ? 'Jane' : debugUser === 'john' ? 'John' : debugUser;
    const debugOrg1 = localStorage.getItem('debug-org1');
    const debugOrg2 = localStorage.getItem('debug-org2');
    const debugOrg4 = localStorage.getItem('debug-org4');
    const debugRole = localStorage.getItem('debug-role');

    const login = debugLogin || sessionStorage.getItem('okta-user') || '';
    const name = debugname || sessionStorage.getItem('okta-name') || '';
    const userId = debugUserId || sessionStorage.getItem('okta-user') || '';
    const email = debugEmail || sessionStorage.getItem('okta-email') || '';
    const org1 = debugOrg1 || sessionStorage.getItem('OrgLevel1') || '';
    const org2 = debugOrg2 || sessionStorage.getItem('OrgLevel2') || '';
    const org4 = debugOrg4 || sessionStorage.getItem('OrgLevel4') || '';
    const role = debugRole || sessionStorage.getItem('okta-role') || 'Analyst';

    return {
        'content-type': 'application/json',
        'authorization': token ? `Bearer ${token}` : '',
        'x-user-login': login,
        'x-user-id': userId,
        'x-user-email': email,
        'x-user-name': name,
        'x-user-org1': org1,
        'x-user-org2': org2,
        'x-user-org4': org4,
        'x-user-role': role,
    };
}

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: getIdentityHeaders(),
        body: JSON.stringify({ query, variables: variables ?? {} }),
    });

    const json = (await res.json()) as GqlResponse<T>;

    if (!res.ok) {
        const msg = json?.errors?.[0]?.message || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
    }
    if (json.errors && json.errors.length) throw new Error(json.errors[0].message);
    if (!json.data) throw new Error('No data returned from GraphQL');

    return json.data;
}

export type TemplateSummary = {
    id: string;
    name: string;
    kind: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    ownerUserId?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    sourceTemplateId?: string | null;
    scopeType?: 'USER' | 'AUDIENCE';
    scopeKey?: Record<string, string>;
    class1?: string;
    class2?: string;
    class3?: string;
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

export async function createTemplate(input: {
    name: string;
    kind: 'LANDING' | 'WORKFLOW' | 'landing' | 'workflow';
    visibility?: 'PRIVATE' | 'PUBLIC';
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
    visibility?: 'PRIVATE' | 'PUBLIC';
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

export async function getTemplateVersion(templateId: string, versionId: string): Promise<any> {
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

export async function updateDraftVersion(
    templateId: string,
    versionId: string,
    payload: any
): Promise<any> {
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
        { input: { templateId, versionId, payload } }
    );
    return data.updateDraftVersion;
}

export async function publishTemplateVersion(templateId: string, versionId: string): Promise<any> {
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

export async function openTemplate(
    templateVersionId: string,
    context: Record<string, any> = {}
): Promise<{ workflowId: string }> {
    const data = await gql<{ openTemplate: { workflowId: string } }>(
        `mutation OpenTemplate($input: OpenTemplateInput!) {
      openTemplate(input: $input) { workflowId }
    }`,
        { input: { templateVersionId, context } }
    );
    return data.openTemplate;
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

export async function compiledWorkflowView(workflowId: string): Promise<any> {
    const data = await gql<{ compiledWorkflowView: { view: any } }>(
        `query CompiledWorkflowView($workflowId: String!) {
      compiledWorkflowView(workflowId: $workflowId) { view }
    }`,
        { workflowId }
    );
    return data.compiledWorkflowView;
}

export const getCompiledWorkflowView = compiledWorkflowView;

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
          grid {
            defaultW
            defaultH
            minW
            minH
            maxW
            maxH
          }
        }
      }
    }`
    );
    return data.widgetDefinitions || [];
}

export async function executeWidget(input: {
    widgetDefinitionId: string;
    variantId?: string;
    params?: Record<string, any>;
    context?: Record<string, any>;
    mode?: 'MOCK' | 'LIVE';
}): Promise<any> {
    const data = await gql<{ executeWidget: any }>(
        `mutation ExecuteWidget($input: ExecuteWidgetInput!) {
      executeWidget(input: $input) {
        widgetDefinitionId
        datasetId
        variantId
        result
      }
    }`,
        { input }
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
