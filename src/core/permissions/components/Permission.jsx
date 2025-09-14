import React, { forwardRef } from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Componente para controlar la visibilidad basada en permisos
 * Compatible con Material Tailwind usando forwardRef
 */
const Permission = forwardRef(({
                                   recurso,
                                   accion = 'leer',
                                   role,
                                   permissions = [],
                                   roles = [],
                                   requireAll = false,
                                   children,
                                   fallback = null,
                                   onUnauthorized,
                               }, ref) => {
    const { hasPermission, hasRole, hasAnyPermission, isSuperuser } = usePermissions();

    // Superusuarios tienen acceso completo
    if (isSuperuser) {
        return children;
    }

    let hasAccess = false;

    // Verificar por recurso y acción individual
    if (recurso) {
        if (typeof recurso === 'object') {
            hasAccess = hasPermission(recurso.recurso, recurso.accion);
        } else {
            hasAccess = hasPermission(recurso, accion);
        }
    }

    // Verificar por rol específico
    if (role && !hasAccess) {
        hasAccess = hasRole(role);
    }

    // Verificar por array de roles
    if (roles.length > 0 && !hasAccess) {
        hasAccess = roles.some(r => hasRole(r));
    }

    // Verificar por array de permisos
    if (permissions.length > 0 && !hasAccess) {
        if (requireAll) {
            hasAccess = permissions.every(perm =>
                hasPermission(perm.recurso, perm.accion)
            );
        } else {
            hasAccess = hasAnyPermission(permissions);
        }
    }

    // Ejecutar callback si no tiene permisos
    if (!hasAccess && onUnauthorized) {
        onUnauthorized();
    }

    return hasAccess ? children : fallback;
});

// Importante: Agregar displayName para debugging
Permission.displayName = 'Permission';

/**
 * Hook para usar permisos de forma condicional
 */
export const useConditionalPermission = (recurso, accion = 'leer') => {
    const { hasPermission, isSuperuser } = usePermissions();

    return isSuperuser || hasPermission(recurso, accion);
};

/**
 * Componente HOC para proteger componentes con permisos
 */
export const withPermission = (WrappedComponent, permissionConfig) => {
    const PermissionProtectedComponent = forwardRef((props, ref) => {
        return (
            <Permission {...permissionConfig}>
                <WrappedComponent {...props} ref={ref} />
            </Permission>
        );
    });

    PermissionProtectedComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

    return PermissionProtectedComponent;
};

export default Permission;