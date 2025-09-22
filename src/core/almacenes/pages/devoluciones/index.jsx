// src/core/almacenes/pages/devoluciones/index.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Alert,
    Spinner,
    Breadcrumbs,
    Button,
} from '@material-tailwind/react';
import {
    IoWarning,
    IoReturnUpBack,
    IoStatsChart,
    IoHome,
    IoRefresh,
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Hooks
import { useDevolucion } from '../../hooks/useDevolucion';
import { usePermissions } from '../../../permissions/hooks/usePermissions';

// Componentes
import EquiposDefectuososTab from './EquiposDefectuososTab';
import EquiposDevueltosTab from './EquiposDevueltosTab';

const DevolucionesPage = () => {
    const { hasPermission } = usePermissions();
    const [activeTab, setActiveTab] = useState('defectuosos');
    const [stats, setStats] = useState({
        defectuosos: 0,
        devueltos: 0,
        reingresados: 0,
    });

    const { loading, error, clearError } = useDevolucion();

    // Configuración de tabs customizados
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
            </div>

            {/* Error Alert */}
            {error && (
                <Alert color="red" dismissible onClose={clearError}>
                    <Typography variant="small">Error: {error}</Typography>
                </Alert>
            )}

            {/* Tabs customizados - SIN z-index conflicts */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm relative">
                {/* Header de Tabs customizado */}
                <div className="border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <div className="flex flex-wrap gap-1 p-2">
                        {tabs.map(({ value, label, icon: Icon, color }) => (
                            <button
                                key={value}
                                onClick={() => setActiveTab(value)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative
                                    ${activeTab === value
                                    ? 'bg-white shadow-sm text-orange-600 border border-orange-200'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                }
                                `}
                            >
                                <Icon className={`h-4 w-4 ${
                                    activeTab === value
                                        ? color === 'red' ? 'text-red-500' : 'text-amber-500'
                                        : 'text-gray-500'
                                }`} />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenido de Tabs */}
                <div className="p-6">
                    {activeTab === 'defectuosos' && (
                        <EquiposDefectuososTab
                            onSuccess={handleTabSuccess}
                            loading={loading}
                        />
                    )}

                    {activeTab === 'devueltos' && (
                        <EquiposDevueltosTab
                            onSuccess={handleTabSuccess}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevolucionesPage;