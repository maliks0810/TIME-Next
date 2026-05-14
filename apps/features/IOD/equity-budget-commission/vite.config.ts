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
        port: 3200,
        fs: {
            allow: [
                path.resolve(__dirname, '../..'),
            ],
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@platform/ui': path.resolve(__dirname, '../../../../packages/ui/src'),
            '@platform/styles': path.resolve(__dirname, '../../../../packages/styles/src'),
        },
        preserveSymlinks: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: mode !== 'production',
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production': 'development'),
    },
    test: {
         coverage: {
            provider: 'v8', // or 'istanbul'
            reporter: ['text'], // formats: console, HTML, CI
            reportsDirectory: './coverage', // output folder
            include: ['src/**/*.{ts,tsx}'], // files to include
            exclude: ['src/**/*.d.ts', 'src/App.tsx', 'src/main.tsx', 'src/vite-env.d.ts','src/datagrids/*','src/contexts/*','src/utils/*','src/components/*','src/datatypes/*','src/tests/*.ts','src/reports/*'], // exclude non-testable files
            lines: 80, // fail if below threshold
            functions: 80,
            branches: 80,
            statements: 80
        },
        maxWorkers: 2,        
        environment: 'jsdom',
        setupFiles: ['src/setupTests.ts'],
        types: ["vitest/globals", "node"]  
    },
    optimizeDeps: {  
        include: ['devexpress-diagram'],  
    },
}));