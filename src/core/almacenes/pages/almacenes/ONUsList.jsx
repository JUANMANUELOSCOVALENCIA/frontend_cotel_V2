import React, { useState, useEffect } from 'react';
import {
    Card,
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
    IoRefresh,
    IoStatsChart,
    IoGrid,
    IoList,
    IoArrowBack,
    IoArrowForward,
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

import { useMateriales } from '../../hooks/useMateriales.js';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import ONUCard from './components/ONUCard';
import ONUTable from './components/ONUTable';
import ONUFilters from './components/ONUFilters';
import ONUDetailModal from './components/ONUDetailModal';
import EstadisticasModal from './components/EstadisticasModal';

const ONUsList = () => {
    const {
        materiales,
        loading,
        error,
        pagination,
        loadMateriales,
        loadMaterialDetail,
        cambiarEstado,
        clearError,
        permissions
    } = useMateriales();

    const { opciones } = useOpcionesCompletas();

    // Estados locales simplificados
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedONU, setSelectedONU] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Filtros consolidados
    const [filters, setFilters] = useState({
        tipo_material: 'ONU',
        page: 1,
        page_size: 20
    });

    // DEBUG: Logs para entender qué está pasando
    useEffect(() => {
        console.log('🔍 MATERIALES RECIBIDOS:', {
            cantidad: materiales?.length,
            pagination: pagination,
            filters: filters
        });
    }, [materiales, pagination, filters]);

    // Cargar datos inicial
    useEffect(() => {
        console.log('🚀 CARGANDO MATERIALES INICIAL');
        loadMateriales(filters);
    }, []);

    // Función única para cargar datos
    const loadData = (newFilters) => {
        const finalFilters = {
            tipo_material: 'ONU',
            ...newFilters,
            page_size: itemsPerPage
        };
        console.log('📤 ENVIANDO FILTROS:', finalFilters);
        setFilters(finalFilters);
        loadMateriales(finalFilters);
    };

    // Búsqueda MANUAL
    const handleSearch = () => {
        const newFilters = {
            ...filters,
            search: searchText || undefined,
            page: 1
        };
        loadData(newFilters);
    };

    // Enter en búsqueda
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Cambiar página
    const handlePageChange = (newPage) => {
        console.log('📄 CAMBIANDO A PÁGINA:', newPage);
        const newFilters = { ...filters, page: newPage };
        loadData(newFilters);
    };

    // Cambiar elementos por página
    const handleItemsPerPageChange = (value) => {
        const newItemsPerPage = parseInt(value);
        console.log('📊 CAMBIANDO ELEMENTOS POR PÁGINA:', newItemsPerPage);
        setItemsPerPage(newItemsPerPage);
        const newFilters = {
            ...filters,
            page: 1,
            page_size: newItemsPerPage
        };
        loadData(newFilters);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchText('');
        const newFilters = {
            tipo_material: 'ONU',
            page: 1,
            page_size: itemsPerPage
        };
        loadData(newFilters);
    };

    // Aplicar filtros
    const handleApplyFilters = (newFilterValues) => {
        const newFilters = {
            ...filters,
            ...newFilterValues,
            page: 1
        };
        loadData(newFilters);
        setShowFilters(false);
    };

    // Ver detalle
    const handleViewDetail = async (material) => {
        const result = await loadMaterialDetail(material.id);
        if (result.success) {
            setSelectedONU(result.data);
            setShowDetailModal(true);
        } else {
            toast.error('Error al cargar detalle de la ONU');
        }
    };

    // Cambiar estado
    const handleChangeState = async (materialId, estadoId) => {
        const result = await cambiarEstado(materialId, estadoId);
        if (result.success) {
            toast.success('Estado cambiado exitosamente');
            loadData(filters);
        } else {
            toast.error(result.error);
        }
    };

    // Refrescar
    const handleRefresh = () => {
        console.log('🔄 REFRESCANDO DATOS');
        loadData(filters);
        toast.success('Datos actualizados');
    };

    // Cálculos de paginación
    const currentPage = filters.page || 1;
    const totalItems = pagination?.count || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    console.log('📊 PAGINACIÓN:', {
        currentPage,
        totalItems,
        totalPages,
        itemsPerPage,
        materiales_length: materiales?.length
    });

    // Obtener filtros activos
    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key =>
            key !== 'page' && key !== 'page_size' && key !== 'tipo_material' && filters[key]
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
                            <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                        {/* Búsqueda MANUAL */}
                        <div className="flex-1 flex gap-2">
                            <Input
                                label="Buscar por MAC, Serial, Código interno"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleSearch}
                                disabled={loading}
                                className="flex items-center gap-2 shrink-0"
                            >
                                <IoSearch className="h-4 w-4" />
                                Buscar
                            </Button>
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
                                filters={filters}
                                onApplyFilters={handleApplyFilters}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* CONTROLES DE PAGINACIÓN - ARRIBA */}
            <Card>
                <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Typography variant="h6" color="blue-gray">
                                ONUs Encontradas: {totalItems}
                            </Typography>

                            <div className="w-32">
                                <Select
                                    label="Por página"
                                    value={itemsPerPage.toString()}
                                    onChange={handleItemsPerPageChange}
                                >
                                    <Option value="10">10</Option>
                                    <Option value="20">20</Option>
                                    <Option value="50">50</Option>
                                </Select>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <IconButton
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <IoArrowBack className="h-4 w-4" />
                                </IconButton>

                                <Typography variant="small" color="blue-gray" className="px-4">
                                    Página {currentPage} de {totalPages}
                                </Typography>

                                <IconButton
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <IoArrowForward className="h-4 w-4" />
                                </IconButton>
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center gap-2">
                                <Spinner className="h-4 w-4" />
                                <Typography variant="small" color="gray">
                                    Cargando...
                                </Typography>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Resultados */}
            <Card>
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
                filtros={filters}
            />
        </div>
    );
};

export default ONUsList;