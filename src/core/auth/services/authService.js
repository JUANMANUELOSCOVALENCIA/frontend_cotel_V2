import api from '../../../services/api';
import ENDPOINTS from '../../../services/endpoints';
import {
    setToken,
    setRefreshToken,
    setUserData,
    setPermissions,
    setLastLogin,
    clearAllStorage,
    getUserData
} from '../../../utils/storage';

class AuthService {

    async login(credentials) {
        try {
            console.log('🔐 Intentando login para usuario:', credentials.codigocotel);

            const response = await api.post(ENDPOINTS.LOGIN, credentials);
            const data = response.data;

            console.log('✅ Respuesta del login:', data);

            // Caso 1: Necesita cambio de contraseña
            if (data.redirect_to_password_change) {
                setToken(data.access);
                setUserData(data.user_data);
                console.log('🔄 Usuario debe cambiar contraseña');
                return {
                    success: true,
                    requiresPasswordChange: true,
                    userData: data.user_data
                };
            }

            // Caso 2: Login completo exitoso
            if (data.access && data.refresh) {
                setToken(data.access);
                setRefreshToken(data.refresh);
                setUserData(data.user_data);
                setPermissions(data.user_data.permisos || []);
                setLastLogin();
                console.log('✅ Login completo exitoso');
                return {
                    success: true,
                    requiresPasswordChange: false,
                    userData: data.user_data
                };
            }

            throw new Error('Respuesta inválida del servidor');

        } catch (error) {
            console.error('❌ Error en login:', error);

            if (!error.response) {
                console.error('🔌 Sin conexión al backend');
                return {
                    success: false,
                    error: 'Error de conexión. Verifica que el backend esté ejecutándose.'
                };
            }

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Credenciales inválidas';

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async migrateUser(codigocotel) {
        try {
            console.log('🔄 Migrando usuario:', codigocotel);

            const response = await api.post(ENDPOINTS.MIGRAR_USUARIO, { codigocotel });

            console.log('✅ Usuario migrado exitosamente:', response.data);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error en migración:', error);

            if (!error.response) {
                return {
                    success: false,
                    error: 'Error de conexión con el servidor'
                };
            }

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Error en la migración';

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async changePassword(passwordData) {
        try {
            console.log('🔐 Cambiando contraseña...');

            const response = await api.post(ENDPOINTS.CHANGE_PASSWORD, passwordData);
            const data = response.data;

            if (data.access && data.refresh) {
                setToken(data.access);
                setRefreshToken(data.refresh);

                const currentUser = getUserData();
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        password_changed: true,
                        password_reset_required: false
                    };
                    setUserData(updatedUser);
                }
            }

            console.log('✅ Contraseña cambiada exitosamente');

            return {
                success: true,
                message: data.message || 'Contraseña actualizada exitosamente'
            };

        } catch (error) {
            console.error('❌ Error al cambiar contraseña:', error);

            if (!error.response) {
                return {
                    success: false,
                    error: 'Error de conexión con el servidor'
                };
            }

            const errorMessage = error.response?.data?.error ||
                'Error al cambiar la contraseña';

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async logout() {
        try {
            await api.post(ENDPOINTS.LOGOUT);
            console.log('👋 Logout notificado al backend');
        } catch (error) {
            console.warn('⚠️ No se pudo notificar logout al backend:', error);
        } finally {
            clearAllStorage();
            console.log('🧹 Storage limpiado');
            return { success: true };
        }
    }

    async getProfile() {
        try {
            const response = await api.get(ENDPOINTS.PERFIL);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error al obtener perfil:', error);
            return {
                success: false,
                error: 'Error al obtener perfil'
            };
        }
    }

    async checkAuth() {
        try {
            const userData = getUserData();
            if (!userData) {
                return { isAuthenticated: false };
            }

            // Verificar con el servidor si es necesario
            const profileResult = await this.getProfile();
            if (profileResult.success) {
                return {
                    isAuthenticated: true,
                    user: profileResult.data,
                    requiresPasswordChange: profileResult.data.password_reset_required || !profileResult.data.password_changed
                };
            }

            return { isAuthenticated: false };

        } catch (error) {
            console.error('❌ Error verificando autenticación:', error);
            return { isAuthenticated: false };
        }
    }
}

export default new AuthService();