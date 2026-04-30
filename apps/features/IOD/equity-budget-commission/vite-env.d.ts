/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_IOD_CMS_SERVICE_URL: string;
    readonly VITE_IOD_COB_REPORT_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}