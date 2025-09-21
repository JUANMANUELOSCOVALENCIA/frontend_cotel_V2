// src/core/almacenes/pages/devoluciones/EstadisticasTab.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Alert,
    Progress,
    Chip,
    Select,
    Option
} from '@material-tailwind/react';
import {
    IoStatsChart,
    IoTrendingUp,
    IoTrendingDown,
    IoWarning,
    IoBusinessOutline,
    IoCheckmarkCircle,
    IoTime,
    IoRefresh,
    IoCalendar
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Hooks
import { api } from '../../../../services/api';

const EstadisticasTab = ({ stats, loading: parentLoading }) => {
    const [estadisticas, setEstadisticas] = useState({
        resumen: {
            total_defectuosos: 0,
            total_devueltos: 0,
            total_reingresados: 0,
            pendientes_reposicion: 0
        },
        por_periodo: {
            este_mes: { defectuosos: 0, devueltos: 0, reingresados: 0 },
            mes_anterior: { defectuosos: 0, devueltos: 0, reingresados: 0 }
        },
        por_sector: [],
        por_lote: [],
        tiempos_promedio: {
            tiempo_deteccion_devolucion: 0,
            tiempo_devolucion_reposicion: 0
        },
        tendencias: {
            defectuosos_trend: 0,
            reposicion_trend: 0
        }
    });

    const [loading, setLoading] = useState(false);
    const [periodoFiltro, setPeriodoFiltro] = useState('30'); // días
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadEstadisticas();
    }, [periodoFiltro, refreshKey]);

    const loadEstadisticas = async () => {
        try {
            setLoading(true);

            // Simular endpoint de estadísticas
            const response = await api.get(`/almacenes/devoluciones/estadisticas/?periodo=${periodoFiltro}`);

            if (response.data) {
                setEstadisticas(response.data);
            } else {
                // Datos mock para demostrar la funcionalidad
                setEstadisticas({
                    resumen: {
                        total_defectuosos: 45,
                        total_devueltos: 32,
                        total_reingresados: 28,
                        pendientes_reposicion: 4
                    },
                    por_periodo: {
                        este_mes: { defectuosos: 12, devueltos: 10, reingresados: 8 },
                        mes_anterior: { defectuosos: 15, devueltos: 13, reingresados: 11 }
                    },
                    por_sector: [
                        { sector: 'ORURO CENTRAL', defectuosos: 18, devueltos: 15, reingresados: 12 },
                        { sector: 'ORURO SUR', defectuosos: 12, devueltos: 10, reingresados: 9 },
                        { sector: 'ORURO NORTE', defectuosos: 15, devueltos: 7, reingresados: 7 }
                    ],
                    por_lote: [
                        { lote: 'L20250617-1515', defectuosos: 8, devueltos: 6, reingresados: 5 },
                        { lote: 'L20250618-1200', defectuosos: 12, devueltos: 10, reingresados: 8 },
                        { lote: 'L20250620-0900', defectuosos: 6, devueltos: 4, reingresados: 4 }
                    ],
                    tiempos_promedio: {
                        tiempo_deteccion_devolucion: 2.5,
                        tiempo_devolucion_reposicion: 7.8
                    },
                    tendencias: {
                        defectuosos_trend: -20, // -20% respecto al período anterior
                        reposicion_trend: 15    // +15% respecto al período anterior
                    }
                });
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            // En caso de error, mostrar datos básicos
            setEstadisticas(prev => ({
                ...prev,
                resumen: {
                    total_defectuosos: stats?.defectuosos || 0,
                    total_devueltos: stats?.devueltos || 0,
                    total_reingresados: stats?.reingresados || 0,
                    pendientes_reposicion: (stats?.devueltos || 0) - (stats?.reingresados || 0)
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        toast.success('Estadísticas actualizadas');
    };

    const calcularPorcentaje = (valor, total) => {
        if (total === 0) return 0;
        return Math.round((valor / total) * 100);
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <IoTrendingUp className="h-4 w-4 text-green-500" />;
        if (trend < 0) return <IoTrendingDown className="h-4 w-4 text-red-500" />;
        return <IoTime className="h-4 w-4 text-gray-500" />;
    };

    const getTrendColor = (trend) => {
        if (trend > 0) return 'green';
        if (trend < 0) return 'red';
        return 'gray';
    };

    if (loading || parentLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <Typography color="gray">Cargando estadísticas...</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con filtros */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Typography variant="h6" color="blue-gray">
                    Estadísticas de Devoluciones
                </Typography>

                <div className="flex gap-2">
                    <Select
                        label="Período"
                        value={periodoFiltro}
                        onChange={(value) => setPeriodoFiltro(value)}
                        className="w-40"
                    >
                        <Option value="7">Últimos 7 días</Option>
                        <Option value="30">Últimos 30 días</Option>
                        <Option value="90">Últimos 3 meses</Option>
                        <Option value="365">Último año</Option>
                    </Select>

                    <Button
                        variant="outlined"
                        color="blue"
                        size="sm"
                        onClick={handleRefresh}
                        className="flex items-center gap-1"
                    >
                        <IoRefresh className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-red-200">
                    <CardBody className="text-center">
                        <IoWarning className="mx-auto h-8 w-8 text-red-500 mb-2" />
                        <Typography variant="h4" color="red">
                            {estadisticas.resumen.total_defectuosos}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Total Defectuosos
                        </Typography>
                        {estadisticas.tendencias.defectuosos_trend !== 0 && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                                {getTrendIcon(estadisticas.tendencias.defectuosos_trend)}
                                <Typography
                                    variant="small"
                                    color={getTrendColor(estadisticas.tendencias.defectuosos_trend)}
                                >
                                    {Math.abs(estadisticas.tendencias.defectuosos_trend)}%
                                </Typography>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="border border-amber-200">
                    <CardBody className="text-center">
                        <IoBusinessOutline className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                        <Typography variant="h4" color="amber">
                            {estadisticas.resumen.total_devueltos}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Devueltos a Sector
                        </Typography>
                        <Progress
                            value={calcularPorcentaje(estadisticas.resumen.total_devueltos, estadisticas.resumen.total_defectuosos)}
                            color="amber"
                            className="mt-2"
                        />
                    </CardBody>
                </Card>

                <Card className="border border-green-200">
                    <CardBody className="text-center">
                        <IoCheckmarkCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <Typography variant="h4" color="green">
                            {estadisticas.resumen.total_reingresados}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Reposiciones
                        </Typography>
                        {estadisticas.tendencias.reposicion_trend !== 0 && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                                {getTrendIcon(estadisticas.tendencias.reposicion_trend)}
                                <Typography
                                    variant="small"
                                    color={getTrendColor(estadisticas.tendencias.reposicion_trend)}
                                >
                                    {Math.abs(estadisticas.tendencias.reposicion_trend)}%
                                </Typography>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="border border-blue-200">
                    <CardBody className="text-center">
                        <IoTime className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                        <Typography variant="h4" color="blue">
                            {estadisticas.resumen.pendientes_reposicion}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Pendientes
                        </Typography>
                        {estadisticas.resumen.pendientes_reposicion > 0 && (
                            <Chip
                                size="sm"
                                color="blue"
                                value="Requiere atención"
                                className="mt-2"
                            />
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Tiempos Promedio */}
            <Card>
                <CardHeader floated={false} shadow={false} className="pb-2">
                    <Typography variant="h6" color="blue-gray">
                        Tiempos Promedio de Gestión
                    </Typography>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Typography variant="small" color="gray">
                                    Detección → Devolución
                                </Typography>
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                    {estadisticas.tiempos_promedio.tiempo_deteccion_devolucion} días
                                </Typography>
                            </div>
                            <Progress
                                value={25}
                                color="blue"
                                label="Objetivo: < 3 días"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Typography variant="small" color="gray">
                                    Devolución → Reposición
                                </Typography>
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                    {estadisticas.tiempos_promedio.tiempo_devolucion_reposicion} días
                                </Typography>
                            </div>
                            <Progress
                                value={65}
                                color="green"
                                label="Objetivo: < 10 días"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Estadísticas por Sector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader floated={false} shadow={false} className="pb-2">
                        <Typography variant="h6" color="blue-gray">
                            Por Sector Solicitante
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {estadisticas.por_sector.map((sector, index) => (
                                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {sector.sector}
                                        </Typography>
                                        <div className="flex gap-2">
                                            <Chip size="sm" color="red" value={`${sector.defectuosos} def.`} />
                                            <Chip size="sm" color="amber" value={`${sector.devueltos} dev.`} />
                                            <Chip size="sm" color="green" value={`${sector.reingresados} rep.`} />
                                        </div>
                                    </div>
                                    <Progress
                                        value={calcularPorcentaje(sector.reingresados, sector.defectuosos)}
                                        color="green"
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader floated={false} shadow={false} className="pb-2">
                        <Typography variant="h6" color="blue-gray">
                            Por Lote
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {estadisticas.por_lote.map((lote, index) => (
                                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {lote.lote}
                                        </Typography>
                                        <div className="flex gap-2">
                                            <Chip size="sm" color="red" value={`${lote.defectuosos}`} />
                                            <Chip size="sm" color="amber" value={`${lote.devueltos}`} />
                                            <Chip size="sm" color="green" value={`${lote.reingresados}`} />
                                        </div>
                                    </div>
                                    <Progress
                                        value={calcularPorcentaje(lote.reingresados, lote.defectuosos)}
                                        color="green"
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Comparativa Mensual */}
            <Card>
                <CardHeader floated={false} shadow={false} className="pb-2">
                    <Typography variant="h6" color="blue-gray">
                        Comparativa Mensual
                    </Typography>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <Typography variant="small" color="gray" className="mb-2">
                                Defectuosos
                            </Typography>
                            <div className="flex items-center justify-center gap-2">
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        {estadisticas.por_periodo.este_mes.defectuosos}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Este mes
                                    </Typography>
                                </div>
                                <div className="text-gray-400">vs</div>
                                <div>
                                    <Typography variant="h6" color="gray">
                                        {estadisticas.por_periodo.mes_anterior.defectuosos}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Anterior
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Typography variant="small" color="gray" className="mb-2">
                                Devueltos
                            </Typography>
                            <div className="flex items-center justify-center gap-2">
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        {estadisticas.por_periodo.este_mes.devueltos}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Este mes
                                    </Typography>
                                </div>
                                <div className="text-gray-400">vs</div>
                                <div>
                                    <Typography variant="h6" color="gray">
                                        {estadisticas.por_periodo.mes_anterior.devueltos}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Anterior
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Typography variant="small" color="gray" className="mb-2">
                                Reingresados
                            </Typography>
                            <div className="flex items-center justify-center gap-2">
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        {estadisticas.por_periodo.este_mes.reingresados}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Este mes
                                    </Typography>
                                </div>
                                <div className="text-gray-400">vs</div>
                                <div>
                                    <Typography variant="h6" color="gray">
                                        {estadisticas.por_periodo.mes_anterior.reingresados}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Anterior
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Alertas y Recomendaciones */}
            {estadisticas.resumen.pendientes_reposicion > 5 && (
                <Alert color="amber">
                    <IoWarning className="h-5 w-5" />
                    <div>
                        <Typography variant="small" className="font-medium">
                            Alto número de equipos pendientes de reposición
                        </Typography>
                        <Typography variant="small" className="mt-1">
                            Hay {estadisticas.resumen.pendientes_reposicion} equipos devueltos al sector esperando reposición.
                            Considera hacer seguimiento con los proveedores.
                        </Typography>
                    </div>
                </Alert>
            )}
        </div>
    );
};

export default EstadisticasTab;