// src/core/almacenes/hooks/useLaboratorio.js - ACTUALIZADO
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

    // Materiales por tipo
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

    // Operación masiva
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

    // Inspección individual
    const registrarInspeccionIndividual = useCallback(async (inspeccionData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/almacenes/laboratorio/inspeccion/', inspeccionData);

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error en inspección individual:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Error al registrar inspección';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Inspección masiva
    const registrarInspeccionMasiva = useCallback(async (inspeccionData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/almacenes/laboratorio/inspeccion/', inspeccionData);

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error en inspección masiva:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Error al registrar inspección masiva';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Historial de inspecciones
    const getHistorialInspecciones = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams();
            if (params.material_id) queryParams.append('material_id', params.material_id);
            if (params.days) queryParams.append('days', params.days);

            const response = await api.get(`/almacenes/laboratorio/inspeccion/?${queryParams}`);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar historial';
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
        registrarInspeccionIndividual,
        registrarInspeccionMasiva,
        getHistorialInspecciones,
    };
};

export default useLaboratorio;