// src/core/almacenes/pages/devoluciones/index.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Alert,
    Spinner,
} from '@material-tailwind/react';
import {
    IoWarning,
    IoReturnUpBack,
    IoStatsChart,
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Hooks
import { useDevolucion } from '../../hooks/useDevolucion';
import { usePermissions } from '../../../permissions/hooks/usePermissions';

// Componentes
import EquiposDefectuososTab from './EquiposDefectuososTab';
import EquiposDevueltosTab from './EquiposDevueltosTab';
import EstadisticasTab from './EstadisticasTab';

const DevolucionesPage = () => {
    const { hasPermission } = usePermissions();
    const [activeTab, setActiveTab] = useState('defectuosos');
    const [stats, setStats] = useState({
        defectuosos: 0,
        devueltos: 0,
        reingresados: 0,
    });

    const { loading, error, clearError } = useDevolucion();

    const tabs = [
        {
            value: 'defectuosos',
            label: 'Equipos Defectuosos',
            icon: IoWarning,
            color: 'red',
        },
        {
            value: 'devueltos',
            label: 'Devueltos a Sector',
            icon: IoReturnUpBack,
            color: 'amber',
        },
        {
            value: 'estadisticas',
            label: 'Estadísticas',
            icon: IoStatsChart,
            color: 'blue',
        },
    ];

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setStats({
            defectuosos: 0,
            devueltos: 0,
            reingresados: 0,
        });
    };

    const handleTabSuccess = () => {
        loadStats();
        toast.success('Operación completada exitosamente');
    };

    if (!hasPermission('devoluciones', 'leer')) {
        return (
            <div className="p-6">
                <Alert color="red">
                    <Typography>No tienes permisos para acceder a esta sección</Typography>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <Typography variant="h4" color="blue-gray">
                        Gestión de Devoluciones
                    </Typography>
                    <Typography color="gray">
                        Administra equipos defectuosos y sus reposiciones
                    </Typography>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-4">
                    <Card className="w-24">
                        <CardBody className="p-3 text-center">
                            <Typography variant="h6" color="red">
                                {stats.defectuosos}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Defectuosos
                            </Typography>
                        </CardBody>
                    </Card>
                    <Card className="w-24">
                        <CardBody className="p-3 text-center">
                            <Typography variant="h6" color="amber">
                                {stats.devueltos}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Devueltos
                            </Typography>
                        </CardBody>
                    </Card>
                    <Card className="w-24">
                        <CardBody className="p-3 text-center">
                            <Typography variant="h6" color="green">
                                {stats.reingresados}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Reingresados
                            </Typography>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert color="red" dismissible onClose={clearError}>
                    <Typography variant="small">Error: {error}</Typography>
                </Alert>
            )}

            {/* Main Content */}
            <Card>
                <CardBody>
                    <Tabs value={activeTab} onChange={setActiveTab}>
                        <TabsHeader>
                            {tabs.map(({ value, label, icon: Icon, color }) => (
                                <Tab key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 text-${color}-500`} />
                                        <span className="hidden sm:inline">{label}</span>
                                    </div>
                                </Tab>
                            ))}
                        </TabsHeader>

                        <TabsBody>
                            <TabPanel value="defectuosos">
                                <EquiposDefectuososTab
                                    onSuccess={handleTabSuccess}
                                    loading={loading}
                                />
                            </TabPanel>

                            <TabPanel value="devueltos">
                                <EquiposDevueltosTab
                                    onSuccess={handleTabSuccess}
                                    loading={loading}
                                />
                            </TabPanel>

                            <TabPanel value="estadisticas">
                                <EstadisticasTab stats={stats} loading={loading} />
                            </TabPanel>
                        </TabsBody>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    );
};

export default DevolucionesPage;
