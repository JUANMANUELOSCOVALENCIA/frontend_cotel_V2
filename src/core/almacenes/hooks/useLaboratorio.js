// src/core/almacenes/hooks/useLaboratorio.js - DATOS EXPANDIDOS COMPLETOS
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../../services/api';

export const useLaboratorio = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Dashboard de laboratorio
    const getDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/almacenes/laboratorio/');
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar dashboard';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ CORREGIDO: Materiales con toda la información expandida
    const getMaterialesPorTipo = useCallback(async (tipo) => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Construir parámetros para expandir toda la información necesaria
            const params = new URLSearchParams({
                tipo: tipo,
                // Expandir relaciones principales
                expand_lote: 'true',
                expand_almacen: 'true',
                expand_modelo: 'true',
                expand_proveedor: 'true',
                // Información de entregas parciales
                include_entregas_parciales: 'true',
                include_lote_detalles: 'true',
                // Información adicional
                include_marca: 'true',
                include_tipo_material: 'true'
            });

            console.log('📦 Consultando materiales con parámetros:', params.toString());

            const response = await api.get(`/almacenes/laboratorio/consultas/?${params.toString()}`);

            console.log('📦 Respuesta de materiales expandidos:', response.data);

            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Error al cargar materiales:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || 'Error al cargar materiales';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ NUEVO: Obtener materiales agrupados por lote y entrega parcial
    const getMaterialesAgrupadosPorLote = useCallback(async (tipo) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                tipo: tipo,
                agrupado_por_lote: 'true',
                incluir_entregas_parciales: 'true',
                expand_all: 'true'
            });

            const response = await api.get(`/almacenes/laboratorio/consultas/?${params.toString()}`);

            console.log('📦 Materiales agrupados por lote:', response.data);

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar materiales agrupados';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ NUEVO: Obtener información completa de lotes con entregas
    const getLotesConEntregas = useCallback(async (filtros = {}) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                ...filtros,
                include_entregas: 'true',
                include_materiales_count: 'true',
                expand_proveedor: 'true',
                expand_almacen: 'true'
            });

            const response = await api.get(`/almacenes/laboratorio/lotes/?${params.toString()}`);

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar lotes';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Enviar material individual a laboratorio
    const enviarMaterialLaboratorio = useCallback(async (materialId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/almacenes/laboratorio/', {
                material_id: materialId,
                accion: 'enviar'
            });
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al enviar a laboratorio';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Operaciones masivas
    const operacionMasiva = useCallback(async (accion, criterios = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/almacenes/laboratorio/masivo/', {
                accion,
                criterios
            });
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error en operación masiva';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ NUEVO: Operación masiva por lote/entrega parcial
    const operacionMasivaPorLote = useCallback(async (accion, loteId, entregaId = null, criterios = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/almacenes/laboratorio/masivo/', {
                accion,
                criterios: {
                    ...criterios,
                    lote_id: loteId,
                    entrega_parcial_id: entregaId
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error en operación masiva por lote';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Registrar inspección detallada
    const registrarInspeccion = useCallback(async (inspeccionData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/almacenes/laboratorio/inspeccion/', inspeccionData);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al registrar inspección';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener historial de inspecciones
    const getHistorialInspecciones = useCallback(async (filtros = {}) => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/almacenes/laboratorio/inspeccion/?${params.toString()}`);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar historial';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Exportar historial
    const exportarHistorial = useCallback(async (filtros = {}) => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams(filtros);
            params.append('export', 'xlsx');

            const response = await api.get(`/almacenes/laboratorio/inspeccion/export/?${params.toString()}`, {
                responseType: 'blob'
            });

            // Crear y descargar archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `historial_inspecciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al exportar historial';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        clearError,
        getDashboard,
        getMaterialesPorTipo,
        getMaterialesAgrupadosPorLote, // ✅ NUEVA
        getLotesConEntregas, // ✅ NUEVA
        operacionMasivaPorLote, // ✅ NUEVA
        enviarMaterialLaboratorio,
        operacionMasiva,
        registrarInspeccion,
        getHistorialInspecciones,
        exportarHistorial
    };
};

export default useLaboratorio;