// src/core/almacenes/pages/laboratorio/LaboratorioPage.jsx - NUEVO
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
    Spinner,
    Progress
} from '@material-tailwind/react';
import {
    IoFlask,
    IoCheckmarkCircle,
    IoWarning,
    IoTime,
    IoStatsChart,
    IoCube,
    IoList,
    IoRefresh
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Componentes de laboratorio
import LaboratorioStats from './LaboratorioStats.jsx';
import MaterialesEnLaboratorio from './MaterialesEnLaboratorio.jsx';
import InspeccionDetalle from './InspeccionDetalle.jsx';
import HistorialInspecciones from './HistorialInspecciones.jsx';
import { api } from '../../../../services/api';

const LaboratorioPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/almacenes/laboratorio/');
            setDashboardData(response.data);
        } catch (error) {
            toast.error('Error al cargar dashboard de laboratorio');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { value: 'dashboard', label: 'Dashboard', icon: IoStatsChart },
        { value: 'pendientes', label: 'Pendientes', icon: IoTime },
        { value: 'en_proceso', label: 'En Proceso', icon: IoFlask },
        { value: 'inspeccion', label: 'Inspección', icon: IoCheckmarkCircle },
        { value: 'historial', label: 'Historial', icon: IoList }
    ];

    if (loading && !dashboardData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
                <Typography color="gray" className="ml-2">
                    Cargando laboratorio...
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
                        🔬 Laboratorio de Calidad
                    </Typography>
                    <Typography color="gray">
                        Control de calidad e inspección de equipos ONUs
                    </Typography>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={loadDashboard}
                    >
                        <IoRefresh className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            {dashboardData && (
                <LaboratorioStats data={dashboardData} />
            )}

            {/* Alertas */}
            {dashboardData?.alertas && dashboardData.alertas.length > 0 && (
                <div className="space-y-2">
                    {dashboardData.alertas.map((alerta, index) => (
                        alerta && (
                            <Alert key={index} color="amber">
                                <IoWarning className="h-5 w-5" />
                                {alerta}
                            </Alert>
                        )
                    ))}
                </div>
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
                            <TabPanel value="dashboard">
                                <LaboratorioStats data={dashboardData} detailed />
                            </TabPanel>

                            <TabPanel value="pendientes">
                                <MaterialesEnLaboratorio tipo="pendientes_inspeccion" />
                            </TabPanel>

                            <TabPanel value="en_proceso">
                                <MaterialesEnLaboratorio tipo="en_laboratorio" />
                            </TabPanel>

                            <TabPanel value="inspeccion">
                                <InspeccionDetalle />
                            </TabPanel>

                            <TabPanel value="historial">
                                <HistorialInspecciones />
                            </TabPanel>
                        </TabsBody>
                    </CardBody>
                </Tabs>
            </Card>
        </div>
    );
};

export default LaboratorioPage;