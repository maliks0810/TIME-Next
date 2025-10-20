import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const combinedEnv: Record<string, string> = {};
    const appsDir = path.resolve(__dirname, '..');
    const normalizedMode = mode === 'dev' ? 'development' : mode;
    fs.readdirSync(appsDir).forEach(dir => {
        if (dir !== 'platform-shell') {
            console.log(mode)
            
            const envFile = path.join(appsDir, dir, `.env.${normalizedMode}`);
            console.log(envFile)
            if (fs.existsSync(envFile)) {
                const teamName = dir.split('-')[0];
                const env = loadEnv(normalizedMode, path.join(appsDir, dir), '');
                console.log(env)

                Object.entries(env).forEach(([key, value]) => {
                    if (key.startsWith('VITE_')) {
                        combinedEnv[`VITE_${teamName.toUpperCase()}_${key.slice(5)}`] = value;
                    }
                })
            }
        }
    })

    console.log(combinedEnv)

    return {
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
                '@platform/utils': path.resolve(__dirname, '../../packages/utils/src'),
                '@platform/homepage': path.resolve(__dirname, '../platform-homepage'),
                '@r2/qre': path.resolve(__dirname, '../QRE'),
                '@platform/platform-shell': path.resolve(__dirname, '.'),
                'echarts': path.resolve(__dirname, '../../packages/ui/src/configured-echarts.ts'),
                'echarts/core': path.resolve(__dirname, '../../packages/ui/src/configured-echarts.ts'),
                'echarts/charts': path.resolve(__dirname, '../../packages/ui/src/configured-echarts.ts'),
            },
            preserveSymlinks: true,
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
            exclude: ['react/jsx-runtime','@platform/ui', '@platform/styles', '@platform/app-registry', '@platform/utils', '@platform/homepage', '@r2/qre'],
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
            console.log(acc)
            return acc;
        }, {} as Record<string, string>),
        // define: {
        //     'process.env.NODE_ENV': JSON.stringify(mode === 'prod' ? 'production': 'development'),
        // }
    }

});