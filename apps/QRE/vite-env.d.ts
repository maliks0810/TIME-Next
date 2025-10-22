/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string
    readonly VITE_CONTENT_MGMT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}