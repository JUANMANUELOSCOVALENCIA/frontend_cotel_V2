// src/core/almacenes/pages/laboratorio/MaterialesEnLaboratorio.jsx - CÓDIGO COMPLETO CORREGIDO
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
    IoChevronUp,
    IoCalendar,

} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useLaboratorio } from '../../hooks/useLaboratorio';

const MaterialesEnLaboratorio = ({ tipo = 'en_laboratorio' }) => {
    const [materiales, setMateriales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [vistaLotes, setVistaLotes] = useState(false);
    const [lotesAbiertos, setLotesAbiertos] = useState(new Set());

    // ✅ USAR EL HOOK IMPORTADO CORRECTAMENTE
    const {
        loading,
        error,
        getMaterialesPorTipo,
        enviarMaterialLaboratorio,
        operacionMasiva,
        clearError
    } = useLaboratorio();

    const loadMateriales = async () => {
        try {
            const result = await getMaterialesPorTipo(tipo);
            if (result.success) {
                setMateriales(result.data.materiales || result.data || []);
            } else {
                toast.error(result.error);
                setMateriales([]);
            }
        } catch (error) {
            toast.error('Error al cargar materiales');
            setMateriales([]);
        }
    };

    useEffect(() => {
        loadMateriales();
    }, [tipo]);

    useEffect(() => {
        if (materiales.length > 0) {
            const material = materiales[0];
            console.log('📦 MATERIAL COMPLETO:', material);
            console.log('📦 numero_entrega_parcial:', material.numero_entrega_parcial);
            console.log('📦 CAMPOS DISPONIBLES:', Object.keys(material));
            console.log('📦 MODELO INFO:', material.modelo_info);
            console.log('📦 LOTE INFO:', material.lote_info);
            console.log('📦 ALMACEN INFO:', material.almacen_info);
            console.log('📦 ENTREGA INFO:', material.entrega_parcial_info);
        }
    }, [materiales]);

    // ✅ FUNCIONES HELPER CORREGIDAS PARA LA ESTRUCTURA REAL
    const obtenerModeloInfo = (material) => {
        const modeloInfo = material.modelo_info || {};

        return {
            id: modeloInfo.id,
            nombre: modeloInfo.nombre || 'Sin Modelo',
            codigo: modeloInfo.codigo_modelo,
            marca: modeloInfo.marca || 'Sin Marca',
            tipo_material: material.tipo_material_info?.nombre || 'ONU',
            nombre_completo: `${modeloInfo.marca || 'Sin Marca'} ${modeloInfo.nombre || 'Sin Modelo'}`
        };
    };

    const obtenerLoteInfo = (material) => {
        const loteInfo = material.lote_info || {};

        return {
            id: loteInfo.id,
            numero_lote: loteInfo.numero_lote || 'Sin Lote',
            proveedor_info: loteInfo.proveedor_info || {
                id: null,
                nombre_comercial: 'Sin Proveedor'
            },
            fecha_recepcion: loteInfo.fecha_recepcion,
            almacen_destino_info: loteInfo.almacen_destino_info || {
                id: null,
                nombre: 'Sin Almacén',
                codigo: null
            }
        };
    };

    const obtenerAlmacenInfo = (material) => {
        const almacenInfo = material.almacen_info || {};

        return {
            id: almacenInfo.id,
            nombre: almacenInfo.nombre || 'Sin Almacén',
            codigo: almacenInfo.codigo,
            ciudad: almacenInfo.ciudad
        };
    };

    // ✅ FUNCIÓN ROBUSTA PARA OBTENER ENTREGA INFO
    const obtenerEntregaInfo = (material) => {
        // Intentar obtener de diferentes fuentes
        const numeroEntrega =
            material.numero_entrega_parcial !== undefined ? material.numero_entrega_parcial :
                material.entrega_parcial_info?.numero_entrega !== undefined ? material.entrega_parcial_info.numero_entrega :
                    0;

        const esEntregaParcial = numeroEntrega > 0;

        console.log(`🔍 Material ${material.codigo_interno}:`, {
            id: material.id,
            numero_entrega_parcial: material.numero_entrega_parcial,
            entrega_parcial_info: material.entrega_parcial_info,
            numeroEntrega_calculado: numeroEntrega
        });

        return {
            id: material.entrega_parcial_info?.id || null,
            numero_entrega: numeroEntrega,
            fecha_entrega: material.entrega_parcial_info?.fecha_entrega || material.lote_info?.fecha_recepcion,
            cantidad_entregada: material.entrega_parcial_info?.cantidad_entregada || 1,
            descripcion: esEntregaParcial
                ? `Entrega #${numeroEntrega}`
                : 'Recepción Inicial',
            es_parcial: esEntregaParcial,
            observaciones: material.entrega_parcial_info?.observaciones ||
                (esEntregaParcial ? `Entrega parcial #${numeroEntrega}` : 'Recepción inicial del lote')
        };
    };

    const filteredMateriales = materiales.filter(material => {
        const loteInfo = obtenerLoteInfo(material);
        const modeloInfo = obtenerModeloInfo(material);
        const almacenInfo = obtenerAlmacenInfo(material);

        return material.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.gpon_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.serial_manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            modeloInfo.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loteInfo.numero_lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            almacenInfo.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const materialesPorLoteYEntrega = filteredMateriales.reduce((acc, material) => {
        const loteInfo = obtenerLoteInfo(material);
        const entregaInfo = obtenerEntregaInfo(material);

        const loteKey = loteInfo.numero_lote;
        const entregaKey = entregaInfo.numero_entrega;

        if (!acc[loteKey]) {
            acc[loteKey] = {
                lote_info: loteInfo,
                entregas: {},
                total_materiales: 0
            };
        }

        if (!acc[loteKey].entregas[entregaKey]) {
            acc[loteKey].entregas[entregaKey] = {
                entrega_info: entregaInfo,
                materiales: []
            };
        }

        acc[loteKey].entregas[entregaKey].materiales.push(material);
        acc[loteKey].total_materiales += 1;

        return acc;
    }, {});

    // ✅ FUNCIONES DE ENVÍO
    const handleEnviarLaboratorio = async (materialId, codigoEquipo = null) => {
        try {
            const result = await enviarMaterialLaboratorio(materialId);
            if (result.success) {
                toast.success(`Equipo ${codigoEquipo || materialId} enviado a laboratorio`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al enviar a laboratorio');
        }
    };

    const handleEnviarMasivo = async (criterios = {}) => {
        try {
            const result = await operacionMasiva('enviar_pendientes', criterios);

            if (result.success) {
                toast.success(result.data.message || 'Materiales enviados a laboratorio');
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error en envío masivo');
        }
    };

    const handleEnviarLoteCompleto = async (loteId, numeroLote, totalMateriales) => {
        try {
            const result = await operacionMasiva('enviar_lote_completo', {
                lote_id: loteId
            });

            if (result.success) {
                toast.success(`Lote ${numeroLote} completo enviado a laboratorio (${totalMateriales} equipos)`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al enviar lote completo');
        }
    };
    const handleEnviarEntregaEspecifica = async (loteId, numeroEntrega, descripcion, cantidadEquipos) => {
        try {
            console.log('🔍 ENVIANDO ENTREGA ESPECÍFICA:', { loteId, numeroEntrega, cantidadEquipos });

            const result = await operacionMasiva('enviar_entrega_parcial', {
                lote_id: loteId,
                numero_entrega: numeroEntrega
            });

            console.log('🔍 RESULTADO:', result);

            if (result.success) {
                toast.success(`${descripcion} enviada a laboratorio (${result.data.materiales_enviados} equipos)`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('❌ EXCEPCIÓN:', error);
            toast.error('Error al enviar entrega específica');
        }
    };

    const handleEnviarIndividual = async (materialId, codigoEquipo) => {
        try {
            const result = await enviarMaterialLaboratorio(materialId);
            if (result.success) {
                toast.success(`Equipo ${codigoEquipo} enviado a laboratorio`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al enviar equipo individual');
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



    // ✅ AGRUPACIÓN POR LOTE
    const materialesPorLote = filteredMateriales.reduce((acc, material) => {
        const loteInfo = obtenerLoteInfo(material);
        const loteKey = loteInfo.numero_lote;

        if (!acc[loteKey]) {
            acc[loteKey] = {
                lote_info: loteInfo,
                materiales: []
            };
        }

        acc[loteKey].materiales.push(material);
        return acc;
    }, {});

    const lotesReales = Object.keys(materialesPorLote).filter(lote => lote !== 'Sin Lote');
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
                        color="green"
                        variant="gradient"
                        className="flex items-center gap-2"
                        onClick={() => handleEnviarMasivo()}
                        disabled={loading}
                    >
                        <IoSend className="h-4 w-4" />
                        Enviar Todos
                    </Button>

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
                        placeholder="Código, MAC, GPON, D-SN, modelo o lote..."
                        containerProps={{ className: "min-w-0" }}
                    />
                </div>
                <Chip
                    variant="ghost"
                    color={config.color}
                    value={`${filteredMateriales.length} equipos${vistaLotes && tieneLotesReales ? ` en ${lotesReales.length} lotes` : ''}`}
                    className="px-3 py-1.5 font-medium"
                />
            </div>

            {/* Alertas contextuales */}
            {tipo === 'pendientes_inspeccion' && filteredMateriales.length > 0 && (
                <Alert color="blue" className="mb-4 border border-blue-200 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <IoTime className="h-4 w-4 text-blue-600" />
                        <Typography variant="small" className="text-blue-800">
                            <span className="font-medium">📋 Inspección Requerida:</span> Estos equipos nuevos requieren inspección inicial antes de estar disponibles
                            {vistaLotes && tieneLotesReales && ` • Organizados en ${lotesReales.length} lotes`}
                        </Typography>
                    </div>
                </Alert>
            )}

            {/* Contenido principal */}
            {vistaLotes && tipo === 'pendientes_inspeccion' && tieneLotesReales ? (
                <div className="space-y-6">
                    {Object.entries(materialesPorLoteYEntrega)
                        .filter(([loteKey]) => loteKey !== 'Sin Lote')
                        .map(([numeroLote, loteData]) => {
                            const totalEntregas = Object.keys(loteData.entregas).length;
                            const loteAbierto = lotesAbiertos.has(numeroLote);

                            return (
                                <Card key={numeroLote} className="border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-shadow">
                                    {/* ✅ HEADER MEJORADO DEL LOTE */}
                                    <CardHeader
                                        className="pb-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                                        onClick={() => toggleLoteAbierto(numeroLote)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                                                        <IoCube className="h-10 w-10 text-white" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                        {totalEntregas}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Typography variant="h4" color="blue-gray" className="font-bold mb-2">
                                                        {numeroLote}
                                                    </Typography>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                                            <IoGrid className="h-4 w-4 text-blue-600" />
                                                            <span className="font-medium text-blue-800">
                                                    {totalEntregas} entregas
                                                </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                                                            <IoCube className="h-4 w-4 text-green-600" />
                                                            <span className="font-medium text-green-800">
                                                    {loteData.total_materiales} equipos
                                                </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                                                            <IoFlask className="h-4 w-4 text-purple-600" />
                                                            <span className="font-medium text-purple-800 truncate">
                                                    {loteData.lote_info.proveedor_info?.nombre_comercial || 'Sin Proveedor'}
                                                </span>
                                                        </div>
                                                        {loteData.lote_info.fecha_recepcion && (
                                                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg">
                                                                <IoCalendar className="h-4 w-4 text-amber-600" />
                                                                <span className="font-medium text-amber-800">
                                                        {new Date(loteData.lote_info.fecha_recepcion).toLocaleDateString('es-ES')}
                                                    </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Button
                                                    size="lg"
                                                    color="green"
                                                    variant="gradient"
                                                    className="flex items-center gap-3 px-8 py-4 shadow-lg hover:shadow-xl transition-shadow"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEnviarLoteCompleto(
                                                            loteData.lote_info.id,
                                                            numeroLote,
                                                            loteData.total_materiales
                                                        );
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <IoSend className="h-6 w-6" />
                                                    <div className="text-left">
                                                        <div className="font-bold">Enviar Lote Completo</div>
                                                        <div className="text-xs opacity-90">{loteData.total_materiales} equipos</div>
                                                    </div>
                                                </Button>

                                                <div className="flex flex-col items-center">
                                                    <IconButton
                                                        variant="gradient"
                                                        color="blue"
                                                        size="lg"
                                                        className="shadow-lg"
                                                    >
                                                        {loteAbierto ?
                                                            <IoChevronUp className="h-6 w-6" /> :
                                                            <IoChevronDown className="h-6 w-6" />
                                                        }
                                                    </IconButton>
                                                    <Typography variant="small" color="gray" className="mt-1">
                                                        {loteAbierto ? 'Ocultar' : 'Expandir'}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* ✅ CONTENIDO MEJORADO DEL LOTE (ENTREGAS) */}
                                    {loteAbierto && (
                                        <CardBody className="pt-0 px-6 pb-6">
                                            <div className="space-y-6">
                                                <div className="border-t border-gray-200 pt-6">
                                                    <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                                        <IoGitBranch className="h-5 w-5 text-blue-500" />
                                                        Entregas Parciales ({totalEntregas})
                                                    </Typography>
                                                </div>

                                                {Object.entries(loteData.entregas)
                                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                                    .map(([numeroEntrega, entregaData]) => {
                                                        const cantidadEquipos = entregaData.materiales.length;

                                                        return (
                                                            <Card key={numeroEntrega} className="bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-l-amber-500 shadow-md">
                                                                <CardBody className="p-6">
                                                                    {/* ✅ HEADER MEJORADO DE LA ENTREGA */}
                                                                    <div className="flex items-center justify-between mb-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`p-3 rounded-xl shadow-md ${
                                                                                entregaData.entrega_info.es_parcial
                                                                                    ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                                                                                    : 'bg-gradient-to-br from-blue-400 to-blue-500'
                                                                            }`}>
                                                                                <IoGitBranch className="h-6 w-6 text-white" />
                                                                            </div>
                                                                            <div>
                                                                                <Typography variant="h5" color="blue-gray" className="font-bold mb-1">
                                                                                    {entregaData.entrega_info.descripcion}
                                                                                </Typography>
                                                                                <div className="flex items-center gap-6 text-sm">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                                        <span className="font-medium">{cantidadEquipos} equipos</span>
                                                                                    </div>
                                                                                    {entregaData.entrega_info.fecha_entrega && (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <IoCalendar className="h-4 w-4 text-gray-500" />
                                                                                            <span>{new Date(entregaData.entrega_info.fecha_entrega).toLocaleDateString('es-ES')}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    <Chip
                                                                                        size="sm"
                                                                                        variant="gradient"
                                                                                        color={entregaData.entrega_info.es_parcial ? 'amber' : 'blue'}
                                                                                        value={entregaData.entrega_info.es_parcial ? 'Entrega Parcial' : 'Recepción Inicial'}
                                                                                        className="font-bold"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <Button
                                                                            size="lg"
                                                                            color="blue"
                                                                            variant="gradient"
                                                                            className="flex items-center gap-3 px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
                                                                            onClick={() => {
                                                                                // Debug antes de enviar
                                                                                console.log('🔍 MATERIALES DE LA ENTREGA:', {
                                                                                    numero_entrega: numeroEntrega,
                                                                                    materiales: entregaData.materiales.map(m => ({
                                                                                        id: m.id,
                                                                                        codigo: m.codigo_interno,
                                                                                        numero_entrega_parcial: m.numero_entrega_parcial
                                                                                    }))
                                                                                });

                                                                                handleEnviarEntregaEspecifica(
                                                                                    loteData.lote_info.id,
                                                                                    parseInt(numeroEntrega),
                                                                                    entregaData.entrega_info.descripcion,
                                                                                    cantidadEquipos
                                                                                );
                                                                            }}
                                                                            disabled={loading}
                                                                        >
                                                                            <IoPlay className="h-5 w-5" />
                                                                            <div className="text-left">
                                                                                <div className="font-bold">Enviar Entrega</div>
                                                                                <div className="text-xs opacity-90">{cantidadEquipos} equipos</div>
                                                                            </div>
                                                                        </Button>
                                                                    </div>

                                                                    {/* ✅ GRID MEJORADO DE EQUIPOS */}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                                        {entregaData.materiales.map((material) => {
                                                                            const modeloInfo = obtenerModeloInfo(material);

                                                                            return (
                                                                                <Card key={material.id} className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group">
                                                                                    <CardBody className="p-4">
                                                                                        <div className="flex items-start justify-between mb-3">
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <Typography variant="h6" color="blue-gray" className="font-bold truncate mb-1">
                                                                                                    {material.codigo_interno}
                                                                                                </Typography>
                                                                                                <div className="space-y-1">
                                                                                                    <Typography variant="small" color="gray" className="font-mono text-xs truncate bg-gray-100 px-2 py-1 rounded">
                                                                                                        MAC: {material.mac_address}
                                                                                                    </Typography>
                                                                                                    <Typography variant="small" color="gray" className="font-mono text-xs truncate bg-blue-100 px-2 py-1 rounded">
                                                                                                        GPON: {material.gpon_serial}
                                                                                                    </Typography>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                <Tooltip content="Ver detalles">
                                                                                                    <IconButton variant="text" color="blue" size="sm">
                                                                                                        <IoEye className="h-4 w-4" />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                                <Tooltip content="Enviar individual">
                                                                                                    <IconButton
                                                                                                        variant="text"
                                                                                                        color="green"
                                                                                                        size="sm"
                                                                                                        onClick={() => handleEnviarIndividual(material.id, material.codigo_interno)}
                                                                                                        disabled={loading}
                                                                                                    >
                                                                                                        <IoPlay className="h-4 w-4" />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                            </div>
                                                                                        </div>

                                                                                        <Typography variant="small" color="blue-gray" className="font-medium mb-2 truncate">
                                                                                            {modeloInfo.nombre_completo}
                                                                                        </Typography>

                                                                                        <div className="flex items-center justify-between">
                                                                                            <Typography variant="small" color="gray" className="text-xs bg-blue-50 px-2 py-1 rounded">
                                                                                                {material.codigo_item_equipo}
                                                                                            </Typography>
                                                                                            <Chip
                                                                                                size="sm"
                                                                                                variant="gradient"
                                                                                                color="green"
                                                                                                value="Nuevo"
                                                                                                className="text-xs font-bold"
                                                                                            />
                                                                                        </div>
                                                                                    </CardBody>
                                                                                </Card>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* ✅ RESUMEN DE LA ENTREGA */}
                                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                                                            <span>Total equipos en esta entrega: <strong>{cantidadEquipos}</strong></span>
                                                                            <span>Estado: <strong>Pendiente inspección</strong></span>
                                                                        </div>
                                                                    </div>
                                                                </CardBody>
                                                            </Card>
                                                        );
                                                    })}
                                            </div>
                                        </CardBody>
                                    )}
                                </Card>
                            );
                        })}
                </div>
            ) : (
                // ✅ VISTA DE TABLA
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
                                                    <div className="space-y-1 mt-1">
                                                        <Typography variant="small" color="gray" className="font-mono text-xs">
                                                            MAC: {material.mac_address}
                                                        </Typography>
                                                        <Typography variant="small" color="gray" className="font-mono text-xs">
                                                            GPON: {material.gpon_serial}
                                                        </Typography>
                                                    </div>
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
                                                {entregaInfo.es_parcial ? (
                                                    <Chip
                                                        size="sm"
                                                        variant="gradient"
                                                        color="amber"
                                                        value={`#${entregaInfo.numero_entrega}`}
                                                        className="font-bold"
                                                    />
                                                ) : (
                                                    <Chip
                                                        size="sm"
                                                        variant="ghost"
                                                        color="blue"
                                                        value="Inicial"
                                                        className="font-medium"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {almacenInfo.nombre}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="text-xs mt-0.5">
                                                        {almacenInfo.codigo} • {almacenInfo.ciudad}
                                                    </Typography>
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
                                                                onClick={() => handleEnviarLaboratorio(material.id, material.codigo_interno)}
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