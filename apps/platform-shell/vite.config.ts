import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const combinedEnv: Record<string, string> = {};
    const appsDir = path.resolve(__dirname, '..');
    const featuresDir = path.resolve(appsDir, 'features');
    const normalizedMode = mode === 'development' ? 'dev' : mode === 'production' ? 'prod' : mode;  

    function loadEnvsIn(dirPath: string) {

        fs.readdirSync(dirPath).forEach(subDir => {
            const subDirPath = path.join(dirPath, subDir);

            if (fs.statSync(subDirPath).isDirectory()) {
                fs.readdirSync(subDirPath).forEach(appDir => {

                    const appDirPath = path.join(subDirPath, appDir);
                    if (fs.statSync(appDirPath).isDirectory()) {
                        const envFile = path.join(appDirPath, `.env.${mode}`);
                        if (fs.existsSync(envFile)) {

                            const env = loadEnv(mode, appDirPath, '');
                            Object.entries(env).forEach(([key, value]) => {
                                if (key.startsWith('VITE_')) {
                                    combinedEnv[key] = value;
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    loadEnvsIn(appsDir);
    if (fs.existsSync(featuresDir)) {
        loadEnvsIn(featuresDir);
    }

    return {
        plugins: [
            react(),
            svgr()
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
                '@platform/utils': path.resolve(__dirname, '../../packages/utils/src'),
                '@platform/homepage': path.resolve(__dirname, '../platform-homepage'),
                '@platform/platform-shell': path.resolve(__dirname, '.'),
                'echarts': path.resolve(__dirname, '../../packages/ui/src/configured-echarts.ts'),
                'echarts/core': path.resolve(__dirname, '../../packages/ui/src/configured-echarts.ts'),
                'echarts/charts': path.resolve(__dirname, '../../packages/ui/src/configured-echarts.ts'),
            },
            preserveSymlinks: true,
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
            exclude: ['react/jsx-runtime','@platform/ui', '@platform/styles', '@platform/app-registry', '@platform/utils', '@platform/homepage'],
            entries: ['src/**/*.tsx', '../**/src/**/*.tsx', '../../packages/**/*.tsx']
        },
        build: {
            assetsInlineLimit: 60000,
            outDir: '../../build-' + normalizedMode,
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
        define: Object.entries(combinedEnv).reduce((acc,[key, value])  => {
            acc[`import.meta.env.${key}`] = JSON.stringify(value);
            return acc;
        }, {} as Record<string, string>),
        // define: {
        //     'process.env.NODE_ENV': JSON.stringify(mode === 'prod' ? 'production': 'development'),
        // }
    }

});