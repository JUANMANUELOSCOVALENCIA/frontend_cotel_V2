// src/core/almacenes/pages/devoluciones/DevolucionesPage.jsx - SOLUCIÓN DEFINITIVA
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Alert,
    Spinner
} from '@material-tailwind/react';
import {
    IoArrowBack,
    IoAdd,
    IoList,
    IoTime,
    IoCheckmarkCircle,
    IoWarning,
    IoStatsChart,
    IoRefresh,
    IoSend,
    IoBusinessOutline
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Componentes de devoluciones
import DevolucionesList from './DevolucionesList';
import DevolucionesStats from './DevolucionesStats';
import CrearDevolucionDialog from './CrearDevolucionDialog';
import ReingresoMaterialDialog from './ReingresoMaterialDialog';
import DevolucionDetailDialog from './DevolucionDetailDialog';

// Hook personalizado
import { useDevolucion } from '../../hooks/useDevolucion';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';

const DevolucionesPage = () => {
    const {
        devoluciones,
        loading,
        error,
        loadDevoluciones,
        createDevolucion,
        updateEstadoDevolucion,
        permissions
    } = useDevolucion();

    const {
        opciones,
        loading: loadingOpciones
    } = useOpcionesCompletas();

    // Estados locales
    const [activeTab, setActiveTab] = useState('lista');
    const [filtros, setFiltros] = useState({});
    const [selectedDevolucion, setSelectedDevolucion] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        enviadas: 0,
        confirmadas: 0
    });

    // Estados de diálogos
    const [dialogs, setDialogs] = useState({
        create: false,
        detail: false,
        reingreso: false
    });

    useEffect(() => {
        loadDevoluciones();
    }, [loadDevoluciones]);

    useEffect(() => {
        if (devoluciones.length > 0) {
            calculateStats();
        }
    }, [devoluciones]);

    const calculateStats = () => {
        const total = devoluciones.length;
        const pendientes = devoluciones.filter(d => d.estado_info?.codigo === 'PENDIENTE').length;
        const enviadas = devoluciones.filter(d => d.estado_info?.codigo === 'ENVIADO').length;
        const confirmadas = devoluciones.filter(d => d.estado_info?.codigo === 'CONFIRMADO').length;

        setStats({ total, pendientes, enviadas, confirmadas });
    };

    const handleCreateDevolucion = () => {
        setDialogs({ ...dialogs, create: true });
    };

    const handleViewDevolucion = (devolucion) => {
        setSelectedDevolucion(devolucion);
        setDialogs({ ...dialogs, detail: true });
    };

    const handleReingresoMaterial = (devolucion) => {
        setSelectedDevolucion(devolucion);
        setDialogs({ ...dialogs, reingreso: true });
    };

    const closeDialog = (dialogName) => {
        setDialogs({ ...dialogs, [dialogName]: false });
        if (dialogName !== 'create') {
            setSelectedDevolucion(null);
        }
    };

    const handleDialogSuccess = async (action) => {
        closeDialog(action === 'create' ? 'create' : action === 'detail' ? 'detail' : 'reingreso');
        await loadDevoluciones();

        if (action === 'create') {
            toast.success('Devolución creada correctamente');
        } else if (action === 'reingreso') {
            toast.success('Reingreso registrado correctamente');
        }
    };

    const tabs = [
        { value: 'lista', label: 'Devoluciones', icon: IoList },
        { value: 'pendientes', label: 'Pendientes', icon: IoTime },
        { value: 'enviadas', label: 'Enviadas', icon: IoSend },
        { value: 'estadisticas', label: 'Estadísticas', icon: IoStatsChart }
    ];

    if (loadingOpciones) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
                <Typography color="gray" className="ml-2">
                    Cargando configuración...
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <Typography variant="h4" color="blue-gray" className="truncate">
                        🔄 Gestión de Devoluciones
                    </Typography>
                    <Typography color="gray" className="mt-1">
                        Devoluciones de equipos defectuosos a proveedores y reingresos
                    </Typography>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {permissions?.canCreate && (
                        <Button
                            color="red"
                            className="flex items-center gap-2 whitespace-nowrap"
                            onClick={handleCreateDevolucion}
                        >
                            <IoArrowBack className="h-5 w-5" />
                            Nueva Devolución
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        color="blue-gray"
                        className="flex items-center gap-2 whitespace-nowrap"
                        onClick={loadDevoluciones}
                    >
                        <IoRefresh className="h-5 w-5" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <Typography color="gray" className="mb-1 text-sm font-medium">
                                    Total Devoluciones
                                </Typography>
                                <Typography variant="h4" color="blue-gray" className="truncate">
                                    {stats.total}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50 flex-shrink-0">
                                <IoList className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <Typography color="gray" className="mb-1 text-sm font-medium">
                                    Pendientes
                                </Typography>
                                <Typography variant="h4" color="amber" className="truncate">
                                    {stats.pendientes}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-amber-50 flex-shrink-0">
                                <IoTime className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <Typography color="gray" className="mb-1 text-sm font-medium">
                                    Enviadas
                                </Typography>
                                <Typography variant="h4" color="blue" className="truncate">
                                    {stats.enviadas}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50 flex-shrink-0">
                                <IoSend className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <Typography color="gray" className="mb-1 text-sm font-medium">
                                    Confirmadas
                                </Typography>
                                <Typography variant="h4" color="green" className="truncate">
                                    {stats.confirmadas}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-green-50 flex-shrink-0">
                                <IoCheckmarkCircle className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Alertas */}
            {error && (
                <div className="mb-6">
                    <Alert color="red" className="flex items-center gap-3">
                        <IoWarning className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{error}</span>
                    </Alert>
                </div>
            )}

            {/* TABS - Completamente aislados */}
            <div className="w-full" style={{ position: 'relative', zIndex: 50 }}>
                <Card className="border border-gray-200 shadow-lg">
                    <CardHeader
                        floated={false}
                        shadow={false}
                        className="rounded-t-lg border-b border-gray-200 p-0"
                        style={{ position: 'relative', zIndex: 51 }}
                    >
                        <div
                            className="grid grid-cols-2 lg:grid-cols-4 bg-gray-50"
                            style={{ position: 'relative', zIndex: 52 }}
                        >
                            {tabs.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setActiveTab(value)}
                                    className={`
                                        px-4 py-4 flex items-center justify-center gap-2 
                                        border-r border-gray-200 last:border-r-0
                                        transition-all duration-200 hover:bg-gray-100
                                        ${activeTab === value
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }
                                    `}
                                    style={{ position: 'relative', zIndex: 53 }}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm lg:text-base font-medium">
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardBody className="p-6">
                        <div className="min-h-96">
                            {activeTab === 'lista' && (
                                <DevolucionesList
                                    devoluciones={devoluciones}
                                    loading={loading}
                                    onView={handleViewDevolucion}
                                    onReingreso={handleReingresoMaterial}
                                    permissions={permissions}
                                    filtros={filtros}
                                    setFiltros={setFiltros}
                                />
                            )}

                            {activeTab === 'pendientes' && (
                                <DevolucionesList
                                    devoluciones={devoluciones.filter(d => d.estado_info?.codigo === 'PENDIENTE')}
                                    loading={loading}
                                    onView={handleViewDevolucion}
                                    onReingreso={handleReingresoMaterial}
                                    permissions={permissions}
                                    showFilters={false}
                                    title="📋 Devoluciones Pendientes"
                                    subtitle="Devoluciones que requieren ser enviadas al proveedor"
                                />
                            )}

                            {activeTab === 'enviadas' && (
                                <DevolucionesList
                                    devoluciones={devoluciones.filter(d => d.estado_info?.codigo === 'ENVIADO')}
                                    loading={loading}
                                    onView={handleViewDevolucion}
                                    onReingreso={handleReingresoMaterial}
                                    permissions={permissions}
                                    showFilters={false}
                                    title="📤 Devoluciones Enviadas"
                                    subtitle="Devoluciones enviadas esperando respuesta del proveedor"
                                />
                            )}

                            {activeTab === 'estadisticas' && (
                                <DevolucionesStats
                                    devoluciones={devoluciones}
                                    stats={stats}
                                />
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Diálogos */}
            <CrearDevolucionDialog
                open={dialogs.create}
                onClose={() => closeDialog('create')}
                opciones={opciones}
                onSuccess={() => handleDialogSuccess('create')}
            />

            <DevolucionDetailDialog
                open={dialogs.detail}
                onClose={() => closeDialog('detail')}
                devolucion={selectedDevolucion}
                opciones={opciones}
                onSuccess={() => handleDialogSuccess('detail')}
                onReingreso={handleReingresoMaterial}
            />

            <ReingresoMaterialDialog
                open={dialogs.reingreso}
                onClose={() => closeDialog('reingreso')}
                devolucion={selectedDevolucion}
                opciones={opciones}
                onSuccess={() => handleDialogSuccess('reingreso')}
            />
        </div>
    );
};

export default DevolucionesPage;