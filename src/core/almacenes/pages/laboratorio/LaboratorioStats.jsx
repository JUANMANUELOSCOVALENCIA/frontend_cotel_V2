// src/core/almacenes/pages/laboratorio/LaboratorioStats.jsx - LIMPIO
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

const EstadisticasCard = ({
                              titulo = "Sin título",
                              valor = "0",
                              icono: Icono = IoStatsChart,
                              color = "blue",
                              descripcion = "",
                              trend = null
                          }) => {
    const colorConfig = {
        blue: {
            bg: "bg-blue-50",
            text: "text-blue-600",
            border: "border-blue-200",
            icon: "text-blue-500"
        },
        green: {
            bg: "bg-green-50",
            text: "text-green-600",
            border: "border-green-200",
            icon: "text-green-500"
        },
        red: {
            bg: "bg-red-50",
            text: "text-red-600",
            border: "border-red-200",
            icon: "text-red-500"
        },
        amber: {
            bg: "bg-amber-50",
            text: "text-amber-600",
            border: "border-amber-200",
            icon: "text-amber-500"
        },
        orange: {
            bg: "bg-orange-50",
            text: "text-orange-600",
            border: "border-orange-200",
            icon: "text-orange-500"
        }
    };

    const currentColor = colorConfig[color] || colorConfig.blue;

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border border-gray-100">
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <Typography
                            color="gray"
                            className="text-sm font-medium mb-2 uppercase tracking-wide"
                        >
                            {titulo}
                        </Typography>
                        <Typography
                            variant="h3"
                            className={`font-bold ${currentColor.text} mb-1`}
                        >
                            {valor}
                        </Typography>
                        {descripcion && (
                            <Typography color="gray" className="text-sm">
                                {descripcion}
                            </Typography>
                        )}
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
                                {trend.positive ? (
                                    <IoTrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <IoTrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <Typography
                                    variant="small"
                                    color={trend.positive ? "green" : "red"}
                                    className="font-medium"
                                >
                                    {trend.value} {trend.label}
                                </Typography>
                            </div>
                        )}
                    </div>
                    <div className={`p-4 rounded-xl ${currentColor.bg} ${currentColor.border} border`}>
                        <Icono className={`h-8 w-8 ${currentColor.icon}`} />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

const LaboratorioStats = ({ data, detailed = false }) => {
    const resumen = data?.resumen || {};
    const resultados_recientes = data?.resultados_recientes || {};

    const formatPercentage = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? '0.0' : num.toFixed(1);
    };

    const getEfficiencyColor = (percentage) => {
        const num = parseFloat(percentage);
        if (isNaN(num)) return 'gray';
        if (num >= 90) return 'green';
        if (num >= 75) return 'amber';
        return 'red';
    };

    const total = resultados_recientes?.total || 0;
    const exitosos = resultados_recientes?.exitosos || 0;
    const eficiencia = total > 0 ? (exitosos / total) * 100 : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <EstadisticasCard
                    titulo="En Laboratorio"
                    valor={resumen?.en_laboratorio_actual || 0}
                    icono={IoFlask}
                    color="blue"
                    descripcion="Equipos actuales"
                />

                <EstadisticasCard
                    titulo="Pendientes"
                    valor={resumen?.pendientes_inspeccion || 0}
                    icono={IoTime}
                    color="amber"
                    descripcion="Requieren inspección"
                />

                <EstadisticasCard
                    titulo="Procesados"
                    valor={resumen?.procesados_ultima_semana || 0}
                    icono={IoCheckmarkCircle}
                    color="green"
                    descripcion="Esta semana"
                    trend={{
                        positive: true,
                        value: "+12%",
                        label: "vs semana anterior"
                    }}
                />

                <EstadisticasCard
                    titulo="Tasa de Éxito"
                    valor={`${formatPercentage(eficiencia)}%`}
                    icono={IoStatsChart}
                    color={getEfficiencyColor(eficiencia)}
                    descripcion="Equipos aprobados"
                />
            </div>

            <Card className="border border-gray-100">
                <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Typography variant="h5" color="blue-gray" className="mb-1">
                                📊 Eficiencia de Inspección
                            </Typography>
                            <Typography color="gray" className="text-sm">
                                Rendimiento del proceso de calidad
                            </Typography>
                        </div>
                        <Chip
                            size="lg"
                            variant="gradient"
                            color={getEfficiencyColor(eficiencia)}
                            value={`${formatPercentage(eficiencia)}%`}
                            className="px-4 py-2"
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">Equipos procesados</span>
                                <span className="font-bold text-blue-gray-900">
                                    {exitosos} / {total}
                                </span>
                            </div>
                            <Progress
                                value={eficiencia}
                                color={getEfficiencyColor(eficiencia)}
                                size="lg"
                                className="bg-gray-100"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <IoCheckmarkCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <Typography variant="small" color="gray" className="font-medium">
                                        Aprobados
                                    </Typography>
                                    <Typography variant="h6" color="green" className="font-bold">
                                        {exitosos}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <IoWarning className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <Typography variant="small" color="gray" className="font-medium">
                                        Rechazados
                                    </Typography>
                                    <Typography variant="h6" color="red" className="font-bold">
                                        {resultados_recientes?.defectuosos || 0}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {resumen?.tiempo_excesivo > 0 && (
                <Alert color="amber" className="border border-amber-200">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <IoWarning className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <Typography variant="h6" className="text-amber-800 mb-2">
                                ⚠️ Atención Requerida
                            </Typography>
                            <Typography variant="small" className="text-amber-700 mb-1">
                                <strong>{resumen.tiempo_excesivo} equipos</strong> llevan más de 15 días en laboratorio
                            </Typography>
                            <Typography variant="small" className="text-amber-600">
                                Se recomienda revisar estos equipos para acelerar el proceso de inspección
                            </Typography>
                        </div>
                    </div>
                </Alert>
            )}

            {detailed && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border border-gray-100">
                        <CardBody className="p-6">
                            <Typography variant="h6" color="blue-gray" className="mb-6 flex items-center gap-2">
                                <IoTrendingUp className="h-5 w-5 text-green-500" />
                                📈 Tendencias del Mes
                            </Typography>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <IoStatsChart className="h-5 w-5 text-blue-500" />
                                        <span className="font-medium text-blue-900">Procesados este mes</span>
                                    </div>
                                    <Typography variant="h6" className="font-bold text-blue-600">
                                        {resumen?.procesados_ultimo_mes || 0}
                                    </Typography>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <IoTime className="h-5 w-5 text-green-500" />
                                        <span className="font-medium text-green-900">Tiempo promedio</span>
                                    </div>
                                    <Typography variant="h6" className="font-bold text-green-600">
                                        2.5 días
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-gray-100">
                        <CardBody className="p-6">
                            <Typography variant="h6" color="blue-gray" className="mb-6 flex items-center gap-2">
                                <IoWarning className="h-5 w-5 text-amber-500" />
                                🔍 Fallas Más Comunes
                            </Typography>
                            <div className="space-y-3">
                                {[
                                    { tipo: 'WiFi 2.4GHz', porcentaje: 45, color: 'red' },
                                    { tipo: 'Serie Lógica', porcentaje: 25, color: 'amber' },
                                    { tipo: 'Puerto Ethernet', porcentaje: 20, color: 'orange' },
                                    { tipo: 'WiFi 5GHz', porcentaje: 10, color: 'blue' }
                                ].map((falla, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">
                                            {falla.tipo}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`bg-${falla.color}-500 h-2 rounded-full`}
                                                    style={{ width: `${falla.porcentaje}%` }}
                                                />
                                            </div>
                                            <Chip
                                                size="sm"
                                                variant="ghost"
                                                color={falla.color}
                                                value={`${falla.porcentaje}%`}
                                                className="min-w-[50px]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default LaboratorioStats;