// src/core/permissions/pages/Roles/roleHooks.js
import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useRolesCRUD } from '../../hooks/usePermissions';

// ========== HOOK PARA MANEJO DE FILTROS ==========

export const useRoleFilters = () => {
    const [filters, setFilters] = useState({
        search: '',
        activo: '',
        es_sistema: '',
    });

    // Handler para cambio de filtros
    const handleFilterChange = useCallback((key, value) => {
        console.log('🔧 Role filter changed:', key, '=', value);
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Limpiar filtros
    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            activo: '',
            es_sistema: '',
        });
    }, []);

    return {
        filters,
        handleFilterChange,
        clearFilters
    };
};

// ========== HOOK PARA ACCIONES DE ROLES ==========

export const useRoleActions = () => {
    const { deleteRole } = useRolesCRUD();

    // Handler principal para acciones de rol
    const handleRoleAction = useCallback(async (action, role) => {
        let result;

        console.log(`🎯 Ejecutando acción: ${action} para rol:`, role.nombre);

        try {
            switch (action) {
                case 'delete':
                    result = await deleteRole(role.id);
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
    }, [deleteRole]);

    return {
        handleRoleAction
    };
};

// ========== HOOK PARA SELECCIÓN DE PERMISOS ==========

export const usePermissionSelection = (permissions = []) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    // Agrupar permisos por recurso
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            if (!acc[permission.recurso]) {
                acc[permission.recurso] = [];
            }
            acc[permission.recurso].push(permission);
            return acc;
        }, {});
    }, [permissions]);

    // Toggle individual de permiso
    const togglePermission = useCallback((permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    }, []);

    // Toggle de recurso completo
    const toggleResource = useCallback((resourcePermissions) => {
        const resourceIds = resourcePermissions.map(p => p.id);
        const allSelected = resourceIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Deseleccionar todos los permisos del recurso
            setSelectedPermissions(prev =>
                prev.filter(id => !resourceIds.includes(id))
            );
        } else {
            // Seleccionar todos los permisos del recurso
            setSelectedPermissions(prev => {
                const newPermissions = [...prev];
                resourceIds.forEach(id => {
                    if (!newPermissions.includes(id)) {
                        newPermissions.push(id);
                    }
                });
                return newPermissions;
            });
        }
    }, [selectedPermissions]);

    // Seleccionar todos los permisos
    const selectAll = useCallback(() => {
        setSelectedPermissions(permissions.map(p => p.id));
    }, [permissions]);

    // Deseleccionar todos los permisos
    const deselectAll = useCallback(() => {
        setSelectedPermissions([]);
    }, []);

    // Resetear selección
    const resetSelection = useCallback(() => {
        setSelectedPermissions([]);
    }, []);

    // Verificar si un recurso está completamente seleccionado
    const isResourceFullySelected = useCallback((resourcePermissions) => {
        return resourcePermissions.every(p => selectedPermissions.includes(p.id));
    }, [selectedPermissions]);

    // Verificar si un recurso está parcialmente seleccionado
    const isResourcePartiallySelected = useCallback((resourcePermissions) => {
        return resourcePermissions.some(p => selectedPermissions.includes(p.id));
    }, [selectedPermissions]);

    // Obtener estadísticas de selección
    const selectionStats = useMemo(() => {
        const totalPermissions = permissions.length;
        const selectedCount = selectedPermissions.length;
        const percentage = totalPermissions > 0 ? (selectedCount / totalPermissions) * 100 : 0;

        return {
            total: totalPermissions,
            selected: selectedCount,
            percentage: Math.round(percentage),
            allSelected: selectedCount === totalPermissions && totalPermissions > 0,
            noneSelected: selectedCount === 0,
            partiallySelected: selectedCount > 0 && selectedCount < totalPermissions
        };
    }, [permissions.length, selectedPermissions.length]);

    return {
        selectedPermissions,
        setSelectedPermissions,
        groupedPermissions,
        togglePermission,
        toggleResource,
        selectAll,
        deselectAll,
        resetSelection,
        isResourceFullySelected,
        isResourcePartiallySelected,
        selectionStats
    };
};

// ========== HOOK PARA ESTADÍSTICAS DE ROLES ==========

export const useRoleStats = (roles, pagination) => {
    const stats = useMemo(() => {
        if (!roles || roles.length === 0) {
            return {
                total: 0,
                activos: 0,
                inactivos: 0,
                sistema: 0,
                personalizados: 0,
                conUsuarios: 0,
                sinUsuarios: 0
            };
        }

        return {
            total: pagination?.count || roles.length,
            activos: roles.filter(r => r.activo).length,
            inactivos: roles.filter(r => !r.activo).length,
            sistema: roles.filter(r => r.es_sistema).length,
            personalizados: roles.filter(r => !r.es_sistema).length,
            conUsuarios: roles.filter(r => r.cantidad_usuarios > 0).length,
            sinUsuarios: roles.filter(r => r.cantidad_usuarios === 0).length,
        };
    }, [roles, pagination]);

    return stats;
};

