// Claves para localStorage
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    PERMISSIONS: 'user_permissions',
    LAST_LOGIN: 'last_login',
};

// TOKEN MANAGEMENT
export const getToken = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
        console.error('Error obteniendo token:', error);
        return null;
    }
};

export const setToken = (token) => {
    try {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
            console.log('🔑 Token guardado');
        }
    } catch (error) {
        console.error('Error guardando token:', error);
    }
};

export const getRefreshToken = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
        console.error('Error obteniendo refresh token:', error);
        return null;
    }
};

export const setRefreshToken = (token) => {
    try {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
            console.log('🔄 Refresh token guardado');
        }
    } catch (error) {
        console.error('Error guardando refresh token:', error);
    }
};

export const removeToken = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        console.log('🗑️ Tokens eliminados');
    } catch (error) {
        console.error('Error eliminando tokens:', error);
    }
};

// USER DATA MANAGEMENT
export const getUserData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error obteniendo datos de usuario:', error);
        return null;
    }
};

export const setUserData = (userData) => {
    try {
        if (userData) {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            console.log('👤 Datos de usuario guardados');
        }
    } catch (error) {
        console.error('Error guardando datos de usuario:', error);
    }
};

export const removeUserData = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
        console.error('Error eliminando datos de usuario:', error);
    }
};

// PERMISSIONS MANAGEMENT
export const getPermissions = () => {
    try {
        const permissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
        return permissions ? JSON.parse(permissions) : [];
    } catch (error) {
        console.error('Error obteniendo permisos:', error);
        return [];
    }
};

export const setPermissions = (permissions) => {
    try {
        if (permissions) {
            localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
            console.log('🛡️ Permisos guardados');
        }
    } catch (error) {
        console.error('Error guardando permisos:', error);
    }
};

export const removePermissions = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
    } catch (error) {
        console.error('Error eliminando permisos:', error);
    }
};

// SESSION MANAGEMENT
export const setLastLogin = () => {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
    } catch (error) {
        console.error('Error guardando último login:', error);
    }
};

export const getLastLogin = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    } catch (error) {
        console.error('Error obteniendo último login:', error);
        return null;
    }
};

// COMPLETE LOGOUT
export const clearAllStorage = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🧹 Todo el storage limpiado');
    } catch (error) {
        console.error('Error limpiando storage:', error);
    }
};

// TOKEN VALIDATION
export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;

    try {
        // Decodificar JWT (solo para verificar expiración, no validar firma)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        return payload.exp > currentTime;
    } catch (error) {
        console.error('Error validando token:', error);
        return false;
    }
};

// SESSION HELPERS
export const hasValidSession = () => {
    return isTokenValid() && getUserData();
};

export const getTokenExpiration = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return new Date(payload.exp * 1000);
    } catch (error) {
        console.error('Error obteniendo expiración del token:', error);
        return null;
    }
};

export default {
    getToken,
    setToken,
    getRefreshToken,
    setRefreshToken,
    removeToken,
    getUserData,
    setUserData,
    removeUserData,
    getPermissions,
    setPermissions,
    removePermissions,
    setLastLogin,
    getLastLogin,
    clearAllStorage,
    isTokenValid,
    hasValidSession,
    getTokenExpiration,
};