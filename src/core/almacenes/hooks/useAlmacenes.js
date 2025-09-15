import { useState, useEffect, useCallback } from 'react';
import almacenesService from '../services/almacenesService';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { api } from '../../../services/api';
import ENDPOINTS from "../../../services/endpoints.js";

// ========== HOOK PRINCIPAL DE ALMACENES ==========
export const useAlmacenes = () => {
    const { hasPermission } = usePermissions();
    const [almacenes, setAlmacenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const loadAlmacenes = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getAlmacenes(params);
            if (result.success) {
                setAlmacenes(result.data.results || result.data);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar almacenes');
        } finally {
            setLoading(false);
        }
    }, []);

    const createAlmacen = useCallback(async (almacenData) => {
        setLoading(true);
        try {
            const result = await almacenesService.createAlmacen(almacenData);
            if (result.success) {
                await loadAlmacenes();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear almacén';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadAlmacenes]);

    const updateAlmacen = useCallback(async (id, almacenData) => {
        setLoading(true);
        try {
            const result = await almacenesService.updateAlmacen(id, almacenData);
            if (result.success) {
                await loadAlmacenes();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar almacén';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadAlmacenes]);

    const deleteAlmacen = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.deleteAlmacen(id);
            if (result.success) {
                await loadAlmacenes();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar almacén';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadAlmacenes]);

    return {
        almacenes,
        loading,
        error,
        pagination,
        loadAlmacenes,
        createAlmacen,
        updateAlmacen,
        deleteAlmacen,
        clearError: () => setError(null),
        permissions: {
            canCreate: hasPermission('almacenes', 'crear'),
            canEdit: hasPermission('almacenes', 'actualizar'),
            canDelete: hasPermission('almacenes', 'eliminar'),
            canView: hasPermission('almacenes', 'leer')
        }
    };
};

// ========== HOOK PARA PROVEEDORES ==========
export const useProveedores = () => {
    const { hasPermission } = usePermissions();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadProveedores = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getProveedores(params);
            if (result.success) {
                setProveedores(result.data.results || result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProveedor = useCallback(async (proveedorData) => {
        setLoading(true);
        try {
            const result = await almacenesService.createProveedor(proveedorData);
            if (result.success) {
                await loadProveedores();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear proveedor';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadProveedores]);

    const updateProveedor = useCallback(async (id, proveedorData) => {
        setLoading(true);
        try {
            const result = await almacenesService.updateProveedor(id, proveedorData);
            if (result.success) {
                await loadProveedores();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar proveedor';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadProveedores]);

    const deleteProveedor = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.deleteProveedor(id);
            if (result.success) {
                await loadProveedores();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar proveedor';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadProveedores]);

    return {
        proveedores,
        loading,
        error,
        loadProveedores,
        createProveedor,
        updateProveedor,
        deleteProveedor,
        clearError: () => setError(null),
        permissions: {
            canCreate: hasPermission('proveedores', 'crear'),
            canEdit: hasPermission('proveedores', 'actualizar'),
            canDelete: hasPermission('proveedores', 'eliminar'),
            canView: hasPermission('proveedores', 'leer')
        }
    };
};

// ========== HOOK PARA MARCAS ==========
export const useMarcas = () => {
    const { hasPermission } = usePermissions();
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadMarcas = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getMarcas(params);
            if (result.success) {
                setMarcas(result.data.results || result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar marcas');
        } finally {
            setLoading(false);
        }
    }, []);

    const createMarca = useCallback(async (marcaData) => {
        setLoading(true);
        try {
            const result = await almacenesService.createMarca(marcaData);
            if (result.success) {
                await loadMarcas();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear marca';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadMarcas]);

    const updateMarca = useCallback(async (id, marcaData) => {
        setLoading(true);
        try {
            const result = await almacenesService.updateMarca(id, marcaData);
            if (result.success) {
                await loadMarcas();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar marca';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadMarcas]);

    const deleteMarca = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.deleteMarca(id);
            if (result.success) {
                await loadMarcas();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar marca';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadMarcas]);

    const toggleActivoMarca = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.toggleActivoMarca(id);
            if (result.success) {
                await loadMarcas();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al cambiar estado de marca';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadMarcas]);

    return {
        marcas,
        loading,
        error,
        loadMarcas,
        createMarca,
        updateMarca,
        deleteMarca,
        toggleActivoMarca,
        clearError: () => setError(null),
        permissions: {
            canCreate: hasPermission('marcas', 'crear'),
            canEdit: hasPermission('marcas', 'actualizar'),
            canDelete: hasPermission('marcas', 'eliminar'),
            canView: hasPermission('marcas', 'leer')
        }
    };
};

// ========== HOOK PARA MODELOS ==========
export const useModelos = () => {
    const { hasPermission } = usePermissions();
    const [modelos, setModelos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadModelos = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getModelos(params);
            if (result.success) {
                setModelos(result.data.results || result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar modelos');
        } finally {
            setLoading(false);
        }
    }, []);

    const createModelo = useCallback(async (modeloData) => {
        setLoading(true);
        try {
            const result = await almacenesService.createModelo(modeloData);
            if (result.success) {
                await loadModelos();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear modelo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadModelos]);

    const updateModelo = useCallback(async (id, modeloData) => {
        setLoading(true);
        try {
            const result = await almacenesService.updateModelo(id, modeloData);
            if (result.success) {
                await loadModelos();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar modelo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadModelos]);

    const deleteModelo = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.deleteModelo(id);
            if (result.success) {
                await loadModelos();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar modelo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadModelos]);

    const toggleActivoModelo = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.toggleActivoModelo(id);
            if (result.success) {
                await loadModelos();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al cambiar estado del modelo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadModelos]);

    return {
        modelos,
        loading,
        error,
        loadModelos,
        createModelo,
        updateModelo,
        deleteModelo,
        toggleActivoModelo,
        clearError: () => setError(null),
        permissions: {
            canCreate: hasPermission('modelos', 'crear'),
            canEdit: hasPermission('modelos', 'actualizar'),
            canDelete: hasPermission('modelos', 'eliminar'),
            canView: hasPermission('modelos', 'leer')
        }
    };
};

// ========== HOOK PARA TIPOS DE EQUIPO ==========
export const useTiposEquipo = () => {
    const { hasPermission } = usePermissions();
    const [tiposEquipo, setTiposEquipo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadTiposEquipo = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getTiposEquipo(params);
            if (result.success) {
                setTiposEquipo(result.data.results || result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar tipos de equipo');
        } finally {
            setLoading(false);
        }
    }, []);

    const createTipoEquipo = useCallback(async (tipoData) => {
        setLoading(true);
        try {
            const result = await almacenesService.createTipoEquipo(tipoData);
            if (result.success) {
                await loadTiposEquipo();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear tipo de equipo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadTiposEquipo]);

    const updateTipoEquipo = useCallback(async (id, tipoData) => {
        setLoading(true);
        try {
            const result = await almacenesService.updateTipoEquipo(id, tipoData);
            if (result.success) {
                await loadTiposEquipo();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar tipo de equipo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadTiposEquipo]);

    const deleteTipoEquipo = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.deleteTipoEquipo(id);
            if (result.success) {
                await loadTiposEquipo();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar tipo de equipo';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadTiposEquipo]);

    return {
        tiposEquipo,
        loading,
        error,
        loadTiposEquipo,
        createTipoEquipo,
        updateTipoEquipo,
        deleteTipoEquipo,
        clearError: () => setError(null),
        permissions: {
            canCreate: hasPermission('tipos_equipo', 'crear'),
            canEdit: hasPermission('tipos_equipo', 'actualizar'),
            canDelete: hasPermission('tipos_equipo', 'eliminar'),
            canView: hasPermission('tipos_equipo', 'leer')
        }
    };
};

// ========== HOOKS ANTERIORES (Opciones, Lotes, Importación) ==========
// [Los hooks anteriores se mantienen igual...]

// En useAlmacenes.js - verificar este hook:
export const useOpcionesCompletas = () => {
    const [opciones, setOpciones] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadOpciones = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getOpcionesCompletas();
            console.log('🔍 RESULTADO opciones:', result); // DEBUGGING

            if (result.success) {
                console.log('🔍 TIPOS SERVICIO:', result.data.tipos_servicio); // DEBUGGING
                setOpciones(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('❌ ERROR cargando opciones:', err);
            setError('Error al cargar opciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOpciones();
    }, [loadOpciones]);

    return {
        opciones,
        loading,
        error,
        refetchOpciones: loadOpciones
    };
};

export const useLotes = () => {
    const { hasPermission } = usePermissions();
    const [lotes, setLotes] = useState([]);
    const [loteActual, setLoteActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadLotes = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await almacenesService.getLotes(params);
            if (result.success) {
                setLotes(result.data.results || result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar lotes');
        } finally {
            setLoading(false);
        }
    }, []);

    const createLote = useCallback(async (loteData) => {
        setLoading(true);
        try {
            const result = await almacenesService.createLote(loteData);
            if (result.success) {
                await loadLotes();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al crear lote';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadLotes]);

    const deleteLote = useCallback(async (id) => {
        console.log('🔥 HOOK DELETE - Eliminando lote ID:', id);
        setLoading(true);
        try {
            const result = await almacenesService.deleteLote(id);
            console.log('🔥 HOOK DELETE - Resultado del servicio:', result);

            if (result.success) {
                await loadLotes();
                return { success: true, message: result.message };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al eliminar lote';
            console.error('🔥 HOOK DELETE - Exception:', err);
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadLotes]);

    const updateLote = useCallback(async (id, loteData) => {
        setLoading(true);
        try {
            const result = await almacenesService.updateLote(id, loteData);
            if (result.success) {
                await loadLotes();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al actualizar lote';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, [loadLotes]);

    const loadLoteDetail = useCallback(async (id) => {
        setLoading(true);
        try {
            const result = await almacenesService.getLote(id);
            if (result.success) {
                setLoteActual(result.data);
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al cargar detalle del lote';
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        lotes,
            loteActual,
            loading,
            error,
            loadLotes,
            createLote,
            updateLote,
            deleteLote,
            loadLoteDetail,
            clearError: () => setError(null),
            permissions: {
            canCreate: hasPermission('lotes', 'crear'),
                canEdit: hasPermission('lotes', 'actualizar'),
                canDelete: hasPermission('lotes', 'eliminar'),
                canView: hasPermission('lotes', 'leer'),
                canImport: hasPermission('lotes', 'leer')
        }
    };
};

// src/core/almacenes/hooks/useAlmacenes.js - useImportacionMasiva ACTUALIZADO
export const useImportacionMasiva = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);

    // ✅ ACTUALIZADO: Agregar numeroEntrega como parámetro
    const importarArchivo = useCallback(async (archivo, loteId, modeloId, itemEquipo, esValidacion = false, numeroEntrega = null) => {
        setLoading(true);
        setError(null);
        setResultado(null);

        try {
            console.log('🔍 HOOK DEBUG - Parámetros recibidos:', {
                archivo: archivo?.name,
                loteId,
                modeloId,
                itemEquipo,
                esValidacion,
                numeroEntrega // ✅ NUEVO: Debug número entrega
            });

            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('lote_id', loteId);
            formData.append('modelo_id', modeloId);
            formData.append('item_equipo', itemEquipo);
            formData.append('validacion', esValidacion ? 'true' : 'false');

            // ✅ AGREGAR numero_entrega si se proporciona
            if (numeroEntrega) {
                formData.append('numero_entrega', numeroEntrega);
                console.log('✅ Número de entrega agregado:', numeroEntrega);
            }

            // Debug del FormData
            console.log('📋 FormData enviado:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }

            const response = await api.post(ENDPOINTS.IMPORTACION_MASIVA, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setResultado(response.data.resultado);
                console.log('✅ Importación exitosa:', response.data.resultado);
                return { success: true, data: response.data };
            } else {
                setError(response.data.error);
                console.error('❌ Error del servidor:', response.data.error);
                return { success: false, error: response.data.error };
            }
        } catch (error) {
            console.error('❌ Error en importación masiva:', error);
            const errorMessage = error.response?.data?.error || 'Error en la importación';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerPlantilla = useCallback(async () => {
        try {
            // Si tienes un endpoint específico para la plantilla
            const result = await almacenesService.getPlantillaImportacion();
            return result;
        } catch (err) {
            return { success: false, error: 'Error al obtener plantilla' };
        }
    }, []);

    return {
        loading,
        error,
        resultado,
        importarArchivo,
        obtenerPlantilla,
        clearError: () => setError(null),
        clearResultado: () => setResultado(null)
    };
};