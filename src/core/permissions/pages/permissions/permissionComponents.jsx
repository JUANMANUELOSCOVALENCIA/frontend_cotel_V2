// src/core/permissions/pages/Permissions/PermissionComponents.jsx
import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Input,
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
    IoSearch,
    IoRefresh,
    IoKey,
    IoEllipsisVertical,
    IoEye,
    IoCreate,
    IoTrash,
    IoLockClosed
} from 'react-icons/io5';
import Permission from '../../components/Permission';

const PermissionComponents = ({
                                  permissions,
                                  groupedPermissions,
                                  resources,
                                  actions,
                                  loading,
                                  resourcesLoading,
                                  pagination,
                                  currentPage,
                                  filters,
                                  onPageChange,
                                  onFilterChange,
                                  onSearch,
                                  onClearSearch,
                                  onEditPermission,
                                  onViewPermission,
                                  onConfirmAction,
                                  onRefresh
                              }) => {

    // ========== COMPONENTE FILTROS ==========

    const PermissionFilters = () => (
        <Card>
            <CardBody className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <Input
                        label="Buscar permisos"
                        icon={<IoSearch />}
                        value={filters.search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Recurso o descripción"
                        className={loading ? "opacity-60" : ""}
                    />

                    {/* Filtro por Recurso */}
                    <Select
                        label="Recurso"
                        value={filters.recurso}
                        onChange={(value) => onFilterChange('recurso', value)}
                        disabled={resourcesLoading}
                    >
                        <Option value="">Todos los recursos</Option>
                        {resources.map((resource) => (
                            <Option key={resource} value={resource}>
                                {resource}
                            </Option>
                        ))}
                    </Select>

                    {/* Filtro por Acción */}
                    <Select
                        label="Acción"
                        value={filters.accion}
                        onChange={(value) => onFilterChange('accion', value)}
                        disabled={resourcesLoading}
                    >
                        <Option value="">Todas las acciones</Option>
                        {actions.map((action) => (
                            <Option key={action} value={action}>
                                {action}
                            </Option>
                        ))}
                    </Select>

                    {/* Controles */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="filter-activo-permisos"
                                checked={filters.activo === 'true'}
                                onChange={(e) => onFilterChange('activo', e.target.checked ? 'true' : '')}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="filter-activo-permisos" className="ml-2 text-sm text-gray-700">
                                Solo activos
                            </label>
                        </div>
                        <IconButton
                            variant="text"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </IconButton>
                    </div>
                </div>

                {/* Filtro activo */}
                {filters.search && (
                    <div className="mt-3">
                        <Chip
                            variant="ghost"
                            size="sm"
                            value={`Búsqueda: "${filters.search}"`}
                            color="blue"
                            onClose={onClearSearch}
                        />
                    </div>
                )}
            </CardBody>
        </Card>
    );

    // ========== COMPONENTE CARD DE PERMISO ==========

    const PermissionCard = ({ permission }) => {
        const getActionColor = (action) => {
            const colors = {
                'crear': 'green',
                'leer': 'blue',
                'actualizar': 'orange',
                'eliminar': 'red',
            };
            return colors[action] || 'gray';
        };

        return (
            <Card className="border hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Chip
                                variant="ghost"
                                size="sm"
                                value={permission.accion}
                                color={getActionColor(permission.accion)}
                                className="capitalize"
                            />
                            <Chip
                                variant="ghost"
                                size="sm"
                                value={permission.activo ? 'Activo' : 'Inactivo'}
                                color={permission.activo ? 'green' : 'red'}
                            />
                        </div>

                        <Menu>
                            <MenuHandler>
                                <IconButton variant="text" size="sm">
                                    <IoEllipsisVertical className="h-4 w-4" />
                                </IconButton>
                            </MenuHandler>
                            <MenuList>
                                <Permission recurso="permisos" accion="leer">
                                    <MenuItem
                                        className="flex items-center gap-2"
                                        onClick={() => onViewPermission(permission)}
                                    >
                                        <IoEye className="h-4 w-4" />
                                        Ver Detalles
                                    </MenuItem>
                                </Permission>

                                <Permission recurso="permisos" accion="actualizar">
                                    <MenuItem
                                        className="flex items-center gap-2"
                                        onClick={() => onEditPermission(permission)}
                                    >
                                        <IoCreate className="h-4 w-4" />
                                        Editar
                                    </MenuItem>
                                </Permission>

                                <Permission recurso="permisos" accion="eliminar">
                                    <MenuItem
                                        className="flex items-center gap-2 text-red-500"
                                        onClick={() => onConfirmAction('delete', permission)}
                                        disabled={permission.esta_en_uso}
                                    >
                                        <IoTrash className="h-4 w-4" />
                                        Eliminar
                                    </MenuItem>
                                </Permission>
                            </MenuList>
                        </Menu>
                    </div>

                    <Typography variant="small" color="gray" className="mb-2">
                        {permission.descripcion || 'Sin descripción'}
                    </Typography>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                            {permission.esta_en_uso ? 'En uso' : 'No usado'}
                        </span>
                        <span>
                            ID: {permission.id}
                        </span>
                    </div>

                    {permission.esta_en_uso && (
                        <div className="mt-2">
                            <Chip
                                variant="ghost"
                                size="sm"
                                value="Asignado a roles"
                                color="blue"
                                className="text-xs"
                            />
                        </div>
                    )}
                </CardBody>
            </Card>
        );
    };

    // ========== COMPONENTE GRUPO DE RECURSOS ==========

    const ResourceGroup = ({ resource, resourcePermissions }) => (
        <Card key={resource}>
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IoKey className="h-6 w-6 text-orange-500" />
                        <Typography variant="h5" color="blue-gray" className="capitalize">
                            {resource}
                        </Typography>
                        <Chip
                            variant="ghost"
                            size="sm"
                            value={`${resourcePermissions.length} permisos`}
                            color="blue"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardBody className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {resourcePermissions.map((permission) => (
                        <PermissionCard
                            key={permission.id}
                            permission={permission}
                        />
                    ))}
                </div>
            </CardBody>
        </Card>
    );

    // ========== COMPONENTE GRUPOS DE PERMISOS ==========

    const PermissionGroups = () => {
        if (loading) {
            return (
                <Card>
                    <CardBody className="flex justify-center py-8">
                        <Progress size="sm" value={70} color="orange" className="w-32" />
                    </CardBody>
                </Card>
            );
        }

        if (Object.keys(groupedPermissions).length === 0) {
            return (
                <Card>
                    <CardBody className="text-center py-8">
                        <Typography color="gray">
                            {filters.search || filters.recurso || filters.accion
                                ? 'No se encontraron permisos con los filtros aplicados'
                                : 'No se encontraron permisos'
                            }
                        </Typography>
                    </CardBody>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <ResourceGroup
                        key={resource}
                        resource={resource}
                        resourcePermissions={resourcePermissions}
                    />
                ))}
            </div>
        );
    };

    // ========== RENDER PRINCIPAL ==========

    return (
        <>
            <PermissionFilters />
            <PermissionGroups />

            {/* Paginación */}
            {pagination.count > 20 && (
                <div className="flex items-center justify-between">
                    <Typography variant="small" color="gray">
                        Mostrando {permissions.length} de {pagination.count} permisos
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

export default PermissionComponents;