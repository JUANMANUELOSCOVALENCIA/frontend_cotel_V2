import axios from 'axios';
import { getToken, removeToken, getRefreshToken, setToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    console.error('❌ ERROR: VITE_API_URL no está definida en el archivo .env');
    throw new Error('VITE_API_URL es requerida');
}

// Crear instancia con timeout más largo
export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 segundos en lugar de 15
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

// Función para retry automático en errores de conexión
const retryRequest = async (config, retryCount = 0) => {
    const maxRetries = 2; // Máximo 2 reintentos

    try {
        return await api(config);
    } catch (error) {
        // Solo reintentar en errores de conexión (sin response)
        if (!error.response && retryCount < maxRetries) {
            console.log(`🔄 Reintento ${retryCount + 1}/${maxRetries} para:`, config.url);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Esperar 1s, 2s
            return retryRequest(config, retryCount + 1);
        }
        throw error;
    }
};

// Interceptor de REQUEST
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (config.data && typeof config.data === 'object') {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de RESPONSE mejorado
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Error de conexión - intentar retry
        if (!error.response) {
            console.warn('🔌 Error de conexión al backend:', API_BASE_URL);

            // Solo hacer retry si no es un reintento previo
            if (!originalRequest._retryAttempted) {
                originalRequest._retryAttempted = true;
                try {
                    return await retryRequest(originalRequest);
                } catch (retryError) {
                    console.error('❌ Todos los reintentos fallaron');
                    return Promise.reject(retryError);
                }
            }

            return Promise.reject(error);
        }

        // Error 401 - Token expirado
        if (error.response.status === 401 && !originalRequest._retry) {
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

            if (!refreshToken) {
                console.warn('🚪 No hay refresh token, haciendo logout');
                processQueue(error, null);
                handleLogout();
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Intentando refresh del token...');

                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;

                setToken(access);
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;

                console.log('✅ Token refrescado exitosamente');

                processQueue(null, access);
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

const handleLogout = () => {
    console.log('🚪 Haciendo logout...');
    removeToken();

    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/migration') {
        window.location.href = '/login';
    }
};

export default api;