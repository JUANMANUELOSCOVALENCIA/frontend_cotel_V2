// src/core/operaciones/services/operacionesService.js
// Zonas de cobertura, solicitudes de clientes y órdenes de trabajo.
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
    resumen: () => ejecutar(() => api.get(ENDPOINTS.ORDENES_RESUMEN), 'Error al cargar el resumen'),
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.ORDENES}${buildQuery(params)}`), 'Error al cargar las órdenes'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.ORDEN_DETAIL(id)), 'Error al cargar la orden'),
    anular: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.ORDEN_ANULAR(id), { motivo }), 'No se pudo anular'),
};

export const clientesService = {
    resumen: () => ejecutar(() => api.get(ENDPOINTS.CLIENTES_OP_RESUMEN), 'Error al cargar el resumen'),
    // params: { search, situacion: 'deuda' | 'bloqueado' | 'al_dia', prueba: 'true' | 'false', page, page_size }
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
