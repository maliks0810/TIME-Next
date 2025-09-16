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
    dev = 'dev',
    qa = 'qa',
    prod = 'prod'
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

export enum NavbarHeader {
    PortfolioManagement = 'Portfolio Management',
    ResearchAnalysis = 'Research & Analysis',
    RiskPerformance = 'Risk & Performance',
    Compliance = 'Compliance',
    ClientManagement = 'Client Management',
    Support = 'Support'

}

export enum NavbarSubHeader {
    AladdinPortfolioManagement = 'Aladdin Portfolio Management',
    InvestmentManagementSolutions = 'Investment Management Solutions',
    Fundamental = 'Fundamental',
    ESG = 'ESG',
    Market = 'Market',
    Other = 'Other',
    Performance = 'Performance',
    Research = 'Research',
    Governance = 'Governance',
    Regulations = 'Regulations',
    General = 'General'
}


