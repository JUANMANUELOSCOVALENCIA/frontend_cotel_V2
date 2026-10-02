import { api } from '../../../services/api';
import { ENDPOINTS, buildQuery } from '../../../services/endpoints';

class AlmacenesService {
    // ========== OPCIONES COMPLETAS ==========
    async getOpcionesCompletas() {
        try {
            const response = await api.get(ENDPOINTS.OPCIONES_COMPLETAS);
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error al obtener opciones completas:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener opciones'
            };
        }
    }

    // ========== COMPONENTES ==========
    async getComponentes(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.COMPONENTES}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener componentes'
            };
        }
    }

    async createComponente(componenteData) {
        try {
            const response = await api.post(ENDPOINTS.COMPONENTES, componenteData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: this._componenteError(error, 'Error al crear componente')
            };
        }
    }

    // Extrae el mensaje de error de DRF ({error}, {nombre: [..]}, etc.)
    _componenteError(error, fallback) {
        const data = error.response?.data;
        if (!data) return fallback;
        if (typeof data === 'string') return data;
        if (data.error) return data.error;
        if (data.message) return data.message;
        const first = Object.values(data)[0];
        return Array.isArray(first) ? first[0] : fallback;
    }

    // ========== LOTES ==========
    async getLotes(params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.LOTES}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener lotes'
            };
        }
    }

    async getLote(id) {
        try {
            const response = await api.get(ENDPOINTS.LOTE_DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener lote'
            };
        }
    }

    async getProximoNumeroLote() {
        try {
            console.log('🔍 SERVICE - Solicitando próximo número de lote...');
            console.log('🌐 SERVICE - URL:', ENDPOINTS.LOTE_PROXIMO_NUMERO);

            const response = await api.get(ENDPOINTS.LOTE_PROXIMO_NUMERO);

            console.log('✅ SERVICE - Respuesta exitosa:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ SERVICE - Error obteniendo próximo número:', error);
            console.error('❌ SERVICE - Error response:', error.response?.data);
            console.error('❌ SERVICE - Error status:', error.response?.status);

            return {
                success: false,
                error: error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Error al obtener próximo número'
            };
        }
    }

    async createLote(loteData) {
        try {
            console.log('🌐 SERVICE: Enviando al backend:', JSON.stringify(loteData, null, 2));

            const response = await api.post(ENDPOINTS.LOTES, loteData);

            console.log('✅ SERVICE: Respuesta exitosa:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ SERVICE: Error completo:', error);
            console.error('❌ SERVICE: Error response:', error.response?.data);
            console.error('❌ SERVICE: Error status:', error.response?.status);

            return {
                success: false,
                error: error.response?.data?.message ||
                    error.response?.data?.non_field_errors?.[0] ||
                    JSON.stringify(error.response?.data) ||
                    'Error al crear lote'
            };
        }
    }

    // En almacenesService.js - REEMPLAZA updateLote completamente:
    async updateLote(id, loteData) {
        try {
            console.log('🚨 SERVICE UPDATE - ID:', id);
            console.log('🚨 SERVICE UPDATE - Datos recibidos:', JSON.stringify(loteData, null, 2));

            // ✅ LIMPIAR DATOS: Remover cualquier campo problemático
            const cleanData = { ...loteData };

            // Remover campos que no deberían estar en la actualización
            delete cleanData.detalles;
            delete cleanData.id;
            delete cleanData.created_at;
            delete cleanData.updated_at;
            delete cleanData.estado;
            delete cleanData.cantidad_total;
            delete cleanData.cantidad_recibida;
            delete cleanData.porcentaje_recibido;

            // Asegurar que los IDs sean enteros
            if (cleanData.tipo_ingreso) cleanData.tipo_ingreso = parseInt(cleanData.tipo_ingreso);
            if (cleanData.tipo_servicio) cleanData.tipo_servicio = parseInt(cleanData.tipo_servicio);
            if (cleanData.proveedor) cleanData.proveedor = parseInt(cleanData.proveedor);
            if (cleanData.almacen_destino) cleanData.almacen_destino = parseInt(cleanData.almacen_destino);

            console.log('🚨 SERVICE UPDATE - Datos LIMPIADOS:', JSON.stringify(cleanData, null, 2));

            const response = await api.put(ENDPOINTS.LOTE_DETAIL(id), cleanData);

            console.log('✅ SERVICE UPDATE - Respuesta exitosa:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ SERVICE UPDATE - Error completo:', error);
            console.error('❌ SERVICE UPDATE - Error response:', error.response?.data);
            console.error('❌ SERVICE UPDATE - Error status:', error.response?.status);

            // ✅ MEJOR manejo del error para mostrar el mensaje real del backend
            let errorMessage = 'Error al actualizar lote';

            if (error.response?.data) {
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.non_field_errors?.[0]) {
                    errorMessage = error.response.data.non_field_errors[0];
                } else if (typeof error.response.data === 'object') {
                    // Si es un objeto con errores de campo
                    const fieldErrors = Object.entries(error.response.data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('; ');
                    errorMessage = fieldErrors || JSON.stringify(error.response.data);
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async deleteLote(id) {
        try {
            console.log('🌐 SERVICE DELETE - Eliminando lote ID:', id);
            console.log('🌐 SERVICE DELETE - URL:', ENDPOINTS.LOTE_DETAIL(id));

            const response = await api.delete(ENDPOINTS.LOTE_DETAIL(id));

            console.log('✅ SERVICE DELETE - Respuesta exitosa:', response);
            return {
                success: true,
                message: 'Lote eliminado correctamente'
            };
        } catch (error) {
            console.error('❌ SERVICE DELETE - Error completo:', error);
            console.error('❌ SERVICE DELETE - Response:', error.response?.data);
            console.error('❌ SERVICE DELETE - Status:', error.response?.status);

            return {
                success: false,
                error: error.response?.data?.message ||
                    error.response?.data?.detail ||
                    JSON.stringify(error.response?.data) ||
                    'Error al eliminar lote'
            };
        }
    }

    async getLoteResumen(id) {
        try {
            const response = await api.get(ENDPOINTS.LOTE_RESUMEN(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener resumen del lote'
            };
        }
    }

    async getLoteMateriales(id, params = {}) {
        try {
            const queryString = buildQuery(params);
            const response = await api.get(`${ENDPOINTS.LOTE_MATERIALES(id)}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener materiales del lote'
            };
        }
    }

    async validarCierreLote(id) {
        try {
            const response = await api.get(ENDPOINTS.LOTE_VALIDAR_CIERRE(id));
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al revisar el lote'
            };
        }
    }

    // data: { forzar: true, motivo: '...' } cuando hay faltantes
    async cerrarLote(id, data = {}) {
        try {
            const response = await api.post(ENDPOINTS.LOTE_CERRAR(id), data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                status: error.response?.status,
                data: error.response?.data,
                error: error.response?.data?.error || error.response?.data?.message || 'Error al cerrar lote'
            };
        }
    }

    async reabrirLote(id) {
        try {
            const response = await api.post(ENDPOINTS.LOTE_REABRIR(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.response?.data?.message || 'Error al reabrir lote'
            };
        }
    }

    // ========== IMPORTACIÓN MASIVA (ACTUALIZADO) ==========
    async importarMaterialesMasivo(archivo, loteId, modeloId, itemEquipo, esValidacion = false) {
        try {
            console.log('🔍 SERVICE DEBUG - Parámetros recibidos:', {
                archivo: archivo?.name,
                loteId,
                modeloId,
                itemEquipo,
                esValidacion
            });

            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('lote_id', loteId);
            formData.append('modelo_id', modeloId);
            formData.append('item_equipo', itemEquipo); // NUEVO PARÁMETRO
            formData.append('validacion', esValidacion);

            // DEBUGGING: Ver qué contiene exactamente el FormData
            console.log('📤 FormData siendo enviado:');
            for (let [key, value] of formData.entries()) {
                console.log(`   ${key}: ${value} (tipo: ${typeof value})`);
            }

            const response = await api.post(ENDPOINTS.IMPORTACION_MASIVA, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error en la importación masiva'
            };
        }
    }
    async importacionMasiva(formData) {
        try {
            const response = await api.post(ENDPOINTS.IMPORTACION_MASIVA, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error en la importación masiva'
            };
        }
    }

    async getPlantillaImportacion() {
        try {
            const response = await api.get(ENDPOINTS.IMPORTACION_MASIVA);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener plantilla'
            };
        }
    }

    // ========== MATERIALES ==========
    async getMateriales(params = {}) {
        try {
            console.log('🔍 SERVICE - Parámetros recibidos:', params);

            // Construir query string manualmente
            const queryParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const queryString = queryParams.toString();
            const finalUrl = queryString ? `${ENDPOINTS.MATERIALES}?${queryString}` : ENDPOINTS.MATERIALES;

            console.log('🌐 SERVICE - URL final:', finalUrl);

            const response = await api.get(finalUrl);

            console.log('📊 SERVICE - Respuesta completa:', response.data); // DEBUG COMPLETO
            console.log('📊 SERVICE - response.data.count:', response.data.count); // DEBUG
            console.log('📊 SERVICE - response.data.results length:', response.data.results?.length); // DEBUG

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ SERVICE - Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener materiales'
            };
        }
    }

    // ========== ESTADÍSTICAS Y REPORTES ==========
    async getEstadisticasGenerales() {
        try {
            const response = await api.get(ENDPOINTS.ESTADISTICAS_GENERALES);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener estadísticas'
            };
        }
    }

    async getDashboard() {
        try {
            const response = await api.get(ENDPOINTS.DASHBOARD_ALMACENES);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener dashboard'
            };
        }
    }
    // ========== MATERIALES ==========

    async getMaterial(id) {
        try {
            const response = await api.get(ENDPOINTS.MATERIAL_DETAIL(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener material'
            };
        }
    }

    async getEstadisticasMateriales(filtros = {}) {
        try {
            const queryString = buildQuery(filtros);
            const response = await api.get(`${ENDPOINTS.MATERIALES_ESTADISTICAS}${queryString}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener estadísticas'
            };
        }
    }

    async cambiarEstadoMaterial(id, estadoId) {
        try {
            const response = await api.post(`${ENDPOINTS.MATERIAL_DETAIL(id)}/cambiar_estado/`, {
                estado_id: estadoId
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar estado'
            };
        }
    }

    async busquedaAvanzadaMateriales(criterios) {
        try {
            const response = await api.post(`${ENDPOINTS.MATERIALES}busqueda_avanzada/`, criterios);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error en búsqueda avanzada'
            };
        }
    }
}

export default new AlmacenesService();