// src/core/almacenes/services/garantiasService.js
// Garantías con el proveedor: envío de equipos defectuosos y registro de la respuesta.
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

const garantiasService = {
    resumen: () => ejecutar(() => api.get(ENDPOINTS.GARANTIAS_RESUMEN), 'Error al cargar el resumen'),
    porEnviar: () => ejecutar(() => api.get(ENDPOINTS.GARANTIAS_POR_ENVIAR), 'Error al cargar los equipos defectuosos'),
    // params: { cerrado: 'true'|'false', search, page, page_size }
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.GARANTIAS}${buildQuery(params)}`), 'Error al cargar los envíos'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.GARANTIA_DETAIL(id)), 'Error al cargar el envío'),
    // datos: { proveedor, materiales_ids, fecha_envio, referencia, area_tramite, observaciones }
    enviar: (datos) => ejecutar(() => api.post(ENDPOINTS.GARANTIAS, datos), 'No se pudo registrar el envío'),
    // datos: { detalle, resultado, mac_address?, gpon_serial?, serial_manufacturer?, observaciones }
    resolver: (id, datos) => ejecutar(() => api.post(ENDPOINTS.GARANTIA_RESOLVER(id), datos), 'No se pudo registrar la respuesta'),
    areas: () => ejecutar(() => api.get(`${ENDPOINTS.SECTORES_SOLICITANTES}${buildQuery({ page_size: 100 })}`)),
};

export default garantiasService;
