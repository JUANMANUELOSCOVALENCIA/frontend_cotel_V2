import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import { getUserData, hasValidSession, clearAllStorage } from '../../../utils/storage';
import toast from 'react-hot-toast';

// Context
const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

// Initial state
const initialState = {
    isAuthenticated: false,
    loading: true,
    user: null,
    permissions: [],
    error: null,
};

// Actions
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload, error: null };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            console.log('📊 AuthContext: LOGIN_SUCCESS con usuario:', action.payload.user);
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload.user,
                permissions: action.payload.permissions || [],
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
            console.log('📊 AuthContext: LOGIN_FAILURE:', action.payload);
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                user: null,
                permissions: [],
                error: action.payload,
            };

        case AUTH_ACTIONS.LOGOUT:
            console.log('📊 AuthContext: LOGOUT');
            return { ...initialState, loading: false };

        case AUTH_ACTIONS.UPDATE_USER:
            console.log('📊 AuthContext: UPDATE_USER:', action.payload);
            return { ...state, user: { ...state.user, ...action.payload } };

        case AUTH_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

// Provider
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Inicializar autenticación
    useEffect(() => {
        console.log('🚀 AuthContext: Inicializando...');
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        try {
            if (hasValidSession()) {
                const userData = getUserData();
                console.log('🔍 AuthContext: Datos de usuario en storage:', userData);

                if (userData) {
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            user: userData,
                            permissions: userData.permisos || [],
                        },
                    });
                    console.log('✅ AuthContext: Usuario autenticado desde storage');
                    return;
                }
            }

            console.log('❌ AuthContext: No hay sesión válida');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } catch (error) {
            console.error('❌ AuthContext: Error en inicialización:', error);
            clearAllStorage();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    // Login
    const login = async (credentials) => {
        console.log('🔐 AuthContext: Iniciando login...');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            const result = await authService.login(credentials);
            console.log('🔐 AuthContext: Resultado de login:', result);

            if (result.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        user: result.userData,
                        permissions: result.userData.permisos || [],
                    },
                });

                if (result.requiresPasswordChange) {
                    console.log('🔄 AuthContext: Usuario debe cambiar contraseña');
                    toast.success('Debes cambiar tu contraseña');
                } else {
                    console.log('✅ AuthContext: Login completo exitoso');
                    toast.success(`Bienvenido ${result.userData.nombres}`);
                }

                return { success: true, requiresPasswordChange: result.requiresPasswordChange };
            } else {
                console.log('❌ AuthContext: Login falló:', result.error);
                dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: result.error });
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = 'Error de conexión';
            console.error('❌ AuthContext: Error en login (catch):', error);
            dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            // ⭐ Asegurar que loading siempre vuelva a false
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    };

    // Logout
    const logout = async () => {
        console.log('🚪 AuthContext: Haciendo logout...');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        try {
            await authService.logout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            toast.success('Sesión cerrada correctamente');
        } catch (error) {
            console.error('❌ AuthContext: Error en logout:', error);
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    // Change Password
    const changePassword = async (passwordData) => {
        console.log('🔐 AuthContext: Cambiando contraseña...');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        try {
            const result = await authService.changePassword(passwordData);

            if (result.success) {
                // Actualizar usuario para reflejar que cambió la contraseña
                dispatch({
                    type: AUTH_ACTIONS.UPDATE_USER,
                    payload: { password_changed: true, password_reset_required: false },
                });
                toast.success(result.message);
                return { success: true };
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.error });
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = 'Error al cambiar contraseña';
            console.error('❌ AuthContext: Error cambiando contraseña:', error);
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    };

    // Helpers de permisos
    const hasPermission = (recurso, accion) => {
        if (!state.isAuthenticated || !state.user) return false;
        if (state.user.is_superuser) return true;
        return state.permissions.some(perm => perm.recurso === recurso && perm.accion === accion);
    };

    const hasRole = (roleName) => {
        if (!state.isAuthenticated || !state.user) return false;
        return state.user.rol === roleName;
    };

    const hasAnyPermission = (permissions) => {
        return permissions.some(({ recurso, accion }) => hasPermission(recurso, accion));
    };

    // Computed properties para compatibilidad
    const loading = state.loading;
    const user = state.user;
    const isAuthenticated = state.isAuthenticated;
    const requiresPasswordChange = user ? (user.password_reset_required || !user.password_changed) : false;

    // Log del estado actual para debug
    console.log('📊 AuthContext Estado actual:', {
        isAuthenticated,
        loading,
        user: user ? `${user.nombres} (${user.codigocotel})` : null,
        requiresPasswordChange,
    });

    const value = {
        // State compatibility
        loading,
        user,
        isAuthenticated,
        permissions: state.permissions,
        error: state.error,
        requiresPasswordChange,

        // Actions
        login,
        logout,
        changePassword,

        // Helpers
        hasPermission,
        hasRole,
        hasAnyPermission,

        // Clear error
        clearError: () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthContext;