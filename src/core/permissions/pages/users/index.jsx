// src/core/permissions/pages/Users/index.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Alert, Button } from '@material-tailwind/react';
import { IoAdd, IoPersonAdd } from 'react-icons/io5';

// Hooks
import { useUsersCRUD, useRolesCRUD } from '../../hooks/usePermissions';
import { useUserFilters, useUserActions } from './userHooks';

// Componentes
import Permission from '../../components/Permission';
import Loader from '../../../layout/Loader';
import UserTable from './userTable';
import UserDialogs from './userDialogs';

const Users = () => {
    // ========== ESTADOS PRINCIPALES ==========
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Estados de diálogos
    const [dialogs, setDialogs] = useState({
        create: false,
        edit: false,
        migrate: false,
        confirm: false,
    });

    const [confirmAction, setConfirmAction] = useState(null);

    // ========== HOOKS DE DATOS ==========
    const {
        users,
        loading: usersLoading,
        error: usersError,
        pagination,
        loadUsers,
        clearError: clearUsersError,
    } = useUsersCRUD();

    const {
        roles,
        loading: rolesLoading,
        loadRoles,
    } = useRolesCRUD();

    // ========== HOOKS PERSONALIZADOS ==========
    const {
        filters,
        searchInput,
        handleFilterChange,
        handleSearchInputChange,
        clearSearch
    } = useUserFilters();

    const { handleUserAction, handleChangeRole } = useUserActions();

    // ========== EFECTOS ==========

    // Cargar roles una sola vez
    useEffect(() => {
        loadRoles({ page_size: 100 });
    }, [loadRoles]);

    // Cargar usuarios cuando cambian filtros o página
    useEffect(() => {
        const backendFilters = { ...filters };

        // Mapeo de filtros para backend
        if (filters.incluir_eliminados === 'true') {
            backendFilters.with_deleted = 'true';
            delete backendFilters.incluir_eliminados;
        } else if (filters.incluir_eliminados === 'only') {
            backendFilters.with_deleted = 'true';
            backendFilters.eliminados_only = 'true';
            delete backendFilters.incluir_eliminados;
        } else {
            delete backendFilters.incluir_eliminados;
        }

        loadUsers({ page: currentPage, ...backendFilters });
    }, [currentPage, filters, loadUsers]);

    // ========== HANDLERS PARA DIÁLOGOS ==========

    const openDialog = (type, user = null) => {
        setSelectedUser(user);
        setDialogs(prev => ({ ...prev, [type]: true }));
    };

    const closeDialog = (type) => {
        setDialogs(prev => ({ ...prev, [type]: false }));
        if (type === 'edit' || type === 'confirm') {
            setSelectedUser(null);
        }
        if (type === 'confirm') {
            setConfirmAction(null);
        }
    };

    const openConfirmDialog = (action, user) => {
        setConfirmAction({ action, user });
        openDialog('confirm');
    };

    // ========== HANDLER DE ÉXITO ==========

    const handleSuccess = (type) => {
        closeDialog(type);
        // Recargar datos
        const backendFilters = { ...filters };
        if (filters.incluir_eliminados === 'true') {
            backendFilters.with_deleted = 'true';
            delete backendFilters.incluir_eliminados;
        } else if (filters.incluir_eliminados === 'only') {
            backendFilters.with_deleted = 'true';
            backendFilters.eliminados_only = 'true';
            delete backendFilters.incluir_eliminados;
        } else {
            delete backendFilters.incluir_eliminados;
        }
        loadUsers({ page: currentPage, ...backendFilters });
    };

    // ========== LOADING INICIAL ==========

    if (usersLoading && users.length === 0) {
        return <Loader message="Cargando usuarios..." />;
    }

    // ========== RENDER ==========

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Typography variant="h3" color="blue-gray">
                        Gestión de Usuarios
                    </Typography>
                    <Typography color="gray" className="mt-1">
                        Administra usuarios del sistema COTEL
                    </Typography>
                </div>

                <div className="flex items-center gap-2">
                    <Permission recurso="usuarios" accion="crear">
                        <Button
                            className="flex items-center gap-2"
                            color="orange"
                            onClick={() => openDialog('create')}
                        >
                            <IoAdd className="h-5 w-5" />
                            Crear Usuario
                        </Button>
                    </Permission>
                </div>
            </div>

            {/* Error Alert */}
            {usersError && (
                <Alert color="red" dismissible onClose={clearUsersError}>
                    {usersError}
                </Alert>
            )}

            {/* Tabla Principal */}
            <UserTable
                users={users}
                roles={roles}
                loading={usersLoading}
                pagination={pagination}
                currentPage={currentPage}
                filters={filters}
                searchInput={searchInput}
                onPageChange={setCurrentPage}
                onEditUser={(user) => openDialog('edit', user)}
                onConfirmAction={openConfirmDialog}
                onChangeRole={handleChangeRole}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchInputChange}
                onClearSearch={clearSearch}
                onRefresh={() => loadUsers({ page: currentPage, ...filters })}
            />

            {/* Todos los Diálogos */}
            <UserDialogs
                dialogs={dialogs}
                selectedUser={selectedUser}
                confirmAction={confirmAction}
                roles={roles}
                loading={usersLoading}
                onCloseDialog={closeDialog}
                onSuccess={handleSuccess}
                onUserAction={handleUserAction}
            />
        </div>
    );
};

export default Users;