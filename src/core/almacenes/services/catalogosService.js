// src/core/almacenes/services/catalogosService.js
// CRUD de los catálogos de almacenes. Todas las direcciones salen de ENDPOINTS
// (src/services/endpoints.js); el servidor sale de VITE_API_URL en el archivo .env.
import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';
import { ejecutar } from '../../../services/apiError';

const lista = (data) => (Array.isArray(data) ? data : data?.results || []);

/**
 * Crea los métodos CRUD de un catálogo.
 * - base:   ruta de la lista (ENDPOINTS.MARCAS)
 * - detail: función id -> ruta del registro (ENDPOINTS.MARCA_DETAIL)
 * - toggle: función id -> ruta de toggle_activo (si el backend la tiene; si no, se usa PATCH)
 */
const crearCrud = ({ base, detail, toggle, nombre }) => ({
    async listar(params = {}) {
        const r = await ejecutar(() => api.get(`${base}${buildQuery({ incluir_inactivos: 'true', ...params })}`), `Error al cargar ${nombre}`);
        return r.success ? { ...r, data: lista(r.data) } : r;
    },
    obtener: (id) => ejecutar(() => api.get(detail(id)), `Error al cargar ${nombre}`),
    crear: (datos) => ejecutar(() => api.post(base, datos), `No se pudo crear`),
    actualizar: (id, datos) => ejecutar(() => api.patch(detail(id), datos), `No se pudo guardar`),
    eliminar: (id) => ejecutar(() => api.delete(detail(id)), `No se pudo eliminar`),
    cambiarEstado: (item) => (toggle
        ? ejecutar(() => api.post(toggle(item.id)), 'No se pudo cambiar el estado')
        : ejecutar(() => api.patch(detail(item.id), { activo: !item.activo }), 'No se pudo cambiar el estado')),
});

export const proveedoresApi = crearCrud({ base: ENDPOINTS.PROVEEDORES, detail: ENDPOINTS.PROVEEDOR_DETAIL, nombre: 'proveedores' });
export const marcasApi = crearCrud({ base: ENDPOINTS.MARCAS, detail: ENDPOINTS.MARCA_DETAIL, toggle: ENDPOINTS.MARCA_TOGGLE_ACTIVO, nombre: 'marcas' });
export const componentesApi = crearCrud({ base: ENDPOINTS.COMPONENTES, detail: ENDPOINTS.COMPONENTE_DETAIL, toggle: ENDPOINTS.COMPONENTE_TOGGLE_ACTIVO, nombre: 'componentes' });
export const modelosApi = crearCrud({ base: ENDPOINTS.MODELOS, detail: ENDPOINTS.MODELO_DETAIL, toggle: ENDPOINTS.MODELO_TOGGLE_ACTIVO, nombre: 'modelos' });
export const almacenesApi = crearCrud({ base: ENDPOINTS.ALMACENES, detail: ENDPOINTS.ALMACEN_DETAIL, nombre: 'almacenes' });

/** Listas simples para los selects de los formularios */
export const opcionesApi = {
    tiposMaterial: () => ejecutar(() => api.get(ENDPOINTS.TIPOS_MATERIAL)).then((r) => (r.success ? { ...r, data: lista(r.data) } : r)),
    unidadesMedida: () => ejecutar(() => api.get(ENDPOINTS.UNIDADES_MEDIDA)).then((r) => (r.success ? { ...r, data: lista(r.data) } : r)),
    tiposAlmacen: () => ejecutar(() => api.get(ENDPOINTS.TIPOS_ALMACEN)).then((r) => (r.success ? { ...r, data: lista(r.data) } : r)),
};
