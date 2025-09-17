// src/core/almacenes/hooks/useLaboratorio.js - SIMPLIFICADO
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

    // ✅ SIMPLIFICADO: El backend ya devuelve información expandida
    const getMaterialesPorTipo = useCallback(async (tipo) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/almacenes/laboratorio/consultas/?tipo=${tipo}`);

            console.log('📦 Respuesta expandida del backend:', response.data);

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

    // ✅ OPERACIÓN MASIVA CORREGIDA
    const operacionMasiva = useCallback(async (accion, criterios = {}) => {
        try {
            setLoading(true);
            setError(null);

            console.log('🚀 Operación masiva:', accion, criterios);

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

    // Resto de funciones iguales...
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

    const registrarInspeccion = useCallback(async (inspeccionData) => {
        try {
            setLoading(true);
            setError(null);

            // ✅ CORREGIR: Usar 'api' en lugar de 'apiService'
            const response = await api.post('/almacenes/laboratorio/inspeccion/', inspeccionData);

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: 'No se recibió respuesta del servidor'
                };
            }
        } catch (error) {
            console.error('Error en registrarInspeccion:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Error al registrar inspección';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []); // ✅ AGREGAR: useCallback con dependencias vacías

    const getHistorialInspecciones = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Construir query params
            const queryParams = new URLSearchParams();
            if (params.material_id) queryParams.append('material_id', params.material_id);
            if (params.days) queryParams.append('days', params.days);

            const response = await api.get(`/almacenes/laboratorio/inspeccion/?${queryParams}`);

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error al cargar historial de inspecciones:', error);
            const errorMessage = error.response?.data?.error || 'Error al cargar historial de inspecciones';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);


// ✅ AGREGAR: Exportar la función en el return
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
    };
};

export default useLaboratorio;