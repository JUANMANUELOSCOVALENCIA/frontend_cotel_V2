// src/core/almacenes/services/traspasosService.js
// Traspasos entre almacenes: enviar, recibir (con faltantes) y cancelar.
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

const traspasosService = {
    resumen: () => ejecutar(() => api.get(ENDPOINTS.TRASPASOS_RESUMEN), 'Error al cargar el resumen'),
    // params: { estado: 'EN_TRANSITO' | 'RECIBIDO,CANCELADO', almacen, search, page, page_size }
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.TRASPASOS}${buildQuery(params)}`), 'Error al cargar los traspasos'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.TRASPASO_DETAIL(id)), 'Error al cargar el traspaso'),
    // params: { almacen, tipo: 'onu' | 'granel', search, page, page_size }
    disponibles: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.TRASPASOS_DISPONIBLES}${buildQuery(params)}`), 'Error al cargar lo disponible'),
    // datos: { almacen_origen, almacen_destino, motivo, numero_solicitud, observaciones, equipos: [ids], granel: [{ material_id, cantidad }] }
    enviar: (datos) => ejecutar(() => api.post(ENDPOINTS.TRASPASOS, datos), 'No se pudo enviar el traspaso'),
    // datos: { recibidos: [ids de ítems], observaciones }
    recibir: (id, datos) => ejecutar(() => api.post(ENDPOINTS.TRASPASO_RECIBIR(id), datos), 'No se pudo registrar la recepción'),
    cancelar: (id, motivo) => ejecutar(() => api.post(ENDPOINTS.TRASPASO_CANCELAR(id), { motivo }), 'No se pudo cancelar'),
};

export default traspasosService;
