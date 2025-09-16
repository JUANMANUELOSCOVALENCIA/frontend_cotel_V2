// src/core/almacenes/hooks/useDevolucion.js - NUEVO
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../../services/api';

export const useDevolucion = () => {
    const [devoluciones, setDevoluciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permissions, setPermissions] = useState({
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false
    });

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Cargar devoluciones
    const loadDevoluciones = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams(params);
            const response = await api.get(`/almacenes/devoluciones/?${queryParams}`);

            setDevoluciones(response.data.results || response.data || []);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar devoluciones';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear devolución
    const createDevolucion = useCallback(async (devolucionData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/almacenes/devoluciones/', devolucionData);

            // Recargar lista
            await loadDevoluciones();

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al crear devolución';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadDevoluciones]);

    // Actualizar estado de devolución
    const updateEstadoDevolucion = useCallback(async (devolucionId, accion, data = {}) => {
        try {
            setLoading(true);
            setError(null);

            let endpoint = '';
            let method = 'post';

            switch (accion) {
                case 'enviar':
                    endpoint = `/almacenes/devoluciones/${devolucionId}/enviar_proveedor/`;
                    break;
                case 'confirmar':
                    endpoint = `/almacenes/devoluciones/${devolucionId}/confirmar_respuesta/`;
                    break;
                case 'rechazar':
                    endpoint = `/almacenes/devoluciones/${devolucionId}/rechazar/`;
                    break;
                default:
                    throw new Error('Acción no válida');
            }

            const response = await api[method](endpoint, data);

            // Recargar lista
            await loadDevoluciones();

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || `Error al ${accion} devolución`;
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadDevoluciones]);

    // Obtener detalle de devolución
    const getDevolucionDetail = useCallback(async (devolucionId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/almacenes/devoluciones/${devolucionId}/`);

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar detalle';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener materiales de devolución
    const getDevolucionMateriales = useCallback(async (devolucionId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/almacenes/devoluciones/${devolucionId}/materiales_detalle/`);

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar materiales';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener seguimiento de devolución
    const getDevolucionSeguimiento = useCallback(async (devolucionId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/almacenes/devoluciones/${devolucionId}/seguimiento/`);

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar seguimiento';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Estadísticas de devoluciones
    const getEstadisticasDevoluciones = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/almacenes/devoluciones/estadisticas/');

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al cargar estadísticas';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Registrar reingreso
    const registrarReingreso = useCallback(async (reingresoData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/almacenes/materiales/reingreso/', reingresoData);

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al registrar reingreso';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        devoluciones,
        loading,
        error,
        permissions,
        clearError,
        loadDevoluciones,
        createDevolucion,
        updateEstadoDevolucion,
        getDevolucionDetail,
        getDevolucionMateriales,
        getDevolucionSeguimiento,
        getEstadisticasDevoluciones,
        registrarReingreso
    };
};

export default useDevolucion;