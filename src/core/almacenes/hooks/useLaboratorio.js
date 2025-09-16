// src/core/almacenes/hooks/useLaboratorio.js - NUEVO
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

    // Materiales por tipo de consulta
    const getMaterialesPorTipo = useCallback(async (tipo) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/almacenes/laboratorio/consultas/?tipo=${tipo}`);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar materiales';
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
        enviarMaterialLaboratorio,
        operacionMasiva,
        registrarInspeccion,
        getHistorialInspecciones,
        exportarHistorial
    };
};

export default useLaboratorio;