import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        react(),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PlatformUI',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                }
            }
        }
    }
});


        // dts({
        //     insertTypesEntry: true,
        //     tsconfigPath: './tsconfig.json',
        // }),
        // svgr(),