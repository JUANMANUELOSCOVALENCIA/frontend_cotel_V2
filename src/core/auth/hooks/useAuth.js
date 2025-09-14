import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
};

export const usePermissions = () => {
    const { permissions, hasPermission, hasRole, hasAnyPermission, user } = useAuth();

    return {
        permissions,
        hasPermission,
        hasRole,
        hasAnyPermission,
        isSuperuser: user?.is_superuser || false
    };
};

export const useUser = () => {
    const { user, isAuthenticated } = useAuth();

    return {
        user,
        isAuthenticated,
        isManualUser: user?.codigocotel >= 9000 && !user?.persona,
        isMigratedUser: user?.codigocotel < 9000 || !!user?.persona,
        fullName: user ? `${user.nombres} ${user.apellidopaterno} ${user.apellidomaterno || ''}`.trim() : ''
    };
};

export const useAuthStatus = () => {
    const {
        isAuthenticated,
        isLoading,
        loading,
        requiresPasswordChange,
        error,
        clearError
    } = useAuth();

    return {
        isAuthenticated,
        isLoading: isLoading || loading,
        requiresPasswordChange,
        error,
        clearError
    };
};

export const useLogin = () => {
    const { login, isLoading, loading, error, clearError } = useAuth();

    return {
        login,
        isLoading: isLoading || loading,
        error,
        clearError
    };
};

export const useLogout = () => {
    const { logout } = useAuth();
    return { logout };
};

export const usePasswordChange = () => {
    const { changePassword, requiresPasswordChange, isLoading, loading, error } = useAuth();

    return {
        changePassword,
        requiresPasswordChange,
        isLoading: isLoading || loading,
        error
    };
};

export const useCurrentUser = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    const fullName = `${user.nombres} ${user.apellidopaterno} ${user.apellidomaterno || ''}`.trim();

    return {
        id: user.id,
        codigocotel: user.codigocotel,
        nombres: user.nombres,
        apellidopaterno: user.apellidopaterno,
        apellidomaterno: user.apellidomaterno,
        fullName: fullName,
        rol: user.rol,
        isActive: user.is_active,
        isSuperuser: user.is_superuser,
        isManual: user.codigocotel >= 9000 && !user.persona,
        requiresPasswordChange: user.password_reset_required || !user.password_changed
    };
};

export const useUserPermissions = () => {
    const { hasPermission } = usePermissions();

    return {
        canCreateUser: hasPermission('usuarios', 'crear'),
        canReadUser: hasPermission('usuarios', 'leer'),
        canUpdateUser: hasPermission('usuarios', 'actualizar'),
        canDeleteUser: hasPermission('usuarios', 'eliminar')
    };
};

export const useRolePermissions = () => {
    const { hasPermission } = usePermissions();

    return {
        canCreateRole: hasPermission('roles', 'crear'),
        canReadRole: hasPermission('roles', 'leer'),
        canUpdateRole: hasPermission('roles', 'actualizar'),
        canDeleteRole: hasPermission('roles', 'eliminar')
    };
};

export const usePermissionPermissions = () => {
    const { hasPermission } = usePermissions();

    return {
        canCreatePermission: hasPermission('permisos', 'crear'),
        canReadPermission: hasPermission('permisos', 'leer'),
        canUpdatePermission: hasPermission('permisos', 'actualizar'),
        canDeletePermission: hasPermission('permisos', 'eliminar')
    };
};

export default useAuth;
