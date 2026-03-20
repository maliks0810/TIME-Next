/* eslint-disable  @typescript-eslint/no-explicit-any */
export type LauncherMode = 'new' | 'public' | 'mine' | 'landing';
export type MineFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'PUBLIC' | 'PRIVATE';

export type TemplateVersionLite = {
    id: string;
    templateId: string;
    version: number;
    status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
    defaultContext?: Record<string, any>;
};

export type TemplateRecord = {
    id: string;
    name: string;
    kind: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    ownerUserId?: string;
    sourceTemplateId?: string | null;

    class1?: string;
    class2?: string;
    class3?: string;

    scopeType?: 'USER' | 'AUDIENCE';
    scopeKey?: Record<string, string>;
    isSystem?: boolean;
};

export type WorkflowLauncherItem = {
    templateId: string;
    templateName: string;
    kind: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    ownerUserId?: string;
    sourceTemplateId?: string | null;

    class1?: string;
    class2?: string;
    class3?: string;

    scopeType?: 'USER' | 'AUDIENCE';
    scopeKey?: Record<string, string>;
    isSystem?: boolean;

    latestDraft?: TemplateVersionLite;
    latestPublished?: TemplateVersionLite;
};

export type WorkflowLaunchSelection = {
    templateId: string;
    templateVersionId: string;
    templateName: string;
    templateVersionStatus: string;
    initialContext?: Record<string, any>;
};