// ========== FUNCIONES AUXILIARES ==========

// Obtener color del estado del rol
export const getRoleStatusColor = (role) => {
    if (!role.activo) return 'red';
    if (role.es_sistema) return 'blue';
    return 'green';
};

// Obtener texto del estado del rol
export const getRoleStatusText = (role) => {
    if (!role.activo) return 'Inactivo';
    if (role.es_sistema) return 'Sistema';
    return 'Activo';
};

// Verificar si un rol puede ser editado
export const canEditRole = (role, currentUser) => {
    if (!role || !currentUser) return false;
    if (role.es_sistema) return false;
    if (currentUser.is_superuser) return true;
    // Agregar más lógica de permisos según necesidades
    return true;
};

// Verificar si un rol puede ser eliminado
export const canDeleteRole = (role, currentUser) => {
    if (!role || !currentUser) return false;
    if (role.es_sistema) return false;
    if (role.cantidad_usuarios > 0) return false;
    if (currentUser.is_superuser) return true;
    // Agregar más lógica de permisos según necesidades
    return true;
};

// Formatear descripción del rol
export const formatRoleDescription = (description, maxLength = 100) => {
    if (!description) return 'Sin descripción';
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
};

// Obtener resumen de permisos por rol
export const getRolePermissionsSummary = (role) => {
    if (!role.permisos || role.permisos.length === 0) {
        return 'Sin permisos';
    }

    const resourceCount = role.permisos.reduce((acc, permission) => {
        acc[permission.recurso] = (acc[permission.recurso] || 0) + 1;
        return acc;
    }, {});

    const resources = Object.keys(resourceCount);
    if (resources.length === 1) {
        return `${resources[0]} (${resourceCount[resources[0]]} permisos)`;
    } else if (resources.length <= 3) {
        return resources.join(', ');
    } else {
        return `${resources.slice(0, 2).join(', ')} y ${resources.length - 2} más`;
    }
};

// Validar datos de rol antes del envío
export const validateRoleData = (data) => {
    const errors = [];

    if (!data.nombre || data.nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (data.nombre && data.nombre.length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (data.descripcion && data.descripcion.length > 500) {
        errors.push('La descripción no puede exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// ========== CONSTANTES ==========

export const ROLE_FILTERS = {
    ALL: '',
    ACTIVE: 'true',
    INACTIVE: 'false',
    SYSTEM: 'true',
    CUSTOM: 'false',
};

export const ROLE_ACTIONS = {
    DELETE: 'delete',
    CLONE: 'clone',
    ACTIVATE: 'activate',
    DEACTIVATE: 'deactivate',
};

export const ROLE_STATUS_COLORS = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    SYSTEM: 'blue',
};

// ========== HOOK PARA VALIDACIÓN DE FORMULARIOS ==========

export const useRoleValidation = () => {
    const [validationErrors, setValidationErrors] = useState({});

    const validateField = useCallback((field, value) => {
        let error = '';

        switch (field) {
            case 'nombre':
                if (!value || value.trim().length < 2) {
                    error = 'El nombre debe tener al menos 2 caracteres';
                } else if (value.length > 100) {
                    error = 'El nombre no puede exceder 100 caracteres';
                }
                break;

            case 'descripcion':
                if (value && value.length > 500) {
                    error = 'La descripción no puede exceder 500 caracteres';
                }
                break;

            default:
                break;
        }

        setValidationErrors(prev => ({
            ...prev,
            [field]: error
        }));

        return error === '';
    }, []);

    const validateForm = useCallback((data) => {
        const errors = {};
        let isValid = true;

        // Validar nombre
        if (!validateField('nombre', data.nombre)) {
            isValid = false;
        }

        // Validar descripción
        if (!validateField('descripcion', data.descripcion)) {
            isValid = false;
        }

        return { isValid, errors: validationErrors };
    }, [validateField, validationErrors]);

    const clearValidationErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        validationErrors,
        validateField,
        validateForm,
        clearValidationErrors
    };
};

export default {
    useRoleFilters,
    useRoleActions,
    usePermissionSelection,
    useRoleStats,
    useRoleValidation,
    getRoleStatusColor,
    getRoleStatusText,
    canEditRole,
    canDeleteRole,
    formatRoleDescription,
    getRolePermissionsSummary,
    validateRoleData,
    ROLE_FILTERS,
    ROLE_ACTIONS,
    ROLE_STATUS_COLORS,
};