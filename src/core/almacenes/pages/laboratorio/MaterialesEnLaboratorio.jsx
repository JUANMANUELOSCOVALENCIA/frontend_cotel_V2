// src/core/almacenes/pages/laboratorio/MaterialesEnLaboratorio.jsx - SIN EMOJIS
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Spinner
} from '@material-tailwind/react';
import {
    IoSearch,
    IoFlask,
    IoWarning,
    IoTime,
    IoEye,
    IoPlay,
    IoRefresh,
    IoSend,
    IoFilter,
    IoGrid,
    IoList,
    IoCube,
    IoGitBranch,
    IoChevronDown,
    IoChevronUp
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useLaboratorio } from '../../hooks/useLaboratorio';

const MaterialesEnLaboratorio = ({ tipo = 'en_laboratorio' }) => {
    const [materiales, setMateriales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [vistaLotes, setVistaLotes] = useState(false);
    const [lotesAbiertos, setLotesAbiertos] = useState(new Set());

    const {
        loading,
        error,
        getMaterialesPorTipo,
        getMaterialesAgrupadosPorLote,
        enviarMaterialLaboratorio,
        operacionMasiva,
        operacionMasivaPorLote,
        clearError
    } = useLaboratorio();

    useEffect(() => {
        loadMateriales();
    }, [tipo, vistaLotes]);

    // TEMPORAL - Debug para ver estructura
    useEffect(() => {
        if (materiales.length > 0) {
            console.log('🔍 PRIMER MATERIAL COMPLETO:', materiales[0]);
            console.log('🔍 MODELO INFO:', materiales[0].modelo_info || materiales[0].modelo);
            console.log('🔍 MARCA INFO DIRECTO:', materiales[0].marca_info);
            console.log('🔍 TODAS LAS PROPIEDADES:', Object.keys(materiales[0]));
        }
    }, [materiales]);

    const loadMateriales = async () => {
        try {
            const result = vistaLotes
                ? await getMaterialesAgrupadosPorLote(tipo)
                : await getMaterialesPorTipo(tipo);

            if (result.success) {
                setMateriales(result.data.materiales || result.data || []);
            } else {
                toast.error(result.error);
                setMateriales([]);
            }
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            toast.error('Error al cargar materiales');
            setMateriales([]);
        }
    };

    // FUNCIÓN MEJORADA PARA OBTENER MARCA - MAS UBICACIONES
    const obtenerModeloInfo = (material) => {
        console.log('🔍 DEBUG MATERIAL:', material); // TEMPORAL

        // Buscar modelo en múltiples ubicaciones
        const modeloInfo = material.modelo_info ||
            material.modelo_detalle ||
            material.modelo ||
            material.modelo_data ||
            {};

        // BUSCAR MARCA EN TODAS LAS UBICACIONES POSIBLES
        let marcaInfo = null;
        let marcaNombre = 'Sin Marca';

        // 1. Desde modelo expandido
        if (modeloInfo.marca_info?.nombre) {
            marcaInfo = modeloInfo.marca_info;
            marcaNombre = modeloInfo.marca_info.nombre;
        }
        // 2. Desde modelo.marca
        else if (modeloInfo.marca?.nombre) {
            marcaInfo = modeloInfo.marca;
            marcaNombre = modeloInfo.marca.nombre;
        }
        // 3. Desde material directo marca_info
        else if (material.marca_info?.nombre) {
            marcaInfo = material.marca_info;
            marcaNombre = material.marca_info.nombre;
        }
        // 4. Desde material.marca
        else if (material.marca?.nombre) {
            marcaInfo = material.marca;
            marcaNombre = material.marca.nombre;
        }
        // 5. Campo directo marca_nombre
        else if (material.marca_nombre) {
            marcaNombre = material.marca_nombre;
        }
        // 6. Campo directo en modelo
        else if (modeloInfo.marca_nombre) {
            marcaNombre = modeloInfo.marca_nombre;
        }
        // 7. Buscar en propiedades planas
        else if (material.modelo_marca) {
            marcaNombre = material.modelo_marca;
        }

        const modeloNombre =
            modeloInfo.nombre ||
            material.modelo_nombre ||
            material.modelo ||
            'Sin Modelo';

        console.log('🔍 MARCA ENCONTRADA:', marcaNombre, 'MODELO:', modeloNombre); // TEMPORAL

        return {
            id: modeloInfo.id || material.modelo_id,
            nombre: modeloNombre,
            codigo: modeloInfo.codigo_modelo || material.codigo_modelo,
            marca: marcaNombre,
            marca_id: marcaInfo?.id || material.marca_id,
            tipo_material: modeloInfo.tipo_material_info?.nombre ||
                modeloInfo.tipo_material?.nombre ||
                material.tipo_material_info?.nombre ||
                material.tipo_material ||
                'Sin Tipo',
            nombre_completo: `${marcaNombre} ${modeloNombre}`
        };
    };

    const obtenerLoteInfo = (material) => {
        const loteInfo = material.lote_info ||
            material.lote_detalle ||
            material.lote ||
            material.lote_principal_info ||
            {};

        return {
            id: loteInfo.id || material.lote_id,
            numero_lote: loteInfo.numero_lote || material.numero_lote || 'Sin Lote',
            proveedor: loteInfo.proveedor_info?.nombre_comercial ||
                loteInfo.proveedor?.nombre_comercial ||
                material.proveedor_info?.nombre_comercial ||
                'Sin Proveedor',
            fecha_recepcion: loteInfo.fecha_recepcion || material.fecha_recepcion,
            almacen_destino: loteInfo.almacen_destino_info?.nombre ||
                loteInfo.almacen_destino?.nombre ||
                material.almacen_destino_info?.nombre ||
                'Sin Almacén Destino'
        };
    };

    const obtenerEntregaInfo = (material) => {
        const entregaInfo = material.entrega_parcial_info ||
            material.entrega_info ||
            material.entrega_parcial ||
            {};

        const numeroEntrega = entregaInfo.numero_entrega ||
            material.numero_entrega_parcial ||
            material.numero_entrega;

        return {
            id: entregaInfo.id,
            numero_entrega: numeroEntrega,
            fecha_entrega: entregaInfo.fecha_entrega,
            cantidad_entregada: entregaInfo.cantidad_entregada,
            descripcion: numeroEntrega ?
                `Entrega Parcial #${numeroEntrega}` :
                'Lote Principal'
        };
    };

    const obtenerAlmacenInfo = (material) => {
        const almacenInfo = material.almacen_actual_info ||
            material.almacen_info ||
            material.ubicacion_actual_info ||
            material.almacen_actual ||
            {};

        return {
            id: almacenInfo.id || material.almacen_id,
            nombre: almacenInfo.nombre || material.almacen_nombre || 'Sin Almacén',
            codigo: almacenInfo.codigo || material.almacen_codigo
        };
    };

    // ENVÍO A LABORATORIO - INDIVIDUAL
    const handleEnviarLaboratorio = async (materialId) => {
        try {
            const result = await enviarMaterialLaboratorio(materialId);
            if (result.success) {
                toast.success(result.data.message || 'Material enviado a laboratorio');
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al enviar a laboratorio');
        }
    };

    // ENVÍO MASIVO - TODOS LOS SELECCIONADOS
    const handleEnviarMasivo = async () => {
        if (selectedMaterials.length === 0) {
            toast.warning('Selecciona al menos un material');
            return;
        }

        try {
            const result = await operacionMasiva('enviar_pendientes', {
                materiales_ids: selectedMaterials
            });

            if (result.success) {
                toast.success(result.data.message || `${selectedMaterials.length} materiales enviados a laboratorio`);
                setSelectedMaterials([]);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error en envío masivo');
        }
    };

    // ENVÍO LOTE COMPLETO A LABORATORIO
    const handleEnviarLoteCompleto = async (loteId, numeroLote) => {
        try {
            const result = await operacionMasivaPorLote('enviar_laboratorio', loteId);

            if (result.success) {
                toast.success(`Lote ${numeroLote} enviado completo a laboratorio`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al enviar lote completo');
        }
    };

    // ENVÍO ENTREGA PARCIAL ESPECÍFICA A LABORATORIO
    const handleEnviarEntregaParcial = async (loteId, numeroEntrega, numeroLote) => {
        try {
            // Enviar con criterios específicos de la entrega parcial
            const result = await operacionMasivaPorLote('enviar_laboratorio', loteId, null, {
                numero_entrega_parcial: numeroEntrega
            });

            if (result.success) {
                toast.success(`Entrega #${numeroEntrega} del lote ${numeroLote} enviada a laboratorio`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al enviar entrega parcial');
        }
    };

    const getTipoConfig = () => {
        const configs = {
            pendientes_inspeccion: {
                title: 'Equipos Pendientes de Inspección',
                subtitle: 'Equipos nuevos que requieren inspección inicial',
                icon: IoTime,
                color: 'amber'
            },
            en_laboratorio: {
                title: 'Equipos en Laboratorio',
                subtitle: 'Equipos actualmente siendo inspeccionados',
                icon: IoFlask,
                color: 'blue'
            },
            tiempo_excesivo: {
                title: 'Equipos con Tiempo Excesivo',
                subtitle: 'Equipos que llevan más de 15 días en laboratorio',
                icon: IoWarning,
                color: 'red'
            }
        };
        return configs[tipo] || configs.en_laboratorio;
    };

    const config = getTipoConfig();
    const TitleIcon = config.icon;

    const filteredMateriales = materiales.filter(material => {
        const loteInfo = obtenerLoteInfo(material);
        const modeloInfo = obtenerModeloInfo(material);
        const almacenInfo = obtenerAlmacenInfo(material);

        return material.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            modeloInfo.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loteInfo.numero_lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            almacenInfo.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Agrupación por lote y entrega
    const materialesPorLoteYEntrega = filteredMateriales.reduce((acc, material) => {
        const loteInfo = obtenerLoteInfo(material);
        const entregaInfo = obtenerEntregaInfo(material);

        const loteKey = loteInfo.numero_lote;
        const entregaKey = entregaInfo.descripcion;

        if (!acc[loteKey]) {
            acc[loteKey] = {
                lote_info: loteInfo,
                entregas: {}
            };
        }

        if (!acc[loteKey].entregas[entregaKey]) {
            acc[loteKey].entregas[entregaKey] = {
                entrega_info: entregaInfo,
                materiales: []
            };
        }

        acc[loteKey].entregas[entregaKey].materiales.push(material);
        return acc;
    }, {});

    const lotesReales = Object.keys(materialesPorLoteYEntrega).filter(lote => lote !== 'Sin Lote');
    const tieneLotesReales = lotesReales.length > 0;

    const toggleLoteAbierto = (loteKey) => {
        const nuevosAbiertos = new Set(lotesAbiertos);
        if (nuevosAbiertos.has(loteKey)) {
            nuevosAbiertos.delete(loteKey);
        } else {
            nuevosAbiertos.add(loteKey);
        }
        setLotesAbiertos(nuevosAbiertos);
    };

    const getAlertaColor = (dias) => {
        if (dias > 15) return 'red';
        if (dias > 10) return 'amber';
        return 'blue';
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Spinner className="h-12 w-12 text-blue-500" />
                <Typography color="gray" className="mt-4 font-medium">
                    Cargando equipos...
                </Typography>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Error handling */}
            {error && (
                <Alert color="red" className="border border-red-200">
                    <div className="flex items-start gap-3">
                        <IoWarning className="h-5 w-5 mt-0.5" />
                        <div>
                            <Typography variant="small" className="font-bold text-red-800 mb-1">
                                Error al cargar materiales
                            </Typography>
                            <Typography variant="small" className="text-red-700">
                                {error}
                            </Typography>
                            <Button
                                size="sm"
                                color="red"
                                variant="outlined"
                                onClick={clearError}
                                className="mt-2"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Typography variant="h5" color="blue-gray" className="font-semibold mb-1">
                        {config.title}
                    </Typography>
                    <Typography variant="small" color="gray">
                        {config.subtitle}
                    </Typography>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle vista por lotes */}
                    {tipo === 'pendientes_inspeccion' && tieneLotesReales && (
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                            <Button
                                size="sm"
                                variant={!vistaLotes ? "filled" : "text"}
                                color={!vistaLotes ? "blue" : "gray"}
                                className="flex items-center gap-1 px-3 py-1.5"
                                onClick={() => setVistaLotes(false)}
                            >
                                <IoList className="h-4 w-4" />
                                Lista
                            </Button>
                            <Button
                                size="sm"
                                variant={vistaLotes ? "filled" : "text"}
                                color={vistaLotes ? "blue" : "gray"}
                                className="flex items-center gap-1 px-3 py-1.5"
                                onClick={() => setVistaLotes(true)}
                            >
                                <IoGrid className="h-4 w-4" />
                                Por Lotes ({lotesReales.length})
                            </Button>
                        </div>
                    )}

                    <Button
                        size="sm"
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={loadMateriales}
                        disabled={loading}
                    >
                        <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                    <Input
                        label="Buscar equipos..."
                        icon={<IoSearch className="h-5 w-5" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        containerProps={{ className: "min-w-0" }}
                    />
                </div>
                <Chip
                    variant="ghost"
                    color={config.color}
                    value={`${filteredMateriales.length} equipos${vistaLotes && tieneLotesReales ? ` en ${lotesReales.length} lotes` : ''}`}
                    className="px-3 py-1.5 font-medium"
                />
                <IconButton variant="outlined" color={config.color} size="sm">
                    <IoFilter className="h-4 w-4" />
                </IconButton>
            </div>

            {/* Alertas contextuales */}
            {tipo === 'pendientes_inspeccion' && filteredMateriales.length > 0 && (
                <Alert color="blue" className="mb-4 border border-blue-200 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <IoTime className="h-4 w-4 text-blue-600" />
                        <Typography variant="small" className="text-blue-800">
                            <span className="font-medium">Inspección Requerida:</span> Estos equipos nuevos requieren inspección inicial antes de estar disponibles
                            {vistaLotes && tieneLotesReales && ` • Organizados en ${lotesReales.length} lotes`}
                        </Typography>
                    </div>
                </Alert>
            )}

            {/* Contenido principal */}
            {vistaLotes && tipo === 'pendientes_inspeccion' && tieneLotesReales ? (
                // VISTA POR LOTES
                <div className="space-y-4">
                    {lotesReales.map((numeroLote) => {
                        const loteData = materialesPorLoteYEntrega[numeroLote];
                        const totalMaterialesLote = Object.values(loteData.entregas).reduce(
                            (sum, entrega) => sum + entrega.materiales.length, 0
                        );
                        const entregasCount = Object.keys(loteData.entregas).length;
                        const loteAbierto = lotesAbiertos.has(numeroLote);

                        return (
                            <Card key={numeroLote} className="border border-gray-200 shadow-sm">
                                <CardHeader
                                    className="pb-3 cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleLoteAbierto(numeroLote)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <IoCube className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <Typography variant="h6" color="blue-gray" className="font-bold">
                                                    Lote: {numeroLote}
                                                </Typography>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <Typography variant="small" color="gray">
                                                        {totalMaterialesLote} equipos en {entregasCount} entrega(s)
                                                    </Typography>
                                                    {loteData.lote_info.proveedor && (
                                                        <Typography variant="small" color="gray">
                                                            • {loteData.lote_info.proveedor}
                                                        </Typography>
                                                    )}
                                                    {loteData.lote_info.fecha_recepcion && (
                                                        <Typography variant="small" color="gray">
                                                            • {new Date(loteData.lote_info.fecha_recepcion).toLocaleDateString('es-ES')}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                variant="ghost"
                                                color="blue"
                                                value={`${totalMaterialesLote} equipos`}
                                                className="font-medium"
                                            />
                                            <Button
                                                size="sm"
                                                color="green"
                                                variant="gradient"
                                                className="flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEnviarLoteCompleto(loteData.lote_info.id, numeroLote);
                                                }}
                                                disabled={loading}
                                            >
                                                <IoSend className="h-4 w-4" />
                                                Enviar Lote Completo
                                            </Button>
                                            <IconButton variant="text" color="blue" size="sm">
                                                {loteAbierto ? <IoChevronUp className="h-4 w-4" /> : <IoChevronDown className="h-4 w-4" />}
                                            </IconButton>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Contenido del lote (acordeón) */}
                                {loteAbierto && (
                                    <CardBody className="pt-0">
                                        <div className="space-y-4">
                                            {Object.entries(loteData.entregas).map(([nombreEntrega, entregaData]) => (
                                                <div key={nombreEntrega} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                    {/* Header de entrega parcial */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                                                <IoGitBranch className="h-4 w-4 text-amber-600" />
                                                            </div>
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-bold">
                                                                    {nombreEntrega}
                                                                </Typography>
                                                                <Typography variant="small" color="gray">
                                                                    {entregaData.materiales.length} equipos
                                                                    {entregaData.entrega_info.fecha_entrega &&
                                                                        ` • ${new Date(entregaData.entrega_info.fecha_entrega).toLocaleDateString('es-ES')}`
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </div>

                                                        {/* BOTÓN PARA ENVIAR ENTREGA ESPECÍFICA */}
                                                        {entregaData.entrega_info.numero_entrega && (
                                                            <Button
                                                                size="sm"
                                                                color="blue"
                                                                variant="gradient"
                                                                className="flex items-center gap-1"
                                                                onClick={() => handleEnviarEntregaParcial(
                                                                    loteData.lote_info.id,
                                                                    entregaData.entrega_info.numero_entrega,
                                                                    numeroLote
                                                                )}
                                                                disabled={loading}
                                                            >
                                                                <IoSend className="h-3 w-3" />
                                                                Enviar Entrega #{entregaData.entrega_info.numero_entrega}
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Lista de equipos de la entrega */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {entregaData.materiales.map((material) => {
                                                            const modeloInfo = obtenerModeloInfo(material);
                                                            const almacenInfo = obtenerAlmacenInfo(material);

                                                            return (
                                                                <Card key={material.id} className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                                                                    <CardBody className="p-3">
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <div className="flex-1">
                                                                                <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                                                                                    {material.codigo_interno}
                                                                                </Typography>
                                                                                <Typography variant="small" color="gray" className="font-mono text-xs">
                                                                                    MAC: {material.mac_address}
                                                                                </Typography>
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                <Tooltip content="Ver detalles">
                                                                                    <IconButton variant="text" color="blue" size="sm">
                                                                                        <IoEye className="h-3 w-3" />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip content="Enviar individual a laboratorio">
                                                                                    <IconButton
                                                                                        variant="text"
                                                                                        color="green"
                                                                                        size="sm"
                                                                                        onClick={() => handleEnviarLaboratorio(material.id)}
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <IoPlay className="h-3 w-3" />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                                                    {modeloInfo.nombre_completo}
                                                                                </Typography>
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <Typography variant="small" color="gray">
                                                                                    {almacenInfo.nombre}
                                                                                </Typography>
                                                                                <Chip
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    color="blue"
                                                                                    value={modeloInfo.tipo_material || 'N/A'}
                                                                                    className="font-mono text-xs"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </CardBody>
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                // Vista de lista normal
                <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
                    {filteredMateriales.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <TitleIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <Typography variant="h6" color="gray" className="mb-2">
                                No hay equipos en esta categoría
                            </Typography>
                            <Typography variant="small" color="gray">
                                {tipo === 'pendientes_inspeccion'
                                    ? 'Todos los equipos nuevos han sido enviados a laboratorio'
                                    : 'No hay equipos actualmente en esta sección'
                                }
                            </Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/80">
                                    <th className="px-4 py-3 text-left">
                                        <Typography variant="small" color="blue-gray" className="font-semibold uppercase tracking-wide">
                                            Equipo
                                        </Typography>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <Typography variant="small" color="blue-gray" className="font-semibold uppercase tracking-wide">
                                            Modelo
                                        </Typography>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <Typography variant="small" color="blue-gray" className="font-semibold uppercase tracking-wide">
                                            Lote
                                        </Typography>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <Typography variant="small" color="blue-gray" className="font-semibold uppercase tracking-wide">
                                            Entrega
                                        </Typography>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <Typography variant="small" color="blue-gray" className="font-semibold uppercase tracking-wide">
                                            Almacén
                                        </Typography>
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        <Typography variant="small" color="blue-gray" className="font-semibold uppercase tracking-wide">
                                            Acciones
                                        </Typography>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredMateriales.map((material, index) => {
                                    const loteInfo = obtenerLoteInfo(material);
                                    const entregaInfo = obtenerEntregaInfo(material);
                                    const modeloInfo = obtenerModeloInfo(material);
                                    const almacenInfo = obtenerAlmacenInfo(material);

                                    return (
                                        <tr
                                            key={material.id}
                                            className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        {material.codigo_interno}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="font-mono text-xs mt-0.5">
                                                        MAC: {material.mac_address}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {modeloInfo.nombre_completo}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="text-xs mt-0.5">
                                                        Tipo: {modeloInfo.tipo_material}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Chip
                                                    size="sm"
                                                    variant="ghost"
                                                    color={loteInfo.numero_lote === 'Sin Lote' ? 'gray' : 'blue'}
                                                    value={loteInfo.numero_lote}
                                                    className="font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                {entregaInfo.numero_entrega ? (
                                                    <Chip
                                                        size="sm"
                                                        variant="ghost"
                                                        color="amber"
                                                        value={`#${entregaInfo.numero_entrega}`}
                                                        className="font-bold"
                                                    />
                                                ) : (
                                                    <Typography variant="small" color="gray">
                                                        Principal
                                                    </Typography>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {almacenInfo.nombre}
                                                    </Typography>
                                                    {almacenInfo.codigo && (
                                                        <Typography variant="small" color="gray" className="text-xs mt-0.5">
                                                            {almacenInfo.codigo}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Tooltip content="Ver detalles" placement="top">
                                                        <IconButton variant="text" color="blue" size="sm">
                                                            <IoEye className="h-4 w-4" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {tipo === 'pendientes_inspeccion' && (
                                                        <Tooltip content="Enviar a laboratorio" placement="top">
                                                            <IconButton
                                                                variant="text"
                                                                color="green"
                                                                size="sm"
                                                                onClick={() => handleEnviarLaboratorio(material.id)}
                                                                disabled={loading}
                                                            >
                                                                <IoPlay className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MaterialesEnLaboratorio;