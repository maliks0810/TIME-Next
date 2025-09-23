/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_REACT_APP_TEST_AGQL_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}