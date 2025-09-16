import axios from 'axios';
import { getToken, removeToken, getRefreshToken, setToken } from '../utils/storage';

// Configuración de la URL base - SOLO desde .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Verificar que existe la variable de entorno
if (!API_BASE_URL) {
    console.error('❌ ERROR: VITE_API_URL no está definida en el archivo .env');
    console.error('Crea un archivo .env con: VITE_API_URL=http://tu-ip:8000/api');
    throw new Error('VITE_API_URL es requerida');
}

// Crear instancia de axios
export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

console.log('🌐 API configurada en:', API_BASE_URL);

// Variables para control de refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor de REQUEST - Agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Configurar Content-Type basado en el tipo de datos
        if (config.data instanceof FormData) {
            // Para FormData, dejar que el navegador configure automáticamente
            delete config.headers['Content-Type'];
        } else if (config.data && typeof config.data === 'object') {
            // Para objetos JSON
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de RESPONSE - Manejar errores y refresh token
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Error de conexión (sin response)
        if (!error.response) {
            console.error('🔌 Sin conexión al backend en:', API_BASE_URL);
            console.error('Verifica que Django esté ejecutándose y la IP sea correcta');
            return Promise.reject(error);
        }

        // Error 401 - Token expirado o inválido
        if (error.response.status === 401 && !originalRequest._retry) {

            // Si ya estamos procesando refresh, agregar a la cola
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            // Si no hay refresh token, hacer logout
            if (!refreshToken) {
                console.warn('🚪 No hay refresh token, haciendo logout');
                processQueue(error, null);
                handleLogout();
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Intentando refresh del token...');

                // Hacer refresh del token
                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;

                // Guardar nuevo token
                setToken(access);

                // Actualizar headers
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;

                console.log('✅ Token refrescado exitosamente');

                // Procesar cola de peticiones pendientes
                processQueue(null, access);

                // Reintentar petición original
                return api(originalRequest);

            } catch (refreshError) {
                console.error('❌ Error al refrescar token:', refreshError);
                processQueue(refreshError, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Otros errores HTTP
        logHttpError(error);

        return Promise.reject(error);
    }
);

// Función para loggear errores HTTP
const logHttpError = (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    switch (status) {
        case 400:
            console.warn('⚠️ Bad Request (400):', url, error.response.data);
            break;
        case 403:
            console.warn('🚫 Forbidden (403):', url);
            break;
        case 404:
            console.warn('🔍 Not Found (404):', url);
            break;
        case 423:
            console.warn('🔒 Locked (423) - Usuario bloqueado:', url);
            break;
        case 500:
        case 502:
        case 503:
            console.error('🚨 Server Error (' + status + '):', url);
            break;
        default:
            console.error('❌ HTTP Error (' + status + '):', url, error.response?.data);
    }
};

// Función para hacer logout
const handleLogout = () => {
    console.log('🚪 Haciendo logout...');
    removeToken();

    // Solo redirigir si no estamos en rutas públicas
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/migration') {
        window.location.href = '/login';
    }
};

export default api;