import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

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
    entryPointUrl?: string;
    url?: string;
    description?: string;
    requiresAuth?: boolean;
    disabled?: boolean;
    newTab?: boolean;
    hideFooter?: boolean;
}

export interface ExternalAppMetadata {
    type: 'external';
    header: NavbarHeader;
    subHeader: NavbarSubHeader;
    title: string;
    sandboxUrl?: string;
    devUrl?: string;
    qaUrl?: string;
    prodUrl?: string;
    newTab: boolean;
    disabled: boolean;
    env: HighestEnv;
    httpMethod?: 'GET' | 'POST';
    postBody?: string;
    requiresAuth?: boolean;
    path?: string;
    hideFooter?: boolean;
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
