// src/core/almacenes/pages/laboratorio/HistorialInspecciones.jsx - NUEVO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Spinner,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Progress,
    Badge
} from '@material-tailwind/react';
import {
    IoSearch,
    IoEye,
    IoDownload,
    IoFilter,
    IoCheckmarkCircle,
    IoClose,
    IoTime,
    IoCalendar,
    IoPersonOutline,
    IoStatsChart,
    IoRefresh,
    IoChevronDown,
    IoChevronUp,
    IoDocumentText,
    IoWarning,
    IoTrendingUp,
    IoTrendingDown
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';

const HistorialInspecciones = () => {
    const [inspecciones, setInspecciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        tecnico: '',
        resultado: '',
        material_codigo: ''
    });
    const [estadisticas, setEstadisticas] = useState(null);
    const [selectedInspeccion, setSelectedInspeccion] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showStats, setShowStats] = useState(true);

    useEffect(() => {
        loadInspecciones();
        loadEstadisticas();
    }, []);

    useEffect(() => {
        loadInspecciones();
    }, [filtros]);

    const loadInspecciones = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            // Agregar filtros no vacíos
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/almacenes/laboratorio/inspeccion/?${params.toString()}`);
            setInspecciones(response.data.inspecciones || []);
        } catch (error) {
            toast.error('Error al cargar historial de inspecciones');
        } finally {
            setLoading(false);
        }
    };

    const loadEstadisticas = async () => {
        try {
            const response = await api.get('/almacenes/laboratorio/consultas/?tipo=historial_laboratorio');
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleFiltroChange = (key, value) => {
        setFiltros(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            fecha_desde: '',
            fecha_hasta: '',
            tecnico: '',
            resultado: '',
            material_codigo: ''
        });
    };

    const exportarHistorial = async () => {
        try {
            const params = new URLSearchParams(filtros);
            params.append('export', 'xlsx');

            const response = await api.get(`/almacenes/laboratorio/inspeccion/export/?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `historial_inspecciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Historial exportado correctamente');
        } catch (error) {
            toast.error('Error al exportar historial');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    const getResultadoColor = (aprobado) => {
        return aprobado ? 'green' : 'red';
    };

    const getResultadoIcon = (aprobado) => {
        return aprobado ? IoCheckmarkCircle : IoClose;
    };

    const getFallaDescription = (falla) => {
        const fallaMap = {
            'SERIE_LOGICA_DEFECTUOSA': 'Serie Lógica',
            'WIFI_24_DEFECTUOSO': 'WiFi 2.4GHz',
            'WIFI_5_DEFECTUOSO': 'WiFi 5GHz',
            'PUERTO_ETHERNET_DEFECTUOSO': 'Puerto Ethernet',
            'PUERTO_LAN_DEFECTUOSO': 'Puerto LAN'
        };
        return fallaMap[falla] || falla;
    };

    const EstadisticasCard = ({ estadisticas }) => {
        if (!estadisticas) return null;

        const { estadisticas: stats, periodo } = estadisticas;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Total Procesados
                                </Typography>
                                <Typography variant="h4" color="blue-gray">
                                    {stats?.total_procesados || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {periodo}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50">
                                <IoStatsChart className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Aprobados
                                </Typography>
                                <Typography variant="h4" color="green-800">
                                    {stats?.exitosos || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {stats?.porcentaje_exito || 0}% tasa de éxito
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-green-50">
                                <IoCheckmarkCircle className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Rechazados
                                </Typography>
                                <Typography variant="h4" color="red-800">
                                    {stats?.defectuosos || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {(100 - (stats?.porcentaje_exito || 0)).toFixed(1)}% rechazados
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-red-50">
                                <IoClose className="h-6 w-6 text-red-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Tiempo Promedio
                                </Typography>
                                <Typography variant="h4" color="blue-gray">
                                    {stats?.tiempo_promedio_dias || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    días promedio
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-amber-50">
                                <IoTime className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    };

    const FiltrosPanel = () => (
        <Card className={`transition-all duration-300 ${showFilters ? 'mb-4' : 'mb-2'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <Typography variant="h6" color="blue-gray">
                        🔍 Filtros de Búsqueda
                    </Typography>
                    <Button
                        variant="text"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <IoFilter className="h-4 w-4" />
                        {showFilters ? <IoChevronUp className="h-4 w-4" /> : <IoChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            {showFilters && (
                <CardBody className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Input
                            type="date"
                            label="Fecha Desde"
                            value={filtros.fecha_desde}
                            onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                        />

                        <Input
                            type="date"
                            label="Fecha Hasta"
                            value={filtros.fecha_hasta}
                            onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                        />

                        <Input
                            label="Técnico"
                            value={filtros.tecnico}
                            onChange={(e) => handleFiltroChange('tecnico', e.target.value)}
                            placeholder="Código o nombre"
                        />

                        <Select
                            label="Resultado"
                            value={filtros.resultado}
                            onChange={(value) => handleFiltroChange('resultado', value)}
                        >
                            <Option value="">Todos</Option>
                            <Option value="true">Aprobados</Option>
                            <Option value="false">Rechazados</Option>
                        </Select>

                        <Input
                            label="Código Material"
                            value={filtros.material_codigo}
                            onChange={(e) => handleFiltroChange('material_codigo', e.target.value)}
                            placeholder="EQ-12345678"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outlined" size="sm" onClick={limpiarFiltros}>
                            Limpiar
                        </Button>
                        <Button color="blue" size="sm" onClick={loadInspecciones}>
                            Aplicar Filtros
                        </Button>
                    </div>
                </CardBody>
            )}
        </Card>
    );

    const DetalleInspeccionDialog = () => (
        <Dialog open={showDetail} handler={() => setShowDetail(false)} size="lg">
            <DialogHeader className="flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    📋 Detalle de Inspección
                </Typography>
                <IconButton variant="text" color="gray" onClick={() => setShowDetail(false)}>
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                {selectedInspeccion && (
                    <div className="space-y-6">
                        {/* Información general */}
                        <Card>
                            <CardBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Número de Informe
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {selectedInspeccion.numero_informe}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Material
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {selectedInspeccion.material?.codigo_interno}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            MAC: {selectedInspeccion.material?.mac_address}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Fecha de Inspección
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {formatDate(selectedInspeccion.fecha_inspeccion)}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Técnico Revisor
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {selectedInspeccion.tecnico_revisor || 'No especificado'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Tiempo de Inspección
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {formatDuration(selectedInspeccion.tiempo_inspeccion_minutos)}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Resultado
                                        </Typography>
                                        <Chip
                                            size="sm"
                                            variant="gradient"
                                            color={getResultadoColor(selectedInspeccion.resultados?.aprobado)}
                                            value={selectedInspeccion.resultados?.aprobado ? 'APROBADO' : 'RECHAZADO'}
                                            icon={React.createElement(getResultadoIcon(selectedInspeccion.resultados?.aprobado), {
                                                className: "h-4 w-4"
                                            })}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Resultados de pruebas */}
                        <Card>
                            <CardHeader>
                                <Typography variant="h6" color="blue-gray">
                                    🧪 Resultados de Pruebas
                                </Typography>
                            </CardHeader>
                            <CardBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <span>Serie Lógica</span>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color={selectedInspeccion.resultados?.serie_logica_ok ? 'green' : 'red'}
                                            value={selectedInspeccion.resultados?.serie_logica_ok ? 'OK' : 'FALLA'}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <span>WiFi 2.4GHz</span>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color={selectedInspeccion.resultados?.wifi_24_ok ? 'green' : 'red'}
                                            value={selectedInspeccion.resultados?.wifi_24_ok ? 'OK' : 'FALLA'}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <span>WiFi 5GHz</span>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color={selectedInspeccion.resultados?.wifi_5_ok ? 'green' : 'red'}
                                            value={selectedInspeccion.resultados?.wifi_5_ok ? 'OK' : 'FALLA'}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <span>Puerto Ethernet</span>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color={selectedInspeccion.resultados?.puerto_ethernet_ok ? 'green' : 'red'}
                                            value={selectedInspeccion.resultados?.puerto_ethernet_ok ? 'OK' : 'FALLA'}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <span>Puerto LAN</span>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color={selectedInspeccion.resultados?.puerto_lan_ok ? 'green' : 'red'}
                                            value={selectedInspeccion.resultados?.puerto_lan_ok ? 'OK' : 'FALLA'}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Fallas detectadas */}
                        {selectedInspeccion.fallas_detectadas && selectedInspeccion.fallas_detectadas.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <Typography variant="h6" color="red">
                                        ⚠️ Fallas Detectadas
                                    </Typography>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedInspeccion.fallas_detectadas.map((falla, index) => (
                                            <Chip
                                                key={index}
                                                size="sm"
                                                variant="outlined"
                                                color="red"
                                                value={getFallaDescription(falla)}
                                            />
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* Observaciones */}
                        {(selectedInspeccion.observaciones_tecnico || selectedInspeccion.comentarios_adicionales) && (
                            <Card>
                                <CardHeader>
                                    <Typography variant="h6" color="blue-gray">
                                        📝 Observaciones
                                    </Typography>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    {selectedInspeccion.observaciones_tecnico && (
                                        <div>
                                            <Typography variant="small" color="gray" className="mb-2 font-medium">
                                                Observaciones del Técnico:
                                            </Typography>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <Typography variant="small" color="blue-gray">
                                                    {selectedInspeccion.observaciones_tecnico}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedInspeccion.comentarios_adicionales && (
                                        <div>
                                            <Typography variant="small" color="gray" className="mb-2 font-medium">
                                                Comentarios Adicionales:
                                            </Typography>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <Typography variant="small" color="blue-gray">
                                                    {selectedInspeccion.comentarios_adicionales}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )}
                    </div>
                )}
            </DialogBody>

            <DialogFooter>
                <Button variant="text" color="gray" onClick={() => setShowDetail(false)}>
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <Typography variant="h6" color="blue-gray">
                        📋 Historial de Inspecciones
                    </Typography>
                    <Typography variant="small" color="gray">
                        Registro completo de todas las inspecciones realizadas
                    </Typography>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outlined"
                        size="sm"
                        color="green"
                        className="flex items-center gap-2"
                        onClick={exportarHistorial}
                    >
                        <IoDownload className="h-4 w-4" />
                        Exportar
                    </Button>
                    <Button
                        variant="outlined"
                        size="sm"
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => setShowStats(!showStats)}
                    >
                        <IoStatsChart className="h-4 w-4" />
                        {showStats ? 'Ocultar' : 'Mostrar'} Stats
                    </Button>
                    <Button
                        variant="outlined"
                        size="sm"
                        color="blue-gray"
                        className="flex items-center gap-2"
                        onClick={loadInspecciones}
                    >
                        <IoRefresh className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            {showStats && <EstadisticasCard estadisticas={estadisticas} />}

            {/* Filtros */}
            <FiltrosPanel />

            {/* Lista de inspecciones */}
            <Card>
                <CardBody className="px-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Spinner className="h-8 w-8" />
                            <Typography color="gray" className="ml-2">
                                Cargando historial...
                            </Typography>
                        </div>
                    ) : inspecciones.length === 0 ? (
                        <div className="text-center py-8">
                            <IoDocumentText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <Typography color="gray" className="mb-2">
                                No hay inspecciones registradas
                            </Typography>
                            <Typography variant="small" color="gray">
                                Las inspecciones aparecerán aquí una vez completadas
                            </Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto text-left">
                                <thead>
                                <tr>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Informe
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Material
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Fecha
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Técnico
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Resultado
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Tiempo
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Acciones
                                        </Typography>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {inspecciones.map((inspeccion) => (
                                    <tr key={inspeccion.id} className="even:bg-blue-gray-50/50">
                                        <td className="p-4">
                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {inspeccion.numero_informe}
                                                </Typography>
                                                {inspeccion.fallas_detectadas && inspeccion.fallas_detectadas.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <IoWarning className="h-3 w-3 text-red-500" />
                                                        <Typography variant="small" color="red">
                                                            {inspeccion.fallas_detectadas.length} falla(s)
                                                        </Typography>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {inspeccion.material?.codigo_interno}
                                                </Typography>
                                                <Typography variant="small" color="gray" className="opacity-70 font-mono">
                                                    {inspeccion.material?.mac_address}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <IoCalendar className="h-4 w-4 text-gray-400" />
                                                <Typography variant="small" color="blue-gray">
                                                    {formatDate(inspeccion.fecha_inspeccion)}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <IoPersonOutline className="h-4 w-4 text-gray-400" />
                                                <Typography variant="small" color="blue-gray">
                                                    {inspeccion.tecnico_revisor || 'N/A'}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Chip
                                                size="sm"
                                                variant="gradient"
                                                color={getResultadoColor(inspeccion.resultados?.aprobado)}
                                                value={inspeccion.resultados?.aprobado ? 'APROBADO' : 'RECHAZADO'}
                                                icon={React.createElement(getResultadoIcon(inspeccion.resultados?.aprobado), {
                                                    className: "h-3 w-3"
                                                })}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <IoTime className="h-4 w-4 text-gray-400" />
                                                <Typography variant="small" color="blue-gray">
                                                    {formatDuration(inspeccion.tiempo_inspeccion_minutos)}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Tooltip content="Ver detalle completo">
                                                <IconButton
                                                    variant="text"
                                                    color="blue"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedInspeccion(inspeccion);
                                                        setShowDetail(true);
                                                    }}
                                                >
                                                    <IoEye className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Resumen al final */}
            {inspecciones.length > 0 && (
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <Typography variant="small" color="gray">
                                Total de inspecciones mostradas: {inspecciones.length}
                            </Typography>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <IoCheckmarkCircle className="h-4 w-4 text-green-500" />
                                    <Typography variant="small" color="gray">
                                        {inspecciones.filter(i => i.resultados?.aprobado).length} aprobados
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IoClose className="h-4 w-4 text-red-500" />
                                    <Typography variant="small" color="gray">
                                        {inspecciones.filter(i => !i.resultados?.aprobado).length} rechazados
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Dialog de detalle */}
            <DetalleInspeccionDialog />
        </div>
    );
};

export default HistorialInspecciones;