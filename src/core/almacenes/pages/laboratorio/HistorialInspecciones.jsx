// src/core/almacenes/pages/laboratorio/HistorialInspecciones.jsx
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
    Spinner
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
    IoStatsChart
} from 'react-icons/io5';
import { api } from '../../../../services/api';
import { toast } from 'react-hot-toast';

// Componente EstadisticasCard corregido
const EstadisticasCard = ({ titulo, valor, icono: Icono, color = "blue", descripcion }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        red: "bg-red-50 text-red-600 border-red-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200"
    };

    const textColors = {
        blue: "text-blue-600",
        green: "text-green-600",
        red: "text-red-600",
        orange: "text-orange-600"
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <Typography color="gray" className="text-sm font-medium mb-1">
                            {titulo || "Sin título"}
                        </Typography>
                        <Typography variant="h4" className={`font-bold ${textColors[color]} mb-1`}>
                            {valor ?? "0"}
                        </Typography>
                        {descripcion && (
                            <Typography color="gray" className="text-xs">
                                {descripcion}
                            </Typography>
                        )}
                    </div>
                    {Icono && (
                        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                            <Icono className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

// Componente DetalleInspeccionDialog corregido
const DetalleInspeccionDialog = ({ open, onClose, inspeccion }) => {
    if (!inspeccion) return null;

    return (
        <Dialog open={open} handler={onClose} size="lg">
            <DialogHeader className="flex items-center gap-2">
                <IoEye className="h-5 w-5" />
                Detalle de Inspección - {inspeccion.codigo}
            </DialogHeader>
            <DialogBody className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                Información General
                            </Typography>
                            <div className="space-y-2">
                                <div>
                                    <Typography color="gray" className="text-sm">Código:</Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {inspeccion.codigo}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm">Modelo:</Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {inspeccion.modelo}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm">Serie:</Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {inspeccion.serie}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                Estado de Inspección
                            </Typography>
                            <div className="space-y-2">
                                <Chip
                                    color={inspeccion.resultado === 'aprobado' ? 'green' : 'red'}
                                    value={inspeccion.resultado || 'Sin resultado'}
                                    className="w-fit"
                                />
                                <div>
                                    <Typography color="gray" className="text-sm">Técnico:</Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {inspeccion.tecnico || 'No asignado'}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography color="gray" className="text-sm">Fecha:</Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {inspeccion.fecha_inspeccion ?
                                            new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-ES')
                                            : 'No disponible'
                                        }
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>

                    {inspeccion.observaciones && (
                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                Observaciones
                            </Typography>
                            <Typography color="gray">
                                {inspeccion.observaciones}
                            </Typography>
                        </div>
                    )}
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant="outlined" color="blue" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

const HistorialInspecciones = () => {
    const [inspecciones, setInspecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [estado, setEstado] = useState('todos');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [selectedInspeccion, setSelectedInspeccion] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadInspecciones();
    }, []);

    const loadInspecciones = async () => {
        try {
            setLoading(true);
            // const response = await api.get('/almacenes/laboratorio/historial');
            // setInspecciones(response.data);

            // Datos de ejemplo
            const mockData = [
                {
                    id: 1,
                    codigo: "ONU-001-2024",
                    modelo: "GPON-HG8245H",
                    serie: "SN123456789",
                    fecha_inspeccion: "2024-01-15T10:00:00Z",
                    resultado: "aprobado",
                    tecnico: "Juan Pérez",
                    observaciones: "Equipo en excelente estado, todas las pruebas pasaron correctamente."
                },
                {
                    id: 2,
                    codigo: "ONU-002-2024",
                    modelo: "GPON-HG8546M",
                    serie: "SN987654321",
                    fecha_inspeccion: "2024-01-14T14:30:00Z",
                    resultado: "rechazado",
                    tecnico: "María García",
                    observaciones: "Problemas en conectores de fibra, requiere reparación."
                },
                {
                    id: 3,
                    codigo: "ONU-003-2024",
                    modelo: "GPON-HG8245Q",
                    serie: "SN456789123",
                    fecha_inspeccion: "2024-01-13T09:15:00Z",
                    resultado: "aprobado",
                    tecnico: "Carlos López",
                    observaciones: "Revisión rutinaria completada sin observaciones."
                }
            ];

            setInspecciones(mockData);
        } catch (error) {
            console.error('Error al cargar historial:', error);
            toast.error('Error al cargar historial de inspecciones');
            setInspecciones([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerDetalle = (inspeccion) => {
        setSelectedInspeccion(inspeccion);
        setDialogOpen(true);
    };

    const getResultadoColor = (resultado) => {
        const colores = {
            aprobado: "green",
            rechazado: "red",
            pendiente: "orange"
        };
        return colores[resultado] || "gray";
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Estadísticas del historial
    const estadisticas = {
        total: inspecciones.length,
        aprobados: inspecciones.filter(i => i.resultado === 'aprobado').length,
        rechazados: inspecciones.filter(i => i.resultado === 'rechazado').length,
        tasa_aprobacion: inspecciones.length > 0 ?
            Math.round((inspecciones.filter(i => i.resultado === 'aprobado').length / inspecciones.length) * 100) : 0
    };

    const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
        const cumpleFiltro = inspeccion.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
            inspeccion.tecnico?.toLowerCase().includes(filtro.toLowerCase());

        const cumpleEstado = estado === 'todos' || inspeccion.resultado === estado;

        // Filtros de fecha (implementar si es necesario)
        return cumpleFiltro && cumpleEstado;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" color="blue" />
                <Typography color="gray" className="ml-2">
                    Cargando historial...
                </Typography>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas del historial */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    descripcion="Equipos que pasaron"
                />
                <EstadisticasCard
                    titulo="Rechazados"
                    valor={estadisticas.rechazados}
                    icono={IoClose}
                    color="red"
                    descripcion="Equipos que fallaron"
                />
                <EstadisticasCard
                    titulo="Tasa de Aprobación"
                    valor={`${estadisticas.tasa_aprobacion}%`}
                    icono={IoCheckmarkCircle}
                    color="green"
                    descripcion="Porcentaje de éxito"
                />
            </div>

            {/* Filtros */}
            <Card>
                <CardBody className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="Fecha fin"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Lista de inspecciones */}
            <Card>
                <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="blue-gray">
                            Historial de Inspecciones
                        </Typography>
                        <Button
                            size="sm"
                            color="blue"
                            variant="outlined"
                            className="flex items-center gap-2"
                        >
                            <IoDownload className="h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    {inspeccionesFiltradas.length === 0 ? (
                        <div className="text-center py-8">
                            <Typography color="gray" className="mb-2">
                                No se encontraron inspecciones
                            </Typography>
                            <Typography color="gray" className="text-sm">
                                Ajusta los filtros para ver más resultados
                            </Typography>
                        </div>
                    ) : (
                        <div className="space-y-2 p-4">
                            {inspeccionesFiltradas.map((inspeccion) => (
                                <div
                                    key={inspeccion.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div>
                                                <Typography variant="h6" color="blue-gray" className="font-semibold">
                                                    {inspeccion.codigo}
                                                </Typography>
                                                <Typography color="gray" className="text-sm">
                                                    {inspeccion.modelo}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography color="gray" className="text-sm">Serie</Typography>
                                                <Typography color="blue-gray" className="font-medium">
                                                    {inspeccion.serie}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography color="gray" className="text-sm">Técnico</Typography>
                                                <Typography color="blue-gray" className="font-medium">
                                                    {inspeccion.tecnico}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography color="gray" className="text-sm">Fecha</Typography>
                                                <Typography color="blue-gray" className="font-medium">
                                                    {formatFecha(inspeccion.fecha_inspeccion)}
                                                </Typography>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Chip
                                                    color={getResultadoColor(inspeccion.resultado)}
                                                    value={inspeccion.resultado}
                                                    size="sm"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outlined"
                                                    color="blue"
                                                    onClick={() => handleVerDetalle(inspeccion)}
                                                >
                                                    <IoEye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Dialog de detalle */}
            <DetalleInspeccionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                inspeccion={selectedInspeccion}
            />
        </div>
    );
};

export default HistorialInspecciones;