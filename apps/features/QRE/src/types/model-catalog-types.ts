export type ModelCategorizationMap = { [key: string]: string[] };

export type ModelCategorization = {
    kind: string;
    purpose: string;
};

export enum ModelStates {
    experimental,
    integration,
    non_trading,
    trading,
}

export const stateColor = {
    [ModelStates.experimental]: 'warning',
    [ModelStates.integration]: 'info',
    [ModelStates.non_trading]: 'success',
    [ModelStates.trading]: 'error',
};

export enum ModelCatalogFilterByValues {
    'Name',
    'State',
    'Kind',
    'Purpose',
    'Owner',
    'Permissions',
    'Notes',
    'API URL',
    'Updated By',
    'Updated On',
}

export const ModelPermissions = ['view', 'create', 'edit', 'clone', 'delete'];

export type ModelCatalogRepo = {
    id: number;
    url: string;
};

export type ModelCatalogHub = {
    name: string;
    lab: string;
};

export type ModelCatalogSync = {
    user?: string;
    timestamp?: string;
};

export type ModelOwner = {
    email: string;
    fullName: string;
    id: string;
};

export type ModelCatalogEntry = {
    id: string;
    name: string;
    instance: string;
    kind: string;
    purpose: string;
    notes: string;
    owner: ModelOwner;
    permissions: string[];
    apiUrl: string;
    state: ModelStates;
    lastUpdated?: Date;
    lastUpdatedBy?: string;
    deleted?: boolean;
    repository: ModelCatalogRepo;
    hub: ModelCatalogHub;
    synchronization?: { toGitlab?: ModelCatalogSync; toHub?: ModelCatalogSync };
};

export const enum SyncTypes {
    ToJupyter,
    ToGitlab,
}

// eslint-disable-next-line
export type AnyData = any;