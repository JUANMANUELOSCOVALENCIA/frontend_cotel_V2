// ========== API CONSTANTS ==========

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3,
};

// ========== AUTHENTICATION ==========

export const AUTH_CONFIG = {
    TOKEN_KEY: 'access_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_DATA_KEY: 'user_data',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas en millisegundos
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes de expirar
};

// ========== USER TYPES ==========

export const USER_TYPES = {
    MANUAL: 'manual',
    MIGRATED: 'migrado',
};

export const USER_STATUS = {
    ACTIVE: 'activo',
    INACTIVE: 'inactivo',
    BLOCKED: 'bloqueado',
    PENDING_PASSWORD: 'password_pendiente',
};

// ========== PERMISSIONS ==========

export const ACTIONS = {
    CREATE: 'crear',
    READ: 'leer',
    UPDATE: 'actualizar',
    DELETE: 'eliminar',
};

export const RESOURCES = {
    USUARIOS: 'usuarios',
    ROLES: 'roles',
    PERMISOS: 'permisos',
    LOGS: 'logs',
    EMPLEADOS: 'empleados',
};

// ========== ROLES ==========

export const SYSTEM_ROLES = {
    SUPERADMIN: 'Superadministrador',
    ADMIN: 'Administrador',
    USER: 'Usuario Básico',
    VIEWER: 'Solo Lectura',
};

// ========== PAGINATION ==========

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
};

// ========== VALIDATION ==========

export const VALIDATION = {
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: false,
    },
    COTEL: {
        MIN_VALUE: 1,
        MAX_VALUE: 999999,
        MANUAL_START: 9000,
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\'\.]+$/,
    },
};

// ========== UI CONSTANTS ==========

export const COLORS = {
    PRIMARY: 'blue',
    SECONDARY: 'gray',
    SUCCESS: 'green',
    WARNING: 'orange',
    DANGER: 'red',
    INFO: 'cyan',
};

export const SIZES = {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    EXTRA_LARGE: 'xl',
};

// ========== ERROR MESSAGES ==========

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
    VALIDATION_ERROR: 'Por favor, corrige los errores en el formulario.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    CONFLICT: 'Ya existe un registro con los mismos datos.',
    USER_BLOCKED: 'Usuario bloqueado temporalmente.',
    PASSWORD_REQUIRED: 'Debes cambiar tu contraseña para continuar.',
};

// ========== SUCCESS MESSAGES ==========

export const SUCCESS_MESSAGES = {
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada correctamente',
    PASSWORD_CHANGED: 'Contraseña actualizada exitosamente',
    USER_CREATED: 'Usuario creado correctamente',
    USER_UPDATED: 'Usuario actualizado correctamente',
    USER_DELETED: 'Usuario eliminado correctamente',
    ROLE_CREATED: 'Rol creado correctamente',
    ROLE_UPDATED: 'Rol actualizado correctamente',
    ROLE_DELETED: 'Rol eliminado correctamente',
    PERMISSION_CREATED: 'Permiso creado correctamente',
    PERMISSION_UPDATED: 'Permiso actualizado correctamente',
    PERMISSION_DELETED: 'Permiso eliminado correctamente',
    PROFILE_UPDATED: 'Perfil actualizado correctamente',
};

// ========== DATE FORMATS ==========

export const DATE_FORMATS = {
    DATE_ONLY: 'DD/MM/YYYY',
    DATETIME: 'DD/MM/YYYY HH:mm:ss',
    TIME_ONLY: 'HH:mm:ss',
    ISO_DATE: 'YYYY-MM-DD',
    ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// ========== AUDIT LOG ACTIONS ==========

export const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    RESTORE: 'RESTORE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    RESET_PASSWORD: 'RESET_PASSWORD',
    CHANGE_PASSWORD: 'CHANGE_PASSWORD',
    MIGRATE_USER: 'MIGRATE_USER',
    ACTIVATE_USER: 'ACTIVATE_USER',
    DEACTIVATE_USER: 'DEACTIVATE_USER',
    ASSIGN_ROLE: 'ASSIGN_ROLE',
    CUSTOM: 'CUSTOM',
};

// ========== TABLE CONSTANTS ==========

export const TABLE_CONFIG = {
    DEFAULT_SORT: 'desc',
    DEFAULT_SORT_FIELD: 'fecha_creacion',
    ACTIONS_COLUMN_WIDTH: '120px',
    CHECKBOX_COLUMN_WIDTH: '48px',
};

// ========== RESPONSIVE BREAKPOINTS ==========

export const BREAKPOINTS = {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
};

// ========== STORAGE KEYS ==========

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    PERMISSIONS: 'user_permissions',
    LAST_LOGIN: 'last_login',
    THEME: 'theme_preference',
    LANGUAGE: 'language_preference',
    TABLE_PREFERENCES: 'table_preferences',
};

// ========== REGEX PATTERNS ==========

export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    COTEL: /^\d{1,6}$/,
    NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\'\.]+$/,
    USERNAME: /^[a-zA-Z0-9_-]+$/,
    RESOURCE: /^[a-z0-9\-_]+$/,
};

// ========== FEATURE FLAGS ==========

export const FEATURES = {
    ENABLE_AUDIT_LOGS: true,
    ENABLE_USER_MIGRATION: true,
    ENABLE_BULK_ACTIONS: true,
    ENABLE_EXPORT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_THEMES: false,
    ENABLE_MULTI_LANGUAGE: false,
};

export default {
    API_CONFIG,
    AUTH_CONFIG,
    USER_TYPES,
    USER_STATUS,
    ACTIONS,
    RESOURCES,
    SYSTEM_ROLES,
    PAGINATION,
    VALIDATION,
    COLORS,
    SIZES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    DATE_FORMATS,
    AUDIT_ACTIONS,
    TABLE_CONFIG,
    BREAKPOINTS,
    STORAGE_KEYS,
    REGEX_PATTERNS,
    FEATURES,
};