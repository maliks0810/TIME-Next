export interface AppMetadata {
    id: string;
    name: string;
    title: string;
    external: boolean;
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


