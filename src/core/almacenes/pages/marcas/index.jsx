// ======================================================
// src/core/almacenes/pages/marcas/index.jsx
// ======================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Input,
    IconButton,
    Tooltip,
    Chip,
    Alert,
    Spinner
} from '@material-tailwind/react';
import {
    IoSearch,
    IoAdd,
    IoPencil,
    IoTrash,
    IoEyeOff,
    IoEye
} from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useMarcas } from '../../hooks/useAlmacenes';
import MarcaDialog from './MarcaDialog';
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
            label="Buscar marcas..."
            icon={<IoSearch className="h-5 w-5" />}
            value={localValue}
            onChange={handleInputChange}
            className="min-w-0"
        />
    );
});

SearchInput.displayName = 'SearchInput';

// ========== COMPONENTE TOOLBAR OPTIMIZADO ==========
const Toolbar = React.memo(({
                                searchValue,
                                showInactive,
                                canCreate,
                                onSearchChange,
                                onToggleInactive,
                                onCreateClick
                            }) => {
    const handleToggleInactive = useCallback(() => {
        onToggleInactive(!showInactive);
    }, [showInactive, onToggleInactive]);

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

                    <div className="flex items-center gap-2">
                        <Button
                            variant={showInactive ? "filled" : "outlined"}
                            size="sm"
                            onClick={handleToggleInactive}
                            className="flex items-center gap-2"
                        >
                            {showInactive ? <IoEye className="h-4 w-4" /> : <IoEyeOff className="h-4 w-4" />}
                            {showInactive ? 'Ocultar Inactivas' : 'Mostrar Inactivas'}
                        </Button>

                        {canCreate && (
                            <Button
                                onClick={onCreateClick}
                                className="flex items-center gap-2"
                                color="blue"
                            >
                                <IoAdd className="h-4 w-4" />
                                Nueva Marca
                            </Button>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
});

Toolbar.displayName = 'Toolbar';

// ========== COMPONENTE FILA DE TABLA OPTIMIZADO ==========
const MarcaRow = React.memo(({
                                 marca,
                                 isLast,
                                 canEdit,
                                 canDelete,
                                 onToggleActivo,
                                 onEdit,
                                 onDelete
                             }) => {
    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

    const handleToggleActivo = useCallback(() => {
        onToggleActivo(marca);
    }, [marca, onToggleActivo]);

    const handleEdit = useCallback(() => {
        onEdit(marca);
    }, [marca, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(marca);
    }, [marca, onDelete]);

    return (
        <tr className="hover:bg-blue-gray-50/50">
            <td className={classes}>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                    {marca.nombre}
                </Typography>
            </td>

            <td className={classes}>
                <Typography variant="small" color="gray" className="font-normal">
                    {marca.descripcion || 'Sin descripción'}
                </Typography>
            </td>

            <td className={classes}>
                <div className="flex flex-col">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {marca.modelos_count || 0} modelos
                    </Typography>
                    <Typography variant="small" color="green" className="font-normal">
                        {marca.materiales_count || 0} materiales
                    </Typography>
                </div>
            </td>

            <td className={classes}>
                <Chip
                    variant="ghost"
                    color={marca.activo ? "green" : "red"}
                    size="sm"
                    value={marca.activo ? "Activo" : "Inactivo"}
                    icon={
                        <span
                            className={`mx-auto mt-1 block h-2 w-2 rounded-full ${
                                marca.activo ? 'bg-green-900' : 'bg-red-900'
                            } content-['']`}
                        />
                    }
                />
            </td>

            <td className={classes}>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <>
                            <Tooltip content={marca.activo ? "Desactivar" : "Activar"}>
                                <IconButton
                                    variant="text"
                                    color={marca.activo ? "orange" : "green"}
                                    onClick={handleToggleActivo}
                                >
                                    {marca.activo ?
                                        <IoEyeOff className="h-4 w-4" /> :
                                        <IoEye className="h-4 w-4" />
                                    }
                                </IconButton>
                            </Tooltip>

                            <Tooltip content="Editar">
                                <IconButton
                                    variant="text"
                                    color="blue-gray"
                                    onClick={handleEdit}
                                >
                                    <IoPencil className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    {canDelete && (
                        <Tooltip content="Eliminar">
                            <IconButton
                                variant="text"
                                color="red"
                                onClick={handleDelete}
                            >
                                <IoTrash className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            </td>
        </tr>
    );
});

MarcaRow.displayName = 'MarcaRow';

// ========== COMPONENTE TABLA OPTIMIZADO ==========
const MarcasTable = React.memo(({
                                    marcas,
                                    canEdit,
                                    canDelete,
                                    onToggleActivo,
                                    onEdit,
                                    onDelete
                                }) => {
    return (
        <Card>
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="flex items-center justify-between">
                    <Typography variant="h6" color="blue-gray">
                        Marcas Registradas
                    </Typography>
                    <Typography color="gray" className="text-sm">
                        {marcas.length} marcas encontradas
                    </Typography>
                </div>
            </CardHeader>
            <CardBody className="px-0">
                {marcas.length === 0 ? (
                    <div className="text-center py-12">
                        <Typography variant="h6" color="blue-gray" className="mt-4">
                            No hay marcas registradas
                        </Typography>
                        <Typography color="gray" className="mt-2">
                            Comienza creando tu primera marca
                        </Typography>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                            <tr>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        Nombre
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        Descripción
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        Modelos
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        Estado
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        Acciones
                                    </Typography>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {marcas.map((marca, index) => (
                                <MarcaRow
                                    key={marca.id}
                                    marca={marca}
                                    isLast={index === marcas.length - 1}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    onToggleActivo={onToggleActivo}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardBody>
        </Card>
    );
});

MarcasTable.displayName = 'MarcasTable';

// ========== COMPONENTE PRINCIPAL ==========
const MarcasPage = () => {
    const { hasPermission } = usePermissions();
    const {
        marcas,
        loading,
        error,
        loadMarcas,
        createMarca,
        updateMarca,
        deleteMarca,
        toggleActivoMarca,
        clearError
    } = useMarcas();

    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Estados para dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMarca, setSelectedMarca] = useState(null);

    // Memoizar permisos
    const permissions = useMemo(() => ({
        canCreate: hasPermission('almacenes', 'create') || hasPermission('marcas', 'add') || true,
        canEdit: hasPermission('almacenes', 'update') || hasPermission('marcas', 'change') || true,
        canDelete: hasPermission('almacenes', 'delete') || hasPermission('marcas', 'delete') || true
    }), [hasPermission]);

    // Cargar marcas al montar
    useEffect(() => {
        loadMarcas({ incluir_inactivas: showInactive });
    }, [loadMarcas, showInactive]);

    // Buscar con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadMarcas({
                search: searchTerm,
                incluir_inactivas: showInactive
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, showInactive, loadMarcas]);

    // ========== HANDLERS OPTIMIZADOS ==========
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleToggleInactive = useCallback((show) => {
        setShowInactive(show);
    }, []);

    const handleCreate = useCallback(() => {
        setSelectedMarca(null);
        setIsCreateDialogOpen(true);
    }, []);

    const handleEdit = useCallback((marca) => {
        setSelectedMarca(marca);
        setIsEditDialogOpen(true);
    }, []);

    const handleDelete = useCallback((marca) => {
        setSelectedMarca(marca);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleToggleActivo = useCallback(async (marca) => {
        await toggleActivoMarca(marca.id);
    }, [toggleActivoMarca]);

    const handleCreateSubmit = useCallback(async (marcaData) => {
        const result = await createMarca(marcaData);
        if (result.success) {
            setIsCreateDialogOpen(false);
        }
        return result;
    }, [createMarca]);

    const handleEditSubmit = useCallback(async (marcaData) => {
        const result = await updateMarca(selectedMarca.id, marcaData);
        if (result.success) {
            setIsEditDialogOpen(false);
            setSelectedMarca(null);
        }
        return result;
    }, [selectedMarca?.id, updateMarca]);

    const handleDeleteConfirm = useCallback(async () => {
        if (selectedMarca) {
            const result = await deleteMarca(selectedMarca.id);
            if (result.success) {
                setIsDeleteDialogOpen(false);
                setSelectedMarca(null);
            }
            return result;
        }
    }, [selectedMarca, deleteMarca]);

    const handleCloseCreateDialog = useCallback(() => {
        setIsCreateDialogOpen(false);
    }, []);

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        setSelectedMarca(null);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setSelectedMarca(null);
    }, []);

    if (loading && marcas.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <Typography variant="h4" color="blue-gray" className="mb-2">
                    Gestión de Marcas
                </Typography>
                <Typography color="gray" className="text-sm">
                    Administra las marcas de equipos y materiales
                </Typography>
            </div>

            {/* Toolbar */}
            <Toolbar
                searchValue={searchTerm}
                showInactive={showInactive}
                canCreate={permissions.canCreate}
                onSearchChange={handleSearchChange}
                onToggleInactive={handleToggleInactive}
                onCreateClick={handleCreate}
            />

            {/* Error Alert */}
            {error && (
                <Alert color="red" className="mb-4" dismissible onClose={clearError}>
                    {error}
                </Alert>
            )}

            {/* Tabla */}
            <MarcasTable
                marcas={marcas}
                canEdit={permissions.canEdit}
                canDelete={permissions.canDelete}
                onToggleActivo={handleToggleActivo}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Dialogs */}
            <MarcaDialog
                open={isCreateDialogOpen}
                onClose={handleCloseCreateDialog}
                onSubmit={handleCreateSubmit}
                title="Crear Nueva Marca"
                mode="create"
            />

            <MarcaDialog
                open={isEditDialogOpen}
                onClose={handleCloseEditDialog}
                onSubmit={handleEditSubmit}
                title="Editar Marca"
                mode="edit"
                initialData={selectedMarca}
            />

            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleDeleteConfirm}
                itemName={selectedMarca?.nombre}
                itemType="marca"
            />
        </div>
    );
};

export default React.memo(MarcasPage);