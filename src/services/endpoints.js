// ======================================================
// src/services/endpoints.js
// ÚNICA lista de direcciones de la API. Las pantallas y servicios usan
// ENDPOINTS.X en lugar de escribir la ruta a mano.
// El servidor (http://…/api) se configura SOLO en el archivo .env (VITE_API_URL).
// Cada ruta de aquí debe existir en el backend (urls.py / routers de Django).
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
    EXPORTAR_LOGS: '/usuarios/logs/exportar/',

    // ========== MÓDULO ALMACENES ==========

    // === ALMACENES GESTIÓN ===
    ALMACENES: '/almacenes/almacenes/',
    ALMACEN_DETAIL: (id) => `/almacenes/almacenes/${id}/`,

    // === PROVEEDORES ===
    PROVEEDORES: '/almacenes/proveedores/',
    PROVEEDOR_DETAIL: (id) => `/almacenes/proveedores/${id}/`,

    // === MODELOS BÁSICOS ===
    MARCAS: '/almacenes/marcas/',
    MARCA_DETAIL: (id) => `/almacenes/marcas/${id}/`,
    MARCA_TOGGLE_ACTIVO: (id) => `/almacenes/marcas/${id}/toggle_activo/`,
    MARCA_MODELOS_ACTIVOS: (id) => `/almacenes/marcas/${id}/modelos_activos/`,

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
    LOTE_VALIDAR_CIERRE: (id) => `/almacenes/lotes/${id}/validar_cierre/`,
    LOTE_ENVIAR_LABORATORIO: (id) => `/almacenes/lotes/${id}/enviar_laboratorio_masivo/`,
    LOTES_ESTADISTICAS: '/almacenes/lotes/estadisticas/',

    LOTE_DETALLES: '/almacenes/lote-detalles/',
    LOTE_ENTREGAS_PARCIALES: (id) => `/almacenes/lotes/${id}/entregas_parciales/`,
    ENTREGA_PARCIAL_CREATE: (loteId) => `/almacenes/lotes/${loteId}/agregar_entrega_parcial/`,

    LOTE_PROXIMO_NUMERO: '/almacenes/lotes/proximo_numero/',
    LOTE_COMPLETAR_RECEPCION: (id) => `/almacenes/lotes/${id}/completar_recepcion/`,
    LOTE_ENTREGAS_DISPONIBLES: (id) => `/almacenes/lotes/${id}/entregas_parciales_disponibles/`,
    LOTE_ELIMINAR_ENTREGA: (id) => `/almacenes/lotes/${id}/eliminar/`, // ?entrega_id=

    // === MATERIALES ===
    MATERIALES: '/almacenes/materiales/',
    MATERIAL_DETAIL: (id) => `/almacenes/materiales/${id}/`,
    MATERIAL_CAMBIAR_ESTADO: (id) => `/almacenes/materiales/${id}/cambiar_estado/`,
    MATERIAL_BUSQUEDA_AVANZADA: '/almacenes/materiales/busqueda_avanzada/',
    MATERIALES_ESTADISTICAS: '/almacenes/materiales/estadisticas/',
    MATERIALES_STOCK_GRANEL: '/almacenes/materiales/stock_granel/',
    MATERIALES_DEFECTUOSOS: '/almacenes/materiales/defectuosos/',
    MATERIALES_DEVUELTOS_SECTOR: '/almacenes/materiales/devueltos_sector/',
    MATERIAL_REINGRESO: '/almacenes/materiales/reingreso/',

    // === SECTORES (devolución y reingreso) ===
    SECTORES_SOLICITANTES: '/almacenes/sectores-solicitantes/',
    SECTOR_DEVOLUCION: '/almacenes/sectores/devolucion/',
    SECTOR_REINGRESO: '/almacenes/sectores/reingreso/',

    // === IMPORTACIÓN ===
    IMPORTACION_MASIVA: '/almacenes/importacion/masiva/',

    // === LABORATORIO ===
    LABORATORIO: '/almacenes/laboratorio/',                 // GET resumen · POST enviar equipos
    LABORATORIO_MASIVO: '/almacenes/laboratorio/masivo/',   // envío por lote / entrega / todos
    LABORATORIO_CONSULTAS: '/almacenes/laboratorio/consultas/',
    LABORATORIO_INSPECCION: '/almacenes/laboratorio/inspeccion/',

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

export default ENDPOINTS;