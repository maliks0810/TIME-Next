/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_REACT_APP_OKTA_CLIENT_ID: string;
    readonly VITE_REACT_APP_OKTA_ISSUER: string;
    readonly VITE_REACT_APP_OKTA_AUTHORIZATION_URL: string;
    readonly VITE_REACT_APP_TIME_PROFILE_AGQL_URL: string;
    readonly VITE_REACT_APP_SUPPORT_EMAIL: string;
    readonly VITE_REACT_APP_TIP_ERISA_AI_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}