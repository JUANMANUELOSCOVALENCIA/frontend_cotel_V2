import { useState, useEffect, useCallback } from 'react';
import almacenesService from '../services/almacenesService';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { api } from '../../../services/api';
import ENDPOINTS from "../../../services/endpoints.js";






// ========== HOOKS ANTERIORES (Opciones, Lotes, Importación) ==========
// [Los hooks anteriores se mantienen igual...]

// Caché compartida: la página y sus diálogos piden lo mismo al montarse.
// Se reutiliza la misma petición durante unos segundos (evita 5-10 llamadas iguales),
// pero al navegar a otra pantalla se vuelve a pedir para no mostrar datos viejos.
const OPCIONES_TTL_MS = 10000;
let opcionesCache = { data: null, time: 0, promise: null };

const pedirOpciones = (forzar = false) => {
    const fresco = opcionesCache.data && Date.now() - opcionesCache.time < OPCIONES_TTL_MS;
    if (!forzar && fresco) return Promise.resolve({ success: true, data: opcionesCache.data });
    if (!forzar && opcionesCache.promise) return opcionesCache.promise;

    const promise = almacenesService.getOpcionesCompletas().then((result) => {
        if (result.success) opcionesCache = { data: result.data, time: Date.now(), promise: null };
        else opcionesCache.promise = null;
        return result;
    }).catch((err) => {
        opcionesCache.promise = null;
        throw err;
    });
    opcionesCache.promise = promise;
    return promise;
};

export const invalidarOpcionesCompletas = () => { opcionesCache = { data: null, time: 0, promise: null }; };

export const useOpcionesCompletas = () => {
    const [opciones, setOpciones] = useState(() => opcionesCache.data || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async (forzar = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pedirOpciones(forzar);
            if (result.success) setOpciones(result.data);
            else setError(result.error);
        } catch (err) {
            console.error('Error cargando opciones:', err);
            setError('Error al cargar opciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar(false);
    }, [cargar]);

    return {
        opciones,
        loading,
        error,
        refetchOpciones: () => cargar(true)
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

    const getProximoNumeroLote = useCallback(async () => {
        try {
            const result = await almacenesService.getProximoNumeroLote();
            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = 'Error al obtener próximo número';
            setError(error);
            return { success: false, error };
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
            getProximoNumeroLote,
            clearError: () => setError(null),
            permissions: {
            canCreate: hasPermission('lotes', 'crear'),
                canEdit: hasPermission('lotes', 'actualizar'),
                canDelete: hasPermission('lotes', 'eliminar'),
                canView: hasPermission('lotes', 'leer'),
                canImport: hasPermission('materiales', 'crear')
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