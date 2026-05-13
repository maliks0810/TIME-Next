/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_R2_TRAP_DRAM_1_SERVICE: string;
    readonly VITE_R2_TRAP_DRAM_2_SERVICE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}