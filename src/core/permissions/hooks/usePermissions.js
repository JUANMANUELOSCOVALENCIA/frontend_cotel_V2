import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import permissionService from '../services/permissionService';

// ========== MAIN PERMISSIONS HOOK ==========

export const usePermissions = () => {
    const auth = useAuth();

    return {
        permissions: auth.permissions || [],
        hasPermission: auth.hasPermission,
        hasRole: auth.hasRole,
        hasAnyPermission: auth.hasAnyPermission,
        isSuperuser: auth.user?.is_superuser || false,
    };
};

// ========== PERMISSIONS CRUD HOOKS ==========

export const usePermissionsCRUD = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const loadPermissions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await permissionService.getPermissions(params);

            if (result.success) {
                setPermissions(result.data.results || result.data);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar permisos');
        } finally {
            setLoading(false);
        }
    }, []);

    const createPermission = useCallback(async (permissionData) => {
        setLoading(true);
        try {
            const result = await permissionService.createPermission(permissionData);
            if (result.success) {
                await loadPermissions();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear permiso';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadPermissions]);

    const updatePermission = useCallback(async (id, permissionData) => {
        setLoading(true);
        try {
            const result = await permissionService.updatePermission(id, permissionData);
            if (result.success) {
                await loadPermissions();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar permiso';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadPermissions]);

    const deletePermission = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.deletePermission(id);
            if (result.success) {
                await loadPermissions();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar permiso';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadPermissions]);

    const restorePermission = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.restorePermission(id);
            if (result.success) {
                await loadPermissions();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al restaurar permiso';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadPermissions]);

    return {
        permissions,
        loading,
        error,
        pagination,
        loadPermissions,
        createPermission,
        updatePermission,
        deletePermission,
        restorePermission,
        clearError: () => setError(null),
    };
};

// ========== ROLES CRUD HOOKS ==========

export const useRolesCRUD = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const loadRoles = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await permissionService.getRoles(params);

            if (result.success) {
                setRoles(result.data.results || result.data);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar roles');
        } finally {
            setLoading(false);
        }
    }, []);

    const createRole = useCallback(async (roleData) => {
        setLoading(true);
        try {
            const result = await permissionService.createRole(roleData);
            if (result.success) {
                await loadRoles();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear rol';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadRoles]);

    const updateRole = useCallback(async (id, roleData) => {
        setLoading(true);
        try {
            const result = await permissionService.updateRole(id, roleData);
            if (result.success) {
                await loadRoles();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar rol';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadRoles]);

    const deleteRole = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.deleteRole(id);
            if (result.success) {
                await loadRoles();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar rol';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadRoles]);

    const cloneRole = useCallback(async (id, newRoleData) => {
        setLoading(true);
        try {
            const result = await permissionService.cloneRole(id, newRoleData);
            if (result.success) {
                await loadRoles();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al clonar rol';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadRoles]);

    return {
        roles,
        loading,
        error,
        pagination,
        loadRoles,
        createRole,
        updateRole,
        deleteRole,
        cloneRole,
        clearError: () => setError(null),
    };
};

// ========== USERS CRUD HOOKS ==========

export const useUsersCRUD = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const loadUsers = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        console.log('🔄 loadUsers: Iniciando carga con params:', params);

        try {
            const result = await permissionService.getUsers(params);

            console.log('📡 loadUsers: Respuesta del servicio:', result);

            if (result.success) {
                const usersData = result.data.results || result.data;

                console.log('👥 loadUsers: Usuarios obtenidos:', usersData.length);
                console.log('👥 loadUsers: Primer usuario completo:', usersData[0]);
                console.log('👥 loadUsers: Estructura del primer usuario:', usersData[0] ? Object.keys(usersData[0]) : 'No hay usuarios');

                // Verificar específicamente los campos de rol
                if (usersData.length > 0) {
                    const primerUsuario = usersData[0];
                    console.log('🎭 loadUsers: Análisis del rol del primer usuario:');
                    console.log('   - rol:', primerUsuario.rol, typeof primerUsuario.rol);
                    console.log('   - rol_nombre:', primerUsuario.rol_nombre);
                    console.log('   - rol_id:', primerUsuario.rol_id);

                    // Buscar otros posibles campos de rol
                    const camposRol = Object.keys(primerUsuario).filter(key =>
                        key.toLowerCase().includes('rol') || key.toLowerCase().includes('role')
                    );
                    console.log('   - Campos relacionados con rol:', camposRol);

                    // Verificar todos los usuarios
                    const usuariosConRol = usersData.filter(u => u.rol !== null && u.rol !== undefined);
                    const usuariosSinRol = usersData.filter(u => u.rol === null || u.rol === undefined);
                    console.log('📊 loadUsers: Estadísticas de roles:');
                    console.log('   - Usuarios CON rol:', usuariosConRol.length);
                    console.log('   - Usuarios SIN rol:', usuariosSinRol.length);

                    if (usuariosConRol.length > 0) {
                        console.log('   - Ejemplo de usuario CON rol:', usuariosConRol[0]);
                    }
                    if (usuariosSinRol.length > 0) {
                        console.log('   - Ejemplo de usuario SIN rol:', usuariosSinRol[0]);
                    }
                }

                setUsers(usersData);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                });
            } else {
                console.error('❌ loadUsers: Error del servicio:', result.error);
                setError(result.error);
            }
        } catch (err) {
            console.error('❌ loadUsers: Excepción capturada:', err);
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
            console.log('✅ loadUsers: Carga completada');
        }
    }, []);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const result = await permissionService.createUser(userData);
            if (result.success) {
                await loadUsers();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const updateUser = useCallback(async (id, userData) => {
        setLoading(true);
        console.log('🔄 updateUser: Actualizando usuario ID:', id);
        console.log('📤 updateUser: Datos a enviar:', userData);

        try {
            const result = await permissionService.updateUser(id, userData);

            console.log('📡 updateUser: Respuesta del servicio:', result);

            if (result.success) {
                console.log('✅ updateUser: Usuario actualizado correctamente');
                await loadUsers(); // Esto debería recargar con los datos actualizados
                return { success: true, data: result.data };
            } else {
                console.error('❌ updateUser: Error del servicio:', result.error);
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            console.error('❌ updateUser: Excepción capturada:', err);
            const error = 'Error al actualizar usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
            console.log('✅ updateUser: Operación completada');
        }
    }, [loadUsers]);

    const deleteUser = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.deleteUser(id);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const activateUser = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.activateUser(id);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al activar usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const deactivateUser = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.deactivateUser(id);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al desactivar usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const resetUserPassword = useCallback(async (id, data = {}) => {
        setLoading(true);
        try {
            const result = await permissionService.resetUserPassword(id, data);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al resetear contraseña';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const changeUserRole = useCallback(async (id, roleData) => {
        setLoading(true);
        try {
            const result = await permissionService.changeUserRole(id, roleData);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al cambiar rol';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const unlockUser = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.unlockUser(id);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al desbloquear usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    // NUEVO: Función para restaurar usuarios eliminados
    const restoreUser = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await permissionService.restoreUser(id);
            if (result.success) {
                await loadUsers();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al restaurar usuario';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    return {
        users,
        loading,
        error,
        pagination,
        loadUsers,
        createUser,
        updateUser,
        deleteUser,
        activateUser,
        deactivateUser,
        resetUserPassword,
        changeUserRole,
        unlockUser,
        restoreUser, // NUEVO: Función para restaurar
        clearError: () => setError(null),
    };
};

// ========== UTILITY HOOKS ==========

export const useResourcesAndActions = () => {
    const [resources, setResources] = useState([]);
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [resourcesResult, actionsResult] = await Promise.all([
                    permissionService.getAvailableResources(),
                    permissionService.getAvailableActions(),
                ]);

                if (resourcesResult.success) {
                    setResources(resourcesResult.data);
                }
                if (actionsResult.success) {
                    setActions(actionsResult.data);
                }
            } catch (err) {
                console.error('Error loading resources and actions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { resources, actions, loading };
};

export const useCotelValidation = () => {
    const [isValidating, setIsValidating] = useState(false);

    const validateCotel = useCallback(async (codigocotel) => {
        setIsValidating(true);
        try {
            const result = await permissionService.validateCotel(codigocotel);
            return result;
        } catch (err) {
            return { success: false, error: 'Error al validar código COTEL' };
        } finally {
            setIsValidating(false);
        }
    }, []);

    const generateCotel = useCallback(async () => {
        setIsValidating(true);
        try {
            const result = await permissionService.generateCotel();
            return result;
        } catch (err) {
            return { success: false, error: 'Error al generar código COTEL' };
        } finally {
            setIsValidating(false);
        }
    }, []);

    return { validateCotel, generateCotel, isValidating };
};

export default usePermissions;