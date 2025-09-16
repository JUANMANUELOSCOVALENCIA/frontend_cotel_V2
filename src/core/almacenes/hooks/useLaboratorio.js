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

    return {
        loading,
        error,
        clearError,
        getDashboard,
        getMaterialesPorTipo,
        enviarMaterialLaboratorio,
        operacionMasiva
        // Remover las funciones que no necesitas por ahora
    };
};

export default useLaboratorio;