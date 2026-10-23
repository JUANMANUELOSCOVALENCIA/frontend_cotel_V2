// src/core/operaciones/services/operacionesService.js
// Zonas de cobertura, solicitudes de clientes, órdenes de trabajo, cuadrillas y vehículos.
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

export const zonasService = {
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.ZONAS}${buildQuery(params)}`), 'Error al cargar las zonas'),
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.ZONAS, datos), 'No se pudo crear la zona'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.ZONA_DETAIL(id), datos), 'No se pudo guardar la zona'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.ZONA_DETAIL(id)), 'No se pudo eliminar la zona'),
    verificar: (lat, lng) => ejecutar(() => api.get(`${ENDPOINTS.ZONA_VERIFICAR}${buildQuery({ lat, lng })}`), 'No se pudo verificar la cobertura'),
};

export const solicitudesService = {
    resumen: () => ejecutar(() => api.get(ENDPOINTS.SOLICITUDES_RESUMEN), 'Error al cargar el resumen'),
    // params: { estado, tipo, zona, search, page, page_size }
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.SOLICITUDES}${buildQuery(params)}`), 'Error al cargar las solicitudes'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.SOLICITUD_DETAIL(id)), 'Error al cargar la solicitud'),
    // datos: { tipo, prioridad, cliente: { ci, nombres, apellidos, telefono, email }, plan, direccion, zona_referencia, referencia, latitud, longitud, observaciones }
    registrar: (datos) => ejecutar(() => api.post(ENDPOINTS.SOLICITUDES, datos), 'No se pudo registrar la solicitud'),
    editar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.SOLICITUD_DETAIL(id), datos), 'No se pudo guardar'),
    anular: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.SOLICITUD_ANULAR(id), { motivo }), 'No se pudo anular'),
    revisarCobertura: () => ejecutar(() => api.post(ENDPOINTS.SOLICITUDES_REVISAR_COBERTURA), 'No se pudo revisar la cobertura'),
    cliente: (ci) => ejecutar(() => api.get(`${ENDPOINTS.SOLICITUDES_CLIENTE}${buildQuery({ ci })}`), 'No se pudo buscar el cliente'),
};

export const ordenesService = {
    // Dashboard: OT abiertas por estado, plazo ATT y cumplimiento del mes
    indicadores: () => ejecutar(() => api.get(ENDPOINTS.ORDENES_INDICADORES), 'Error al cargar los indicadores'),
    // Foto de una evidencia de la OT (blob, para mostrarla con URL.createObjectURL)
    foto: (id, evidencia) => ejecutar(() => api.get(ENDPOINTS.ORDEN_FOTO(id, evidencia), { responseType: 'blob' }), 'No se pudo cargar la foto'),
    resumen: () => ejecutar(() => api.get(ENDPOINTS.ORDENES_RESUMEN), 'Error al cargar el resumen'),
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.ORDENES}${buildQuery(params)}`), 'Error al cargar las órdenes'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.ORDEN_DETAIL(id)), 'Error al cargar la orden'),
    anular: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.ORDEN_ANULAR(id), { motivo }), 'No se pudo anular'),
    // Programación: { fecha: 'YYYY-MM-DD', almacen } → { fecha, cuadrillas: [{ ..., carga, integrantes, ordenes }] }
    programacion: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.ORDENES_PROGRAMACION}${buildQuery(params)}`), 'Error al cargar la programación'),
    // datos: { cuadrilla, fecha, motivo } (motivo obligatorio si ya estaba programada)
    programar: (id, datos) => ejecutar(() => api.post(ENDPOINTS.ORDEN_PROGRAMAR(id), datos), 'No se pudo programar'),
    programarVarias: (datos) => ejecutar(() => api.post(ENDPOINTS.ORDENES_PROGRAMAR_VARIAS, datos), 'No se pudo programar'),
    desasignar: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.ORDEN_DESASIGNAR(id), { motivo }), 'No se pudo desasignar'),
    noEjecutada: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.ORDEN_NO_EJECUTADA(id), { motivo }), 'No se pudo registrar'),
    ordenarVisitas: (datos) => ejecutar(() => api.post(ENDPOINTS.ORDENES_ORDENAR_VISITAS, datos), 'No se pudo guardar el orden'),
};

