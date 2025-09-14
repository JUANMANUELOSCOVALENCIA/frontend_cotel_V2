// src/core/permissions/pages/Roles/RoleComponents.jsx
import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Select,
    Option,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Chip,
    Progress
} from '@material-tailwind/react';
import {
    IoShieldCheckmark,
    IoEllipsisVertical,
    IoEye,
    IoCreate,
    IoCopy,
    IoTrash,
    IoPeople,
    IoLockClosed,
    IoRefresh
} from 'react-icons/io5';
import Permission from '../../components/Permission';

const RoleComponents = ({
                            roles,
                            loading,
                            pagination,
                            currentPage,
                            filters,
                            onPageChange,
                            onFilterChange,
                            onEditRole,
                            onViewRole,
                            onCloneRole,
                            onConfirmAction,
                            onRefresh
                        }) => {

    // ========== COMPONENTE FILTROS ==========

    const RoleFilters = () => (
        <Card>
            <CardBody className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtros de estado */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="filter-activo"
                                checked={filters.activo === 'true'}
                                onChange={(e) => onFilterChange('activo', e.target.checked ? 'true' : '')}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="filter-activo" className="ml-2 text-sm text-gray-700">
                                Solo activos
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="filter-sistema"
                                checked={filters.es_sistema === 'true'}
                                onChange={(e) => onFilterChange('es_sistema', e.target.checked ? 'true' : '')}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="filter-sistema" className="ml-2 text-sm text-gray-700">
                                Roles del sistema
                            </label>
                        </div>
                    </div>

                    <div></div> {/* Spacer */}

                    <div className="flex justify-end">
                        <IconButton
                            variant="text"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </IconButton>
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    // ========== COMPONENTE CARD DE ROL ==========

    const RoleCard = ({ role }) => (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader floated={false} className="h-16 bg-gradient-to-r from-orange-500 to-red-500">
                <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center gap-2">
                        <IoShieldCheckmark className="h-5 w-5 text-white" />
                        <Typography variant="h6" color="white" className="font-bold">
                            {role.nombre}
                        </Typography>
                        {role.es_sistema && (
                            <IoLockClosed className="h-4 w-4 text-orange-200" />
                        )}
                    </div>

                    <Menu>
                        <MenuHandler>
                            <IconButton variant="text" className="text-white">
                                <IoEllipsisVertical className="h-4 w-4" />
                            </IconButton>
                        </MenuHandler>
                        <MenuList>
                            <Permission recurso="roles" accion="leer">
                                <MenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => onViewRole(role)}
                                >
                                    <IoEye className="h-4 w-4" />
                                    Ver Detalles
                                </MenuItem>
                            </Permission>

                            <Permission recurso="roles" accion="actualizar">
                                <MenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => onEditRole(role)}
                                    disabled={role.es_sistema}
                                >
                                    <IoCreate className="h-4 w-4" />
                                    Editar
                                </MenuItem>
                            </Permission>

                            <Permission recurso="roles" accion="crear">
                                <MenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => onCloneRole(role)}
                                >
                                    <IoCopy className="h-4 w-4" />
                                    Clonar
                                </MenuItem>
                            </Permission>

                            <Permission recurso="roles" accion="eliminar">
                                <MenuItem
                                    className="flex items-center gap-2 text-red-500"
                                    onClick={() => onConfirmAction('delete', role)}
                                    disabled={role.es_sistema || role.cantidad_usuarios > 0}
                                >
                                    <IoTrash className="h-4 w-4" />
                                    Eliminar
                                </MenuItem>
                            </Permission>
                        </MenuList>
                    </Menu>
                </div>
            </CardHeader>

            <CardBody className="space-y-4">
                <div>
                    <Typography color="gray" className="text-sm">
                        {role.descripcion || 'Sin descripción'}
                    </Typography>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IoPeople className="h-4 w-4 text-gray-500" />
                        <Typography variant="small" color="gray">
                            {role.cantidad_usuarios} usuarios
                        </Typography>
                    </div>

                    <Chip
                        variant="ghost"
                        size="sm"
                        value={role.activo ? 'Activo' : 'Inactivo'}
                        color={role.activo ? 'green' : 'red'}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Typography variant="small" color="gray">
                        {role.cantidad_permisos} permisos
                    </Typography>

                    {role.es_sistema && (
                        <Chip
                            variant="ghost"
                            size="sm"
                            value="Sistema"
                            color="blue"
                        />
                    )}
                </div>

                <div className="text-xs text-gray-500">
                    Creado: {new Date(role.fecha_creacion).toLocaleDateString('es-ES')}
                </div>
            </CardBody>
        </Card>
    );

    // ========== COMPONENTE GRID DE ROLES ==========

    const RoleGrid = () => {
        if (loading) {
            return (
                <Card>
                    <CardBody className="flex justify-center py-8">
                        <Progress size="sm" value={70} color="orange" className="w-32" />
                    </CardBody>
                </Card>
            );
        }

        if (roles.length === 0) {
            return (
                <Card>
                    <CardBody className="text-center py-8">
                        <Typography color="gray">
                            No se encontraron roles
                        </Typography>
                    </CardBody>
                </Card>
            );
        }

        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <RoleCard key={role.id} role={role} />
                    ))}
                </div>

                {/* Paginación */}
                {pagination.count > 15 && (
                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="gray">
                            Mostrando {roles.length} de {pagination.count} roles
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outlined"
                                size="sm"
                                disabled={!pagination.previous}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outlined"
                                size="sm"
                                disabled={!pagination.next}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // ========== RENDER PRINCIPAL ==========

    return (
        <>
            <RoleFilters />
            <RoleGrid />
        </>
    );
};

export default RoleComponents;