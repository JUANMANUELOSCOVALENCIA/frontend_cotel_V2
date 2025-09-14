import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Chip,
    IconButton,
    Tooltip,
    Spinner,
} from '@material-tailwind/react';
import {
    IoSearch,
    IoFilter,
    IoEye,
    IoRefresh,
    IoStatsChart,
    IoGrid,
    IoList,
    IoDownload
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

import { useMateriales } from '../../hooks/useMateriales.js';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import ONUCard from './components/ONUCard';
import ONUTable from './components/ONUTable';
import ONUFilters from './components/ONUFilters';
import ONUDetailModal from './components/ONUDetailModal';
import EstadisticasModal from './components/EstadisticasModal';
import Pagination from '../../../../shared/components/Pagination';

const ONUsList = () => {
    const {
        materiales,
        loading,
        error,
        pagination,
        loadMateriales,
        loadMaterialDetail,
        cambiarEstado,
        busquedaAvanzada,
        clearError,
        permissions
    } = useMateriales();

    const { opciones } = useOpcionesCompletas();

    // Estados locales
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [showFilters, setShowFilters] = useState(false);
    const [selectedONU, setSelectedONU] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({
        tipo_material: 'ONU', // Solo ONUs por defecto
        page: 1,
        page_size: 20
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadMateriales(currentFilters);
    }, [loadMateriales, currentFilters]);

    // Manejo de búsqueda
    const handleSearch = (text) => {
        setSearchText(text);
        const newFilters = {
            ...currentFilters,
            search: text,
            page: 1
        };
        setCurrentFilters(newFilters);
        loadMateriales(newFilters);
    };

    // Aplicar filtros
    const handleApplyFilters = (filters) => {
        const newFilters = {
            ...currentFilters,
            ...filters,
            page: 1
        };
        setCurrentFilters(newFilters);
        loadMateriales(newFilters);
        setShowFilters(false);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        const newFilters = {
            tipo_material: 'ONU',
            page: 1,
            page_size: 20
        };
        setCurrentFilters(newFilters);
        setSearchText('');
        loadMateriales(newFilters);
    };

    // Cambio de página
    const handlePageChange = (page) => {
        const newFilters = { ...currentFilters, page };
        setCurrentFilters(newFilters);
        loadMateriales(newFilters);
    };

    // Ver detalle de ONU
    const handleViewDetail = async (material) => {
        const result = await loadMaterialDetail(material.id);
        if (result.success) {
            setSelectedONU(result.data);
            setShowDetailModal(true);
        } else {
            toast.error('Error al cargar detalle de la ONU');
        }
    };

    // Cambiar estado de ONU
    const handleChangeState = async (materialId, estadoId) => {
        const result = await cambiarEstado(materialId, estadoId);
        if (result.success) {
            toast.success('Estado cambiado exitosamente');
        } else {
            toast.error(result.error);
        }
    };

    // Refrescar datos
    const handleRefresh = () => {
        loadMateriales(currentFilters);
        toast.success('Datos actualizados');
    };

    // Exportar datos
    const handleExport = () => {
        // Implementar exportación (CSV, Excel, etc.)
        toast.info('Función de exportación en desarrollo');
    };

    // Obtener chip de filtros activos
    const getActiveFiltersCount = () => {
        return Object.keys(currentFilters).filter(key =>
            key !== 'page' && key !== 'page_size' && key !== 'tipo_material' && currentFilters[key]
        ).length;
    };

    if (!permissions.canView) {
        return (
            <div className="flex items-center justify-center h-64">
                <Typography color="red">
                    No tienes permisos para ver esta sección
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <Typography variant="h4" color="blue-gray">
                        Gestión de ONUs
                    </Typography>
                    <Typography color="gray" className="mt-1">
                        Administra y monitorea todos los equipos ONUs del inventario
                    </Typography>
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip content="Estadísticas">
                        <IconButton
                            variant="outlined"
                            onClick={() => setShowStatsModal(true)}
                        >
                            <IoStatsChart className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Refrescar">
                        <IconButton
                            variant="outlined"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <IoRefresh className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Exportar">
                        <IconButton
                            variant="outlined"
                            onClick={handleExport}
                        >
                            <IoDownload className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>

                    <div className="flex rounded-md border">
                        <IconButton
                            variant={viewMode === 'grid' ? 'filled' : 'text'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <IoGrid className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                            variant={viewMode === 'table' ? 'filled' : 'text'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                        >
                            <IoList className="h-4 w-4" />
                        </IconButton>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
                <CardBody className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1">
                            <Input
                                icon={<IoSearch className="h-5 w-5" />}
                                label="Buscar por MAC, Serial, Código interno..."
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={showFilters ? 'filled' : 'outlined'}
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <IoFilter className="h-4 w-4" />
                                Filtros
                                {getActiveFiltersCount() > 0 && (
                                    <Chip
                                        value={getActiveFiltersCount()}
                                        size="sm"
                                        className="rounded-full"
                                    />
                                )}
                            </Button>

                            {getActiveFiltersCount() > 0 && (
                                <Button
                                    variant="text"
                                    size="sm"
                                    color="red"
                                    onClick={handleClearFilters}
                                >
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Panel de filtros */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t">
                            <ONUFilters
                                opciones={opciones}
                                filters={currentFilters}
                                onApplyFilters={handleApplyFilters}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Resultados */}
            <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="flex items-center justify-between">
                        <Typography variant="h6" color="blue-gray">
                            ONUs Encontradas ({pagination.count})
                        </Typography>

                        {loading && (
                            <div className="flex items-center gap-2">
                                <Spinner className="h-4 w-4" />
                                <Typography variant="small" color="gray">
                                    Cargando...
                                </Typography>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardBody className="overflow-hidden px-0">
                    {error && (
                        <div className="px-6 pb-4">
                            <Typography color="red" className="text-center">
                                {error}
                            </Typography>
                        </div>
                    )}

                    {materiales.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <Typography color="gray">
                                No se encontraron ONUs con los criterios de búsqueda
                            </Typography>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-6">
                                    {materiales.map((material) => (
                                        <ONUCard
                                            key={material.id}
                                            material={material}
                                            opciones={opciones}
                                            onViewDetail={handleViewDetail}
                                            onChangeState={handleChangeState}
                                            canEdit={permissions.canEdit}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <ONUTable
                                    materiales={materiales}
                                    opciones={opciones}
                                    onViewDetail={handleViewDetail}
                                    onChangeState={handleChangeState}
                                    canEdit={permissions.canEdit}
                                />
                            )}

                            {/* Paginación */}
                            {pagination.count > pagination.page_size && (
                                <div className="px-6 pt-4">
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={Math.ceil(pagination.count / pagination.page_size)}
                                        onPageChange={handlePageChange}
                                        showInfo={true}
                                        totalItems={pagination.count}
                                        itemsPerPage={pagination.page_size}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Modales */}
            <ONUDetailModal
                open={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                material={selectedONU}
                opciones={opciones}
                onChangeState={handleChangeState}
                canEdit={permissions.canEdit}
            />

            <EstadisticasModal
                open={showStatsModal}
                onClose={() => setShowStatsModal(false)}
                filtros={currentFilters}
            />
        </div>
    );
};

export default ONUsList;