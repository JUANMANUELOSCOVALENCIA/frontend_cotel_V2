// ======================================================
// src/services/endpoints.js - CORREGIDO SIN ERRORES
// ======================================================

// ========== HELPER FUNCTIONS ==========
export const buildUrl = (endpoint, params = {}) => {
    let url = endpoint;
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    return url;
};

export const buildQuery = (params = {}) => {
    const cleanParams = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(cleanParams).toString();
    return queryString ? `?${queryString}` : '';
};

// ========== ENDPOINTS PRINCIPALES ==========
export const ENDPOINTS = {
    // === AUTENTICACIÓN ===
    LOGIN: '/usuarios/login/',
    LOGOUT: '/usuarios/logout/',
    CHANGE_PASSWORD: '/usuarios/change-password/',
    REFRESH_TOKEN: '/token/refresh/',

    // === USUARIOS ===
    USUARIOS: '/usuarios/usuarios/',
    USUARIO_DETAIL: (id) => `/usuarios/usuarios/${id}/`,
    MIGRAR_USUARIO: '/usuarios/migrar/',
    RESET_PASSWORD: '/usuarios/reset-password/',
    PERFIL: '/usuarios/perfil/',
    ESTADISTICAS: '/usuarios/estadisticas/',
    VALIDAR_COTEL: '/usuarios/validar-cotel/',
    GENERAR_COTEL: '/usuarios/generar-cotel/',
    ACTIVAR_USUARIO: (id) => `/usuarios/usuarios/${id}/activar/`,
    DESACTIVAR_USUARIO: (id) => `/usuarios/usuarios/${id}/desactivar/`,
    RESETEAR_PASSWORD_USUARIO: (id) => `/usuarios/usuarios/${id}/resetear_password/`,
    CAMBIAR_ROL_USUARIO: (id) => `/usuarios/usuarios/${id}/cambiar_rol/`,
    DESBLOQUEAR_USUARIO: (id) => `/usuarios/usuarios/${id}/desbloquear/`,
    RESTAURAR_USUARIO: (id) => `/usuarios/usuarios/${id}/restaurar/`,

    // === ROLES ===
    ROLES: '/usuarios/roles/',
    ROLE_DETAIL: (id) => `/usuarios/roles/${id}/`,
    CLONAR_ROL: (id) => `/usuarios/roles/${id}/clonar/`,
    USUARIOS_ROL: (id) => `/usuarios/roles/${id}/usuarios/`,
    RESTAURAR_ROL: (id) => `/usuarios/roles/${id}/restaurar/`,

    // === PERMISOS ===
    PERMISOS: '/usuarios/permisos/',
    PERMISO_DETAIL: (id) => `/usuarios/permisos/${id}/`,
    RECURSOS_DISPONIBLES: '/usuarios/permisos/recursos_disponibles/',
    ACCIONES_DISPONIBLES: '/usuarios/permisos/acciones_disponibles/',
    RESTAURAR_PERMISO: (id) => `/usuarios/permisos/${id}/restaurar/`,

    // === EMPLEADOS FDW ===
    EMPLEADOS_DISPONIBLES: '/usuarios/empleados-disponibles/',
    ESTADISTICAS_MIGRACION: '/usuarios/empleados-disponibles/estadisticas/',

    // === AUDITORÍA ===
    LOGS: '/usuarios/logs/',
    ESTADISTICAS_LOGS: '/usuarios/logs/estadisticas/',

    // ========== MÓDULO ALMACENES ==========

    // === ALMACENES GESTIÓN ===
    ALMACENES: '/almacenes/almacenes/',
    ALMACEN_DETAIL: (id) => `/almacenes/almacenes/${id}/`,
    ALMACEN_MATERIALES: (id) => `/almacenes/almacenes/${id}/materiales/`,
    ALMACEN_ESTADISTICAS: (id) => `/almacenes/almacenes/${id}/estadisticas/`,
    ALMACEN_MOVIMIENTOS: (id) => `/almacenes/almacenes/${id}/movimientos/`,
    ALMACEN_PRINCIPAL: '/almacenes/almacenes/principal/',
    RESUMEN_ALMACENES: '/almacenes/almacenes/resumen_general/',

    // === PROVEEDORES ===
    PROVEEDORES: '/almacenes/proveedores/',
    PROVEEDOR_DETAIL: (id) => `/almacenes/proveedores/${id}/`,
    PROVEEDOR_LOTES: (id) => `/almacenes/proveedores/${id}/lotes/`,
    PROVEEDOR_ESTADISTICAS: (id) => `/almacenes/proveedores/${id}/estadisticas/`,
    PROVEEDORES_ACTIVOS: '/almacenes/proveedores/activos/',
    TOP_PROVEEDORES: '/almacenes/proveedores/top_proveedores/',

    // === MODELOS BÁSICOS ===
    MARCAS: '/almacenes/marcas/',
    MARCA_DETAIL: (id) => `/almacenes/marcas/${id}/`,
    MARCA_TOGGLE_ACTIVO: (id) => `/almacenes/marcas/${id}/toggle_activo/`,
    MARCA_MODELOS_ACTIVOS: (id) => `/almacenes/marcas/${id}/modelos_activos/`,

    TIPOS_EQUIPO: '/almacenes/tipos-equipo/',
    TIPO_EQUIPO_DETAIL: (id) => `/almacenes/tipos-equipo/${id}/`,
    TIPO_EQUIPO_TOGGLE_ACTIVO: (id) => `/almacenes/tipos-equipo/${id}/toggle_activo/`,

    MODELOS: '/almacenes/modelos/',
    MODELO_DETAIL: (id) => `/almacenes/modelos/${id}/`,
    MODELO_TOGGLE_ACTIVO: (id) => `/almacenes/modelos/${id}/toggle_activo/`,
    MODELO_MATERIALES_NUEVOS: (id) => `/almacenes/modelos/${id}/materiales_nuevos/`,

    COMPONENTES: '/almacenes/componentes/',
    COMPONENTE_DETAIL: (id) => `/almacenes/componentes/${id}/`,
    COMPONENTE_TOGGLE_ACTIVO: (id) => `/almacenes/componentes/${id}/toggle_activo/`,

    // === TIPOS Y CONFIGURACIONES ===
    TIPOS_MATERIAL: '/almacenes/tipos-material/',
    TIPO_MATERIAL_DETAIL: (id) => `/almacenes/tipos-material/${id}/`,
    TIPO_MATERIAL_MATERIALES: (id) => `/almacenes/tipos-material/${id}/materiales/`,
    TIPOS_MATERIAL_UNICOS: '/almacenes/tipos-material/unicos/',
    TIPOS_MATERIAL_POR_CANTIDAD: '/almacenes/tipos-material/por_cantidad/',

    UNIDADES_MEDIDA: '/almacenes/unidades-medida/',
    UNIDAD_MEDIDA_DETAIL: (id) => `/almacenes/unidades-medida/${id}/`,
    UNIDAD_MEDIDA_TOGGLE_ACTIVO: (id) => `/almacenes/unidades-medida/${id}/toggle_activo/`,

    TIPOS_ALMACEN: '/almacenes/tipos-almacen/',
    TIPO_ALMACEN_DETAIL: (id) => `/almacenes/tipos-almacen/${id}/`,
    TIPO_ALMACEN_ALMACENES: (id) => `/almacenes/tipos-almacen/${id}/almacenes/`,

    // === ESTADOS ===
    ESTADOS_LOTE: '/almacenes/estados-lote/',
    ESTADOS_LOTE_FINALES: '/almacenes/estados-lote/finales/',

    ESTADOS_MATERIAL_ONU: '/almacenes/estados-material-onu/',
    ESTADOS_ONU_PARA_ASIGNACION: '/almacenes/estados-material-onu/para_asignacion/',
    ESTADOS_ONU_PARA_TRASPASO: '/almacenes/estados-material-onu/para_traspaso/',

    ESTADOS_MATERIAL_GENERAL: '/almacenes/estados-material-general/',
    ESTADOS_GENERAL_PARA_CONSUMO: '/almacenes/estados-material-general/para_consumo/',
    ESTADOS_GENERAL_PARA_TRASPASO: '/almacenes/estados-material-general/para_traspaso/',

    TIPOS_INGRESO: '/almacenes/tipos-ingreso/',

    // === LOTES ===
    LOTES: '/almacenes/lotes/',
    LOTE_DETAIL: (id) => `/almacenes/lotes/${id}/`,
    LOTE_RESUMEN: (id) => `/almacenes/lotes/${id}/resumen/`,
    LOTE_MATERIALES: (id) => `/almacenes/lotes/${id}/materiales/`,
    LOTE_AGREGAR_ENTREGA: (id) => `/almacenes/lotes/${id}/agregar_entrega_parcial/`,
    LOTE_CERRAR: (id) => `/almacenes/lotes/${id}/cerrar_lote/`,
    LOTE_REABRIR: (id) => `/almacenes/lotes/${id}/reabrir_lote/`,
    LOTE_ENVIAR_LABORATORIO: (id) => `/almacenes/lotes/${id}/enviar_laboratorio_masivo/`,
    LOTES_ESTADISTICAS: '/almacenes/lotes/estadisticas/',

    LOTE_DETALLES: '/almacenes/lote-detalles/',
    LOTE_ENTREGAS_PARCIALES: (id) => `/almacenes/lotes/${id}/entregas_parciales/`,
    ENTREGA_PARCIAL_CREATE: (loteId) => `/almacenes/lotes/${loteId}/agregar_entrega_parcial/`,

    // === MATERIALES ===
    MATERIALES: '/almacenes/materiales/',
    MATERIAL_DETAIL: (id) => `/almacenes/materiales/${id}/`,
    MATERIAL_HISTORIAL: (id) => `/almacenes/materiales/${id}/historial/`,
    MATERIAL_CAMBIAR_ESTADO: (id) => `/almacenes/materiales/${id}/cambiar_estado/`,
    MATERIAL_ENVIAR_LABORATORIO: (id) => `/almacenes/materiales/${id}/enviar_laboratorio/`,
    MATERIAL_RETORNAR_LABORATORIO: (id) => `/almacenes/materiales/${id}/retornar_laboratorio/`,
    MATERIAL_BUSQUEDA_AVANZADA: '/almacenes/materiales/busqueda_avanzada/',
    MATERIAL_VALIDAR_UNICIDAD: '/almacenes/materiales/validar_unicidad/',
    MATERIALES_DISPONIBLES_ASIGNACION: '/almacenes/materiales/disponibles_para_asignacion/',
    MATERIAL_OPERACION_MASIVA: '/almacenes/materiales/operacion_masiva/',
    MATERIALES_ESTADISTICAS: '/almacenes/materiales/estadisticas/',

    // === IMPORTACIÓN ===
    IMPORTACION_MASIVA: '/almacenes/importacion/masiva/',

    // === LABORATORIO ===
    LABORATORIO_DASHBOARD: '/almacenes/laboratorio/',
    LABORATORIO_OPERACION_INDIVIDUAL: '/almacenes/laboratorio/',
    LABORATORIO_OPERACION_MASIVA: '/almacenes/laboratorio/masivo/',
    LABORATORIO_CONSULTAS: '/almacenes/laboratorio/consultas/',
    LABORATORIO_INSPECCION: '/almacenes/laboratorio/inspeccion/',
    LABORATORIO_INSPECCION_EXPORT: '/almacenes/laboratorio/inspeccion/export/',

    // === TRASPASOS ===
    TRASPASOS: '/almacenes/traspasos/',
    TRASPASO_DETAIL: (id) => `/almacenes/traspasos/${id}/`,
    TRASPASO_ENVIAR: (id) => `/almacenes/traspasos/${id}/enviar/`,
    TRASPASO_RECIBIR: (id) => `/almacenes/traspasos/${id}/recibir/`,
    TRASPASO_CANCELAR: (id) => `/almacenes/traspasos/${id}/cancelar/`,
    TRASPASO_MATERIALES: (id) => `/almacenes/traspasos/${id}/materiales_detalle/`,
    TRASPASOS_ESTADISTICAS: '/almacenes/traspasos/estadisticas/',

    // === REPORTES ===
    ESTADISTICAS_GENERALES: '/almacenes/estadisticas/',
    DASHBOARD_ALMACENES: '/almacenes/dashboard/',
    REPORTE_INVENTARIO: '/almacenes/reportes/inventario/',
    REPORTE_MOVIMIENTOS: '/almacenes/reportes/movimientos/',
    REPORTE_GARANTIAS: '/almacenes/reportes/garantias/',
    REPORTE_EFICIENCIA: '/almacenes/reportes/eficiencia/',

    // === OPCIONES COMPLETAS (PARA FORMULARIOS) ===
    OPCIONES_COMPLETAS: '/almacenes/opciones-completas/',
    INICIALIZAR_DATOS: '/almacenes/inicializar-datos/',
};

