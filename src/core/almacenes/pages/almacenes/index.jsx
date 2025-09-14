// src/core/almacenes/pages/almacenes/index.jsx - OPTIMIZADO CON MODAL DE ELIMINACIÓN
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, CardHeader, Typography, Button, Input } from '@material-tailwind/react';
import { IoSearchOutline, IoAddOutline } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useAlmacenes } from '../../hooks/useAlmacenes';
import AlmacenesTable from './AlmacenesTable';
import AlmacenDialog from './AlmacenDialog';
import AlmacenDetailDialog from './AlmacenDetailDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

// ========== COMPONENTE BUSCADOR OPTIMIZADO ==========
const SearchInput = React.memo(({ searchValue, onSearchChange }) => {
    const [localValue, setLocalValue] = useState(searchValue || '');
    const debounceRef = React.useRef(null);

    React.useEffect(() => {
        setLocalValue(searchValue || '');
    }, [searchValue]);

    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onSearchChange(newValue);
        }, 500);
    }, [onSearchChange]);

    React.useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <Input
            label="Buscar almacenes..."
            icon={<IoSearchOutline className="h-5 w-5" />}
            value={localValue}
            onChange={handleInputChange}
            className="min-w-0"
        />
    );
});

SearchInput.displayName = 'SearchInput';

// ========== COMPONENTE FILTROS OPTIMIZADO ==========
const FilterControls = React.memo(({
                                       filters,
                                       onFilterChange
                                   }) => {
    const handleActivoChange = useCallback((e) => {
        onFilterChange('activo', e.target.value);
    }, [onFilterChange]);

    const handleTipoChange = useCallback((e) => {
        onFilterChange('tipo', e.target.value);
    }, [onFilterChange]);

    return (
        <div className="flex gap-2">
            <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.activo}
                onChange={handleActivoChange}
            >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
            </select>

            <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.tipo}
                onChange={handleTipoChange}
            >
                <option value="">Todos los tipos</option>
                <option value="1">Principal</option>
                <option value="2">Regional</option>
                <option value="3">Temporal</option>
            </select>
        </div>
    );
});

FilterControls.displayName = 'FilterControls';

