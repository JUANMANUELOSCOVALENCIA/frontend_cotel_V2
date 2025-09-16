// src/core/almacenes/pages/devoluciones/DevolucionesPage.jsx - NUEVO
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <Typography variant="h4" color="blue-gray">
                        🔄 Gestión de Devoluciones
                    </Typography>
                    <Typography color="gray">
                        Devoluciones de equipos defectuosos a proveedores y reingresos
                    </Typography>
                </div>

                <div className="flex items-center gap-3">
                    {permissions?.canCreate && (
                        <Button
                            color="red"
                            className="flex items-center gap-2"
                            onClick={handleCreateDevolucion}
                        >
                            <IoArrowBack className="h-5 w-5" />
                            Nueva Devolución
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        color="blue-gray"
                        className="flex items-center gap-2"
                        onClick={loadDevoluciones}
                    >
                        <IoRefresh className="h-5 w-5" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Total Devoluciones
                                </Typography>
                                <Typography variant="h4" color="blue-gray">
                                    {stats.total}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50">
                                <IoList className="h-6 w-6 text-blue-500" />
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
                                <Typography variant="h4" color="amber">
                                    {stats.pendientes}
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
                                    Enviadas
                                </Typography>
                                <Typography variant="h4" color="blue">
                                    {stats.enviadas}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50">
                                <IoSend className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    Confirmadas
                                </Typography>
                                <Typography variant="h4" color="green">
                                    {stats.confirmadas}
                                </Typography>
                            </div>
                            <div className="rounded-full p-3 bg-green-50">
                                <IoCheckmarkCircle className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Alertas */}
            {error && (
                <Alert color="red">
                    <IoWarning className="h-5 w-5" />
                    {error}
                </Alert>
            )}

            {/* Tabs principales */}
            <Card>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <CardHeader>
                        <TabsHeader>
                            {tabs.map(({ value, label, icon: Icon }) => (
                                <Tab key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </div>
                                </Tab>
                            ))}
                        </TabsHeader>
                    </CardHeader>

                    <CardBody>
                        <TabsBody>
                            <TabPanel value="lista">
                                <DevolucionesList
                                    devoluciones={devoluciones}
                                    loading={loading}
                                    onView={handleViewDevolucion}
                                    onReingreso={handleReingresoMaterial}
                                    permissions={permissions}
                                    filtros={filtros}
                                    setFiltros={setFiltros}
                                />
                            </TabPanel>

                            <TabPanel value="pendientes">
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
                            </TabPanel>

                            <TabPanel value="enviadas">
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
                            </TabPanel>

                            <TabPanel value="estadisticas">
                                <DevolucionesStats
                                    devoluciones={devoluciones}
                                    stats={stats}
                                />
                            </TabPanel>
                        </TabsBody>
                    </CardBody>
                </Tabs>
            </Card>

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