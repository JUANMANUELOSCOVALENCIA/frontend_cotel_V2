// src/core/almacenes/pages/laboratorio/MaterialesEnLaboratorio.jsx - CON VISTA POR LOTES RESTAURADA
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
    Spinner,
    Select,
    Option
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
    IoArrowBack,
    IoArrowForward,
    IoPlaySkipBack,
    IoPlaySkipForward
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useLaboratorio } from '../../hooks/useLaboratorio';

const MaterialesEnLaboratorio = ({ tipo = 'en_laboratorio' }) => {
    const [materiales, setMateriales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [vistaLotes, setVistaLotes] = useState(false);
    const [lotesAbiertos, setLotesAbiertos] = useState(new Set());

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

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
                setCurrentPage(1);
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

    // Funciones helper
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

    const obtenerEntregaInfo = (material) => {
        const numeroEntrega =
            material.numero_entrega_parcial !== undefined ? material.numero_entrega_parcial :
                material.entrega_parcial_info?.numero_entrega !== undefined ? material.entrega_parcial_info.numero_entrega :
                    0;

        const esEntregaParcial = numeroEntrega > 0;

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

    // Filtrado
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

    // Agrupación por lote y entrega para vista por lotes
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

    // Paginación para vista tabla
    const totalItems = filteredMateriales.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredMateriales.slice(startIndex, endIndex);

    // Reset página cuando cambia el filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Funciones de navegación
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    // Toggle lote abierto/cerrado
    const toggleLoteAbierto = (loteKey) => {
        const nuevosAbiertos = new Set(lotesAbiertos);
        if (nuevosAbiertos.has(loteKey)) {
            nuevosAbiertos.delete(loteKey);
        } else {
            nuevosAbiertos.add(loteKey);
        }
        setLotesAbiertos(nuevosAbiertos);
    };

    // Funciones de envío
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
            const result = await operacionMasiva('enviar_entrega_parcial', {
                lote_id: loteId,
                numero_entrega: numeroEntrega
            });

            if (result.success) {
                toast.success(`${descripcion} enviada a laboratorio (${result.data.materiales_enviados} equipos)`);
                loadMateriales();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
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

    // Obtener lotes reales (no "Sin Lote")
    const lotesReales = Object.keys(materialesPorLoteYEntrega).filter(lote => lote !== 'Sin Lote');
    const tieneLotesReales = lotesReales.length > 0;

    // Componente de paginación
    const PaginationComponent = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisible = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                    <Typography variant="small" color="gray">
                        Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} equipos
                    </Typography>

                    <div className="w-32">
                        <Select
                            label="Por página"
                            value={itemsPerPage.toString()}
                            onChange={(value) => setItemsPerPage(parseInt(value))}
                        >
                            <Option value="10">10</Option>
                            <Option value="20">20</Option>
                            <Option value="50">50</Option>
                            <Option value="100">100</Option>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <IconButton
                        variant="outlined"
                        color="blue-gray"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                    >
                        <IoPlaySkipBack className="h-4 w-4" />
                    </IconButton>

                    <IconButton
                        variant="outlined"
                        color="blue-gray"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                    >
                        <IoArrowBack className="h-4 w-4" />
                    </IconButton>

                    <div className="flex items-center gap-1">
                        {pageNumbers.map(pageNum => (
                            <IconButton
                                key={pageNum}
                                variant={pageNum === currentPage ? "filled" : "outlined"}
                                color={pageNum === currentPage ? "blue" : "blue-gray"}
                                size="sm"
                                onClick={() => goToPage(pageNum)}
                                className="min-w-[2.5rem]"
                            >
                                {pageNum}
                            </IconButton>
                        ))}
                    </div>

                    <IconButton
                        variant="outlined"
                        color="blue-gray"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <IoArrowForward className="h-4 w-4" />
                    </IconButton>

                    <IconButton
                        variant="outlined"
                        color="blue-gray"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                    >
                        <IoPlaySkipForward className="h-4 w-4" />
                    </IconButton>
                </div>
            </div>
        );
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
                    {/* Toggle vista por lotes - Solo para pendientes */}
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
                        label="Buscar equipos (código, MAC, GPON, modelo o lote)"
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
                /* VISTA POR LOTES - DISEÑO NUEVO */
                <div className="space-y-6">
                    {Object.entries(materialesPorLoteYEntrega)
                        .filter(([loteKey]) => loteKey !== 'Sin Lote')
                        .map(([numeroLote, loteData]) => {
                            const totalEntregas = Object.keys(loteData.entregas).length;
                            const loteAbierto = lotesAbiertos.has(numeroLote);

                            return (
                                <div key={numeroLote} className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                                    {/* HEADER SIMPLE DEL LOTE */}
                                    <div
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
                                        onClick={() => toggleLoteAbierto(numeroLote)}
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* INFORMACIÓN DEL LOTE */}
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-500 p-3 rounded-lg text-white">
                                                    <IoCube className="h-6 w-6" />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-bold text-gray-800">
                                                            {numeroLote}
                                                        </h3>
                                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                {loteData.total_materiales} equipos
                                            </span>
                                                    </div>

                                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                            <span>
                                                <strong>Proveedor:</strong> {loteData.lote_info.proveedor_info?.nombre_comercial || 'Sin Proveedor'}
                                            </span>
                                                        <span>
                                                <strong>Entregas:</strong> {totalEntregas}
                                            </span>
                                                        {loteData.lote_info.fecha_recepcion && (
                                                            <span>
                                                    <strong>Recepción:</strong> {new Date(loteData.lote_info.fecha_recepcion).toLocaleDateString('es-ES')}
                                                </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BOTONES */}
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    color="green"
                                                    variant="gradient"
                                                    size="lg"
                                                    className="flex items-center gap-2"
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
                                                    <IoSend className="h-5 w-5" />
                                                    Enviar Lote Completo
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    color="blue-gray"
                                                    size="lg"
                                                    className="flex items-center gap-2"
                                                >
                                                    {loteAbierto ? (
                                                        <>
                                                            <IoChevronUp className="h-5 w-5" />
                                                            Ocultar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IoChevronDown className="h-5 w-5" />
                                                            Ver Entregas
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONTENIDO EXPANDIBLE - ENTREGAS */}
                                    {loteAbierto && (
                                        <div className="p-6">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <IoGitBranch className="h-5 w-5 text-blue-500" />
                                                Entregas del Lote ({totalEntregas})
                                            </h4>

                                            <div className="space-y-4">
                                                {Object.entries(loteData.entregas)
                                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                                    .map(([numeroEntrega, entregaData]) => {
                                                        const cantidadEquipos = entregaData.materiales.length;

                                                        return (
                                                            <div key={numeroEntrega} className="bg-gray-50 rounded-lg border border-gray-200">
                                                                {/* HEADER DE LA ENTREGA */}
                                                                <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-2 rounded-lg ${
                                                                                entregaData.entrega_info.es_parcial
                                                                                    ? 'bg-amber-500'
                                                                                    : 'bg-blue-500'
                                                                            } text-white`}>
                                                                                <IoGitBranch className="h-4 w-4" />
                                                                            </div>
                                                                            <div>
                                                                                <h5 className="font-semibold text-gray-800">
                                                                                    {entregaData.entrega_info.descripcion}
                                                                                </h5>
                                                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                                    <span>{cantidadEquipos} equipos</span>
                                                                                    {entregaData.entrega_info.fecha_entrega && (
                                                                                        <span>
                                                                                {new Date(entregaData.entrega_info.fecha_entrega).toLocaleDateString('es-ES')}
                                                                            </span>
                                                                                    )}
                                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                                        entregaData.entrega_info.es_parcial
                                                                                            ? 'bg-amber-100 text-amber-700'
                                                                                            : 'bg-blue-100 text-blue-700'
                                                                                    }`}>
                                                                            {entregaData.entrega_info.es_parcial ? 'Parcial' : 'Inicial'}
                                                                        </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <Button
                                                                            color="blue"
                                                                            variant="gradient"
                                                                            size="md"
                                                                            className="flex items-center gap-2"
                                                                            onClick={() => {
                                                                                handleEnviarEntregaEspecifica(
                                                                                    loteData.lote_info.id,
                                                                                    parseInt(numeroEntrega),
                                                                                    entregaData.entrega_info.descripcion,
                                                                                    cantidadEquipos
                                                                                );
                                                                            }}
                                                                            disabled={loading}
                                                                        >
                                                                            <IoPlay className="h-4 w-4" />
                                                                            Enviar Entrega
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* GRID DE EQUIPOS MÁS GRANDE */}
                                                                <div className="p-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                                        {entregaData.materiales.map((material) => {
                                                                            const modeloInfo = obtenerModeloInfo(material);

                                                                            return (
                                                                                <div key={material.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                                                                                    <div className="flex items-start justify-between mb-3">
                                                                                        <div className="flex-1">
                                                                                            <h6 className="font-bold text-gray-800 mb-1">
                                                                                                {material.codigo_interno}
                                                                                            </h6>
                                                                                            <p className="text-sm text-gray-600 mb-1">
                                                                                                {modeloInfo.nombre_completo}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                                                                                    <div className="space-y-2 text-sm">
                                                                                        <div className="bg-gray-100 px-3 py-2 rounded font-mono text-xs">
                                                                                            <strong>MAC:</strong> {material.mac_address}
                                                                                        </div>
                                                                                        <div className="bg-blue-50 px-3 py-2 rounded font-mono text-xs">
                                                                                            <strong>GPON:</strong> {material.gpon_serial}
                                                                                        </div>
                                                                                        {material.serial_manufacturer && (
                                                                                            <div className="bg-green-50 px-3 py-2 rounded font-mono text-xs">
                                                                                                <strong>D_SN:</strong> {material.serial_manufacturer}
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="flex items-center justify-between pt-2">
                                                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                                                                    {material.codigo_item_equipo}
                                                                                </span>
                                                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                                                                                    NUEVO
                                                                                </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )  : (
                /* VISTA DE TABLA */
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
                        <>
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
                                    {currentItems.map((material, index) => {
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

                            {/* Paginación solo para vista tabla */}
                            <PaginationComponent />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default MaterialesEnLaboratorio;