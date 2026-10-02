// src/core/almacenes/services/laboratorioService.js
// Laboratorio: envío de equipos, registro de inspecciones e historial.
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

const masivo = (accion, criterios = {}) => ejecutar(
    () => api.post(ENDPOINTS.LABORATORIO_MASIVO, { accion, criterios }),
    'No se pudo enviar a laboratorio'
);

const laboratorioService = {
    resumen: () => ejecutar(() => api.get(ENDPOINTS.LABORATORIO), 'Error al cargar el laboratorio'),
    // tipo: 'pendientes_inspeccion' | 'en_laboratorio'
    lista: (tipo, params = {}) => ejecutar(
        () => api.get(`${ENDPOINTS.LABORATORIO_CONSULTAS}${buildQuery({ tipo, ...params })}`),
        'Error al cargar los equipos'
    ),
    enviar: (ids) => ejecutar(() => api.post(ENDPOINTS.LABORATORIO, { materiales_ids: ids }), 'No se pudo enviar a laboratorio'),
    enviarLote: (loteId) => masivo('enviar_lote_completo', { lote_id: loteId }),
    enviarEntrega: (loteId, numero) => masivo('enviar_entrega_parcial', { lote_id: loteId, numero_entrega: numero }),
    enviarPendientes: () => masivo('enviar_pendientes'),
    // datos: { materiales_ids, <prueba>_ok..., observaciones_tecnico, numero_informe }
    registrar: (datos) => ejecutar(() => api.post(ENDPOINTS.LABORATORIO_INSPECCION, datos), 'No se pudo registrar la inspección'),
    historial: (params = {}) => ejecutar(
        () => api.get(`${ENDPOINTS.LABORATORIO_INSPECCION}${buildQuery(params)}`),
        'Error al cargar el historial'
    ),
};

export default laboratorioService;
