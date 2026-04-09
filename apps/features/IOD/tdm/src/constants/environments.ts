export const ENVIRONMENTS = {
    LOCAL: 'local',
    DEV: 'dev',
    QA: 'qa',
    PROD: 'prod',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

interface EnvironmentConfig {
    apiBaseUrl: string;
    webAppUrl: string;
}

// TODO SOURCE BASE URL FROM PLOP ENVIRONMENT FILES...
const environmentConfigs: Record<Environment, EnvironmentConfig> = {
    [ENVIRONMENTS.LOCAL]: {
        apiBaseUrl: 'https://localhost:44336',
        webAppUrl: 'timenext-sandbox-feature-tdm-main.np.tcw.com',
    },
    [ENVIRONMENTS.DEV]: {
        apiBaseUrl: 'https://tdm-web-service-dev.np.tcw.com',
        webAppUrl: 'timenext-sandbox-feature-tdm-main.np.tcw.com',
    },
    [ENVIRONMENTS.QA]: {
        apiBaseUrl: 'https://tdm-web-service-qa.np.tcw.com',
        webAppUrl: 'timenext-qa.np.tcw.com', // TODO: get correct url
    },
    [ENVIRONMENTS.PROD]: {
        apiBaseUrl: 'https://tdm-web-service.pd.tcw.com',
        webAppUrl: 'timenext.pd.tcw.com', // TODO: get correct url
    },
};

/**
 * Determines the current environment based on the window location
 */
export const getCurrentEnvironment = (): Environment => {
    const hostname = window.location.hostname;

    if (hostname.includes('dev') || hostname.includes('-dev')) return ENVIRONMENTS.DEV;
    if (hostname.includes('qa') || hostname.includes('-main') || hostname.includes('-release'))
        return ENVIRONMENTS.QA;
    if (hostname.includes('pd') || hostname.includes('prod')) return ENVIRONMENTS.PROD;

    // Default to dev for local development
    //return ENVIRONMENTS.DEV;
    return ENVIRONMENTS.LOCAL;
};

/**
 * Gets the configuration for the current environment
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
    const environment = getCurrentEnvironment();
    return environmentConfigs[environment];
};

/**
 * Gets the API base URL for the current environment
 */
export const getApiBaseUrl = (): string => {
    return `${getEnvironmentConfig().apiBaseUrl}/tdm/api/v1`;
};