export const vehiculosService = {
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.VEHICULOS}${buildQuery(params)}`), 'Error al cargar los vehículos'),
    // datos: { placa, descripcion, observaciones, activo, equipamiento: [{ nombre, cantidad, nota }] }
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.VEHICULOS, datos), 'No se pudo registrar el vehículo'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.VEHICULO_DETAIL(id), datos), 'No se pudo guardar el vehículo'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.VEHICULO_DETAIL(id)), 'No se pudo eliminar el vehículo'),
};

export const cuadrillasService = {
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.CUADRILLAS}${buildQuery(params)}`), 'Error al cargar las cuadrillas'),
    // datos: { nombre, almacen, vehiculo, zonas: [ids], capacidad_diaria, observaciones }
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.CUADRILLAS, datos), 'No se pudo crear la cuadrilla'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.CUADRILLA_DETAIL(id), datos), 'No se pudo guardar la cuadrilla'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.CUADRILLA_DETAIL(id)), 'No se pudo eliminar la cuadrilla'),
    almacenes: () => ejecutar(() => api.get(ENDPOINTS.CUADRILLAS_ALMACENES), 'Error al cargar los almacenes'),
    tecnicos: () => ejecutar(() => api.get(ENDPOINTS.CUADRILLAS_TECNICOS), 'Error al cargar los técnicos'),
    agregarTecnico: (id, usuario, esJefe) => ejecutar(() => api.post(ENDPOINTS.CUADRILLA_ACCION(id, 'agregar_tecnico'), { usuario, es_jefe: esJefe }), 'No se pudo agregar el técnico'),
    retirarTecnico: (id, usuario) => ejecutar(() => api.post(ENDPOINTS.CUADRILLA_ACCION(id, 'retirar_tecnico'), { usuario }), 'No se pudo retirar el técnico'),
    marcarJefe: (id, usuario) => ejecutar(() => api.post(ENDPOINTS.CUADRILLA_ACCION(id, 'marcar_jefe'), { usuario }), 'No se pudo cambiar el jefe'),
    desactivar: (id) => ejecutar(() => api.post(ENDPOINTS.CUADRILLA_ACCION(id, 'desactivar')), 'No se pudo desactivar'),
    activar: (id) => ejecutar(() => api.post(ENDPOINTS.CUADRILLA_ACCION(id, 'activar')), 'No se pudo activar'),
    // ONU y material que la cuadrilla tiene a su cargo (despachos sin rendir)
    enPoder: (id) => ejecutar(() => api.get(ENDPOINTS.CUADRILLA_ACCION(id, 'en_poder')), 'Error al cargar lo que tiene la cuadrilla'),
};

