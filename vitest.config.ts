/// <reference types="vitest" />
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/components': resolve(__dirname, './src/components'),
            '@/hooks': resolve(__dirname, './src/hooks'),
            '@/api': resolve(__dirname, './src/api'),
            '@/types': resolve(__dirname, './src/types'),
            '@/utils': resolve(__dirname, './src/utils'),
            '@/contexts': resolve(__dirname, './src/contexts'),
            '@/pages': resolve(__dirname, './src/pages'),
            '@/theme': resolve(__dirname, './src/theme'),
            '@/assets': resolve(__dirname, './src/assets'),
            '@/config': resolve(__dirname, './src/config'),
            '@/tests': resolve(__dirname, './src/tests'),
            '@/lib': resolve(__dirname, './src/lib'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/tests/',
                '**/*.d.ts',
                '**/*.config.ts',
                '**/coverage/**',
            ],
        },
    },
})