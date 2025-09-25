// src/core/almacenes/pages/materiales-no-unicos/index.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    IconButton,
    Alert,
    Spinner,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Chip,
    Progress
} from '@material-tailwind/react';
import {
    IoSearch,
    IoRefresh,
    IoEye,
    IoFilterOutline,
    IoCube,
    IoStatsChart,
    IoClose,
    IoInformationCircle,
    IoBusinessOutline,
    IoLocationOutline,
    IoCalendar,
    IoBarChart
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

import { useMateriales } from '../../hooks/useMateriales';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import { usePermissions } from '../../../permissions/hooks/usePermissions';

// Componentes
import MaterialesNoUnicosTable from './MaterialesNoUnicosTable';
import MaterialNoUnicoDetailModal from './MaterialNoUnicoDetailModal';
import MaterialesNoUnicosStats from './MaterialesNoUnicosStats';

const MaterialesNoUnicosPage = () => {
    const { hasPermission } = usePermissions();

    // Hooks
    const {
        materiales,
        loading,
        error,
        estadisticas,
        pagination,
        loadMateriales,
        loadEstadisticas,
        clearError
    } = useMateriales();

    const {
        opciones,
        loading: loadingOpciones
    } = useOpcionesCompletas();

    // Estados locales
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filtros, setFiltros] = useState({
        'tipo_material__es_unico': false
    });
    const [currentPage, setCurrentPage] = useState(1);

    // Efectos
    useEffect(() => {
        loadMaterialesNoUnicos();
        loadEstadisticas(filtros);
    }, []);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Funciones
    const loadMaterialesNoUnicos = async (params = {}) => {
        const finalParams = {
            ...filtros,
            ...params,
            page: currentPage,
            page_size: 20
        };

        // Filtrar solo materiales no únicos
        if (!finalParams.tipo_material) {
            finalParams.tipo_material = 'NO_UNICO';
        }

        await loadMateriales(finalParams);
    };

    const handleSearch = () => {
        const params = {};
        if (searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        setCurrentPage(1);
        loadMaterialesNoUnicos(params);
    };

    const handleFiltroChange = (key, value) => {
        const newFiltros = { ...filtros, [key]: value };
        setFiltros(newFiltros);
        setCurrentPage(1);
        loadMaterialesNoUnicos(newFiltros);
        loadEstadisticas(newFiltros);
    };

    const handleLimpiarFiltros = () => {
        const filtrosLimpios = { tipo_material: 'NO_UNICO' };
        setFiltros(filtrosLimpios);
        setSearchTerm('');
        setCurrentPage(1);
        loadMaterialesNoUnicos(filtrosLimpios);
        loadEstadisticas(filtrosLimpios);
    };

    const handleViewDetail = (material) => {
        setSelectedMaterial(material);
        setShowDetail(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        loadMaterialesNoUnicos({ page });
    };

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
                        Materiales por Cantidad
                    </Typography>
                    <Typography color="gray">
                        Gestión de cables, conectores y materiales medidos por cantidad
                    </Typography>
                </div>

                <div className="flex items-center gap-3">
                    <IconButton
                        variant="outlined"
                        color="blue-gray"
                        onClick={() => loadMaterialesNoUnicos()}
                    >
                        <IoRefresh className="h-5 w-5" />
                    </IconButton>
                </div>
            </div>

            {/* Estadísticas */}
            <MaterialesNoUnicosStats
                estadisticas={estadisticas}
                loading={loading}
            />

            {/* Alertas */}
            {error && (
                <Alert color="red" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Barra de búsqueda */}
            <Card>
                <CardBody>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                label="Buscar materiales..."
                                icon={<IoSearch className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                className="flex items-center gap-2"
                                onClick={handleSearch}
                            >
                                <IoSearch className="h-4 w-4" />
                                Buscar
                            </Button>
                            <IconButton
                                variant="outlined"
                                color="blue-gray"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <IoFilterOutline className="h-5 w-5" />
                            </IconButton>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Filtros */}
            {showFilters && (
                <MaterialesNoUnicosFiltros
                    filtros={filtros}
                    onFiltroChange={handleFiltroChange}
                    opciones={opciones}
                    onLimpiarFiltros={handleLimpiarFiltros}
                />
            )}

            {/* Tabla de materiales */}
            <MaterialesNoUnicosTable
                materiales={materiales}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onViewDetail={handleViewDetail}
                onPageChange={handlePageChange}
                permissions={{
                    canView: hasPermission('materiales', 'leer'),
                    canEdit: hasPermission('materiales', 'actualizar')
                }}
            />

            {/* Modal de detalle */}
            <MaterialNoUnicoDetailModal
                material={selectedMaterial}
                open={showDetail}
                onClose={() => {
                    setShowDetail(false);
                    setSelectedMaterial(null);
                }}
                onSuccess={() => {
                    loadMaterialesNoUnicos();
                    loadEstadisticas(filtros);
                }}
            />
        </div>
    );
};

export default MaterialesNoUnicosPage;