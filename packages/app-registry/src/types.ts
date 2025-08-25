export interface AppMetadata {
    id: string;
    name: string;
    title: string;
    path: string;
    team: string;
    component: any;
    description?: string;
    requiresAuth?: boolean;
}

export interface TeamMetadata {
    id: string;
    name: string;
    displayName: string;
    apps: string[];
}

export interface AppRegistry {
    apps: Map<string, AppMetadata>;
    teams: Map<string, TeamMetadata>;
    getApp(id: string): AppMetadata | undefined;
    getTeamApp(teamId: string): AppMetadata[];
    getAllApps(): AppMetadata[];
    getNavigationItems(): AppMetadata[];
}