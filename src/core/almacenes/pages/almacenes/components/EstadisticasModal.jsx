import React, { useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button,
    Card,
    CardBody,
    Spinner,
    IconButton,
} from '@material-tailwind/react';
import { IoClose, IoStatsChart, IoLocationOutline, IoArchive } from 'react-icons/io5';
import { useEstadisticasMateriales } from '../../../hooks/useMateriales.js';

const EstadisticasModal = ({ open, onClose, filtros }) => {
    const { estadisticas, loading, error, loadEstadisticas } = useEstadisticasMateriales();

    useEffect(() => {
        if (open) {
            loadEstadisticas(filtros);
        }
    }, [open, filtros, loadEstadisticas]);

    const getEstadoColor = (estadoNombre) => {
        const colorMap = {
            'NUEVO': 'bg-gray-500',
            'DISPONIBLE': 'bg-green-500',
            'RESERVADO': 'bg-amber-500',
            'ASIGNADO': 'bg-blue-500',
            'INSTALADO': 'bg-purple-500',
            'EN_LABORATORIO': 'bg-orange-500',
            'DEFECTUOSO': 'bg-red-500',
            'DEVUELTO_PROVEEDOR': 'bg-gray-400',
            'REINGRESADO': 'bg-cyan-500',
            'DADO_DE_BAJA': 'bg-gray-800'
        };

        return colorMap[estadoNombre] || 'bg-gray-400';
    };

    const EstadisticaCard = ({ title, value, icon: Icon, color = "blue" }) => (
        <Card className={`border-l-4 border-l-${color}-500`}>
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Typography color="blue-gray" className="font-medium">
                            {title}
                        </Typography>
                        <Typography variant="h4" color={color} className="font-bold">
                            {value}
                        </Typography>
                    </div>
                    <Icon className={`h-8 w-8 text-${color}-500`} />
                </div>
            </CardBody>
        </Card>
    );

    const BarChart = ({ data, title }) => {
        const maxValue = Math.max(...Object.values(data));

        return (
            <Card>
                <CardBody>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                        {title}
                    </Typography>
                    <div className="space-y-3">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                                <div className="w-32 text-sm">
                                    <Typography variant="small" color="blue-gray">
                                        {key}
                                    </Typography>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getEstadoColor(key)}`}
                                        style={{
                                            width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-12 text-right">
                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {value}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    };

    const TopList = ({ data, title, icon: Icon }) => (
        <Card>
            <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {title}
                </Typography>
                <div className="space-y-2">
                    {data.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                            <Typography variant="small" color="blue-gray">
                                {item.lote__numero_lote}
                            </Typography>
                            <Typography variant="small" color="blue" className="font-semibold">
                                {item.count} ONUs
                            </Typography>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );

    return (
        <Dialog open={open} handler={onClose} size="xl" className="bg-transparent">
            <Card className="w-full max-w-6xl mx-auto">
                <DialogHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IoStatsChart className="h-6 w-6 text-blue-500" />
                        <Typography variant="h4" color="blue-gray">
                            Estadísticas de ONUs
                        </Typography>
                    </div>
                    <IconButton variant="text" onClick={onClose}>
                        <IoClose className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>

                <DialogBody className="overflow-y-auto max-h-[70vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="h-8 w-8" />
                            <Typography color="gray" className="ml-3">
                                Cargando estadísticas...
                            </Typography>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <Typography color="red">
                                Error al cargar estadísticas: {error}
                            </Typography>
                        </div>
                    ) : estadisticas ? (
                        <div className="space-y-6">
                            {/* Estadísticas generales */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <EstadisticaCard
                                    title="Total ONUs"
                                    value={estadisticas.total}
                                    icon={IoStatsChart}
                                    color="blue"
                                />
                                <EstadisticaCard
                                    title="ONUs Nuevas"
                                    value={estadisticas.nuevos}
                                    icon={IoArchive}
                                    color="green"
                                />
                                <EstadisticaCard
                                    title="ONUs Reingresadas"
                                    value={estadisticas.reingresados}
                                    icon={IoArchive}
                                    color="cyan"
                                />
                            </div>

                            {/* Grid de gráficos */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Estados */}
                                {estadisticas.por_estado && Object.keys(estadisticas.por_estado).length > 0 && (
                                    <BarChart
                                        data={estadisticas.por_estado}
                                        title="Distribución por Estado"
                                    />
                                )}

                                {/* Almacenes */}
                                {estadisticas.por_almacen && Object.keys(estadisticas.por_almacen).length > 0 && (
                                    <Card>
                                        <CardBody>
                                            <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                                <IoLocationOutline className="h-5 w-5" />
                                                Distribución por Almacén
                                            </Typography>
                                            <div className="space-y-3">
                                                {Object.entries(estadisticas.por_almacen).map(([almacen, cantidad]) => (
                                                    <div key={almacen} className="flex items-center justify-between py-2 border-b border-gray-100">
                                                        <Typography variant="small" color="blue-gray">
                                                            {almacen}
                                                        </Typography>
                                                        <Typography variant="small" color="blue" className="font-semibold">
                                                            {cantidad} ONUs
                                                        </Typography>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}
                            </div>

                            {/* Top lotes */}
                            {estadisticas.top_lotes && estadisticas.top_lotes.length > 0 && (
                                <TopList
                                    data={estadisticas.top_lotes}
                                    title="Top 5 Lotes con más ONUs"
                                    icon={IoArchive}
                                />
                            )}

                            {/* Información adicional */}
                            <Card className="border border-blue-100 bg-blue-50">
                                <CardBody>
                                    <Typography variant="h6" color="blue-gray" className="mb-3">
                                        Resumen
                                    </Typography>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Typography color="blue-gray" className="font-medium">
                                                Estado más común:
                                            </Typography>
                                            <Typography color="gray">
                                                {estadisticas.por_estado && Object.keys(estadisticas.por_estado).length > 0
                                                    ? Object.entries(estadisticas.por_estado).reduce((a, b) =>
                                                        estadisticas.por_estado[a[0]] > estadisticas.por_estado[b[0]] ? a : b
                                                    )[0]
                                                    : 'N/A'
                                                }
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography color="blue-gray" className="font-medium">
                                                Almacén con más inventario:
                                            </Typography>
                                            <Typography color="gray">
                                                {estadisticas.por_almacen && Object.keys(estadisticas.por_almacen).length > 0
                                                    ? Object.entries(estadisticas.por_almacen).reduce((a, b) =>
                                                        estadisticas.por_almacen[a[0]] > estadisticas.por_almacen[b[0]] ? a : b
                                                    )[0]
                                                    : 'N/A'
                                                }
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Typography color="gray">
                                No hay datos estadísticos disponibles
                            </Typography>
                        </div>
                    )}
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </Card>
        </Dialog>
    );
};

export default EstadisticasModal;