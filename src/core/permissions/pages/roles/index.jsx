// src/core/permissions/pages/Roles/index.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Alert, Button } from '@material-tailwind/react';
import { IoAdd } from 'react-icons/io5';

// Hooks
import { useRolesCRUD, usePermissionsCRUD } from '../../hooks/usePermissions';
import { useRoleFilters, useRoleActions, usePermissionSelection } from './roleHooks';

// Componentes
import Permission from '../../components/Permission';
import Loader from '../../../layout/Loader';
import RoleComponents from './roleComponents';
import RoleDialogs from './roleDialogs';

const Roles = () => {
    // ========== ESTADOS PRINCIPALES ==========
    const [selectedRole, setSelectedRole] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Estados de diálogos
    const [dialogs, setDialogs] = useState({
        create: false,
        edit: false,
        clone: false,
        view: false,
        confirm: false,
    });

    const [confirmAction, setConfirmAction] = useState(null);

    // ========== HOOKS DE DATOS ==========
    const {
        roles,
        loading: rolesLoading,
        error: rolesError,
        pagination,
        loadRoles,
        clearError: clearRolesError,
    } = useRolesCRUD();

    const {
        permissions,
        loading: permissionsLoading,
        loadPermissions,
    } = usePermissionsCRUD();

    // ========== HOOKS PERSONALIZADOS ==========
    const { filters, handleFilterChange } = useRoleFilters();
    const { handleRoleAction } = useRoleActions();
    const {
        selectedPermissions,
        setSelectedPermissions,
        resetSelection,
        groupedPermissions
    } = usePermissionSelection(permissions);

    // ========== EFECTOS ==========

    // Cargar datos iniciales
    useEffect(() => {
        loadRoles({ page: currentPage, ...filters });
        loadPermissions({ page_size: 1000 }); // Cargar todos los permisos
    }, [currentPage, filters, loadRoles, loadPermissions]);

    // ========== HANDLERS PARA DIÁLOGOS ==========

    const openDialog = (type, role = null) => {
        setSelectedRole(role);

        // Si es editar, cargar permisos del rol
        if (type === 'edit' && role) {
            setSelectedPermissions(role.permisos.map(p => p.id));
        }

        setDialogs(prev => ({ ...prev, [type]: true }));
    };

    const closeDialog = (type) => {
        setDialogs(prev => ({ ...prev, [type]: false }));

        if (type === 'edit' || type === 'confirm' || type === 'view' || type === 'clone') {
            setSelectedRole(null);
        }

        if (type === 'confirm') {
            setConfirmAction(null);
        }

        if (type === 'create' || type === 'edit') {
            resetSelection();
        }
    };

    const openConfirmDialog = (action, role) => {
        setConfirmAction({ action, role });
        openDialog('confirm');
    };

    // ========== HANDLER DE ÉXITO ==========

    const handleSuccess = (type) => {
        closeDialog(type);
        // Recargar roles
        loadRoles({ page: currentPage, ...filters });
    };

    // ========== LOADING INICIAL ==========

    if (rolesLoading && roles.length === 0) {
        return <Loader message="Cargando roles..." />;
    }

    // ========== RENDER ==========

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Typography variant="h3" color="blue-gray">
                        Gestión de Roles
                    </Typography>
                    <Typography color="gray" className="mt-1">
                        Administra roles y permisos del sistema
                    </Typography>
                </div>

                <Permission recurso="roles" accion="crear">
                    <Button
                        className="flex items-center gap-2"
                        color="orange"
                        onClick={() => {
                            resetSelection();
                            openDialog('create');
                        }}
                    >
                        <IoAdd className="h-5 w-5" />
                        Crear Rol
                    </Button>
                </Permission>
            </div>

            {/* Error Alert */}
            {rolesError && (
                <Alert color="red" dismissible onClose={clearRolesError}>
                    {rolesError}
                </Alert>
            )}

            {/* Componentes principales (Grid + Filtros) */}
            <RoleComponents
                roles={roles}
                loading={rolesLoading}
                pagination={pagination}
                currentPage={currentPage}
                filters={filters}
                onPageChange={setCurrentPage}
                onFilterChange={handleFilterChange}
                onEditRole={(role) => openDialog('edit', role)}
                onViewRole={(role) => openDialog('view', role)}
                onCloneRole={(role) => openDialog('clone', role)}
                onConfirmAction={openConfirmDialog}
                onRefresh={() => loadRoles({ page: currentPage, ...filters })}
            />

            {/* Todos los Diálogos */}
            <RoleDialogs
                dialogs={dialogs}
                selectedRole={selectedRole}
                confirmAction={confirmAction}
                permissions={permissions}
                groupedPermissions={groupedPermissions}
                selectedPermissions={selectedPermissions}
                permissionsLoading={permissionsLoading}
                loading={rolesLoading}
                onCloseDialog={closeDialog}
                onSuccess={handleSuccess}
                onRoleAction={handleRoleAction}
                onPermissionChange={setSelectedPermissions}
            />
        </div>
    );
};

export default Roles;