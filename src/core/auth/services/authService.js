// src/core/auth/services/authService.js
// Acceso: login, alta de usuario (migración), cambio de contraseña, logout y perfil.
// Nota: nunca se escriben tokens ni respuestas completas en la consola.
import api from '../../../services/api';
import ENDPOINTS from '../../../services/endpoints';
import { mensajeError, erroresDeCampos } from '../../../services/apiError';
import {
    setToken,
    setRefreshToken,
    setUserData,
    setPermissions,
    setLastLogin,
    clearAllStorage,
    getUserData
} from '../../../utils/storage';

const fallo = (error, porDefecto) => ({
    success: false,
    error: mensajeError(error, porDefecto),
    fieldErrors: erroresDeCampos(error),
});

class AuthService {

    async login(credentials) {
        try {
            const { data } = await api.post(ENDPOINTS.LOGIN, credentials);

            // Debe cambiar la contraseña: solo recibe un token temporal
            if (data.redirect_to_password_change) {
                setToken(data.access);
                setUserData(data.user_data);
                return { success: true, requiresPasswordChange: true, userData: data.user_data };
            }

            if (data.access && data.refresh) {
                setToken(data.access);
                setRefreshToken(data.refresh);
                setUserData(data.user_data);
                setPermissions(data.user_data.permisos || []);
                setLastLogin();
                return { success: true, requiresPasswordChange: false, userData: data.user_data };
            }

            return { success: false, error: 'Respuesta inesperada del servidor' };
        } catch (error) {
            return fallo(error, 'Código o contraseña incorrectos');
        }
    }

    async migrateUser(codigocotel) {
        try {
            const { data } = await api.post(ENDPOINTS.MIGRAR_USUARIO, { codigocotel });
            return { success: true, data };
        } catch (error) {
            return fallo(error, 'No se pudo activar la cuenta');
        }
    }

    async changePassword(passwordData) {
        try {
            const { data } = await api.post(ENDPOINTS.CHANGE_PASSWORD, passwordData);

            if (data.access && data.refresh) {
                setToken(data.access);
                setRefreshToken(data.refresh);
                const actual = getUserData();
                if (actual) setUserData({ ...actual, password_changed: true, password_reset_required: false });
            }
            return { success: true, message: data.message || 'Contraseña actualizada' };
        } catch (error) {
            return fallo(error, 'No se pudo cambiar la contraseña');
        }
    }

    async logout() {
        try {
            await api.post(ENDPOINTS.LOGOUT);
        } catch {
            // si el servidor no responde, igual se cierra la sesión local
        } finally {
            clearAllStorage();
        }
        return { success: true };
    }

    async getProfile() {
        try {
            const { data } = await api.get(ENDPOINTS.PERFIL);
            return { success: true, data };
        } catch (error) {
            return fallo(error, 'Error al obtener el perfil');
        }
    }

    async checkAuth() {
        try {
            if (!getUserData()) return { isAuthenticated: false };
            const perfil = await this.getProfile();
            if (perfil.success) {
                return {
                    isAuthenticated: true,
                    user: perfil.data,
                    requiresPasswordChange: perfil.data.password_reset_required || !perfil.data.password_changed
                };
            }
            return { isAuthenticated: false };
        } catch {
            return { isAuthenticated: false };
        }
    }
}

export default new AuthService();
