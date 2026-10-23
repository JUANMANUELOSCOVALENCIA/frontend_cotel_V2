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
        // Con VITE_API_URL=/api el navegador llama a /api del mismo origen y Vite lo pasa a Django
        // en esta misma PC. Así un solo HTTPS (tailscale serve) sirve para el celular: la cámara y
        // el GPS del navegador solo funcionan en un origen seguro (HTTPS o localhost).
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
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
