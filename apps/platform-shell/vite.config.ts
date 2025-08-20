import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // can't find import need to take a look at platform/styles to figure out why it's not inheriting. 
                // additionalData: '@import "@platform/styles/src/index.scss";'
            }
        }
    },
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022'
    }
});