export interface InternalAppMetadata {
    type: 'internal';
    id: string;
    name: string;
    title: string;
    env: HighestEnv;
    path?: string;
    team?: string;
    header?: string;
    subHeader?: string;
    order?: number;
    component?: React.LazyExoticComponent<React.ComponentType>;
    url?: string;
    description?: string;
    requiresAuth?: boolean;
    disabled?: boolean;
    newTab?: boolean;
}

export interface ExternalAppMetadata {
    type: 'external';
    header: string;
    subHeader: string;
    title: string;
    url: string;
    newTab: boolean;
    disabled: boolean;
    env: HighestEnv;
    httpMethod?: 'GET' | 'POST';
    postBody?: string;
    requiresAuth?: boolean;
    path?: string;
}

export enum HighestEnv {
    sandbox = 'sandbox',
    dev = 'development',
    qa = 'qa',
    prod = 'production'
} 

export interface TeamMetadata {
    id: string;
    name: string;
    displayName: string;
    apps: string[];
}

export interface AppRegistry {
    apps: Map<string, InternalAppMetadata|ExternalAppMetadata>;
    teams: Map<string, TeamMetadata>;
    getApp(id: string): InternalAppMetadata |ExternalAppMetadata | undefined;
    getTeamApp(teamId: string): (InternalAppMetadata|ExternalAppMetadata)[];
    getAllApps(): (InternalAppMetadata|ExternalAppMetadata)[];
    getNavigationItems(): (InternalAppMetadata|ExternalAppMetadata)[];
}