// ========== GRUPOS ORGANIZADOS ==========
export const ALMACENES_ENDPOINTS = {
    // Gestión básica
    ALMACENES: ENDPOINTS.ALMACENES,
    ALMACEN_DETAIL: ENDPOINTS.ALMACEN_DETAIL,
    ALMACEN_ESTADISTICAS: ENDPOINTS.ALMACEN_ESTADISTICAS,

    // Proveedores
    PROVEEDORES: ENDPOINTS.PROVEEDORES,
    PROVEEDOR_DETAIL: ENDPOINTS.PROVEEDOR_DETAIL,

    // Modelos básicos
    MARCAS: ENDPOINTS.MARCAS,
    TIPOS_EQUIPO: ENDPOINTS.TIPOS_EQUIPO,
    MODELOS: ENDPOINTS.MODELOS,
    TIPOS_MATERIAL: ENDPOINTS.TIPOS_MATERIAL,

    // Lotes y materiales
    LOTES: ENDPOINTS.LOTES,
    MATERIALES: ENDPOINTS.MATERIALES,
    IMPORTACION_MASIVA: ENDPOINTS.IMPORTACION_MASIVA,

    // Laboratorio
    LABORATORIO: ENDPOINTS.LABORATORIO,

    // Opciones
    OPCIONES_COMPLETAS: ENDPOINTS.OPCIONES_COMPLETAS
};

export default ENDPOINTS;