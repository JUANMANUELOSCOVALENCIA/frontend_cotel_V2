// src/core/almacenes/pages/laboratorio/LaboratorioStats.jsx - NUEVO
import React from 'react';
import {
    Card,
    CardBody,
    Typography,
    Progress,
    Alert,
    Chip
} from '@material-tailwind/react';
import {
    IoFlask,
    IoCheckmarkCircle,
    IoWarning,
    IoTime,
    IoCube,
    IoStatsChart,
    IoTrendingUp,
    IoTrendingDown
} from 'react-icons/io5';

const LaboratorioStats = ({ data, detailed = false }) => {
    if (!data) return null;

    const { resumen, resultados_recientes } = data;

    const getEfficiencyColor = (percentage) => {
        if (percentage >= 90) return 'green';
        if (percentage >= 75) return 'amber';
        return 'red';
    };

    const formatPercentage = (value) => {
        return isNaN(value) ? '0' : value.toFixed(1);
    };

    // Calcular eficiencia
    const eficiencia = resultados_recientes?.total > 0
        ? (resultados_recientes.exitosos / resultados_recientes.total) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    En Laboratorio
                                </Typography>
                                <Typography variant="h4" color="blue-gray">
                                    {resumen?.en_laboratorio_actual || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Equipos actuales
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50">
                                <IoFlask className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Pendientes
                                </Typography>
                                <Typography variant="h4" color="amber-800">
                                    {resumen?.pendientes_inspeccion || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Requieren inspección
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-amber-50">
                                <IoTime className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Procesados (7 días)
                                </Typography>
                                <Typography variant="h4" color="green-800">
                                    {resumen?.procesados_ultima_semana || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Esta semana
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
                                    Eficiencia
                                </Typography>
                                <Typography variant="h4" color={getEfficiencyColor(eficiencia) === 'green' ? 'green-800' : getEfficiencyColor(eficiencia) === 'amber' ? 'amber-800' : 'red-800'}>
                                    {formatPercentage(eficiencia)}%
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Tasa de aprobación
                                </Typography>
                            </div>
                            <div className={`rounded-full p-3 ${getEfficiencyColor(eficiencia) === 'green' ? 'bg-green-50' : getEfficiencyColor(eficiencia) === 'amber' ? 'bg-amber-50' : 'bg-red-50'}`}>
                                <IoStatsChart className={`h-6 w-6 ${getEfficiencyColor(eficiencia) === 'green' ? 'text-green-500' : getEfficiencyColor(eficiencia) === 'amber' ? 'text-amber-500' : 'text-red-500'}`} />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Progreso de eficiencia */}
            <Card>
                <CardBody>
                    <div className="flex items-center justify-between mb-3">
                        <Typography variant="h6" color="blue-gray">
                            📊 Eficiencia de Inspección
                        </Typography>
                        <Chip
                            size="sm"
                            variant="gradient"
                            color={getEfficiencyColor(eficiencia)}
                            value={`${formatPercentage(eficiencia)}% aprobados`}
                        />
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Equipos aprobados</span>
                                <span>{resultados_recientes?.exitosos || 0} / {resultados_recientes?.total || 0}</span>
                            </div>
                            <Progress
                                value={eficiencia}
                                color={getEfficiencyColor(eficiencia)}
                                size="lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <IoCheckmarkCircle className="h-4 w-4 text-green-500" />
                                <span>Aprobados: {resultados_recientes?.exitosos || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <IoWarning className="h-4 w-4 text-red-500" />
                                <span>Rechazados: {resultados_recientes?.defectuosos || 0}</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Alerta de tiempo excesivo */}
            {resumen?.tiempo_excesivo > 0 && (
                <Alert color="amber">
                    <div className="flex items-center gap-2">
                        <IoWarning className="h-5 w-5" />
                        <div>
                            <Typography variant="small" className="font-medium">
                                ⚠️ Atención: {resumen.tiempo_excesivo} equipos llevan más de 15 días en laboratorio
                            </Typography>
                            <Typography variant="small">
                                Revisar equipos con tiempo excesivo para agilizar el proceso
                            </Typography>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Estadísticas detalladas */}
            {detailed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                📈 Tendencias Mensuales
                            </Typography>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <IoTrendingUp className="h-5 w-5 text-green-500" />
                                        <span className="text-sm">Procesados último mes</span>
                                    </div>
                                    <Typography variant="small" className="font-medium">
                                        {resumen?.procesados_ultimo_mes || 0}
                                    </Typography>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <IoTime className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm">Tiempo promedio</span>
                                    </div>
                                    <Typography variant="small" className="font-medium">
                                        ~ 2.5 días
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                🔍 Tipos de Falla Comunes
                            </Typography>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">WiFi 2.4GHz</span>
                                    <Chip size="sm" variant="ghost" color="red" value="45%" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Serie Lógica</span>
                                    <Chip size="sm" variant="ghost" color="amber" value="25%" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Puerto Ethernet</span>
                                    <Chip size="sm" variant="ghost" color="orange" value="20%" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">WiFi 5GHz</span>
                                    <Chip size="sm" variant="ghost" color="blue" value="10%" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default LaboratorioStats;