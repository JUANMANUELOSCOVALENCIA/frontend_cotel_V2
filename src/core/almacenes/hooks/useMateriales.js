import { useState, useCallback, useEffect } from 'react';
import almacenesService from '../services/almacenesService';
import { usePermissions } from '../../permissions/hooks/usePermissions';

export const useMateriales = () => {
    const { hasPermission } = usePermissions();
    const [materiales, setMateriales] = useState([]);
    const [materialActual, setMaterialActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        page: 1,
        page_size: 20
    });

    const loadMateriales = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getMateriales(params);
            if (result.success) {
                setMateriales(result.data.results || result.data);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                    page: params.page || 1,
                    page_size: params.page_size || 20
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar materiales');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMaterialDetail = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.getMaterial(id);
            if (result.success) {
                setMaterialActual(result.data);
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al cargar detalle del material';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, []);

    const loadEstadisticas = useCallback(async (filtros = {}) => {
        try {
            const result = await almacenesService.getEstadisticasMateriales(filtros);
            if (result.success) {
                setEstadisticas(result.data);
                return { success: true, data: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            return { success: false, error: 'Error al cargar estadísticas' };
        }
    }, []);

    const cambiarEstado = useCallback(async (materialId, estadoId) => {
        setLoading(true);
        try {
            const result = await almacenesService.cambiarEstadoMaterial(materialId, estadoId);
            if (result.success) {
                // Recargar la lista
                await loadMateriales();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al cambiar estado';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadMateriales]);

    const busquedaAvanzada = useCallback(async (criterios) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.busquedaAvanzadaMateriales(criterios);
            if (result.success) {
                setMateriales(result.data.results || result.data);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                    page: 1,
                    page_size: 20
                });
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error en búsqueda avanzada';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        materiales,
        materialActual,
        loading,
        error,
        estadisticas,
        pagination,
        loadMateriales,
        loadMaterialDetail,
        loadEstadisticas,
        cambiarEstado,
        busquedaAvanzada,
        clearError: () => setError(null),
        clearMaterialActual: () => setMaterialActual(null),
        permissions: {
            canView: hasPermission('materiales', 'leer'),
            canEdit: hasPermission('materiales', 'actualizar'),
            canChangeState: hasPermission('materiales', 'actualizar'),
            canTransfer: hasPermission('traspasos', 'crear')
        }
    };
};

export const useEstadisticasMateriales = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadEstadisticas = useCallback(async (filtros = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getEstadisticasMateriales(filtros);
            if (result.success) {
                setEstadisticas(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        estadisticas,
        loading,
        error,
        loadEstadisticas,
        clearError: () => setError(null)
    };
};