// src/core/almacenes/services/inventarioService.js
// Consultas de inventario: equipos con serie (ONU) y materiales a granel.
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

const inventarioService = {
    // Lista paginada: { count, results, total_pages }
    listar: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.MATERIALES}${buildQuery(params)}`), 'Error al cargar el inventario'),
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.MATERIAL_DETAIL(id)), 'Error al cargar el equipo'),
    estadisticas: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.MATERIALES_ESTADISTICAS}${buildQuery(params)}`)),
    stockGranel: (params = {}) => ejecutar(() => api.get(`${ENDPOINTS.MATERIALES_STOCK_GRANEL}${buildQuery(params)}`), 'Error al cargar el stock'),
    cambiarEstado: (id, estadoId, motivo) => ejecutar(
        () => api.post(ENDPOINTS.MATERIAL_CAMBIAR_ESTADO(id), { estado_id: estadoId, motivo }),
        'No se pudo cambiar el estado'
    ),
};

export default inventarioService;
