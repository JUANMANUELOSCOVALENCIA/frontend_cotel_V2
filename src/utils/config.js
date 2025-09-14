// Configuración centralizada de la aplicación

export const config = {
    // URL de la API
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

    // Configuración de timeouts
    apiTimeout: 15000,

    // Configuración de autenticación
    auth: {
        tokenKey: 'access_token',
        refreshTokenKey: 'refresh_token',
        userDataKey: 'user_data',
    },

    // URLs por defecto para diferentes entornos
    defaultUrls: {
        development: 'http://localhost:8000/api',
        production: 'https://tu-dominio.com/api',
    },

    // Debug mode
    debug: import.meta.env.DEV || false,
};

// Helper para obtener la URL de la API
export const getApiUrl = () => {
    if (config.debug) {
        console.log('Environment variables:', {
            VITE_API_URL: import.meta.env.VITE_API_URL,
            DEV: import.meta.env.DEV,
            MODE: import.meta.env.MODE,
        });
    }

    return config.apiUrl;
};

// Helper para logging condicional
export const debugLog = (...args) => {
    if (config.debug) {
        console.log('[DEBUG]', ...args);
    }
};

export default config;