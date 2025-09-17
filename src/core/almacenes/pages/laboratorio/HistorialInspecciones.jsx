// src/core/almacenes/pages/laboratorio/HistorialInspecciones.jsx - DISEÑO ORIGINAL MEJORADO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Chip,
    Spinner,
    IconButton,
    Tooltip,
    Alert
} from '@material-tailwind/react';
import {
    IoSearch,
    IoCalendar,
    IoEye,
    IoDownload,
    IoCheckmarkCircle,
    IoClose,
    IoWarning,
    IoTime,
    IoStatsChart,
    IoFilter,
    IoInformationCircle
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useLaboratorio } from '../../hooks/useLaboratorio';

const EstadisticasCard = ({ titulo, valor, icono: Icono, color = "blue", descripcion }) => {
    const colorConfig = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
        green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
        red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
        orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" }
    };

    const config = colorConfig[color] || colorConfig.blue;

    return (
        <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <Typography color="gray" className="text-sm font-medium mb-2 uppercase tracking-wide">
                            {titulo}
                        </Typography>
                        <Typography variant="h3" className={`font-bold ${config.text} mb-1`}>
                            {valor}
                        </Typography>
                        {descripcion && (
                            <Typography color="gray" className="text-sm">
                                {descripcion}
                            </Typography>
                        )}
                    </div>
                    {Icono && (
                        <div className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
                            <Icono className={`h-8 w-8 ${config.text}`} />
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

const DetalleInspeccionDialog = ({ open, onClose, inspeccion }) => {
    if (!inspeccion) return null;

    return (
        <Dialog open={open} handler={onClose} size="lg" className="bg-white">
            <DialogHeader className="flex items-center gap-3 pb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <IoEye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <Typography variant="h5" color="blue-gray">
                        Inspección #{inspeccion.codigo || inspeccion.numero_informe}
                    </Typography>
                    <Typography color="gray" className="text-sm">
                        Detalle completo de la inspección
                    </Typography>
                </div>
            </DialogHeader>

            <DialogBody className="space-y-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-50 border border-gray-200">
                        <CardBody className="p-4">
                            <Typography variant="h6" color="blue-gray" className="mb-3">
                                📋 Información del Equipo
                            </Typography>
                            <div className="space-y-2">
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">Código:</Typography>
                                    <Typography color="blue-gray" className="font-mono">
                                        {inspeccion.material?.codigo_interno || inspeccion.numero_informe}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">Modelo:</Typography>
                                    <Typography color="blue-gray">
                                        {inspeccion.material?.modelo?.marca} {inspeccion.material?.modelo?.nombre || 'N/A'}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">MAC:</Typography>
                                    <Typography color="blue-gray" className="font-mono">
                                        {inspeccion.material?.mac_address || 'N/A'}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">GPON:</Typography>
                                    <Typography color="blue-gray" className="font-mono">
                                        {inspeccion.material?.gpon_serial || 'N/A'}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">Lote:</Typography>
                                    <Typography color="blue-gray">
                                        {inspeccion.material?.lote?.numero_lote || 'N/A'}
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gray-50 border border-gray-200">
                        <CardBody className="p-4">
                            <Typography variant="h6" color="blue-gray" className="mb-3">
                                🔍 Resultado de Inspección
                            </Typography>
                            <div className="space-y-3">
                                <div>
                                    <Chip
                                        size="lg"
                                        color={inspeccion.aprobado ? 'green' : 'red'}
                                        value={inspeccion.aprobado ? 'APROBADO' : 'RECHAZADO'}
                                        className="font-bold"
                                    />
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">Técnico:</Typography>
                                    <Typography color="blue-gray">
                                        {inspeccion.tecnico_revisor || 'No asignado'}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm font-medium">Fecha:</Typography>
                                    <Typography color="blue-gray">
                                        {inspeccion.fecha_inspeccion || inspeccion.created_at ?
                                            new Date(inspeccion.fecha_inspeccion || inspeccion.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'No disponible'
                                        }
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {(inspeccion.observaciones_tecnico || inspeccion.comentarios_adicionales) && (
                    <Card className="bg-amber-50 border border-amber-200">
                        <CardBody className="p-4">
                            <Typography variant="h6" color="amber" className="mb-2 flex items-center gap-2">
                                <IoWarning className="h-5 w-5" />
                                Observaciones Técnicas
                            </Typography>
                            <Typography color="gray" className="text-sm leading-relaxed">
                                {inspeccion.observaciones_tecnico}
                                {inspeccion.comentarios_adicionales && (
                                    <><br/><br/><strong>Comentarios adicionales:</strong> {inspeccion.comentarios_adicionales}</>
                                )}
                            </Typography>
                        </CardBody>
                    </Card>
                )}

                {inspeccion.fallas_detectadas && inspeccion.fallas_detectadas.length > 0 && (
                    <Card className="bg-red-50 border border-red-200">
                        <CardBody className="p-4">
                            <Typography variant="h6" color="red" className="mb-2 flex items-center gap-2">
                                <IoClose className="h-5 w-5" />
                                Fallas Detectadas
                            </Typography>
                            <div className="space-y-1">
                                {inspeccion.fallas_detectadas.map((falla, index) => (
                                    <Typography key={index} color="gray" className="text-sm">
                                        • {falla}
                                    </Typography>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </DialogBody>

            <DialogFooter>
                <Button variant="gradient" color="blue" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

const HistorialInspecciones = () => {
    const [inspecciones, setInspecciones] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [estado, setEstado] = useState('todos');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [selectedInspeccion, setSelectedInspeccion] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        loading,
        error,
        getHistorialInspecciones,
        exportarHistorial,
        clearError
    } = useLaboratorio();

    useEffect(() => {
        loadInspecciones();
    }, []);

    const loadInspecciones = async () => {
        try {
            const filtros = {};
            if (fechaInicio) filtros.fecha_inicio = fechaInicio;
            if (fechaFin) filtros.fecha_fin = fechaFin;
            if (estado !== 'todos') filtros.aprobado = estado === 'aprobado';

            const result = await getHistorialInspecciones(filtros);
            if (result.success) {
                setInspecciones(result.data.inspecciones || result.data || []);
            } else {
                toast.error(result.error);
                setInspecciones([]);
            }
        } catch (error) {
            toast.error('Error al cargar historial de inspecciones');
            setInspecciones([]);
        }
    };

    const handleExportar = async () => {
        try {
            const filtros = {};
            if (fechaInicio) filtros.fecha_inicio = fechaInicio;
            if (fechaFin) filtros.fecha_fin = fechaFin;
            if (estado !== 'todos') filtros.aprobado = estado === 'aprobado';

            const result = await exportarHistorial(filtros);
            if (result.success) {
                toast.success('Historial exportado correctamente');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al exportar historial');
        }
    };

    const handleVerDetalle = (inspeccion) => {
        setSelectedInspeccion(inspeccion);
        setDialogOpen(true);
    };

    const getResultadoConfig = (aprobado) => {
        return aprobado
            ? { color: 'green', icon: IoCheckmarkCircle }
            : { color: 'red', icon: IoClose };
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const estadisticas = {
        total: inspecciones.length,
        aprobados: inspecciones.filter(i => i.aprobado === true).length,
        rechazados: inspecciones.filter(i => i.aprobado === false).length,
        tasa_aprobacion: inspecciones.length > 0 ?
            Math.round((inspecciones.filter(i => i.aprobado === true).length / inspecciones.length) * 100) : 0
    };

    const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
        const cumpleFiltro = !filtro ||
            inspeccion.numero_informe?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.material?.modelo?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.material?.modelo?.marca?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.tecnico_revisor?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.material?.mac_address?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.material?.gpon_serial?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.material?.lote?.numero_lote?.toLowerCase().includes(filtro.toLowerCase());

        const cumpleEstado = estado === 'todos' ||
            (estado === 'aprobado' && inspeccion.aprobado === true) ||
            (estado === 'rechazado' && inspeccion.aprobado === false);

        return cumpleFiltro && cumpleEstado;
    });

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
                <Spinner className="h-12 w-12 text-blue-500" />
                <Typography color="gray" className="mt-4 font-medium">
                    Cargando historial de inspecciones...
                </Typography>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <Alert color="red" className="border border-red-200">
                    <div className="flex items-start gap-3">
                        <IoWarning className="h-5 w-5 mt-0.5" />
                        <div>
                            <Typography variant="small" className="font-bold text-red-800 mb-1">
                                Error al cargar historial
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

            {/* Estadísticas del historial */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EstadisticasCard
                    titulo="Total Inspecciones"
                    valor={estadisticas.total}
                    icono={IoStatsChart}
                    color="blue"
                    descripcion="Historial completo"
                />
                <EstadisticasCard
                    titulo="Aprobados"
                    valor={estadisticas.aprobados}
                    icono={IoCheckmarkCircle}
                    color="green"
                    descripcion="Equipos aprobados"
                />
                <EstadisticasCard
                    titulo="Rechazados"
                    valor={estadisticas.rechazados}
                    icono={IoClose}
                    color="red"
                    descripcion="Equipos con fallas"
                />
                <EstadisticasCard
                    titulo="Tasa de Éxito"
                    valor={`${estadisticas.tasa_aprobacion}%`}
                    icono={IoCheckmarkCircle}
                    color="green"
                    descripcion="Porcentaje de aprobación"
                />
            </div>

            {/* Filtros */}
            <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <IoFilter className="h-5 w-5 text-gray-600" />
                            </div>
                            <Typography variant="h6" color="blue-gray">
                                🔍 Filtros de Búsqueda
                            </Typography>
                        </div>
                        <Button
                            size="sm"
                            variant="outlined"
                            color="gray"
                            onClick={() => {
                                setFiltro('');
                                setEstado('todos');
                                setFechaInicio('');
                                setFechaFin('');
                            }}
                        >
                            Limpiar
                        </Button>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Input
                            label="Buscar..."
                            icon={<IoSearch className="h-4 w-4" />}
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        <Select
                            label="Estado"
                            value={estado}
                            onChange={(val) => setEstado(val)}
                        >
                            <Option value="todos">Todos</Option>
                            <Option value="aprobado">Aprobados</Option>
                            <Option value="rechazado">Rechazados</Option>
                        </Select>
                        <Input
                            type="date"
                            label="Fecha inicio"
                            icon={<IoCalendar className="h-4 w-4" />}
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="Fecha fin"
                            icon={<IoCalendar className="h-4 w-4" />}
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <Button
                        size="sm"
                        color="blue"
                        variant="gradient"
                        onClick={loadInspecciones}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <IoSearch className="h-4 w-4" />
                        Aplicar Filtros
                    </Button>
                </CardBody>
            </Card>

            {/* Lista de inspecciones */}
            <Card className="border border-gray-200">
                <CardHeader className="flex items-center justify-between">
                    <div>
                        <Typography variant="h5" color="blue-gray">
                            📋 Historial de Inspecciones
                        </Typography>
                        <Typography color="gray" className="text-sm mt-1">
                            {inspeccionesFiltradas.length} inspecciones encontradas
                        </Typography>
                    </div>
                    <Button
                        size="sm"
                        color="blue"
                        variant="gradient"
                        className="flex items-center gap-2"
                        onClick={handleExportar}
                        disabled={loading}
                    >
                        <IoDownload className="h-4 w-4" />
                        Exportar Excel
                    </Button>
                </CardHeader>

                <CardBody className="p-0">
                    {inspeccionesFiltradas.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <IoStatsChart className="h-10 w-10 text-gray-400" />
                            </div>
                            <Typography variant="h6" color="gray" className="mb-2">
                                No se encontraron inspecciones
                            </Typography>
                            <Typography variant="small" color="gray">
                                Ajusta los filtros para ver más resultados
                            </Typography>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {inspeccionesFiltradas.map((inspeccion) => {
                                const resultadoConfig = getResultadoConfig(inspeccion.aprobado);
                                const IconoResultado = resultadoConfig.icon;

                                return (
                                    <div
                                        key={inspeccion.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                    <div className="md:col-span-1">
                                                        <Typography variant="h6" color="blue-gray" className="font-bold mb-1 truncate">
                                                            {inspeccion.numero_informe || `INS-${inspeccion.id}`}
                                                        </Typography>
                                                        <Typography color="gray" className="text-sm truncate">
                                                            {inspeccion.material?.modelo?.nombre}
                                                        </Typography>
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <Typography color="gray" className="text-sm font-medium">Marca</Typography>
                                                        <Typography color="blue-gray" className="font-medium truncate">
                                                            {inspeccion.material?.modelo?.marca || 'N/A'}
                                                        </Typography>
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <Typography color="gray" className="text-sm font-medium">MAC Address</Typography>
                                                        <Typography color="blue-gray" className="font-mono text-sm truncate">
                                                            {inspeccion.material?.mac_address || 'N/A'}
                                                        </Typography>
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <Typography color="gray" className="text-sm font-medium">Lote</Typography>
                                                        <Typography color="blue-gray" className="font-medium truncate">
                                                            {inspeccion.material?.lote?.numero_lote || 'N/A'}
                                                        </Typography>
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <Typography color="gray" className="text-sm font-medium">Técnico</Typography>
                                                        <Typography color="blue-gray" className="font-medium truncate">
                                                            {inspeccion.tecnico_revisor || 'No asignado'}
                                                        </Typography>
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <Typography color="gray" className="text-sm font-medium">Fecha</Typography>
                                                        <Typography color="blue-gray" className="font-medium text-sm">
                                                            {formatFecha(inspeccion.fecha_inspeccion)}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Columna de acciones fija */}
                                            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                <Chip
                                                    size="sm"
                                                    variant="gradient"
                                                    color={resultadoConfig.color}
                                                    value={inspeccion.aprobado ? 'APROBADO' : 'RECHAZADO'}
                                                    icon={<IconoResultado className="h-3 w-3" />}
                                                    className="font-bold"
                                                />

                                                <Tooltip content="Ver detalles">
                                                    <IconButton
                                                        variant="text"
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => handleVerDetalle(inspeccion)}
                                                        className="flex-shrink-0"
                                                    >
                                                        <IoEye className="h-4 w-4" />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {(inspeccion.observaciones_tecnico || inspeccion.comentarios_adicionales) && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <Typography color="gray" className="text-sm">
                                                    <strong>Observaciones:</strong> {
                                                    (inspeccion.observaciones_tecnico || inspeccion.comentarios_adicionales).length > 100
                                                        ? `${(inspeccion.observaciones_tecnico || inspeccion.comentarios_adicionales).substring(0, 100)}...`
                                                        : (inspeccion.observaciones_tecnico || inspeccion.comentarios_adicionales)
                                                }
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardBody>
            </Card>

            <DetalleInspeccionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                inspeccion={selectedInspeccion}
            />
        </div>
    );
};

export default HistorialInspecciones;