/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_QRE_CONTENT_MGMT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}