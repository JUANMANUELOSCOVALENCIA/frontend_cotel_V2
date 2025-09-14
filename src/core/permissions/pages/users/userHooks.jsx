// src/core/permissions/pages/Users/userHooks.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import { useUsersCRUD } from '../../hooks/usePermissions';

// ========== HOOK PARA MANEJO DE FILTROS ==========

export const useUserFilters = () => {
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        rol: '',
        tipo: '',
        is_active: '',
        password_status: '',
        incluir_eliminados: '',
    });

    // Debounce para búsqueda
    const debouncedSearch = useMemo(
        () => debounce((searchValue) => {
            console.log('🔍 Ejecutando búsqueda debounced:', searchValue);
            setFilters(prev => ({ ...prev, search: searchValue }));
        }, 300),
        []
    );

    // Handler para input de búsqueda
    const handleSearchInputChange = useCallback((value) => {
        console.log('⌨️ Input cambiado:', value);
        setSearchInput(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Handler para otros filtros
    const handleFilterChange = useCallback((key, value) => {
        console.log('🔧 Filter changed:', key, '=', value);
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Limpiar búsqueda
    const clearSearch = useCallback(() => {
        setSearchInput('');
        setFilters(prev => ({ ...prev, search: '' }));
    }, []);

    // Limpiar debounce al desmontar
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return {
        filters,
        searchInput,
        handleFilterChange,
        handleSearchInputChange,
        clearSearch
    };
};

// ========== HOOK PARA ACCIONES DE USUARIOS ==========

export const useUserActions = () => {
    const {
        activateUser,
        deactivateUser,
        deleteUser,
        restoreUser,
        resetUserPassword,
        unlockUser,
        changeUserRole,
    } = useUsersCRUD();

    // Handler principal para acciones de usuario
    const handleUserAction = useCallback(async (action, user) => {
        let result;

        console.log(`🎯 Ejecutando acción: ${action} para usuario:`, user.nombre_completo);

        try {
            switch (action) {
                case 'activate':
                    result = await activateUser(user.id);
                    break;
                case 'deactivate':
                    result = await deactivateUser(user.id);
                    break;
                case 'delete':
                    result = await deleteUser(user.id);
                    break;
                case 'restore':
                    result = await restoreUser(user.id);
                    break;
                case 'resetPassword':
                    result = await resetUserPassword(user.id, {
                        motivo: 'Reseteo solicitado por administrador'
                    });
                    break;
                case 'unlock':
                    result = await unlockUser(user.id);
                    break;
                default:
                    console.warn('⚠️ Acción no reconocida:', action);
                    return;
            }

            // Mostrar resultado
            if (result.success) {
                toast.success(result.message);
                console.log('✅ Acción exitosa:', result.message);
            } else {
                toast.error(result.error);
                console.error('❌ Error en acción:', result.error);
            }

            return result;
        } catch (error) {
            console.error('❌ Error ejecutando acción:', error);
            toast.error('Error inesperado');
            return { success: false, error: 'Error inesperado' };
        }
    }, [activateUser, deactivateUser, deleteUser, restoreUser, resetUserPassword, unlockUser]);

    // Handler para cambio de rol
    const handleChangeRole = useCallback(async (userId, roleId) => {
        console.log('🔄 Cambiando rol. Usuario:', userId, 'Nuevo rol:', roleId);

        try {
            const result = await changeUserRole(userId, { rol_id: roleId });

            if (result.success) {
                toast.success(result.message);
                console.log('✅ Rol cambiado exitosamente');
            } else {
                toast.error(result.error);
                console.error('❌ Error cambiando rol:', result.error);
            }

            return result;
        } catch (error) {
            console.error('❌ Error en cambio de rol:', error);
            toast.error('Error al cambiar rol');
            return { success: false, error: 'Error inesperado' };
        }
    }, [changeUserRole]);

    return {
        handleUserAction,
        handleChangeRole
    };
};

// ========== HOOK PARA ESTADÍSTICAS DE USUARIOS ==========

export const useUserStats = (users, pagination) => {
    const stats = useMemo(() => {
        if (!users || users.length === 0) {
            return {
                total: 0,
                activos: 0,
                inactivos: 0,
                eliminados: 0,
                bloqueados: 0,
                manuales: 0,
                migrados: 0
            };
        }

        return {
            total: pagination?.count || users.length,
            activos: users.filter(u => u.is_active && !u.eliminado).length,
            inactivos: users.filter(u => !u.is_active && !u.eliminado).length,
            eliminados: users.filter(u => u.eliminado).length,
            bloqueados: users.filter(u => u.esta_bloqueado).length,
            manuales: users.filter(u => u.tipo_usuario === 'manual').length,
            migrados: users.filter(u => u.tipo_usuario === 'migrado').length,
        };
    }, [users, pagination]);

    return stats;
};

// ========== FUNCIONES AUXILIARES ==========

// Obtener color del estado del usuario
export const getUserStatusColor = (user) => {
    if (user.eliminado) return 'gray';
    if (!user.is_active) return 'red';
    if (user.esta_bloqueado) return 'orange';
    if (user.estado_password === 'reset_requerido') return 'yellow';
    if (user.estado_password === 'cambio_requerido') return 'blue';
    return 'green';
};

// Obtener texto del estado del usuario
export const getUserStatusText = (user) => {
    if (user.eliminado) return 'Eliminado';
    if (!user.is_active) return 'Inactivo';
    if (user.esta_bloqueado) return 'Bloqueado';
    if (user.estado_password === 'reset_requerido') return 'Reset Requerido';
    if (user.estado_password === 'cambio_requerido') return 'Cambio Requerido';
    return 'Activo';
};

// Obtener texto descriptivo de la acción
export const getActionText = (action) => {
    const actions = {
        'activate': 'activar',
        'deactivate': 'desactivar',
        'delete': 'eliminar',
        'restore': 'restaurar',
        'resetPassword': 'resetear la contraseña de',
        'unlock': 'desbloquear',
    };
    return actions[action] || action;
};

// Validar si un usuario puede ser editado
export const canEditUser = (user, currentUser) => {
    if (!user || !currentUser) return false;
    if (user.eliminado) return false;
    if (currentUser.is_superuser) return true;
    // Agregar más lógica de permisos según necesidades
    return true;
};

// Formatear nombre completo del usuario
export const formatUserName = (user) => {
    if (!user) return '';
    const { nombres, apellidopaterno, apellidomaterno } = user;
    return `${nombres} ${apellidopaterno} ${apellidomaterno || ''}`.trim();
};

// Obtener tipo de usuario formateado
export const getUserType = (user) => {
    if (!user) return 'Desconocido';
    return user.tipo_usuario === 'manual' ? 'Manual' : 'Migrado';
};

// ========== CONSTANTES ==========

export const USER_FILTERS = {
    ALL: '',
    ACTIVE: 'true',
    INACTIVE: 'false',
    MANUAL: 'manual',
    MIGRATED: 'migrado',
    INCLUDE_DELETED: 'true',
    ONLY_DELETED: 'only',
};

export const USER_ACTIONS = {
    ACTIVATE: 'activate',
    DEACTIVATE: 'deactivate',
    DELETE: 'delete',
    RESTORE: 'restore',
    RESET_PASSWORD: 'resetPassword',
    UNLOCK: 'unlock',
};

export const USER_STATUS_COLORS = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    BLOCKED: 'orange',
    DELETED: 'gray',
    RESET_REQUIRED: 'yellow',
    CHANGE_REQUIRED: 'blue',
};

// ========== HOOK PARA PAGINACIÓN ==========

export const useUserPagination = (pagination, currentPage, setCurrentPage) => {
    const canGoBack = pagination?.previous;
    const canGoNext = pagination?.next;
    const totalPages = pagination?.count ? Math.ceil(pagination.count / 20) : 1;

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages, setCurrentPage]);

    const nextPage = useCallback(() => {
        if (canGoNext) {
            setCurrentPage(prev => prev + 1);
        }
    }, [canGoNext, setCurrentPage]);

    const prevPage = useCallback(() => {
        if (canGoBack) {
            setCurrentPage(prev => prev - 1);
        }
    }, [canGoBack, setCurrentPage]);

    return {
        currentPage,
        totalPages,
        canGoBack,
        canGoNext,
        goToPage,
        nextPage,
        prevPage,
    };
};

export default {
    useUserFilters,
    useUserActions,
    useUserStats,
    useUserPagination,
    getUserStatusColor,
    getUserStatusText,
    getActionText,
    canEditUser,
    formatUserName,
    getUserType,
    USER_FILTERS,
    USER_ACTIONS,
    USER_STATUS_COLORS,
};
