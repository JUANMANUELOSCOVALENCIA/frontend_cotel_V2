// src/core/almacenes/services/lotesService.js
// Todas las operaciones de lotes. Rutas desde ENDPOINTS; servidor desde .env (VITE_API_URL).
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

const lista = (data) => (Array.isArray(data) ? data : data?.results || []);

const lotesService = {
    async listar(params = {}) {
        const r = await ejecutar(() => api.get(`${ENDPOINTS.LOTES}${buildQuery(params)}`), 'Error al cargar los lotes');
        return r.success ? { ...r, data: lista(r.data) } : r;
    },
    obtener: (id) => ejecutar(() => api.get(ENDPOINTS.LOTE_DETAIL(id)), 'Error al cargar el lote'),
    resumen: (id) => ejecutar(() => api.get(ENDPOINTS.LOTE_RESUMEN(id)), 'Error al cargar el resumen'),
    proximoNumero: () => ejecutar(() => api.get(ENDPOINTS.LOTE_PROXIMO_NUMERO)),
    crear: (datos) => ejecutar(() => api.post(ENDPOINTS.LOTES, datos), 'No se pudo crear el lote'),
    actualizar: (id, datos) => ejecutar(() => api.patch(ENDPOINTS.LOTE_DETAIL(id), datos), 'No se pudo guardar el lote'),
    eliminar: (id) => ejecutar(() => api.delete(ENDPOINTS.LOTE_DETAIL(id)), 'No se pudo eliminar el lote'),

    // Recepción
    entregas: (id) => ejecutar(() => api.get(ENDPOINTS.LOTE_ENTREGAS_DISPONIBLES(id)), 'Error al cargar las entregas'),
    agregarEntrega: (id, datos) => ejecutar(() => api.post(ENDPOINTS.LOTE_AGREGAR_ENTREGA(id), datos), 'No se pudo registrar la entrega'),
    eliminarEntrega: (id, entregaId) => ejecutar(
        () => api.delete(`${ENDPOINTS.LOTE_ELIMINAR_ENTREGA(id)}${buildQuery({ entrega_id: entregaId })}`),
        'No se pudo eliminar la entrega'
    ),
    completarGranel: (id) => ejecutar(() => api.post(ENDPOINTS.LOTE_COMPLETAR_RECEPCION(id)), 'No se pudo registrar el material'),
    enviarLaboratorio: (id) => ejecutar(() => api.post(ENDPOINTS.LOTE_ENVIAR_LABORATORIO(id)), 'No se pudo enviar a laboratorio'),

    // Importación de equipos desde Excel/CSV
    importar: ({ loteId, modeloId, itemEquipo, archivo, entrega, soloValidar }) => {
        const fd = new FormData();
        fd.append('lote_id', loteId);
        fd.append('modelo_id', modeloId);
        fd.append('item_equipo', itemEquipo);
        fd.append('archivo', archivo);
        fd.append('validacion', soloValidar ? 'true' : 'false');
        if (entrega) fd.append('entrega_seleccionada', entrega);
        return ejecutar(() => api.post(ENDPOINTS.IMPORTACION_MASIVA, fd), soloValidar ? 'No se pudo validar el archivo' : 'No se pudo importar');
    },

    // Cierre
    validarCierre: (id) => ejecutar(() => api.get(ENDPOINTS.LOTE_VALIDAR_CIERRE(id)), 'No se pudo revisar el lote'),
    cerrar: (id, datos = {}) => ejecutar(() => api.post(ENDPOINTS.LOTE_CERRAR(id), datos), 'No se pudo cerrar el lote'),
    reabrir: (id) => ejecutar(() => api.post(ENDPOINTS.LOTE_REABRIR(id)), 'No se pudo reabrir el lote'),
};

export default lotesService;
