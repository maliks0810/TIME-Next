/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_API_URL: string;
    readonly REACT_APP_OKTA_CLIENT_ID: string;
    readonly REACT_APP_OKTA_ISSUER: string;
    readonly REACT_APP_OKTA_AUTHORIZATION_URL: string;
    readonly REACT_APP_TIME_PROFILE_AGQL_URL: string;
    readonly REACT_APP_SUPPORT_EMAIL: string;
    readonly REACT_APP_TIP_ERISA_AI_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}