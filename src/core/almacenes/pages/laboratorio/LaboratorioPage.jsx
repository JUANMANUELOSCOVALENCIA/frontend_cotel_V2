// src/core/almacenes/pages/laboratorio/LaboratorioPage.jsx - SIMPLIFICADO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Alert,
    Spinner,
    Breadcrumbs
} from '@material-tailwind/react';
import {
    IoFlask,
    IoCheckmarkCircle,
    IoWarning,
    IoTime,
    IoStatsChart,
    IoCube,
    IoList,
    IoRefresh,
    IoHome,
    IoInformationCircle
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Componentes y hooks
import MaterialesEnLaboratorio from './MaterialesEnLaboratorio.jsx';
import InspeccionDetalle from './InspeccionDetalle.jsx';
import { useLaboratorio } from '../../hooks/useLaboratorio';
import Permission from '../../../../core/permissions/components/Permission.jsx';

const LaboratorioPage = () => {
    const [activeTab, setActiveTab] = useState('pendientes');
    const [dashboardData, setDashboardData] = useState(null);

    const {
        loading,
        error,
        getDashboard,
        clearError
    } = useLaboratorio();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const result = await getDashboard();
            if (result.success) {
                setDashboardData(result.data);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            toast.error('Error al cargar dashboard de laboratorio');
        }
    };

    // Configuración de tabs simplificada
    const tabs = [
        {
            value: 'pendientes',
            label: 'Pendientes',
            icon: IoTime,
            badge: dashboardData?.resumen?.pendientes_inspeccion || null,
            color: 'amber',
            permissions: [{ recurso: 'almacenes', accion: 'leer' }]

        },
        {
            value: 'en_proceso',
            label: 'En Proceso',
            icon: IoFlask,
            badge: dashboardData?.resumen?.en_laboratorio_actual || null,
            color: 'blue'
        },
        {
            value: 'inspeccion',
            label: 'Nueva Inspección',
            icon: IoCheckmarkCircle,
            badge: null,
            color: 'green',
            permissions: [{ recurso: 'laboratorio', accion: 'crear' }]
        }
    ];

    if (loading && !dashboardData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                    <Spinner className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <Typography color="gray" className="text-center font-medium">
                        Cargando laboratorio de calidad...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 space-y-6">
                {/* Breadcrumb y Header */}
                <div className="space-y-4">
                    <Breadcrumbs className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                        <a href="#" className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                            <IoHome className="h-4 w-4" />
                            Almacenes
                        </a>
                        <span>Laboratorio</span>
                    </Breadcrumbs>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                                <IoFlask className="h-10 w-10 text-blue-500" />
                            </div>
                            <div>
                                <Typography variant="h3" color="blue-gray" className="mb-2">
                                    Laboratorio de Calidad
                                </Typography>
                                <Typography color="gray" className="text-lg">
                                    Control de calidad e inspección de equipos ONUs
                                </Typography>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="gradient"
                                color="blue"
                                className="flex items-center gap-2"
                                onClick={loadDashboard}
                                disabled={loading}
                            >
                                <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Error handling */}
                {error && (
                    <Alert color="red" className="border border-red-200">
                        <div className="flex items-start gap-3">
                            <IoWarning className="h-5 w-5 mt-0.5" />
                            <div>
                                <Typography variant="small" className="font-bold text-red-800 mb-1">
                                    Error al cargar datos
                                </Typography>
                                <Typography variant="small" className="text-red-700">
                                    {error}
                                </Typography>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Alertas importantes */}
                {dashboardData?.alertas && dashboardData.alertas.length > 0 && (
                    <div className="space-y-2">
                        {dashboardData.alertas.map((alerta, index) => (
                            alerta && (
                                <Alert
                                    key={index}
                                    color="amber"
                                    className="border border-amber-200 bg-amber-50/80 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <IoInformationCircle className="h-4 w-4 text-amber-600" />
                                        <Typography variant="small" className="text-amber-800 font-medium">
                                            {alerta}
                                        </Typography>
                                    </div>
                                </Alert>
                            )
                        ))}
                    </div>
                )}

                {/* Tabs customizados */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    {/* Header de Tabs customizado */}
                    {/* Header de Tabs customizado */}
                    <div className="border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                        <div className="flex flex-wrap gap-1 p-2">
                            {tabs.map((tab) => {
                                const { value, label, icon: Icon, badge, color, permissions } = tab;

                                return (
                                    <Permission key={value} permissions={permissions}>
                                        <button
                                            key={value}
                                            onClick={() => setActiveTab(value)}
                                            className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                            ${activeTab === value
                                                ? 'bg-white shadow-sm text-blue-600 border border-blue-200'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                            }
                        `}
                                        >
                                            <Icon className={`h-4 w-4 ${activeTab === value ? 'text-blue-500' : 'text-gray-500'}`} />
                                            <span>{label}</span>
                                            {badge && badge > 0 && (
                                                <span className={`
                                inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] h-5
                                ${activeTab === value
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-red-500 text-white'
                                                }
                            `}>
                                {badge}
                            </span>
                                            )}
                                        </button>
                                    </Permission>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido de Tabs */}
                    <div className="p-6">
                        {activeTab === 'pendientes' && (
                            <Permission permissions={[{ recurso: 'almacenes', accion: 'leer' }]}>
                                <MaterialesEnLaboratorio tipo="pendientes_inspeccion" />
                            </Permission>
                        )}

                        {activeTab === 'en_proceso' && (
                                <MaterialesEnLaboratorio tipo="en_laboratorio" />
                        )}

                        {activeTab === 'inspeccion' && (
                            <Permission permissions={[{ recurso: 'laboratorio', accion: 'crear' }]}>
                                <InspeccionDetalle />
                            </Permission>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaboratorioPage;