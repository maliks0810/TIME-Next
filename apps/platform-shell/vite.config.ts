// @ts-nocheck
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvsIn(dirPath, mode, combinedEnv) {
    fs.readdirSync(dirPath).forEach((subDir) => {
        const subDirPath = path.join(dirPath, subDir);

        if (fs.statSync(subDirPath).isDirectory()) {
            const envFile = path.join(subDirPath, `.env.${mode}`);
            if (fs.existsSync(envFile)) {
                const env = loadEnv(mode, subDirPath, '');
                Object.entries(env).forEach(([key, value]) => {
                    if (key.startsWith('VITE_')) {
                        combinedEnv[key] = value;
                    }
                });
            }

            loadEnvsIn(subDirPath, mode, combinedEnv);
        }
    });
}

export default defineConfig(({ mode }) => {
    const combinedEnv = {};
    const appsDir = path.resolve(__dirname, '..');
    const featuresDir = path.resolve(appsDir, 'features');
    const normalizedMode = mode === 'development' ? 'dev' : mode === 'production' ? 'prod' : mode;

    loadEnvsIn(appsDir, mode, combinedEnv);
    if (fs.existsSync(featuresDir)) {
        loadEnvsIn(featuresDir, mode, combinedEnv);
    }

    return {
        plugins: [react(), svgr()],
        server: {
            port: 5173,
            strictPort: true,
            fs: {
                allow: [path.resolve(__dirname, '../..')],
            },
            watch: {
                usePolling: true,
            },
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
                '@r2/qre': path.resolve(__dirname, '../features/trap/QRE'),
                '@r2/arc': path.resolve(__dirname, '../features/trap/arc'),
                '@r2/core': path.resolve(__dirname, '../features/trap/core'),
                '@IOD/pfa': path.resolve(__dirname, '../features/IOD/pfa'),
                '@PE/ai-uploaders': path.resolve(__dirname, '../features/PE/ai-uploaders'),
                '@IOD/rates-waterfall-manager': path.resolve(__dirname, '../features/IOD/rates-waterfall-manager'),
                '@de/tracer': path.resolve(__dirname, '../features/DE/tracer'),
                '@de/report-catalog': path.resolve(__dirname, '../features/DE/report-catalog'),
                '@de/dqm': path.resolve(__dirname, '../features/DE/dqm'),
                '@de/report-catalog-admin': path.resolve(__dirname, '../features/DE/report-catalog-admin'),
                '@IOD/bskt-composition': path.resolve(__dirname, '../features/IOD/bskt-composition'),
                '@r2/levered-finance-news': path.resolve(__dirname, '../features/R2/levered-finance-news'),
                '@IOD/tdm': path.resolve(__dirname, '../features/IOD/tdm'),
                '@iod/equity-budget-commission': path.resolve(__dirname, '../features/IOD/equity-budget-commission'),
                // PLOP_INJECT_NEW_FEATURE_APP
            },
            preserveSymlinks: true,
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                '@mui/material',
                '@emotion/react',
                '@emotion/styled',
            ],
            exclude: [
                'react/jsx-runtime',
                '@platform/ui',
                '@platform/styles',
                '@platform/app-registry',
                '@platform/utils',
                '@platform/homepage',
            ],
            entries: ['src/**/*.tsx', '../**/src/**/*.tsx', '../../packages/**/*.tsx'],
        },
        build: {
            assetsInlineLimit: 60000,
            outDir: '../../build-' + normalizedMode,
            sourcemap: mode !== 'production',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
                        okta: ['@okta/okta-auth-js', '@okta/okta-react'],
                        apollo: ['@apollo/client'],
                        axios: ['axios'],
                        graphql: ['graphql'],
                        lodash: ['lodash'],
                    },
                },
            },
        },
        define: Object.entries(combinedEnv).reduce(
            (acc, [key, value]) => {
                acc[`import.meta.env.${key}`] = JSON.stringify(value);
                return acc;
            },
            {} as Record<string, string>
        ),
        // define: {
        //     'process.env.NODE_ENV': JSON.stringify(mode === 'prod' ? 'production': 'development'),
        // }
    };
});
