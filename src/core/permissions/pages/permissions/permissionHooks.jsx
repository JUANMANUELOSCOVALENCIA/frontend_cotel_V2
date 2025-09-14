// src/core/permissions/pages/Permissions/permissionHooks.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import { usePermissionsCRUD } from '../../hooks/usePermissions';

// ========== HOOK PARA MANEJO DE FILTROS ==========

export const usePermissionFilters = () => {
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        recurso: '',
        accion: '',
        activo: '',
    });

    // Debounce para búsqueda
    const debouncedSearch = useMemo(
        () => debounce((searchValue) => {
            console.log('🔍 Ejecutando búsqueda de permisos:', searchValue);
            setFilters(prev => ({ ...prev, search: searchValue }));
        }, 300),
        []
    );

    // Handler para input de búsqueda
    const handleSearch = useCallback((value) => {
        console.log('⌨️ Búsqueda de permisos cambiada:', value);
        setSearchInput(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Handler para otros filtros
    const handleFilterChange = useCallback((key, value) => {
        console.log('🔧 Filtro de permiso cambiado:', key, '=', value);
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Limpiar búsqueda
    const clearSearch = useCallback(() => {
        setSearchInput('');
        setFilters(prev => ({ ...prev, search: '' }));
    }, []);

    // Limpiar todos los filtros
    const clearAllFilters = useCallback(() => {
        setSearchInput('');
        setFilters({
            search: '',
            recurso: '',
            accion: '',
            activo: '',
        });
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
        handleSearch,
        clearSearch,
        clearAllFilters
    };
};

// ========== HOOK PARA ACCIONES DE PERMISOS ==========

export const usePermissionActions = () => {
    const { deletePermission, restorePermission } = usePermissionsCRUD();

    // Handler principal para acciones de permiso
    const handlePermissionAction = useCallback(async (action, permission) => {
        let result;

        console.log(`🎯 Ejecutando acción: ${action} para permiso:`, `${permission.recurso}:${permission.accion}`);

        try {
            switch (action) {
                case 'delete':
                    result = await deletePermission(permission.id);
                    break;
                case 'restore':
                    result = await restorePermission(permission.id);
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
    }, [deletePermission, restorePermission]);

    return {
        handlePermissionAction
    };
};

// ========== HOOK PARA AGRUPACIÓN POR RECURSOS ==========

export const useResourceGroups = (permissions = []) => {
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

    // Estadísticas por recurso
    const resourceStats = useMemo(() => {
        const stats = {};

        Object.entries(groupedPermissions).forEach(([resource, resourcePermissions]) => {
            stats[resource] = {
                total: resourcePermissions.length,
                active: resourcePermissions.filter(p => p.activo).length,
                inactive: resourcePermissions.filter(p => !p.activo).length,
                inUse: resourcePermissions.filter(p => p.esta_en_uso).length,
                notUsed: resourcePermissions.filter(p => !p.esta_en_uso).length,
                actions: [...new Set(resourcePermissions.map(p => p.accion))],
            };
        });

        return stats;
    }, [groupedPermissions]);

    // Obtener permisos por recurso
    const getPermissionsByResource = useCallback((resource) => {
        return groupedPermissions[resource] || [];
    }, [groupedPermissions]);

    // Verificar si un recurso tiene una acción específica
    const resourceHasAction = useCallback((resource, action) => {
        const resourcePermissions = getPermissionsByResource(resource);
        return resourcePermissions.some(p => p.accion === action);
    }, [getPermissionsByResource]);

    // Obtener recursos únicos
    const uniqueResources = useMemo(() => {
        return Object.keys(groupedPermissions).sort();
    }, [groupedPermissions]);

    // Obtener acciones únicas
    const uniqueActions = useMemo(() => {
        const actions = permissions.map(p => p.accion);
        return [...new Set(actions)].sort();
    }, [permissions]);

    return {
        groupedPermissions,
        resourceStats,
        getPermissionsByResource,
        resourceHasAction,
        uniqueResources,
        uniqueActions
    };
};

// ========== HOOK PARA ESTADÍSTICAS DE PERMISOS ==========

export const usePermissionStats = (permissions, pagination) => {
    const stats = useMemo(() => {
        if (!permissions || permissions.length === 0) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                inUse: 0,
                notUsed: 0,
                byAction: {},
                byResource: {},
            };
        }

        // Estadísticas por acción
        const byAction = permissions.reduce((acc, permission) => {
            acc[permission.accion] = (acc[permission.accion] || 0) + 1;
            return acc;
        }, {});

        // Estadísticas por recurso
        const byResource = permissions.reduce((acc, permission) => {
            acc[permission.recurso] = (acc[permission.recurso] || 0) + 1;
            return acc;
        }, {});

        return {
            total: pagination?.count || permissions.length,
            active: permissions.filter(p => p.activo).length,
            inactive: permissions.filter(p => !p.activo).length,
            inUse: permissions.filter(p => p.esta_en_uso).length,
            notUsed: permissions.filter(p => !p.esta_en_uso).length,
            byAction,
            byResource,
        };
    }, [permissions, pagination]);

    return stats;
};

// ========== FUNCIONES AUXILIARES ==========

// Obtener color por acción
export const getActionColor = (action) => {
    const colors = {
        'crear': 'green',
        'leer': 'blue',
        'actualizar': 'orange',
        'eliminar': 'red',
    };
    return colors[action] || 'gray';
};

// Obtener icono por acción
export const getActionIcon = (action) => {
    const icons = {
        'crear': 'IoAdd',
        'leer': 'IoEye',
        'actualizar': 'IoCreate',
        'eliminar': 'IoTrash',
    };
    return icons[action] || 'IoKey';
};

// Verificar si un permiso puede ser editado
export const canEditPermission = (permission, currentUser) => {
    if (!permission || !currentUser) return false;
    if (currentUser.is_superuser) return true;
    // Los permisos en uso tienen restricciones de edición
    return !permission.esta_en_uso;
};

// Verificar si un permiso puede ser eliminado
export const canDeletePermission = (permission, currentUser) => {
    if (!permission || !currentUser) return false;
    if (permission.esta_en_uso) return false; // No se puede eliminar si está en uso
    if (currentUser.is_superuser) return true;
    return true;
};

// Formatear descripción del permiso
export const formatPermissionDescription = (description, maxLength = 80) => {
    if (!description) return 'Sin descripción';
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
};

// Generar nombre legible del permiso
export const getPermissionDisplayName = (permission) => {
    if (!permission) return '';
    return `${permission.recurso}:${permission.accion}`;
};

// Validar datos de permiso
export const validatePermissionData = (data) => {
    const errors = [];

    if (!data.recurso || data.recurso.trim().length < 2) {
        errors.push('El recurso debe tener al menos 2 caracteres');
    }

    if (data.recurso && !/^[a-z0-9\-_]+$/.test(data.recurso)) {
        errors.push('El recurso solo puede contener letras minúsculas, números, guiones y guiones bajos');
    }

    if (!data.accion) {
        errors.push('La acción es obligatoria');
    }

    if (data.descripcion && data.descripcion.length > 500) {
        errors.push('La descripción no puede exceder 500 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Obtener resumen de uso de permiso
export const getPermissionUsageSummary = (permission) => {
    if (!permission.esta_en_uso) {
        return 'No está asignado a ningún rol';
    }

    return 'Asignado a uno o más roles activos';
};

// ========== CONSTANTES ==========

export const PERMISSION_FILTERS = {
    ALL: '',
    ACTIVE: 'true',
    INACTIVE: 'false',
};

export const PERMISSION_ACTIONS = {
    DELETE: 'delete',
    RESTORE: 'restore',
    ACTIVATE: 'activate',
    DEACTIVATE: 'deactivate',
};

export const ACTION_COLORS = {
    CREAR: 'green',
    LEER: 'blue',
    ACTUALIZAR: 'orange',
    ELIMINAR: 'red',
};

export const DEFAULT_ACTIONS = [
    'crear',
    'leer',
    'actualizar',
    'eliminar'
];

// ========== HOOK PARA VALIDACIÓN DE FORMULARIOS ==========

export const usePermissionValidation = () => {
    const [validationErrors, setValidationErrors] = useState({});

    const validateField = useCallback((field, value) => {
        let error = '';

        switch (field) {
            case 'recurso':
                if (!value || value.trim().length < 2) {
                    error = 'El recurso debe tener al menos 2 caracteres';
                } else if (!/^[a-z0-9\-_]+$/.test(value)) {
                    error = 'Solo letras minúsculas, números, guiones y guiones bajos';
                }
                break;

            case 'accion':
                if (!value) {
                    error = 'La acción es obligatoria';
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
        let isValid = true;

        // Validar todos los campos
        ['recurso', 'accion', 'descripcion'].forEach(field => {
            if (!validateField(field, data[field])) {
                isValid = false;
            }
        });

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

// ========== HOOK PARA BÚSQUEDA AVANZADA ==========

export const useAdvancedPermissionSearch = (permissions) => {
    const [searchResults, setSearchResults] = useState([]);

    const advancedSearch = useCallback((query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return [];
        }

        const results = permissions.filter(permission => {
            const searchTerm = query.toLowerCase();
            return (
                permission.recurso.toLowerCase().includes(searchTerm) ||
                permission.accion.toLowerCase().includes(searchTerm) ||
                permission.descripcion?.toLowerCase().includes(searchTerm) ||
                `${permission.recurso}:${permission.accion}`.toLowerCase().includes(searchTerm)
            );
        });

        setSearchResults(results);
        return results;
    }, [permissions]);

    const highlightSearchTerm = useCallback((text, query) => {
        if (!query.trim()) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }, []);

    return {
        searchResults,
        advancedSearch,
        highlightSearchTerm
    };
};

export default {
    usePermissionFilters,
    usePermissionActions,
    useResourceGroups,
    usePermissionStats,
    usePermissionValidation,
    useAdvancedPermissionSearch,
    getActionColor,
    getActionIcon,
    canEditPermission,
    canDeletePermission,
    formatPermissionDescription,
    getPermissionDisplayName,
    validatePermissionData,
    getPermissionUsageSummary,
    PERMISSION_FILTERS,
    PERMISSION_ACTIONS,
    ACTION_COLORS,
    DEFAULT_ACTIONS,
};