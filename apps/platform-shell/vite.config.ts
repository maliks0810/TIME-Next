import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
    plugins: [
        react()
    ],
    server: {
        port: 5173,
        fs: {
            allow: [
                path.resolve(__dirname, '../..'),
            ],
        },
        watch: {
            usePolling: true,
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@platform/ui': path.resolve(__dirname, '../../packages/ui/src'),
            '@platform/styles': path.resolve(__dirname, '../../packages/styles/src'),
            '@platform/app-registry': path.resolve(__dirname, '../../packages/app-registry/src'),
            '@platform/platform-shell': path.resolve(__dirname, '.'),
        },
        preserveSymlinks: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
        exclude: ['@platform/ui', '@platform/styles', '@platform/app-registry'],
    },
    build: {
        outDir: 'dist',
        sourcemap: mode !== 'prod',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    mui: ['@mui/material', '@emotion/react', '@emotion/styled']
                },
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'prod' ? 'production': 'development'),
    }
}));