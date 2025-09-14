import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus, usePermissions } from '../hooks/useAuth';
import Loader from '../../layout/Loader';

const ProtectedRoute = ({
                            children,
                            requiredPermissions = [],
                            allowedRoles = [],
                            requirePasswordChange = false
                        }) => {
    const location = useLocation();
    const { isAuthenticated, isLoading, requiresPasswordChange } = useAuthStatus();
    const { hasAnyPermission, hasRole, isSuperuser } = usePermissions();

    // Mostrar loader mientras se verifica la autenticación
    if (isLoading) {
        return <Loader />;
    }

    // Verificar autenticación
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar si necesita cambio de contraseña
    if (requiresPasswordChange && !requirePasswordChange) {
        return <Navigate to="/change-password" replace />;
    }

    // Si está en la página de cambio de contraseña pero ya no lo requiere
    if (!requiresPasswordChange && location.pathname === '/change-password') {
        return <Navigate to="/dashboard" replace />;
    }

    // Verificar permisos específicos
    if (requiredPermissions.length > 0) {
        const hasPermission = isSuperuser || hasAnyPermission(
            requiredPermissions.map(perm =>
                typeof perm === 'string'
                    ? { recurso: perm, accion: 'leer' }
                    : perm
            )
        );

        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Verificar roles específicos
    if (allowedRoles.length > 0) {
        const hasAllowedRole = isSuperuser || allowedRoles.some(role => hasRole(role));

        if (!hasAllowedRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;