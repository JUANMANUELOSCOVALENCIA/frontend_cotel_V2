// src/core/almacenes/pages/proveedores/index.jsx - ACTUALIZAR
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Input,
    IconButton,
    Alert,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter
} from '@material-tailwind/react';
import {
    IoAddOutline,
    IoSearchOutline,
    IoRefreshOutline,
    IoBusinessOutline,
    IoWarningOutline,
    IoClose
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Hooks
import { useProveedores } from '../../hooks/useAlmacenes';
import { usePermissions } from '../../../permissions/hooks/usePermissions';

// Componentes
import ProveedorTable from './ProveedorTable';
import ProveedorDialog from './ProveedorDialog';
import ProveedorDetailDialog from './ProveedorDetailDialog';

// Modal de confirmación de eliminación
const DeleteConfirmModal = ({ open, proveedor, onClose, onConfirm, loading }) => {
    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <IoWarningOutline className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <Typography variant="h5" color="blue-gray">
                        Confirmar Eliminación
                    </Typography>
                </div>
                <Button variant="text" color="gray" onClick={onClose} className="p-2 ml-auto">
                    <IoClose className="h-5 w-5" />
                </Button>
            </DialogHeader>

            <DialogBody divider>
                <div className="space-y-4">
                    <Typography color="gray">
                        ¿Está seguro de que desea eliminar el proveedor?
                    </Typography>

                    {proveedor && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <Typography variant="small" className="font-semibold text-red-900">
                                {proveedor.nombre_comercial}
                            </Typography>
                            {proveedor.codigo && (
                                <Typography variant="small" className="text-red-700">
                                    Código: {proveedor.codigo}
                                </Typography>
                            )}
                        </div>
                    )}

                    <Alert color="red" variant="outlined" className="text-sm">
                        <div className="flex items-start gap-2">
                            <IoWarningOutline className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <Typography variant="small" className="font-medium">
                                    Esta acción no se puede deshacer
                                </Typography>
                                <Typography variant="small" className="mt-1">
                                    Se eliminará toda la información del proveedor. Si tiene lotes asociados, verifique las dependencias antes de proceder.
                                </Typography>
                            </div>
                        </div>
                    </Alert>
                </div>
            </DialogBody>

            <DialogFooter className="space-x-2">
                <Button
                    variant="outlined"
                    color="gray"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    color="red"
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    Eliminar Proveedor
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

const ProveedoresPage = () => {
    const { hasPermission } = usePermissions();

    const {
        proveedores,
        loading,
        error,
        loadProveedores,
        createProveedor,
        updateProveedor,
        deleteProveedor,
        clearError,
        permissions
    } = useProveedores();

    // Estados locales
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProveedor, setSelectedProveedor] = useState(null);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit'

    // Estados de diálogos
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingProveedor, setDeletingProveedor] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filtros
    const [filters, setFilters] = useState({
        activo: '',
        search: ''
    });

    // Efectos
    useEffect(() => {
        loadProveedores();
    }, [loadProveedores]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = {
                search: searchTerm,
                ...filters
            };
            loadProveedores(params);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filters, loadProveedores]);

    // Handlers
    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreate = () => {
        setSelectedProveedor(null);
        setDialogMode('create');
        setIsDialogOpen(true);
    };

    const handleEdit = (proveedor) => {
        setSelectedProveedor(proveedor);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    const handleDetail = (proveedor) => {
        setSelectedProveedor(proveedor);
        setIsDetailDialogOpen(true);
    };

    // NUEVA función para mostrar modal de confirmación
    const handleDelete = (proveedor) => {
        setDeletingProveedor(proveedor);
        setIsDeleteModalOpen(true);
    };

    // NUEVA función para confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!deletingProveedor) return;

        setDeleteLoading(true);
        try {
            const result = await deleteProveedor(deletingProveedor.id);
            if (result.success) {
                toast.success(`Proveedor "${deletingProveedor.nombre_comercial}" eliminado correctamente`);
                setIsDeleteModalOpen(false);
                setDeletingProveedor(null);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al eliminar proveedor');
        } finally {
            setDeleteLoading(false);
        }
    };

    // NUEVA función para cancelar eliminación
    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeletingProveedor(null);
        setDeleteLoading(false);
    };

    const handleDialogSubmit = async (proveedorData) => {
        try {
            let result;
            if (dialogMode === 'create') {
                result = await createProveedor(proveedorData);
                if (result.success) {
                    toast.success('Proveedor creado correctamente');
                    setIsDialogOpen(false);
                }
            } else {
                result = await updateProveedor(selectedProveedor.id, proveedorData);
                if (result.success) {
                    toast.success('Proveedor actualizado correctamente');
                    setIsDialogOpen(false);
                }
            }

            if (!result.success) {
                toast.error(result.error);
            }

            return result;
        } catch (error) {
            toast.error('Error inesperado');
            return { success: false, error: 'Error inesperado' };
        }
    };

    const handleRefresh = () => {
        loadProveedores();
        toast.success('Lista actualizada');
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <Typography variant="h4" color="blue-gray" className="mb-2">
                    Gestión de Proveedores
                </Typography>
                <Typography color="gray" className="text-sm">
                    Administra los proveedores de materiales y equipos
                </Typography>
            </div>

            {/* Toolbar */}
            <Card className="mb-6">
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Búsqueda */}
                        <div className="w-full md:w-96">
                            <Input
                                label="Buscar proveedores..."
                                icon={<IoSearchOutline className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="min-w-0"
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-2">
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                value={filters.activo}
                                onChange={(e) => handleFilterChange('activo', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>

                            <IconButton
                                variant="outlined"
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                <IoRefreshOutline className="h-5 w-5" />
                            </IconButton>
                        </div>

                        {/* Botón crear */}
                        {permissions.canCreate && (
                            <Button
                                onClick={handleCreate}
                                className="flex items-center gap-2"
                                color="blue"
                            >
                                <IoAddOutline strokeWidth={2} className="h-4 w-4" />
                                Nuevo Proveedor
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Alerta de error */}
            {error && (
                <Alert color="red" className="mb-4" dismissible onClose={clearError}>
                    {error}
                </Alert>
            )}

            {/* Tabla */}
            <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="flex items-center justify-between">
                        <Typography variant="h6" color="blue-gray">
                            Proveedores Registrados
                        </Typography>
                        <Typography color="gray" className="text-sm">
                            {proveedores.length} proveedores encontrados
                        </Typography>
                    </div>
                </CardHeader>
                <CardBody className="px-0">
                    <ProveedorTable
                        proveedores={proveedores}
                        loading={loading}
                        onEdit={permissions.canEdit ? handleEdit : null}
                        onDelete={permissions.canDelete ? handleDelete : null}
                        onDetail={handleDetail}
                    />
                </CardBody>
            </Card>

            {/* Diálogos */}
            <ProveedorDialog
                open={isDialogOpen}
                mode={dialogMode}
                proveedor={selectedProveedor}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleDialogSubmit}
                loading={loading}
            />

            <ProveedorDetailDialog
                open={isDetailDialogOpen}
                proveedor={selectedProveedor}
                onClose={() => setIsDetailDialogOpen(false)}
                onEdit={permissions.canEdit ? handleEdit : null}
            />

            {/* NUEVO Modal de confirmación de eliminación */}
            <DeleteConfirmModal
                open={isDeleteModalOpen}
                proveedor={deletingProveedor}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
            />
        </div>
    );
};

export default ProveedoresPage;