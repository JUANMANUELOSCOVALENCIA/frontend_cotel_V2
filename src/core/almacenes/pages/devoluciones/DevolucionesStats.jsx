// src/core/almacenes/pages/devoluciones/DevolucionesStats.jsx - NUEVO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Progress,
    Chip,
    Alert
} from '@material-tailwind/react';
import {
    IoStatsChart,
    IoTrendingUp,
    IoTrendingDown,
    IoTime,
    IoCheckmarkCircle,
    IoWarning,
    IoBusiness
} from 'react-icons/io5';
import { useDevolucion } from '../../hooks/useDevolucion';

const DevolucionesStats = ({ devoluciones, stats }) => {
    const { getEstadisticasDevoluciones } = useDevolucion();
    const [estadisticasDetalladas, setEstadisticasDetalladas] = useState(null);

    useEffect(() => {
        loadEstadisticasDetalladas();
    }, []);

    const loadEstadisticasDetalladas = async () => {
        const result = await getEstadisticasDevoluciones();
        if (result.success) {
            setEstadisticasDetalladas(result.data);
        }
    };

    const calculateEfficiency = () => {
        if (stats.total === 0) return 0;
        return ((stats.confirmadas / stats.total) * 100).toFixed(1);
    };

    const getTopProveedores = () => {
        if (!estadisticasDetalladas?.por_proveedor) return [];
        return estadisticasDetalladas.por_proveedor.slice(0, 5);
    };

    const getMotivosComunes = () => {
        // Analizar motivos más comunes en las devoluciones
        const motivos = {};
        devoluciones.forEach(dev => {
            const motivo = dev.motivo;
            if (motivo) {
                // Extraer palabras clave del motivo
                if (motivo.toLowerCase().includes('wifi')) {
                    motivos['Problemas WiFi'] = (motivos['Problemas WiFi'] || 0) + 1;
                } else if (motivo.toLowerCase().includes('serie')) {
                    motivos['Serie Lógica'] = (motivos['Serie Lógica'] || 0) + 1;
                } else if (motivo.toLowerCase().includes('ethernet')) {
                    motivos['Puerto Ethernet'] = (motivos['Puerto Ethernet'] || 0) + 1;
                } else {
                    motivos['Otros'] = (motivos['Otros'] || 0) + 1;
                }
            }
        });

        return Object.entries(motivos)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4);
    };

    return (
        <div className="space-y-6">
            {/* Indicadores principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <IoStatsChart className="h-8 w-8 text-blue-500" />
                        </div>
                        <Typography variant="h3" color="blue-gray" className="mb-2">
                            {calculateEfficiency()}%
                        </Typography>
                        <Typography color="gray" className="mb-2">
                            Eficiencia de Resolución
                        </Typography>
                        <Progress
                            value={parseFloat(calculateEfficiency())}
                            color="blue"
                            size="sm"
                        />
                        <Typography variant="small" color="gray" className="mt-2">
                            {stats.confirmadas} de {stats.total} devoluciones confirmadas
                        </Typography>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="text-center">
                        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <IoTime className="h-8 w-8 text-amber-500" />
                        </div>
                        <Typography variant="h3" color="blue-gray" className="mb-2">
                            {estadisticasDetalladas?.totales?.tiempo_promedio_respuesta_dias || 0}
                        </Typography>
                        <Typography color="gray" className="mb-2">
                            Días Promedio de Respuesta
                        </Typography>
                        <Typography variant="small" color="gray">
                            Tiempo desde envío hasta confirmación
                        </Typography>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <IoCheckmarkCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <Typography variant="h3" color="blue-gray" className="mb-2">
                            {stats.enviadas}
                        </Typography>
                        <Typography color="gray" className="mb-2">
                            Esperando Respuesta
                        </Typography>
                        <Typography variant="small" color="gray">
                            Devoluciones enviadas al proveedor
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            {/* Distribución por estado */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" color="blue-gray">
                        📊 Distribución por Estado
                    </Typography>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                                <Typography variant="small" color="blue-gray">
                                    Pendientes
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={stats.total > 0 ? (stats.pendientes / stats.total) * 100 : 0}
                                    color="amber"
                                    size="sm"
                                    className="w-32"
                                />
                                <Typography variant="small" color="blue-gray" className="w-12 text-right">
                                    {stats.pendientes}
                                </Typography>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <Typography variant="small" color="blue-gray">
                                    Enviadas
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={stats.total > 0 ? (stats.enviadas / stats.total) * 100 : 0}
                                    color="blue"
                                    size="sm"
                                    className="w-32"
                                />
                                <Typography variant="small" color="blue-gray" className="w-12 text-right">
                                    {stats.enviadas}
                                </Typography>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <Typography variant="small" color="blue-gray">
                                    Confirmadas
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={stats.total > 0 ? (stats.confirmadas / stats.total) * 100 : 0}
                                    color="green"
                                    size="sm"
                                    className="w-32"
                                />
                                <Typography variant="small" color="blue-gray" className="w-12 text-right">
                                    {stats.confirmadas}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Análisis detallado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Typography variant="h6" color="blue-gray">
                            🏢 Top Proveedores con Devoluciones
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        {getTopProveedores().length > 0 ? (
                            <div className="space-y-3">
                                {getTopProveedores().map((proveedor, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IoBusiness className="h-4 w-4 text-gray-400" />
                                            <Typography variant="small" color="blue-gray">
                                                {proveedor.proveedor__nombre_comercial}
                                            </Typography>
                                        </div>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color="red"
                                            value={proveedor.total_devoluciones}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Typography color="gray" className="text-center py-4">
                                No hay datos suficientes
                            </Typography>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <Typography variant="h6" color="blue-gray">
                            🔍 Motivos Más Comunes
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {getMotivosComunes().map(([motivo, cantidad], index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IoWarning className="h-4 w-4 text-red-400" />
                                        <Typography variant="small" color="blue-gray">
                                            {motivo}
                                        </Typography>
                                    </div>
                                    <Chip
                                        size="sm"
                                        variant="ghost"
                                        color="amber"
                                        value={cantidad}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Alertas y recomendaciones */}
            {stats.pendientes > 5 && (
                <Alert color="amber">
                    <IoWarning className="h-5 w-5" />
                    <div>
                        <Typography variant="small" className="font-medium">
                            Alto número de devoluciones pendientes
                        </Typography>
                        <Typography variant="small">
                            Hay {stats.pendientes} devoluciones pendientes de envío. Considera procesar las más antiguas.
                        </Typography>
                    </div>
                </Alert>
            )}

            {parseFloat(calculateEfficiency()) < 50 && stats.total > 10 && (
                <Alert color="red">
                    <IoTrendingDown className="h-5 w-5" />
                    <div>
                        <Typography variant="small" className="font-medium">
                            Baja eficiencia de resolución
                        </Typography>
                        <Typography variant="small">
                            Solo el {calculateEfficiency()}% de las devoluciones han sido confirmadas. Revisar el proceso con proveedores.
                        </Typography>
                    </div>
                </Alert>
            )}

            {parseFloat(calculateEfficiency()) >= 80 && stats.total > 5 && (
                <Alert color="green">
                    <IoTrendingUp className="h-5 w-5" />
                    <div>
                        <Typography variant="small" className="font-medium">
                            Excelente eficiencia de resolución
                        </Typography>
                        <Typography variant="small">
                            El {calculateEfficiency()}% de las devoluciones han sido confirmadas exitosamente.
                        </Typography>
                    </div>
                </Alert>
            )}
        </div>
    );
};

export default DevolucionesStats;