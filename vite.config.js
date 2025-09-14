import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
    ],
    build: {
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    utils: ['axios', 'jwt-decode']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://100.1.42.5:8000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    define: {
        // Solo exponer variables específicas de VITE
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }
})
