import api from '../../../services/api';
import ENDPOINTS, { buildQuery } from '../../../services/endpoints';

class PermissionService {

    // ========== PERMISOS ==========

    async getPermissions(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.PERMISOS}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get permissions error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener permisos')
            };
        }
    }

    async createPermission(permissionData) {
        try {
            const response = await api.post(ENDPOINTS.PERMISOS, permissionData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Create permission error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al crear permiso')
            };
        }
    }

    async updatePermission(id, permissionData) {
        try {
            const response = await api.patch(ENDPOINTS.PERMISO_DETAIL(id), permissionData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update permission error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al actualizar permiso')
            };
        }
    }

    async deletePermission(id) {
        try {
            const response = await api.delete(ENDPOINTS.PERMISO_DETAIL(id));
            return {
                success: true,
                message: response.data.message || 'Permiso eliminado correctamente'
            };
        } catch (error) {
            console.error('Delete permission error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al eliminar permiso')
            };
        }
    }

    async restorePermission(id) {
        try {
            const response = await api.post(ENDPOINTS.RESTAURAR_PERMISO(id));
            return {
                success: true,
                message: response.data.message || 'Permiso restaurado correctamente'
            };
        } catch (error) {
            console.error('Restore permission error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al restaurar permiso')
            };
        }
    }

    async getAvailableResources() {
        try {
            const response = await api.get(ENDPOINTS.RECURSOS_DISPONIBLES);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get resources error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener recursos')
            };
        }
    }

    async getAvailableActions() {
        try {
            const response = await api.get(ENDPOINTS.ACCIONES_DISPONIBLES);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get actions error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener acciones')
            };
        }
    }

    // ========== ROLES ==========

    async getRoles(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.ROLES}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get roles error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener roles')
            };
        }
    }

    async getRoleById(id) {
        try {
            const response = await api.get(ENDPOINTS.ROLE_DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get role by id error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener rol')
            };
        }
    }

    async createRole(roleData) {
        try {
            const response = await api.post(ENDPOINTS.ROLES, roleData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Create role error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al crear rol')
            };
        }
    }

    async updateRole(id, roleData) {
        try {
            const response = await api.patch(ENDPOINTS.ROLE_DETAIL(id), roleData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update role error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al actualizar rol')
            };
        }
    }

    async deleteRole(id) {
        try {
            const response = await api.delete(ENDPOINTS.ROLE_DETAIL(id));
            return {
                success: true,
                message: response.data.message || 'Rol eliminado correctamente'
            };
        } catch (error) {
            console.error('Delete role error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al eliminar rol')
            };
        }
    }

    async restoreRole(id) {
        try {
            const response = await api.post(ENDPOINTS.RESTAURAR_ROL(id));
            return {
                success: true,
                message: response.data.message || 'Rol restaurado correctamente'
            };
        } catch (error) {
            console.error('Restore role error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al restaurar rol')
            };
        }
    }

    async cloneRole(id, newRoleData) {
        try {
            const response = await api.post(ENDPOINTS.CLONAR_ROL(id), newRoleData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Clone role error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al clonar rol')
            };
        }
    }

    async getRoleUsers(id) {
        try {
            const response = await api.get(ENDPOINTS.USUARIOS_ROL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get role users error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener usuarios del rol')
            };
        }
    }

    // ========== USUARIOS ==========

    async getUsers(params = {}) {
        try {
            const cleanParams = { ...params };

            // CORREGIDO: Manejo mejorado de filtros de eliminados
            if (cleanParams.eliminados_only === 'true') {
                // NUEVO: Solo usuarios eliminados
                cleanParams.with_deleted = 'true';
                cleanParams.eliminados_only = 'true';
            } else if (cleanParams.with_deleted === 'true') {
                // Incluir eliminados con activos
                cleanParams.with_deleted = 'true';
            }

            // Limpiar parámetros que no son del backend
            delete cleanParams.incluir_eliminados;

            const queryString = buildQuery(cleanParams);
            console.log('🔍 Query string enviado:', queryString);

            const response = await api.get(`${ENDPOINTS.USUARIOS}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get users error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener usuarios')
            };
        }
    }

    async getUserById(id) {
        try {
            const response = await api.get(ENDPOINTS.USUARIO_DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get user by id error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener usuario')
            };
        }
    }

    async createUser(userData) {
        try {
            const response = await api.post(ENDPOINTS.USUARIOS, userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Create user error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al crear usuario')
            };
        }
    }

    async updateUser(id, userData) {
        try {
            console.log('🔄 Actualizando usuario ID:', id);
            console.log('📤 Datos enviados:', userData);

            const response = await api.patch(ENDPOINTS.USUARIO_DETAIL(id), userData);
            console.log('✅ Respuesta exitosa:', response.data);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error al actualizar usuario:', error);
            console.error('📥 Respuesta del servidor:', error.response?.data);
            console.error('🔍 Status:', error.response?.status);
            console.error('🔍 Headers:', error.response?.headers);

            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al actualizar usuario')
            };
        }
    }

    async deleteUser(id) {
        try {
            const response = await api.delete(ENDPOINTS.USUARIO_DETAIL(id));
            return {
                success: true,
                message: response.data.message || 'Usuario eliminado correctamente'
            };
        } catch (error) {
            console.error('Delete user error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al eliminar usuario')
            };
        }
    }

    async activateUser(id) {
        try {
            const response = await api.post(ENDPOINTS.ACTIVAR_USUARIO(id));
            return {
                success: true,
                message: response.data.message || 'Usuario activado correctamente'
            };
        } catch (error) {
            console.error('Activate user error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al activar usuario')
            };
        }
    }

    async deactivateUser(id) {
        try {
            const response = await api.post(ENDPOINTS.DESACTIVAR_USUARIO(id));
            return {
                success: true,
                message: response.data.message || 'Usuario desactivado correctamente'
            };
        } catch (error) {
            console.error('Deactivate user error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al desactivar usuario')
            };
        }
    }

    async resetUserPassword(id, data = {}) {
        try {
            const response = await api.post(ENDPOINTS.RESETEAR_PASSWORD_USUARIO(id), data);
            return {
                success: true,
                message: response.data.message || 'Contraseña reseteada correctamente'
            };
        } catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al resetear contraseña')
            };
        }
    }

    async changeUserRole(id, roleData) {
        try {
            const response = await api.post(ENDPOINTS.CAMBIAR_ROL_USUARIO(id), roleData);
            return {
                success: true,
                message: response.data.message || 'Rol cambiado correctamente'
            };
        } catch (error) {
            console.error('Change role error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al cambiar rol')
            };
        }
    }

    async unlockUser(id) {
        try {
            const response = await api.post(ENDPOINTS.DESBLOQUEAR_USUARIO(id));
            return {
                success: true,
                message: response.data.message || 'Usuario desbloqueado correctamente'
            };
        } catch (error) {
            console.error('Unlock user error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al desbloquear usuario')
            };
        }
    }

    // NUEVO: Función para restaurar usuarios eliminados
    async restoreUser(id) {
        try {
            const response = await api.post(ENDPOINTS.RESTAURAR_USUARIO(id));
            return {
                success: true,
                message: response.data.message || 'Usuario restaurado correctamente'
            };
        } catch (error) {
            console.error('Restore user error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al restaurar usuario')
            };
        }
    }

    // ========== EMPLEADOS DISPONIBLES ==========

    async getAvailableEmployees(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.EMPLEADOS_DISPONIBLES}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get available employees error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener empleados disponibles')
            };
        }
    }

    async migrateEmployee(employeeData) {
        try {
            const response = await api.post(ENDPOINTS.EMPLEADOS_DISPONIBLES, employeeData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Migrate employee error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al migrar empleado')
            };
        }
    }

    async getMigrationStatistics() {
        try {
            const response = await api.get(ENDPOINTS.ESTADISTICAS_MIGRACION);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get migration statistics error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener estadísticas de migración')
            };
        }
    }

    // ========== USUARIOS ELIMINADOS ==========

    // ACTUALIZADO: Función mejorada para obtener usuarios eliminados
    async getDeletedUsers(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.USUARIOS}eliminados/${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get deleted users error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener usuarios eliminados')
            };
        }
    }

    // ========== UTILIDADES ==========

    async validateCotel(codigocotel) {
        try {
            const response = await api.post(ENDPOINTS.VALIDAR_COTEL, { codigocotel });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Validate cotel error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al validar código COTEL')
            };
        }
    }

    async generateCotel() {
        try {
            const response = await api.post(ENDPOINTS.GENERAR_COTEL);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Generate cotel error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al generar código COTEL')
            };
        }
    }

    // ========== ESTADÍSTICAS ==========

    async getStatistics() {
        try {
            const response = await api.get(ENDPOINTS.ESTADISTICAS);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get statistics error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener estadísticas')
            };
        }
    }

    // ========== LOGS DE AUDITORÍA ==========

    async getLogs(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.LOGS}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get logs error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener logs')
            };
        }
    }

    async getLogStatistics(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.ESTADISTICAS_LOGS}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get log statistics error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al obtener estadísticas de logs')
            };
        }
    }

    async exportLogs(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.EXPORTAR_LOGS}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Export logs error:', error);
            return {
                success: false,
                error: this.extractErrorMessage(error, 'Error al exportar logs')
            };
        }
    }

    // ========== HELPER METHODS ==========

    extractErrorMessage(error, defaultMessage) {
        if (error.response?.data) {
            const data = error.response.data;

            // 401/403: el backend explica el motivo en "detail" (sin permiso, cambio de contraseña, etc.)
            if (typeof data.detail === 'string') {
                return data.detail;
            }

            // Si hay errores de validación
            if (data.errors) {
                return this.formatValidationErrors(data.errors);
            }

            // Si hay un mensaje de error específico
            if (data.error) {
                return data.error;
            }

            // Si hay un mensaje general
            if (data.message) {
                return data.message;
            }

            // Si hay errores de campo
            if (typeof data === 'object') {
                const fieldErrors = this.formatFieldErrors(data);
                if (fieldErrors) return fieldErrors;
            }
        }

        return defaultMessage;
    }

    formatValidationErrors(errors) {
        if (Array.isArray(errors)) {
            return errors.join(', ');
        }

        if (typeof errors === 'object') {
            return Object.entries(errors)
                .map(([field, messages]) => {
                    const fieldName = this.translateFieldName(field);
                    const errorMessages = Array.isArray(messages) ? messages.join(', ') : messages;
                    return `${fieldName}: ${errorMessages}`;
                })
                .join('; ');
        }

        return errors;
    }

    formatFieldErrors(data) {
        const excludeFields = ['error', 'message', 'success'];
        const errorEntries = Object.entries(data)
            .filter(([key]) => !excludeFields.includes(key))
            .filter(([_, value]) => value);

        if (errorEntries.length > 0) {
            return errorEntries
                .map(([field, messages]) => {
                    const fieldName = this.translateFieldName(field);
                    const errorMessages = Array.isArray(messages) ? messages.join(', ') : messages;
                    return `${fieldName}: ${errorMessages}`;
                })
                .join('; ');
        }

        return null;
    }

    translateFieldName(field) {
        const translations = {
            'nombre': 'Nombre',
            'descripcion': 'Descripción',
            'recurso': 'Recurso',
            'accion': 'Acción',
            'nombres': 'Nombres',
            'apellidopaterno': 'Apellido Paterno',
            'apellidomaterno': 'Apellido Materno',
            'codigocotel': 'Código COTEL',
            'rol': 'Rol',
            'email': 'Email',
            'password': 'Contraseña',
            'permisos_ids': 'Permisos',
            'non_field_errors': 'Error general'
        };

        return translations[field] || field.charAt(0).toUpperCase() + field.slice(1);
    }
}

const permissionService = new PermissionService();
export default permissionService;