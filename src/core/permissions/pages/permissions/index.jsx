// src/core/permissions/pages/Permissions/index.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Alert, Button } from '@material-tailwind/react';
import { IoAdd } from 'react-icons/io5';

// Hooks
import { usePermissionsCRUD, useResourcesAndActions } from '../../hooks/usePermissions';
import { usePermissionFilters, usePermissionActions, useResourceGroups } from './permissionHooks';

// Componentes
import Permission from '../../components/Permission';
import Loader from '../../../layout/Loader';
import PermissionComponents from './PermissionComponents';
import PermissionDialogs from './PermissionDialogs';

const Permissions = () => {
    // ========== ESTADOS PRINCIPALES ==========
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Estados de diálogos
    const [dialogs, setDialogs] = useState({
        create: false,
        edit: false,
        view: false,
        confirm: false,
    });

    const [confirmAction, setConfirmAction] = useState(null);

    // ========== HOOKS DE DATOS ==========
    const {
        permissions,
        loading: permissionsLoading,
        error: permissionsError,
        pagination,
        loadPermissions,
        clearError: clearPermissionsError,
    } = usePermissionsCRUD();

    const {
        resources,
        actions,
        loading: resourcesLoading,
    } = useResourcesAndActions();

    // ========== HOOKS PERSONALIZADOS ==========
    const { filters, handleFilterChange, handleSearch, clearSearch } = usePermissionFilters();
    const { handlePermissionAction } = usePermissionActions();
    const { groupedPermissions } = useResourceGroups(permissions);

    // ========== EFECTOS ==========

    // Cargar datos cuando cambian filtros o página
    useEffect(() => {
        loadPermissions({ page: currentPage, ...filters });
    }, [currentPage, filters, loadPermissions]);

    // ========== HANDLERS PARA DIÁLOGOS ==========

    const openDialog = (type, permission = null) => {
        setSelectedPermission(permission);
        setDialogs(prev => ({ ...prev, [type]: true }));
    };

    const closeDialog = (type) => {
        setDialogs(prev => ({ ...prev, [type]: false }));

        if (type === 'edit' || type === 'confirm' || type === 'view') {
            setSelectedPermission(null);
        }

        if (type === 'confirm') {
            setConfirmAction(null);
        }
    };

    const openConfirmDialog = (action, permission) => {
        setConfirmAction({ action, permission });
        openDialog('confirm');
    };

    // ========== HANDLER DE ÉXITO ==========

    const handleSuccess = (type) => {
        closeDialog(type);
        // Recargar permisos
        loadPermissions({ page: currentPage, ...filters });
    };

    // ========== LOADING INICIAL ==========

    if (permissionsLoading && permissions.length === 0) {
        return <Loader message="Cargando permisos..." />;
    }

    // ========== RENDER ==========

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Typography variant="h3" color="blue-gray">
                        Gestión de Permisos
                    </Typography>
                    <Typography color="gray" className="mt-1">
                        Administra permisos granulares del sistema
                    </Typography>
                </div>

                <Permission recurso="permisos" accion="crear">
                    <Button
                        className="flex items-center gap-2"
                        color="orange"
                        onClick={() => openDialog('create')}
                    >
                        <IoAdd className="h-5 w-5" />
                        Crear Permiso
                    </Button>
                </Permission>
            </div>

            {/* Error Alert */}
            {permissionsError && (
                <Alert color="red" dismissible onClose={clearPermissionsError}>
                    {permissionsError}
                </Alert>
            )}

            {/* Componentes principales (Grupos por recurso + Filtros) */}
            <PermissionComponents
                permissions={permissions}
                groupedPermissions={groupedPermissions}
                resources={resources}
                actions={actions}
                loading={permissionsLoading}
                resourcesLoading={resourcesLoading}
                pagination={pagination}
                currentPage={currentPage}
                filters={filters}
                onPageChange={setCurrentPage}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onClearSearch={clearSearch}
                onEditPermission={(permission) => openDialog('edit', permission)}
                onViewPermission={(permission) => openDialog('view', permission)}
                onConfirmAction={openConfirmDialog}
                onRefresh={() => loadPermissions({ page: currentPage, ...filters })}
            />

            {/* Todos los Diálogos */}
            <PermissionDialogs
                dialogs={dialogs}
                selectedPermission={selectedPermission}
                confirmAction={confirmAction}
                resources={resources}
                actions={actions}
                loading={permissionsLoading}
                onCloseDialog={closeDialog}
                onSuccess={handleSuccess}
                onPermissionAction={handlePermissionAction}
            />
        </div>
    );
};

export default Permissions;