// ========== COMPONENTE TOOLBAR OPTIMIZADO ==========
const Toolbar = React.memo(({
                                searchValue,
                                filters,
                                canCreate,
                                onSearchChange,
                                onFilterChange,
                                onCreateClick
                            }) => {
    return (
        <Card className="mb-6">
            <CardBody className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-96">
                        <SearchInput
                            searchValue={searchValue}
                            onSearchChange={onSearchChange}
                        />
                    </div>

                    <FilterControls
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />

                    {canCreate && (
                        <Button
                            onClick={onCreateClick}
                            className="flex items-center gap-2"
                            color="blue"
                        >
                            <IoAddOutline strokeWidth={2} className="h-4 w-4" />
                            Nuevo Almacén
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
});

Toolbar.displayName = 'Toolbar';

// ========== COMPONENTE PRINCIPAL ==========
const AlmacenesPage = () => {
    const { hasPermission } = usePermissions();
    const {
        almacenes,
        loading,
        error,
        pagination,
        loadAlmacenes,
        createAlmacen,
        updateAlmacen,
        deleteAlmacen,
        clearError
    } = useAlmacenes();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        activo: '',
        tipo: '',
        ciudad: ''
    });

    // Estados para dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAlmacen, setSelectedAlmacen] = useState(null);

    // Memoizar permisos
    const permissions = useMemo(() => ({
        canCreate: hasPermission('almacenes', 'create') || hasPermission('almacenes', 'add') || true,
        canEdit: hasPermission('almacenes', 'update') || hasPermission('almacenes', 'change') || true,
        canDelete: hasPermission('almacenes', 'delete') || true
    }), [hasPermission]);

    // Cargar almacenes al montar
    useEffect(() => {
        loadAlmacenes();
    }, [loadAlmacenes]);

    // Buscar con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = {
                search: searchTerm,
                ...filters
            };
            loadAlmacenes(params);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filters, loadAlmacenes]);

    // ========== HANDLERS OPTIMIZADOS ==========
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleCreate = useCallback(() => {
        setSelectedAlmacen(null);
        setIsCreateDialogOpen(true);
    }, []);

    const handleEdit = useCallback((almacen) => {
        setSelectedAlmacen(almacen);
        setIsEditDialogOpen(true);
    }, []);

    const handleDetail = useCallback((almacen) => {
        setSelectedAlmacen(almacen);
        setIsDetailDialogOpen(true);
    }, []);

    const handleDelete = useCallback((almacen) => {
        setSelectedAlmacen(almacen);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCreateSubmit = useCallback(async (almacenData) => {
        const result = await createAlmacen(almacenData);
        if (result.success) {
            setIsCreateDialogOpen(false);
        }
        return result;
    }, [createAlmacen]);

    const handleEditSubmit = useCallback(async (almacenData) => {
        const result = await updateAlmacen(selectedAlmacen.id, almacenData);
        if (result.success) {
            setIsEditDialogOpen(false);
            setSelectedAlmacen(null);
        }
        return result;
    }, [selectedAlmacen?.id, updateAlmacen]);

    const handleDeleteConfirm = useCallback(async () => {
        if (selectedAlmacen) {
            const result = await deleteAlmacen(selectedAlmacen.id);
            if (result.success) {
                setIsDeleteDialogOpen(false);
                setSelectedAlmacen(null);
            }
            return result;
        }
    }, [selectedAlmacen, deleteAlmacen]);

    const handleCloseCreateDialog = useCallback(() => {
        setIsCreateDialogOpen(false);
    }, []);

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        setSelectedAlmacen(null);
    }, []);

    const handleCloseDetailDialog = useCallback(() => {
        setIsDetailDialogOpen(false);
        setSelectedAlmacen(null);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setSelectedAlmacen(null);
    }, []);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <Typography variant="h4" color="blue-gray" className="mb-2">
                    Gestión de Almacenes
                </Typography>
                <Typography color="gray" className="text-sm">
                    Administra los almacenes del sistema, sus ubicaciones y configuraciones
                </Typography>
            </div>

            {/* Toolbar */}
            <Toolbar
                searchValue={searchTerm}
                filters={filters}
                canCreate={permissions.canCreate}
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
                onCreateClick={handleCreate}
            />

            {/* Tabla */}
            <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="flex items-center justify-between">
                        <Typography variant="h6" color="blue-gray">
                            Almacenes Registrados
                        </Typography>
                        <Typography color="gray" className="text-sm">
                            {pagination.count} almacenes encontrados
                        </Typography>
                    </div>
                </CardHeader>
                <CardBody className="px-0">
                    <AlmacenesTable
                        almacenes={almacenes}
                        loading={loading}
                        error={error}
                        onEdit={permissions.canEdit ? handleEdit : null}
                        onDelete={permissions.canDelete ? handleDelete : null}
                        onDetail={handleDetail}
                        onClearError={clearError}
                    />
                </CardBody>
            </Card>

            {/* Dialogs */}
            <AlmacenDialog
                open={isCreateDialogOpen}
                onClose={handleCloseCreateDialog}
                onSubmit={handleCreateSubmit}
                title="Crear Nuevo Almacén"
                mode="create"
            />

            <AlmacenDialog
                open={isEditDialogOpen}
                onClose={handleCloseEditDialog}
                onSubmit={handleEditSubmit}
                title="Editar Almacén"
                mode="edit"
                initialData={selectedAlmacen}
            />

            <AlmacenDetailDialog
                open={isDetailDialogOpen}
                onClose={handleCloseDetailDialog}
                almacen={selectedAlmacen}
            />

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleDeleteConfirm}
                itemName={selectedAlmacen?.nombre}
                itemCode={selectedAlmacen?.codigo}
                itemType="almacén"
                additionalInfo={selectedAlmacen ? `Ciudad: ${selectedAlmacen.ciudad}` : ''}
            />
        </div>
    );
};

export default React.memo(AlmacenesPage);