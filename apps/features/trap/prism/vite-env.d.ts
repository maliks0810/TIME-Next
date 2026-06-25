/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_R2_TRAP_ARC_SERVICE: string;
    readonly VITE_R2_TRAP_PRISM_SERVICE: string;
    readonly VITE_R2_TRAP_PRISM_BASE_URL: string;
    readonly VITE_R2_TRAP_PRISM_CLO_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}