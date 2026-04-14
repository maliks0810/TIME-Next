import { OktaAuthOptions } from "@okta/okta-auth-js";

export const ENVIRONMENTS = {
  LOCAL: "local",
  DEV: "dev",
  QA: "qa",
  PROD: "prod",
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

interface FeatureFlags {
  enableTestDealerProposal: boolean;
}

interface RoutesConfig {
  basketNegotiations: string;
  createTestDealerProposal: string;
  healthCheck: string;
  sendToAladdin: string;
}

interface EnvironmentConfig {
  apiBaseUrl: string;
  webAppUrl: string;
  features: FeatureFlags;
  routes: RoutesConfig;
}

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const apiBaseUrlFromEnv = normalizeBaseUrl(import.meta.env.VITE_IOD_BSKT_API_BASE_URL);

const environmentConfigs: Record<Environment, EnvironmentConfig> = {
  [ENVIRONMENTS.LOCAL]: {
    apiBaseUrl: apiBaseUrlFromEnv,
    webAppUrl: "http://localhost:3000",
    features: { enableTestDealerProposal: true },
    routes: {
      basketNegotiations: "basketnegotiations",
      createTestDealerProposal: "basketnegotiations/createtestdealerproposal",
      healthCheck: "health",
      sendToAladdin: "basketnegotiations/aladdinbasketsecurities"
    },
  },

  [ENVIRONMENTS.DEV]: {
    apiBaseUrl: apiBaseUrlFromEnv,
    webAppUrl: "https://ebn-dev.np.tcw.com",
    features: { enableTestDealerProposal: true },
    routes: {
      basketNegotiations: "basketnegotiations",
      createTestDealerProposal: "basketnegotiations/createtestdealerproposal",
      healthCheck: "health",
      sendToAladdin: "basketnegotiations/aladdinbasketsecurities"
    },
  },

  [ENVIRONMENTS.QA]: {
    apiBaseUrl: apiBaseUrlFromEnv,
    webAppUrl: "https://ebn-qa.np.tcw.com",
    features: { enableTestDealerProposal: true },
    routes: {
      basketNegotiations: "basketnegotiations",
      createTestDealerProposal: "basketnegotiations/createtestdealerproposal",
      healthCheck: "health",
      sendToAladdin: "basketnegotiations/aladdinbasketsecurities"
    },
  },

  [ENVIRONMENTS.PROD]: {
    apiBaseUrl: apiBaseUrlFromEnv,
    webAppUrl: "https://ebn.pd.tcw.com",
    features: { enableTestDealerProposal: false },
    routes: {
      basketNegotiations: "basketnegotiations",
      createTestDealerProposal: "basketnegotiations/createtestdealerproposal",
      healthCheck: "health",
      sendToAladdin: "basketnegotiations/aladdinbasketsecurities"
    },
  },
};

const oktaConfigs: Record<Environment, OktaAuthOptions> = {
  [ENVIRONMENTS.LOCAL]: {
    issuer: "https://<okta-issuer-local>",
    clientId: "<client-id-local>",
    redirectUri: "http://localhost:3000/login/callback",
  },
  [ENVIRONMENTS.DEV]: {
    issuer: "https://<okta-issuer-dev>",
    clientId: "<client-id-dev>",
    redirectUri: "https://ebn-dev.np.tcw.com/login/callback",
  },
  [ENVIRONMENTS.QA]: {
    issuer: "https://<okta-issuer-qa>",
    clientId: "<client-id-qa>",
    redirectUri: "https://ebn-qa.np.tcw.com/login/callback",
  },
  [ENVIRONMENTS.PROD]: {
    issuer: "https://<okta-issuer-prod>",
    clientId: "<client-id-prod>",
    redirectUri: "https://ebn.pd.tcw.com/login/callback",
  },
};

export const getCurrentEnvironment = (): Environment => {
  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes("dev")) return ENVIRONMENTS.DEV;
  if (hostname.includes("qa") || hostname.includes("-main")) return ENVIRONMENTS.QA;
  if (hostname.includes("pd") || hostname.includes("prod")) return ENVIRONMENTS.PROD;

  return ENVIRONMENTS.LOCAL;
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = getCurrentEnvironment();
  return environmentConfigs[env];
};

export const getApiBaseUrl = (): string => getEnvironmentConfig().apiBaseUrl;

export const isTestDealerProposalEnabled = (): boolean => {
  const cfg = getEnvironmentConfig();
  const env = getCurrentEnvironment();
  return cfg.features.enableTestDealerProposal && env !== ENVIRONMENTS.PROD;
};

export const getCreateTestDealerProposalUrl = (): string => {
  const cfg = getEnvironmentConfig();
  return `${cfg.apiBaseUrl}/${cfg.routes.createTestDealerProposal}`;
};

export const getBasketNegotiationsUrl = (asOfDate?: string): string => {
  const cfg = getEnvironmentConfig();
  const base = `${cfg.apiBaseUrl}/${cfg.routes.basketNegotiations}`;
  return asOfDate ? `${base}?asOfDate=${encodeURIComponent(asOfDate)}` : base;
};

export const getSendToAladdinUrl = (): string => {
  const cfg = getEnvironmentConfig();
  return`${cfg.apiBaseUrl}/${cfg.routes.sendToAladdin}`;
};

export const getOktaConfig = (): OktaAuthOptions => {
  const env = getCurrentEnvironment();
  return oktaConfigs[env];
};
