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
        port: 3400,
        fs: {
            allow: [
                path.resolve(__dirname, '../..'),
            ],
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@platform/ui': path.resolve(__dirname, '../../../../../packages/ui/src'),
            '@platform/styles': path.resolve(__dirname, '../../../../../packages/styles/src'),
        },
        preserveSymlinks: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: mode !== 'production',
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production': 'development'),
    }
}));