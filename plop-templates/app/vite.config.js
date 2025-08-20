import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@import "@platform/styles/src/tokens/scss";'
            }
        }
    },
    server: {
        port: 3001
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022'
    }
});