export const clientesService = {
    resumen: () => ejecutar(() => api.get(ENDPOINTS.CLIENTES_OP_RESUMEN), 'Error al cargar el resumen'),
    // params: { search, situacion: 'deuda' | 'bloqueado' | 'al_dia', page, page_size }
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.CLIENTES_OP}${buildQuery(params)}`), 'Error al cargar los clientes'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.CLIENTE_OP_DETAIL(id)), 'Error al cargar el cliente'),
    editar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.CLIENTE_OP_DETAIL(id), datos), 'No se pudo guardar'),
};

const lista = (d) => (Array.isArray(d) ? d : d?.results || []);
export const planesApi = {
    listar: async (params = {}) => {
        const r = await ejecutar(() => api.get(`${ENDPOINTS.PLANES}${buildQuery(params)}`), 'Error al cargar los planes');
        return r.success ? { ...r, data: lista(r.data) } : r;
    },
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.PLAN_DETAIL(id)), 'Error al cargar el plan'),
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.PLANES, datos), 'No se pudo crear'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.PLAN_DETAIL(id), datos), 'No se pudo guardar'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.PLAN_DETAIL(id)), 'No se pudo eliminar'),
    cambiarEstado: (item) => ejecutar(() => api.patch(ENDPOINTS.PLAN_DETAIL(item.id), { activo: !item.activo }), 'No se pudo cambiar el estado'),
};

export const adicionalesApi = {
    listar: async (params = {}) => {
        const r = await ejecutar(() => api.get(`${ENDPOINTS.ADICIONALES}${buildQuery(params)}`), 'Error al cargar los adicionales');
        return r.success ? { ...r, data: lista(r.data) } : r;
    },
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.ADICIONALES, datos), 'No se pudo crear'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.ADICIONAL_DETAIL(id), datos), 'No se pudo guardar'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.ADICIONAL_DETAIL(id)), 'No se pudo eliminar'),
    cambiarEstado: (item) => ejecutar(() => api.patch(ENDPOINTS.ADICIONAL_DETAIL(item.id), { activo: !item.activo }), 'No se pudo cambiar el estado'),
};

export const despachosService = {
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.DESPACHO_DETAIL(id)), 'Error al cargar el despacho'),
    // { almacen, ordenes: [{ ..., servicios: { tv, telefonia }, lleva_onu, onu_obligatoria }], onus_disponibles,
    //   material: [{ modelo_id, nombre, unidad, sugerido }], granel: [registros], despacho, pendiente_previo }
    requerimiento: (cuadrilla, fecha) => ejecutar(() => api.get(`${ENDPOINTS.DESPACHOS_REQUERIMIENTO}${buildQuery({ cuadrilla, fecha })}`), 'Error al cargar lo que necesita el día'),
    // ONU escaneada (GPON SN, MAC o código interno) disponible en el almacén de la cuadrilla
    buscar: (cuadrilla, serie) => ejecutar(() => api.get(`${ENDPOINTS.DESPACHOS_BUSCAR}${buildQuery({ cuadrilla, serie })}`), 'No se encontró la ONU'),
    // Buscador de ONU disponibles en el almacén de la cuadrilla (FIFO, paginado): { cuadrilla, search, modelo, tv, telefonia, page, page_size }
    disponibles: (params) => ejecutar(() => api.get(`${ENDPOINTS.DESPACHOS_DISPONIBLES}${buildQuery(params)}`), 'Error al buscar ONU'),
    // ONU (FIFO, modelo más sencillo compatible) que cubren las instalaciones del día que faltan: { onus, sin_stock }
    sugerir: (cuadrilla, fecha, ya) => ejecutar(() => api.get(`${ENDPOINTS.DESPACHOS_SUGERIR}${buildQuery({ cuadrilla, fecha, ya: ya.join(',') })}`), 'No se pudo sugerir'),
    // datos: { cuadrilla, fecha, onus: [ids], materiales: [{ material, cantidad }], observaciones }
    despachar: (datos) => ejecutar(() => api.post(ENDPOINTS.DESPACHOS, datos), 'No se pudo registrar el despacho'),
    // datos: { equipos: [{ id, resultado, orden }], materiales: [{ id, devuelta, consumos: [{ orden, cantidad }] }],
    //          recuperados: [{ orden, serial, observacion }], observaciones }
    rendir: (id, datos) => ejecutar(() => api.post(ENDPOINTS.DESPACHO_RENDIR(id), datos), 'No se pudo registrar la rendición'),
    anular: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.DESPACHO_ANULAR(id), { motivo }), 'No se pudo anular el despacho'),
};

export const kitsService = {
    listar: () => ejecutar(() => api.get(ENDPOINTS.KITS), 'Error al cargar los kits'),
    materiales: () => ejecutar(() => api.get(ENDPOINTS.KITS_MATERIALES), 'Error al cargar los materiales'),
    // datos: { tipo, condicion, modelo, cantidad }
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.KITS, datos), 'No se pudo agregar'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.KIT_DETAIL(id), datos), 'No se pudo guardar'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.KIT_DETAIL(id)), 'No se pudo quitar'),
};

// App de campo: el técnico trabaja sobre las OT de su cuadrilla
export const campoService = {
    // { fecha, radio_m, cuadrilla, previas: [OT], ordenes: [OT], onus: [ONU a cargo], materiales, motivos }
    misTrabajos: (fecha) => ejecutar(() => api.get(`${ENDPOINTS.CAMPO_MIS_TRABAJOS}${buildQuery({ fecha })}`), 'Error al cargar tus trabajos'),
    iniciar: (id, gps) => ejecutar(() => api.post(ENDPOINTS.CAMPO_ACCION(id, 'iniciar'), gps), 'No se pudo marcar la llegada'),
    // FormData: imagen, lat, lng, precision, tipo (ONU | ADICIONAL)
    evidencia: (id, formData) => ejecutar(() => api.post(ENDPOINTS.CAMPO_ACCION(id, 'evidencia'), formData), 'No se pudo subir la foto'),
    // { onu, materiales: [{ id, cantidad }], serial_recuperado, observaciones, lat, lng }
    ejecutar: (id, datos) => ejecutar(() => api.post(ENDPOINTS.CAMPO_ACCION(id, 'ejecutar'), datos), 'No se pudo registrar el trabajo'),
    noSePudo: (id, datos) => ejecutar(() => api.post(ENDPOINTS.CAMPO_ACCION(id, 'no-se-pudo'), datos), 'No se pudo registrar'),
    foto: (evidencia) => ejecutar(() => api.get(ENDPOINTS.CAMPO_FOTO(evidencia), { responseType: 'blob' }), 'No se pudo cargar la foto'),
};

// Modelo EOQ y punto de reorden con el consumo real
export const inventarioService = {
    eoq: () => ejecutar(() => api.get(ENDPOINTS.INVENTARIO_EOQ), 'Error al calcular el EOQ'),
    // datos: { modelo (vacío = por defecto), S, H, L, D_estimada }
    parametros: (datos) => ejecutar(() => api.post(ENDPOINTS.INVENTARIO_PARAMETROS, datos), 'No se pudieron guardar los parámetros'),
};
